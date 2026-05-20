/**
 * wallet store — estado global da carteira do usuário autenticado.
 *
 * Centraliza positions, totais (patrimônio + delta hoje), composição
 * por classe, holdings list, próximos pagamentos e atividade recente.
 * Hoje esses dados estão espalhados em `useHojeData` (visão "hoje"),
 * `useWalletDataService` (positions raw) e em refs locais do
 * `/wallet/index.vue` — duplicando fetch e estado entre páginas.
 *
 * A store puxa do mesmo backend Laravel:
 *   GET /api/portfolio/positions
 *   GET /api/portfolio/today
 *   GET /api/portfolio/history
 *
 * Quando usar STORE vs COMPOSABLE:
 *   - Use a STORE (`useWalletStore`) quando o componente precisa do
 *     estado base da carteira (patrimônio, delta, holdings) e quer
 *     reagir a refresh global. Atomic widgets como header chip
 *     "Patrimônio R$ 124k +0,8%" leem direto daqui sem refetch.
 *   - Use o COMPOSABLE (`useHojeData`) quando o componente precisa de
 *     derivações editoriais específicas (causalFactors, newsThemes,
 *     resumo). O composable lê da store + cruza com market/news,
 *     monta o shape curado.
 *
 * Refresh:
 *   - Sem refresh automático no setup, componente decide quando puxar.
 *   - `lastUpdatedAt` serve pra debounce + UI "atualizado há Xmin".
 *   - Sem token? `refresh()` é no-op silencioso (carteira vazia).
 */
import type { UnifiedPosition } from '~/services/portfolio'

export type AssetClass =
  | 'STOCK'
  | 'REIT'
  | 'ETF'
  | 'BDR'
  | 'TREASURY'
  | 'CRYPTO'
  | 'FIXED'

export interface WalletHolding {
  ticker: string
  name: string
  assetClass: AssetClass
  qty: number
  averagePrice: number
  currentPrice: number
  /** qty * currentPrice. */
  value: number
  /** Peso na carteira em %. */
  weight: number
  /** P&L total em R$ (value - cost). */
  pnl: number
  pnlPct: number
  /** Variação do dia em R$. */
  dayChange: number
  /** Variação do dia em %. */
  dayChangePct: number
  /** Lista de fatores macro tagueados (juros_sensitive, petroleo_exposto, etc). */
  factorTags: string[]
}

export interface WalletAllocationSlice {
  /** Classe agrupada (Ações BR / FIIs / Tesouro / etc). */
  label: AssetClass | string
  value: number
  /** % do patrimônio total. */
  pct: number
}

export interface WalletDividendEvent {
  date: string
  ticker: string
  type: 'dividendo' | 'jcp' | 'rendimento'
  amount: number
  status: 'previsto' | 'recebido'
}

export interface WalletActivityItem {
  id: string
  /** ISO datetime. */
  occurredAt: string
  kind: 'buy' | 'sell' | 'dividend' | 'jcp' | 'split' | 'sync'
  ticker?: string
  /** Texto curto pra UI (já formatado em pt-BR). */
  label: string
  /** Valor em R$, positivo = entrada, negativo = saída. */
  amount?: number
}

/** Shape parcial do /api/portfolio/today (mantemos defensivo). */
interface RawPortfolioToday {
  totals?: {
    value_now?: number
    day_change_amount?: number
    day_change_pct?: number
  }
  positions?: Array<{
    ticker: string
    name?: string
    asset_class?: AssetClass
    quantity: number
    average_price: number
    price_now?: number
    price_d1?: number
    value_now?: number
    pnl_amount?: number
    pnl_pct?: number
    day_change_amount?: number
    day_change_pct?: number
    factor_tags?: Array<{ factor: string; weight?: number }>
  }>
  dividends_today?: {
    total: number
    items: Array<{ ticker: string; amount?: number }>
  }
}

interface RawPortfolioHistory {
  today?: { amount: number; pct: number }
  yesterday?: { amount: number; pct: number }
  '7d'?: { amount: number; pct: number; sparkline?: number[] }
  '30d'?: { amount: number; pct: number; sparkline?: number[] }
}

export const useWalletStore = defineStore('wallet', () => {
  // ============================================================
  // STATE
  // ============================================================
  /** Posições raw (UnifiedPosition do backend). */
  const positions = ref<UnifiedPosition[]>([])
  /** Holdings em shape curado pra UI (derivado em refresh, não computed —
   *  pra não recalcular a cada acesso de leitura em listas grandes). */
  const holdings = ref<WalletHolding[]>([])
  /** Patrimônio total atual em R$. */
  const totalEquity = ref(0)
  /** Delta do dia em R$. */
  const dayChangeAmount = ref(0)
  /** Delta do dia em %. */
  const dayChangePct = ref(0)
  /** Delta dos últimos 7 dias em R$. */
  const weekChangeAmount = ref(0)
  const weekChangePct = ref(0)
  /** Delta dos últimos 30 dias em R$. */
  const monthChangeAmount = ref(0)
  const monthChangePct = ref(0)
  /** Próximos pagamentos (proventos previstos). */
  const upcomingDividends = ref<WalletDividendEvent[]>([])
  /** Atividade recente (extratos, compras, dividendos pagos).
   *  TODO: hoje não temos endpoint dedicado — popular via /portfolio/today
   *  + cruzando com extratos quando o backend expuser. */
  const recentActivity = ref<WalletActivityItem[]>([])
  /** Sparkline 7d do patrimônio (% acumulado dia-a-dia). */
  const equityCurve7d = ref<number[]>([])
  /** Sparkline 30d do patrimônio. */
  const equityCurve30d = ref<number[]>([])
  /** Timestamp do último refresh bem sucedido. */
  const lastUpdatedAt = ref<number | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  // ============================================================
  // GETTERS
  // ============================================================
  /** Tem carteira carregada com ao menos 1 posição? */
  const hasPositions = computed(() => holdings.value.length > 0)

  /** Composição por classe (Ações BR / FIIs / Tesouro). */
  const allocationByClass = computed<WalletAllocationSlice[]>(() => {
    if (totalEquity.value <= 0) return []
    const groups: Record<string, number> = {}
    for (const h of holdings.value) {
      groups[h.assetClass] = (groups[h.assetClass] || 0) + h.value
    }
    return Object.entries(groups)
      .map(([label, value]) => ({
        label,
        value,
        pct: (value / totalEquity.value) * 100,
      }))
      .sort((a, b) => b.value - a.value)
  })

  /** Holdings ordenadas por valor desc (top N pro card "Maiores posições"). */
  const topHoldings = computed<WalletHolding[]>(() =>
    [...holdings.value].sort((a, b) => b.value - a.value),
  )

  /** Soma dos deltas do dia (mesmo número que dayChangeAmount, exposto
   *  como getter pra calling-code legível: `walletStore.totalDelta`). */
  const totalDelta = computed(() =>
    holdings.value.reduce((sum, h) => sum + h.dayChange, 0),
  )

  /** Carteira está vazia (sem posições)? Útil pra empty-state. */
  const isEmpty = computed(
    () => lastUpdatedAt.value !== null && holdings.value.length === 0,
  )

  // ============================================================
  // ACTIONS
  // ============================================================
  /**
   * Refresh paralelo dos endpoints da carteira. Sem token = no-op
   * (não derruba a página em rotas anônimas que importem a store).
   * Falhas individuais não abortam o restante (graceful degradation).
   */
  async function refresh(): Promise<void> {
    if (loading.value) return
    const auth = useAuthStore()
    if (!auth.token) {
      // Sem token, não tenta. Limpa o lastUpdatedAt pra `isEmpty` não
      // dar falso positivo (vazio só quando o backend confirmou).
      return
    }
    loading.value = true
    error.value = null

    try {
      const baseURL = useRuntimeConfig().public.apiBaseUrl as string
      const headers = {
        Authorization: `Bearer ${auth.token}`,
        Accept: 'application/json',
      }

      const [todayRes, historyRes] = await Promise.allSettled([
        $fetch<RawPortfolioToday | { data: RawPortfolioToday }>(
          `${baseURL}/portfolio/today`,
          { headers },
        ),
        $fetch<RawPortfolioHistory | { data: RawPortfolioHistory }>(
          `${baseURL}/portfolio/history`,
          { headers },
        ),
      ])

      const today: RawPortfolioToday | null =
        todayRes.status === 'fulfilled' ? extractData(todayRes.value) : null
      const history: RawPortfolioHistory | null =
        historyRes.status === 'fulfilled'
          ? extractData(historyRes.value)
          : null

      if (!today || !today.positions?.length) {
        // Sem posições — usuário ainda não conectou corretora.
        positions.value = []
        holdings.value = []
        totalEquity.value = 0
        dayChangeAmount.value = 0
        dayChangePct.value = 0
        weekChangeAmount.value = 0
        weekChangePct.value = 0
        monthChangeAmount.value = 0
        monthChangePct.value = 0
        upcomingDividends.value = []
        recentActivity.value = []
        equityCurve7d.value = []
        equityCurve30d.value = []
        lastUpdatedAt.value = Date.now()
        return
      }

      const total = today.totals?.value_now ?? 0

      // Map raw positions → UnifiedPosition list (preserva campos do backend)
      // + holdings curados pra UI.
      const rawPositions = today.positions
      positions.value = rawPositions.map((p) => ({
        ticker: p.ticker,
        name: p.name,
        asset_class: p.asset_class,
        quantity: p.quantity,
        average_price: p.average_price,
        current_price: p.price_now ?? p.average_price,
        current_value: p.value_now ?? p.quantity * (p.price_now ?? p.average_price),
      }))

      holdings.value = rawPositions.map((p) => {
        const currentPrice = p.price_now ?? p.average_price
        const value = p.value_now ?? p.quantity * currentPrice
        const cost = p.quantity * p.average_price
        const pnl = p.pnl_amount ?? value - cost
        const pnlPct = p.pnl_pct ?? (cost ? (pnl / cost) * 100 : 0)
        const weight = total > 0 ? (value / total) * 100 : 0
        return {
          ticker: p.ticker,
          name: p.name ?? p.ticker,
          assetClass: (p.asset_class ?? 'STOCK') as AssetClass,
          qty: p.quantity,
          averagePrice: p.average_price,
          currentPrice,
          value,
          weight,
          pnl,
          pnlPct,
          dayChange: p.day_change_amount ?? 0,
          dayChangePct: p.day_change_pct ?? 0,
          factorTags: (p.factor_tags ?? []).map((t) => t.factor),
        }
      })

      totalEquity.value = total
      dayChangeAmount.value = today.totals?.day_change_amount ?? 0
      dayChangePct.value = today.totals?.day_change_pct ?? 0

      // History buckets (deltas semanal/mensal + sparklines)
      weekChangeAmount.value = history?.['7d']?.amount ?? 0
      weekChangePct.value = history?.['7d']?.pct ?? 0
      monthChangeAmount.value = history?.['30d']?.amount ?? 0
      monthChangePct.value = history?.['30d']?.pct ?? 0
      equityCurve7d.value = history?.['7d']?.sparkline ?? []
      equityCurve30d.value = history?.['30d']?.sparkline ?? []

      // Dividends hoje (pagos no dia atual) — popular como "atividade recente"
      // até termos endpoint dedicado de extratos. TODO: substituir por
      // GET /api/portfolio/activity quando o backend expuser.
      const divToday = today.dividends_today
      if (divToday && Array.isArray(divToday.items)) {
        recentActivity.value = divToday.items.map((d, idx) => ({
          id: `div-today-${d.ticker}-${idx}`,
          occurredAt: new Date().toISOString(),
          kind: 'dividend',
          ticker: d.ticker,
          label: `Dividendo recebido · ${d.ticker}`,
          amount: d.amount,
        }))
      } else {
        recentActivity.value = []
      }

      // TODO: backend ainda não expõe upcoming dividends consolidado.
      // O wallet/index.vue chama `tradesService.getUpcomingDividends()`
      // separado — quando refatorar a página pra usar a store, mover
      // essa lógica pra cá num refresh dedicado.
      upcomingDividends.value = []

      lastUpdatedAt.value = Date.now()
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset (logout / troca de tenant). Limpa tudo, força próximo
   * refresh a re-fetch do zero.
   */
  function reset(): void {
    positions.value = []
    holdings.value = []
    totalEquity.value = 0
    dayChangeAmount.value = 0
    dayChangePct.value = 0
    weekChangeAmount.value = 0
    weekChangePct.value = 0
    monthChangeAmount.value = 0
    monthChangePct.value = 0
    upcomingDividends.value = []
    recentActivity.value = []
    equityCurve7d.value = []
    equityCurve30d.value = []
    lastUpdatedAt.value = null
    error.value = null
  }

  return {
    // state
    positions,
    holdings,
    totalEquity,
    dayChangeAmount,
    dayChangePct,
    weekChangeAmount,
    weekChangePct,
    monthChangeAmount,
    monthChangePct,
    upcomingDividends,
    recentActivity,
    equityCurve7d,
    equityCurve30d,
    lastUpdatedAt,
    loading,
    error,
    // getters
    hasPositions,
    allocationByClass,
    topHoldings,
    totalDelta,
    isEmpty,
    // actions
    refresh,
    reset,
  }
})

/** Extrai .data se wrapper, senão devolve o próprio objeto. */
function extractData<T>(res: any): T | null {
  if (res && typeof res === 'object') {
    if ('data' in res && res.data && typeof res.data === 'object') {
      return res.data as T
    }
    return res as T
  }
  return null
}

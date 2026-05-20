/**
 * market store — estado global dos dados de mercado público da Redentia.
 *
 * Centraliza o snapshot do /api/market/snapshot (índices BR, macro,
 * global, top movers) + série diária do IBOV, hoje espalhados em
 * useHomeData / useHojeData. A ideia é que múltiplos componentes
 * (home anônima, /hoje, footer ticker, widget do help) compartilhem
 * o MESMO snapshot sem re-fetch, e que um único `refresh()` atualize
 * a UI inteira ao mesmo tempo.
 *
 * Quando usar STORE vs COMPOSABLE:
 *   - Use a STORE (`useMarketStore`) quando o componente precisa do
 *     snapshot bruto (IBOV, dólar, brent, top movers) e quer reagir
 *     a refresh global. Vários componentes na mesma página → 1 fetch.
 *   - Use o COMPOSABLE (`useHomeData` / `useHojeData`) quando o
 *     componente precisa do shape DERIVADO/CURADO da página (leads
 *     editoriais, themes, resumo). O composable lê do snapshot e
 *     monta as derivações — mas a fonte do snapshot pode (e deve)
 *     vir desta store para evitar duplicação.
 *
 * Refresh:
 *   - Sem refresh automático no setup, o componente decide quando
 *     chamar `refresh()` (ex: onMounted, ou intervalo a cada 5min).
 *   - `lastUpdatedAt` permite a UI mostrar "atualizado há Xmin" e
 *     decidir quando re-fetch (cache TTL client-side).
 */

export interface MarketIndex {
  key: string
  label: string
  value: number
  /** Variação percentual do dia. */
  changePct: number
}

export interface MarketTopMover {
  ticker: string
  name: string | null
  /** Variação percentual no dia. */
  pct: number
}

export interface MarketIbovSeriesPoint {
  price: number
  /** ISO YYYY-MM-DD. */
  date: string
}

/** Shape cru do /api/market/snapshot (mantemos parcial pra não acoplar 100%). */
interface RawMarketSnapshot {
  as_of?: string
  indices_br?: {
    IBOV?: { value?: number; change_pct?: number; as_of_date?: string }
    IFIX?: { value?: number; change_pct?: number; as_of_date?: string }
  }
  macro?: {
    usd_brl?: { value?: number; delta_pct?: number }
    ipca_12m?: { value?: number; delta_pct?: number }
  }
  global?: {
    brent?: { value?: number; change_pct?: number }
    sp500?: { value?: number; change_pct?: number }
  }
  top_gainers?: Array<{ ticker: string; name?: string | null; pct?: number }>
  top_losers?: Array<{ ticker: string; name?: string | null; pct?: number }>
}

export const useMarketStore = defineStore('market', () => {
  // ============================================================
  // STATE
  // ============================================================
  /** IBOV principal (mega card). */
  const ibov = ref<MarketIndex | null>(null)
  /** IFIX (índice de FIIs). */
  const ifix = ref<MarketIndex | null>(null)
  /** Dólar (USD/BRL). */
  const dolar = ref<MarketIndex | null>(null)
  /** Petróleo Brent (USD/bbl). */
  const brent = ref<MarketIndex | null>(null)
  /** S&P 500. */
  const sp500 = ref<MarketIndex | null>(null)
  /** Top gainers do pregão (B3 inteira, cap em 5). */
  const topGainers = ref<MarketTopMover[]>([])
  /** Top losers do pregão (B3 inteira, cap em 5). */
  const topLosers = ref<MarketTopMover[]>([])
  /** Série diária do IBOV (1 mês), pro chart "O dia em um traço". */
  const ibovSeries = ref<MarketIbovSeriesPoint[]>([])
  /** Data do último pregão (YYYY-MM-DD em BRT). null = ainda não fetchado. */
  const marketAsOfDate = ref<string | null>(null)
  /** Timestamp client-side do último refresh bem sucedido. */
  const lastUpdatedAt = ref<number | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  // ============================================================
  // GETTERS
  // ============================================================
  /** Array consolidado pra renderização em lista (Mercado geral). */
  const allIndices = computed<MarketIndex[]>(() => {
    const out: MarketIndex[] = []
    if (ibov.value) out.push(ibov.value)
    if (ifix.value) out.push(ifix.value)
    if (dolar.value) out.push(dolar.value)
    if (brent.value) out.push(brent.value)
    if (sp500.value) out.push(sp500.value)
    return out
  })

  /** Tem snapshot carregado? */
  const isLoaded = computed(() => lastUpdatedAt.value !== null)

  /** Mercado fechou hoje? Heurística: marketAsOfDate !== hoje (BRT). */
  const isMarketClosedToday = computed(() => {
    if (!marketAsOfDate.value) return false
    // BRT é UTC-3; pra simplicidade comparamos com toLocaleDateString
    // — o backend já entrega YYYY-MM-DD em BRT.
    const todayBRT = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Sao_Paulo',
    })
    return marketAsOfDate.value !== todayBRT
  })

  // ============================================================
  // ACTIONS
  // ============================================================
  /**
   * Fetch do /api/market/snapshot + série diária do IBOV em paralelo.
   * Cada fetch falha individualmente sem derrubar o resto (graceful
   * degradation). Atualiza todos os refs e marca `lastUpdatedAt`.
   *
   * @param scope - 'ibov' filtra top movers às constituintes do índice
   *                (default 'ibov' bate com o uso da home pública).
   */
  async function refresh(scope: 'ibov' | 'all' = 'ibov'): Promise<void> {
    if (loading.value) return
    loading.value = true
    error.value = null

    try {
      const baseURL = useRuntimeConfig().public.apiBaseUrl as string

      const [snapshotRes, ibovSeriesRes] = await Promise.allSettled([
        $fetch<RawMarketSnapshot>(`${baseURL}/market/snapshot?scope=${scope}`),
        $fetch<any>(`${baseURL}/indices/ibov/prices?mode=1mo`),
      ])

      const snapshot =
        snapshotRes.status === 'fulfilled' ? snapshotRes.value : null
      const seriesRaw =
        ibovSeriesRes.status === 'fulfilled'
          ? (ibovSeriesRes.value?.data ?? ibovSeriesRes.value)
          : []

      // --- Índices BR ---
      const ibovRaw = snapshot?.indices_br?.IBOV
      ibov.value = ibovRaw
        ? {
            key: 'ibov',
            label: 'Ibovespa',
            value: ibovRaw.value ?? 0,
            changePct: ibovRaw.change_pct ?? 0,
          }
        : null
      marketAsOfDate.value = ibovRaw?.as_of_date ?? null

      const ifixRaw = snapshot?.indices_br?.IFIX
      ifix.value = ifixRaw
        ? {
            key: 'ifix',
            label: 'IFIX',
            value: ifixRaw.value ?? 0,
            changePct: ifixRaw.change_pct ?? 0,
          }
        : null

      // --- Macro ---
      const usdRaw = snapshot?.macro?.usd_brl
      dolar.value = usdRaw
        ? {
            key: 'dolar',
            label: 'Dólar',
            value: usdRaw.value ?? 0,
            changePct: usdRaw.delta_pct ?? 0,
          }
        : null

      // --- Global ---
      const brentRaw = snapshot?.global?.brent
      brent.value = brentRaw
        ? {
            key: 'brent',
            label: 'Petróleo (Brent)',
            value: brentRaw.value ?? 0,
            changePct: brentRaw.change_pct ?? 0,
          }
        : null

      const spRaw = snapshot?.global?.sp500
      sp500.value = spRaw
        ? {
            key: 'sp500',
            label: 'S&P 500',
            value: spRaw.value ?? 0,
            changePct: spRaw.change_pct ?? 0,
          }
        : null

      // --- Top movers (cap 5) ---
      topGainers.value = Array.isArray(snapshot?.top_gainers)
        ? snapshot.top_gainers.slice(0, 5).map((t) => ({
            ticker: t.ticker,
            name: t.name ?? null,
            pct: Number(t.pct ?? 0),
          }))
        : []
      topLosers.value = Array.isArray(snapshot?.top_losers)
        ? snapshot.top_losers.slice(0, 5).map((t) => ({
            ticker: t.ticker,
            name: t.name ?? null,
            pct: Number(t.pct ?? 0),
          }))
        : []

      // --- Série diária IBOV ---
      ibovSeries.value = Array.isArray(seriesRaw)
        ? seriesRaw.map((d: any) => ({
            price: Number(d.market_price ?? d.price ?? 0),
            date: String(d.price_at ?? d.date ?? ''),
          }))
        : []

      lastUpdatedAt.value = Date.now()
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset do estado (útil em logout ou troca de tenant).
   */
  function reset(): void {
    ibov.value = null
    ifix.value = null
    dolar.value = null
    brent.value = null
    sp500.value = null
    topGainers.value = []
    topLosers.value = []
    ibovSeries.value = []
    marketAsOfDate.value = null
    lastUpdatedAt.value = null
    error.value = null
  }

  return {
    // state
    ibov,
    ifix,
    dolar,
    brent,
    sp500,
    topGainers,
    topLosers,
    ibovSeries,
    marketAsOfDate,
    lastUpdatedAt,
    loading,
    error,
    // getters
    allIndices,
    isLoaded,
    isMarketClosedToday,
    // actions
    refresh,
    reset,
  }
})

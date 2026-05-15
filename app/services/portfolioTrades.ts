/**
 * Portfolio Trades service — alimenta /wallet/resultado.
 *
 * Endpoint backend: GET /api/portfolio/trades?period=...
 *
 * O backend ja entrega os trades pareados via FIFO (compra→venda),
 * com posicoes em aberto (mark-to-market) e dividendos como entries
 * proprios. Cada trade ja vem com `kind` ('day'/'swing'/'hold')
 * derivado do holdingSeconds, P&L liquido (`resultAmount`) e shape
 * IDENTICO ao MockTrade — drop-in replacement.
 *
 * Frontend nao precisa fazer pareamento, classificacao ou agregacao
 * propria. So consumir.
 */
import type { MockTrade } from '~/composables/useMockTrades'

export type TradesPeriod = '7d' | '30d' | '90d' | 'ytd' | '12m' | 'all'

export interface TradesMeta {
  period: string
  from: string | null
  to: string
  total_trades: number
  closed_trades: number
  open_trades: number
  income_entries: number
}

export interface TradesResponse {
  data: MockTrade[]
  meta: TradesMeta
}

export function usePortfolioTradesService() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const API = config.public.apiBaseUrl as string

  function authHeaders(): Record<string, string> {
    return authStore.token
      ? { Authorization: `Bearer ${authStore.token}` }
      : {}
  }

  /**
   * Busca trades pareados via FIFO. Default period: 12 meses (cobre
   * todo o backfill Pluggy + um pouco). Pra ver historia completa
   * use period='all'.
   */
  async function listTrades(period: TradesPeriod = '12m'): Promise<TradesResponse> {
    const resp = await $fetch<TradesResponse>(
      `${API}/portfolio/trades?period=${encodeURIComponent(period)}`,
      { headers: authHeaders() },
    )
    return resp
  }

  /**
   * Equity curve com mark-to-market diario (preco historico de cada
   * ativo). Cada ponto = realized acumulado + unrealized (MTM) +
   * income, em uma data. Janela: do primeiro trade do user ate hoje,
   * pulando fins de semana. Pra alimentar o grafico de Resultado.
   */
  async function getEquityCurve(): Promise<EquityCurveResponse> {
    const resp = await $fetch<EquityCurveResponse>(
      `${API}/portfolio/equity-curve`,
      { headers: authHeaders() },
    )
    return resp
  }

  /**
   * Proventos (dividendos/JCP/income) agrupados por mês.
   * Default: ultimos 12 meses. Cada mes retorna o total + lista detalhada
   * de pagamentos por ticker. Alimenta o bar chart de renda passiva e o
   * modal de detalhes do mês.
   */
  async function listIncome(params?: { from?: string; to?: string }): Promise<IncomeResponse> {
    const qs = new URLSearchParams()
    if (params?.from) qs.set('from', params.from)
    if (params?.to) qs.set('to', params.to)
    const suffix = qs.toString() ? `?${qs.toString()}` : ''
    const resp = await $fetch<IncomeResponse>(
      `${API}/portfolio/income${suffix}`,
      { headers: authHeaders() },
    )
    return resp
  }

  return {
    listTrades,
    getEquityCurve,
    listIncome,
  }
}

export type IncomeSide = 'DIVIDEND' | 'JCP' | 'INCOME'

export interface IncomeEntry {
  ticker: string
  side: IncomeSide
  trade_date: string  // YYYY-MM-DD
  amount: number
  name?: string | null
  asset_class?: string | null
}

export interface IncomeMonthBucket {
  month: string   // YYYY-MM
  label: string   // 'Jan' | 'Fev' | ...
  total: number
  entries: IncomeEntry[]
}

export interface IncomeResponse {
  months: IncomeMonthBucket[]
  summary: {
    totalAll: number
    monthsCovered: number
    from: string
    to: string
  }
}

export interface EquityCurvePoint {
  date: string
  // P&L total acumulado (realized + unrealized + income)
  equity: number
  // Valor REAL das posicoes abertas em qty * preco corrente.
  // E o que normalmente se chama "patrimonio".
  position_value: number
  realized: number
  unrealized: number
  income: number
}

export interface EquityCurveResponse {
  data: EquityCurvePoint[]
  meta: {
    points: number
    from: string
    to: string
    tickers: string[]
  }
}

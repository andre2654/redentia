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

  return {
    listTrades,
  }
}

/**
 * Serviço do domínio Carteira (PR8 `/carteira`) — fetchers tipados, finos.
 * SSR-first como home.ts: recebem `base` (server = URL direta do Laravel via
 * runtimeConfig.backendDirectBase; client = proxy same-origin '/api/backend')
 * e, nos endpoints auth:sanctum, o header Authorization montado pelo
 * useCarteira (token no cookie `nu:token`). O serviço NÃO engole erro — a
 * degradação POR SEÇÃO é do useCarteira.
 *
 * Os endpoints já cobertos pelo PR7 (portfolio/today/equity-curve/income/
 * macro) REUSAM os fetchers do services/home.ts — zero duplicação.
 */
import type { PluggyConnectionApi, PortfolioAnalysisApi, TradesApi, UpcomingDividendsApi } from '~/types/carteira'

type AuthHeaders = Record<string, string>
const json = { headers: { Accept: 'application/json' } }

/**
 * GET /portfolio/trades?period= — vendas FIFO + posições abertas + proventos
 * (Movimentações). '12m' cobre o backfill Pluggy inteiro (default do backend).
 */
export function carteiraFetchTrades(base: string, headers: AuthHeaders, period: '7d' | '30d' | '90d' | 'ytd' | '12m' | 'all' = '12m') {
  return $fetch<TradesApi>(`${base}/portfolio/trades?period=${period}`, { headers })
}

/**
 * GET /dividends/upcoming?days=&limit= (PUB) — agenda futura agrupada por
 * payment_date. GOTCHA conhecido: o backend CAPA days em 180 (janela máx).
 */
export function carteiraFetchUpcomingDividends(base: string, days = 180) {
  return $fetch<UpcomingDividendsApi>(`${base}/dividends/upcoming?days=${days}&limit=500`, json)
}

/** GET /portfolio/analysis — raio-x IA persistido (404 = ainda sem análise). */
export function carteiraFetchAnalysis(base: string, headers: AuthHeaders) {
  return $fetch<PortfolioAnalysisApi>(`${base}/portfolio/analysis`, { headers })
}

/** GET /pluggy/connections — conexões Open Finance do user. */
export function carteiraFetchConnections(base: string, headers: AuthHeaders) {
  return $fetch<{ data: PluggyConnectionApi[] }>(`${base}/pluggy/connections`, { headers })
}

/* ————— fluxo de conexão Pluggy (client-side, usados pelo usePluggyConnect) ————— */

/** GET /pluggy/connect-token — token fresco (TTL ~30min) pro widget. */
export function pluggyFetchConnectToken(base: string, headers: AuthHeaders, itemId?: string) {
  const qs = itemId ? `?item_id=${encodeURIComponent(itemId)}` : ''
  return $fetch<{ accessToken: string }>(`${base}/pluggy/connect-token${qs}`, { headers })
}

/** POST /pluggy/connections — persiste a conexão criada no widget + sync inicial. */
export function pluggyRegisterConnection(base: string, headers: AuthHeaders, itemId: string) {
  return $fetch<{ data: { id: number; status: string } }>(`${base}/pluggy/connections`, {
    method: 'POST',
    headers,
    body: { item_id: itemId },
  })
}

/** POST /pluggy/connections/{id}/sync — dispara sync (backend enfileira). */
export function pluggySyncConnection(base: string, headers: AuthHeaders, id: number) {
  return $fetch<{ data: { status: string; message?: string } }>(`${base}/pluggy/connections/${id}/sync`, {
    method: 'POST',
    headers,
  })
}

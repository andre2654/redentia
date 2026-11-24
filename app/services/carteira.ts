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
import type { PluggyConnectionApi, TradesApi, UpcomingDividendsApi } from '~/types/carteira'

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

/** GET /pluggy/connections — conexões Open Finance do user. */
export function carteiraFetchConnections(base: string, headers: AuthHeaders) {
  return $fetch<{ data: PluggyConnectionApi[] }>(`${base}/pluggy/connections`, { headers })
}

/* ————— fluxo de conexão Pluggy (client-side, usados pelo usePluggyConnect) ————— */

/** GET /pluggy/connect-token — token fresco (TTL ~30min) pro widget. */
export function pluggyFetchConnectToken(base: string, headers: AuthHeaders, itemId?: string) {
  const qs = itemId ? `?item_id=${encodeURIComponent(itemId)}` : ''
  return $fetch<{ accessToken: string; provider?: string }>(`${base}/pluggy/connect-token${qs}`, { headers })
}

/** A tentativa que falhou no banco nos últimos minutos (o backend guarda o item/error do agregador). */
export interface FalhaDeConexaoApi {
  instituicao: string | null
  codigo: string | null
  frase: string
  quando: string
  /** a pessoa já pediu que a chamem no WhatsApp por esta falha */
  contato_pedido?: boolean
  /** a conta tem celular: o pedido não precisa perguntar o número */
  tem_celular?: boolean
}

/** GET /pluggy/falha-recente — `falha: null` quando não houve falha recente ou uma conexão nasceu depois. */
export function pluggyFetchFalhaRecente(base: string, headers: AuthHeaders) {
  return $fetch<{ falha: FalhaDeConexaoApi | null }>(`${base}/pluggy/falha-recente`, { headers })
}

/** POST /pluggy/falha-recente/contato — "me chamem no WhatsApp para resolver"; `celular` só para quem não tem um na conta. */
export function pluggyPedirContato(base: string, headers: AuthHeaders, celular?: string) {
  return $fetch<{ falha: FalhaDeConexaoApi }>(`${base}/pluggy/falha-recente/contato`, {
    method: 'POST',
    headers,
    body: celular ? { celular } : {},
  })
}

/** POST /pluggy/connections — persiste a conexão criada no widget + sync inicial. */
export function pluggyRegisterConnection(base: string, headers: AuthHeaders, itemId: string, provider?: string) {
  return $fetch<{ data: { id: number; status: string } }>(`${base}/pluggy/connections`, {
    method: 'POST',
    headers,
    body: { item_id: itemId, ...(provider ? { provider } : {}) },
  })
}

/** POST /pluggy/connections/{id}/sync — dispara sync (backend enfileira). */
export function pluggySyncConnection(base: string, headers: AuthHeaders, id: number) {
  return $fetch<{ data: { status: string; message?: string } }>(`${base}/pluggy/connections/${id}/sync`, {
    method: 'POST',
    headers,
  })
}

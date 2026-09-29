/**
 * Contrato da lista "Seguindo" (watchlist do Laravel, `watchlist_items`).
 *
 * Rotas auth:sanctum do WatchlistController:
 *  - GET    /watchlist            → { items: WatchlistItemApi[] }
 *  - POST   /watchlist {ticker}   → 200 { item } (idempotente: updateOrCreate)
 *                                   422 { message } (ticker inválido)
 *                                   limite do plano: { message, plan_required,
 *                                   limit_key, limit } — hoje sai como 422
 *  - DELETE /watchlist/{ticker}   → 200 | 404 (já não estava na lista)
 *
 * Os campos opcionais (name, logo, type, market_price, change_percent,
 * price_at) são o enriquecimento combinado com o Backend em 29/09/2026. Até o
 * deploy dele o GET devolve só {user_id, ticker, note, added_at}: o front
 * degrada mostrando o ticker e busca o resto no GET /tickers/{t}.
 */

export interface WatchlistItemApi {
  ticker: string
  note?: string | null
  added_at?: string | null
  name?: string | null
  logo?: string | null
  /** 'STOCK' | 'REIT' | 'ETF' | 'BDR' | 'US_STOCK' | 'US_ETF' … */
  type?: string | null
  market_price?: number | null
  change_percent?: number | null
  /** pregão da cotação — 'd/m' no ProfileResource, 'YYYY-MM-DD' se vier completo */
  price_at?: string | null
}

export interface WatchlistListApi {
  items?: WatchlistItemApi[]
}

export interface WatchlistStoreApi {
  item?: WatchlistItemApi
}

/** Corpo de erro do POST (422 de validação ou limite do plano). */
export interface WatchlistErrorApi {
  message?: string
  plan_required?: string
  limit_key?: string
  limit?: number
}

/** Item da lista no front (camelCase, campos opcionais = ainda sem dado). */
export interface WatchlistEntry {
  ticker: string
  addedAt: string | null
  name: string | null
  logo: string | null
  type: string | null
  price: number | null
  changePct: number | null
  priceAt: string | null
}

/** Resultado de seguir/deixar de seguir — quem chama decide o que mostrar. */
export type SeguirResult =
  | { ok: true; following: boolean }
  | { ok: false; status: number | null; message: string; auth: boolean }

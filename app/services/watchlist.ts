/**
 * Serviço da lista "Seguindo" (watchlist do Laravel) — fetchers finos, no
 * padrão do services/carteira.ts: recebem `base` e o header Authorization
 * montado pelo composable (useWatchlist). O serviço NÃO engole erro: quem
 * decide rollback, mensagem e sessão morta é o composable.
 *
 * Tudo client-side: o estado de "seguindo" nunca entra no SSR das páginas
 * públicas (/asset e /dividendos são cacheadas na borda, e CDN não varia por
 * cookie). Contrato em app/types/watchlist.ts.
 */
import type { WatchlistListApi, WatchlistStoreApi } from '~/types/watchlist'

type AuthHeaders = Record<string, string>

/** GET /watchlist — lista do usuário (mais recentes primeiro). */
export function watchlistFetchAll(base: string, headers: AuthHeaders) {
  return $fetch<WatchlistListApi>(`${base}/watchlist`, { headers })
}

/** POST /watchlist {ticker} — idempotente (updateOrCreate no backend). */
export function watchlistAdd(base: string, headers: AuthHeaders, ticker: string) {
  return $fetch<WatchlistStoreApi>(`${base}/watchlist`, { method: 'POST', headers, body: { ticker } })
}

/** DELETE /watchlist/{ticker} — 404 quando o ticker já não estava na lista. */
export function watchlistRemove(base: string, headers: AuthHeaders, ticker: string) {
  return $fetch<{ message?: string }>(`${base}/watchlist/${encodeURIComponent(ticker)}`, { method: 'DELETE', headers })
}

/**
 * Serviço do domínio mercado (padrão Atlas: fetchers tipados, finos).
 * Tudo PÚBLICO via proxy same-origin /api/backend (Laravel) e /api/chat
 * (chat-service). O serviço NÃO engole erro — seed/fallback é responsabilidade
 * dos composables (useMercado.ts), seguindo o padrão do useMarketTicker.
 */
import type {
  BriefingApi,
  CryptoApi,
  MarketSnapshotApi,
  MarketTodayApi,
  NewsApi,
  NewsTakeApi,
  TesouroApi,
  ThesisCardApi,
  TickerApi,
  TickerSnapshotsApi,
} from '~/types/market'

const base = '/api/backend'
const json = { headers: { Accept: 'application/json' } }

/** GET /theses — cartões de tese ordenados pelo retorno real do backtest. */
export function marketFetchTheses() {
  return $fetch<{ data: ThesisCardApi[] }>(`${base}/theses`, json)
}

/** GET /top-{stocks|reits|bdrs}?side=top|worst — movers do dia por classe. */
export function marketFetchMovers(kind: 'stocks' | 'reits' | 'bdrs', side: 'top' | 'worst') {
  return $fetch<{ data: TickerApi[] }>(`${base}/top-${kind}?side=${side}`, json)
}

/** GET /crypto — lista com change_24h (movers de cripto derivados no front). */
export function marketFetchCrypto(limit = 200) {
  return $fetch<{ data: CryptoApi[] }>(`${base}/crypto?limit=${limit}`, json)
}

/** GET /briefing/today — briefing editorial do loop atlas-daily-briefing. */
export function marketFetchBriefingToday() {
  return $fetch<{ data: BriefingApi | null }>(`${base}/briefing/today`, json)
}

/** GET /tesouro?indexer= — títulos públicos do dia. */
export function marketFetchTesouro(indexer: 'IPCA' | 'SELIC' | 'PREFIXADO') {
  return $fetch<{ data: TesouroApi[]; meta?: { count?: number } }>(`${base}/tesouro?indexer=${indexer}`, json)
}

/** GET /research/news — news_takes com leitura do Atlas (fonte primária). */
export function marketFetchResearchNews(limit = 8) {
  return $fetch<{ data: NewsTakeApi[] }>(`${base}/research/news?limit=${limit}`, json)
}

/** GET /news/latest — fallback quando research/news vier vazio. */
export function marketFetchLatestNews(limit = 8) {
  return $fetch<{ data: NewsApi[] }>(`${base}/news/latest?limit=${limit}`, json)
}

/** GET /market/snapshot — IBOV/IFIX + macro (mesma fonte do NuMarketTicker). */
export function marketFetchSnapshot() {
  return $fetch<MarketSnapshotApi>(`${base}/market/snapshot?scope=ibov`, json)
}

/** GET /market/today — universo IBOV do dia (amplitude altas × quedas). */
export function marketFetchToday() {
  return $fetch<MarketTodayApi>(`${base}/market/today`, json)
}

/** GET /api/chat/tickers/snapshot — único batch-quote público (cap 30). */
export function marketFetchTickerSnapshots(symbols: string[]) {
  const list = symbols.slice(0, 30).map((s) => encodeURIComponent(s.toUpperCase())).join(',')
  return $fetch<TickerSnapshotsApi>(`/api/chat/tickers/snapshot?symbols=${list}`, json)
}

/**
 * Serviço do domínio Home logada (PR7 `/`) — fetchers tipados, finos.
 * SSR-first como acao.ts/tese.ts: recebem `base` (server = URL direta do
 * Laravel via runtimeConfig.backendDirectBase; client = proxy same-origin
 * '/api/backend') e, nos endpoints auth:sanctum, o header Authorization
 * montado pelo useHome (o token vive no cookie `nu:token`).
 * O serviço NÃO engole erro — a degradação POR SEÇÃO é do useHome.
 */
import type {
  CompositionApi,
  EquityCurvePointApi,
  IncomeApi,
  MacroSnapshotApi,
  MeApi,
  NewsTodayApi,
  PortfolioPositionApi,
  PortfolioTodayApi,
  ThesisFavoritesApi,
} from '~/types/home'
import type { ConsensusApi } from '~/types/acao'
import type { BriefingApi, MarketSnapshotApi, MarketTodayApi } from '~/types/market'
import type { ConvictionHistoryApi, ThesisFullApi } from '~/types/tese'

type AuthHeaders = Record<string, string>

/** GET /auth/me — 401 aqui = token morto (index.vue derruba pro anônimo). */
export function homeFetchMe(base: string, headers: AuthHeaders) {
  return $fetch<MeApi>(`${base}/auth/me`, { headers })
}

/** GET /portfolio — posições + DY/joins (fonte de verdade da conexão). */
export function homeFetchPortfolio(base: string, headers: AuthHeaders) {
  return $fetch<{ positions: PortfolioPositionApi[] }>(`${base}/portfolio`, { headers })
}

/** GET /portfolio/today — totais do dia + day_change por posição (cache 1h). */
export function homeFetchToday(base: string, headers: AuthHeaders) {
  return $fetch<PortfolioTodayApi>(`${base}/portfolio/today`, { headers })
}

/** GET /portfolio/equity-curve — curva mark-to-market diária real. */
export function homeFetchEquityCurve(base: string, headers: AuthHeaders) {
  return $fetch<{ data: EquityCurvePointApi[]; meta: { points: number } }>(`${base}/portfolio/equity-curve`, { headers })
}

/** GET /portfolio/composition — concentração por setor (regra Rebalancear). */
export function homeFetchComposition(base: string, headers: AuthHeaders) {
  return $fetch<CompositionApi>(`${base}/portfolio/composition`, { headers })
}

/** GET /portfolio/income — proventos por mês (regra Reinvestir). */
export function homeFetchIncome(base: string, headers: AuthHeaders) {
  return $fetch<IncomeApi>(`${base}/portfolio/income`, { headers })
}

/** GET /portfolio/news-today — notícias 24h × carteira, com impacto pessoal. */
export function homeFetchNewsToday(base: string, headers: AuthHeaders) {
  return $fetch<NewsTodayApi>(`${base}/portfolio/news-today`, { headers })
}

/** GET /thesis-favorites — slugs seguidos (rota real do ThesisFavoriteController). */
export function homeFetchThesisFavorites(base: string, headers: AuthHeaders) {
  return $fetch<ThesisFavoritesApi>(`${base}/thesis-favorites`, { headers })
}

/** GET /theses/{slug} — detail + studies[] (box "Hoje:" das teses seguidas). */
export function homeFetchThesisDetail(base: string, slug: string) {
  return $fetch<{ data: ThesisFullApi }>(`${base}/theses/${slug}`, { headers: { Accept: 'application/json' } })
}

/** GET /theses/{slug}/conviction-history — delta de convicção do dia. */
export function homeFetchConviction(base: string, slug: string) {
  return $fetch<{ data: ConvictionHistoryApi }>(`${base}/theses/${slug}/conviction-history`, { headers: { Accept: 'application/json' } })
}

/** GET /macro/snapshot — CDI vigente (legenda do gráfico). */
export function homeFetchMacro(base: string) {
  return $fetch<MacroSnapshotApi>(`${base}/macro/snapshot`, { headers: { Accept: 'application/json' } })
}

/* Variantes base-parameterizadas dos fetchers públicos do briefing (o
 * market.ts do PR1 hardcoda o proxy client-side — a Home é SSR-first; mesmo
 * precedente do noticias.ts vs marketFetchResearchNews). */

/** GET /briefing/today — briefing editorial do loop atlas-daily-briefing. */
export function homeFetchBriefing(base: string) {
  return $fetch<{ data: BriefingApi | null }>(`${base}/briefing/today`, { headers: { Accept: 'application/json' } })
}

/** GET /market/snapshot — IBOV/IFIX/Dólar pras stat-pills do briefing. */
export function homeFetchSnapshot(base: string) {
  return $fetch<MarketSnapshotApi>(`${base}/market/snapshot?scope=ibov`, { headers: { Accept: 'application/json' } })
}

/** GET /market/today — amplitude altas × quedas do pregão (universo IBOV). */
export function homeFetchMarketToday(base: string) {
  return $fetch<MarketTodayApi>(`${base}/market/today`, { headers: { Accept: 'application/json' } })
}

/**
 * GET /consensus/{t} — regra Oportunidade. Trata 204 (sem cobertura): o
 * $fetch devolve body vazio → normalizamos pra null no useHome.
 */
export function homeFetchConsensus(base: string, ticker: string) {
  return $fetch<ConsensusApi | null | ''>(`${base}/consensus/${encodeURIComponent(ticker)}`, { headers: { Accept: 'application/json' } })
}

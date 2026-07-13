/**
 * Serviço do domínio ação (PR2 /asset/[ticker]) — fetchers tipados, finos.
 * Diferença pro market.ts (PR1): esta página é SSR-first (SEO), então os
 * fetchers recebem `base` — no server o composable passa a URL direta do
 * Laravel (runtimeConfig.backendDirectBase, sem loopback no próprio Nitro);
 * no client passa o proxy same-origin '/api/backend'. O serviço NÃO engole
 * erro — degradação por seção é responsabilidade do useAcao.
 */
import type {
  AcaoRange,
  ConsensusApi,
  CryptoDetailApi,
  CryptoPricePointApi,
  PriceMode,
  DividendApi,
  EditorialApi,
  FundamentalsOverviewApi,
  PricePointApi,
  ScoreRowApi,
  ThesisDetailApi,
  TickerProfileApi,
} from '~/types/acao'
import type { NewsApi, ThesisCardApi } from '~/types/market'

const json = { headers: { Accept: 'application/json' } }

/** GET /tickers/{t} — perfil + cotação (404 quando o ticker não existe). */
export function acaoFetchProfile(base: string, ticker: string) {
  return $fetch<{ data: TickerProfileApi }>(`${base}/tickers/${ticker}`, json)
}

/** GET /tickers/{t}/prices?mode= — série histórica (`mode` é OBRIGATÓRIO). */
export function acaoFetchPrices(base: string, ticker: string, mode: AcaoRange) {
  return $fetch<{ data: PricePointApi[] }>(`${base}/tickers/${ticker}/prices?mode=${mode}`, json)
}

/**
 * GET /indices/IBOV/prices?mode= — comparativo do chart.
 * GOTCHA runtime: o símbolo documentado `^BVSP` devolve `{data:[]}` desde a
 * migração do indices-scraper (2026-07-04); o que funciona é `IBOV`.
 */
export function acaoFetchIbovPrices(base: string, mode: PriceMode) {
  return $fetch<{ data: PricePointApi[] }>(`${base}/indices/IBOV/prices?mode=${mode}`, json)
}

/** GET /fundamentals/{t}/overview — consolidado (key-stats + scrape_extras). */
export function acaoFetchOverview(base: string, ticker: string) {
  return $fetch<{ data: FundamentalsOverviewApi }>(`${base}/fundamentals/${ticker}/overview`, json)
}

/** GET /rankings/redentia-score — universo ranqueado (cap real de 100 linhas). */
export function acaoFetchScoreRanking(base: string) {
  return $fetch<{ data: ScoreRowApi[] }>(`${base}/rankings/redentia-score?limit=500`, json)
}

/** GET /consensus/{t} — 200 com coverage:'none' quando não coberto (e 204 doc). */
export function acaoFetchConsensus(base: string, ticker: string) {
  return $fetch<ConsensusApi | null>(`${base}/consensus/${ticker}`, json)
}

/** GET /dividends/{t} — histórico completo de proventos. */
export function acaoFetchDividends(base: string, ticker: string) {
  return $fetch<{ data: DividendApi[] }>(`${base}/dividends/${ticker}`, json)
}

/**
 * GET /assets/{t}/editorial — leitura editorial (404 = não gerado).
 * GOTCHA runtime: responde FLAT (sem wrapper `data`), ticker em lowercase.
 */
export function acaoFetchEditorial(base: string, ticker: string) {
  return $fetch<EditorialApi>(`${base}/assets/${ticker}/editorial`, json)
}

/** GET /theses — cards (tickers visíveis; composição completa só no detail). */
export function acaoFetchTheses(base: string) {
  return $fetch<{ data: ThesisCardApi[] }>(`${base}/theses`, json)
}

/** GET /theses/{slug} — detail com companies[] (papel do ativo por empresa). */
export function acaoFetchThesisDetail(base: string, slug: string) {
  return $fetch<{ data: ThesisDetailApi }>(`${base}/theses/${slug}`, json)
}

/**
 * GET /news/ticker/{symbol} — notícias do ticker. O endpoint valida a regex
 * estrita `^[A-Z]{4}\d{1,2}$` (rejeita B3SA3, E1TN34…) — pra esses casos o
 * useAcao cai pro filtro `/news?ticker=`.
 */
export function acaoFetchNewsByTicker(base: string, ticker: string) {
  return $fetch<{ data: NewsApi[] }>(`${base}/news/ticker/${ticker}`, json)
}

/** GET /news?ticker= — fallback pra tickers fora da regex do endpoint acima. */
export function acaoFetchNewsFiltered(base: string, ticker: string, limit = 8) {
  return $fetch<{ data: NewsApi[] }>(`${base}/news?ticker=${ticker}&limit=${limit}`, json)
}

/** GET /crypto/{idOrSymbol} — detail da moeda (404 quando não existe). */
export function acaoFetchCrypto(base: string, symbol: string) {
  return $fetch<{ data: CryptoDetailApi }>(`${base}/crypto/${symbol}`, json)
}

/**
 * GET /crypto/{idOrSymbol}/prices?range= — série DIÁRIA em BRL.
 * Ranges reais (verificados 2026-07-13): `30d`, `6m`, `5y`, `full`; qualquer
 * outro valor (inclusive vazio) cai no default de 12 meses.
 */
export function acaoFetchCryptoPrices(base: string, symbol: string, range: string) {
  return $fetch<{ data: CryptoPricePointApi[] }>(`${base}/crypto/${symbol}/prices?range=${range}`, json)
}

/**
 * Tipos do domínio mercado (PR1 /mercado).
 *  - *Api  = shapes REAIS do backend (verificados em Backend/app/... 2026-07-11)
 *  - Nu*   = view-models da página (shape do design Redentia Mercado Nu.dc.html)
 */

/* ————— shapes da API ————— */

/** GET /api/theses → data[] (InvestmentThesis::toCard + returnLabel/returnPct). */
export interface ThesisCardApi {
  id: string
  sector: string
  categoryColor: string | null
  title: string
  description: string
  image: string | null
  tickers: string[]
  extraTickers: number
  sourcesCount: number
  studiesCount: number
  companiesCount: number
  score: number | null
  conviction: number | null
  rankLabel: string | null
  returnLabel: string | null
  rankColor: string | null
  returnPct: number | null
}

/** GET /api/top-stocks|top-reits|top-bdrs?side= → data[] (TickerResource). */
export interface TickerApi {
  ticker: string
  name: string
  logo: string | null
  type: string
  market_price: number | null
  change_percent: number | null
}

/** GET /api/crypto → data[]. */
export interface CryptoApi {
  id: string
  symbol: string
  name: string
  price_brl: number | null
  change_24h: number | null
}

/** GET /api/briefing/today → data (DailyBriefing::toBriefingResource). */
export interface BriefingApi {
  eyebrow: string
  headline: string
  minutes: number
  body: string
  date: string | null
  highlights?: string[]
  sources?: string[]
}

/** GET /api/tesouro?indexer= → data[] (TesouroController::toArray). */
export interface TesouroApi {
  slug: string
  name: string
  indexer: string
  rate: string
  rate_numeric: number | null
  maturity_date: string | null
  price_buy: number | null
  price_sell: number | null
  reference_rate: number | null
  reference_rate_label: string | null
  refreshed_at: string | null
}

/** GET /api/research/news → data[] (NewsTake::toFeedItem). */
export interface NewsTakeApi {
  id: string
  source: string
  url: string
  title: string
  imageUrl: string | null
  publishedAt: string | null
  atlasReading: string | null
  /** em prod vem como objeto {ticker,dir} (verificado 2026-07-11); tolera string */
  tickers: (string | { ticker: string; dir?: string } | null)[]
  relevance: number
}

/** GET /api/news/latest → data[] (fallback). */
export interface NewsApi {
  id: number
  source: string
  url: string
  title: string
  excerpt: string | null
  image_url: string | null
  category: string | null
  tickers: string[]
  published_at: string | null
}

/** GET /api/market/snapshot?scope=ibov (campos usados na página). */
export interface MarketSnapshotApi {
  indices_br?: Record<string, { value: number | null; change_pct: number | null } | undefined>
  macro?: { usd_brl?: { value: number | null; change_pct?: number | null } }
}

/** GET /api/market/today (campos usados: amplitude do pregão). */
export interface MarketTodayApi {
  constituents?: { ticker: string; change_pct: number | null }[]
}

/* ————— view-models (shape do design) ————— */

export type NuDir = 'up' | 'down'

export interface NuThesisTicker {
  letter: string
  name: string
  /** cor do tile — SEMPRE um var(--nu-*) */
  tile: string
}

export interface NuThesis {
  slug: string
  cat: string
  image: string | null
  perf: string | null      // '+34%'
  perfLabel: string        // 'Tese em destaque'
  titlePre: string
  titleHi: string
  titlePost: string
  desc: string
  tickers: NuThesisTicker[]
  more: string | null      // '+5'
  fontes: string           // '246 fontes'
  href: string
  leftTitle: string
  leftDesc: string
  cta: string
  ctaHref: string
}

export interface NuMoverRow {
  rank: number
  ticker: string
  name: string
  price: string
  pct: string
  dir: NuDir
}

export type NuMoverTab = 'Ações' | 'FIIs' | 'Cripto' | 'BDRs'

export interface NuMoversClass {
  gainers: NuMoverRow[]
  losers: NuMoverRow[]
}

export interface NuIndexStat {
  label: string
  value: string
  pct: string
  dir: NuDir
}

export interface NuStatPill {
  label: string
  value: string | null
  delta: string | null     // '+1,22%' (seta ▲/▼ vem do dir)
  dir: NuDir | null
}

export interface NuBriefing {
  metaLine: string
  headline: string
  dek: string | null
  pills: NuStatPill[]
  /** parágrafos em HTML JÁ ESCAPADO (seed inclui links inline do design) */
  paragraphs: string[]
  extraParagraphs: string[]
  takeaway: { kicker: string; html: string } | null
}

export interface NuTesouroRow {
  name: string
  venc: string
  rate: string
}

export interface NuTesouroGroup {
  name: string
  count: string
  rows: NuTesouroRow[]
}

export interface NuTesouroHighlight {
  name: string
  venc: string
  rate: string
  updated: string
}

export interface NuNewsBadge {
  text: string
  dir: NuDir
}

export interface NuNewsFeaturedItem {
  href: string
  badge: NuNewsBadge | null
  source: string
  title: string
  dek: string
}

export interface NuNewsRowItem {
  href: string
  title: string
  source: string
  ticker: NuNewsBadge | null
}

export interface NuGuideCardItem {
  tag: string
  title: string
  href: string
  variant: 1 | 2 | 3
}

export interface NuFaqItem {
  q: string
  a: string
}

export interface NuHeroCards {
  quoteLabel: string
  price: string
  pct: string
  dir: NuDir
  score: number
  newsTitle: string
}

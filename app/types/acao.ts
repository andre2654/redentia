/**
 * Tipos do domínio ação (PR2 /acao/[ticker]).
 *  - *Api  = shapes REAIS do backend (verificados via curl no proxy 2026-07-11)
 *  - Acao* = view-models da página (shape do design Redentia Acoes Nu.dc.html)
 *
 * Gotchas de runtime confirmados (≠ docs):
 *  - /indices/{name}/prices responde com `IBOV`/`IFIX` (o `^BVSP` documentado
 *    retorna `{data:[]}` — símbolo migrou no indices-scraper de 2026-07-04);
 *  - /consensus/{t} NÃO 204a: devolve 200 com `coverage:'none'` e campos null;
 *  - /dividends/{t} vem com a chave literal `"label "` (espaço no fim) e
 *    `rate` como string;
 *  - redentia_score é 0-10 (topo real do universo ≈ 4,4) e `ranking_breakdown`
 *    são POSIÇÕES por ranking, não sub-scores 0-100.
 */

import type { NuDir, NuNewsFeaturedItem, NuNewsRowItem } from '~/types/market'

/* ————— shapes da API ————— */

/** GET /api/tickers/{t} → data (ProfileResource). */
export interface TickerProfileApi {
  ticker: string
  name: string
  logo: string | null
  type: string // 'STOCK' | 'REIT' | 'ETF' | 'BDR'
  market_price: number | null
  change_percent: number | null
  price_at: string | null // 'd/m' SEM ano (gotcha documentado)
  market_cap: number | null // NÃO usar: vem truncado (PETR4 = 1.02) — usar fundamentals
  sector: string | null
  industry_category: string | null
  long_business_summary: string | null
}

/** GET /api/tickers/{t}/prices?mode= e /api/indices/{n}/prices?mode= → data[]. */
export interface PricePointApi {
  ticker?: string
  name?: string
  market_price: number | null
  change_percent?: number | null
  price_at: string // 'YYYY-MM-DD' (série vem com data completa)
}

/** GET /api/fundamentals/{t}/overview → data (campos usados na tela). */
export interface FundamentalsOverviewApi {
  ticker: string
  key_statistics: {
    dividend_yield: string | null
    forward_pe: string | null
    price_to_book: string | null
    trailing_eps: string | null
    earnings_annual_growth: string | null
    ytd_return: string | null
  } | null
  financial_data: {
    total_revenue: string | null
    profit_margins: string | null
    return_on_equity: string | null
    return_on_assets: string | null
    free_cashflow: string | null
    revenue_growth: string | null
  } | null
  scrape_extras: {
    asset_type: string
    valuation?: {
      dividend_yield: number | null
      price_to_earnings: number | null
      price_to_book: number | null
      ev_ebitda: number | null
      market_cap: number | null
    } | null
    leverage?: { net_debt_to_ebitda: number | null } | null
    growth?: { revenue_cagr_5y: number | null; earnings_cagr_5y: number | null } | null
    quality?: {
      return_on_equity: number | null
      return_on_assets: number | null
      net_margin: number | null
    } | null
    /** presente só em FIIs (asset_type: 'fii') */
    fii?: {
      dividend_yield_12m: number | null
      price_to_book: number | null
      book_value_per_share: number | null
      monthly_income_avg_24m: number | null
      ifix_share: number | null
      num_shareholders: number | null
      trading_name: string | null
    } | null
  } | null
}

/** GET /api/rankings/redentia-score → data[] (campos usados). */
export interface ScoreRowApi {
  ticker: string
  redentia_score: number | null // escala 0-10 (display /100 = ×10)
}

/** GET /api/consensus/{t} → 200 (coverage 'none' = não coberto). */
export interface ConsensusApi {
  ticker: string
  coverage: string
  recommendation: string | null
  price: {
    close: number | null
    target_low: number | null
    target_average: number | null
    target_high: number | null
  }
  upside_percent: number | null
  breakdown: {
    bullish: number | null
    neutral: number | null
    bearish: number | null
    analyst_count: number | null
  }
  refreshed_at: string | null
}

/** GET /api/dividends/{t} → data[] (⚠️ chave real é `"label "`, com espaço). */
export interface DividendApi {
  ticker: string
  payment_date: string // 'YYYY-MM-DD'
  rate: string
}

/** GET /api/assets/{t}/editorial → data (404 = não gerado). */
export interface EditorialApi {
  ticker: string
  description: string | null
  thesis_pros: string | null // PROSA longa (não bullets — gotcha)
  thesis_cons: string | null
  faq_extended: { question: string; answer: string }[] | null
  generated_at: string | null
}

/** GET /api/theses/{slug} → data.companies[] (papel do ativo por empresa). */
export interface ThesisCompanyApi {
  ticker: string
  name: string
  role: string | null
  status: string | null
  rationale: string | null
}

export interface ThesisDetailApi {
  id: string
  title: string
  image: string | null
  conviction: number | null
  description: string
  companies?: ThesisCompanyApi[]
}

/* ————— view-models (shape do design) ————— */

export type AcaoRange = '1mo' | '6mo' | '12mo'

export interface SeriesPoint {
  t: string // 'YYYY-MM-DD'
  v: number
}

export type TagVariant = 'green' | 'amber' | 'gray'

export interface AcaoTag {
  text: string
  variant: TagVariant
}

export interface AcaoHeroVM {
  companyLine: string // 'Petrobras · PETR4'
  ticker: string
  priceFmt: string // 'R$ 38,25'
  changeLine: string | null // '+R$ 0,29 (0,76%) hoje' (null = sem variação do dia)
  dir: NuDir
  metaLine: string // 'fech. anterior R$ 37,96 · atualizado em 10/07'
}

export interface AcaoStatRow {
  l: string
  v: string
}

export interface AcaoPerfilRow {
  name: string
  tag: AcaoTag
}

export interface AcaoMetricCard {
  kind: 'metric'
  label: string
  value: string
  tag: AcaoTag | null
}

export interface AcaoInsightCard {
  kind: 'insight'
  insight: string
  cta: string
  href: string
}

export type AcaoFundCard = AcaoMetricCard | AcaoInsightCard

export interface AcaoThesisRowVM {
  slug: string
  title: string
  image: string | null
  conviction: number | null
  /** trecho em bold do 'Papel do ativo' */
  roleStrong: string
  /** resto da frase (sem bold) */
  roleRest: string
}

export interface AcaoDividendBar {
  year: string
  valFmt: string
  hPct: number // altura % do máximo
  current: boolean
}

export interface AcaoDividendsVM {
  heading: [string, string] // 2 linhas do H2
  subtitle: string
  rows: AcaoStatRow[]
  bars: AcaoDividendBar[]
  /** soma por ação nos últimos 12M (pra pill personalizada qty × sum) */
  sum12: number
}

export interface AcaoScoreVM {
  score100: number
  pill: AcaoTag
  subScores: { name: string; value: number }[]
}

export interface AcaoConsensusVM {
  pill: string // 'COMPRAR'
  pillVariant: TagVariant
  upsideFmt: string // '+34,8%'
  subLine: string
  rangeBar: { fromPct: number; widthPct: number; targetPct: number; dotPct: number }
  labels: { current: string; avg: string; high: string }
  footnote: string
}

export interface AcaoAiReadVM {
  pros: string[]
  cons: string[]
}

export interface AcaoAiVM {
  updatedLabel: string // 'atualizada hoje'
  score: AcaoScoreVM | null
  consensus: AcaoConsensusVM | null
  read: AcaoAiReadVM | null
}

export interface AcaoNewsVM {
  featured: NuNewsFeaturedItem
  rows: NuNewsRowItem[]
}

export interface AcaoSeriesPair {
  asset: SeriesPoint[]
  ibov: SeriesPoint[]
}

export interface AcaoPayload {
  ticker: string
  name: string
  isFii: boolean
  hero: AcaoHeroVM
  currentPrice: number | null
  series12: AcaoSeriesPair | null
  chartStats: AcaoStatRow[]
  perfil: AcaoPerfilRow[]
  fundHeading: [string, string]
  fcards: AcaoFundCard[]
  theses: AcaoThesisRowVM[]
  dividends: AcaoDividendsVM | null
  ai: AcaoAiVM | null
  news: AcaoNewsVM | null
  seo: {
    title: string
    description: string
    faq: { question: string; answer: string }[]
  }
}

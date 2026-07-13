/**
 * Tipos do domínio ação (PR2 /asset/[ticker]).
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
    /**
     * presente só em ETFs (asset_type: 'etf') — verificado ao vivo 2026-07-13
     * (IVVB11). É a ÚNICA fonte de dados de ETF: valuation/quality vêm vazios,
     * então extractFund devolve null e a página degradava pra vazia antes do
     * PR de tipos de ativo.
     */
    etf?: {
      price: number | null
      change_12m: number | null
      min_price_52_weeks: number | null
      max_price_52_weeks: number | null
      num_shareholders: number | null
      volume: number | null
      lot_size: number | null
      market: string | null
      isin_code: string | null
      book_name: string | null
      cnpj: string | null
      fund_start_date: string | null // 'dd/mm/yyyy'
      trading_name: string | null // vem SUJO ('ETF DA BOLSA AMERICANA cotação e composição')
    } | null
  } | null
}

/**
 * GET /api/crypto/{idOrSymbol} → data (campos usados; verificado ao vivo
 * 2026-07-13). Preços em BRL; cache de 5 min no backend.
 */
export interface CryptoDetailApi {
  id: string
  symbol: string
  name: string
  image: string | null
  rank: number | null
  price_brl: number | null
  change_24h_pct: number | null
  change_7d_pct: number | null
  change_30d_pct: number | null
  appreciation_12m_pct: number | null
  market_cap_brl: number | null
  volume_24h_brl: number | null
  market_cap_dominance_pct: number | null
  min_52w_brl: number | null
  max_52w_brl: number | null
  circulating_supply: number | null
  max_supply: number | null
  ohlc?: { last_updated: string | null } | null
}

/**
 * GET /api/crypto/{idOrSymbol}/prices?range= → data[] (diário).
 * GOTCHA runtime: `price_usd` vem null; ranges aceitos ≠ /tickers: `30d` (31
 * pts), `6m` (182), `5y`, `full`; qualquer outro valor cai no default de 12
 * meses (366 pts).
 */
export interface CryptoPricePointApi {
  price_at: string // 'YYYY-MM-DD'
  price_brl: number | null
  price_usd: number | null
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

/**
 * Tipo do ativo resolvido em runtime: scrape_extras.asset_type quando existe,
 * fallback no `type` do ProfileResource; 'crypto' vem da ROTA (símbolo curto
 * A-Z fora do formato B3 → GET /crypto/{symbol}).
 */
export type AssetKind = 'stock' | 'fii' | 'bdr' | 'etf' | 'crypto'

export type AcaoRange = '1mo' | '6mo' | '12mo'

/** enum completo do `mode` de /prices (PR5: o IBOV da tese olha além de 12M). */
export type PriceMode = AcaoRange | 'ytd' | '3mo' | '2y' | '3y' | '4y' | '5y' | 'full'

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
  /** logo redondo antes do nome (cripto usa o `image` do backend; B3 omite) */
  logo?: string | null
  /** pill outline ao lado do nome — default 'B3' (cripto: 'CRIPTO') */
  exchangeLabel?: string
}

export interface AcaoStatRow {
  l: string
  v: string
  /** cor de destaque do valor (PR5: 'Desde o lançamento' verde na tese) */
  accent?: 'green'
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

/** Seção "O fundo" (ETF): linhas cadastrais no lugar dos fundamentos de empresa. */
export interface AcaoFundInfoVM {
  heading: [string, string]
  sub: string
  rows: AcaoStatRow[]
}

export interface AcaoPayload {
  ticker: string
  name: string
  kind: AssetKind
  hero: AcaoHeroVM
  currentPrice: number | null
  series12: AcaoSeriesPair | null
  chartStats: AcaoStatRow[]
  perfil: AcaoPerfilRow[]
  fundHeading: [string, string]
  /** subtítulo da seção de fundamentos (muda por tipo: B3/informes/matriz USD) */
  fundSub: string
  fcards: AcaoFundCard[]
  /** só ETF: dados cadastrais do fundo (null pros demais tipos) */
  fundInfo: AcaoFundInfoVM | null
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

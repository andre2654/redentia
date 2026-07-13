/**
 * Tipos do KIT de rankings (PLANO-RANKINGS.md).
 *
 * Separação dura META × COPY:
 *  - RankingMeta vive no registry (app/content/rankings/registry.ts) — tudo
 *    que a tela precisa pra buscar e renderizar DADOS (endpoint, colunas,
 *    tabs) + o topo editorial (h1/lead/chips, que são contrato de SEO).
 *  - RankingCopy vive em app/content/rankings/copy/<slug>.ts — o corpo
 *    educacional portado VERBATIM da Redentia antiga (answer-first, seções
 *    h2, ferramentas relacionadas, FAQ). Copy vazia = seções somem
 *    graciosamente (o degrade é parte do contrato do template).
 */

/** Classe pro filtro do hub (?classe=) e pros chips dos cards. */
export type RankingClasse = 'acoes' | 'fiis' | 'bdrs' | 'renda-fixa'

/** Tab de tipo no detalhe (?type=) — só onde o dado existe ao vivo. */
export type RankingAssetType = 'acoes' | 'fiis' | 'bdrs'

/** Valor da tab ativa ('todos' = sem filtro de type na API). */
export type RankingTypeFilter = 'todos' | RankingAssetType

/**
 * Colunas configuráveis da RankTable (além das fixas #/Ativo/Cotação).
 * Cada chave mapeia campo da API + label + formatter em utils/rankings.ts.
 * ATENÇÃO fração vs percent (comportamento verificado na Redentia antiga):
 * dy/roe/netMargin/growth vêm como FRAÇÃO (0.0834 = 8,34%) e multiplicam
 * por 100 no display; change/upsidePct já vêm em PONTOS PERCENTUAIS.
 */
export type RankingColumnKey =
  | 'marketCap'
  | 'dy'
  | 'pe'
  | 'change'
  | 'roe'
  | 'netMargin'
  | 'revenue'
  | 'netIncome'
  | 'cash'
  | 'grahamPrice'
  | 'bazinPrice'
  | 'upsidePct'
  | 'buyHoldScore'
  | 'revenueGrowth5y'
  | 'netIncomeGrowth5y'
  | 'mentionCount'
  | 'score'
  | 'rankingCount'

export interface RankingMeta {
  /** Slug antigo VERBATIM (equity de SEO) — vira /ranking/<slug>. */
  slug: string
  /** Nome curto (cards do hub, breadcrumb, CTA). */
  title: string
  /**
   * Segmento do endpoint GET /rankings/<endpoint> no Laravel.
   * 'tesouro' é o sentinel do caso especial (deriva de GET /tesouro).
   */
  endpoint: string
  /** Params extras fixos do endpoint (side=top|bottom, days=30…). */
  extraParams?: Record<string, string>
  /** DY com tab FIIs precisa de min_cap=0 (FIIs têm market_cap menor/null). */
  reitMinCapZero?: boolean
  metaTitle: string
  metaDescription: string
  /** H1 verbatim da página antiga. */
  h1: string
  /** Lead (subtitle) verbatim da página antiga. */
  lead: string
  /** Chips do hero (trust badges antigos, só o texto). */
  chips: string[]
  /** Colunas configuráveis, em ordem (a 1ª é o default do leader). */
  columns: RankingColumnKey[]
  /** Métrica do número-herói do RankLeader (nem sempre a 1ª coluna). */
  primaryMetric: RankingColumnKey
  /** Label da coluna change quando não é "Hoje" (ex.: '30d', '12m'). */
  changeLabel?: string
  /** Tabs exibidas — vazio = sem tabs (tesouro-direto). */
  types: RankingAssetType[]
  /** Classes pro filtro do hub (?classe=). */
  classe: RankingClasse[]
  /** Tema de agrupamento no hub. */
  tema: string
}

/**
 * Bloco de texto de uma seção educacional. Além do parágrafo simples
 * (string), suporta as semânticas perdidas no flattening do port:
 *  - { h3 }: subtítulo (h3 real da página antiga, não parágrafo);
 *  - { ul }: lista de bullets (itens verbatim);
 *  - { linkText, href, text }: parágrafo cujo prefixo é link interno
 *    (cards de ticker antigos mantêm /asset/<t>, mesma URL da Redentia antiga;
 *    o texto renderizado é linkText + text, concatenação verbatim).
 */
export type RankingParagraph =
  | string
  | { h3: string }
  | { ul: string[] }
  | { linkText: string; href: string; text: string }

export interface RankingEducationalSection {
  h2: string
  paragraphs: RankingParagraph[]
}

export interface RankingCrossLink {
  title: string
  desc: string
  href: string
}

export interface RankingFaqItem {
  q: string
  a: string
}

/** Passo da metodologia (extra do redentia-score: Coleta → Pontuação → Cálculo). */
export interface RankingMethodologyStep {
  title: string
  body: string
}

export interface RankingCopy {
  /**
   * Parágrafo answer-first (abaixo da tabela, centralizado). Otimizado pra
   * citação por LLMs. '' = não renderiza.
   */
  answerFirst: string
  /** Seções h2 educacionais, na MESMA ordem da página antiga. */
  educationalSections: RankingEducationalSection[]
  /** "Ferramentas relacionadas" (links re-mapeados: /rankings, /asset/…). */
  crossLinks: RankingCrossLink[]
  /** FAQ (JSON-LD FAQPage emitido pelo NuFaqAccordion). */
  faqItems: RankingFaqItem[]
  /** h2 do FAQ quando a página antiga tinha título próprio (keyword-bearing,
   *  ex.: 'Perguntas Frequentes sobre Dividend Yield'). Default do template:
   *  'Perguntas Frequentes'. */
  faqTitle?: string
  /** Extras do redentia-score: card de metodologia antes das seções h2. */
  methodologyIntro?: string[]
  methodologySteps?: RankingMethodologyStep[]
  methodologyFormula?: string
}

/* ————— dados ————— */

/**
 * Linha do envelope {data:[…]} dos GET /rankings/* (RankingResource do
 * Laravel — Resource único ~35 campos, subset por ranking). Campos numéricos
 * podem vir null (change_percent null → 0 no display).
 */
export interface RankingRowApi {
  ticker?: string
  stock?: string
  name?: string | null
  sector?: string | null
  type?: string | null
  market_price?: number | string | null
  close?: number | string | null
  change_percent?: number | string | null
  market_cap?: number | string | null
  dividend_yield?: number | string | null
  trailing_pe?: number | string | null
  roe?: number | string | null
  net_margin?: number | string | null
  total_revenue?: number | string | null
  net_income?: number | string | null
  total_cash?: number | string | null
  graham_price?: number | string | null
  bazin_price?: number | string | null
  upside_pct?: number | string | null
  buy_hold_score?: number | string | null
  revenue_growth_5y?: number | string | null
  net_income_growth_5y?: number | string | null
  mention_count?: number | string | null
  redentia_score?: number | string | null
  ranking_count?: number | string | null
  ranking_breakdown?: Record<string, number> | null
}

/** Linha derivada de GET /tesouro ordenada por rate_numeric (renda fixa). */
export interface TesouroRankingRow {
  slug: string
  name: string
  indexer: string
  rate: string
  rateNumeric: number
  maturity: string | null
  priceBuy: number | null
}

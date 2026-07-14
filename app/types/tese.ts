/**
 * Tipos do domínio tese (PR5 /tese/[slug]).
 *  - *Api  = shapes REAIS do backend (verificados via curl 2026-07-11)
 *  - Tese* = view-models da página (shape do design Redentia Tese.dc.html)
 *
 * Gotchas de runtime confirmados (≠ docs/spec):
 *  - /theses/{slug}/performance → `series` é number[] base 100, SEM datas —
 *    as datas do tooltip são interpoladas entre o lançamento (startLabel) e
 *    hoje, então exibimos só 'mmm aaaa' (dia exato seria inventado);
 *  - o detail traz sincePct/returnLabel DIVERGENTES do performance.deltaPct
 *    (22 vs 67 na reindustrializacao-eua) — a página usa SEMPRE o performance
 *    (mesma fonte do gráfico) pra hero/stats nunca contradizerem o chart;
 *  - verdicts = SEMPRE 1 por kind (favor|sinal|risco) com title+body (o mock
 *    do design tinha 4 bullets no favor — o real vira 1 bullet "title: body");
 *  - status/decision reais incluem 'Em risco' (não previsto no design) → red.
 */

import type { AcaoStatRow } from '~/types/acao'

/* ————— shapes da API ————— */

/** GET /api/theses/{slug} → data.verdicts[] (1 por kind). */
export interface ThesisVerdictApi {
  kind: string // 'favor' | 'sinal' | 'risco'
  title: string
  body: string
}

/** data.companies[] (composição atual — fallback quando o estudo não tem assets). */
export interface ThesisCompanyFullApi {
  ticker: string
  name: string
  role: string | null
  status: string | null // 'Núcleo' | 'Acompanhar' | 'Em risco'
  catalyst: string | null
  rationale: string | null
}

/** data.studies[].assets[] — avaliação por ativo da revalidação. */
export interface ThesisStudyAssetApi {
  ticker: string
  name: string
  assessment: string
  decision: string // 'Mantém' | 'Acompanhar' | 'Em risco' | 'Entra'…
  why: string
}

/** data.studies[].decisions[] — decisões taggeadas do estudo. */
export interface ThesisStudyDecisionApi {
  label: string // 'Convicção' | 'Composição' | 'Macro' | 'Risco' (ou livre)
  detail: string
}

/** data.studies[].sources[] — fontes consultadas. */
export interface ThesisStudySourceApi {
  title: string
  url: string
  type: string // 'Notícia' | 'Relatório' | 'Documento'
  publisher: string
}

/** data.studies[] — timeline de revalidações (mais recente primeiro). */
export interface ThesisStudyApi {
  id: number | string
  date: string // 'YYYY-MM-DD'
  tag: string | null
  title: string
  summary: string
  minutes: number | null
  assets: ThesisStudyAssetApi[] | null
  decisions: ThesisStudyDecisionApi[] | null
  sources: ThesisStudySourceApi[] | null
}

/* ————— relatório completo (JSONB `report`, nullable) —————
 * Contrato do campo (versão 1). Tese sem report não muda em NADA na página —
 * todo campo interno é tolerante a null/ausente (JSONB curado à mão). */

/** Fonte citada — no fim de cada parte e na lista consolidada. */
export interface ThesisReportSourceApi {
  label: string // 'RI Petrobras 1T26'
  url: string
}

/** Parte argumentativa: heading = frase-argumento, prosa com {mark}. */
export interface ThesisReportPartApi {
  heading: string
  paragraphs: string[]
  sources: ThesisReportSourceApi[] | null
}

export interface ThesisReportAssumptionApi {
  label: string // 'Crescimento de receita'
  value: string // '3% a.a.'
  note: string | null // por quê
}

export interface ThesisReportValuationApi {
  intro: string | null // abordagem em 1 §
  assumptions: ThesisReportAssumptionApi[] | null
  math: string[] | null // um passo de conta por item
  fairValue: string | null // número final
  vsPrice: string | null // vs preço atual (upside/downside honesto)
}

/** data.report — o relatório completo da tese (nullable no banco). */
export interface ThesisReportApi {
  version: number
  readMinutes: number | null
  publishedAt: string | null // 'YYYY-MM-DD'
  opportunity: { paragraphs: string[] } | null
  thesis: string[] | null // 4-6 bullets, os pilares
  risks: string[] | null // 5-7 bullets, o que mata a tese
  parts: ThesisReportPartApi[] | null
  valuation: ThesisReportValuationApi | null
  conclusion: { paragraphs: string[]; milestones: string[] | null } | null
  sources: ThesisReportSourceApi[] | null
}

/** GET /api/theses/{slug} → data (detail completo). */
export interface ThesisFullApi {
  id: string
  sector: string // 'Tese · Reindustrialização' (categoria depois do prefixo)
  categoryColor: string | null
  title: string
  description: string
  image: string | null // '/teses/*.png' (assets já em public/)
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
  sincePct: number | null
  publishedLabel: string | null // 'Set' (mês abreviado pt, capitalizado)
  publishedYear: number | string | null // ⚠️ vem string em parte das teses
  isBestTese: boolean
  statementHtml: string | null // prosa com tokens {mark}…{/mark}
  statementSubHtml: string | null
  verdicts: ThesisVerdictApi[] | null
  companies: ThesisCompanyFullApi[] | null
  monitoring: { eyebrow: string; body: string; ctaLabel: string } | null
  studies: ThesisStudyApi[] | null
  /** relatório completo (JSONB nullable) — ausente/null em teses sem report */
  report?: ThesisReportApi | null
}

/** GET /api/theses/{slug}/performance → data. */
export interface ThesisPerformanceApi {
  series: number[] // base 100 equal-weight, SEM datas
  deltaPct: number | null
  startLabel: string | null // 'set 2025'
  endLabel: string | null // 'hoje'
  tickersUsed?: string[]
}

/** GET /api/theses/{slug}/conviction-history → data. */
export interface ConvictionPointApi {
  date: string // 'YYYY-MM-DD'
  conviction: number
}

export interface ConvictionHistoryApi {
  current: number | null
  series: ConvictionPointApi[]
  firstConviction: number | null
  lastConviction: number | null
  deltaSinceStart: number | null
  enoughForTrajectory: boolean
  lastChange: {
    kind: string
    title: string
    body: string
    fromVal: string | null
    toVal: string | null
    occurredAt: string | null
  } | null
}

/* ————— view-models (shape do design) ————— */

export interface TeseHeroVM {
  cat: string // 'Reindustrialização' (breadcrumb uppercase)
  titlePre: string
  titleHi: string // trecho com bg azul (só o seed marca; API não tem marcador)
  titlePost: string
  subtitle: string
  image: string | null
  convBadge: string | null // 'Convicção 88/100 · +1 hoje'
  sinceBadge: string | null // '+67% desde o lançamento'
  ativosBadge: string // '7 ativos'
  revalBadge: string | null // 'Revalidada hoje · 11 jul'
}

export interface TeseEditorialVM {
  heading: string // one-liner da tese (description)
  /** parágrafos em HTML JÁ ESCAPADO ({mark} vira <span class="tse-hi">) */
  paragraphsHtml: string[]
}

export interface TeseChartVM {
  series: number[] // % desde o lançamento (base100 - 100)
  benchmark: number[] | null // IBOV rebased no MESMO range (null = sem par)
  labels: string[] // label de data por ponto ('set 2025') — [] = sem datas
  pillValue: string // '+67,1%'
}

export interface TeseNumbersVM {
  stats: AcaoStatRow[]
  chart: TeseChartVM
}

export type TeseEvalBadgeVariant = 'green' | 'blue' | 'blue-solid' | 'red' | 'neutral'

export interface TeseEvalCardVM {
  ticker: string
  name: string
  letter: string
  tileBg: string // SEMPRE var(--nu-*)
  tileFg: string
  badgeText: string // 'Mantém' | 'Acompanhar' | 'Entra hoje' | 'Em risco'
  badgeVariant: TeseEvalBadgeVariant
  highlight: boolean // card 'Entra' ganha border azul 2.5px
  txt: string
  pq: string
}

export interface TeseEvalVM {
  metaLine: string // 'Da revalidação de hoje · 11 jul 2026'
  cards: TeseEvalCardVM[]
}

export interface TeseDriversVM {
  favor: string[] // bullets
  sinal: string[]
  risco: { title: string; body: string } | null
}

export type TeseDecisionVariant = 'green' | 'blue' | 'neutral' | 'red'

export interface TeseDecisionVM {
  tag: string
  variant: TeseDecisionVariant
  txt: string
}

export interface TeseSourceVM {
  title: string
  /** null = fonte sem link (seeds): renderiza <span>, nunca <a href="#">. */
  url: string | null
  meta: string // 'Notícia · Money Times'
}

export interface TeseConvBadgeVM {
  from: string | null // '87' (null = estável)
  to: string // '88'
  changed: boolean
}

export interface TeseStudyVM {
  id: number | string
  dateBadge: string // 'Hoje · 11 jul 2026' | '8 jul 2026'
  isToday: boolean
  conv: TeseConvBadgeVM | null
  title: string
  summary: string
  decisions: TeseDecisionVM[]
  sources: TeseSourceVM[]
  rowDate: string // '10 jul'
}

export interface TeseDiaryVM {
  metaLine: string
  /** [0] = mais recente (card aberto); [1..] = linhas de estudos anteriores */
  studies: TeseStudyVM[]
  moreLabel: string | null // 'Ver os 9 estudos anteriores'
}

/* ————— relatório completo (view-models) ————— */

export interface TeseReportSourceVM {
  label: string
  /** null nunca acontece no contrato v1, mas o VM tolera (renderia <span>) */
  url: string | null
}

export interface TeseReportPartVM {
  id: string // âncora 'rel-parte-N'
  heading: string
  /** HTML JÁ ESCAPADO ({mark} → .tse-hi, mesmo tratamento do editorial) */
  paragraphsHtml: string[]
  sources: TeseReportSourceVM[]
}

export interface TeseReportAssumptionVM {
  label: string
  value: string
  note: string | null
}

export interface TeseReportValuationVM {
  introHtml: string | null // HTML escapado
  assumptions: TeseReportAssumptionVM[]
  mathHtml: string[] // HTML escapado, um passo por item
  fairValue: string | null
  vsPrice: string | null
}

export interface TeseReportTocItemVM {
  id: string
  label: string
}

export interface TeseReportVM {
  /** 'Leitura de 18 min · Publicado em 1 ago 2026' (partes ausentes somem) */
  metaLine: string | null
  toc: TeseReportTocItemVM[] // só seções presentes (âncoras simples)
  opportunityHtml: string[] // HTML escapado
  thesisHtml: string[] // pilares (HTML escapado)
  risksHtml: string[] // o que mata a tese (HTML escapado)
  parts: TeseReportPartVM[]
  valuation: TeseReportValuationVM | null
  conclusionHtml: string[] // HTML escapado
  milestones: string[] // marcos observáveis (texto puro)
  sources: TeseReportSourceVM[] // fontes consolidadas
}

export interface TesePayload {
  slug: string
  title: string
  hero: TeseHeroVM
  editorial: TeseEditorialVM | null
  numbers: TeseNumbersVM | null
  evalSection: TeseEvalVM | null
  /** total de estudos da tese (do backend) — usado no gate do anônimo */
  studiesCount: number
  drivers: TeseDriversVM | null
  diary: TeseDiaryVM | null
  /** null = tese sem report → a seção "O relatório completo" não existe */
  report: TeseReportVM | null
  seo: {
    title: string
    description: string
    image: string | null
    datePublished: string | null
    dateModified: string | null
    /** palavras do relatório (Article.wordCount) — null sem report */
    wordCount: number | null
  }
}

/**
 * Dados do /asset/[ticker] (PR2). Contrato de UX: designs/Redentia Acoes Nu.dc.html.
 *
 * Diferente do /mercado (client-hydrate), esta página é SSR-FIRST: o fetch
 * acontece no servidor via useAsyncData pra o HTML da 1ª resposta já sair
 * indexável com preço real. Política de degradação POR SEÇÃO (documentada em
 * buildPayload): o seed do design (números de PETR4) só entra quando o backend
 * INTEIRO falha e o ticker é PETR4 (dev offline) — pra qualquer outro ticker,
 * mostrar números de PETR4 seria mentir, então a seção degrada ESCONDENDO.
 *
 * Regras determinísticas (tags, sub-scores, insights) vivem aqui com os cortes
 * documentados — zero chamada de LLM nesta página.
 *
 * DESLISTADO (18/09/2026): papel que saiu da B3 não degrada por seção, ele
 * some — a carga aborta com 410 e a página de erro assume. Os três gatilhos
 * (envelope `delisted` do perfil, 410 no perfil, 410 na série) estão marcados
 * no loadAcao; o contrato inteiro mora em app/utils/delisted.ts.
 */
import type {
  AcaoAiReadVM,
  AcaoAiVM,
  AcaoCadeiaDetalheVM,
  AcaoCadeiaItemVM,
  AcaoCadeiaVM,
  AcaoConsensusVM,
  AcaoDividendsVM,
  AcaoEditorialVM,
  AcaoEtfXrayVM,
  AcaoFundCard,
  AcaoFundInfoVM,
  AcaoHeroVM,
  AcaoMetricCard,
  AcaoParesVM,
  AcaoPayload,
  AcaoPerfilRow,
  SupplyChainApi,
  SupplyLinkApi,
  AcaoRange,
  AcaoScoreVM,
  AcaoSeriesPair,
  AcaoStatRow,
  AcaoTag,
  AcaoThesisRowVM,
  AssetKind,
  ConsensusApi,
  CryptoDetailApi,
  CryptoPricePointApi,
  EditorialApi,
  EtfXrayApi,
  EtfXrayCorrRow,
  EtfXrayMatrix,
  EtfXrayRow,
  EtfXraySeg,
  EtfXrayTreeNodeApi,
  EtfXrayTreeNodeVM,
  FundamentalsOverviewApi,
  PricePointApi,
  ScoreRowApi,
  SeriesPoint,
  TickerProfileApi,
} from '~/types/acao'
import type { NewsApi, NuDir, ThesisCardApi } from '~/types/market'
import type { ProventoRow, SiteDy } from '~/utils/proventos'
import { SETORES_BY_API, type SetorEntry } from '~/content/setores'
import { fundirFaq, montarResumoAtivo, type ResumoAno, type ResumoAtivoInput, type ResumoProventos, type ResumoSerie } from '~/utils/assetResumo'

/* ————— helpers de formatação ————— */

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function pctFmt(n: number): string {
  return `${n > 0 ? '+' : ''}${nf2.format(n)}%`
}
function dirOf(n: number): NuDir {
  return n < 0 ? 'down' : 'up'
}
function num(x: unknown): number | null {
  if (x == null) return null
  const n = Number(x)
  return Number.isFinite(n) ? n : null
}
/**
 * 517171740422 → 'R$ 517,17B' (casas conforme o design: 2 no chart, 1 nos
 * cards). `cur` sinaliza a moeda: BDRs têm DRE em dólar da matriz (currency
 * null no backend) — prefixo vira US$ pra não mentir escala em reais.
 */
function moneyBig(v: number, decimals: 1 | 2 = 2, cur = 'R$'): string {
  const nf = decimals === 1 ? nf1 : nf2
  if (Math.abs(v) >= 1e12) return `${cur} ${nf.format(v / 1e12)}T`
  if (Math.abs(v) >= 1e9) return `${cur} ${nf.format(v / 1e9)}B`
  if (Math.abs(v) >= 1e6) return `${cur} ${nf.format(v / 1e6)}M`
  return `${cur} ${nf.format(v)}`
}
/* localISODate/relTime/sourcePretty/MONTHS_PT: compartilhados em app/utils/format.ts (PR3) */
/** '2026-08-20' → '20 ago 2026'. */
function dateShortPt(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`
}
/** 1ª frase de um texto longo (bullets da Leitura da IA / papel na tese). */
function firstSentence(text: string | null | undefined, max = 140): string | null {
  if (!text) return null
  const m = text.trim().match(/^[^.!?]{5,}?[.!?]/)
  const s = (m ? m[0] : text.trim()).replace(/[.!?]$/, '').trim()
  if (!s) return null
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s
}
const SMALL_WORDS = new Set(['de', 'do', 'da', 'dos', 'das', 'e'])
/** 'PÁTRIA LOG' → 'Pátria Log' (trading_name de FII / book_name de ETF vêm MAIÚSCULOS). */
function titleCasePt(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}
/**
 * 'PETROBRAS   PN      N2' → 'Petrobras'. A regra (e o caso da classe grudada
 * no campo de 12 caracteres, 'ITAUUNIBANCOPN' → 'Itaú Unibanco') mora em
 * utils/nomeB3.ts, que o useDividendos também usa. FIIs usam o trading_name do
 * fundamentals quando existe (title-case: vem MAIÚSCULO do scraper).
 */
function prettyName(raw: string, fiiTradingName?: string | null): string {
  return nomeDaEmpresa(raw, fiiTradingName)
}

/* ————— motor de regras (cortes documentados; zero LLM) ————— */

const T = (text: string, variant: AcaoTag['variant']): AcaoTag => ({ text, variant })

/** ROE %: ≥20 Excelente · ≥12 Bom · ≥8 Moderado · <8 Baixo. */
function tagRoe(roe: number): AcaoTag {
  return roe >= 20 ? T('Excelente', 'green') : roe >= 12 ? T('Bom', 'green') : roe >= 8 ? T('Moderado', 'amber') : T('Baixo', 'gray')
}
/** DY % ações: ≥6 Excelente · ≥4 Bom · ≥2 Moderado · <2 Baixo. FIIs: ≥11/≥8/≥6. */
function tagDy(dy: number, isFii: boolean): AcaoTag {
  if (isFii) return dy >= 11 ? T('Excelente', 'green') : dy >= 8 ? T('Bom', 'green') : dy >= 6 ? T('Moderado', 'amber') : T('Baixo', 'gray')
  return dy >= 6 ? T('Excelente', 'green') : dy >= 4 ? T('Bom', 'green') : dy >= 2 ? T('Moderado', 'amber') : T('Baixo', 'gray')
}
/** P/L: ≤0 Negativo · ≤8 Atrativo · ≤15 Justo · >15 Caro. */
function tagPl(pl: number): AcaoTag {
  return pl <= 0 ? T('Negativo', 'gray') : pl <= 8 ? T('Atrativo', 'green') : pl <= 15 ? T('Justo', 'amber') : T('Caro', 'gray')
}
/** P/VP ações: ≤1,5 Atrativo · ≤3 Justo · >3 Caro. FIIs: ≤0,95 Descontado · ≤1,05 Justo. */
function tagPvp(pvp: number, isFii: boolean): AcaoTag {
  if (isFii) return pvp <= 0.95 ? T('Descontado', 'green') : pvp <= 1.05 ? T('Justo', 'amber') : T('Caro', 'gray')
  return pvp <= 1.5 ? T('Atrativo', 'green') : pvp <= 3 ? T('Justo', 'amber') : T('Caro', 'gray')
}
/** EV/EBITDA: ≤6 Baixo · ≤10 Moderado · >10 Alto. */
function tagEv(ev: number): AcaoTag {
  return ev <= 6 ? T('Baixo', 'green') : ev <= 10 ? T('Moderado', 'amber') : T('Alto', 'gray')
}
/** Margem líquida %: ≥15 Saudável · ≥8 Moderada · <8 Apertada. */
function tagMargin(m: number): AcaoTag {
  return m >= 15 ? T('Saudável', 'green') : m >= 8 ? T('Moderada', 'amber') : T('Apertada', 'gray')
}
/** Dív. líq./EBITDA: ≤0 Caixa líquida · ≤0,5 Baixo · ≤2,5 Moderado · >2,5 Alto. */
function tagDebt(d: number): AcaoTag {
  return d <= 0 ? T('Caixa líquida', 'green') : d <= 0.5 ? T('Baixo', 'green') : d <= 2.5 ? T('Moderado', 'amber') : T('Alto', 'gray')
}
/** ROA %: ≥7 Bom · ≥4 Moderado · <4 Baixo. */
function tagRoa(r: number): AcaoTag {
  return r >= 7 ? T('Bom', 'green') : r >= 4 ? T('Moderado', 'amber') : T('Baixo', 'gray')
}
/** Crescimento a.a. como tag do card de Receita/Lucro ('↑ 12,8% a.a.'). */
function tagGrowth(g: number): AcaoTag {
  return g >= 0 ? T(`↑ ${nf1.format(g)}% a.a.`, 'green') : T(`↓ ${nf1.format(Math.abs(g))}% a.a.`, 'gray')
}
/**
 * Sub-scores 0-100 do card de Score: escala linear clampada 5-98 entre um
 * pior/melhor de referência (o ranking_breakdown do backend traz POSIÇÕES por
 * ranking, não notas — então a nota por dimensão é derivada dos fundamentos,
 * a MESMA fonte das tags, pra as duas seções nunca se contradizerem).
 */
function scaleLin(v: number, worst: number, best: number): number {
  const f = (v - worst) / (best - worst)
  return Math.round(Math.min(98, Math.max(5, 5 + f * 93)))
}

/* ————— agregados de fundamentos (fonte única pras 3 seções) ————— */

interface Fund {
  isFii: boolean
  /** BDR: DRE em dólar da matriz (currency null no backend) → valores US$ */
  isBdr: boolean
  marketCap: number | null
  dy: number | null
  pl: number | null
  pvp: number | null
  ev: number | null
  roe: number | null
  roa: number | null
  netMargin: number | null
  revenue: number | null
  profit: number | null
  debtEbitda: number | null
  revCagr: number | null
  earnGrowth: number | null
  fcf: number | null
  /** % no ano pela série de preços (utils/variacaoNoAno.ts), preenchido no loadAcao */
  ytd: number | null
  fiiVpCota: number | null
  fiiRendaMedia: number | null
  fiiIfixShare: number | null
  fiiCotistas: number | null
  fiiName: string | null
}

function extractFund(ov: FundamentalsOverviewApi | null): Fund | null {
  if (!ov) return null
  const ks = ov.key_statistics
  const fd = ov.financial_data
  const se = ov.scrape_extras
  const val = se?.valuation
  const q = se?.quality
  const fii = se?.fii
  const isFii = se?.asset_type === 'fii'
  const isBdr = se?.asset_type === 'bdr'
  const revenue = num(fd?.total_revenue)
  const netMargin = q?.net_margin ?? (num(fd?.profit_margins) != null ? num(fd?.profit_margins)! * 100 : null)
  const f: Fund = {
    isFii,
    isBdr,
    marketCap: val?.market_cap ?? null,
    dy: val?.dividend_yield ?? fii?.dividend_yield_12m ?? num(ks?.dividend_yield),
    pl: val?.price_to_earnings ?? num(ks?.forward_pe),
    pvp: val?.price_to_book ?? fii?.price_to_book ?? num(ks?.price_to_book),
    ev: val?.ev_ebitda ?? null,
    roe: q?.return_on_equity ?? (num(fd?.return_on_equity) != null ? num(fd?.return_on_equity)! * 100 : null),
    roa: q?.return_on_assets ?? (num(fd?.return_on_assets) != null ? num(fd?.return_on_assets)! * 100 : null),
    netMargin,
    revenue,
    profit: revenue != null && netMargin != null ? (revenue * netMargin) / 100 : null,
    debtEbitda: se?.leverage?.net_debt_to_ebitda ?? null,
    revCagr: se?.growth?.revenue_cagr_5y ?? null,
    earnGrowth: num(ks?.earnings_annual_growth) != null ? num(ks?.earnings_annual_growth)! * 100 : null,
    fcf: num(fd?.free_cashflow),
    // NÃO do `ks.ytd_return`: veio em escalas misturadas e errado (PETR4
    // -0.121 com a ação em +92% no ano). O loadAcao calcula pela série.
    ytd: null,
    fiiVpCota: fii?.book_value_per_share ?? null,
    fiiRendaMedia: fii?.monthly_income_avg_24m ?? null,
    fiiIfixShare: fii?.ifix_share ?? null,
    fiiCotistas: fii?.num_shareholders ?? null,
    fiiName: fii?.trading_name ?? null,
  }
  // Sem NENHUM indicador → trata como fundamentals ausentes (seções escondem).
  const any = [f.dy, f.pl, f.pvp, f.roe, f.netMargin, f.revenue, f.fiiVpCota].some((x) => x != null)
  return any ? f : null
}

/* ————— ETF (scrape_extras.etf é a ÚNICA fonte: valuation/quality vêm vazios,
   então extractFund devolve null e a página saía VAZIA antes deste branch) ————— */

interface EtfInfo {
  name: string | null // book_name em title-case ('Ishare Sp500')
  bookName: string | null // bruto ('ISHARE SP500') — linha 'Nome de pregão'
  /** Perf.Y do scanner do TradingView (série ajustada), em pontos % */
  change12m: number | null
  shareholders: number | null
  volume: number | null
  lotSize: number | null
  market: string | null
  isin: string | null
  cnpj: string | null
  startDate: string | null // 'dd/mm/yyyy'
}

function extractEtf(ov: FundamentalsOverviewApi | null): EtfInfo | null {
  const e = ov?.scrape_extras?.etf
  if (!e) return null
  return {
    // book_name é o nome limpo; trading_name vem SUJO ('… cotação e composição')
    // e o prettyName sobre o ProfileResource mutila ('Ishare Sp500ci').
    name: e.book_name ? titleCasePt(e.book_name) : null,
    bookName: e.book_name ?? null,
    change12m: e.change_12m ?? null,
    shareholders: e.num_shareholders ?? null,
    volume: e.volume ?? null,
    lotSize: e.lot_size ?? null,
    market: e.market ?? null,
    isin: e.isin_code ?? null,
    cnpj: e.cnpj ?? null,
    startDate: e.fund_start_date ?? null,
  }
}

/**
 * Variação de 12 meses do ETF (card "Variação 12 meses").
 *
 * Primeiro o número do Backend: o `change_12m` do overview é o Perf.Y do
 * scanner do TradingView, calculado sobre a série AJUSTADA dele. A série do
 * gráfico (ticker_historical_prices_si) só é ajustada até 28/08/2026; depois
 * disso o preço gravado é cru, e um desdobramento no meio vira variação (o
 * T2TD34, grupamento com data-com em 18/09/2026, leria +2.643,67%).
 * Sem o número do Backend, a conta pela série só sai com 12 meses de série e
 * entre metade e o dobro do preço inicial: é o teto que o ranking de 12 meses
 * do Backend (#56) usa quando não tem referência, porque mexida maior é do
 * tamanho de um evento que não chegou.
 */
function etfChange12m(e: EtfInfo, series: SeriesPoint[]): number | null {
  if (e.change12m != null && Number.isFinite(e.change12m)) return e.change12m
  if (series.length < 2) return null
  const first = series[0]!
  const last = series[series.length - 1]!
  const days = (Date.parse(last.t) - Date.parse(first.t)) / 86_400_000
  if (!(days >= 350) || !(first.v > 0) || !(last.v > 0)) return null
  const factor = last.v / first.v
  return factor >= 0.5 && factor <= 2 ? (factor - 1) * 100 : null
}

/** Stats dark do chart pra ETF (não existe DRE/valuation de empresa). */
function buildEtfChartStats(e: EtfInfo | null, series: SeriesPoint[]): AcaoStatRow[] {
  if (!e) return []
  const rows: AcaoStatRow[] = []
  const change12m = etfChange12m(e, series)
  if (change12m != null) rows.push({ l: 'Variação 12 meses', v: pctFmt(change12m) })
  if (e.shareholders != null) rows.push({ l: 'Cotistas', v: nf0.format(e.shareholders) })
  if (e.volume != null) rows.push({ l: 'Volume diário', v: moneyBig(e.volume, 2) })
  if (e.lotSize != null) rows.push({ l: 'Lote padrão', v: nf0.format(e.lotSize) })
  if (e.isin) rows.push({ l: 'ISIN', v: e.isin })
  if (e.startDate) rows.push({ l: 'Início do fundo', v: e.startDate })
  return rows.slice(0, 7)
}

/** Seção "O fundo" (no lugar dos fundamentos de empresa, que ETF não tem). */
function buildEtfFundInfo(e: EtfInfo | null): AcaoFundInfoVM | null {
  if (!e) return null
  const rows: AcaoStatRow[] = []
  if (e.bookName) rows.push({ l: 'Nome de pregão', v: e.bookName })
  if (e.market) rows.push({ l: 'Mercado', v: e.market })
  if (e.cnpj) rows.push({ l: 'CNPJ', v: e.cnpj })
  if (e.startDate) rows.push({ l: 'Início do fundo', v: e.startDate })
  if (e.isin) rows.push({ l: 'Código ISIN', v: e.isin })
  if (!rows.length) return null
  return {
    heading: ['O fundo', 'por dentro.'],
    sub: 'Dados cadastrais do fundo na B3',
    rows,
  }
}

/* ————— Raio-X de ETF (carteira CVM + taxas em cascata + correlação) ————— */

const XRAY_TYPE_LABEL: Record<string, string> = {
  acao: 'Ações',
  acao_us: 'Ações EUA',
  bdr: 'BDRs',
  etf_b3: 'ETFs',
  etf_us: 'ETFs EUA',
  fundo_cota: 'Fundos',
  fundo_exterior: 'Fundos no exterior',
  exterior: 'Exterior',
  titulo_publico: 'Títulos públicos',
  caixa: 'Caixa',
  derivativo: 'Derivativos',
  ajuste: 'Ajustes',
  confidencial: 'Confidencial',
  outro: 'Outros',
}

const XRAY_TYPE_COLOR: Record<string, string> = {
  acao: 'var(--nu-alloc-stock)',
  acao_us: 'var(--nu-alloc-stock)',
  bdr: 'var(--nu-alloc-stock)',
  etf_b3: 'var(--nu-alloc-fii)',
  etf_us: 'var(--nu-alloc-fii)',
  fundo_cota: 'var(--nu-alloc-fii)',
  fundo_exterior: 'var(--nu-alloc-crypto)',
  exterior: 'var(--nu-alloc-crypto)',
  titulo_publico: 'var(--nu-alloc-fixed)',
  caixa: 'var(--nu-alloc-cash)',
}

const XRAY_SECTOR_PALETTE = [
  'var(--nu-alloc-stock)',
  'var(--nu-alloc-fixed)',
  'var(--nu-alloc-crypto)',
  'var(--nu-alloc-fii)',
  'var(--nu-alloc-cash)',
] as const

const XRAY_MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'] as const

/** '2026-07-31' → 'Carteira de julho/2026 · CVM'. */
function xrayAsOfLabel(asOf: string): string {
  const m = asOf.match(/^(\d{4})-(\d{2})/)
  if (!m) return `Carteira de ${asOf} · CVM`
  const mes = XRAY_MESES[Number(m[2]) - 1] ?? m[2]
  return `Carteira de ${mes}/${m[1]} · CVM`
}

/** Régua da taxa efetiva total (% a.a.) — cortes fixos, zero LLM. */
function tagFee(total: number): AcaoTag {
  if (total <= 0.3) return { text: 'Baixa pro mercado BR', variant: 'green' }
  if (total <= 0.7) return { text: 'Na média do mercado', variant: 'gray' }
  return { text: 'Acima da média', variant: 'amber' }
}

/** Régua de correlação: |c|≥0,8 anda junto; <0,5 diversifica de verdade. */
function tagCorr(c: number): AcaoTag {
  const a = Math.abs(c)
  if (a >= 0.8) return { text: 'Anda junto', variant: 'gray' }
  if (a >= 0.5) return { text: 'Correlação média', variant: 'amber' }
  return { text: 'Diversifica', variant: 'green' }
}

function xraySegs(entries: { label: string; weight: number }[], colorOf: (label: string, i: number) => string): EtfXraySeg[] {
  return entries
    .filter((e) => e.weight > 0.0005)
    .map((e, i) => ({
      label: e.label,
      pct: Math.max(0.6, e.weight * 100),
      pctLabel: `${nf1.format(e.weight * 100)}%`,
      color: colorOf(e.label, i),
    }))
}

function xrayCorrRows(x: EtfXrayApi, period: string): EtfXrayCorrRow[] {
  return x.correlations.benchmarks
    .filter((b) => b.period === period)
    .sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr))
    .slice(0, 8)
    .map((b) => ({
      symbol: b.symbol,
      corr: b.corr,
      magPct: Math.min(100, Math.abs(b.corr) * 100),
      neg: b.corr < 0,
      corrLabel: nf2.format(b.corr),
      tag: tagCorr(b.corr),
    }))
}

function buildEtfXray(x: EtfXrayApi | null, fundInfo: AcaoFundInfoVM | null): AcaoEtfXrayVM | null {
  if (!x) return null

  const typeLabel = (t: string) => XRAY_TYPE_LABEL[t] ?? t
  const typeColor = (t: string) => XRAY_TYPE_COLOR[t] ?? 'var(--nu-alloc-cash)'

  // Banda 1 — composição: barra por tipo + top-5 (lista completa no modal).
  const compBar = xraySegs(
    x.composition.groups.map((g) => ({ label: typeLabel(g.type), weight: g.weight })),
    (_, i) => typeColor(x.composition.groups[i]?.type ?? 'outro'),
  )
  const holdings: EtfXrayRow[] = x.composition.holdings
    .filter((h) => h.weight != null && h.weight > 0)
    .map((h, i) => ({
      rank: i + 1,
      ticker: h.ticker,
      name: h.name ?? h.ticker ?? '—',
      typeLabel: typeLabel(h.type),
      pct: (h.weight ?? 0) * 100,
      pctLabel: `${nf2.format((h.weight ?? 0) * 100)}%`,
      via: [],
    }))
  const top = holdings.slice(0, 5)
  const top5Pct = top.reduce((a, h) => a + h.pct, 0)
  const subLine = top.length >= 5
    ? `${x.composition.total_positions} posições reportadas à CVM. As cinco maiores são ${nf0.format(top5Pct)}% do fundo.`
    : `${x.composition.total_positions} posições reportadas à CVM.`

  // Modal — exposição look-through (atravessa ETFs aninhados; "via NASD11").
  const sectorBar = xraySegs(
    x.exposure.by_sector.slice(0, 6).map((s) => ({ label: s.sector, weight: s.weight })),
    (_, i) => XRAY_SECTOR_PALETTE[i % XRAY_SECTOR_PALETTE.length]!,
  )
  const mapAsset = (a: { ticker: string | null, name: string | null, type: string, weight: number, via: string[] }, i: number): EtfXrayRow => ({
    rank: i + 1,
    ticker: a.ticker,
    name: a.name ?? a.ticker ?? '—',
    typeLabel: typeLabel(a.type),
    pct: a.weight * 100,
    pctLabel: `${nf2.format(a.weight * 100)}%`,
    via: a.via ?? [],
  })
  const topAssets: EtfXrayRow[] = x.exposure.top_assets
    .filter((a) => a.weight > 0.001)
    .slice(0, 10)
    .map(mapAsset)
  // Consolidada COMPLETA. Cache antigo do CDN (até 1h após o deploy do
  // backend) ainda não manda `assets`/`tree` — cai pro top_assets e árvore
  // vazia em vez de quebrar o modal.
  const assetsAll: EtfXrayRow[] = (x.exposure.assets ?? x.exposure.top_assets)
    .filter((a) => a.weight > 0.0005)
    .map(mapAsset)
  const tree = (x.tree ?? []).map(mapTreeNode)

  // Banda 2 — custos: cards (taxa, custo efetivo, "10 anos") + taxa-sobre-taxa.
  const feeCards: AcaoMetricCard[] = []
  if (x.fees.management_fee != null) {
    feeCards.push({
      kind: 'metric',
      label: 'Taxa de administração',
      value: `${nf2.format(x.fees.management_fee)}% a.a.`,
      tag: null,
    })
  }
  if (x.fees.total_expense_ratio != null) {
    feeCards.push({
      kind: 'metric',
      label: 'Custo efetivo total',
      value: `${nf2.format(x.fees.total_expense_ratio)}% a.a.`,
      tag: tagFee(x.fees.total_expense_ratio),
    })
    // R$ 10 mil × 10 anos × taxa, sem compostos — número que o leitor sente.
    feeCards.push({
      kind: 'metric',
      label: 'Em 10 anos, R$ 10 mil pagam',
      value: `~R$ ${nf0.format((x.fees.total_expense_ratio / 100) * 10_000 * 10)}`,
      tag: null,
    })
  }
  const feeNested: AcaoStatRow[] = x.fees.nested.map((n) => ({
    // "via" só quando difere do fundo (num ETF aninhado direto, fund === via).
    l: `${n.fund}${n.via !== x.ticker && n.via !== n.fund ? ` · via ${n.via}` : ''} (${nf1.format(n.weight * 100)}% × ${nf2.format(n.fee)}%)`,
    v: `+${nf2.format(n.contribution)}%`,
  }))
  const feeNote = x.fees.unmapped_fund_weight > 0.001
    ? `${nf1.format(x.fees.unmapped_fund_weight * 100)}% da carteira está em fundos sem taxa mapeada — o custo efetivo é um piso, não o total.`
    : null

  // Correlação: 4 linhas de 12m na página; tudo (12m/90d + matriz) no modal.
  const rows12 = xrayCorrRows(x, '12m')
  const rows90 = xrayCorrRows(x, '90d')
  const matrix12: EtfXrayMatrix | null = x.correlations.holdings_matrix.find((m) => m.period === '12m') ?? null
  const matrix90: EtfXrayMatrix | null = x.correlations.holdings_matrix.find((m) => m.period === '90d') ?? null

  // Staleness: carteira mais velha que ~3 meses ganha aviso explícito.
  const asOfMs = Date.parse(`${x.as_of}T12:00:00-03:00`)
  const stale = Number.isFinite(asOfMs) && Date.now() - asOfMs > 100 * 24 * 3600 * 1000

  return {
    asOfLabel: xrayAsOfLabel(x.as_of),
    stale,
    subLine,
    compBar,
    top,
    moreCount: Math.max(0, holdings.length - top.length),
    totalPositions: x.composition.total_positions,
    feeCards,
    feeNested,
    feeNote,
    pageCorr: rows12.slice(0, 4),
    modal: {
      holdings,
      sectorBar,
      topAssets,
      assetsAll,
      tree,
      rows12,
      rows90,
      matrix12,
      matrix90,
      fundInfoRows: fundInfo?.rows ?? [],
      warnings: x.profile?.warnings ?? [],
    },
  }
}

/**
 * Nó da árvore de look-through pro template: weight é fração do PAI,
 * eff_weight fração do ETF raiz — os dois viram percentuais prontos.
 * As três situações sem filhos ganham a nota honesta em vez de fingir folha.
 */
function mapTreeNode(n: EtfXrayTreeNodeApi): EtfXrayTreeNodeVM {
  const children = (n.children ?? []).map(mapTreeNode)
  const pctLocal = n.weight !== null ? n.weight * 100 : null
  const pctEff = n.eff_weight !== null ? n.eff_weight * 100 : null
  let note: string | null = null
  if (n.cycle) note = 'já aparece acima na árvore'
  else if (n.unopened) note = 'carteira ainda não ingerida'
  else if ((n.type === 'fundo_cota' || n.type === 'fundo_exterior') && !children.length) note = 'fundo fora da bolsa — não abre'
  return {
    key: n.key,
    ticker: n.ticker,
    name: n.name ?? n.ticker ?? '—',
    typeLabel: XRAY_TYPE_LABEL[n.type] ?? 'Outros',
    pctLocal,
    pctLocalLabel: pctLocal !== null ? `${nf2.format(pctLocal)}%` : '—',
    pctEff,
    pctEffLabel: pctEff !== null && pctEff !== pctLocal ? `${nf2.format(pctEff)}% do ETF` : null,
    expandable: children.length > 0,
    note,
    children,
  }
}

/* ————— builders por seção ————— */

function buildHero(profile: TickerProfileApi, name: string): AcaoHeroVM {
  const price = profile.market_price
  const chg = profile.change_percent
  // Moeda vem do DADO (us0): USD nos ativos americanos, R$ no resto.
  const cur = profile.currency === 'USD' ? 'US$' : 'R$'
  let changeLine: string | null = null
  let metaLine = ''
  if (price != null && chg != null) {
    const prev = price / (1 + chg / 100)
    const abs = Math.abs(price - prev)
    changeLine = `${chg < 0 ? '-' : '+'}${cur} ${nf2.format(abs)} (${nf2.format(Math.abs(chg))}%) hoje`
    metaLine = `fech. anterior ${cur} ${nf2.format(prev)}`
  }
  // price_at vem 'd/m' SEM ano (gotcha) — usamos como veio, sem parsear.
  if (profile.price_at) metaLine += `${metaLine ? ' · ' : ''}atualizado em ${profile.price_at}`
  if (profile.currency === 'USD') {
    metaLine += `${metaLine ? ' · ' : ''}preço de referência derivado do BDR e do câmbio`
  }
  return {
    companyLine: `${name} · ${profile.ticker}`,
    ticker: profile.ticker,
    priceFmt: price != null ? `${cur} ${nf2.format(price)}` : '—',
    changeLine,
    dir: dirOf(chg ?? 0),
    metaLine,
    // Sem isso o badge cai no default 'B3' — mentira pra ativo americano.
    exchangeLabel: profile.currency === 'USD' ? 'EUA' : undefined,
  }
}

/** 'YYYY-MM-DD' (aceita timestamp ISO), ou null. */
function isoDateOrNull(v: string | null | undefined): string | null {
  const d = typeof v === 'string' ? v.slice(0, 10) : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null
}

function toSeries(data: PricePointApi[] | undefined | null): SeriesPoint[] {
  return (data ?? [])
    .filter((p) => p.market_price != null && !!p.price_at)
    .map((p) => ({ t: p.price_at, v: p.market_price as number }))
}

function buildChartStats(f: Fund | null): AcaoStatRow[] {
  if (!f) return []
  const cur = f.isBdr ? 'US$' : 'R$'
  const rows: AcaoStatRow[] = []
  if (f.marketCap != null) rows.push({ l: 'Valor de Mercado', v: moneyBig(f.marketCap, 2) })
  if (f.dy != null) rows.push({ l: 'Dividend Yield', v: `${nf2.format(f.dy)}%` })
  if (f.pl != null) rows.push({ l: 'P/L (TTM)', v: nf2.format(f.pl) })
  if (f.roe != null) rows.push({ l: 'ROE', v: `${nf1.format(f.roe)}%` })
  if (f.revenue != null) rows.push({ l: 'Receita (12M)', v: moneyBig(f.revenue, 2, cur) })
  if (f.profit != null) rows.push({ l: 'Lucro Líquido (12M)', v: moneyBig(f.profit, 2, cur) })
  if (f.netMargin != null) rows.push({ l: 'Margem Líquida', v: `${nf1.format(f.netMargin)}%` })
  if (f.isFii) {
    if (f.fiiVpCota != null) rows.push({ l: 'VP por cota', v: `R$ ${nf2.format(f.fiiVpCota)}` })
    if (f.pvp != null) rows.push({ l: 'P/VP', v: nf2.format(f.pvp) })
    if (f.fiiIfixShare != null) rows.push({ l: 'Participação no IFIX', v: `${nf2.format(f.fiiIfixShare)}%` })
  }
  return rows.slice(0, 7)
}

/** Perfil qualitativo (5 dimensões) — mesmas regras das tags dos cards. */
function buildPerfil(f: Fund | null): AcaoPerfilRow[] {
  if (!f) return []
  const rows: AcaoPerfilRow[] = []
  if (f.roe != null) {
    rows.push({ name: 'Rentabilidade', tag: f.roe >= 20 ? T('Excelente', 'green') : f.roe >= 10 ? T('Boa', 'green') : f.roe >= 5 ? T('Moderada', 'amber') : T('Fraca', 'gray') })
  }
  if (f.revCagr != null) {
    rows.push({ name: 'Crescimento', tag: f.revCagr >= 15 ? T('Forte', 'green') : f.revCagr >= 8 ? T('Moderado', 'amber') : f.revCagr >= 0 ? T('Baixo', 'gray') : T('Em queda', 'gray') })
  }
  if (f.debtEbitda != null) rows.push({ name: 'Endividamento', tag: tagDebt(f.debtEbitda) })
  if (f.pl != null) rows.push({ name: 'Valuation', tag: tagPl(f.pl) })
  else if (f.pvp != null) rows.push({ name: 'Valuation', tag: tagPvp(f.pvp, f.isFii) })
  if (f.dy != null) rows.push({ name: 'Dividendo', tag: tagDy(f.dy, f.isFii) })
  return rows
}

/** Grid de fundamentos com os 2 AI insight cards nas posições 4 e 9 (design). */
function buildFundCards(f: Fund | null, ticker: string): AcaoFundCard[] {
  if (!f) return []
  const cur = f.isBdr ? 'US$' : 'R$'
  const m: AcaoMetricCard[] = []
  const push = (label: string, value: string, tag: AcaoTag | null) => m.push({ kind: 'metric', label, value, tag })
  if (f.roe != null) push('ROE', `${nf1.format(f.roe)}%`, tagRoe(f.roe))
  if (f.dy != null) push('Dividend Yield', `${nf2.format(f.dy)}%`, tagDy(f.dy, f.isFii))
  if (f.pl != null) push('P/L', nf2.format(f.pl), tagPl(f.pl))
  if (f.pvp != null) push('P/VP', nf2.format(f.pvp), tagPvp(f.pvp, f.isFii))
  if (f.ev != null && f.ev > 0) push('EV/EBITDA', nf2.format(f.ev), tagEv(f.ev))
  if (f.netMargin != null) push('Margem Líquida', `${nf1.format(f.netMargin)}%`, tagMargin(f.netMargin))
  if (f.revenue != null) push('Receita (12M)', moneyBig(f.revenue, 1, cur), f.revCagr != null ? tagGrowth(f.revCagr) : null)
  if (f.profit != null) push('Lucro Líquido (12M)', moneyBig(f.profit, 1, cur), f.earnGrowth != null ? tagGrowth(f.earnGrowth) : null)
  if (f.debtEbitda != null) push('Dív. Líq./EBITDA', nf2.format(f.debtEbitda), tagDebt(f.debtEbitda))
  if (f.roa != null) push('ROA', `${nf1.format(f.roa)}%`, tagRoa(f.roa))
  if (f.isFii) {
    if (f.fiiVpCota != null) push('VP por cota', `R$ ${nf2.format(f.fiiVpCota)}`, null)
    if (f.fiiRendaMedia != null) push('Renda média/cota (24M)', `R$ ${nf2.format(f.fiiRendaMedia)}`, null)
    if (f.fiiIfixShare != null) push('Participação no IFIX', `${nf2.format(f.fiiIfixShare)}%`, null)
    if (f.fiiCotistas != null) push('Cotistas', nf0.format(f.fiiCotistas), null)
  }

  // Insights determinísticos (texto por faixa; sem chamada de LLM).
  const cards: AcaoFundCard[] = [...m]
  const insights: AcaoFundCard[] = []
  // BDR: card informativo curto no lugar de comparação com "média da B3"
  // (o papel espelha uma empresa estrangeira; comparar com a B3 seria mentir).
  if (f.isBdr) {
    insights.push({
      kind: 'insight',
      insight: `${ticker} é um BDR: um recibo negociado na B3 que representa ações de uma empresa estrangeira. Os resultados vêm da matriz, em dólar.`,
      cta: 'Perguntar sobre BDRs',
      href: '/busca',
    })
  }
  if (f.pl != null && f.pl > 0) {
    const text = f.pl <= 6
      ? `O P/L de ${nf2.format(f.pl)} está entre os mais baixos ${f.isBdr ? 'do mercado' : 'da bolsa'}: o mercado paga menos de ${Math.ceil(f.pl)} anos de lucro pela empresa.`
      : f.pl <= 15
        ? `O P/L de ${nf2.format(f.pl)} está em linha com a média ${f.isBdr ? 'histórica do mercado' : 'da B3'}: o preço acompanha os fundamentos, sem prêmio nem desconto relevante.`
        : `O P/L de ${nf2.format(f.pl)} embute expectativa alta de crescimento: o mercado paga caro pelos lucros futuros de ${ticker}.`
    insights.push({ kind: 'insight', insight: text, cta: 'Perguntar sobre o valuation', href: '/busca' })
  } else if (f.pvp != null) {
    const text = f.pvp <= 0.95
      ? `O P/VP de ${nf2.format(f.pvp)} indica que a cota negocia abaixo do valor patrimonial: cada R$ 1,00 de patrimônio custa R$ ${nf2.format(f.pvp)}.`
      : `O P/VP de ${nf2.format(f.pvp)} mostra a cota negociando ${f.pvp <= 1.05 ? 'colada no' : 'acima do'} valor patrimonial do fundo.`
    insights.push({ kind: 'insight', insight: text, cta: 'Perguntar sobre o valuation', href: '/busca' })
  }
  if (f.dy != null) {
    // DY 0 = histórico sem provento de renda com data-com em 12 meses (resolveSiteDy)
    const text = f.dy === 0
      ? `${ticker} não distribuiu ${f.isFii ? 'rendimentos' : 'proventos'} com data-com nos últimos 12 meses, então o DY de 12 meses é zero.`
      : f.dy >= 6 && f.fcf != null && f.fcf > 0
      ? `O DY de ${nf2.format(f.dy)}% vem acompanhado de ${moneyBig(f.fcf, 1, cur)} em caixa livre, o fluxo que banca os proventos.`
      : f.dy >= 6
        ? `O DY de ${nf2.format(f.dy)}% coloca ${ticker} entre as boas pagadoras de proventos${f.isBdr ? '' : ' da B3'}.`
        : `O DY de ${nf2.format(f.dy)}% fica abaixo das grandes pagadoras: aqui o retorno depende mais do preço do que dos proventos.`
    insights.push({ kind: 'insight', insight: text, cta: 'Analisar os dividendos', href: '/busca' })
  }
  // splice(4) e splice(9) — posições exatas do design (índices do array final).
  if (insights[0]) cards.splice(Math.min(4, cards.length), 0, insights[0])
  if (insights[1]) cards.splice(Math.min(9, cards.length), 0, insights[1])
  return cards
}

/**
 * Teses que citam o ticker. Limite honesto: o card da lista só expõe os
 * primeiros ~4-5 tickers (`extraTickers` esconde o resto) — matching é feito
 * sobre os visíveis; buscar os 9 details sempre custaria 9 requests por page
 * view. O detail é buscado SÓ pras teses que deram match (papel do ativo).
 */
async function buildTheses(base: string, ticker: string, list: ThesisCardApi[]): Promise<AcaoThesisRowVM[]> {
  const matched = list.filter((t) => (t.tickers ?? []).includes(ticker)).slice(0, 4)
  if (!matched.length) return []
  const details = await Promise.allSettled(matched.map((t) => acaoFetchThesisDetail(base, t.id)))
  return matched.map((t, i) => {
    const d = details[i]
    let roleStrong = ''
    let roleRest = ''
    const detail = d?.status === 'fulfilled' ? d.value?.data : null
    const company = detail?.companies?.find((c) => (c.ticker ?? '').toUpperCase() === ticker)
    if (company?.role) {
      roleStrong = company.role
      const rest = firstSentence(company.rationale, 150)
      roleRest = rest ? `, ${rest.charAt(0).toLowerCase()}${rest.slice(1)}` : ''
    } else {
      roleRest = firstSentence(t.description, 150) ?? ''
    }
    return {
      slug: t.id,
      title: t.title,
      image: teseCover(t.image),
      conviction: t.conviction,
      roleStrong,
      roleRest,
    }
  })
}

/**
 * Seção de dividendos do /asset. Soma, contagem, barras e DY saem de
 * app/utils/proventos.ts, a MESMA leitura do /dividendos: a data-com decide a
 * janela, só renda entra na soma, a amortização aparece à parte, e o DY é o do
 * site (o mesmo do card de fundamentos, dos insights e da meta description).
 */
function buildDividends(rows: ProventoRow[], ticker: string, isFii: boolean, dy: SiteDy): AcaoDividendsVM | null {
  if (!rows.length) return null
  const today = spISODate()
  // Ativo que não paga há 24 meses não ganha a seção (esconder > seed errado).
  const cutoff24 = isoMinusDays(today, 730)
  if (!rows.some((r) => r.date >= cutoff24 && r.date <= today)) return null

  const unit = isFii ? 'cota' : 'ação'
  const w = proventos12m(rows, today)
  const statRows: AcaoStatRow[] = []
  if (dy.value != null) statRows.push({ l: 'Dividend Yield (12M)', v: `${nf2.format(dy.value)}%` })
  // Amortização devolve capital: fora da soma e do DY, mas à vista (BRIP11,
  // RBLG11). Payout não vem em nenhum endpoint público hoje: linha OMITIDA.
  if (w.capital12 > 0) statRows.push({ l: `Amortização por ${unit} (12M)`, v: `R$ ${nf2.format(w.capital12)}` })
  // Cadência pelos proventos de RENDA distintos (um por data-com): renda e
  // amortização da mesma data-com chegam em linhas separadas (Backend #54).
  const freq = proventosFrequency(w.events12)
  if (freq) statRows.push({ l: 'Frequência', v: freq })
  // Só parcela com data de pagamento é "próxima"; a com pagamento a definir
  // (#54) vira "a definir", nunca a data-com (proventosAgenda).
  const agenda = proventosAgenda(rows, today)
  if (agenda.next) statRows.push({ l: 'Próximo pagamento', v: dateShortPt(agenda.next) })
  else if (agenda.pendingUpcoming) statRows.push({ l: 'Próximo pagamento', v: 'a definir' })

  // Barras por ano (design: ano corrente = últimos 12 meses, footnote explica).
  // Quem só devolveu capital em 12 meses mostra a amortização, com rodapé
  // próprio (a mesma regra do /dividendos: proventosChart).
  const chart = proventosChart(rows, w, isFii, today)
  if (!chart.bars.length) return null

  const dyv = dy.value
  // DY oficial, soma de 12 meses e cotação que não fecham entre si (±5%): a
  // soma sai do subtítulo (a cotação está no topo da página e o DY aqui ao
  // lado) e as barras ficam marcadas como valor pago, sem ajuste.
  const openCalc = dyv != null && dyv > 0 && w.income12 > 0 && !dy.sumMatches
  const heading: [string, string] = dyv != null && dyv >= 6
    ? ['Uma máquina', 'de dividendos.']
    : dyv != null && dyv >= 2
      ? ['Os dividendos', `de ${ticker}.`]
      : ['Os proventos', `de ${ticker}.`]

  return {
    heading,
    subtitle: w.income12 > 0
      ? openCalc
        ? `${w.events12} ${isFii ? (w.events12 === 1 ? 'rendimento' : 'rendimentos') : w.events12 === 1 ? 'provento' : 'proventos'} nos últimos 12 meses`
        : `R$ ${nf2.format(w.income12)} por ${unit} nos últimos 12 meses`
      : w.capital12 > 0
        ? `Sem ${isFii ? 'rendimentos' : 'dividendos'} nos últimos 12 meses, e R$ ${nf2.format(w.capital12)} por ${unit} em amortização`
        : 'Sem pagamentos nos últimos 12 meses',
    rows: statRows,
    bars: chart.bars,
    barsNote: openCalc ? `${chart.note} · valores como foram pagos, sem ajuste` : chart.note,
    sum12: w.income12,
  }
}

function buildScore(scoreRows: ScoreRowApi[], ticker: string, f: Fund | null): AcaoScoreVM | null {
  const idx = scoreRows.findIndex((r) => r.ticker === ticker)
  if (idx < 0 || scoreRows[idx]?.redentia_score == null) return null
  // O score cru do backend (0-10) é COMPRIMIDO — o topo real do universo fica
  // em ~4,4 — então ×10 daria "37/100" pro 5º melhor papel da bolsa, contradizendo
  // o pill. O número /100 exibido é o PERCENTIL no universo ranqueado (mesma
  // régua do pill): 93/100 = melhor que 93% do universo coberto.
  const pctile = (idx + 1) / scoreRows.length
  const score100 = Math.min(99, Math.max(1, Math.round((1 - idx / scoreRows.length) * 100)))
  const pill: AcaoTag = pctile <= 0.1 ? T('Excelente', 'green') : pctile <= 0.3 ? T('Bom', 'green') : pctile <= 0.6 ? T('Moderado', 'amber') : T('Fraco', 'gray')
  const subScores: { name: string; value: number }[] = []
  if (f) {
    if (f.roe != null) subScores.push({ name: 'Rentabilidade', value: scaleLin(f.roe, 0, 30) })
    if (f.pl != null && f.pl > 0) subScores.push({ name: 'Valuation', value: scaleLin(f.pl, 25, 3) })
    if (f.dy != null) subScores.push({ name: 'Dividendos', value: scaleLin(f.dy, 0, 12) })
    if (f.debtEbitda != null) subScores.push({ name: 'Endividamento', value: scaleLin(f.debtEbitda, 4, 0) })
  }
  return { score100, pill, subScores }
}

const REC_MAP: Record<string, { label: string; variant: AcaoTag['variant'] }> = {
  strong_buy: { label: 'COMPRA FORTE', variant: 'green' },
  buy: { label: 'COMPRAR', variant: 'green' },
  hold: { label: 'MANTER', variant: 'amber' },
  neutral: { label: 'MANTER', variant: 'amber' },
  underperform: { label: 'ABAIXO DO MERCADO', variant: 'gray' },
  sell: { label: 'VENDER', variant: 'gray' },
  strong_sell: { label: 'VENDER', variant: 'gray' },
}

function buildConsensus(c: ConsensusApi | null): AcaoConsensusVM | null {
  // Runtime real: não coberto = 200 com coverage:'none' e campos null
  // (a doc fala em 204; tratamos os dois) → card escondido, grid vira 2.
  if (!c || c.coverage === 'none' || !c.recommendation) return null
  const close = c.price?.close
  const avg = c.price?.target_average
  if (close == null || avg == null) return null
  const low = c.price?.target_low ?? close
  const high = c.price?.target_high ?? avg
  const upside = c.upside_percent ?? ((avg / close) - 1) * 100

  const rec = REC_MAP[c.recommendation.toLowerCase()] ?? { label: c.recommendation.toUpperCase(), variant: 'gray' as const }
  const lo = Math.min(close, low)
  const hi = Math.max(high, close)
  const pad = (hi - lo) * 0.12 || 1
  const dLo = lo - pad
  const dHi = hi + pad
  const pos = (v: number) => Math.round(((v - dLo) / (dHi - dLo)) * 1000) / 10

  const n = c.breakdown?.analyst_count
  const bull = c.breakdown?.bullish
  const neut = c.breakdown?.neutral
  let footnote: string
  if (bull != null && neut != null) {
    footnote = `${bull} compras e ${neut} neutros entre as casas que cobrem o papel.`
  } else if (c.price?.target_low != null) {
    const lowUp = ((c.price.target_low / close) - 1) * 100
    footnote = lowUp > 0
      ? `Até o alvo mais conservador, R$ ${nf2.format(c.price.target_low)}, ainda há ${nf1.format(lowUp)}% de espaço sobre o preço atual.`
      : `O alvo mais conservador, R$ ${nf2.format(c.price.target_low)}, fica ${nf1.format(Math.abs(lowUp))}% abaixo do preço atual.`
  } else {
    footnote = 'Consenso agregado das casas que cobrem o papel.'
  }

  return {
    pill: rec.label,
    pillVariant: rec.variant,
    upsideFmt: pctFmt(upside),
    subLine: n != null ? `de upside até o alvo médio · ${n} analistas` : 'de upside até o alvo médio',
    rangeBar: {
      fromPct: pos(low),
      widthPct: Math.max(pos(high) - pos(low), 4),
      targetPct: pos(avg),
      dotPct: pos(close),
    },
    labels: { current: `R$ ${nf2.format(close)}`, avg: `R$ ${nf2.format(avg)}`, high: `R$ ${nf2.format(high)}` },
    footnote,
  }
}

/** Bullets da Leitura da IA: 1ª frase do editorial + regras sobre fundamentos. */
function buildAiRead(f: Fund | null, editorial: EditorialApi | null, ticker: string): AcaoAiReadVM | null {
  const pros: string[] = []
  const cons: string[] = []
  const proEd = firstSentence(editorial?.thesis_pros, 110)
  if (proEd) pros.push(proEd)
  if (f) {
    if (f.roe != null && f.roe >= 15) pros.push(`Rentabilidade ${f.roe >= 20 ? 'excelente' : 'sólida'}, ROE de ${nf1.format(f.roe)}%`)
    if (f.dy != null && f.dy >= 5) pros.push(`Dividend yield de ${nf2.format(f.dy)}%, acima da média da bolsa`)
    if (f.pl != null && f.pl > 0 && f.pl <= 8) pros.push(`Múltiplos atrativos, P/L ${nf2.format(f.pl)}${f.ev != null && f.ev > 0 ? ` e EV/EBITDA ${nf2.format(f.ev)}` : ''}`)
    if (f.netMargin != null && f.netMargin >= 15) pros.push(`Margem líquida de ${nf1.format(f.netMargin)}%`)
    if (f.revCagr != null && f.revCagr >= 10) pros.push(`Receita crescendo ${nf1.format(f.revCagr)}% a.a. em 5 anos`)
    if (f.fcf != null && f.fcf > 0 && f.dy != null && f.dy >= 4) pros.push(`Caixa livre de ${moneyBig(f.fcf, 1, f.isBdr ? 'US$' : 'R$')} cobre os proventos`)
  }
  const conEd = firstSentence(editorial?.thesis_cons, 110)
  if (conEd) cons.push(conEd)
  if (f) {
    if (f.debtEbitda != null && f.debtEbitda > 2) cons.push(`Alavancagem elevada, dívida líquida de ${nf2.format(f.debtEbitda)}× o EBITDA`)
    if (f.pl != null && f.pl > 15) cons.push(`Valuation esticado, P/L ${nf2.format(f.pl)}`)
    if (f.dy != null && f.dy < 2) cons.push(f.dy === 0 ? 'Sem proventos nos últimos 12 meses' : `Dividendos baixos, DY de ${nf2.format(f.dy)}%`)
    if (f.revCagr != null && f.revCagr < 0) cons.push(`Receita encolhendo ${nf1.format(Math.abs(f.revCagr))}% a.a. em 5 anos`)
    if (f.earnGrowth != null && f.earnGrowth < 0) cons.push(`Lucro em queda, ${nf1.format(Math.abs(f.earnGrowth))}% a.a.`)
    if (f.ytd != null && f.ytd < -10) cons.push(`${ticker} cai ${nf1.format(Math.abs(f.ytd))}% no ano`)
    if (cons.length < 2 && f.revCagr != null && f.revCagr < 8) cons.push('Crescimento moderado no longo prazo')
  }
  if (pros.length < 2 || cons.length < 1) return null
  return { pros: pros.slice(0, 3), cons: cons.slice(0, 3) }
}

function buildNews(items: NewsApi[], profile: Pick<TickerProfileApi, 'ticker' | 'change_percent'>, series12: SeriesPoint[]): AcaoPayload['news'] {
  const usable = items.filter((n) => !!n.title).slice(0, 4)
  if (usable.length < 2) return null
  const today = localISODate()
  const ticker = profile.ticker
  // Impacto do ticker no dia da notícia: derivado da série 12M (fechamento vs
  // fechamento anterior no pregão da publicação); notícia de HOJE usa o
  // change_percent do snapshot. Sem ponto na série → badge omitido.
  const impactAt = (publishedAt: string | null): { text: string; dir: NuDir } | null => {
    if (!publishedAt) return null
    const day = publishedAt.slice(0, 10)
    if (day === today && profile.change_percent != null) {
      return { text: `${ticker} ${pctFmt(profile.change_percent)}`, dir: dirOf(profile.change_percent) }
    }
    let i = -1
    for (let k = series12.length - 1; k >= 0; k--) {
      if (series12[k]!.t <= day) { i = k; break }
    }
    if (i < 1) return null
    const prev = series12[i - 1]!.v
    if (!prev) return null
    const pct = ((series12[i]!.v - prev) / prev) * 100
    return { text: `${ticker} ${pctFmt(pct)}`, dir: dirOf(pct) }
  }
  const sourceLine = (n: NewsApi) => {
    const label = sourcePretty(n.source)
    const when = relTime(n.published_at)
    return when ? `${label} · ${when}` : label
  }
  const first = usable[0]!
  return {
    featured: {
      href: '/noticias',
      badge: impactAt(first.published_at),
      source: sourceLine(first),
      title: first.title,
      dek: first.excerpt ?? '',
    },
    rows: usable.slice(1).map((n) => ({
      href: '/noticias',
      title: n.title,
      source: sourceLine(n),
      ticker: impactAt(n.published_at),
    })),
  }
}

/* ————— EDITORIAL ————— */

/**
 * Monta o bloco de prosa longa do ativo.
 *
 * O editorial já era buscado no SSR desde sempre (acaoFetchEditorial na
 * Promise.allSettled abaixo), mas o único consumo era `firstSentence(..., 110)`
 * em buildAiRead: 220 caracteres de ~2.150 palavras. `peers_comparison` e
 * `history_summary` nem chegavam ao frontend, porque faltavam no EditorialApi.
 * A FAQ existia SÓ dentro do JSON-LD, sem conteúdo visível correspondente, o
 * que além de desperdiçar 8 respostas escritas é emitir FAQPage sem lastro.
 *
 * Seção sem corpo não entra: página de ativo com H2 vazio é pior que página
 * sem H2, e a maior parte do balde "Rastreada mas não indexada" do Search
 * Console (1.708 URLs) é justamente /asset servindo 206 a 648 palavras.
 */
function buildEditorial(editorial: EditorialApi | null, name: string, isFii: boolean): AcaoEditorialVM | null {
  if (!editorial) return null

  const candidatas: { id: string; heading: string; body: string | null }[] = [
    { id: 'sobre', heading: `Sobre ${name}`, body: editorial.description },
    { id: 'tese', heading: 'A tese de investimento', body: editorial.thesis_pros },
    { id: 'riscos', heading: 'Os riscos', body: editorial.thesis_cons },
    { id: 'pares', heading: isFii ? 'Como se compara com outros fundos' : 'Como se compara com os pares', body: editorial.peers_comparison },
    { id: 'historia', heading: 'A história do papel', body: editorial.history_summary },
  ]

  const sections = candidatas
    .map((s) => ({ ...s, body: (s.body ?? '').trim() }))
    .filter((s): s is { id: string; heading: string; body: string } => s.body.length > 0)

  const faq = (editorial.faq_extended ?? [])
    .filter((q) => q.question && q.answer)
    .slice(0, 8)
    .map((q) => ({ q: q.question, a: q.answer }))

  if (!sections.length && !faq.length) return null

  return { sections, faq, generatedAt: editorial.generated_at }
}

/* ————— resumo factual (SSR) ————— */

function serieDoResumo(asset: SeriesPoint[], ibov: SeriesPoint[]): ResumoSerie | null {
  if (asset.length < 2) return null
  const a = asset[0]
  const b = asset[asset.length - 1]
  if (!a || !b || !(a.v > 0) || !Number.isFinite(b.v)) return null
  const de = a.t.slice(0, 10)
  const ate = b.t.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(de) || !/^\d{4}-\d{2}-\d{2}$/.test(ate)) return null
  let ibovVar: number | null = null
  const i0 = ibov[0]
  const i1 = ibov[ibov.length - 1]
  if (ibov.length >= 2 && i0 && i1 && i0.v > 0 && Number.isFinite(i1.v)) ibovVar = ((i1.v - i0.v) / i0.v) * 100
  return { de, ate, variacao: ((b.v - a.v) / a.v) * 100, ibov: ibovVar }
}

/**
 * Soma por ano-calendário, pela data-com (ou pelo pagamento, quando a API
 * não manda a data-com). O ano corrente é o que já houve nele, não os
 * últimos 12 meses — essa janela móvel fica na frase dos 12 meses.
 */
function anosPorDataCom(rows: readonly ProventoRow[], income: boolean, today: string): ResumoAno[] {
  const cy = Number(today.slice(0, 4))
  const byYear = new Map<string, number>()
  for (const r of rows) {
    if (r.income !== income || r.date > today) continue
    const y = r.date.slice(0, 4)
    if (!/^\d{4}$/.test(y)) continue
    byYear.set(y, (byYear.get(y) ?? 0) + r.rate)
  }
  const anos: ResumoAno[] = []
  for (let y = cy - 5; y <= cy; y++) {
    const valor = byYear.get(String(y))
    if (valor != null && valor > 0) anos.push({ ano: String(y), valor, corrente: y === cy })
  }
  return anos
}

function proventosDoResumo(rows: ProventoRow[] | null, isFii: boolean): ResumoProventos | null {
  if (!rows) return null
  const today = spISODate()
  const w = proventos12m(rows, today)
  const chart = proventosChart(rows, w, isFii, today)
  const agenda = proventosAgenda(rows, today)
  return {
    unidade: isFii ? 'cota' : 'ação',
    renda12: w.income12,
    eventos12: w.events12,
    capital12: w.capital12,
    frequencia: proventosFrequency(w.events12),
    proximo: agenda.next ? dateShortPt(agenda.next) : agenda.pendingUpcoming ? 'a definir' : null,
    anos: anosPorDataCom(rows, chart.kind !== 'capital', today),
    tipo: chart.kind,
  }
}

/** Uma FAQ só: as perguntas novas entram na editorial quando ela já existe. */
function faqUnica(editorial: AcaoEditorialVM | null, resumo: AcaoPayload['resumo']): void {
  if (!editorial?.faq.length || !resumo?.faq.length) return
  editorial.faq = fundirFaq(editorial.faq, resumo.faq)
  resumo.faq = []
  resumo.faqTitulo = null
}

function seoDeResumo(resumo: NonNullable<AcaoPayload['resumo']>): AcaoPayload['seo'] {
  return {
    title: resumo.title,
    description: resumo.description,
    faq: resumo.faq.map((f) => ({ question: f.q, answer: f.a })),
  }
}

const NUMEROS_RESUMO_VAZIOS: ResumoAtivoInput['numeros'] = {
  dy: null, pl: null, pvp: null, roe: null, margem: null, valorMercado: null,
  vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null,
}

/* ————— seed do design (PETR4) — só pra backend 100% offline ————— */

function seedSeries(): SeriesPoint[] {
  // Mesma geração do <script text/x-dc> do design: keyframes + mulberry32(20260711).
  let s = 20260711
  const rng = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const kf: [number, number][] = [[0, 43], [0.09, 45.6], [0.18, 48.9], [0.26, 47], [0.36, 41.4], [0.46, 35.3], [0.56, 30.2], [0.64, 28.4], [0.72, 33], [0.8, 39.4], [0.87, 42.8], [0.92, 40.2], [0.96, 37.3], [1, 38.25]]
  const interp = (fr: number) => {
    for (let i = 1; i < kf.length; i++) {
      const a = kf[i - 1]!, b = kf[i]!
      if (fr <= b[0]) return a[1] + (b[1] - a[1]) * ((fr - a[0]) / ((b[0] - a[0]) || 1))
    }
    return 38.25
  }
  const N = 150
  const t0 = Date.UTC(2025, 6, 11)
  const t1 = Date.UTC(2026, 6, 11)
  const pts: SeriesPoint[] = []
  for (let i = 0; i < N; i++) {
    const fr = i / (N - 1)
    pts.push({ t: new Date(t0 + (t1 - t0) * fr).toISOString().slice(0, 10), v: interp(fr) + (rng() - 0.5) * 0.7 })
  }
  pts[Math.round(0.18 * (N - 1))]!.v = 48.9
  pts[N - 1]!.v = 38.25
  return pts
}

function petr4Seed(): AcaoPayload {
  const g = (t: string): AcaoTag => T(t, 'green')
  const a = (t: string): AcaoTag => T(t, 'amber')
  const series = seedSeries()
  const first = series[0]!
  const last = series[series.length - 1]!
  const resumoSeed = montarResumoAtivo({
    ticker: 'PETR4',
    nome: 'Petrobras',
    kind: 'stock',
    setor: 'Energia',
    moeda: 'BRL',
    preco: 38.25,
    variacaoDia: 0.76,
    data: null,
    numeros: { ...NUMEROS_RESUMO_VAZIOS, dy: 6.95, pl: 4.55, pvp: 1.1, roe: 24.2, margem: 21.6, valorMercado: 493.2e9 },
    fonteIndicadores: 'dados da B3 e balanços',
    min52: null,
    max52: null,
    serie: null,
    setorMedia: null,
    proventos: {
      unidade: 'ação',
      renda12: 2.66,
      eventos12: 4,
      capital12: 0,
      frequencia: 'Trimestral',
      proximo: '21 ago 2026',
      anos: [
        { ano: '2021', valor: 2.1, corrente: false },
        { ano: '2022', valor: 6.84, corrente: false },
        { ano: '2023', valor: 4.25, corrente: false },
        { ano: '2024', valor: 2.91, corrente: false },
        { ano: '2025', valor: 2.52, corrente: false },
        { ano: '2026', valor: 2.66, corrente: true },
      ],
      tipo: 'renda',
    },
    etf: null,
    cripto: null,
    links: [
      { href: '/calculadora/preco-teto/PETR4', label: 'Preço teto de PETR4' },
      { href: '/dividendos/PETR4', label: 'Dividendos de PETR4' },
      { href: '/setor/energia', label: 'Setor energia' },
    ],
  })
  return {
    ticker: 'PETR4',
    name: 'Petrobras',
    kind: 'stock',
    // seed do design (backend fora): sem data de dado real, sem dateModified
    dataDate: null,
    hero: {
      companyLine: 'Petrobras · PETR4',
      ticker: 'PETR4',
      priceFmt: 'R$ 38,25',
      changeLine: '+R$ 0,29 (0,76%) hoje',
      dir: 'up',
      metaLine: 'fech. anterior R$ 37,96 · atualizado às 12:47',
    },
    currentPrice: 38.25,
    series12: {
      asset: series,
      // IBOV do design entra só na legenda (+12,1% no período) — 2 pontos bastam.
      ibov: [{ t: first.t, v: 100 }, { t: last.t, v: 112.1 }],
    },
    chartStats: [
      { l: 'Valor de Mercado', v: 'R$ 493,20B' },
      { l: 'Dividend Yield', v: '7,00%' },
      { l: 'P/L (TTM)', v: '4,55' },
      { l: 'ROE', v: '24,2%' },
      { l: 'Receita (12M)', v: 'R$ 487,70B' },
      { l: 'Lucro Líquido (12M)', v: 'R$ 105,34B' },
      { l: 'Margem Líquida', v: '21,6%' },
    ],
    perfil: [
      { name: 'Rentabilidade', tag: g('Excelente') },
      { name: 'Crescimento', tag: a('Moderado') },
      { name: 'Endividamento', tag: a('Moderado') },
      { name: 'Valuation', tag: g('Atrativo') },
      { name: 'Dividendo', tag: g('Excelente') },
    ],
    fundHeading: ['Os números', 'da empresa.'],
    fundSub: 'Últimos 12 meses · dados da B3 e balanços',
    fundInfo: null,
    etfXray: null,
    fcards: [
      { kind: 'metric', label: 'ROE', value: '24,2%', tag: g('Excelente') },
      { kind: 'metric', label: 'Dividend Yield', value: '6,95%', tag: g('Excelente') },
      { kind: 'metric', label: 'P/L', value: '4,55', tag: g('Atrativo') },
      { kind: 'metric', label: 'P/VP', value: '1,10', tag: g('Atrativo') },
      { kind: 'insight', insight: 'O P/L de 4,55 é quase metade da média histórica de 8,9: o mercado está precificando o petróleo, não os fundamentos.', cta: 'Perguntar sobre o valuation', href: '/busca' },
      { kind: 'metric', label: 'EV/EBITDA', value: '2,64', tag: g('Baixo') },
      { kind: 'metric', label: 'Margem Líquida', value: '21,6%', tag: g('Saudável') },
      { kind: 'metric', label: 'Receita (12M)', value: 'R$ 487,7B', tag: g('↑ 12,8% a.a.') },
      { kind: 'metric', label: 'Lucro Líquido (12M)', value: 'R$ 105,3B', tag: g('↑ 36,6% a.a.') },
      { kind: 'insight', insight: 'O DY de 6,95% é sustentável: payout de 45% e caixa livre de R$ 131,9B cobrem os próximos ciclos.', cta: 'Analisar os dividendos', href: '/busca' },
      { kind: 'metric', label: 'Dív. Líq./EBITDA', value: '1,01', tag: a('Moderado') },
      { kind: 'metric', label: 'ROA', value: '8,6%', tag: g('Bom') },
    ],
    theses: [
      { slug: 'a-conta-de-luz-da-ia', title: 'Energia para IA', image: '/teses/a-conta-de-luz-da-ia.webp', conviction: 82, roleStrong: 'o gás que segura a base térmica', roleRest: ' enquanto os data centers dobram o consumo' },
    ],
    dividends: {
      heading: ['Uma máquina', 'de dividendos.'],
      subtitle: 'R$ 2,66 por ação nos últimos 12 meses',
      rows: [
        { l: 'Dividend Yield (12M)', v: '6,95%' },
        { l: 'Payout', v: '45%' },
        { l: 'Frequência', v: 'Trimestral' },
        { l: 'Próximo pagamento', v: '21 ago 2026' },
      ],
      bars: [
        { year: '2021', valFmt: 'R$ 2,10', hPct: 30.7, current: false },
        { year: '2022', valFmt: 'R$ 6,84', hPct: 100, current: false },
        { year: '2023', valFmt: 'R$ 4,25', hPct: 62.1, current: false },
        { year: '2024', valFmt: 'R$ 2,91', hPct: 42.5, current: false },
        { year: '2025', valFmt: 'R$ 2,52', hPct: 36.8, current: false },
        { year: '2026', valFmt: 'R$ 2,66', hPct: 38.9, current: true },
      ],
      barsNote: 'Dividendos + JCP por ação, por ano · 2026 considera os últimos 12 meses',
      sum12: 2.66,
    },
    ai: {
      updatedLabel: 'atualizada hoje',
      score: {
        score100: 93,
        pill: g('Excelente'),
        subScores: [
          { name: 'Rentabilidade', value: 98 },
          { name: 'Valuation', value: 95 },
          { name: 'Dividendos', value: 96 },
          { name: 'Endividamento', value: 78 },
        ],
      },
      consensus: {
        pill: 'COMPRAR',
        pillVariant: 'green',
        upsideFmt: '+41,5%',
        subLine: 'de upside até o alvo médio · 14 analistas',
        rangeBar: { fromPct: 28, widthPct: 66, targetPct: 64, dotPct: 11 },
        labels: { current: 'R$ 38,25', avg: 'R$ 54,13', high: 'R$ 63,17' },
        footnote: 'Nenhuma casa recomenda venda: 11 compras e 3 neutros entre os grandes bancos.',
      },
      read: {
        pros: ['Rentabilidade excelente, ROE de 24,2%', 'Dividend yield alto e sustentável', 'Múltiplos atrativos, P/L 4,55 e EV/EBITDA 2,64'],
        cons: ['Alta exposição ao preço do petróleo', 'Risco de ingerência estatal', 'Crescimento moderado no longo prazo'],
      },
    },
    editorial: null,
    news: {
      featured: {
        href: '/noticias',
        badge: { text: 'PETR4 -1,20%', dir: 'down' },
        source: 'Valor Investe · hoje, 09:40',
        title: 'Petroleiras perdem apelo com Brent caminhando para US$ 60.',
        dek: 'Citi e Goldman veem excesso de oferta no segundo semestre e recalibram os preços-alvo do setor de energia na B3.',
      },
      rows: [
        { href: '/noticias', title: 'Fim do caos pode derrubar o petróleo para US$ 60, diz Citi', source: 'Seu Dinheiro · 04/07', ticker: { text: 'PETR4 -0,90%', dir: 'down' } },
        { href: '/noticias', title: 'Petrobras aprova dividendos de R$ 0,35 por ação', source: 'InfoMoney · 02/07', ticker: { text: 'PETR4 +2,96%', dir: 'up' } },
        { href: '/noticias', title: 'Produção no pré-sal bate recorde no 2º trimestre', source: 'Reuters · ontem', ticker: { text: 'PETR4 +1,10%', dir: 'up' } },
      ],
    },
    cadeia: null,
    pares: null,
    relacionados: [
      { href: '/setor/energia', label: 'Ranking do setor energia' },
      { href: '/dividendos/PETR4', label: 'Dividendos de PETR4' },
      { href: '/calculadora/preco-teto/PETR4', label: 'Preço teto de PETR4' },
    ],
    simuladorHref: simuladorAcoesHref('PETR4', 'STOCK'),
    resumo: resumoSeed,
    seo: resumoSeed
      ? seoDeResumo(resumoSeed)
      : { title: 'Petrobras (PETR4): cotação e dividendos', description: 'Não é recomendação.', faq: [] },
  }
}

/** Setor e dividendos no fim da página. Só entra destino que a rota responde 200. */
function linksRelacionados(
  setor: SetorEntry | null,
  kind: AssetKind,
  dividends: AcaoDividendsVM | null,
  ticker: string,
  precoTetoHref: string | null,
): AcaoPayload['relacionados'] {
  const links: AcaoPayload['relacionados'] = []
  if (setor) {
    links.push({ href: `/setor/${setor.ptSlug}`, label: `Ranking do setor ${setor.name.toLowerCase()}` })
  }
  else if (kind === 'fii') {
    links.push({ href: '/setor/imobiliario', label: 'Ranking do setor imobiliário' })
  }
  if (dividends && dividends.bars.length > 0) {
    links.push({ href: `/dividendos/${ticker}`, label: `Dividendos de ${ticker}` })
  }
  // Só quando a página de preço teto existe (LPA ou dividendo). Link para 404
  // a partir do /asset reabre o problema que o sitemap acabou de fechar.
  if (precoTetoHref) {
    links.push({ href: precoTetoHref, label: `Preço teto de ${ticker}` })
  }
  return links
}

/** Com menos de 3 pares o bloco não se sustenta (setor pequeno no sitemap): some. */
function buildPares(setor: SetorEntry | null, itens: { ticker: string; nome: string }[] | null | undefined): AcaoParesVM | null {
  if (!setor || !itens || itens.length < 3) return null
  return { setor: { nome: setor.name, href: `/setor/${setor.ptSlug}` }, itens }
}

/**
 * "De quem compra e para quem vende" (GET /assets/{t}/supply-chain). O valor
 * que aparece é um só por linha, na ordem de força: um ano de vendas, a soma
 * dos contratos, a fatia da receita. Sem valor na fonte → linha sem número
 * (nunca estimado). Nenhuma ligação verificada → o bloco some.
 */
const CADEIA_MAX = 8
const CADEIA_FONTE: Record<string, string> = {
  cvm_partes_relacionadas: 'Formulário de Referência (CVM)',
  edgar_10k: 'relatórios anuais na SEC',
  nota_explicativa: 'demonstrações financeiras',
  fre: 'Formulário de Referência (CVM)',
  ri: 'documentos de RI',
  release: 'releases de resultado',
  contrato: 'comunicados das empresas',
  noticia: 'notícias',
}

function cadeiaValor(l: SupplyLinkApi): [string, string] | null {
  if (l.anual) return [fmtCompactMoney(l.anual.valor, l.anual.moeda), l.anual.ano ? `em ${l.anual.ano}` : 'por ano']
  if (l.contratado?.valor) return [fmtCompactMoney(l.contratado.valor, l.contratado.moeda), 'em contratos']
  if (l.participacao_receita != null) return [`${nfc.format(l.participacao_receita * 100)}%`, 'da receita']
  return null
}

/** Uma prova por vez, no singular ("o relatório", não "os relatórios"). */
const CADEIA_PROVA: Record<string, string> = {
  cvm_partes_relacionadas: 'Formulário de Referência (CVM)',
  edgar_10k: 'Relatório anual na SEC (20-F)',
  nota_explicativa: 'Demonstrações financeiras',
  fre: 'Formulário de Referência (CVM)',
  ri: 'Documento de RI',
  release: 'Release de resultado',
  contrato: 'Comunicado da empresa',
  noticia: 'Notícia',
}

function nomeDoLink(l: SupplyLinkApi): string {
  return l.nome_b3 ? nomeDaEmpresa(l.nome_b3) : l.nome.replace(/,?\s+(S\.?A\.?|Inc\.?|Corp\.?|Corporation)$/i, '')
}

function dataBr(iso: string | null): string | null {
  return iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : null
}

/**
 * O painel que abre ao clicar na etiqueta. `quemInformou` resolve o ticker de
 * quem publicou o documento para o nome de uma das duas pontas (a outra
 * empresa, quando o ticker é dela; senão, a própria).
 */
function cadeiaDetalhe(l: SupplyLinkApi, eu: string, vende: boolean): AcaoCadeiaDetalheVM {
  const outro = nomeDoLink(l)
  const quem = (t: string | null) => (t == null ? null : l.tickers.includes(t) ? outro : eu)
  const por = (t: string | null) => { const n = quem(t); return n ? `informado pela ${n}` : null }
  const valores: AcaoCadeiaDetalheVM['valores'] = []
  if (l.anual) valores.push({ valor: fmtCompactMoney(l.anual.valor, l.anual.moeda), quando: l.anual.ano ? `em ${l.anual.ano}` : 'por ano', por: por(l.anual.informado_por) })
  if (l.contratado?.valor) {
    const n = l.contratado.contratos
    valores.push({ valor: fmtCompactMoney(l.contratado.valor, l.contratado.moeda), quando: `em ${n} contrato${n === 1 ? '' : 's'} (soma da vigência)`, por: por(l.contratado.informado_por) })
  }
  if (l.participacao_receita != null) valores.push({ valor: `${nfc.format(l.participacao_receita * 100)}%`, quando: 'da receita', por: null })
  return {
    titulo: `${vende ? eu : outro} vende para ${vende ? outro : eu}`,
    de: vende ? eu : outro,
    para: vende ? outro : eu,
    oQue: l.o_que,
    valores,
    conta: null,
    nota: null,
    fonteConta: null,
    provas: l.fontes.map((f) => ({
      fonte: CADEIA_PROVA[f.tipo] ?? 'Documento',
      data: dataBr(f.data),
      por: quem(f.informado_por),
      valor: f.valor == null
        ? null
        : f.tipo_valor === 'pct_receita'
          ? `${nfc.format(f.valor)}% da receita`
          : `${fmtCompactMoney(f.valor, f.moeda)} ${f.tipo_valor === 'anual' ? (f.ano ? `em ${f.ano}` : 'por ano') : 'em contrato'}`,
      trecho: f.trecho,
      emIngles: f.tipo === 'edgar_10k',
      url: f.url,
    })),
  }
}

/**
 * Fatia do total do lado (receita para quem compra da empresa, custo para quem
 * vende a ela) — só valor anual, em real, do mesmo ano da DFP; o resto fica
 * com o traço fino (contrato pela vigência e dólar não são comparáveis).
 */
function cadeiaPeso(l: SupplyLinkApi, totais: SupplyChainApi['totais'], vende: boolean): number | null {
  const base = vende ? totais?.receita : totais?.custo
  if (!base || !l.anual || l.anual.moeda !== 'BRL' || l.anual.ano !== totais?.ano) return null
  return Math.min(1, l.anual.valor / base)
}

function cadeiaItem(l: SupplyLinkApi, eu: string, vende: boolean, totais: SupplyChainApi['totais']): AcaoCadeiaItemVM {
  return {
    ticker: l.ticker,
    resto: false,
    peso: cadeiaPeso(l, totais, vende),
    nome: nomeDoLink(l),
    oQue: l.o_que,
    valor: cadeiaValor(l)?.[0] ?? null,
    valorQuando: cadeiaValor(l)?.[1] ?? null,
    detalhe: cadeiaDetalhe(l, eu, vende),
  }
}

/**
 * O nó que fecha a conta com o balanço: "Outros clientes" (receita − vendas a
 * listadas) ou "Restante do custo" (custo − compras de listadas). Só com a DFP
 * do ano e com o resto calculado (o backend devolve null quando não fecha).
 */
function cadeiaResto(api: SupplyChainApi, eu: string, lado: 'clientes' | 'custo'): AcaoCadeiaItemVM | null {
  const t = api.totais
  const r = api.restante?.[lado]
  const base = lado === 'clientes' ? t?.receita : t?.custo
  if (!t || !r || r.valor == null || !base) return null
  const pct = nfPct.format((r.valor / base) * 100)
  const clientes = lado === 'clientes'
  const total = fmtCompactMoney(base, 'BRL')
  const fora = r.fora_da_conta
  return {
    ticker: clientes ? 'resto-clientes' : 'resto-custo',
    resto: true,
    peso: Math.min(1, r.valor / base),
    nome: clientes ? 'Outros clientes' : 'Restante do custo',
    oQue: clientes ? `fora da bolsa · ${pct}% da receita` : `fora da bolsa e custos próprios · ${pct}% do custo`,
    valor: fmtCompactMoney(r.valor, 'BRL'),
    valorQuando: `em ${t.ano}`,
    detalhe: {
      titulo: clientes ? `${eu} vende para outros clientes` : `O restante do custo da ${eu}`,
      de: clientes ? eu : 'Restante do custo',
      para: clientes ? 'Outros clientes' : eu,
      oQue: clientes
        ? 'Empresas e pessoas fora da bolsa, no Brasil e no exterior. A Redentia não tem o nome de cada uma: é o que sobra da receita depois das vendas a empresas listadas.'
        : 'Compras de fornecedores fora da bolsa e os custos próprios que entram no custo dos produtos vendidos (pessoal, energia, depreciação). É o que sobra do custo depois das compras de empresas listadas.',
      valores: [],
      conta: [
        { sinal: '', rotulo: clientes ? `Receita de ${t.ano}` : `Custo dos produtos vendidos em ${t.ano}`, valor: total },
        { sinal: '−', rotulo: clientes ? `vendas a empresas listadas (valor de ${t.ano})` : `compras de empresas listadas (valor de ${t.ano})`, valor: fmtCompactMoney(r.listadas, 'BRL') },
        { sinal: '=', rotulo: clientes ? 'Outros clientes' : 'Restante do custo', valor: fmtCompactMoney(r.valor, 'BRL') },
      ],
      nota: fora > 0
        ? `${fora === 1 ? 'Uma ligação' : `${fora} ligações`} com listadas ${fora === 1 ? 'não tem' : 'não têm'} valor anual de ${t.ano} em reais (contrato pela vigência, valor em dólar ou indisponível) e ${fora === 1 ? 'fica' : 'ficam'} dentro deste restante.`
        : null,
      fonteConta: { rotulo: `${t.fonte}, exercício de ${t.ano}`, url: t.url },
      provas: [],
    },
  }
}

const nfPct = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

function buildCadeia(api: SupplyChainApi | null | undefined, eu: string): AcaoCadeiaVM | null {
  if (!api || (!api.compra_de?.length && !api.vende_para?.length)) return null
  const all = [...api.compra_de, ...api.vende_para]
  const kinds = [...new Set(all.flatMap((l) => (l.tipos_fonte ?? []).map((t) => CADEIA_FONTE[t]).filter((x): x is string => !!x)))]
  if (api.totais) kinds.push('demonstrações anuais (DFP/CVM) para receita e custo')
  const fontes = kinds.length > 1 ? `${kinds.slice(0, -1).join(', ')} e ${kinds[kinds.length - 1]}` : kinds[0] ?? ''
  const restoCusto = cadeiaResto(api, eu, 'custo')
  const restoClientes = cadeiaResto(api, eu, 'clientes')
  return {
    compraDe: [...api.compra_de.slice(0, CADEIA_MAX).map((l) => cadeiaItem(l, eu, false, api.totais)), ...(restoCusto ? [restoCusto] : [])],
    vendePara: [...api.vende_para.slice(0, CADEIA_MAX).map((l) => cadeiaItem(l, eu, true, api.totais)), ...(restoClientes ? [restoClientes] : [])],
    fontes,
  }
}

/* ————— carga SSR ————— */

function statusOf(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

async function loadAcao(base: string, ticker: string): Promise<AcaoPayload> {
  let res: Awaited<ReturnType<typeof acaoFetchProfile>>
  try {
    res = await acaoFetchProfile(base, ticker)
  } catch (e) {
    const status = statusOf(e)
    if (status === 404) {
      throw createError({ statusCode: 404, statusMessage: `Ativo ${ticker} não encontrado` })
    }
    // O perfil NÃO deveria 410 (é o endpoint que o MCP usa), mas se o backend
    // mudar de ideia o veredito é o mesmo — melhor honrar o 410 do que traduzir
    // "saiu da B3" em "nosso servidor caiu".
    if (status === 410) {
      throw delistedError(ticker, delistedAtOfError(e))
    }
    // Backend fora do ar: PETR4 (a página de referência do design) degrada pro
    // seed completo; qualquer outro ticker responde 503 (temporário, não 404 —
    // um 404 transitório envenenaria o índice do Google).
    if (ticker === 'PETR4') return petr4Seed()
    throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })
  }

  // SINAL PRIMÁRIO do deslistado (18/09/2026): o perfil responde 200 e o
  // envelope de metadados traz `delisted: true`. Sem esta checagem a página
  // renderizaria a cotação congelada do último pregão do papel (CIEL3 ainda
  // devolve R$ 5,83 "de 28/08") com cara de pregão de hoje.
  if (isDelistedEnvelope(res)) {
    throw delistedError(ticker, delistedAtOf(res))
  }
  // Código trocado (EMBR3 → EMBJ3, MRFG3 → MBRF3): o perfil resolve o alias e
  // devolve o papel novo. A página vira 301 pro código novo ANTES dos outros
  // oito fetches — nada de montar a página inteira na URL velha.
  const renamedTo = renamedTargetOf(res, ticker)
  if (renamedTo) throw renamedError(ticker, renamedTo)
  const profile = res.data

  // Regex estrita do endpoint /news/ticker (tickers como B3SA3 ficam de fora).
  const newsStrict = /^[A-Z]{4}\d{1,2}$/.test(ticker)
  // Pares do setor, só pra ação: o perfil já traz o setor ('Energy'), então a
  // chamada entra no mesmo bloco paralelo. Setor fora do registry → sem bloco.
  const setorConhecido = SETORES_BY_API[apiSlugDoSetor(profile.sector) ?? ''] ?? null
  // Pares só de ação. O link de setor, abaixo, vale para qualquer tipo cujo
  // setor exista no registry (FII sem setor cai em /setor/imobiliario).
  const setor = profile.type === 'STOCK' ? setorConhecido : null
  // Cadeia de fornecimento: só papel de empresa (o endpoint 404 pra FII/ETF/BDR).
  const temCadeia = profile.type === 'STOCK' || profile.type === 'US_STOCK'
  const [pricesR, ibovR, overviewR, scoreR, consensusR, dividendsR, editorialR, thesesR, newsR, paresR, cadeiaR] = await Promise.allSettled([
    acaoFetchPrices(base, ticker, '12mo'),
    acaoFetchIbovPrices(base, '12mo'),
    acaoFetchOverview(base, ticker),
    acaoFetchScoreRanking(base),
    acaoFetchConsensus(base, ticker),
    acaoFetchDividends(base, ticker),
    acaoFetchEditorial(base, ticker),
    acaoFetchTheses(base),
    newsStrict ? acaoFetchNewsByTicker(base, ticker) : acaoFetchNewsFiltered(base, ticker),
    setor ? acaoFetchPares(setor.ptSlug, ticker) : Promise.resolve(null),
    temCadeia ? acaoFetchSupplyChain(base, ticker) : Promise.resolve(null),
  ])
  const ok = <X>(r: PromiseSettledResult<X>): X | null => (r.status === 'fulfilled' ? r.value : null)

  // CINTO-E-SUSPENSÓRIO do 410. O envelope `delisted` do perfil só existe pra
  // quem o backend consegue marcar; se um papel for marcado apenas nos
  // endpoints de DADO, a SÉRIE é quem denuncia — e série é a espinha da página
  // (hero + gráfico 12M, acima da dobra). Sem ela sobraria uma casca vazia, que
  // pro Google é pior que um 410 honesto.
  // Os outros oito fetches são seções abaixo da dobra: um 410 ali NÃO derruba a
  // página, só esconde a seção — o `ok()` acima já devolve null pra qualquer
  // rejeição e cada builder degrada escondendo (política documentada no topo).
  if (pricesR.status === 'rejected' && statusOf(pricesR.reason) === 410) {
    throw delistedError(ticker, delistedAtOfError(pricesR.reason))
  }

  const overview = ok(overviewR)?.data ?? null
  const f = extractFund(overview)
  const etf = extractEtf(overview)
  // UM DY no site (D1, app/utils/proventos.ts): o card de fundamentos, os
  // insights, a leitura da IA, a meta description e a seção de dividendos leem
  // f.dy, e o /dividendos chama o mesmo resolveSiteDy com os mesmos insumos.
  // Em 23/09/2026 a página tinha duas contas: RIAA3 com "Dividend Yield 0,00%"
  // ao lado de "máquina de dividendos… 34,68%"; EPAR3 com 137,13% (o rendimento
  // indicado do TradingView) sob "sem pagamentos nos últimos 12 meses".
  const provRows = dividendsR.status === 'fulfilled' ? parseProventos(dividendsR.value?.data) : null
  const siteDy = resolveSiteDy({ overviewDy: overviewDyOf(overview), price: profile.market_price, rows: provRows })
  if (f) f.dy = siteDy.value
  // Tipo: scrape_extras.asset_type manda; sem overview, cai no ProfileResource.
  const assetType = overview?.scrape_extras?.asset_type
  const kind: AssetKind = assetType === 'fii'
    ? 'fii'
    : assetType === 'bdr'
      ? 'bdr'
      : assetType === 'etf'
        ? 'etf'
        : assetType
          ? 'stock'
          : profile.type === 'REIT' ? 'fii'
            : profile.type === 'ETF' || profile.type === 'US_ETF' ? 'etf'
              : profile.type === 'BDR' ? 'bdr' : 'stock'
  // US_STOCK cai em 'stock' de propósito (US0): a página renderiza as mesmas
  // seções e degrada onde não há dado; moeda/kind próprios chegam no US1.
  const isFii = kind === 'fii'
  // BDR: o nome inteiro da matriz. O da B3 corta em 12 ('PALANTIRTECHDRN').
  const bdrName = kind === 'bdr' ? nomeDoBdr(overview?.scrape_extras?.identity?.company_name) : null
  const name = kind === 'etf' && etf?.name ? etf.name : bdrName ?? prettyName(profile.name, f?.fiiName)
  // flat, sem wrapper `data` (gotcha documentado no service)
  const editorial = ok(editorialR) ?? null

  const assetSeries = toSeries(ok(pricesR)?.data)
  const ibovSeries = toSeries(ok(ibovR)?.data)
  // "cai X% no ano" da Leitura da IA: pela série, com as travas de evento
  // não ajustado (salto de pregão e faixa de 52 semanas do overview).
  if (f) {
    const mercado = overview?.scrape_extras?.market
    f.ytd = variacaoNoAno(assetSeries, { min: mercado?.min_price_52_weeks ?? null, max: mercado?.max_price_52_weeks ?? null })
  }
  // Sem série do ativo → seção do gráfico some inteira (nada de linha inventada).
  const series12: AcaoSeriesPair | null = assetSeries.length >= 2 ? { asset: assetSeries, ibov: ibovSeries } : null

  const theses = ok(thesesR)?.data ? await buildTheses(base, ticker, ok(thesesR)!.data) : []

  // Raio-X de ETF: roundtrip extra SÓ pra ETF (o tipo só é conhecido depois
  // do overview; a API cacheia 1h e a carteira é mensal). 404/erro → null e
  // a seção some — mesma política do editorial.
  const etfXrayApi = kind === 'etf' ? await acaoFetchEtfXray(base, ticker).catch(() => null) : null

  const score = buildScore(ok(scoreR)?.data ?? [], ticker, f)
  const consensus = buildConsensus(ok(consensusR))
  const read = buildAiRead(f, editorial, ticker)
  let ai: AcaoAiVM | null = null
  if (score || consensus || read) {
    // 'atualizada hoje' vem de datas REAIS (consenso re-escrapado / editorial).
    const dates = [ok(consensusR)?.refreshed_at, editorial?.generated_at].filter((d): d is string => !!d)
    const latest = dates.sort().pop()
    const updatedLabel = latest
      ? latest.slice(0, 10) === localISODate() ? 'atualizada hoje' : `atualizada em ${latest.slice(8, 10)}/${latest.slice(5, 7)}`
      : ''
    ai = { updatedLabel, score, consensus, read }
  }

  // Subtítulo dos fundamentos por tipo (a copy antiga prometia "balanços" pra
  // FII e "dados da B3" pra DRE de matriz em dólar — mentiras pequenas, mas mentiras).
  const fundSub = isFii
    ? 'Últimos 12 meses · dados da B3 e informes do fundo'
    : kind === 'bdr'
      ? 'Últimos 12 meses · resultados da matriz, em dólar'
      : 'Últimos 12 meses · dados da B3 e balanços'

  const dividends = buildDividends(provRows ?? [], ticker, isFii, siteDy)
  const setorDoLink = setorConhecido ?? (kind === 'fii' ? SETORES_BY_API['real-estate'] ?? null : null)
  const paresVm = kind === 'stock' ? buildPares(setor, ok(paresR)?.data) : null
  const precoTetoHref = hrefPrecoTeto({
    type: profile.type,
    ticker,
    lpa: lpaDeOverview(overview),
    dividendo: dividendoParaBazin({
      overviewDy: overviewDyOf(overview),
      price: profile.market_price ?? 0,
      rows: provRows,
    }).valor,
  })
  const media = ok(paresR)?.media
  const variacaoNaLista = media?.variacaoAtivo
  const dataIso = isoDateOrNull(profile.price_date) ?? isoDateOrNull(assetSeries[assetSeries.length - 1]?.t)
  const min52 = kind === 'fii'
    ? overview?.scrape_extras?.fii?.min_price_52_weeks ?? null
    : kind === 'etf'
      ? overview?.scrape_extras?.etf?.min_price_52_weeks ?? null
      : overview?.scrape_extras?.market?.min_price_52_weeks ?? null
  const max52 = kind === 'fii'
    ? overview?.scrape_extras?.fii?.max_price_52_weeks ?? null
    : kind === 'etf'
      ? overview?.scrape_extras?.etf?.max_price_52_weeks ?? null
      : overview?.scrape_extras?.market?.max_price_52_weeks ?? null
  const holding = etfXrayApi?.composition.holdings?.[0]
  const linksResumo: { href: string; label: string }[] = []
  if (precoTetoHref) linksResumo.push({ href: precoTetoHref, label: `Preço teto de ${ticker}` })
  if (dividends && dividends.bars.length > 0) linksResumo.push({ href: `/dividendos/${ticker}`, label: `Dividendos de ${ticker}` })
  if (setorDoLink) linksResumo.push({ href: `/setor/${setorDoLink.ptSlug}`, label: `Setor ${setorDoLink.name.toLowerCase()}` })
  if (paresVm) {
    for (const p of paresVm.itens) linksResumo.push({ href: `/asset/${p.ticker}`, label: `${p.nome} (${p.ticker})` })
  }
  const resumo = montarResumoAtivo({
    ticker,
    nome: name,
    kind,
    setor: setorConhecido?.name ?? null,
    moeda: profile.currency === 'USD' ? 'USD' : 'BRL',
    preco: profile.market_price,
    variacaoDia: profile.change_percent,
    data: dataIso,
    numeros: {
      ...NUMEROS_RESUMO_VAZIOS,
      dy: f?.dy ?? null,
      pl: f?.pl ?? null,
      pvp: f?.pvp ?? null,
      roe: kind === 'fii' ? null : f?.roe ?? null,
      margem: kind === 'fii' ? null : f?.netMargin ?? null,
      valorMercado: kind === 'bdr' || !(f?.marketCap && f.marketCap > 0) ? null : f.marketCap,
      vpCota: f?.fiiVpCota ?? null,
      rendaMedia24m: f?.fiiRendaMedia ?? null,
      ifix: f?.fiiIfixShare ?? null,
      cotistas: f?.fiiCotistas ?? null,
    },
    fonteIndicadores: isFii
      ? 'dados da B3 e informes do fundo'
      : kind === 'bdr'
        ? 'resultados da matriz, em dólar'
        : 'dados da B3 e balanços',
    min52,
    max52,
    serie: serieDoResumo(assetSeries, ibovSeries),
    // Só quando a variação do papel e a média saem da mesma resposta. A
    // cotação do perfil é outra leitura e não entra nesta conta.
    setorMedia: kind === 'stock' && setor && media && Number.isFinite(media.variacao) && typeof variacaoNaLista === 'number' && Number.isFinite(variacaoNaLista)
      ? {
          variacao: media.variacao,
          papeis: media.papeis ?? null,
          variacaoAtivo: variacaoNaLista,
          data: isoDateOrNull(media.data),
        }
      : null,
    proventos: proventosDoResumo(provRows, isFii),
    etf: kind === 'etf' && etfXrayApi
      ? {
          taxaAdm: etfXrayApi.fees.management_fee,
          posicoes: etfXrayApi.composition.total_positions,
          maiorNome: holding?.name || holding?.ticker || null,
          maiorPeso: holding?.weight != null ? holding.weight * 100 : null,
          fonte: etfXrayApi.source?.trim() || null,
          competencia: isoDateOrNull(etfXrayApi.as_of),
        }
      : null,
    cripto: null,
    links: linksResumo,
  })
  const editorialVm = buildEditorial(editorial, name, isFii)
  faqUnica(editorialVm, resumo)

  return {
    ticker,
    name,
    kind,
    // Pregão do dado exibido (YYYY-MM-DD): o price_date do perfil ou, sem
    // ele, o último ponto do gráfico. Vira o dateModified da página.
    dataDate: dataIso,
    hero: buildHero(profile, name),
    currentPrice: profile.market_price,
    series12,
    // ETF não tem DRE/valuation de empresa: stats do chart vêm do bloco etf.
    chartStats: kind === 'etf' ? buildEtfChartStats(etf, assetSeries) : buildChartStats(f),
    perfil: buildPerfil(f),
    fundHeading: isFii ? ['Os números', 'do fundo.'] : ['Os números', 'da empresa.'],
    fundSub,
    fcards: buildFundCards(f, ticker),
    fundInfo: kind === 'etf' ? buildEtfFundInfo(etf) : null,
    etfXray: buildEtfXray(etfXrayApi, kind === 'etf' ? buildEtfFundInfo(etf) : null),
    theses,
    dividends,
    ai,
    news: buildNews(ok(newsR)?.data ?? [], profile, assetSeries),
    editorial: editorialVm,
    cadeia: kind === 'stock' ? buildCadeia(ok(cadeiaR), name) : null,
    pares: paresVm,
    relacionados: linksRelacionados(setorDoLink, kind, dividends, ticker, precoTetoHref),
    simuladorHref: simuladorAcoesHref(ticker, profile.type),
    resumo,
    seo: resumo
      ? {
          title: resumo.title,
          description: resumo.description,
          // Com editorial, a FAQ visível é a fundida. Sem ela, é a do resumo.
          faq: (editorialVm?.faq.length ? editorialVm.faq : resumo.faq).map((f) => ({ question: f.q, answer: f.a })),
        }
      : { title: `${ticker}: cotação na B3`, description: 'Não é recomendação.', faq: [] },
  }
}

/* ————— cripto (fluxo próprio: GET /crypto/{symbol}, sem B3/score/consenso/
   dividendos — nada de seção vazia fingindo dado que não existe) ————— */

/**
 * Mapa AcaoRange → range REAL da API de cripto (verificado 2026-07-13):
 * `30d` e `6m` funcionam; '12m' cai no default do endpoint, que É 12 meses.
 */
const CRYPTO_RANGE: Record<AcaoRange, string> = { '1mo': '30d', '6mo': '6m', '12mo': '12m' }

const nfc = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

/** Preço de cripto em BRL: BTC vale ~R$ 328 mil (centavos só abaixo de R$ 1.000). */
function cryptoBrl(v: number): string {
  return `R$ ${v >= 1000 ? nf0.format(v) : nf2.format(v)}`
}

/** 20055443 → '20,06M' (oferta em circulação / oferta máxima). */
function compactQty(v: number): string {
  if (v >= 1e9) return `${nfc.format(v / 1e9)}B`
  if (v >= 1e6) return `${nfc.format(v / 1e6)}M`
  if (v >= 1e3) return `${nfc.format(v / 1e3)} mil`
  return nfc.format(v)
}

function toCryptoSeries(data: CryptoPricePointApi[] | undefined | null): SeriesPoint[] {
  return (data ?? [])
    .filter((p) => p.price_brl != null && !!p.price_at)
    .map((p) => ({ t: p.price_at, v: p.price_brl as number }))
}

function buildCryptoHero(c: CryptoDetailApi, sym: string): AcaoHeroVM {
  const price = c.price_brl
  const chg = c.change_24h_pct
  let changeLine: string | null = null
  if (price != null && chg != null) {
    const prev = price / (1 + chg / 100)
    const abs = Math.abs(price - prev)
    // cripto roda 24/7 — 'em 24h', não 'hoje'
    changeLine = `${chg < 0 ? '-' : '+'}R$ ${abs >= 1000 ? nf0.format(abs) : nf2.format(abs)} (${nf2.format(Math.abs(chg))}%) em 24h`
  }
  const upd = c.ohlc?.last_updated
  const metaLine = upd
    ? `mercado 24 horas · atualizado em ${upd.slice(8, 10)}/${upd.slice(5, 7)}`
    : 'mercado 24 horas · preço em reais'
  return {
    companyLine: `${c.name} · ${sym}`,
    ticker: sym,
    priceFmt: price != null ? cryptoBrl(price) : '—',
    changeLine,
    dir: dirOf(chg ?? 0),
    metaLine,
    logo: c.image,
    exchangeLabel: 'CRIPTO',
  }
}

function buildCryptoStats(c: CryptoDetailApi, sym: string): AcaoStatRow[] {
  const rows: AcaoStatRow[] = []
  if (c.market_cap_brl != null) rows.push({ l: 'Valor de Mercado', v: moneyBig(c.market_cap_brl, 2) })
  if (c.volume_24h_brl != null) rows.push({ l: 'Volume (24h)', v: moneyBig(c.volume_24h_brl, 2) })
  if (c.market_cap_dominance_pct != null && c.market_cap_dominance_pct > 0) rows.push({ l: 'Dominância', v: `${nf2.format(c.market_cap_dominance_pct)}%` })
  if (c.rank != null) rows.push({ l: 'Rank global', v: `#${nf0.format(c.rank)}` })
  if (c.min_52w_brl != null) rows.push({ l: 'Mín. 52 semanas', v: cryptoBrl(c.min_52w_brl) })
  if (c.max_52w_brl != null) rows.push({ l: 'Máx. 52 semanas', v: cryptoBrl(c.max_52w_brl) })
  if (c.circulating_supply != null) rows.push({ l: 'Oferta em circulação', v: `${compactQty(c.circulating_supply)} ${sym}` })
  if (c.max_supply != null) rows.push({ l: 'Oferta máxima', v: `${compactQty(c.max_supply)} ${sym}` })
  return rows.slice(0, 8)
}

/** Janelas de variação como metric cards (a seção de fundamentos vira isso). */
function buildCryptoCards(c: CryptoDetailApi): AcaoFundCard[] {
  const win = (label: string, n: number | null): AcaoMetricCard | null =>
    n == null ? null : { kind: 'metric', label, value: pctFmt(n), tag: n >= 0 ? T('alta', 'green') : T('queda', 'gray') }
  return [
    win('24 horas', c.change_24h_pct),
    win('7 dias', c.change_7d_pct),
    win('30 dias', c.change_30d_pct),
    win('12 meses', c.appreciation_12m_pct),
  ].filter((x): x is AcaoMetricCard => x != null)
}

async function loadCrypto(base: string, symbol: string): Promise<AcaoPayload> {
  let c: CryptoDetailApi
  try {
    c = (await acaoFetchCrypto(base, symbol)).data
  } catch (e) {
    const status = statusOf(e)
    if (status === 404) {
      throw createError({ statusCode: 404, statusMessage: `Ativo ${symbol} não encontrado` })
    }
    throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })
  }
  const sym = (c.symbol ?? symbol).toUpperCase()

  const [pricesR, newsR] = await Promise.allSettled([
    acaoFetchCryptoPrices(base, symbol, CRYPTO_RANGE['12mo']),
    // Notícias: só o fallback ?ticker= existe pra cripto; vazio → seção some.
    acaoFetchNewsFiltered(base, sym),
  ])
  const ok = <X>(r: PromiseSettledResult<X>): X | null => (r.status === 'fulfilled' ? r.value : null)

  const series = toCryptoSeries(ok(pricesR)?.data)
  const series12: AcaoSeriesPair | null = series.length >= 2 ? { asset: series, ibov: [] } : null
  const dataIso = isoDateOrNull(series[series.length - 1]?.t)
  const resumo = montarResumoAtivo({
    ticker: sym,
    nome: c.name,
    kind: 'crypto',
    setor: null,
    moeda: 'BRL',
    preco: c.price_brl,
    variacaoDia: c.change_24h_pct,
    data: dataIso,
    numeros: { ...NUMEROS_RESUMO_VAZIOS },
    fonteIndicadores: null,
    min52: null,
    max52: null,
    serie: serieDoResumo(series, []),
    setorMedia: null,
    proventos: null,
    etf: null,
    cripto: {
      valorMercado: c.market_cap_brl,
      volume24h: c.volume_24h_brl,
      dominancia: c.market_cap_dominance_pct,
      rank: c.rank,
      var7d: c.change_7d_pct,
      var30d: c.change_30d_pct,
      min52: c.min_52w_brl,
      max52: c.max_52w_brl,
      supplyCirc: c.circulating_supply,
      supplyMax: c.max_supply,
    },
    links: [],
  })

  return {
    ticker: sym,
    name: c.name,
    kind: 'crypto',
    // o último ponto diário da série (o `last_updated` do /crypto vem com fuso trocado)
    dataDate: dataIso,
    hero: buildCryptoHero(c, sym),
    currentPrice: c.price_brl,
    series12,
    chartStats: buildCryptoStats(c, sym),
    perfil: [],
    fundHeading: ['As variações', `de ${sym}.`],
    fundSub: 'Janelas de variação · preço em reais',
    fcards: buildCryptoCards(c),
    fundInfo: null,
    etfXray: null,
    theses: [],
    dividends: null,
    ai: null,
    news: buildNews(ok(newsR)?.data ?? [], { ticker: sym, change_percent: c.change_24h_pct }, series),
    // Cripto não tem editorial gerado (o pipeline cobre tickers da B3).
    editorial: null,
    cadeia: null,
    pares: null,
    relacionados: [],
    simuladorHref: null,
    resumo,
    seo: resumo
      ? seoDeResumo(resumo)
      : { title: `${sym}: preço em reais`, description: 'Não é recomendação.', faq: [] },
  }
}

/* ————— composable ————— */

export interface AcaoPosition {
  qty: number
}

export async function useAcao(ticker: string) {
  const config = useRuntimeConfig()
  // Server: URL direta do Laravel (sem loopback no próprio Nitro).
  // Client: proxy same-origin /api/backend (zero CORS) — usado pelas tabs.
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
  const clientBase = '/api/backend'
  const { authFetch } = useApi()
  const { isAuthenticated } = useAuthState()

  // A forma vem do util único (tickerClass.ts). Formato 'flex' (AAPL, BTC,
  // AMP) não decide a classe — o DADO decide: se o símbolo existe em
  // `tickers` (universo US do plano US0), é ativo US e segue o fluxo B3-like;
  // 404 na sonda → cripto. Precedência tickers > cripto é deliberada
  // (Ameriprise ganha do token AMP numa plataforma de investimentos).
  const shape = symbolShape(ticker)

  const { data, error } = await useAsyncData<AcaoPayload>(
    `acao:${ticker}`,
    async () => {
      const base = import.meta.server ? serverBase : clientBase
      if (shape === 'b3') return loadAcao(base, ticker)
      const probe = await acaoFetchProfile(base, ticker).catch(() => null)
      return probe?.data ? loadAcao(base, ticker) : loadCrypto(base, ticker)
    },
  )

  // A classe resolvida vem do PAYLOAD (não de variável do callback): na
  // hidratação o callback não roda de novo, o payload SSR é a verdade.
  const isCrypto = data.value?.kind === 'crypto'

  /* tabs 1M/6M/12M: 12M vem do payload SSR; 1M/6M são buscados sob demanda
     no client e cacheados; erro de fetch mantém o range anterior (degrade). */
  const activeRange = ref<AcaoRange>('12mo')
  const rangeSeries = ref<Partial<Record<AcaoRange, AcaoSeriesPair>>>(
    data.value?.series12 ? { '12mo': data.value.series12 } : {},
  )
  const rangeLoading = ref(false)

  async function setRange(mode: AcaoRange) {
    if (mode === activeRange.value) return
    if (rangeSeries.value[mode]) {
      activeRange.value = mode
      return
    }
    rangeLoading.value = true
    try {
      if (isCrypto) {
        const res = await acaoFetchCryptoPrices(clientBase, ticker, CRYPTO_RANGE[mode])
        const pts = toCryptoSeries(res?.data)
        if (pts.length >= 2) {
          rangeSeries.value = { ...rangeSeries.value, [mode]: { asset: pts, ibov: [] } }
          activeRange.value = mode
        }
      } else {
        const [asset, ibov] = await Promise.all([
          acaoFetchPrices(clientBase, ticker, mode),
          acaoFetchIbovPrices(clientBase, mode).catch(() => null),
        ])
        const pts = toSeries(asset?.data)
        if (pts.length >= 2) {
          rangeSeries.value = { ...rangeSeries.value, [mode]: { asset: pts, ibov: toSeries(ibov?.data) } }
          activeRange.value = mode
        }
      }
    } catch { /* mantém o range atual */ } finally {
      rangeLoading.value = false
    }
  }

  const currentSeries = computed<AcaoSeriesPair | null>(
    () => rangeSeries.value[activeRange.value] ?? data.value?.series12 ?? null,
  )

  /* posição do usuário (auth-only, client-only): pill do hero + pill de renda
     na seção de dividendos. Anônimo nunca vê (V1 pública); erro esconde. */
  const position = ref<AcaoPosition | null>(null)
  onMounted(async () => {
    if (!isAuthenticated.value) return
    try {
      // redirectOnAuthError:false — página PÚBLICA que só enriquece com sessão:
      // token vencido limpa a sessão em silêncio em vez de expulsar o visitante
      // pro /login (P0 do DESIGN-SYSTEM §14). Quem leva pro login é a ação que
      // a pessoa pediu, não um enriquecimento em segundo plano.
      const res = await authFetch<{ positions?: Record<string, unknown>[] }>('/portfolio', {}, { redirectOnAuthError: false })
      const pos = (res?.positions ?? []).find((p) => String(p.ticker ?? '').toUpperCase() === ticker)
      const qty = Number(pos?.quantity ?? pos?.qty ?? pos?.shares ?? NaN)
      if (Number.isFinite(qty) && qty > 0) position.value = { qty }
    } catch { /* pill some */ }
  })

  return { data, error, activeRange, setRange, rangeLoading, currentSeries, position }
}

/**
 * Dados do /acao/[ticker] (PR2). Contrato de UX: designs/Redentia Acoes Nu.dc.html.
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
 */
import type {
  AcaoAiReadVM,
  AcaoAiVM,
  AcaoConsensusVM,
  AcaoDividendsVM,
  AcaoFundCard,
  AcaoHeroVM,
  AcaoMetricCard,
  AcaoPayload,
  AcaoPerfilRow,
  AcaoRange,
  AcaoScoreVM,
  AcaoSeriesPair,
  AcaoStatRow,
  AcaoTag,
  AcaoThesisRowVM,
  ConsensusApi,
  DividendApi,
  EditorialApi,
  FundamentalsOverviewApi,
  PricePointApi,
  ScoreRowApi,
  SeriesPoint,
  TickerProfileApi,
} from '~/types/acao'
import type { NewsApi, NuDir, ThesisCardApi } from '~/types/market'

/* ————— helpers de formatação ————— */

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

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
/** 517171740422 → 'R$ 517,17B' (casas conforme o design: 2 no chart, 1 nos cards). */
function moneyBig(v: number, decimals: 1 | 2 = 2): string {
  const nf = decimals === 1 ? nf1 : nf2
  if (Math.abs(v) >= 1e12) return `R$ ${nf.format(v / 1e12)}T`
  if (Math.abs(v) >= 1e9) return `R$ ${nf.format(v / 1e9)}B`
  if (Math.abs(v) >= 1e6) return `R$ ${nf.format(v / 1e6)}M`
  return `R$ ${nf.format(v)}`
}
/** '2026-08-20' → '20 ago 2026'. */
function dateShortPt(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`
}
function localISODate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
/** 'hoje, 09:40' · 'ontem' · '04/07' (formato das linhas de notícia do design). */
function relTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const today = localISODate()
  const yesterday = localISODate(new Date(Date.now() - 86_400_000))
  const day = localISODate(d)
  if (day === today) return `hoje, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (day === yesterday) return 'ontem'
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}
/** 'money_times' → 'Money Times'. */
function sourcePretty(s: string): string {
  return s.replace(/_/g, ' ').replace(/(^|\s)\S/g, (c) => c.toUpperCase())
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
/**
 * 'PETROBRAS   PN      N2' → 'Petrobras'. O ProfileResource devolve o nome
 * bruto da B3 (colunas separadas por espaços múltiplos + sufixo de classe);
 * FIIs usam o trading_name do fundamentals quando existe.
 */
function prettyName(raw: string, fiiTradingName?: string | null): string {
  if (fiiTradingName) return fiiTradingName
  const head = (raw.split(/\s{2,}/)[0] ?? raw)
    .replace(/\s+(ON|PN[AB]?|UNT|UNS|N1|N2|NM|MA|MB|EJ|ED|ER|ES)$/i, '')
    .trim()
  if (!head) return raw
  return head
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
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
  const revenue = num(fd?.total_revenue)
  const netMargin = q?.net_margin ?? (num(fd?.profit_margins) != null ? num(fd?.profit_margins)! * 100 : null)
  const f: Fund = {
    isFii,
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
    ytd: num(ks?.ytd_return) != null ? num(ks?.ytd_return)! * 100 : null,
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

/* ————— builders por seção ————— */

function buildHero(profile: TickerProfileApi, name: string): AcaoHeroVM {
  const price = profile.market_price
  const chg = profile.change_percent
  let changeLine: string | null = null
  let metaLine = ''
  if (price != null && chg != null) {
    const prev = price / (1 + chg / 100)
    const abs = Math.abs(price - prev)
    changeLine = `${chg < 0 ? '-' : '+'}R$ ${nf2.format(abs)} (${nf2.format(Math.abs(chg))}%) hoje`
    metaLine = `fech. anterior R$ ${nf2.format(prev)}`
  }
  // price_at vem 'd/m' SEM ano (gotcha) — usamos como veio, sem parsear.
  if (profile.price_at) metaLine += `${metaLine ? ' · ' : ''}atualizado em ${profile.price_at}`
  return {
    companyLine: `${name} · ${profile.ticker}`,
    ticker: profile.ticker,
    priceFmt: price != null ? `R$ ${nf2.format(price)}` : '—',
    changeLine,
    dir: dirOf(chg ?? 0),
    metaLine,
  }
}

function toSeries(data: PricePointApi[] | undefined | null): SeriesPoint[] {
  return (data ?? [])
    .filter((p) => p.market_price != null && !!p.price_at)
    .map((p) => ({ t: p.price_at, v: p.market_price as number }))
}

function buildChartStats(f: Fund | null): AcaoStatRow[] {
  if (!f) return []
  const rows: AcaoStatRow[] = []
  if (f.marketCap != null) rows.push({ l: 'Valor de Mercado', v: moneyBig(f.marketCap, 2) })
  if (f.dy != null) rows.push({ l: 'Dividend Yield', v: `${nf2.format(f.dy)}%` })
  if (f.pl != null) rows.push({ l: 'P/L (TTM)', v: nf2.format(f.pl) })
  if (f.roe != null) rows.push({ l: 'ROE', v: `${nf1.format(f.roe)}%` })
  if (f.revenue != null) rows.push({ l: 'Receita (12M)', v: moneyBig(f.revenue, 2) })
  if (f.profit != null) rows.push({ l: 'Lucro Líquido (12M)', v: moneyBig(f.profit, 2) })
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
  const m: AcaoMetricCard[] = []
  const push = (label: string, value: string, tag: AcaoTag | null) => m.push({ kind: 'metric', label, value, tag })
  if (f.roe != null) push('ROE', `${nf1.format(f.roe)}%`, tagRoe(f.roe))
  if (f.dy != null) push('Dividend Yield', `${nf2.format(f.dy)}%`, tagDy(f.dy, f.isFii))
  if (f.pl != null) push('P/L', nf2.format(f.pl), tagPl(f.pl))
  if (f.pvp != null) push('P/VP', nf2.format(f.pvp), tagPvp(f.pvp, f.isFii))
  if (f.ev != null && f.ev > 0) push('EV/EBITDA', nf2.format(f.ev), tagEv(f.ev))
  if (f.netMargin != null) push('Margem Líquida', `${nf1.format(f.netMargin)}%`, tagMargin(f.netMargin))
  if (f.revenue != null) push('Receita (12M)', moneyBig(f.revenue, 1), f.revCagr != null ? tagGrowth(f.revCagr) : null)
  if (f.profit != null) push('Lucro Líquido (12M)', moneyBig(f.profit, 1), f.earnGrowth != null ? tagGrowth(f.earnGrowth) : null)
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
  if (f.pl != null && f.pl > 0) {
    const text = f.pl <= 6
      ? `O P/L de ${nf2.format(f.pl)} está entre os mais baixos da bolsa: o mercado paga menos de ${Math.ceil(f.pl)} anos de lucro pela empresa.`
      : f.pl <= 15
        ? `O P/L de ${nf2.format(f.pl)} está em linha com a média da B3: o preço acompanha os fundamentos, sem prêmio nem desconto relevante.`
        : `O P/L de ${nf2.format(f.pl)} embute expectativa alta de crescimento: o mercado paga caro pelos lucros futuros de ${ticker}.`
    insights.push({ kind: 'insight', insight: text, cta: 'Perguntar sobre o valuation', href: '/busca' })
  } else if (f.pvp != null) {
    const text = f.pvp <= 0.95
      ? `O P/VP de ${nf2.format(f.pvp)} indica que a cota negocia abaixo do valor patrimonial: cada R$ 1,00 de patrimônio custa R$ ${nf2.format(f.pvp)}.`
      : `O P/VP de ${nf2.format(f.pvp)} mostra a cota negociando ${f.pvp <= 1.05 ? 'colada no' : 'acima do'} valor patrimonial do fundo.`
    insights.push({ kind: 'insight', insight: text, cta: 'Perguntar sobre o valuation', href: '/busca' })
  }
  if (f.dy != null) {
    const text = f.dy >= 6 && f.fcf != null && f.fcf > 0
      ? `O DY de ${nf2.format(f.dy)}% vem acompanhado de ${moneyBig(f.fcf, 1)} em caixa livre, o fluxo que banca os proventos.`
      : f.dy >= 6
        ? `O DY de ${nf2.format(f.dy)}% coloca ${ticker} entre as boas pagadoras de proventos da B3.`
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
      image: t.image,
      conviction: t.conviction,
      roleStrong,
      roleRest,
    }
  })
}

function buildDividends(divs: DividendApi[], price: number | null, ticker: string): AcaoDividendsVM | null {
  const today = localISODate()
  const rows = divs
    .map((d) => ({ date: d.payment_date, rate: num(d.rate) ?? 0 }))
    .filter((d) => !!d.date && d.rate > 0)
  if (!rows.length) return null

  const cutoff12 = localISODate(new Date(Date.now() - 365 * 86_400_000))
  const cutoff24 = localISODate(new Date(Date.now() - 730 * 86_400_000))
  const last12 = rows.filter((d) => d.date > cutoff12 && d.date <= today)
  const last24 = rows.filter((d) => d.date > cutoff24 && d.date <= today)
  // Ativo que não paga há 24 meses não ganha a seção (esconder > seed errado).
  if (!last24.length) return null

  const sum12 = last12.reduce((a, d) => a + d.rate, 0)
  const dy12 = price != null && price > 0 && sum12 > 0 ? (sum12 / price) * 100 : null

  const statRows: AcaoStatRow[] = []
  if (dy12 != null) statRows.push({ l: 'Dividend Yield (12M)', v: `${nf2.format(dy12)}%` })
  // Payout: não vem em nenhum endpoint público hoje — linha OMITIDA (design a tem).
  // Frequência (heurística da cadência dos últimos 12M): ≥10 Mensal · ≥4 Trimestral · ≥2 Semestral · 1 Anual.
  if (last12.length) {
    const freq = last12.length >= 10 ? 'Mensal' : last12.length >= 4 ? 'Trimestral' : last12.length >= 2 ? 'Semestral' : 'Anual'
    statRows.push({ l: 'Frequência', v: freq })
  }
  const future = rows.filter((d) => d.date > today).sort((a, b) => a.date.localeCompare(b.date))[0]
  if (future) statRows.push({ l: 'Próximo pagamento', v: dateShortPt(future.date) })

  // Barras por ano (design: ano corrente = últimos 12 meses, footnote explica).
  const cy = new Date().getFullYear()
  const byYear = new Map<string, number>()
  for (const d of rows.filter((r) => r.date <= today)) {
    const y = d.date.slice(0, 4)
    byYear.set(y, (byYear.get(y) ?? 0) + d.rate)
  }
  const bars: { year: string; val: number }[] = []
  for (let y = cy - 5; y <= cy; y++) {
    const val = y === cy ? sum12 : byYear.get(String(y)) ?? 0
    if (val > 0) bars.push({ year: String(y), val })
  }
  const max = Math.max(...bars.map((b) => b.val), 0)
  if (!bars.length || max <= 0) return null

  const heading: [string, string] = dy12 != null && dy12 >= 6
    ? ['Uma máquina', 'de dividendos.']
    : dy12 != null && dy12 >= 2
      ? ['Os dividendos', `de ${ticker}.`]
      : ['Os proventos', `de ${ticker}.`]

  return {
    heading,
    subtitle: sum12 > 0
      ? `R$ ${nf2.format(sum12)} por ação nos últimos 12 meses`
      : 'Sem pagamentos nos últimos 12 meses',
    rows: statRows,
    bars: bars.map((b) => ({
      year: b.year,
      valFmt: `R$ ${nf2.format(b.val)}`,
      hPct: Math.round((b.val / max) * 1000) / 10,
      current: b.year === String(cy),
    })),
    sum12,
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
    if (f.fcf != null && f.fcf > 0 && f.dy != null && f.dy >= 4) pros.push(`Caixa livre de ${moneyBig(f.fcf, 1)} cobre os proventos`)
  }
  const conEd = firstSentence(editorial?.thesis_cons, 110)
  if (conEd) cons.push(conEd)
  if (f) {
    if (f.debtEbitda != null && f.debtEbitda > 2) cons.push(`Alavancagem elevada, dívida líquida de ${nf2.format(f.debtEbitda)}× o EBITDA`)
    if (f.pl != null && f.pl > 15) cons.push(`Valuation esticado, P/L ${nf2.format(f.pl)}`)
    if (f.dy != null && f.dy < 2) cons.push(`Dividendos baixos, DY de ${nf2.format(f.dy)}%`)
    if (f.revCagr != null && f.revCagr < 0) cons.push(`Receita encolhendo ${nf1.format(Math.abs(f.revCagr))}% a.a. em 5 anos`)
    if (f.earnGrowth != null && f.earnGrowth < 0) cons.push(`Lucro em queda, ${nf1.format(Math.abs(f.earnGrowth))}% a.a.`)
    if (f.ytd != null && f.ytd < -10) cons.push(`${ticker} cai ${nf1.format(Math.abs(f.ytd))}% no ano`)
    if (cons.length < 2 && f.revCagr != null && f.revCagr < 8) cons.push('Crescimento moderado no longo prazo')
  }
  if (pros.length < 2 || cons.length < 1) return null
  return { pros: pros.slice(0, 3), cons: cons.slice(0, 3) }
}

function buildNews(items: NewsApi[], profile: TickerProfileApi, series12: SeriesPoint[]): AcaoPayload['news'] {
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

/* ————— SEO ————— */

function buildSeo(ticker: string, name: string, profile: TickerProfileApi, f: Fund | null, editorial: EditorialApi | null): AcaoPayload['seo'] {
  const price = profile.market_price
  const priceFmt = price != null ? `R$ ${nf2.format(price)}` : ''
  const title = price != null
    ? `${ticker} hoje: cotação ${priceFmt}, dividendos, fundamentos e análise`
    : `${ticker}: cotação, dividendos, fundamentos e análise`
  const bits: string[] = []
  if (price != null) {
    const chg = profile.change_percent != null ? ` (${pctFmt(profile.change_percent)})` : ''
    bits.push(`Cotação de ${name} (${ticker}) hoje: ${priceFmt}${chg}.`)
  } else {
    bits.push(`${name} (${ticker}) na B3.`)
  }
  const facts: string[] = []
  if (f?.dy != null) facts.push(`dividend yield ${nf2.format(f.dy)}%`)
  if (f?.pl != null && f.pl > 0) facts.push(`P/L ${nf2.format(f.pl)}`)
  if (f?.roe != null) facts.push(`ROE ${nf1.format(f.roe)}%`)
  if (facts.length) bits.push(`${facts.join(', ').replace(/^./, (c) => c.toUpperCase())}.`)
  bits.push('Veja gráfico de 12 meses, histórico de dividendos, Redentia Score, consenso de analistas, notícias e a leitura da Redentia AI.')
  return {
    title,
    description: bits.join(' '),
    faq: (editorial?.faq_extended ?? []).filter((q) => q.question && q.answer).slice(0, 8),
  }
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
  return {
    ticker: 'PETR4',
    name: 'Petrobras',
    isFii: false,
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
      { slug: 'petroleo-e-dividendos-br', title: 'O último ciclo do petróleo', image: '/teses/petroleo-e-dividendos-br.png', conviction: 84, roleStrong: 'máquina de dividendos do pré-sal', roleRest: ', o caixa do fim do ciclo pago a quem espera' },
      { slug: 'a-conta-de-luz-da-ia', title: 'Energia para IA', image: '/teses/a-conta-de-luz-da-ia.png', conviction: 82, roleStrong: 'o gás que segura a base térmica', roleRest: ' enquanto os data centers dobram o consumo' },
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
    seo: {
      title: 'PETR4 hoje: cotação R$ 38,25, dividendos, fundamentos e análise',
      description: 'Cotação de Petrobras (PETR4) hoje: R$ 38,25 (+0,76%). Dividend yield 6,95%, P/L 4,55, ROE 24,2%. Veja gráfico de 12 meses, histórico de dividendos, Redentia Score, consenso de analistas, notícias e a leitura da Redentia AI.',
      faq: [],
    },
  }
}

/* ————— carga SSR ————— */

function statusOf(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

async function loadAcao(base: string, ticker: string): Promise<AcaoPayload> {
  let profile: TickerProfileApi
  try {
    profile = (await acaoFetchProfile(base, ticker)).data
  } catch (e) {
    const status = statusOf(e)
    if (status === 404) {
      throw createError({ statusCode: 404, statusMessage: `Ativo ${ticker} não encontrado` })
    }
    // Backend fora do ar: PETR4 (a página de referência do design) degrada pro
    // seed completo; qualquer outro ticker responde 503 (temporário, não 404 —
    // um 404 transitório envenenaria o índice do Google).
    if (ticker === 'PETR4') return petr4Seed()
    throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })
  }

  // Regex estrita do endpoint /news/ticker (tickers como B3SA3 ficam de fora).
  const newsStrict = /^[A-Z]{4}\d{1,2}$/.test(ticker)
  const [pricesR, ibovR, overviewR, scoreR, consensusR, dividendsR, editorialR, thesesR, newsR] = await Promise.allSettled([
    acaoFetchPrices(base, ticker, '12mo'),
    acaoFetchIbovPrices(base, '12mo'),
    acaoFetchOverview(base, ticker),
    acaoFetchScoreRanking(base),
    acaoFetchConsensus(base, ticker),
    acaoFetchDividends(base, ticker),
    acaoFetchEditorial(base, ticker),
    acaoFetchTheses(base),
    newsStrict ? acaoFetchNewsByTicker(base, ticker) : acaoFetchNewsFiltered(base, ticker),
  ])
  const ok = <X>(r: PromiseSettledResult<X>): X | null => (r.status === 'fulfilled' ? r.value : null)

  const overview = ok(overviewR)?.data ?? null
  const f = extractFund(overview)
  const isFii = f?.isFii ?? profile.type === 'REIT'
  const name = prettyName(profile.name, f?.fiiName)
  // flat, sem wrapper `data` (gotcha documentado no service)
  const editorial = ok(editorialR) ?? null

  const assetSeries = toSeries(ok(pricesR)?.data)
  const ibovSeries = toSeries(ok(ibovR)?.data)
  // Sem série do ativo → seção do gráfico some inteira (nada de linha inventada).
  const series12: AcaoSeriesPair | null = assetSeries.length >= 2 ? { asset: assetSeries, ibov: ibovSeries } : null

  const theses = ok(thesesR)?.data ? await buildTheses(base, ticker, ok(thesesR)!.data) : []

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

  return {
    ticker,
    name,
    isFii,
    hero: buildHero(profile, name),
    currentPrice: profile.market_price,
    series12,
    chartStats: buildChartStats(f),
    perfil: buildPerfil(f),
    fundHeading: isFii ? ['Os números', 'do fundo.'] : ['Os números', 'da empresa.'],
    fcards: buildFundCards(f, ticker),
    theses,
    dividends: buildDividends(ok(dividendsR)?.data ?? [], profile.market_price, ticker),
    ai,
    news: buildNews(ok(newsR)?.data ?? [], profile, assetSeries),
    seo: buildSeo(ticker, name, profile, f, editorial),
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

  const { data, error } = await useAsyncData<AcaoPayload>(
    `acao:${ticker}`,
    () => loadAcao(import.meta.server ? serverBase : clientBase, ticker),
  )

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
      const [asset, ibov] = await Promise.all([
        acaoFetchPrices(clientBase, ticker, mode),
        acaoFetchIbovPrices(clientBase, mode).catch(() => null),
      ])
      const pts = toSeries(asset?.data)
      if (pts.length >= 2) {
        rangeSeries.value = { ...rangeSeries.value, [mode]: { asset: pts, ibov: toSeries(ibov?.data) } }
        activeRange.value = mode
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
      const res = await authFetch<{ positions?: Record<string, unknown>[] }>('/portfolio')
      const pos = (res?.positions ?? []).find((p) => String(p.ticker ?? '').toUpperCase() === ticker)
      const qty = Number(pos?.quantity ?? pos?.qty ?? pos?.shares ?? NaN)
      if (Number.isFinite(qty) && qty > 0) position.value = { qty }
    } catch { /* pill some */ }
  })

  return { data, error, activeRange, setRange, rangeLoading, currentSeries, position }
}

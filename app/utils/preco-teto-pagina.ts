/**
 * Página /calculadora/preco-teto/{TICKER}.
 *
 * A conta é a de ~/utils/preco-teto (a mesma da calculadora). O dividendo que
 * entra no Bazin é o de ~/utils/proventos: renda com data-com em 12 meses, e
 * o DY oficial quando a soma crua não fecha com ele (desdobramento na janela).
 * Somar todo `rate` do /dividends, como a calculadora fazia no client, infla
 * o teto com amortização e com valor pré-grupamento.
 *
 * Página fina não existe. Sem LPA positivo e sem dividendo de renda, o
 * resultado seria um único VPA×1,5 ou uma tabela de zeros. Isso é 404, e o
 * sitemap usa a mesma régua.
 */
import { SETORES_BY_API } from '../content/setores.ts'
import { nomeDaEmpresa } from './nomeB3.ts'
import { bazinPrice, bookValuePrice, computeAll, grahamPrice, plSectorPrice } from './preco-teto.ts'
import { resolveSiteDy, type ProventoRow } from './proventos.ts'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO, juntaAte, tituloQueCabe } from './serp.ts'
import { symbolShape } from './tickerClass.ts'

export const TIPOS_PRECO_TETO = new Set(['STOCK', 'REIT', 'FUND'])

/** Yields da tabela "preço teto para DY de 4% a 12%". 6% é a régua de Bazin. */
export const YIELDS_TABELA = [0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12] as const

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/**
 * O setor do perfil vem em inglês ("Energy", "Health Care", "Financials").
 * O registry da rota /setor usa o slug da API. O que não casa fica com o
 * nome cru e sem link, em vez de um /setor inventado.
 */
const SETOR_ALIAS: Record<string, string> = {
  energy: 'energy',
  utilities: 'utilities',
  industrials: 'industrials',
  technology: 'technology',
  'information-technology': 'technology',
  healthcare: 'healthcare',
  'health-care': 'healthcare',
  'financial-services': 'financial-services',
  financials: 'financial-services',
  financial: 'financial-services',
  'real-estate': 'real-estate',
  'consumer-cyclical': 'consumer-cyclical',
  'consumer-discretionary': 'consumer-cyclical',
  'consumer-defensive': 'consumer-defensive',
  'consumer-staples': 'consumer-defensive',
  'basic-materials': 'basic-materials',
  materials: 'basic-materials',
  'communication-services': 'communication-services',
}

const brlFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const numFmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export interface OverviewPrecoTeto {
  key_statistics?: {
    trailing_eps?: string | number | null
    book_value?: string | number | null
    forward_pe?: string | number | null
    dividend_yield?: string | number | null
  } | null
  scrape_extras?: {
    valuation?: {
      dividend_yield?: number | null
      earnings_per_share?: number | null
      book_value_per_share?: number | null
      price_to_earnings?: number | null
    } | null
    fii?: {
      dividend_yield_12m?: number | null
      book_value_per_share?: number | null
      trading_name?: string | null
    } | null
  } | null
}

export interface LinhaDy {
  /** 4 a 12 */
  pct: number
  teto: number
  bazin: boolean
}

export interface PassoPrecoTeto {
  titulo: string
  linhas: string[]
}

export interface PrecoTetoView {
  ticker: string
  nome: string
  /** 'ação' ou 'cota', no texto */
  unidade: 'ação' | 'cota'
  fii: boolean
  setorNome: string | null
  setorHref: string | null
  preco: number
  dataISO: string | null
  dataTexto: string | null
  lpa: number
  vpa: number
  dividendo: number
  /** 'soma' = proventos de renda que fecham com o DY; 'dy' = yield oficial × cotação */
  dividendoFonte: 'soma' | 'dy' | 'nenhum'
  dyPct: number | null
  sectorPL: number
  sectorPLFonte: 'setor' | 'proprio' | 'referencia' | 'sem-lpa'
  graham: number
  bazin: number
  plSetorial: number
  vpaTeto: number
  consenso: number
  tabela: LinhaDy[]
  passos: PassoPrecoTeto[]
  paragrafo: string
  resposta: string
  faq: { q: string; a: string }[]
  title: string
  description: string
  assetHref: string
  dividendosHref: string | null
}

function num(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

export function brl(v: number): string {
  return brlFmt.format(Number.isFinite(v) ? v : 0)
}

export function numBr(v: number): string {
  return numFmt.format(Number.isFinite(v) ? v : 0)
}

/** 'YYYY-MM-DD' → '26 de outubro de 2026'. String pura, sem fuso. */
export function dataLonga(iso: string | null | undefined): string | null {
  const d = String(iso ?? '').slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null
  const mes = MESES[Number(d.slice(5, 7)) - 1]
  if (!mes) return null
  return `${Number(d.slice(8, 10))} de ${mes} de ${d.slice(0, 4)}`
}

export function lpaDeOverview(ov: OverviewPrecoTeto | null | undefined): number {
  const n = num(ov?.key_statistics?.trailing_eps) || num(ov?.scrape_extras?.valuation?.earnings_per_share)
  return n
}

export function vpaDeOverview(ov: OverviewPrecoTeto | null | undefined): number {
  const n = num(ov?.key_statistics?.book_value)
    || num(ov?.scrape_extras?.valuation?.book_value_per_share)
    || num(ov?.scrape_extras?.fii?.book_value_per_share)
  return n > 0 ? n : 0
}

export function peProprioDeOverview(ov: OverviewPrecoTeto | null | undefined): number {
  return num(ov?.key_statistics?.forward_pe) || num(ov?.scrape_extras?.valuation?.price_to_earnings)
}

/**
 * Dividendo por ação/cota que entra no Bazin.
 *
 * - Histórico com renda que fecha com o DY oficial: a soma (dá para mostrar a conta).
 * - Histórico com renda que NÃO fecha (desdobramento): DY oficial × cotação.
 * - Histórico sem renda em 12 meses: zero, mesmo que o yield indicado seja alto.
 * - Histórico indisponível: DY oficial × cotação, se houver.
 */
export function dividendoParaBazin(input: {
  overviewDy: number | null
  price: number
  rows: readonly ProventoRow[] | null
  today?: string
}): { valor: number; fonte: 'soma' | 'dy' | 'nenhum'; dyPct: number | null } {
  const site = resolveSiteDy({
    overviewDy: input.overviewDy,
    price: input.price,
    rows: input.rows,
    today: input.today,
  })
  const dyPct = site.value != null && site.value > 0 ? site.value : null
  if (site.income12 != null && site.income12 > 0 && site.sumMatches) {
    return { valor: site.income12, fonte: 'soma', dyPct }
  }
  if (dyPct != null && input.price > 0) {
    return { valor: (dyPct / 100) * input.price, fonte: 'dy', dyPct }
  }
  if (site.income12 != null && site.income12 > 0) {
    return { valor: site.income12, fonte: 'soma', dyPct: (site.income12 / input.price) * 100 }
  }
  return { valor: 0, fonte: 'nenhum', dyPct: site.basis === 'sem-renda' ? 0 : dyPct }
}

/** LPA positivo ou dividendo de renda. VPA sozinho não sustenta a página. */
export function paginaPrecoTetoExiste(lpa: number, dividendo: number): boolean {
  return lpa > 0 || dividendo > 0
}

export interface TickerPrecoTetoRow {
  ticker?: string | null
  type?: string | null
  alias_of?: string | null
  market_price?: number | null
}

/** Ticker canônico de ação ou FII com cotação, ou null. Ainda não olha LPA/dividendo. */
export function tickerDePaginaPrecoTeto(row: TickerPrecoTetoRow): string | null {
  if (row.alias_of) return null
  const ticker = String(row.ticker ?? '').trim().toUpperCase()
  if (!ticker || symbolShape(ticker) !== 'b3') return null
  if (!TIPOS_PRECO_TETO.has(String(row.type ?? ''))) return null
  if (!(Number(row.market_price) > 0)) return null
  return ticker
}

export function hrefPrecoTeto(input: {
  type?: string | null
  ticker: string
  lpa: number
  dividendo: number
}): string | null {
  const ticker = tickerDePaginaPrecoTeto({
    ticker: input.ticker,
    type: input.type,
    market_price: 1,
  })
  if (!ticker || !paginaPrecoTetoExiste(input.lpa, input.dividendo)) return null
  return `/calculadora/preco-teto/${ticker}`
}

export function setorDoPapel(sector: string | null | undefined): { nome: string; href: string | null } | null {
  const raw = String(sector ?? '').trim()
  if (!raw) return null
  const slug = raw.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const entry = SETORES_BY_API[SETOR_ALIAS[slug] ?? slug]
  if (!entry) return { nome: raw, href: null }
  return { nome: entry.name, href: `/setor/${entry.ptSlug}` }
}

/**
 * P/L que a calculadora usa: média do setor, senão o P/L do papel se estiver
 * entre 0 e 60, senão 12. Sem LPA o método não roda e o 12 não entra.
 */
export function sectorPlEfetivo(lpa: number, mediaSetor: number | null, peProprio: number): {
  valor: number
  fonte: PrecoTetoView['sectorPLFonte']
} {
  if (!(lpa > 0)) return { valor: 0, fonte: 'sem-lpa' }
  if (mediaSetor != null && mediaSetor > 0) return { valor: mediaSetor, fonte: 'setor' }
  if (peProprio > 0 && peProprio < 60) return { valor: peProprio, fonte: 'proprio' }
  return { valor: 12, fonte: 'referencia' }
}

export function tituloPrecoTeto(ticker: string, temGraham: boolean): string {
  const titulo = temGraham
    ? `Preço teto ${ticker} hoje: Bazin, Graham e justo`
    : `Preço teto ${ticker} hoje: Bazin e rendimento`
  return tituloQueCabe(titulo)
}

export function descricaoPrecoTeto(partes: {
  ticker: string
  nome: string
  preco: string
  bazin: string | null
  graham: string | null
  consenso: string | null
}): string {
  const aviso = 'Não é recomendação.'
  const corpo = juntaAte([
    `Preço teto de ${partes.ticker} (${partes.nome}) hoje.`,
    partes.bazin ? `Bazin ${partes.bazin}.` : null,
    partes.graham ? `Graham ${partes.graham}.` : null,
    partes.consenso ? `Consenso ${partes.consenso}.` : null,
    `Cotação ${partes.preco}.`,
    'Conta passo a passo.',
  ], TETO_DESCRICAO - aviso.length - 1)
  const full = corpo ? `${corpo} ${aviso}` : aviso
  return full.length <= TETO_DESCRICAO ? full : full.slice(0, TETO_DESCRICAO)
}

export interface MontarPrecoTetoInput {
  ticker: string
  nomeBruto: string
  fiiTradingName?: string | null
  tipo: string
  preco: number
  priceDate?: string | null
  setorBruto?: string | null
  lpa: number
  vpa: number
  dividendo: number
  dividendoFonte: 'soma' | 'dy' | 'nenhum'
  dyPct: number | null
  sectorPL: number
  sectorPLFonte: PrecoTetoView['sectorPLFonte']
  temPaginaDividendos: boolean
}

export function montarPrecoTeto(i: MontarPrecoTetoInput): PrecoTetoView | null {
  if (!(i.preco > 0) || !paginaPrecoTetoExiste(i.lpa, i.dividendo)) return null
  const ticker = i.ticker.toUpperCase()
  const fii = i.tipo === 'REIT'
  const unidade: 'ação' | 'cota' = fii ? 'cota' : 'ação'
  const nome = nomeDaEmpresa(i.nomeBruto, i.fiiTradingName) || ticker
  const setor = setorDoPapel(i.setorBruto)
  const calc = computeAll({
    price: i.preco,
    lpa: i.lpa,
    vpa: i.vpa,
    dividend: i.dividendo,
    sectorPL: i.sectorPL,
  })
  if (!calc) return null

  const graham = grahamPrice(i.lpa, i.vpa)
  const bazin = bazinPrice(i.dividendo)
  const plSetorial = plSectorPrice(i.lpa, i.sectorPL)
  const vpaTeto = bookValuePrice(i.vpa)
  const consenso = calc.consensus.averageFairPrice
  const dataISO = /^\d{4}-\d{2}-\d{2}$/.test(String(i.priceDate ?? '').slice(0, 10))
    ? String(i.priceDate).slice(0, 10)
    : null
  const dataTexto = dataLonga(dataISO)
  const temGraham = graham > 0

  const tabela: LinhaDy[] = i.dividendo > 0
    ? YIELDS_TABELA.map((y) => ({ pct: Math.round(y * 100), teto: i.dividendo / y, bazin: y === 0.06 }))
    : []

  const passos = montarPassos({ ...i, ticker, unidade, graham, bazin, plSetorial, vpaTeto, consenso, dataTexto })
  const paragrafo = montarParagrafo({
    nome, ticker, fii, unidade, setorNome: setor?.nome ?? null, preco: i.preco, dataTexto,
    dyPct: i.dyPct, dividendo: i.dividendo, bazin, graham, consenso,
  })
  const resposta = montarResposta({ ticker, preco: i.preco, bazin, graham, consenso, dataTexto })

  const title = tituloPrecoTeto(ticker, temGraham)
  const description = descricaoPrecoTeto({
    ticker,
    nome,
    preco: brl(i.preco),
    bazin: bazin > 0 ? brl(bazin) : null,
    graham: graham > 0 ? brl(graham) : null,
    consenso: consenso > 0 ? brl(consenso) : null,
  })

  return {
    ticker,
    nome,
    unidade,
    fii,
    setorNome: setor?.nome ?? null,
    setorHref: setor?.href ?? null,
    preco: i.preco,
    dataISO,
    dataTexto,
    lpa: i.lpa,
    vpa: i.vpa,
    dividendo: i.dividendo,
    dividendoFonte: i.dividendoFonte,
    dyPct: i.dyPct,
    sectorPL: i.sectorPL,
    sectorPLFonte: i.sectorPLFonte,
    graham,
    bazin,
    plSetorial,
    vpaTeto,
    consenso,
    tabela,
    passos,
    paragrafo,
    resposta,
    faq: montarFaq({ ticker, nome, unidade, preco: i.preco, bazin, graham, consenso, dividendo: i.dividendo, tabela }),
    title,
    description,
    assetHref: `/asset/${ticker}`,
    dividendosHref: i.temPaginaDividendos ? `/dividendos/${ticker}` : null,
  }
}

function posicaoConsenso(preco: number, consenso: number): string {
  if (!(consenso > 0)) return ''
  const m = (consenso - preco) / preco
  const p = pct1.format(Math.abs(m * 100))
  if (m > 0.005) return `A cotação está ${p}% abaixo desse consenso.`
  if (m < -0.005) return `A cotação está ${p}% acima desse consenso.`
  return 'A cotação está junto desse consenso.'
}

function montarResposta(p: {
  ticker: string
  preco: number
  bazin: number
  graham: number
  consenso: number
  dataTexto: string | null
}): string {
  const quando = p.dataTexto ? ` no pregão de ${p.dataTexto}` : ''
  const partes = [`${p.ticker} fechou a ${brl(p.preco)}${quando}.`]
  if (p.consenso > 0) partes.push(`O consenso dos métodos com número é ${brl(p.consenso)}.`)
  if (p.bazin > 0) partes.push(`Pelo Bazin, o preço teto é ${brl(p.bazin)} (dividendo de 12 meses ÷ 6%).`)
  if (p.graham > 0) partes.push(`Pela fórmula de Graham, o preço justo é ${brl(p.graham)}.`)
  partes.push('Não é recomendação de compra ou venda.')
  return partes.join(' ')
}

function montarParagrafo(p: {
  nome: string
  ticker: string
  fii: boolean
  unidade: 'ação' | 'cota'
  setorNome: string | null
  preco: number
  dataTexto: string | null
  dyPct: number | null
  dividendo: number
  bazin: number
  graham: number
  consenso: number
}): string {
  const papel = p.fii ? 'O fundo' : 'A empresa'
  const setor = p.setorNome ? `, no setor ${p.setorNome}` : ''
  const quando = p.dataTexto ? ` no pregão de ${p.dataTexto}` : ''
  const frases = [`${papel} ${p.nome} (${p.ticker})${setor} fechou a ${brl(p.preco)}${quando}.`]
  if (p.dividendo > 0) {
    const dy = p.dyPct != null ? `, dividend yield de ${numBr(p.dyPct)}%` : ''
    frases.push(`O dividendo de renda dos últimos 12 meses foi ${brl(p.dividendo)} por ${p.unidade}${dy}.`)
  } else {
    frases.push(`Não houve dividendo de renda com data-com nos últimos 12 meses, então a régua de Bazin não produz preço teto.`)
  }
  if (p.bazin > 0) frases.push(`Dividindo esse valor por 0,06, o preço teto de Bazin fica em ${brl(p.bazin)}.`)
  if (p.graham > 0) frases.push(`A fórmula de Graham aponta preço justo de ${brl(p.graham)}.`)
  if (p.consenso > 0) {
    frases.push(`A média dos métodos com número, o mesmo consenso da calculadora, é ${brl(p.consenso)}. ${posicaoConsenso(p.preco, p.consenso)}`)
  }
  frases.push('Não é recomendação de compra ou venda.')
  return frases.join(' ')
}

function montarPassos(p: {
  ticker: string
  unidade: 'ação' | 'cota'
  preco: number
  dataTexto: string | null
  lpa: number
  vpa: number
  dividendo: number
  dividendoFonte: 'soma' | 'dy' | 'nenhum'
  dyPct: number | null
  sectorPL: number
  sectorPLFonte: PrecoTetoView['sectorPLFonte']
  graham: number
  bazin: number
  plSetorial: number
  vpaTeto: number
  consenso: number
}): PassoPrecoTeto[] {
  const quando = p.dataTexto ? ` em ${p.dataTexto}` : ''
  const passos: PassoPrecoTeto[] = [{
    titulo: 'Cotação',
    linhas: [`Preço de ${p.ticker}${quando}: ${brl(p.preco)}. É o preço do último pregão, não um preço-alvo.`],
  }]

  if (p.dividendo > 0 && p.bazin > 0) {
    const origem = p.dividendoFonte === 'soma'
      ? `Soma dos proventos de renda com data-com nos últimos 12 meses: ${brl(p.dividendo)} por ${p.unidade}.`
      : `Dividendo implícito no dividend yield oficial de 12 meses${p.dyPct != null ? ` (${numBr(p.dyPct)}%)` : ''}, sobre a cotação: ${brl(p.dividendo)} por ${p.unidade}. A soma crua dos proventos fica de fora quando não fecha com esse yield, o que acontece depois de um desdobramento.`
    passos.push({
      titulo: 'Bazin',
      linhas: [
        origem,
        `Preço teto = ${brl(p.dividendo)} ÷ 0,06 = ${brl(p.bazin)}.`,
        'O 0,06 é o dividend yield mínimo de 6% ao ano da régua de Décio Bazin. Luiz Barsi usa a mesma conta.',
      ],
    })
  } else {
    passos.push({
      titulo: 'Bazin',
      linhas: ['Sem dividendo de renda com data-com nos últimos 12 meses. Bazin não produz preço teto, e a tabela de 4% a 12% também não.'],
    })
  }

  if (p.graham > 0) {
    const produto = 22.5 * p.lpa * p.vpa
    passos.push({
      titulo: 'Graham',
      linhas: [
        `LPA ${brl(p.lpa)} e VPA ${brl(p.vpa)}.`,
        `22,5 × ${numBr(p.lpa)} × ${numBr(p.vpa)} = ${numBr(produto)}.`,
        `Preço justo = √${numBr(produto)} = ${brl(p.graham)}.`,
        'O 22,5 é 15 × 1,5: o P/L e o P/VP máximos que Graham usava como filtro do investidor defensivo.',
      ],
    })
  } else if (!(p.lpa > 0)) {
    passos.push({
      titulo: 'Graham',
      linhas: ['O LPA não é positivo. A fórmula de Graham não se aplica a papel sem lucro nos últimos 12 meses.'],
    })
  } else {
    passos.push({
      titulo: 'Graham',
      linhas: ['Não há VPA positivo. A fórmula de Graham precisa de lucro e de patrimônio por ação.'],
    })
  }

  if (p.plSetorial > 0) {
    const origem = p.sectorPLFonte === 'setor'
      ? `P/L médio do setor: ${numBr(p.sectorPL)}.`
      : p.sectorPLFonte === 'proprio'
        ? `Sem média publicada do setor. Entrou o P/L do próprio papel, ${numBr(p.sectorPL)}, a mesma regra da calculadora quando o múltiplo está entre 0 e 60.`
        : 'Sem média do setor e sem P/L próprio utilizável. A calculadora usa 12 como referência.'
    passos.push({
      titulo: 'P/L setorial',
      linhas: [
        origem,
        `Preço teto = ${brl(p.lpa)} × ${numBr(p.sectorPL)} = ${brl(p.plSetorial)}.`,
      ],
    })
  }

  if (p.vpaTeto > 0) {
    passos.push({
      titulo: 'Valor patrimonial',
      linhas: [`Preço teto = ${brl(p.vpa)} × 1,5 = ${brl(p.vpaTeto)}. O 1,5 é o mesmo P/VP máximo da fórmula de Graham.`],
    })
  }

  const validos = [p.graham, p.bazin, p.plSetorial, p.vpaTeto].filter((n) => n > 0)
  if (validos.length && p.consenso > 0) {
    passos.push({
      titulo: 'Consenso',
      linhas: [
        `Média dos métodos com número: (${validos.map((n) => brl(n)).join(' + ')}) ÷ ${validos.length} = ${brl(p.consenso)}.`,
        'O método projetivo fica de fora: ele repete o Bazin sobre o mesmo dividendo e puxaria a média.',
        posicaoConsenso(p.preco, p.consenso),
      ].filter(Boolean),
    })
  }
  return passos
}

function montarFaq(p: {
  ticker: string
  nome: string
  unidade: 'ação' | 'cota'
  preco: number
  bazin: number
  graham: number
  consenso: number
  dividendo: number
  tabela: LinhaDy[]
}): { q: string; a: string }[] {
  const seis = p.tabela.find((l) => l.bazin)
  const faq: { q: string; a: string }[] = [{
    q: `Qual o preço teto de ${p.ticker} hoje?`,
    a: p.consenso > 0
      ? `O consenso dos métodos com número para ${p.nome} (${p.ticker}) é ${brl(p.consenso)}, com a cotação a ${brl(p.preco)}. ${p.bazin > 0 ? `Bazin: ${brl(p.bazin)}. ` : ''}${p.graham > 0 ? `Graham: ${brl(p.graham)}. ` : ''}O consenso é a média, a mesma conta da calculadora de preço teto. Não é recomendação de compra ou venda.`
      : `Não há métodos com número suficiente para um consenso de ${p.ticker} hoje.`,
  }]

  faq.push({
    q: `Qual o preço teto de ${p.ticker} pelo método de Bazin?`,
    a: p.bazin > 0
      ? `Pelo Bazin, o preço teto de ${p.ticker} é ${brl(p.bazin)}: dividendo de renda dos últimos 12 meses (${brl(p.dividendo)} por ${p.unidade}) dividido por 0,06. Luiz Barsi usa a mesma divisão. Não é recomendação.`
      : `${p.ticker} não teve dividendo de renda com data-com nos últimos 12 meses. Sem esse número, o preço teto de Bazin não existe.`,
  })

  faq.push({
    q: `Qual o preço justo de ${p.ticker} pela fórmula de Graham?`,
    a: p.graham > 0
      ? `O preço justo de ${p.ticker} pela fórmula de Graham é ${brl(p.graham)}, a raiz de 22,5 × LPA × VPA. É um teto de filtro, não uma previsão de para onde a cotação vai.`
      : `A fórmula de Graham não se aplica a ${p.ticker} com os números atuais: ela exige LPA e VPA positivos. Fundo imobiliário e empresa sem lucro ficam de fora dessa conta.`,
  })

  faq.push({
    q: `Qual o preço teto de ${p.ticker} para um dividend yield de 6%?`,
    a: seis
      ? `Para um dividend yield de 6%, o preço teto de ${p.ticker} é ${brl(seis.teto)}. É a linha de 6% da tabela, e coincide com o Bazin. As outras linhas mostram o teto se a régua for de 4% a 12%.`
      : `Sem dividendo de renda em 12 meses, não há preço teto de ${p.ticker} para yield de 6% nem para as outras faixas de 4% a 12%.`,
  })

  faq.push({
    q: `O preço teto de ${p.ticker} é recomendação de compra?`,
    a: `Não. O preço teto de ${p.ticker} é a régua de Bazin, Graham, P/L setorial e valor patrimonial sobre os números dos últimos 12 meses. Diz até onde cada método chega. Não diz se a pessoa deve comprar, vender ou manter ${p.ticker}.`,
  })
  return faq
}

/** Título visível no Google: o da página mais ` · Redentia`, no teto de 60. */
export function tituloVisivel(titulo: string): string {
  return titulo + SUFIXO_MARCA
}

export function tituloCabeNoSerp(titulo: string): boolean {
  return tituloVisivel(titulo).length <= TETO_TITULO
}

export interface ElegivelSitemap {
  ticker: string
  lastmod?: string
}

/**
 * Junta a checagem desta geração com a lista anterior.
 * Falha de rede não tira do sitemap quem já estava: um 429 no build
 * apagaria PETR4 do índice. 'nao' confirmado (sem LPA e sem dividendo) sai.
 */
export function mesclarSitemapPrecoTeto(
  anteriores: ElegivelSitemap[],
  checagens: { ticker: string; status: 'sim' | 'nao' | 'falha'; lastmod?: string }[],
): ElegivelSitemap[] {
  const velho = new Map(anteriores.map((t) => [t.ticker, t]))
  const saida = new Map<string, ElegivelSitemap>()
  for (const c of checagens) {
    if (c.status === 'sim') {
      const item: ElegivelSitemap = { ticker: c.ticker }
      if (c.lastmod) item.lastmod = c.lastmod
      saida.set(c.ticker, item)
    } else if (c.status === 'falha') {
      const previo = velho.get(c.ticker)
      if (previo) saida.set(c.ticker, previo)
    }
  }
  return [...saida.values()].sort((a, b) => a.ticker.localeCompare(b.ticker))
}

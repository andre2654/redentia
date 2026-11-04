/**
 * Texto único de /asset/{TICKER}, só com número que o chamador já tem.
 *
 * Cada frase sai inteira ou não sai: campo null não vira "R$ ", "de %" nem
 * "setor .". Linguagem descritiva. O aviso é o mesmo da calculadora de preço
 * teto ("Não é recomendação de compra ou venda.").
 *
 * Não consulta a API. Quem chama (useAcao) entrega o que o SSR já baixou.
 */
import type { NuFaqItem } from '../types/market'
import { TETO_DESCRICAO, TETO_TITULO_PAGINA, descricaoQueCabe, juntaAte, tituloQueCabe } from './serp.ts'

export const AVISO_RESUMO = 'Não é recomendação de compra ou venda.'
const AVISO_META = 'Não é recomendação.'

export type ResumoKind = 'stock' | 'fii' | 'bdr' | 'etf' | 'crypto'

export interface ResumoNumeros {
  dy: number | null
  pl: number | null
  pvp: number | null
  roe: number | null
  margem: number | null
  valorMercado: number | null
  vpCota: number | null
  rendaMedia24m: number | null
  ifix: number | null
  cotistas: number | null
}

export interface ResumoAno {
  ano: string
  valor: number
  corrente: boolean
}

export interface ResumoProventos {
  unidade: 'ação' | 'cota'
  renda12: number
  eventos12: number
  capital12: number
  frequencia: string | null
  /** 'a definir' ou uma data já legível ('21 dez 2026') */
  proximo: string | null
  anos: ResumoAno[]
  /** 'capital' quando as barras do ano são amortização, não renda */
  tipo: 'renda' | 'capital'
}

export interface ResumoSerie {
  de: string
  ate: string
  variacao: number
  ibov: number | null
}

export interface ResumoSetorMedia {
  variacao: number
  papeis: number | null
  /**
   * Variação do próprio papel na mesma resposta da média. A comparação não
   * é publicada: o ranking fica em cache até 6 h e não traz data da leitura.
   */
  variacaoAtivo: number | null
  /** 'YYYY-MM-DD' dessa leitura, quando a lista traz price_date */
  data: string | null
}

export interface ResumoEtf {
  taxaAdm: number | null
  posicoes: number | null
  maiorNome: string | null
  /** peso da maior posição, em % (0–100) */
  maiorPeso: number | null
  fonte: string | null
  /** 'YYYY-MM-DD' da carteira, quando a API manda */
  competencia: string | null
}

export interface ResumoCripto {
  valorMercado: number | null
  volume24h: number | null
  dominancia: number | null
  rank: number | null
  var7d: number | null
  var30d: number | null
  min52: number | null
  max52: number | null
  supplyCirc: number | null
  supplyMax: number | null
}

export interface ResumoLink {
  href: string
  label: string
}

export interface ResumoAtivoInput {
  ticker: string
  nome: string
  kind: ResumoKind
  /** nome pt-BR do registry ('Energia'); null quando o setor não casa */
  setor: string | null
  moeda: 'BRL' | 'USD'
  preco: number | null
  /** variação do pregão (B3) ou de 24 horas (cripto), em pontos percentuais */
  variacaoDia: number | null
  /** 'YYYY-MM-DD' do pregão ou do último ponto da série */
  data: string | null
  numeros: ResumoNumeros
  /** rótulo da fonte dos indicadores; null = a frase de indicadores não cita fonte */
  fonteIndicadores: string | null
  min52: number | null
  max52: number | null
  serie: ResumoSerie | null
  /**
   * Média do setor. O texto não usa este campo: o ranking não tem data da
   * leitura. null.
   */
  setorMedia: ResumoSetorMedia | null
  proventos: ResumoProventos | null
  etf: ResumoEtf | null
  cripto: ResumoCripto | null
  links: ResumoLink[]
}

/** Um pedaço de frase; `n` marca o número em destaque. */
export interface ResumoTrecho { t: string; n?: boolean }
export type ResumoFrase = ResumoTrecho[]

/**
 * O mesmo resumo, para ler (03/11/2026, o dono: "esse texto aqui também não
 * ficou legal"): frases curtas com o número em destaque, os indicadores numa
 * lista, os proventos por ano numa fileira de números e as fontes juntas numa
 * linha no fim, com a data uma vez só. Os números, as fontes e as datas são os
 * dos `paragrafos` (que seguem para o chat e para os testes); só a forma muda.
 */
export interface ResumoFatos {
  titulo: string
  frases: ResumoFrase[]
  indicadores: { rotulo: string; valor: string }[]
  /** o que é janela de 12 meses e o que é de hoje */
  indicadoresNota: string | null
  proventos: {
    frases: ResumoFrase[]
    /**
     * um por ano com data-com; o ano corrente é "2026 até agora", e a última
     * linha, quando houver, é a janela de 12 meses ("Últimos 12 meses", `doze`)
     */
    anos: { rotulo: string; valor: string; corrente: boolean; doze?: boolean }[]
    legenda: string
  } | null
  fontes: string | null
}

export interface AcaoResumoVM {
  h1: string
  title: string
  description: string
  paragrafos: string[]
  fatos: ResumoFatos
  links: ResumoLink[]
  faqTitulo: string | null
  faq: NuFaqItem[]
  aviso: string
}

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const QUEBRADA = /R\$(?!\s*\d)|US\$(?!\s*\d)|(?:^|\s)%|de\s*%|Fonte:\s*$|Fonte:\s*\.|setor\s*\.|m[eé]dia de\s*%|\(\s*\)|\b(?:undefined|null|NaN)\b/

/**
 * Selos copiados de /metodologia. Cripto não entra: a página não nomeia provedor.
 * - cotação do pregão: tabela "Cotações intraday", origem Brapi (B3), cron de 10 a 30 min
 * - faixa de 52 semanas e série (ticker_historical_prices_si, scrape_extras): scrape diário do StatusInvest
 * - P/L, P/VP, ROE, margens: "StatusInvest, base em DFP/ITR"
 */
export const FONTE_COTACAO = 'Brapi (B3), atualização de 10 a 30 min'
export const FONTE_SERIE = 'StatusInvest (dados diários)'
/** Fundamentalistas de empresa listada: tabela de /metodologia (DFP/ITR). */
export const FONTE_FUNDAMENTALISTAS = 'StatusInvest, base em DFP/ITR'
/**
 * FII (scrape_extras.fii) e BDR (scrape_extras.valuation/quality) vêm do mesmo
 * scraper. DFP/ITR não descreve informe de fundo nem DRE da matriz em dólar.
 */
export const FONTE_SCRAPER = 'StatusInvest'
/** Nota do hero quando a moeda do perfil é dólar. */
const FONTE_USD = 'preço de referência derivado do BDR e do câmbio'

function ok(n: number | null | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n)
}

function dataBr(iso: string | null | undefined): string | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
}

function moedaDe(moeda: 'BRL' | 'USD'): string {
  return moeda === 'USD' ? 'US$' : 'R$'
}

function precoFmt(v: number, kind: ResumoKind, moeda: 'BRL' | 'USD'): string {
  const cur = moedaDe(moeda)
  if (kind === 'crypto' && Math.abs(v) >= 1000) return `${cur} ${nf0.format(v)}`
  return `${cur} ${nf2.format(v)}`
}

function moneyBig(v: number, moeda: 'BRL' | 'USD' = 'BRL'): string {
  const cur = moedaDe(moeda)
  const a = Math.abs(v)
  if (a >= 1e12) return `${cur} ${nf2.format(v / 1e12)}T`
  if (a >= 1e9) return `${cur} ${nf2.format(v / 1e9)}B`
  if (a >= 1e6) return `${cur} ${nf2.format(v / 1e6)}M`
  return `${cur} ${nf2.format(v)}`
}

function pctAssinado(n: number): string {
  return `${n > 0 ? '+' : ''}${nf2.format(n)}%`
}

function pctAbs(n: number, casas: 1 | 2 = 2): string {
  return `${(casas === 1 ? nf1 : nf2).format(n)}%`
}

function juntar(partes: string[]): string {
  if (partes.length <= 1) return partes[0] ?? ''
  return `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`
}

function limpa(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').trim()
}

function empurra(arr: string[], s: string | null | undefined): void {
  if (!s) return
  const t = limpa(s)
  if (t.length < 12 || !/[A-Za-zÀ-ÿ]/.test(t) || QUEBRADA.test(t)) return
  arr.push(t)
}

function setorBaixo(setor: string | null): string | null {
  const s = setor?.replace(/\s+/g, ' ').trim()
  return s ? s.toLowerCase() : null
}

function linksLimpos(links: ResumoLink[]): ResumoLink[] {
  const out: ResumoLink[] = []
  const vistos = new Set<string>()
  for (const l of links) {
    const href = (l.href ?? '').trim()
    const label = limpa(l.label ?? '')
    if (!href.startsWith('/') || href.includes(' ') || label.length < 2) continue
    // O preço teto já tem link na página (relacionados e, quando cabe, o gráfico).
    if (href.startsWith('/calculadora/preco-teto')) continue
    if (vistos.has(href)) continue
    vistos.add(href)
    out.push({ href, label })
  }
  return out
}

/** Cotação ao vivo. Cripto devolve vazio: /metodologia não nomeia provedor. */
function fonteCotacao(i: ResumoAtivoInput): string {
  if (i.kind === 'crypto') return ''
  if (i.moeda === 'USD') return ` Fonte: ${FONTE_USD}. ${FONTE_COTACAO}.`
  return ` Fonte: ${FONTE_COTACAO}.`
}

/** Faixa de 52 semanas e série diária, com a data do dado quando ela existe. */
function fonteSerie(iso: string | null | undefined): string {
  const d = dataBr(iso)
  return d ? ` Fonte: ${FONTE_SERIE}, em ${d}.` : ` Fonte: ${FONTE_SERIE}.`
}

function temProventoNoTitulo(i: ResumoAtivoInput): boolean {
  const p = i.proventos
  return !!p && (p.renda12 > 0 || p.anos.some((a) => a.valor > 0))
}

/** Cauda depois do nome. Classe primeiro; "e dividendos" ou "na B3" na ação. */
function caudaTitulo(i: ResumoAtivoInput): string {
  if (i.kind === 'crypto') return ': preço em reais'
  if (i.kind === 'fii') return ', FII'
  if (i.kind === 'bdr') return ', BDR'
  if (i.kind === 'etf') return ', ETF'
  if (temProventoNoTitulo(i)) return ' e dividendos'
  return ' na B3'
}

function titulo(i: ResumoAtivoInput): string {
  const cauda = caudaTitulo(i)
  if (i.kind === 'crypto') {
    const comNome = `${i.nome} (${i.ticker})${cauda}`
    if (comNome.length <= TETO_TITULO_PAGINA) return comNome
    const soTicker = `${i.ticker}${cauda}`
    return soTicker.length <= TETO_TITULO_PAGINA ? soTicker : tituloQueCabe(soTicker)
  }
  const prefixo = `${i.ticker} cotação hoje: `
  const cheio = `${prefixo}${i.nome}${cauda}`
  if (cheio.length <= TETO_TITULO_PAGINA) return cheio
  const orcamento = TETO_TITULO_PAGINA - prefixo.length - cauda.length
  if (orcamento >= 3) {
    const nome = tituloQueCabe(i.nome, orcamento)
    const montado = `${prefixo}${nome}${cauda}`
    if (nome && montado.length <= TETO_TITULO_PAGINA) return montado
  }
  const semNome = `${i.ticker} cotação hoje${cauda}`
  return semNome.length <= TETO_TITULO_PAGINA ? semNome : tituloQueCabe(`${i.ticker} cotação hoje`)
}

function h1De(i: ResumoAtivoInput): string {
  const quem = `${i.nome} (${i.ticker})`
  if (i.kind === 'fii') return `${quem}, fundo imobiliário`
  if (i.kind === 'bdr') return `${quem}, BDR`
  if (i.kind === 'etf') return `${quem}, ETF`
  if (i.kind === 'crypto') return `${quem}, preço em reais`
  const setor = setorBaixo(i.setor)
  if (setor) return `${quem}, setor ${setor}`
  return `${quem} na B3`
}

function classe(i: ResumoAtivoInput): string {
  if (i.kind === 'fii') return 'um fundo imobiliário negociado na B3'
  if (i.kind === 'bdr') return 'um BDR negociado na B3, recibo de ações de uma empresa estrangeira'
  if (i.kind === 'etf') return 'um ETF negociado na B3'
  if (i.kind === 'crypto') return 'um criptoativo'
  return 'uma ação negociada na B3'
}

function variacaoDiaFrase(i: ResumoAtivoInput): string | null {
  if (!ok(i.variacaoDia)) return null
  return i.kind === 'crypto'
    ? `variação de ${pctAssinado(i.variacaoDia)} em 24 horas`
    : `variação de ${pctAssinado(i.variacaoDia)} no dia`
}

function paragrafoIdentidade(i: ResumoAtivoInput): string | null {
  const quem = `${i.nome} (${i.ticker})`
  const partes: string[] = []
  if (i.kind === 'crypto') {
    // Sem número: o backend não deixa claro se a cotação é CoinGecko ou StatusInvest.
    // O preço continua no hero e no gráfico, que esta frase só aponta.
    return `${quem} é um criptoativo. A cotação em reais está no topo desta página, e o gráfico fica abaixo do título.`
  }
  partes.push(`${quem} é ${classe(i)}.`)
  const setor = setorBaixo(i.setor)
  if (setor && !(i.kind === 'fii' && setor === 'imobiliário')) partes.push(`O setor é ${setor}.`)
  if (ok(i.preco)) partes.push(fraseCotacao(i))
  const faixa = faixa52(i.min52, i.max52, i.kind, i.moeda, i.kind === 'crypto' ? '' : fonteSerie(i.data))
  if (faixa && i.kind !== 'crypto') partes.push(faixa)
  return partes.join(' ')
}

/**
 * Cotação ao vivo, não o fechamento de um pregão encerrado. O selo é o da
 * tabela de cotações intraday em /metodologia. Cripto não passa por aqui.
 */
function fraseCotacao(i: ResumoAtivoInput): string {
  const quando = dataBr(i.data)
  const variacao = variacaoDiaFrase(i)
  const extra = variacao ? `, com ${variacao}` : ''
  const preco = precoFmt(i.preco as number, i.kind, i.moeda)
  const atualizada = quando ? `, atualizada em ${quando}` : ''
  return `A cotação mais recente é ${preco}${atualizada}${extra}.${fonteCotacao(i)}`
}

function faixa52(min: number | null, max: number | null, kind: ResumoKind, moeda: 'BRL' | 'USD', fonte = ''): string | null {
  const a = ok(min) && min > 0 ? precoFmt(min, kind, moeda) : null
  const b = ok(max) && max > 0 ? precoFmt(max, kind, moeda) : null
  const corpo = a && b
    ? `A mínima de 52 semanas foi ${a} e a máxima foi ${b}.`
    : a
      ? `A mínima de 52 semanas foi ${a}.`
      : b
        ? `A máxima de 52 semanas foi ${b}.`
        : null
  return corpo ? `${corpo}${fonte}` : null
}

/** Trailing 12 meses: DY, P/L, ROE e margem. P/VP e valor de mercado ficam de fora. */
function indicadores12m(n: ResumoNumeros): string[] {
  const partes: string[] = []
  if (ok(n.dy)) partes.push(`dividend yield de ${pctAbs(n.dy)}`)
  if (ok(n.pl)) partes.push(`P/L de ${nf2.format(n.pl)}`)
  if (ok(n.roe)) partes.push(`ROE de ${pctAbs(n.roe, 1)}`)
  if (ok(n.margem)) partes.push(`margem líquida de ${pctAbs(n.margem, 1)}`)
  return partes
}

/** Números de um instante, não de uma janela de 12 meses. */
function indicadoresPonto(n: ResumoNumeros, moeda: 'BRL' | 'USD'): string[] {
  const partes: string[] = []
  if (ok(n.pvp)) partes.push(`o P/VP é ${nf2.format(n.pvp)}`)
  if (ok(n.valorMercado) && n.valorMercado > 0) partes.push(`o valor de mercado é ${moneyBig(n.valorMercado, moeda)}`)
  if (ok(n.vpCota) && n.vpCota > 0) partes.push(`o valor patrimonial por cota é ${precoFmt(n.vpCota, 'fii', 'BRL')}`)
  if (ok(n.rendaMedia24m) && n.rendaMedia24m > 0) partes.push(`a renda média por cota em 24 meses é ${precoFmt(n.rendaMedia24m, 'fii', 'BRL')}`)
  if (ok(n.ifix)) partes.push(`a participação no IFIX é ${pctAbs(n.ifix)}`)
  if (ok(n.cotistas) && n.cotistas > 0) partes.push(`há ${nf0.format(n.cotistas)} cotistas`)
  return partes
}

function paragrafoIndicadores(i: ResumoAtivoInput): string | null {
  const moeda = i.moeda === 'USD' && i.kind !== 'bdr' ? 'USD' : 'BRL'
  const doze = indicadores12m(i.numeros)
  const ponto = indicadoresPonto(i.numeros, moeda)
  if (!doze.length && !ponto.length) return null
  const frases: string[] = []
  if (doze.length) frases.push(`Indicadores dos últimos 12 meses de ${i.ticker}: ${juntar(doze)}.`)
  if (ponto.length) {
    const texto = juntar(ponto)
    frases.push(`${texto.charAt(0).toUpperCase()}${texto.slice(1)}.`)
  }
  const fonte = i.fonteIndicadores?.trim()
  if (fonte) frases.push(`Fonte: ${fonte}.`)
  return frases.join(' ')
}

function paragrafoSerie(i: ResumoAtivoInput): string | null {
  if (i.kind === 'crypto') return null
  const s = i.serie
  if (!s || !ok(s.variacao)) return null
  const de = dataBr(s.de)
  const ate = dataBr(s.ate)
  if (!de || !ate) return null
  const ibov = ok(s.ibov) ? ` No mesmo período, o Ibovespa variou ${pctAssinado(s.ibov)}.` : ''
  // A série e o Ibovespa saem do scrape diário (ticker_historical_prices_si).
  return `De ${de} a ${ate}, ${i.ticker} variou ${pctAssinado(s.variacao)}.${ibov}${fonteSerie(s.ate)}`
}

function fraseAnos(anos: ResumoAno[], oQue: string): string | null {
  const uteis = anos.filter((a) => ok(a.valor) && a.valor > 0 && /^\d{4}$/.test(a.ano))
  if (!uteis.length) return null
  const lista = uteis.map((a) => a.corrente
    ? `${a.ano} até agora, ${precoFmt(a.valor, 'stock', 'BRL')}`
    : `${a.ano}, ${precoFmt(a.valor, 'stock', 'BRL')}`)
  return `Por ano, ${oQue}: ${lista.join('; ')}.`
}

function paragrafoProventos(i: ResumoAtivoInput): string | null {
  const p = i.proventos
  if (!p) return null
  const partes: string[] = []
  const unidade = p.unidade
  if (p.tipo === 'capital' && ok(p.capital12) && p.capital12 > 0) {
    partes.push(`Nos últimos 12 meses, ${i.ticker} não teve provento de renda com data-com. A amortização no período soma ${precoFmt(p.capital12, 'stock', 'BRL')} por ${unidade}. Amortização devolve capital e fica fora do dividend yield.`)
    const anos = fraseAnos(p.anos, 'a amortização com data-com')
    if (anos) partes.push(anos)
  }
  else if (ok(p.renda12) && p.renda12 > 0) {
    const n = ok(p.eventos12) && p.eventos12 > 0
      ? `, em ${nf0.format(p.eventos12)} ${p.eventos12 === 1 ? 'provento' : 'proventos'}`
      : ''
    const nome = i.kind === 'fii' ? 'rendimentos' : 'proventos de renda'
    partes.push(`Nos últimos 12 meses, a soma dos ${nome} de ${i.ticker} com data-com foi de ${precoFmt(p.renda12, 'stock', 'BRL')} por ${unidade}${n}.`)
    if (p.frequencia?.trim()) partes.push(`A cadência observada nesse período é ${p.frequencia.trim().toLowerCase()}.`)
    if (ok(p.capital12) && p.capital12 > 0) {
      partes.push(`No mesmo período houve ${precoFmt(p.capital12, 'stock', 'BRL')} por ${unidade} em amortização, fora dessa soma.`)
    }
    const anos = fraseAnos(p.anos, i.kind === 'fii' ? 'os rendimentos com data-com' : 'os dividendos e JCP com data-com')
    if (anos) partes.push(anos)
  }
  else if (p.renda12 === 0) {
    partes.push(`Não houve provento de renda com data-com nos últimos 12 meses de ${i.ticker}.`)
    const anos = fraseAnos(p.anos, i.kind === 'fii' ? 'os rendimentos com data-com' : 'os dividendos e JCP com data-com')
    if (anos) partes.push(anos)
  }
  if (p.proximo === 'a definir') partes.push('O próximo pagamento está a definir.')
  else if (p.proximo?.trim()) partes.push(`O próximo pagamento previsto é ${p.proximo.trim()}.`)
  if (!partes.length) return null
  partes.push('Fonte: avisos de proventos da B3.')
  return partes.join(' ')
}

function paragrafoEtf(i: ResumoAtivoInput): string | null {
  const e = i.etf
  if (!e) return null
  const partes: string[] = []
  const comp = dataBr(e.competencia)
  if (ok(e.posicoes) && e.posicoes > 0) {
    partes.push(comp
      ? `A carteira de ${comp} reúne ${nf0.format(e.posicoes)} posições.`
      : `A carteira informada reúne ${nf0.format(e.posicoes)} posições.`)
  }
  else if (comp) {
    partes.push(`A carteira informada é a de ${comp}.`)
  }
  if (e.maiorNome?.trim() && ok(e.maiorPeso) && e.maiorPeso > 0) {
    partes.push(`A maior posição é ${e.maiorNome.trim()}, com ${pctAbs(e.maiorPeso)} do fundo.`)
  }
  if (ok(e.taxaAdm)) partes.push(`A taxa de administração informada é de ${pctAbs(e.taxaAdm)} ao ano.`)
  if (!partes.length) return null
  if (e.fonte?.trim()) partes.push(`Fonte: ${e.fonte.trim()}.`)
  return partes.join(' ')
}

/** DY e P/L (ou P/VP). Sem o número, a frase não entra. */
function indicadoresMeta(i: ResumoAtivoInput): string[] {
  if (i.kind !== 'stock' && i.kind !== 'fii' && i.kind !== 'bdr') return []
  const n = i.numeros
  const out: string[] = []
  if (ok(n.dy)) out.push(`Dividend yield ${pctAbs(n.dy)}`)
  if (ok(n.pl)) out.push(`P/L ${nf2.format(n.pl)}`)
  else if (ok(n.pvp)) out.push(`P/VP ${nf2.format(n.pvp)}`)
  if (!out.length && i.etf && ok(i.etf.taxaAdm)) out.push(`Taxa de administração ${pctAbs(i.etf.taxaAdm)} ao ano`)
  return out
}

function cotacaoMeta(i: ResumoAtivoInput, nome: string | null): string {
  const quem = nome ? ` (${nome})` : ''
  const quando = dataBr(i.data)
  const preco = ok(i.preco) ? precoFmt(i.preco, i.kind, i.moeda) : null
  const fonte = i.moeda === 'USD' ? 'preço de referência' : 'Brapi'
  if (!preco) return `Cotação ${i.ticker}${quem} hoje sem número de fechamento.`
  if (!quando) return `Cotação ${i.ticker}${quem} hoje: ${preco}, sem data de fechamento (${fonte}).`
  return `Cotação ${i.ticker}${quem} hoje: ${preco} no fechamento de ${quando} (${fonte}).`
}

function corpoMeta(i: ResumoAtivoInput, nome: string | null, indicadores: string[]): string {
  const quote = cotacaoMeta(i, nome)
  if (!indicadores.length) return quote
  return `${quote} ${indicadores.join(', ')} (StatusInvest).`
}

function descricao(i: ResumoAtivoInput): string {
  if (i.kind === 'crypto') {
    const frases = [
      `${i.ticker} (${i.nome}) é um criptoativo.`,
      'A cotação em reais está nesta página.',
    ]
    const corpo = juntaAte(frases, TETO_DESCRICAO - AVISO_META.length - 1)
    return corpo ? `${corpo} ${AVISO_META}` : AVISO_META
  }
  const orcamento = TETO_DESCRICAO - AVISO_META.length - 1
  const nomeCheio = i.nome.replace(/\s+/g, ' ').trim()
  let indicadores = indicadoresMeta(i)
  let corpo = ''
  let coube = false
  const tentar = (nome: string | null, lista: string[]): boolean => {
    const candidato = corpoMeta(i, nome, lista)
    if (candidato.length > orcamento) return false
    corpo = candidato
    coube = true
    return true
  }
  // P/L (ou P/VP) sai antes do dividend yield. O nome longo encolhe no espaço.
  while (!coube) {
    if (tentar(nomeCheio || null, indicadores)) break
    if (nomeCheio) {
      const base = corpoMeta(i, null, indicadores)
      const tetoNome = orcamento - base.length - 3
      if (tetoNome >= 3) {
        const curto = tituloQueCabe(nomeCheio, tetoNome)
        if (curto && tentar(curto, indicadores)) break
      }
    }
    if (!indicadores.length) break
    indicadores = indicadores.slice(0, -1)
  }
  if (!coube) corpo = descricaoQueCabe(corpoMeta(i, null, []), orcamento)
  const full = `${corpo} ${AVISO_META}`.replace(/\s+/g, ' ').trim()
  return full.length <= TETO_DESCRICAO ? full : descricaoQueCabe(full)
}

function faqPreco(i: ResumoAtivoInput): NuFaqItem | null {
  if (i.kind === 'crypto' || !ok(i.preco)) return null
  const quando = dataBr(i.data)
  const variacao = variacaoDiaFrase(i)
  const extra = variacao ? `, com ${variacao}` : ''
  const preco = precoFmt(i.preco, i.kind, i.moeda)
  const atualizada = quando ? `, atualizada em ${quando}` : ''
  return {
    q: `Qual a cotação de ${i.nome} (${i.ticker})?`,
    a: `A cotação mais recente de ${i.nome} (${i.ticker}) é ${preco}${atualizada}${extra}.${fonteCotacao(i)}`,
  }
}

function faqDy(i: ResumoAtivoInput): NuFaqItem | null {
  if (!ok(i.numeros.dy)) return null
  const fonte = i.fonteIndicadores?.trim()
  const a = `O dividend yield de 12 meses de ${i.ticker} é ${pctAbs(i.numeros.dy)}.${fonte ? ` Fonte: ${fonte}.` : ''}`
  return { q: `Qual o dividend yield de ${i.ticker}?`, a }
}

function faqProventos(i: ResumoAtivoInput): NuFaqItem | null {
  const p = i.proventos
  if (!p) return null
  const unidade = p.unidade
  if (ok(p.renda12) && p.renda12 > 0) {
    const n = ok(p.eventos12) && p.eventos12 > 0 ? ` Foram ${nf0.format(p.eventos12)} proventos com data-com nesse período.` : ''
    return {
      q: `Quanto ${i.ticker} teve em proventos com data-com nos últimos 12 meses?`,
      a: `A soma dos proventos de renda de ${i.ticker} com data-com nos últimos 12 meses foi de ${precoFmt(p.renda12, 'stock', 'BRL')} por ${unidade}.${n} Fonte: avisos de proventos da B3.`,
    }
  }
  if (p.renda12 === 0) {
    return {
      q: `Quanto ${i.ticker} teve em proventos com data-com nos últimos 12 meses?`,
      a: `Não houve provento de renda com data-com nos últimos 12 meses de ${i.ticker}. Fonte: avisos de proventos da B3.`,
    }
  }
  return null
}

function faqSerie(i: ResumoAtivoInput): NuFaqItem | null {
  if (i.kind === 'crypto') return null
  const s = i.serie
  if (!s || !ok(s.variacao)) return null
  const de = dataBr(s.de)
  const ate = dataBr(s.ate)
  if (!de || !ate) return null
  const ibov = ok(s.ibov) ? ` No mesmo período, o Ibovespa variou ${pctAssinado(s.ibov)}.` : ''
  return {
    q: `Como ${i.ticker} variou nos últimos 12 meses?`,
    a: `De ${de} a ${ate}, ${i.ticker} variou ${pctAssinado(s.variacao)}.${ibov}${fonteSerie(s.ate)}`,
  }
}

function faqEtf(i: ResumoAtivoInput): NuFaqItem | null {
  const e = i.etf
  if (!e) return null
  if (e.maiorNome?.trim() && ok(e.maiorPeso) && e.maiorPeso > 0) {
    const n = ok(e.posicoes) && e.posicoes > 0 ? ` A carteira informada tem ${nf0.format(e.posicoes)} posições.` : ''
    const fonte = e.fonte?.trim() ? ` Fonte: ${e.fonte.trim()}.` : ''
    return {
      q: `Qual a maior posição de ${i.ticker}?`,
      a: `A maior posição informada de ${i.ticker} é ${e.maiorNome.trim()}, com ${pctAbs(e.maiorPeso)} do fundo.${n}${fonte}`,
    }
  }
  if (ok(e.taxaAdm)) {
    return {
      q: `Qual a taxa de administração de ${i.ticker}?`,
      a: `A taxa de administração informada de ${i.ticker} é ${pctAbs(e.taxaAdm)} ao ano.${e.fonte?.trim() ? ` Fonte: ${e.fonte.trim()}.` : ''}`,
    }
  }
  return null
}

function faqDe(i: ResumoAtivoInput): NuFaqItem[] {
  const itens = [
    faqPreco(i),
    faqDy(i),
    faqProventos(i),
    faqSerie(i),
    faqEtf(i),
  ].filter((f): f is NuFaqItem => !!f && f.q.trim().length > 0 && f.a.trim().length > 0 && !QUEBRADA.test(f.a))
  return itens.slice(0, 5)
}

/* ————— o resumo para ler (ResumoFatos) ————— */

/** "R$ 726,6 bi": o valor de mercado no tamanho de leitura (o "726,56B" era de planilha). */
function dinheiroCurto(v: number, moeda: 'BRL' | 'USD' = 'BRL'): string {
  const cur = moedaDe(moeda)
  const a = Math.abs(v)
  if (a >= 1e12) return `${cur} ${nf1.format(v / 1e12)} tri`
  if (a >= 1e9) return `${cur} ${nf1.format(v / 1e9)} bi`
  if (a >= 1e6) return `${cur} ${nf1.format(v / 1e6)} mi`
  return `${cur} ${nf2.format(v)}`
}

const T = (t: string): ResumoTrecho => ({ t })
const N = (t: string): ResumoTrecho => ({ t, n: true })

function fatosIndicadores(i: ResumoAtivoInput): Pick<ResumoFatos, 'indicadores' | 'indicadoresNota'> {
  const n = i.numeros
  const moeda = i.moeda === 'USD' && i.kind !== 'bdr' ? 'USD' : 'BRL'
  const doze: { rotulo: string; valor: string }[] = []
  if (ok(n.dy)) doze.push({ rotulo: 'Dividend yield', valor: pctAbs(n.dy) })
  if (ok(n.pl)) doze.push({ rotulo: 'P/L', valor: nf2.format(n.pl) })
  if (ok(n.roe)) doze.push({ rotulo: 'ROE', valor: pctAbs(n.roe, 1) })
  if (ok(n.margem)) doze.push({ rotulo: 'Margem líquida', valor: pctAbs(n.margem, 1) })
  const hoje: { rotulo: string; valor: string }[] = []
  if (ok(n.pvp)) hoje.push({ rotulo: 'P/VP', valor: nf2.format(n.pvp) })
  if (ok(n.valorMercado) && n.valorMercado > 0) hoje.push({ rotulo: 'Valor de mercado', valor: dinheiroCurto(n.valorMercado, moeda) })
  if (ok(n.vpCota) && n.vpCota > 0) hoje.push({ rotulo: 'Valor patrimonial por cota', valor: precoFmt(n.vpCota, 'fii', 'BRL') })
  if (ok(n.rendaMedia24m) && n.rendaMedia24m > 0) hoje.push({ rotulo: 'Renda média por cota em 24 meses', valor: precoFmt(n.rendaMedia24m, 'fii', 'BRL') })
  if (ok(n.ifix)) hoje.push({ rotulo: 'Participação no IFIX', valor: pctAbs(n.ifix) })
  if (ok(n.cotistas) && n.cotistas > 0) hoje.push({ rotulo: 'Cotistas', valor: nf0.format(n.cotistas) })
  // "dividend yield, P/L, ROE e margem líquida": sigla fica em caixa alta
  const nomes = juntar(doze.map((x) => (/^[A-Z/]+$/.test(x.rotulo) ? x.rotulo : x.rotulo.toLowerCase())))
  const nota = doze.length
    ? `${nomes.charAt(0).toUpperCase()}${nomes.slice(1)}: últimos 12 meses.${hoje.length ? ' Os demais, na leitura mais recente.' : ''}`
    : null
  return { indicadores: [...doze, ...hoje], indicadoresNota: nota }
}

function fatosProventos(i: ResumoAtivoInput): ResumoFatos['proventos'] {
  const p = i.proventos
  if (!p) return null
  const u = p.unidade
  const frases: ResumoFrase[] = []
  const nome = i.kind === 'fii' ? 'rendimentos' : 'proventos de renda'
  let oQue = i.kind === 'fii' ? 'Rendimentos com data-com' : 'Dividendos e JCP com data-com'
  if (p.tipo === 'capital' && ok(p.capital12) && p.capital12 > 0) {
    frases.push([T(`Nos últimos 12 meses, ${i.ticker} não teve provento de renda com data-com. A amortização soma `), N(precoFmt(p.capital12, 'stock', 'BRL')), T(` por ${u}; ela devolve capital e fica fora do dividend yield.`)])
    oQue = 'Amortização com data-com'
  }
  else if (ok(p.renda12) && p.renda12 > 0) {
    const n = ok(p.eventos12) && p.eventos12 > 0 ? `, em ${nf0.format(p.eventos12)} ${p.eventos12 === 1 ? 'provento' : 'proventos'}` : ''
    const cad = p.frequencia?.trim() ? `, numa cadência ${p.frequencia.trim().toLowerCase()}` : ''
    frases.push([T(`Nos últimos 12 meses, os ${nome} de ${i.ticker} com data-com somaram `), N(precoFmt(p.renda12, 'stock', 'BRL')), T(` por ${u}${n}${cad}.`)])
    // pagamento mensal (FII, em geral): a média por mês é a conta que a pessoa faz
    if (ok(p.eventos12) && p.eventos12 >= 10) frases.push([T('Na média, '), N(precoFmt(p.renda12 / 12, 'stock', 'BRL')), T(` por ${u} a cada mês.`)])
    else if (ok(p.eventos12) && p.eventos12 >= 2) frases.push([T('Na média, '), N(precoFmt(p.renda12 / p.eventos12, 'stock', 'BRL')), T(` por ${u} a cada provento.`)])
    if (ok(p.capital12) && p.capital12 > 0) {
      frases.push([T('Houve ainda '), N(precoFmt(p.capital12, 'stock', 'BRL')), T(` por ${u} em amortização, fora dessa soma.`)])
    }
  }
  else if (p.renda12 === 0) {
    frases.push([T(`Não houve provento de renda com data-com nos últimos 12 meses de ${i.ticker}.`)])
  }
  if (p.proximo === 'a definir') frases.push([T('O próximo pagamento está a definir.')])
  else if (p.proximo?.trim()) frases.push([T('O próximo pagamento previsto é '), N(p.proximo.trim()), T('.')])
  const anos = p.anos
    .filter((a) => ok(a.valor) && a.valor > 0 && /^\d{4}$/.test(a.ano))
    .map((a): NonNullable<ResumoFatos['proventos']>['anos'][number] => ({ rotulo: a.corrente ? `${a.ano} até agora` : a.ano, valor: precoFmt(a.valor, 'stock', 'BRL'), corrente: a.corrente }))
  if (!frases.length && !anos.length) return null
  // a janela de 12 meses na mesma tabela, com o nome dela (não é um ano)
  const doze = anos.length && p.tipo !== 'capital' && ok(p.renda12) && p.renda12 > 0
  if (doze) anos.push({ rotulo: 'Últimos 12 meses', valor: precoFmt(p.renda12, 'stock', 'BRL'), corrente: false, doze: true })
  return { frases, anos, legenda: `${oQue}, em R$ por ${u}. O ano corrente vai até hoje${doze ? '; os últimos 12 meses contam de hoje para trás' : ''}.` }
}

function fatosEtf(i: ResumoAtivoInput): ResumoFrase[] {
  const e = i.etf
  if (!e) return []
  const out: ResumoFrase[] = []
  const comp = dataBr(e.competencia)
  if (ok(e.posicoes) && e.posicoes > 0) out.push([T(comp ? `A carteira de ${comp} reúne ` : 'A carteira informada reúne '), N(nf0.format(e.posicoes)), T(' posições.')])
  else if (comp) out.push([T(`A carteira informada é a de ${comp}.`)])
  if (e.maiorNome?.trim() && ok(e.maiorPeso) && e.maiorPeso > 0) out.push([T(`A maior posição é ${e.maiorNome.trim()}, com `), N(pctAbs(e.maiorPeso)), T(' do fundo.')])
  if (ok(e.taxaAdm)) {
    out.push([T('A taxa de administração informada é de '), N(pctAbs(e.taxaAdm)), T(' ao ano.')])
    // a taxa em dinheiro, a mesma conta do Raio-X ("Em 10 anos, R$ 10 mil pagam")
    out.push([T('Sobre R$ 10 mil investidos, isso dá cerca de '), N(`R$ ${nf0.format(e.taxaAdm * 100)}`), T(' por ano, descontados da cota.')])
  }
  return out
}

function fatosDe(i: ResumoAtivoInput): ResumoFatos {
  const quem = `${i.nome} (${i.ticker})`
  const titulo = `${i.ticker} em resumo`
  if (i.kind === 'crypto') {
    return { titulo, frases: [[T(`${quem} é um criptoativo. A cotação em reais está no topo desta página, e o gráfico fica abaixo do título.`)]], indicadores: [], indicadoresNota: null, proventos: null, fontes: null }
  }
  const frases: ResumoFrase[] = []
  const setor = setorBaixo(i.setor)
  const comSetor = setor && !(i.kind === 'fii' && setor === 'imobiliário') ? `, do setor de ${setor}` : ''
  frases.push([T(`${quem} é ${classe(i)}${comSetor}.`)])
  if (ok(i.preco)) {
    const v = variacaoDiaFrase(i)
    frases.push([
      T('A cotação mais recente é '), N(precoFmt(i.preco, i.kind, i.moeda)),
      // o fechamento anterior pela mesma conta do herói (useAcao.buildHero): os dois batem
      ...(v && ok(i.variacaoDia)
        ? [
            T(', com variação de '), N(pctAssinado(i.variacaoDia)), T(' no dia ('),
            N(`${i.variacaoDia < 0 ? '-' : '+'}${moedaDe(i.moeda)} ${nf2.format(Math.abs(i.preco - i.preco / (1 + i.variacaoDia / 100)))}`),
            T('), sobre o fechamento anterior de '), N(precoFmt(i.preco / (1 + i.variacaoDia / 100), i.kind, i.moeda)), T('.'),
          ]
        : [T('.')]),
    ])
  }
  const a = ok(i.min52) && i.min52 > 0 ? precoFmt(i.min52, i.kind, i.moeda) : null
  const b = ok(i.max52) && i.max52 > 0 ? precoFmt(i.max52, i.kind, i.moeda) : null
  if (a && b) {
    frases.push([T('Nas últimas 52 semanas, a mínima foi '), N(a), T(' e a máxima, '), N(b), T('.')])
    // onde o preço de hoje está dentro dessa faixa: conta, não opinião
    if (ok(i.preco) && i.max52! > i.min52!) {
      const abaixo = ((i.max52! - i.preco) / i.max52!) * 100
      const acima = ((i.preco - i.min52!) / i.min52!) * 100
      if (abaixo >= 0 && acima >= 0) frases.push([T('Hoje a cotação está '), N(pctAbs(abaixo, 1)), T(' abaixo da máxima e '), N(pctAbs(acima, 1)), T(' acima da mínima.')])
    }
  }
  else if (a) frases.push([T('A mínima de 52 semanas foi '), N(a), T('.')])
  else if (b) frases.push([T('A máxima de 52 semanas foi '), N(b), T('.')])
  const s = i.serie
  const de = dataBr(s?.de)
  const ate = dataBr(s?.ate)
  if (s && ok(s.variacao) && de && ate) {
    frases.push([
      T(`De ${de} a ${ate}, ${i.ticker} variou `), N(pctAssinado(s.variacao)),
      ...(ok(s.ibov) ? [T(', contra '), N(pctAssinado(s.ibov)), T(' do Ibovespa.')] : [T('.')]),
    ])
    // a mesma variação em dinheiro: a conta que a pessoa faz de cabeça
    const mil = (v: number) => `R$ ${nf0.format(1000 * (1 + v / 100))}`
    frases.push([
      T(`Em valores: R$ 1.000 em ${i.ticker} no início do período valiam `), N(mil(s.variacao)),
      ...(ok(s.ibov) ? [T(' no fim, contra '), N(mil(s.ibov)), T(' no Ibovespa, sem contar proventos.')] : [T(' no fim, sem contar proventos.')]),
    ])
    if (ok(s.ibov)) {
      const dif = s.variacao - s.ibov
      if (Math.abs(dif) >= 0.01) frases.push([T('A diferença no período é de '), N(`${nf1.format(Math.abs(dif))} pontos percentuais`), T(dif > 0 ? `, a favor de ${i.ticker}.` : ', a favor do índice.')])
    }
  }
  frases.push(...fatosEtf(i))

  // as fontes juntas, cada uma dizendo de quê; a data uma vez só
  // as fontes numa frase só, cada uma dizendo de onde vem o quê
  const fontes: string[] = []
  if (ok(i.preco)) fontes.push(i.moeda === 'USD' ? `a cotação é um ${FONTE_USD} (${FONTE_COTACAO})` : `a cotação vem da ${FONTE_COTACAO}`)
  if (a || b || (s && ok(s.variacao))) fontes.push(`a faixa de 52 semanas e a variação no período vêm do ${FONTE_SERIE}`)
  const ind = fatosIndicadores(i)
  if (ind.indicadores.length && i.fonteIndicadores?.trim()) fontes.push(`os indicadores, do ${i.fonteIndicadores.trim()}`)
  const prov = fatosProventos(i)
  if (prov) fontes.push('os proventos, dos avisos de proventos da B3')
  if (i.etf?.fonte?.trim() && fatosEtf(i).length) fontes.push(`a carteira, de ${i.etf.fonte.trim()}`)
  const quando = dataBr(i.data) ?? ate
  const linha = fontes.length
    ? `Fontes: ${fontes.join('; ')}.${quando ? ` Atualizado em ${quando}.` : ''}`
    : null
  return { titulo, frases, ...ind, proventos: prov, fontes: linha }
}

const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const fraseHtml = (f: ResumoFrase) => f.map((p) => (p.n ? `<b>${escHtml(p.t)}</b>` : escHtml(p.t))).join('')

/**
 * O miolo do resumo recolhido (03/11/2026), em HTML: AtivoResumo.vue o põe por
 * v-html, o mesmo no servidor e no cliente, para o texto inteiro estar no HTML
 * que o Google lê e para, na primeira abertura, envolverPalavras
 * (utils/revelar-palavras.ts) embrulhar cada palavra como nas respostas do chat.
 * Tudo escapado aqui. Os proventos por ano numa <dl>: o ano no <dt>, o valor no
 * <dd> (copiado, sai em linhas separadas, não "2021R$ 5,65").
 */
export function resumoHtml(f: ResumoFatos): string {
  const out: string[] = []
  for (const x of f.frases) out.push(`<p class="ars2__frase">${fraseHtml(x)}</p>`)
  if (f.indicadores.length) {
    out.push(`<ul class="ars2__ind">${f.indicadores.map((x) => `<li>${escHtml(x.rotulo)}: <b>${escHtml(x.valor)}</b></li>`).join('')}</ul>`)
    if (f.indicadoresNota) out.push(`<p class="ars2__nota">${escHtml(f.indicadoresNota)}</p>`)
  }
  const p = f.proventos
  if (p) {
    const anos = p.anos.length
      ? `<dl class="ars2__anos">${p.anos.map((x) => `<div class="ars2__ano${x.corrente ? ' ars2__ano--atual' : ''}${x.doze ? ' ars2__ano--doze' : ''}"><dt>${escHtml(x.rotulo)}</dt><dd>${escHtml(x.valor)}</dd></div>`).join('')}</dl><p class="ars2__nota">${escHtml(p.legenda)}</p>`
      : ''
    out.push(`<div class="ars2__prov">${p.frases.map((x) => `<p class="ars2__frase">${fraseHtml(x)}</p>`).join('')}${anos}</div>`)
  }
  if (f.fontes) out.push(`<p class="ars2__fontes">${escHtml(f.fontes)}</p>`)
  return out.join('')
}

const NUMEROS_VAZIOS: ResumoNumeros = {
  dy: null, pl: null, pvp: null, roe: null, margem: null, valorMercado: null,
  vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null,
}

/**
 * Junta as perguntas novas na FAQ editorial. Um título e um JSON-LD ficam
 * com quem já renderiza a editorial. Pergunta repetida (mesmo texto) não entra.
 */
export function fundirFaq(editorial: NuFaqItem[], novas: NuFaqItem[]): NuFaqItem[] {
  const vistas = new Set(editorial.map((f) => f.q.replace(/\s+/g, ' ').trim().toLowerCase()))
  const extra = novas.filter((f) => {
    const q = f.q.replace(/\s+/g, ' ').trim().toLowerCase()
    if (!q || vistas.has(q)) return false
    vistas.add(q)
    return f.a.trim().length > 0
  })
  return [...editorial, ...extra]
}

/**
 * Monta H1, title, description, parágrafos e FAQ visível.
 * Sem nome e sem ticker não há página: devolve null.
 */
export function montarResumoAtivo(input: ResumoAtivoInput): AcaoResumoVM | null {
  const ticker = input.ticker?.trim().toUpperCase()
  const nome = input.nome?.replace(/\s+/g, ' ').trim()
  if (!ticker || !nome) return null
  const i: ResumoAtivoInput = {
    ...input,
    ticker,
    nome,
    numeros: { ...NUMEROS_VAZIOS, ...input.numeros },
    links: input.links ?? [],
  }
  const paragrafos: string[] = []
  empurra(paragrafos, paragrafoIdentidade(i))
  empurra(paragrafos, paragrafoIndicadores(i))
  empurra(paragrafos, paragrafoSerie(i))
  empurra(paragrafos, paragrafoProventos(i))
  empurra(paragrafos, paragrafoEtf(i))
  const faq = faqDe(i)
  return {
    h1: h1De(i),
    title: titulo(i),
    description: descricao(i),
    paragrafos,
    fatos: fatosDe(i),
    links: linksLimpos(i.links),
    faqTitulo: faq.length ? `Perguntas frequentes sobre ${ticker}` : null,
    faq,
    aviso: AVISO_RESUMO,
  }
}

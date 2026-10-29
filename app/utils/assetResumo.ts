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
import { TETO_DESCRICAO, TETO_TITULO_PAGINA, juntaAte, tituloQueCabe } from './serp.ts'

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
  /** só quando a lista do setor já veio no SSR (pares). null = omitir */
  setorMedia: ResumoSetorMedia | null
  proventos: ResumoProventos | null
  etf: ResumoEtf | null
  cripto: ResumoCripto | null
  links: ResumoLink[]
}

export interface AcaoResumoVM {
  h1: string
  title: string
  description: string
  paragrafos: string[]
  links: ResumoLink[]
  faqTitulo: string | null
  faq: NuFaqItem[]
  aviso: string
}

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const QUEBRADA = /R\$(?!\s*\d)|US\$(?!\s*\d)|(?:^|\s)%|de\s*%|Fonte:\s*$|Fonte:\s*\.|setor\s*\.|m[eé]dia de\s*%|\(\s*\)|\b(?:undefined|null|NaN)\b/

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

function qtd(v: number): string {
  if (v >= 1e9) return `${nf2.format(v / 1e9)}B`
  if (v >= 1e6) return `${nf2.format(v / 1e6)}M`
  if (v >= 1e3) return `${nf2.format(v / 1e3)} mil`
  return nf2.format(v)
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

function diasEntre(de: string, ate: string): number | null {
  const a = Date.parse(`${de}T12:00:00Z`)
  const b = Date.parse(`${ate}T12:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return (b - a) / 86_400_000
}

function linksLimpos(links: ResumoLink[]): ResumoLink[] {
  const out: ResumoLink[] = []
  const vistos = new Set<string>()
  for (const l of links) {
    const href = (l.href ?? '').trim()
    const label = limpa(l.label ?? '')
    if (!href.startsWith('/') || href.includes(' ') || label.length < 2) continue
    if (vistos.has(href)) continue
    vistos.add(href)
    out.push({ href, label })
  }
  return out
}

function caudaTitulo(i: ResumoAtivoInput): string {
  if (i.kind === 'crypto') return ': preço em reais'
  if (i.kind === 'fii') return ': cotação do FII'
  if (i.kind === 'bdr') return ': cotação do BDR'
  if (i.kind === 'etf') return ': cotação do ETF'
  if (i.proventos && (i.proventos.renda12 > 0 || i.proventos.anos.some((a) => a.valor > 0))) return ': cotação e dividendos'
  return ': cotação na B3'
}

function titulo(i: ResumoAtivoInput): string {
  const cauda = caudaTitulo(i)
  const comNome = `${i.nome} (${i.ticker})${cauda}`
  if (comNome.length <= TETO_TITULO_PAGINA) return comNome
  const soTicker = `${i.ticker}${cauda}`
  return soTicker.length <= TETO_TITULO_PAGINA ? soTicker : tituloQueCabe(soTicker)
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
    partes.push(`${quem} é um criptoativo.`)
  }
  else {
    partes.push(`${quem} é ${classe(i)}.`)
    const setor = setorBaixo(i.setor)
    if (setor && !(i.kind === 'fii' && setor === 'imobiliário')) partes.push(`O setor informado é ${setor}.`)
  }
  if (ok(i.preco)) {
    const quando = dataBr(i.data)
    const variacao = variacaoDiaFrase(i)
    const extra = variacao ? `, ${variacao}` : ''
    if (i.kind === 'crypto') {
      partes.push(quando
        ? `Em ${quando}, o preço em reais foi de ${precoFmt(i.preco, i.kind, i.moeda)}${extra}.`
        : `O preço em reais informado é ${precoFmt(i.preco, i.kind, i.moeda)}${extra}.`)
    }
    else if (quando) {
      const fonte = i.moeda === 'USD' ? 'preço em dólar' : 'B3'
      partes.push(`No pregão de ${quando}, a cotação foi de ${precoFmt(i.preco, i.kind, i.moeda)}${extra}. Fonte: ${fonte}.`)
    }
    else {
      const fonte = i.moeda === 'USD' ? 'preço em dólar' : 'B3'
      partes.push(`A cotação informada é ${precoFmt(i.preco, i.kind, i.moeda)}${extra}. Fonte: ${fonte}.`)
    }
  }
  const faixa = faixa52(i.min52, i.max52, i.kind, i.moeda)
  if (faixa && i.kind !== 'crypto') partes.push(faixa)
  return partes.join(' ')
}

function faixa52(min: number | null, max: number | null, kind: ResumoKind, moeda: 'BRL' | 'USD'): string | null {
  const a = ok(min) && min > 0 ? precoFmt(min, kind, moeda) : null
  const b = ok(max) && max > 0 ? precoFmt(max, kind, moeda) : null
  if (a && b) return `A mínima de 52 semanas foi ${a} e a máxima foi ${b}.`
  if (a) return `A mínima de 52 semanas foi ${a}.`
  if (b) return `A máxima de 52 semanas foi ${b}.`
  return null
}

function indicadoresDe(n: ResumoNumeros, moeda: 'BRL' | 'USD'): string[] {
  const partes: string[] = []
  if (ok(n.dy)) partes.push(`dividend yield de ${pctAbs(n.dy)}`)
  if (ok(n.pl)) partes.push(`P/L de ${nf2.format(n.pl)}`)
  if (ok(n.pvp)) partes.push(`P/VP de ${nf2.format(n.pvp)}`)
  if (ok(n.roe)) partes.push(`ROE de ${pctAbs(n.roe, 1)}`)
  if (ok(n.margem)) partes.push(`margem líquida de ${pctAbs(n.margem, 1)}`)
  if (ok(n.valorMercado) && n.valorMercado > 0) partes.push(`valor de mercado de ${moneyBig(n.valorMercado, moeda)}`)
  if (ok(n.vpCota) && n.vpCota > 0) partes.push(`valor patrimonial por cota de ${precoFmt(n.vpCota, 'fii', 'BRL')}`)
  if (ok(n.rendaMedia24m) && n.rendaMedia24m > 0) partes.push(`renda média por cota em 24 meses de ${precoFmt(n.rendaMedia24m, 'fii', 'BRL')}`)
  if (ok(n.ifix)) partes.push(`participação no IFIX de ${pctAbs(n.ifix)}`)
  if (ok(n.cotistas) && n.cotistas > 0) partes.push(`${nf0.format(n.cotistas)} cotistas`)
  return partes
}

function paragrafoIndicadores(i: ResumoAtivoInput): string | null {
  const partes = indicadoresDe(i.numeros, i.moeda === 'USD' && i.kind !== 'bdr' ? 'USD' : 'BRL')
  if (!partes.length) return null
  const quando = dataBr(i.data)
  const ancora = quando ? `, com a cotação de ${quando}` : ''
  const fonte = i.fonteIndicadores?.trim() ? ` Fonte: ${i.fonteIndicadores.trim()}.` : ''
  return `Indicadores dos últimos 12 meses de ${i.ticker}${ancora}: ${juntar(partes)}.${fonte}`
}

function paragrafoSerie(i: ResumoAtivoInput): string | null {
  const s = i.serie
  if (!s || !ok(s.variacao)) return null
  const de = dataBr(s.de)
  const ate = dataBr(s.ate)
  if (!de || !ate) return null
  const dias = diasEntre(s.de, s.ate)
  const periodo = dias != null && dias >= 300 ? `Na série de cerca de 12 meses, de ${de} a ${ate}` : `Na série de preços, de ${de} a ${ate}`
  const ibov = ok(s.ibov) ? ` O Ibovespa, na série pedida no mesmo intervalo, variou ${pctAssinado(s.ibov)}.` : ''
  return `${periodo}, ${i.ticker} variou ${pctAssinado(s.variacao)}.${ibov}`
}

function paragrafoSetor(i: ResumoAtivoInput): string | null {
  const setor = setorBaixo(i.setor)
  const media = i.setorMedia
  if (!setor || !media || !ok(media.variacao) || !ok(i.variacaoDia) || i.kind === 'crypto') return null
  const n = ok(media.papeis) && media.papeis > 0 ? ` dos ${nf0.format(media.papeis)} papéis` : ''
  return `No pregão, ${i.ticker} variou ${pctAssinado(i.variacaoDia)}. A média${n} do setor ${setor} nessa lista foi ${pctAssinado(media.variacao)}. Fonte: cotações da B3.`
}

function fraseAnos(anos: ResumoAno[], oQue: string): string | null {
  const uteis = anos.filter((a) => ok(a.valor) && a.valor > 0 && /^\d{4}$/.test(a.ano))
  if (!uteis.length) return null
  const lista = uteis.map((a) => `${a.ano}, ${precoFmt(a.valor, 'stock', 'BRL')}${a.corrente ? ' (últimos 12 meses)' : ''}`)
  const nota = uteis.some((a) => a.corrente) ? ' O ano corrente reúne os últimos 12 meses, não o ano civil fechado.' : ''
  return `Por ano, ${oQue}: ${lista.join('; ')}.${nota}`
}

function paragrafoProventos(i: ResumoAtivoInput): string | null {
  const p = i.proventos
  if (!p) return null
  const partes: string[] = []
  const unidade = p.unidade
  if (p.tipo === 'capital' && ok(p.capital12) && p.capital12 > 0) {
    partes.push(`Nos últimos 12 meses, ${i.ticker} não teve provento de renda com data-com. A amortização no período soma ${precoFmt(p.capital12, 'stock', 'BRL')} por ${unidade}. Amortização devolve capital e fica fora do dividend yield.`)
    const anos = fraseAnos(p.anos, 'a amortização')
    if (anos) partes.push(anos)
  }
  else if (ok(p.renda12) && p.renda12 > 0) {
    const n = ok(p.eventos12) && p.eventos12 > 0
      ? `, em ${nf0.format(p.eventos12)} ${p.eventos12 === 1 ? 'pagamento' : 'pagamentos'}`
      : ''
    const nome = i.kind === 'fii' ? 'rendimentos' : 'proventos de renda'
    partes.push(`Nos últimos 12 meses, a soma dos ${nome} de ${i.ticker} com data-com foi de ${precoFmt(p.renda12, 'stock', 'BRL')} por ${unidade}${n}.`)
    if (p.frequencia?.trim()) partes.push(`A cadência observada nesse período é ${p.frequencia.trim().toLowerCase()}.`)
    if (ok(p.capital12) && p.capital12 > 0) {
      partes.push(`No mesmo período houve ${precoFmt(p.capital12, 'stock', 'BRL')} por ${unidade} em amortização, fora dessa soma.`)
    }
    const anos = fraseAnos(p.anos, i.kind === 'fii' ? 'os rendimentos' : 'os dividendos e JCP pagos')
    if (anos) partes.push(anos)
  }
  else if (p.renda12 === 0) {
    partes.push(`Não houve provento de renda com data-com nos últimos 12 meses de ${i.ticker}.`)
    const anos = fraseAnos(p.anos, i.kind === 'fii' ? 'os rendimentos' : 'os dividendos e JCP pagos')
    if (anos) partes.push(anos)
  }
  if (p.proximo === 'a definir') partes.push('O próximo pagamento está a definir.')
  else if (p.proximo?.trim()) partes.push(`O próximo pagamento informado é ${p.proximo.trim()}.`)
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

function paragrafoCripto(i: ResumoAtivoInput): string | null {
  const c = i.cripto
  if (!c || i.kind !== 'crypto') return null
  const partes: string[] = []
  const dinheiro: string[] = []
  if (ok(c.valorMercado) && c.valorMercado > 0) dinheiro.push(`valor de mercado de ${moneyBig(c.valorMercado)}`)
  if (ok(c.volume24h) && c.volume24h > 0) dinheiro.push(`volume em 24 horas de ${moneyBig(c.volume24h)}`)
  if (dinheiro.length) partes.push(`Em reais, ${i.nome} tem ${juntar(dinheiro)}.`)
  if (ok(c.dominancia)) partes.push(`A dominância informada é ${pctAbs(c.dominancia)}.`)
  if (ok(c.rank) && c.rank > 0) partes.push(`O rank global informado é ${nf0.format(c.rank)}.`)
  const janelas: string[] = []
  if (ok(c.var7d)) janelas.push(`${pctAssinado(c.var7d)} em 7 dias`)
  if (ok(c.var30d)) janelas.push(`${pctAssinado(c.var30d)} em 30 dias`)
  if (janelas.length) partes.push(`A variação informada é de ${juntar(janelas)}.`)
  const faixa = faixa52(c.min52, c.max52, 'crypto', 'BRL')
  if (faixa) partes.push(faixa)
  if (ok(c.supplyCirc) && c.supplyCirc > 0 && ok(c.supplyMax) && c.supplyMax > 0) {
    partes.push(`O supply circulante informado é ${qtd(c.supplyCirc)} ${i.ticker} e o supply máximo é ${qtd(c.supplyMax)} ${i.ticker}.`)
  }
  else if (ok(c.supplyCirc) && c.supplyCirc > 0) {
    partes.push(`O supply circulante informado é ${qtd(c.supplyCirc)} ${i.ticker}.`)
  }
  else if (ok(c.supplyMax) && c.supplyMax > 0) {
    partes.push(`O supply máximo informado é ${qtd(c.supplyMax)} ${i.ticker}.`)
  }
  if (!partes.length) return null
  const quando = dataBr(i.data)
  if (quando) partes.push(`Valores em reais referentes a ${quando}.`)
  return partes.join(' ')
}

function indicadoresMeta(i: ResumoAtivoInput): string | null {
  const n = i.numeros
  const partes: string[] = []
  if (ok(n.dy)) partes.push(`dividend yield ${pctAbs(n.dy)}`)
  if (ok(n.pl)) partes.push(`P/L ${nf2.format(n.pl)}`)
  else if (ok(n.pvp)) partes.push(`P/VP ${nf2.format(n.pvp)}`)
  if (ok(n.roe)) partes.push(`ROE ${pctAbs(n.roe, 1)}`)
  if (!partes.length && i.kind === 'crypto' && i.cripto && ok(i.cripto.valorMercado) && i.cripto.valorMercado > 0) {
    partes.push(`valor de mercado ${moneyBig(i.cripto.valorMercado)}`)
  }
  if (!partes.length && i.etf && ok(i.etf.taxaAdm)) partes.push(`taxa de administração ${pctAbs(i.etf.taxaAdm)} ao ano`)
  if (!partes.length) return null
  return `${juntar(partes).replace(/^./, (c) => c.toUpperCase())}.`
}

function descricao(i: ResumoAtivoInput): string {
  const frases: string[] = []
  const quando = dataBr(i.data)
  if (ok(i.preco) && quando) {
    const oQue = i.kind === 'crypto' ? 'preço em reais' : 'cotação'
    frases.push(`${i.ticker} (${i.nome}): ${oQue} de ${precoFmt(i.preco, i.kind, i.moeda)} em ${quando}.`)
  }
  else if (ok(i.preco)) {
    const oQue = i.kind === 'crypto' ? 'preço em reais' : 'cotação'
    frases.push(`${i.ticker} (${i.nome}): ${oQue} de ${precoFmt(i.preco, i.kind, i.moeda)}.`)
  }
  else {
    frases.push(`${i.ticker} (${i.nome}) é ${classe(i)}.`)
  }
  const setor = setorBaixo(i.setor)
  if (setor && i.kind !== 'crypto' && !(i.kind === 'fii' && setor === 'imobiliário')) frases.push(`Setor ${setor}.`)
  const meta = indicadoresMeta(i)
  if (meta) frases.push(meta)
  // A variação do dia sai por último: cabe quando sobra espaço e some inteira
  // quando o preço, a data e os indicadores já enchem a description.
  const variacao = variacaoDiaFrase(i)
  if (variacao) frases.push(`${variacao.charAt(0).toUpperCase()}${variacao.slice(1)}.`)
  const corpo = juntaAte(frases, TETO_DESCRICAO - AVISO_META.length - 1)
  return corpo ? `${corpo} ${AVISO_META}` : AVISO_META
}

function faqPreco(i: ResumoAtivoInput): NuFaqItem | null {
  if (!ok(i.preco)) return null
  const quando = dataBr(i.data)
  const variacao = variacaoDiaFrase(i)
  const extra = variacao ? `, ${variacao}` : ''
  if (i.kind === 'crypto') {
    const a = quando
      ? `Em ${quando}, o preço em reais de ${i.nome} (${i.ticker}) foi de ${precoFmt(i.preco, i.kind, i.moeda)}${extra}.`
      : `O preço em reais informado de ${i.nome} (${i.ticker}) é ${precoFmt(i.preco, i.kind, i.moeda)}${extra}.`
    return { q: `Qual o preço de ${i.nome} (${i.ticker}) em reais?`, a }
  }
  const fonte = i.moeda === 'USD' ? 'preço em dólar' : 'B3'
  const a = quando
    ? `No pregão de ${quando}, a cotação de ${i.nome} (${i.ticker}) foi de ${precoFmt(i.preco, i.kind, i.moeda)}${extra}. Fonte: ${fonte}.`
    : `A cotação informada de ${i.nome} (${i.ticker}) é ${precoFmt(i.preco, i.kind, i.moeda)}${extra}. Fonte: ${fonte}.`
  return { q: `Qual a cotação de ${i.nome} (${i.ticker})?`, a }
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
    const n = ok(p.eventos12) && p.eventos12 > 0 ? ` Foram ${nf0.format(p.eventos12)} pagamentos com data-com nessa janela.` : ''
    return {
      q: `Quanto ${i.ticker} pagou em proventos nos últimos 12 meses?`,
      a: `A soma dos proventos de renda de ${i.ticker} com data-com nos últimos 12 meses foi de ${precoFmt(p.renda12, 'stock', 'BRL')} por ${unidade}.${n} Fonte: avisos de proventos da B3.`,
    }
  }
  if (p.renda12 === 0) {
    return {
      q: `Quanto ${i.ticker} pagou em proventos nos últimos 12 meses?`,
      a: `Não houve provento de renda com data-com nos últimos 12 meses de ${i.ticker}. Fonte: avisos de proventos da B3.`,
    }
  }
  return null
}

function faqSerie(i: ResumoAtivoInput): NuFaqItem | null {
  const s = i.serie
  if (!s || !ok(s.variacao)) return null
  const de = dataBr(s.de)
  const ate = dataBr(s.ate)
  if (!de || !ate) return null
  const ibov = ok(s.ibov) ? ` O Ibovespa variou ${pctAssinado(s.ibov)} na série do mesmo pedido.` : ''
  return {
    q: `Como ${i.ticker} variou na série de preços recente?`,
    a: `De ${de} a ${ate}, ${i.ticker} variou ${pctAssinado(s.variacao)} na série de preços.${ibov}`,
  }
}

function faqSetor(i: ResumoAtivoInput): NuFaqItem | null {
  const texto = paragrafoSetor(i)
  const setor = setorBaixo(i.setor)
  if (!texto || !setor) return null
  return {
    q: `Como a variação de ${i.ticker} no pregão se compara à média do setor ${setor}?`,
    a: texto,
  }
}

function faqCriptoMercado(i: ResumoAtivoInput): NuFaqItem | null {
  const c = i.cripto
  if (!c || !ok(c.valorMercado) || c.valorMercado <= 0) return null
  const vol = ok(c.volume24h) && c.volume24h > 0 ? ` O volume em 24 horas foi de ${moneyBig(c.volume24h)}.` : ''
  return {
    q: `Qual o valor de mercado de ${i.nome} em reais?`,
    a: `O valor de mercado em reais de ${i.nome} (${i.ticker}) informado é ${moneyBig(c.valorMercado)}.${vol}`,
  }
}

function faqRank(i: ResumoAtivoInput): NuFaqItem | null {
  const c = i.cripto
  if (!c || !ok(c.rank) || c.rank <= 0) return null
  const dom = ok(c.dominancia) ? ` A dominância informada é ${pctAbs(c.dominancia)}.` : ''
  return {
    q: `Qual a posição de ${i.nome} no ranking global?`,
    a: `O rank global informado de ${i.nome} (${i.ticker}) é ${nf0.format(c.rank)}.${dom}`,
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
    faqCriptoMercado(i),
    faqSerie(i),
    faqSetor(i),
    faqRank(i),
    faqEtf(i),
  ].filter((f): f is NuFaqItem => !!f && f.q.trim().length > 0 && f.a.trim().length > 0 && !QUEBRADA.test(f.a))
  return itens.slice(0, 5)
}

const NUMEROS_VAZIOS: ResumoNumeros = {
  dy: null, pl: null, pvp: null, roe: null, margem: null, valorMercado: null,
  vpCota: null, rendaMedia24m: null, ifix: null, cotistas: null,
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
  empurra(paragrafos, paragrafoSetor(i))
  empurra(paragrafos, paragrafoProventos(i))
  empurra(paragrafos, paragrafoEtf(i))
  empurra(paragrafos, paragrafoCripto(i))
  const faq = faqDe(i)
  return {
    h1: h1De(i),
    title: titulo(i),
    description: descricao(i),
    paragrafos,
    links: linksLimpos(i.links),
    faqTitulo: faq.length ? `Perguntas frequentes sobre ${ticker}` : null,
    faq,
    aviso: AVISO_RESUMO,
  }
}

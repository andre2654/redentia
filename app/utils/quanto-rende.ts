/**
 * Contas de /quanto-rende. Puras, sem fetch: os insumos vêm das mesmas
 * fontes de /dividendos (proventos12m + cotação) e de /tesouro (taxa do dia).
 *
 * Proventos: quantidade = valor ÷ preço; proventos = quantidade × renda de
 * 12 meses por unidade; percentual = proventos ÷ valor. A fração é a parte
 * proporcional do valor. A compra na B3 é por unidade inteira, e a página
 * mostra as duas leituras.
 *
 * Tesouro: a taxa anual composta por dias corridos ÷ 365. Não é o preço
 * unitário (o Tesouro precifica em dias úteis, base 252, e esta base não
 * tem esse calendário). IR só onde a conta fecha: prefixado sem cupom, sobre
 * o ganho, e a ilustração de um ano do Selic. A tabela é a que o site já
 * descreve (22,5% até 180 dias, 20% até 360, 17,5% até 720, 15% acima).
 * IOF diário e custódia não entram: o código não tem a tabela nem o valor.
 * IPCA e IGP-M não viram reais nominais: a inflação do período não está no
 * dado. Cupom não tem líquido único: cada juros usa o prazo desde a compra,
 * e a agenda de cupons não vem na API.
 */
import { MONTHS_PT } from './format.ts'
import { parseProventos, proventos12m } from './proventos.ts'
import { juntaAte, tituloQueCabe } from './serp.ts'

export const VALOR_PADRAO = 1000
export const VALOR_MIN = 1
export const VALOR_MAX = 100_000_000

const nfDinheiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const nfQtd = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
const nfPct = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function dinheiroFmt(n: number): string {
  return nfDinheiro.format(n)
}

export function qtdFmt(n: number): string {
  return nfQtd.format(n)
}

export function rendimentoFmt(n: number): string {
  return `${nfPct.format(n)}%`
}

/** '2026-10-30' → '30 out 2026'. Data inválida volta como veio. */
export function diaCurto(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d || !/^\d{4}-\d{2}-\d{2}$/.test(iso.slice(0, 10))) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`
}

/**
 * "1.000,50" e "1000.50" viram número. Milhar com ponto some; vírgula é
 * decimal. Texto vazio ou sem dígito devolve null (o campo mantém o anterior).
 */
export function lerValorBr(texto: string): number | null {
  const limpo = texto
    .trim()
    .replace(/\s/g, '')
    .replace(/R\$/gi, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '')
  if (!limpo || limpo === '-' || limpo === '.') return null
  const n = Number(limpo)
  return Number.isFinite(n) ? n : null
}

/** Centavos, dentro do intervalo. Fora do intervalo, encosta no limite. NaN cai no padrão. */
export function valorQuantoRende(bruto: number): number {
  if (!Number.isFinite(bruto)) return VALOR_PADRAO
  const n = Math.round(bruto * 100) / 100
  if (n < VALOR_MIN) return VALOR_MIN
  if (n > VALOR_MAX) return VALOR_MAX
  return n
}

export interface QuantoRendeProventos {
  quantidade: number
  /** unidades inteiras que cabem no valor, ao preço atual */
  inteiras: number
  /** o que sobra depois das unidades inteiras */
  sobra: number
  proventos: number
  proventosInteiras: number
  rendimentoPct: number
}

/**
 * Aplica a renda de 12 meses por unidade a um valor. null quando falta
 * preço, valor ou provento positivo: a página não inventa o terceiro número.
 */
export function quantoRendeProventos(
  valor: number,
  preco: number,
  proventoPorUnidade: number,
): QuantoRendeProventos | null {
  if (!(valor > 0) || !(preco > 0) || !(proventoPorUnidade > 0)) return null
  if (!Number.isFinite(valor) || !Number.isFinite(preco) || !Number.isFinite(proventoPorUnidade)) return null
  const quantidade = valor / preco
  const inteiras = Math.floor(quantidade + 1e-9)
  const sobraBruta = valor - inteiras * preco
  const sobra = sobraBruta > 0.004 ? sobraBruta : 0
  const proventos = quantidade * proventoPorUnidade
  return {
    quantidade,
    inteiras,
    sobra,
    proventos,
    proventosInteiras: inteiras * proventoPorUnidade,
    rendimentoPct: (proventos / valor) * 100,
  }
}

const nfQtdSeo = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * A mesma régua do 404 de /quanto-rende/{TICKER}: houve provento de renda
 * (dividendo, JCP, rendimento) com data com nos últimos 12 meses.
 * Amortização e restituição de capital não contam.
 */
export function temRendaEm12Meses(apiRows: readonly unknown[] | null | undefined, hoje: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hoje)) return false
  return proventos12m(parseProventos(apiRows), hoje).income12 > 0
}

export function seoQuantoRendeTicker(input: {
  ticker: string
  valor: number
  preco: number
  quantidade: number
  proventos: number
  rendimentoPct: number
  unidadePlural: string
}): { title: string; description: string } {
  const title = tituloQueCabe(`Quanto rende ${input.ticker}: ${rendimentoFmt(input.rendimentoPct)} em 12 meses`)
  const aviso = 'Rentabilidade passada não garante a futura. Não é recomendação.'
  const qtd = nfQtdSeo.format(input.quantidade)
  const fato = `${input.ticker}: ${dinheiroFmt(input.valor)} compram ${qtd} ${input.unidadePlural} a ${dinheiroFmt(input.preco)}, proventos ${dinheiroFmt(input.proventos)} (${rendimentoFmt(input.rendimentoPct)}).`
  const junto = `${fato} ${aviso}`
  const description = junto.length <= 155 ? junto : juntaAte([fato, 'Rentabilidade passada não garante a futura.'])
  return { title, description }
}

/* ————— Tesouro ————— */

/** Alíquota da tabela regressiva que o site já descreve, em fração (0,225 = 22,5%). */
export function aliquotaIrRendaFixa(dias: number): number | null {
  if (!Number.isFinite(dias) || dias <= 0) return null
  if (dias <= 180) return 0.225
  if (dias <= 360) return 0.2
  if (dias <= 720) return 0.175
  return 0.15
}

export function aliquotaFmt(aliquota: number): string {
  const pct = aliquota * 100
  const texto = Number.isInteger(pct) ? String(pct) : pct.toFixed(1).replace('.', ',')
  return `${texto}%`
}

/** Dias corridos entre duas datas ISO, meio-dia UTC, sem fuso no meio. */
export function diasCorridos(de: string, ate: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(de) || !/^\d{4}-\d{2}-\d{2}$/.test(ate)) return null
  const a = Date.parse(`${de}T12:00:00Z`)
  const b = Date.parse(`${ate}T12:00:00Z`)
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  return Math.round((b - a) / 86_400_000)
}

export type ClasseTesouro = 'prefixado' | 'cupom-prefixado' | 'indice' | 'indice-cupom' | 'selic' | 'renda' | 'educa'

export function classeDeTesouro(t: { slug: string; name: string; indexer: string }): ClasseTesouro | null {
  const slug = t.slug.toLowerCase()
  const name = t.name.toLowerCase()
  const idx = t.indexer.toUpperCase()
  if (slug.startsWith('tesouro-renda') || name.includes('renda+')) return 'renda'
  if (slug.startsWith('tesouro-educa') || name.includes('educa+')) return 'educa'
  const cupom = slug.includes('juros-semestrais') || name.includes('juros semestrais')
  if (idx.includes('SELIC')) return 'selic'
  if (idx.includes('PREFIXADO')) return cupom ? 'cupom-prefixado' : 'prefixado'
  if (idx.includes('IPCA') || idx.includes('IGPM') || idx.includes('IGP-M')) return cupom ? 'indice-cupom' : 'indice'
  return null
}

export function anoDoSlug(slug: string): number | null {
  const m = /(\d{4})$/.exec(slug)
  if (!m) return null
  const ano = Number(m[1])
  return ano >= 1990 && ano <= 2200 ? ano : null
}

export function indiceDeClasse(indexer: string): 'IPCA' | 'IGP-M' | null {
  const idx = indexer.toUpperCase()
  if (idx.includes('IGPM') || idx.includes('IGP-M')) return 'IGP-M'
  if (idx.includes('IPCA')) return 'IPCA'
  return null
}

export interface ContaTesouro {
  tipo: ClasseTesouro
  /** acumulação até a conversão, conversão já iniciada, até o vencimento, ou um ano parado */
  fase: 'acumulacao' | 'conversao' | 'ate-vencimento' | 'um-ano'
  dias: number | null
  taxaPct: number
  montante: number | null
  ganho: number | null
  /** poder de compra acima do índice, não é real nominal */
  ganhoReal: number | null
  aliquota: number | null
  imposto: number | null
  liquido: number | null
  parcelas: 60 | 240 | null
  anoConversao: number | null
}

function composto(valor: number, taxaPct: number, dias: number): number {
  return valor * (1 + taxaPct / 100) ** (dias / 365)
}

function comIr(valor: number, montante: number, dias: number): { ganho: number; aliquota: number; imposto: number; liquido: number } | null {
  const aliquota = aliquotaIrRendaFixa(dias)
  if (aliquota == null) return null
  const ganho = montante - valor
  const imposto = ganho * aliquota
  return { ganho, aliquota, imposto, liquido: montante - imposto }
}

/**
 * A conta de um título para um valor. null quando falta taxa, prazo ou o
 * vencimento não está no futuro: a página responde 404 em vez de inventar.
 */
export function contaTesouro(input: {
  classe: ClasseTesouro
  valor: number
  taxaPct: number | null
  selicPct: number | null
  spreadPct: number | null
  hoje: string
  vencimento: string | null
  anoConversao: number | null
}): ContaTesouro | null {
  const valor = input.valor
  if (!(valor > 0) || !Number.isFinite(valor)) return null

  if (input.classe === 'selic') {
    if (input.selicPct == null || !Number.isFinite(input.selicPct)) return null
    const spread = input.spreadPct != null && Number.isFinite(input.spreadPct) ? input.spreadPct : 0
    const taxaPct = input.selicPct + spread
    const dias = 365
    const montante = composto(valor, taxaPct, dias)
    const ir = comIr(valor, montante, dias)
    if (!ir) return null
    return {
      tipo: 'selic', fase: 'um-ano', dias, taxaPct, montante,
      ganho: ir.ganho, ganhoReal: null, aliquota: ir.aliquota, imposto: ir.imposto, liquido: ir.liquido,
      parcelas: null, anoConversao: null,
    }
  }

  if (input.taxaPct == null || !Number.isFinite(input.taxaPct)) return null
  const taxaPct = input.taxaPct

  if (input.classe === 'renda' || input.classe === 'educa') {
    const parcelas = input.classe === 'educa' ? 60 : 240
    const ano = input.anoConversao
    if (ano == null) return null
    const inicio = `${ano}-01-01`
    const dias = diasCorridos(input.hoje, inicio)
    if (dias == null) return null
    if (dias <= 0) {
      return {
        tipo: input.classe, fase: 'conversao', dias: null, taxaPct,
        montante: null, ganho: null, ganhoReal: null, aliquota: null, imposto: null, liquido: null,
        parcelas, anoConversao: ano,
      }
    }
    const montante = composto(valor, taxaPct, dias)
    return {
      tipo: input.classe, fase: 'acumulacao', dias, taxaPct,
      montante: null, ganho: null, ganhoReal: montante - valor, aliquota: null, imposto: null, liquido: null,
      parcelas, anoConversao: ano,
    }
  }

  const dias = input.vencimento ? diasCorridos(input.hoje, input.vencimento) : null
  if (dias == null || dias <= 0) return null
  const montante = composto(valor, taxaPct, dias)
  const aliquota = aliquotaIrRendaFixa(dias)

  if (input.classe === 'prefixado') {
    const ir = comIr(valor, montante, dias)
    if (!ir || aliquota == null) return null
    return {
      tipo: 'prefixado', fase: 'ate-vencimento', dias, taxaPct, montante,
      ganho: ir.ganho, ganhoReal: null, aliquota, imposto: ir.imposto, liquido: ir.liquido,
      parcelas: null, anoConversao: null,
    }
  }

  if (input.classe === 'cupom-prefixado') {
    return {
      tipo: 'cupom-prefixado', fase: 'ate-vencimento', dias, taxaPct, montante,
      ganho: montante - valor, ganhoReal: null, aliquota, imposto: null, liquido: null,
      parcelas: null, anoConversao: null,
    }
  }

  return {
    tipo: input.classe, fase: 'ate-vencimento', dias, taxaPct,
    montante: null, ganho: null, ganhoReal: montante - valor, aliquota, imposto: null, liquido: null,
    parcelas: null, anoConversao: null,
  }
}

export function paginaTesouroValida(input: {
  slug: string
  name: string
  indexer: string
  rateNumeric: number | null
  referenceRate: number | null
  maturity: string | null
  hoje: string
}): boolean {
  const classe = classeDeTesouro(input)
  if (!classe) return false
  if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(input.slug)) return false
  return contaTesouro({
    classe,
    valor: VALOR_PADRAO,
    taxaPct: input.rateNumeric,
    selicPct: input.referenceRate,
    spreadPct: classe === 'selic' ? input.rateNumeric : null,
    hoje: input.hoje,
    vencimento: input.maturity,
    anoConversao: anoDoSlug(input.slug),
  }) != null
}

export function seoQuantoRendeTesouro(input: {
  nome: string
  taxaRotulo: string
  resumo: string
}): { title: string; description: string } {
  const curto = input.nome
    .replace(/\s+Aposentadoria Extra\b/gi, '')
    .replace(/\s+com Juros Semestrais\b/gi, ' Juros')
    .replace(/\s+/g, ' ')
    .trim()
  return {
    title: tituloQueCabe(`Quanto rende ${curto}`),
    description: juntaAte([
      input.resumo,
      `Taxa ${input.taxaRotulo}.`,
      'Não é recomendação.',
    ]),
  }
}

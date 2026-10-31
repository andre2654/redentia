/**
 * Dados de /quanto-rende/tesouro/{slug}. A taxa é a de GET /tesouro/{slug},
 * a mesma de /tesouro/{slug}, com price_date. A conta mora em
 * app/utils/quanto-rende.ts. Título sem taxa ou já vencido: 404. Falha de
 * rede: 503.
 */
import type { TesouroApi } from '~/types/market'
import type { NuFaqItem } from '~/types/market'
import {
  aliquotaFmt,
  anoDoSlug,
  classeDeTesouro,
  contaTesouro,
  diaCurto,
  dinheiroFmt,
  paginaTesouroValida,
  seoQuantoRendeTesouro,
  VALOR_PADRAO,
  type ContaTesouro,
} from '~/utils/quanto-rende'

export interface QuantoRendeTesouroPayload {
  slug: string
  nome: string
  indexer: string
  taxaRotulo: string
  taxaPct: number | null
  selicPct: number | null
  spreadPct: number | null
  vencimento: string | null
  vencimentoFmt: string
  precoCompraFmt: string | null
  referenciaFmt: string | null
  referenciaRotulo: string | null
  anoConversao: number | null
  hoje: string
  fonteTaxa: string
  fonteReferencia: string | null
  dataDate: string | null
  seo: { title: string; description: string }
  faq: NuFaqItem[]
  /** conta com R$ 1.000, a mesma do FAQ e do SEO */
  exemplo: ContaTesouro
}

function statusOf(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

function isoDia(v: unknown): string | null {
  const s = typeof v === 'string' ? v.slice(0, 10) : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null
}

function maturityFmt(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return d && m && y ? `${d}/${m}/${y}` : iso
}

function resumoExemplo(nome: string, conta: ContaTesouro): string {
  const valor = dinheiroFmt(VALOR_PADRAO)
  if (conta.tipo === 'prefixado' && conta.liquido != null && conta.montante != null) {
    return `${valor} no ${nome} vão a ${dinheiroFmt(conta.montante)} brutos no vencimento, ${dinheiroFmt(conta.liquido)} depois do IR.`
  }
  if (conta.tipo === 'selic' && conta.liquido != null && conta.ganho != null) {
    return `Se a taxa de hoje ficasse parada por um ano, ${valor} no ${nome} renderiam ${dinheiroFmt(conta.ganho)} brutos.`
  }
  if (conta.ganhoReal != null) {
    return `${valor} no ${nome}: ganho real de ${dinheiroFmt(conta.ganhoReal)} acima do índice, no prazo da conta.`
  }
  if (conta.fase === 'conversao') {
    return `${nome} já está na fase de pagamentos mensais. A página não projeta a parcela: a API não traz o valor.`
  }
  return `${nome}: a taxa de hoje aplicada a ${valor}.`
}

async function loadQuantoRendeTesouro(base: string, slug: string): Promise<QuantoRendeTesouroPayload> {
  let t: TesouroApi
  try {
    t = (await tesouroFetchOne(base, slug)).data
  } catch (e) {
    if (statusOf(e) === 404) throw createError({ statusCode: 404, statusMessage: 'Título não encontrado' })
    throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })
  }

  const hoje = spISODate()
  const classe = classeDeTesouro(t)
  const maturity = isoDia(t.maturity_date)
  const rateNumeric = t.rate_numeric != null && Number.isFinite(t.rate_numeric) ? t.rate_numeric : null
  const reference = t.reference_rate != null && Number.isFinite(t.reference_rate) ? t.reference_rate : null
  if (!classe || !paginaTesouroValida({
    slug: t.slug,
    name: t.name,
    indexer: t.indexer,
    rateNumeric,
    referenceRate: reference,
    maturity,
    hoje,
  })) {
    throw createError({ statusCode: 404, statusMessage: 'Título sem taxa para esta conta' })
  }

  const ano = anoDoSlug(t.slug)
  const exemplo = contaTesouro({
    classe,
    valor: VALOR_PADRAO,
    taxaPct: rateNumeric,
    selicPct: reference,
    spreadPct: classe === 'selic' ? rateNumeric : null,
    hoje,
    vencimento: maturity,
    anoConversao: ano,
  })
  if (!exemplo) throw createError({ statusCode: 404, statusMessage: 'Título sem taxa para esta conta' })

  const priceDate = isoDia(t.price_date)
  const quando = priceDate ? diaCurto(priceDate) : null
  const fonteTaxa = `Fonte: Tesouro Direto${quando ? `, taxa de ${quando}` : ''}.`
  const fonteReferencia = reference != null && t.reference_rate_label
    ? `Fonte: Tesouro Direto, ${t.reference_rate_label}${quando ? ` em ${quando}` : ''}.`
    : null
  const taxaRotulo = tesouroRateFmt(t)
  const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const vencimentoFmt = maturityFmt(maturity)
  const precoCompraFmt = t.price_buy != null && Number.isFinite(t.price_buy)
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.price_buy)
    : null

  const irFrase = exemplo.aliquota != null
    ? `Neste prazo a tabela regressiva de renda fixa, a mesma já descrita nas páginas de Tesouro, fica em ${aliquotaFmt(exemplo.aliquota)} sobre o rendimento.`
    : 'O IR incide sobre o rendimento, pela tabela regressiva, e não há um líquido único nesta página.'

  const faq: NuFaqItem[] = [
    {
      q: `Quanto rendem R$ 1.000 no ${t.name}?`,
      a: `${resumoExemplo(t.name, exemplo)} ${fonteTaxa} A conta compõe a taxa anual por dias corridos divididos por 365. Não é o preço unitário do título.`,
    },
    {
      q: 'O valor é bruto ou líquido de imposto?',
      a: exemplo.liquido != null
        ? `Os dois saem na página. O líquido desconta ${aliquotaFmt(exemplo.aliquota!)} de IR sobre o ganho, não sobre o valor aplicado. ${irFrase} IOF só existe nos primeiros 30 dias, e a tabela diária não está calculada aqui. A custódia da B3 também fica de fora.`
        : `${irFrase} ${exemplo.tipo === 'selic' ? '' : 'Sem o índice do período, ou com juros pagos no caminho, um único líquido em reais inventaria dado. '}IOF e custódia da B3 não entram nesta conta. ${fonteTaxa}`,
    },
    {
      q: 'Isso é uma recomendação?',
      a: 'Não. A página descreve a taxa de hoje e a conta. Vender antes do vencimento sai pelo preço do dia. Não é recomendação de compra ou venda.',
    },
  ]

  return {
    slug: t.slug,
    nome: t.name,
    indexer: t.indexer,
    taxaRotulo,
    taxaPct: rateNumeric,
    selicPct: reference,
    spreadPct: classe === 'selic' ? rateNumeric : null,
    vencimento: maturity,
    vencimentoFmt,
    precoCompraFmt,
    referenciaFmt: reference != null ? `${nf2.format(reference)}%` : null,
    referenciaRotulo: t.reference_rate_label,
    anoConversao: ano,
    hoje,
    fonteTaxa,
    fonteReferencia,
    dataDate: priceDate,
    seo: seoQuantoRendeTesouro({
      nome: t.name,
      taxaRotulo,
      resumo: resumoExemplo(t.name, exemplo),
    }),
    faq,
    exemplo,
  }
}

export async function useQuantoRendeTesouro(slug: string) {
  const config = useRuntimeConfig()
  const serverBase = import.meta.server
    ? (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
    : ''
  const clientBase = '/api/backend'
  const { data, error } = await useAsyncData<QuantoRendeTesouroPayload>(
    `quanto-rende-tesouro:${slug}`,
    () => loadQuantoRendeTesouro(import.meta.server ? serverBase : clientBase, slug),
  )
  return { data, error }
}

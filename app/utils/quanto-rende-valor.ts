/**
 * /quanto-rende/{valor}: simulação de um valor em reais na poupança, no CDI
 * e no Tesouro Selic. Pura, sem fetch. A taxa entra pronta, lida do SGS do
 * Banco Central. Sem taxa, não há número.
 *
 * CDI: a série 12 é a taxa ao dia. "110% do CDI" aplica 1,10 sobre essa taxa
 * e anualiza na base de 252 dias úteis, com o mesmo arredondamento de 2 casas
 * da série 4389. O montante usa a taxa anual em dias corridos ÷ 365, a conta
 * já publicada em /quanto-rende/tesouro. O site não tem calendário de dias úteis.
 *
 * Poupança: a série 195 já é o rendimento do período, com a TR. A página
 * compõe essa taxa mensal. Não reconstrói 0,5% + TR.
 *
 * Tesouro Selic: a série 1178 é a Selic efetiva anualizada, não a meta do
 * Copom e não o spread do título do dia. A custódia da B3 é 0,20% ao ano
 * sobre o que passar de R$ 10.000 no Tesouro Selic (tarifas da B3; Ofício
 * Circular 137/2023-PRE). A taxa do agente de custódia não entra.
 *
 * IR: a tabela regressiva da Lei 11.033/2004. Poupança de pessoa física:
 * art. 68, III, da Lei 8.981/1995, isenta nesta simulação.
 */
import type { NuFaqItem } from '../types/market.ts'
import { B3_TICKER_RE } from './tickerClass.ts'
import { aliquotaIrRendaFixa, diaCurto, dinheiroFmt } from './quanto-rende.ts'
import { juntaAte, tituloQueCabe } from './serp.ts'

export const CUSTODIA_B3_AA = 0.2
export const ISENCAO_CUSTODIA_SELIC = 10_000
/** Art. 12 da Lei 8.177/1991, redação da Lei 12.703/2012. */
export const LIMIAR_POUPANCA_SELIC = 8.5

export interface ValorQuantoRende {
  slug: string
  reais: number
  /** "R$ 100 mil" */
  nome: string
  /** "100 mil", para a frase "de 100 mil". */
  curto: string
}

export const VALORES_QUANTO_RENDE: readonly ValorQuantoRende[] = [
  { slug: '1-mil', reais: 1_000, nome: 'R$ 1 mil', curto: '1 mil' },
  { slug: '5-mil', reais: 5_000, nome: 'R$ 5 mil', curto: '5 mil' },
  { slug: '10-mil', reais: 10_000, nome: 'R$ 10 mil', curto: '10 mil' },
  { slug: '20-mil', reais: 20_000, nome: 'R$ 20 mil', curto: '20 mil' },
  { slug: '50-mil', reais: 50_000, nome: 'R$ 50 mil', curto: '50 mil' },
  { slug: '100-mil', reais: 100_000, nome: 'R$ 100 mil', curto: '100 mil' },
  { slug: '200-mil', reais: 200_000, nome: 'R$ 200 mil', curto: '200 mil' },
  { slug: '300-mil', reais: 300_000, nome: 'R$ 300 mil', curto: '300 mil' },
  { slug: '500-mil', reais: 500_000, nome: 'R$ 500 mil', curto: '500 mil' },
  { slug: '1-milhao', reais: 1_000_000, nome: 'R$ 1 milhão', curto: '1 milhão' },
  { slug: '2-milhoes', reais: 2_000_000, nome: 'R$ 2 milhões', curto: '2 milhões' },
  { slug: '5-milhoes', reais: 5_000_000, nome: 'R$ 5 milhões', curto: '5 milhões' },
]

const VIZINHOS: Record<string, readonly string[]> = {
  '1-mil': ['5-mil', '10-mil', '50-mil', '100-mil'],
  '5-mil': ['1-mil', '10-mil', '20-mil', '50-mil'],
  '10-mil': ['5-mil', '20-mil', '50-mil', '100-mil'],
  '20-mil': ['10-mil', '50-mil', '100-mil', '200-mil'],
  '50-mil': ['20-mil', '100-mil', '200-mil', '500-mil'],
  '100-mil': ['50-mil', '200-mil', '500-mil', '1-milhao'],
  '200-mil': ['100-mil', '300-mil', '500-mil', '1-milhao'],
  '300-mil': ['100-mil', '200-mil', '500-mil', '1-milhao'],
  '500-mil': ['100-mil', '200-mil', '1-milhao', '2-milhoes'],
  '1-milhao': ['100-mil', '500-mil', '2-milhoes', '5-milhoes'],
  '2-milhoes': ['500-mil', '1-milhao', '5-milhoes'],
  '5-milhoes': ['500-mil', '1-milhao', '2-milhoes'],
}

const porSlug = new Map(VALORES_QUANTO_RENDE.map((v) => [v.slug, v]))

export function valorPorSlug(slug: string): ValorQuantoRende | null {
  return porSlug.get(slug) ?? null
}

/** Slug de valor não pode ser ticker da B3 nem caminho de Tesouro. */
export function slugValorColide(slug: string): boolean {
  if (B3_TICKER_RE.test(slug.toUpperCase())) return true
  const s = slug.toLowerCase()
  return s === 'tesouro' || s.startsWith('tesouro-')
}

export function vizinhosQuantoRende(slug: string): ValorQuantoRende[] {
  return (VIZINHOS[slug] ?? [])
    .map((s) => porSlug.get(s))
    .filter((v): v is ValorQuantoRende => !!v)
}

export interface HorizonteQuantoRende {
  id: '1m' | '6m' | '1a' | '2a' | '5a'
  rotulo: string
  /** Dias corridos da tabela de IR e da capitalização do CDI e da Selic. */
  dias: number
  /** Períodos mensais da poupança, que credita no aniversário. */
  meses: number
}

export const HORIZONTES_QUANTO_RENDE: readonly HorizonteQuantoRende[] = [
  { id: '1m', rotulo: '1 mês', dias: 30, meses: 1 },
  { id: '6m', rotulo: '6 meses', dias: 180, meses: 6 },
  { id: '1a', rotulo: '1 ano', dias: 365, meses: 12 },
  { id: '2a', rotulo: '2 anos', dias: 730, meses: 24 },
  { id: '5a', rotulo: '5 anos', dias: 1825, meses: 60 },
]

export const PERCENTUAIS_CDI = [1, 1.05, 1.1, 1.15, 1.2] as const

export interface PontoSgs {
  dataIso: string
  fimIso: string | null
  valor: number
}

function isoDe(br: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br)
  if (!m) return null
  const iso = `${m[3]}-${m[2]}-${m[1]}`
  const ida = new Date(`${iso}T12:00:00Z`).toISOString().slice(0, 10)
  return ida === iso ? iso : null
}

/** Um ponto do SGS, inclusive a série 195, que traz dataFim. */
export function lerPontosSgs(payload: unknown): PontoSgs[] {
  if (!Array.isArray(payload)) return []
  const out: PontoSgs[] = []
  for (const row of payload) {
    if (!row || typeof row !== 'object') continue
    const bruto = row as { data?: unknown, dataFim?: unknown, valor?: unknown }
    const dataIso = isoDe(String(bruto.data ?? ''))
    if (!dataIso) continue
    const valor = Number(String(bruto.valor ?? '').replace(',', '.'))
    if (!Number.isFinite(valor)) continue
    const fimBruto = bruto.dataFim == null || bruto.dataFim === '' ? null : isoDe(String(bruto.dataFim))
    out.push({ dataIso, fimIso: fimBruto, valor })
  }
  return out
}

/** O ponto mais recente cuja data de referência não passa de `hoje`. */
export function pontoSgsAte(payload: unknown, hoje: string): PontoSgs | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hoje)) return null
  let best: PontoSgs | null = null
  for (const p of lerPontosSgs(payload)) {
    if (p.dataIso > hoje) continue
    if (!best || p.dataIso > best.dataIso) best = p
  }
  return best
}

function taxaAnualCrivel(n: number): boolean {
  return Number.isFinite(n) && n >= 1 && n <= 40
}

function taxaMensalCrivel(n: number): boolean {
  return Number.isFinite(n) && n > 0 && n < 3
}

/**
 * Percentual do CDI anualizado na base 252, em 2 casas.
 * 100% reproduz a série 4389 quando o diário é o da série 12.
 */
export function taxaAnualPercentualCdi(cdiAoDia: number, percentual: number): number | null {
  if (!Number.isFinite(cdiAoDia) || cdiAoDia <= 0 || cdiAoDia >= 1) return null
  if (!Number.isFinite(percentual) || percentual <= 0) return null
  const aa = (Math.pow(1 + (cdiAoDia / 100) * percentual, 252) - 1) * 100
  const arred = Math.round(aa * 100) / 100
  return taxaAnualCrivel(arred) ? arred : null
}

export interface TaxasQuantoRendeValor {
  cdiAnual: number
  cdiDiario: number | null
  /** true quando o percentual do CDI saiu da série 12. false: série 4389 × percentual. */
  cdiPeloDiario: boolean
  cdiData: string
  cdiSerie: 12 | 4389
  selicAnual: number
  selicData: string
  selicSerie: 11 | 1178
  selicMeta: number | null
  selicMetaData: string | null
  poupancaMensal: number
  poupancaInicio: string
  poupancaFim: string | null
}

export function montarTaxasQuantoRende(input: {
  serie4389: unknown
  serie12: unknown
  serie1178: unknown
  serie11: unknown
  serie432: unknown
  serie195: unknown
  hoje: string
}): TaxasQuantoRendeValor | null {
  const cdiAnualPonto = pontoSgsAte(input.serie4389, input.hoje)
  const cdiDia = pontoSgsAte(input.serie12, input.hoje)
  const diarioOk = cdiDia != null && cdiDia.valor > 0 && cdiDia.valor < 1
    ? cdiDia
    : null
  const anualOficial = cdiAnualPonto && taxaAnualCrivel(cdiAnualPonto.valor) ? cdiAnualPonto : null
  const anualDoDia = diarioOk ? taxaAnualPercentualCdi(diarioOk.valor, 1) : null

  let cdiAnual: number | null = null
  let cdiData: string | null = null
  let cdiSerie: 12 | 4389 = 4389
  if (anualOficial) {
    cdiAnual = anualOficial.valor
    cdiData = anualOficial.dataIso
    cdiSerie = 4389
  } else if (anualDoDia != null && diarioOk) {
    cdiAnual = anualDoDia
    cdiData = diarioOk.dataIso
    cdiSerie = 12
  }
  if (cdiAnual == null || !cdiData) return null

  const selic1178 = pontoSgsAte(input.serie1178, input.hoje)
  const selic11 = pontoSgsAte(input.serie11, input.hoje)
  let selicAnual: number | null = null
  let selicData: string | null = null
  let selicSerie: 11 | 1178 = 1178
  if (selic1178 && taxaAnualCrivel(selic1178.valor)) {
    selicAnual = selic1178.valor
    selicData = selic1178.dataIso
    selicSerie = 1178
  } else if (selic11 && selic11.valor > 0 && selic11.valor < 1) {
    const anual = taxaAnualPercentualCdi(selic11.valor, 1)
    if (anual != null) {
      selicAnual = anual
      selicData = selic11.dataIso
      selicSerie = 11
    }
  }
  if (selicAnual == null || !selicData) return null

  const poup = pontoSgsAte(input.serie195, input.hoje)
  if (!poup || !taxaMensalCrivel(poup.valor)) return null

  const meta = pontoSgsAte(input.serie432, input.hoje)
  const metaOk = meta && Number.isFinite(meta.valor) && meta.valor >= 0 && meta.valor <= 40 ? meta : null

  return {
    cdiAnual,
    cdiDiario: diarioOk ? diarioOk.valor : null,
    cdiPeloDiario: diarioOk != null,
    cdiData,
    cdiSerie,
    selicAnual,
    selicData,
    selicSerie,
    selicMeta: metaOk ? metaOk.valor : null,
    selicMetaData: metaOk ? metaOk.dataIso : null,
    poupancaMensal: poup.valor,
    poupancaInicio: poup.dataIso,
    poupancaFim: poup.fimIso,
  }
}

export function taxaDoCenarioCdi(taxas: TaxasQuantoRendeValor, percentual: number): number | null {
  if (taxas.cdiPeloDiario && taxas.cdiDiario != null) {
    return taxaAnualPercentualCdi(taxas.cdiDiario, percentual)
  }
  if (!taxas.cdiPeloDiario && Math.abs(percentual - 1) < 1e-9) return taxas.cdiAnual
  const aa = Math.round(taxas.cdiAnual * percentual * 100) / 100
  return taxaAnualCrivel(aa) ? aa : null
}

function composto(valor: number, taxaPct: number, dias: number): number {
  return valor * (1 + taxaPct / 100) ** (dias / 365)
}

export interface CelulaQuantoRende {
  horizonte: HorizonteQuantoRende
  montante: number
  ganho: number
  aliquota: number
  imposto: number
  custodia: number
  liquido: number
}

export interface CenarioQuantoRende {
  id: string
  rotulo: string
  detalhe: string
  taxaRotulo: string
  irIsento: boolean
  celulas: CelulaQuantoRende[]
}

export interface SimulacaoQuantoRende {
  cenarios: CenarioQuantoRende[]
}

function celulaCdi(valor: number, taxaPct: number, h: HorizonteQuantoRende): CelulaQuantoRende | null {
  const aliquota = aliquotaIrRendaFixa(h.dias)
  if (aliquota == null) return null
  const montante = composto(valor, taxaPct, h.dias)
  const ganho = montante - valor
  const imposto = ganho * aliquota
  return { horizonte: h, montante, ganho, aliquota, imposto, custodia: 0, liquido: montante - imposto }
}

function celulaPoupanca(valor: number, taxaMensal: number, h: HorizonteQuantoRende): CelulaQuantoRende {
  const montante = valor * (1 + taxaMensal / 100) ** h.meses
  const ganho = montante - valor
  return { horizonte: h, montante, ganho, aliquota: 0, imposto: 0, custodia: 0, liquido: montante }
}

/**
 * Bruto na Selic cheia. A custódia tira 0,20 p.p. ao ano só da parcela acima
 * de R$ 10.000. O IR incide sobre o rendimento bruto, não sobre o principal,
 * e esta conta não abate a custódia da base do imposto.
 */
export function celulaTesouroSelic(valor: number, selicPct: number, h: HorizonteQuantoRende): CelulaQuantoRende | null {
  const aliquota = aliquotaIrRendaFixa(h.dias)
  if (aliquota == null || !(valor > 0)) return null
  const bruto = composto(valor, selicPct, h.dias)
  const isento = Math.min(valor, ISENCAO_CUSTODIA_SELIC)
  const excesso = Math.max(0, valor - ISENCAO_CUSTODIA_SELIC)
  const depois = composto(isento, selicPct, h.dias) + composto(excesso, selicPct - CUSTODIA_B3_AA, h.dias)
  const custodia = bruto - depois
  const ganho = bruto - valor
  const imposto = ganho * aliquota
  return {
    horizonte: h,
    montante: bruto,
    ganho,
    aliquota,
    imposto,
    custodia,
    liquido: bruto - imposto - custodia,
  }
}

const nfTaxa = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

export function taxaFmt(n: number): string {
  return `${nfTaxa.format(n)}%`
}

export function aliquotaCurta(aliquota: number): string {
  const pct = aliquota * 100
  const texto = Number.isInteger(pct) ? String(pct) : pct.toFixed(1).replace('.', ',')
  return `${texto}%`
}

function rotuloPercentual(percentual: number): string {
  return `${Math.round(percentual * 100)}% do CDI`
}

export function simularQuantoRendeValor(valor: number, taxas: TaxasQuantoRendeValor): SimulacaoQuantoRende | null {
  if (!(valor > 0) || !Number.isFinite(valor)) return null
  const cenarios: CenarioQuantoRende[] = []

  const poupCelulas = HORIZONTES_QUANTO_RENDE.map((h) => celulaPoupanca(valor, taxas.poupancaMensal, h))
  cenarios.push({
    id: 'poupanca',
    rotulo: 'Poupança',
    detalhe: 'Série 195 do SGS, rendimento do período, com a TR. Isenta de IR para pessoa física nesta simulação.',
    taxaRotulo: `${taxaFmt(taxas.poupancaMensal)} ao mês`,
    irIsento: true,
    celulas: poupCelulas,
  })

  for (const percentual of PERCENTUAIS_CDI) {
    const taxa = taxaDoCenarioCdi(taxas, percentual)
    if (taxa == null) return null
    const celulas: CelulaQuantoRende[] = []
    for (const h of HORIZONTES_QUANTO_RENDE) {
      const c = celulaCdi(valor, taxa, h)
      if (!c) return null
      celulas.push(c)
    }
    cenarios.push({
      id: `cdi-${Math.round(percentual * 100)}`,
      rotulo: rotuloPercentual(percentual),
      detalhe: taxas.cdiPeloDiario
        ? 'Percentual sobre o CDI ao dia da série 12, anualizado na base 252 e arredondado em 2 casas.'
        : 'A série diária não entrou. O percentual multiplica a taxa anual da série usada.',
      taxaRotulo: `${taxaFmt(taxa)} ao ano`,
      irIsento: false,
      celulas,
    })
  }

  const selicCelulas: CelulaQuantoRende[] = []
  for (const h of HORIZONTES_QUANTO_RENDE) {
    const c = celulaTesouroSelic(valor, taxas.selicAnual, h)
    if (!c) return null
    selicCelulas.push(c)
  }
  cenarios.push({
    id: 'tesouro-selic',
    rotulo: 'Tesouro Selic',
    detalhe: 'Selic efetiva, sem o spread do título do dia. Custódia da B3 de 0,20% ao ano só acima de R$ 10.000.',
    taxaRotulo: `${taxaFmt(taxas.selicAnual)} ao ano`,
    irIsento: false,
    celulas: selicCelulas,
  })

  return { cenarios }
}

export function celulaDe(sim: SimulacaoQuantoRende, cenarioId: string, horizonteId: HorizonteQuantoRende['id']): CelulaQuantoRende | null {
  const c = sim.cenarios.find((item) => item.id === cenarioId)
  return c?.celulas.find((cel) => cel.horizonte.id === horizonteId) ?? null
}

export function periodoPoupanca(taxas: TaxasQuantoRendeValor): string {
  const ini = diaCurto(taxas.poupancaInicio)
  if (!taxas.poupancaFim) return ini
  return `${ini} a ${diaCurto(taxas.poupancaFim)}`
}

export function seoQuantoRendeValor(entrada: ValorQuantoRende): { title: string, description: string } {
  return {
    title: tituloQueCabe(`Quanto rende ${entrada.nome} no CDI`),
    description: juntaAte([
      `${entrada.nome} no CDI, na poupança e no Tesouro Selic, com a taxa do dia do Banco Central.`,
      'Simulação. Não é garantia nem recomendação.',
    ]),
  }
}

export function paginasQuantoRendeValor(): { path: string, title: string, description: string }[] {
  return VALORES_QUANTO_RENDE.map((entrada) => {
    const seo = seoQuantoRendeValor(entrada)
    return {
      path: `/quanto-rende/${entrada.slug}`,
      title: seo.title,
      description: seo.description,
    }
  })
}

export function faqQuantoRendeValor(
  entrada: ValorQuantoRende,
  taxas: TaxasQuantoRendeValor,
  sim: SimulacaoQuantoRende,
): NuFaqItem[] {
  const mes = celulaDe(sim, 'cdi-100', '1m')
  const ano = celulaDe(sim, 'cdi-100', '1a')
  const poupAno = celulaDe(sim, 'poupanca', '1a')
  const selicAno = celulaDe(sim, 'tesouro-selic', '1a')
  const cdi115 = celulaDe(sim, 'cdi-115', '1a')
  const nome = entrada.nome
  const itens: NuFaqItem[] = []
  if (mes && ano) {
    itens.push({
      q: `Quanto rende ${nome} por mês no CDI?`,
      a: `Em 30 dias corridos, se o CDI de ${taxaFmt(taxas.cdiAnual)} ao ano (${diaCurto(taxas.cdiData)}, série ${taxas.cdiSerie} do SGS) permanecesse, ${nome} em 100% do CDI chegam a ${dinheiroFmt(mes.liquido)} líquidos. O bruto é ${dinheiroFmt(mes.montante)} e o IR, de ${aliquotaCurta(mes.aliquota)}, é ${dinheiroFmt(mes.imposto)}. Em 365 dias, o líquido dessa mesma taxa é ${dinheiroFmt(ano.liquido)}. É simulação da taxa de hoje, não rendimento contratado nem garantia.`,
    })
  }
  if (poupAno) {
    itens.push({
      q: `Quanto rende ${nome} na poupança?`,
      a: `A série 195 do SGS publica ${taxaFmt(taxas.poupancaMensal)} ao mês para o período de ${periodoPoupanca(taxas)}. Doze períodos nessa taxa levam ${nome} a ${dinheiroFmt(poupAno.liquido)}. A poupança credita no aniversário do depósito, sobre o menor saldo do período. Sacar antes do aniversário não recebe esse rendimento. Para pessoa física, o art. 68, III, da Lei 8.981/1995 isenta esse rendimento de IR, e a simulação usa essa isenção. Não calcula imposto que dependa da renda total da pessoa.`,
    })
  }
  if (selicAno) {
    itens.push({
      q: `Quanto rende ${nome} no Tesouro Selic?`,
      a: `Em 365 dias, com a Selic efetiva de ${taxaFmt(taxas.selicAnual)} ao ano (série ${taxas.selicSerie} do SGS, ${diaCurto(taxas.selicData)}), o bruto é ${dinheiroFmt(selicAno.montante)}. O IR de ${aliquotaCurta(selicAno.aliquota)} é ${dinheiroFmt(selicAno.imposto)}. A custódia da B3, de 0,20% ao ano só sobre o que passar de R$ 10.000, é ${dinheiroFmt(selicAno.custodia)}. O líquido dessa conta é ${dinheiroFmt(selicAno.liquido)}. Não inclui o spread do título do dia nem a taxa do agente de custódia. Não é o preço de uma venda antecipada.`,
    })
  }
  if (cdi115) {
    const taxa = sim.cenarios.find((c) => c.id === 'cdi-115')?.taxaRotulo ?? ''
    const como = taxas.cdiPeloDiario
      ? `115% do CDI, nesta página, é o CDI ao dia multiplicado por 1,15, anualizado na base de 252 dias úteis: ${taxa}.`
      : `115% do CDI, nesta leitura, é a taxa anual publicada multiplicada por 1,15: ${taxa}. A série diária não entrou.`
    itens.push({
      q: `Quanto rende 115% do CDI em ${nome}?`,
      a: `${como} Em 365 dias, ${nome} chegam a ${dinheiroFmt(cdi115.liquido)} líquidos de IR (${aliquotaCurta(cdi115.aliquota)}). O bruto é ${dinheiroFmt(cdi115.montante)}. A linha descreve a taxa. Não indica um CDB, uma caixinha ou qualquer emissor.`,
    })
  }
  itens.push({
    q: 'Essa simulação garante o retorno?',
    a: 'Não. A conta repete a taxa vigente do Banco Central pelo prazo indicado, em dias corridos divididos por 365 no CDI e na Selic, e em períodos mensais na poupança. A taxa muda. Rentabilidade passada não garante rentabilidade futura. Não é recomendação de compra ou venda.',
  })
  return itens
}

export function dataModificadaTaxas(taxas: TaxasQuantoRendeValor): string {
  return [taxas.cdiData, taxas.selicData, taxas.poupancaInicio, taxas.selicMetaData]
    .filter((d): d is string => !!d && /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
    .at(-1) ?? taxas.cdiData
}

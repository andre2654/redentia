/**
 * Gráficos de /graficos: a conta, o recorte e o texto que a página, o PNG
 * e o JSON-LD compartilham. Sem Nuxt e sem rede — o fetch mora em
 * server/utils/graficos-dados.ts.
 *
 * Cada número visível sai de uma fonte que o site já cita ou da API pública
 * do Banco Central (SGS). Sem fonte, o gráfico não existe: a função devolve
 * null e a página deixa a faixa de fora.
 */
import { MONTH_LONG_PT, MONTHS_PT } from './format.ts'
import { isCapitalLabel } from './proventos.ts'

export const GRAFICOS_PATH = '/graficos'
export const GRAFICOS_TITULO = 'Gráficos de CDI, proventos e FIIs'
export const GRAFICOS_DESCRICAO =
  'CDI depois do IR, proventos com pagamento na semana e FIIs ordenados por DY (12m). Uso livre com crédito. Não é recomendação.'

export const GRAFICOS_PAGINA = {
  path: GRAFICOS_PATH,
  title: GRAFICOS_TITULO,
  description: GRAFICOS_DESCRICAO,
}

/** Origem fixa do código de embed: o trecho copiado aponta para o site, mesmo numa prévia. */
export const GRAFICOS_EMBED_ORIGEM = 'https://www.redentia.com.br'

export const AVISO = 'Não é recomendação.'

/** Citação pedida para o CDI, com a data de referência acrescentada à parte. */
export const CITACAO_CDI = 'Fonte: Banco Central do Brasil (SGS), tabela regressiva de IR'

export const GRAFICOS_IDS = ['cdi', 'proventos', 'fiis'] as const
export type GraficoId = (typeof GRAFICOS_IDS)[number]

export function ehGraficoId(id: string): id is GraficoId {
  return (GRAFICOS_IDS as readonly string[]).includes(id)
}

/**
 * Tabela regressiva do IR sobre rendimento de aplicação de renda fixa,
 * pessoa física. A metodologia do site já registra as mesmas quatro faixas.
 */
export const FAIXAS_IR = [
  { rotulo: 'Até 180 dias', aliquota: 0.225 },
  { rotulo: '181 a 360 dias', aliquota: 0.2 },
  { rotulo: '361 a 720 dias', aliquota: 0.175 },
  { rotulo: 'Acima de 720 dias', aliquota: 0.15 },
] as const

export interface BarraGrafico {
  rotulo: string
  /** 0 a 1, largura do preenchimento em relação ao trilho. */
  preenchimento: number
  valorTexto: string
}

export interface Grafico {
  id: GraficoId
  nome: string
  titulo: string
  linha: string
  descricao: string
  alt: string
  barras: BarraGrafico[]
  fonte: string
  /** 'YYYY-MM-DD' do dado, nunca a data do build. */
  dataReferencia: string
  /** Data ou período em português, linha própria do PNG. */
  dataTexto: string
  temporalCoverage: string
  nota: string
  pngPath: string
  ancora: string
}

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

export function pct2(n: number): string {
  return `${nf2.format(n)}%`
}

function dataCurta(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`
}

export function rotuloDia(iso: string): string {
  const [, m, d] = iso.split('-')
  if (!m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m}`
}

/** '10 a 15 de novembro de 2026', ou com os dois meses quando a semana vira o mês. */
export function periodoCurto(inicio: string, fim: string): string {
  const [y1, m1, d1] = inicio.split('-').map(Number)
  const [y2, m2, d2] = fim.split('-').map(Number)
  const mes1 = MONTH_LONG_PT[m1 - 1] ?? ''
  const mes2 = MONTH_LONG_PT[m2 - 1] ?? ''
  if (y1 === y2 && m1 === m2) return `${d1} a ${d2} de ${mes2} de ${y2}`
  if (y1 === y2) return `${d1} de ${mes1} a ${d2} de ${mes2} de ${y2}`
  return `${dataCurta(inicio)} a ${dataCurta(fim)}`
}

function isoShift(iso: string, days: number): string {
  const t = Date.parse(`${iso}T12:00:00Z`) + days * 86_400_000
  return new Date(t).toISOString().slice(0, 10)
}

/** Semana civil de segunda a domingo da data 'YYYY-MM-DD' (já no fuso de São Paulo). */
export function semanaCivil(hoje: string): { inicio: string, fim: string } {
  const [y, m, d] = hoje.split('-').map(Number)
  const wd = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1)).getUTCDay()
  const desdeSegunda = (wd + 6) % 7
  const inicio = isoShift(hoje, -desdeSegunda)
  return { inicio, fim: isoShift(inicio, 6) }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0
  if (n >= 1) return 1
  return Math.round(n * 10000) / 10000
}

function anualCrivel(n: number): boolean {
  return Number.isFinite(n) && n >= 1 && n <= 40
}

/** Ponto da API do SGS: [{ "data": "09/11/2026", "valor": "13.65" }]. */
export function lerPontoBcb(payload: unknown): { dataIso: string, valor: number } | null {
  const row = Array.isArray(payload) ? payload[0] : null
  if (!row || typeof row !== 'object') return null
  const bruto = row as { data?: unknown, valor?: unknown }
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(bruto.data ?? ''))
  if (!m) return null
  const valor = Number(String(bruto.valor ?? '').replace(',', '.'))
  if (!Number.isFinite(valor)) return null
  const iso = `${m[3]}-${m[2]}-${m[1]}`
  const ida = new Date(`${iso}T12:00:00Z`).toISOString().slice(0, 10)
  if (ida !== iso) return null
  return { dataIso: iso, valor }
}

/**
 * Série 12 é a taxa ao dia. A série 4389 publica a mesma taxa anualizada
 * na base de 252 dias úteis: (1 + taxa/100)^252 − 1. O arredondamento a
 * 2 casas reproduz o valor que o SGS mostra na 4389.
 */
export function anualizarCdiDiario(aoDiaPercent: number): number | null {
  if (!Number.isFinite(aoDiaPercent) || aoDiaPercent <= 0 || aoDiaPercent >= 1) return null
  const aa = (Math.pow(1 + aoDiaPercent / 100, 252) - 1) * 100
  const arred = Math.round(aa * 100) / 100
  return anualCrivel(arred) ? arred : null
}

export interface LeituraCdi {
  dataIso: string
  /** CDI anualizado, em percentual (13.65 = 13,65% a.a.). */
  anualPercent: number
  serie: 12 | 4389
}

/** Prefere a série 4389. A 12 entra quando a 4389 não traz um percentual anual crível. */
export function leituraCdi(serie4389: unknown, serie12: unknown): LeituraCdi | null {
  const a = lerPontoBcb(serie4389)
  if (a && anualCrivel(a.valor)) {
    return { dataIso: a.dataIso, anualPercent: a.valor, serie: 4389 }
  }
  const d = lerPontoBcb(serie12)
  if (!d) return null
  const anual = anualizarCdiDiario(d.valor)
  if (anual == null) return null
  return { dataIso: d.dataIso, anualPercent: anual, serie: 12 }
}

export function graficoCdi(leitura: LeituraCdi | null): Grafico | null {
  if (!leitura) return null
  const { anualPercent, dataIso, serie } = leitura
  const barras: BarraGrafico[] = FAIXAS_IR.map((faixa) => {
    const liquido = anualPercent * (1 - faixa.aliquota)
    return {
      rotulo: faixa.rotulo,
      preenchimento: clamp01(liquido / anualPercent),
      valorTexto: pct2(liquido),
    }
  })
  const dataTexto = dataCurta(dataIso)
  const serieTxt = serie === 4389
    ? `Série 4389 do SGS, taxa anualizada: ${pct2(anualPercent)} ao ano em ${dataTexto}.`
    : `Série 12 do SGS, taxa ao dia anualizada na base de 252 dias úteis: ${pct2(anualPercent)} ao ano em ${dataTexto}.`
  return {
    id: 'cdi',
    nome: 'CDI líquido da tabela regressiva de IR',
    titulo: 'CDI líquido da tabela regressiva',
    linha: `CDI anualizado ${pct2(anualPercent)} ao ano. Cada barra é essa taxa vezes (1 − alíquota).`,
    descricao: `${serieTxt} O líquido de cada faixa é essa taxa multiplicada por (1 − alíquota): 22,5% até 180 dias, 20% de 181 a 360, 17,5% de 361 a 720 e 15% acima de 720. ${AVISO}`,
    alt: `CDI líquido da tabela regressiva de IR em ${dataTexto}`,
    barras,
    fonte: `${CITACAO_CDI}. Referência: ${dataTexto}.`,
    dataReferencia: dataIso,
    dataTexto,
    temporalCoverage: dataIso,
    nota: serieTxt,
    pngPath: '/graficos/cdi.png',
    ancora: 'cdi',
  }
}

export interface AgendaItem {
  label?: string | null
  /** A API de /dividends/{ticker} manda a chave com espaço no fim. */
  'label '?: string | null
  rate?: number | string | null
  payment_date?: string | null
}

export interface AgendaDia {
  date: string
  count?: number
  items?: AgendaItem[] | null
}

function isoDia(v: unknown): string {
  const s = typeof v === 'string' ? v.slice(0, 10) : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}

function truncado(dia: AgendaDia): boolean {
  const items = dia.items ?? []
  return typeof dia.count === 'number' && items.length < dia.count
}

/**
 * Proventos de renda com data de pagamento na semana civil de `hoje`.
 * Amortização fica de fora, a mesma régua de isCapitalLabel do /dividendos.
 * Dia anterior ao primeiro dia que a agenda devolve não vira zero: a base
 * não o trouxe. Dia dentro da cobertura sem linha é zero de verdade.
 * Dia truncado (count maior que os itens) derruba o gráfico: um total pela
 * metade seria um número sem fonte.
 */
export function graficoProventos(entrada: { dias: AgendaDia[], hoje: string } | null): Grafico | null {
  if (!entrada || !/^\d{4}-\d{2}-\d{2}$/.test(entrada.hoje)) return null
  const dias = entrada.dias.filter((d) => isoDia(d.date))
  const { inicio, fim } = semanaCivil(entrada.hoje)
  const datas = dias.map((d) => d.date).sort()
  const feedInicio = datas[0] ?? entrada.hoje
  const plotInicio = datas.length > 0 && feedInicio <= fim
    ? (feedInicio > inicio ? feedInicio : inicio)
    : (entrada.hoje > inicio ? entrada.hoje : inicio)
  if (plotInicio > fim) return null

  for (const dia of dias) {
    if (dia.date < plotInicio || dia.date > fim) continue
    if (truncado(dia)) return null
  }

  const contagem = new Map<string, number>()
  for (const dia of dias) {
    for (const item of dia.items ?? []) {
      const pay = isoDia(item.payment_date) || dia.date
      if (pay < plotInicio || pay > fim) continue
      const rate = Number(item.rate)
      if (!Number.isFinite(rate) || rate <= 0) continue
      const label = String(item.label ?? item['label '] ?? '')
      if (isCapitalLabel(label)) continue
      contagem.set(pay, (contagem.get(pay) ?? 0) + 1)
    }
  }

  const diasPlot: string[] = []
  for (let iso = plotInicio; iso <= fim; iso = isoShift(iso, 1)) diasPlot.push(iso)
  const max = Math.max(...diasPlot.map((iso) => contagem.get(iso) ?? 0), 0)
  const barras: BarraGrafico[] = diasPlot.map((iso) => {
    const n = contagem.get(iso) ?? 0
    return {
      rotulo: rotuloDia(iso),
      preenchimento: max > 0 ? clamp01(n / max) : 0,
      valorTexto: nf0.format(n),
    }
  })

  const periodo = periodoCurto(plotInicio, fim)
  const dataTexto = dataCurta(entrada.hoje)
  return {
    id: 'proventos',
    nome: 'Proventos anunciados com pagamento nesta semana',
    titulo: 'Proventos com pagamento nesta semana',
    linha: 'Contagem por data de pagamento. Amortização não entra.',
    descricao: `Proventos de renda com data de pagamento de ${periodo}, lidos em ${dataTexto} nos avisos de proventos da B3. A agenda não traz a data do anúncio, só a data com e a data de pagamento. ${AVISO}`,
    alt: `Proventos com pagamento de ${periodo}`,
    barras,
    fonte: `Fonte: avisos de proventos da B3. Período: ${periodo}.`,
    dataReferencia: entrada.hoje,
    dataTexto,
    temporalCoverage: plotInicio === fim ? plotInicio : `${plotInicio}/${fim}`,
    nota: 'A base lista o provento já avisado à B3. O dia do gráfico é a data de pagamento, não a data do anúncio.',
    pngPath: '/graficos/proventos.png',
    ancora: 'proventos',
  }
}

export interface LinhaFii {
  ticker?: string | null
  name?: string | null
  type?: string | null
  market_price?: number | string | null
  close?: number | string | null
  dividend_yield?: number | string | null
  price_date?: string | null
}

function num(v: number | string | null | undefined): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/**
 * FII de verdade no universo REIT do ranking: ticker de cota e nome de fundo
 * imobiliário. FIAGRO, FIP, FIRF e FIDC saem. O ranking de DY mistura esses
 * veículos no type REIT; o gráfico pede fundo imobiliário.
 */
export function pareceFii(ticker: string, name: string): boolean {
  if (!/^[A-Z][A-Z0-9]{3}11$/.test(ticker)) return false
  const n = name.normalize('NFD').replace(/\p{M}/gu, '')
  if (/\bfiagro\b/i.test(n)) return false
  const imobiliario = /\bfii\b/i.test(n) || /imob/i.test(n)
  if (/\b(firf|fidc|fip)\b/i.test(n) && !imobiliario) return false
  return imobiliario
}

export const FIIS_NO_GRAFICO = 8
/** O texto do ranking de DY exclui yield acima de 50% como erro de dado. */
export const DY_TETO = 0.5

export function graficoFiis(rows: readonly LinhaFii[] | null): Grafico | null {
  if (!rows) return null
  const uteis: { ticker: string, dy: number, priceDate: string }[] = []
  for (const row of rows) {
    const ticker = String(row.ticker ?? '').toUpperCase()
    const name = String(row.name ?? '')
    if (row.type && row.type !== 'REIT') continue
    if (!pareceFii(ticker, name)) continue
    const dy = num(row.dividend_yield)
    if (dy == null || dy <= 0 || dy > DY_TETO) continue
    const preco = num(row.market_price) ?? num(row.close)
    if (preco == null || preco <= 0) continue
    const priceDate = isoDia(row.price_date)
    if (!priceDate) continue
    uteis.push({ ticker, dy, priceDate })
  }
  uteis.sort((a, b) => b.dy - a.dy || (a.ticker < b.ticker ? -1 : a.ticker > b.ticker ? 1 : 0))
  const top = uteis.slice(0, FIIS_NO_GRAFICO)
  if (!top.length) return null
  const max = top[0]!.dy
  const datas = [...new Set(top.map((t) => t.priceDate))].sort()
  const minData = datas[0]!
  const maxData = datas[datas.length - 1]!
  const dataTexto = minData === maxData
    ? dataCurta(maxData)
    : `${dataCurta(minData)} a ${dataCurta(maxData)}`
  const pregao = minData === maxData ? `Pregão de ${dataTexto}` : `Pregões de ${dataTexto}`
  return {
    id: 'fiis',
    nome: 'FIIs ordenados por DY (12m)',
    titulo: 'FIIs ordenados por DY (12m)',
    linha: 'Dividend yield de 12 meses sobre a cotação, do maior para o menor.',
    descricao: `Fundos imobiliários ordenados por dividend yield de 12 meses, com cotação e data de pregão. DY acima de 50% fica de fora, o mesmo corte do ranking. ${pregao}. ${AVISO}`,
    alt: `FIIs ordenados por DY de 12 meses, ${pregao.toLowerCase()}`,
    barras: top.map((t) => ({
      rotulo: t.ticker,
      preenchimento: clamp01(t.dy / max),
      valorTexto: pct2(t.dy * 100),
    })),
    fonte: `Fonte: avisos de proventos da B3 e Brapi (B3). ${pregao}.`,
    dataReferencia: maxData,
    dataTexto,
    temporalCoverage: minData === maxData ? maxData : `${minData}/${maxData}`,
    nota: 'DY de 12 meses do ranking de dividend yield, só fundo imobiliário com data de pregão. Ordenação pelo indicador. Não é recomendação.',
    pngPath: '/graficos/fiis.png',
    ancora: 'fiis',
  }
}

export function codigoEmbed(g: Grafico, altura: number): string {
  const src = `${GRAFICOS_EMBED_ORIGEM}${g.pngPath}`
  const href = `${GRAFICOS_EMBED_ORIGEM}${GRAFICOS_PATH}#${g.ancora}`
  const alt = g.alt.replace(/"/g, '')
  return `<img src="${src}" alt="${alt}" width="1200" height="${altura}">\n<a href="${href}">Gráfico: Redentia</a>`
}

export function datasetsJsonLd(origem: string, graficos: readonly Grafico[]): Record<string, unknown>[] {
  const site = origem.replace(/\/+$/, '')
  return graficos.map((g) => ({
    '@type': 'Dataset',
    name: g.nome,
    description: g.descricao,
    url: `${site}${GRAFICOS_PATH}#${g.ancora}`,
    creator: {
      '@type': 'Organization',
      name: 'Redentia',
      '@id': `${site}/#organization`,
    },
    usageInfo: 'uso livre com crédito',
    temporalCoverage: g.temporalCoverage,
    dateModified: g.dataReferencia,
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'image/png',
      contentUrl: `${site}${g.pngPath}`,
    },
    isAccessibleForFree: true,
  }))
}

export function dataModificada(graficos: readonly Grafico[]): string | null {
  const datas = graficos.map((g) => g.dataReferencia).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()
  return datas[datas.length - 1] ?? null
}

/**
 * Ações da B3 que pagam dividendos, e o recorte de muitos meses.
 *
 * O dividend yield é o do ranking de maiores dividend yields (fração, o mesmo
 * número de /ranking/maiores-dividend-yield na aba de ações). Os meses não
 * saem de count_12m: esse campo conta avisos, e um mês pode ter mais de um
 * (JCP e dividendo). Mês entra quando o histórico de GET /dividends/{T} tem
 * pagamento de renda naquele mês-calendário. Amortização fica de fora.
 *
 * A janela de 365 dias pode cruzar 13 meses-calendário. 10 ou mais não quer
 * dizer que o próximo mês terá pagamento.
 */
import { SETORES_BY_API } from '../content/setores.ts'
import { MONTHS_PT } from './format.ts'
import { nomeDaEmpresa } from './nomeB3.ts'
import { apiSlugDoSetor } from './paresDoSetor.ts'
import { isoMinusDays, parseProventos, type ProventoRow } from './proventos.ts'
import { symbolShape } from './tickerClass.ts'

export const ACOES_DIV_PATH = '/acoes-que-pagam-dividendos'
export const ACOES_DIV_MENSAIS_PATH = '/acoes-que-pagam-dividendos-mensais'
/** Atalho de busca. 301 para a URL canônica, para não duplicar a página. */
export const ACOES_DIV_MENSAIS_ATALHO = '/acoes-que-pagam-dividendos/mensais'

/** Meses-calendário distintos com pagamento de renda na janela. */
export const MESES_MENSAL = 10
/** Abaixo do corte mensal e neste piso: seção de alta frequência, separada. */
export const MESES_ALTA = 6
/** count_12m mínimo para ler o histórico fora do ranking. Menos avisos que meses não fecha. */
export const AVISOS_MINIMOS = MESES_ALTA
/** Nome próprio: JANELA_DIAS já é export da agenda e o auto-import não aceita repetido. */
export const JANELA_DIVIDENDOS_DIAS = 365
/** O mesmo 50% de app/utils/graficos.ts (DY_TETO). Não reexporta o nome. */
const DY_MAXIMO = 0.5
/** A API devolve no máximo 100. A tabela publica todas as que passam no critério. */
export const RANKING_LIMITE = 100

export type FaixaMeses = 'mensal' | 'alta' | 'baixa'
export type FaixaDy = 'acima-8' | 'de-4-a-8' | 'abaixo-4'

export interface FiltroAcoesDividendos {
  meses: 'todas' | FaixaMeses
  dy: 'todas' | FaixaDy
  setor: string
}

export const FILTRO_TUDO: FiltroAcoesDividendos = { meses: 'todas', dy: 'todas', setor: '' }

export interface RankingDividendoBruto {
  ticker?: string | null
  name?: string | null
  type?: string | null
  sector?: string | null
  market_price?: number | string | null
  dividend_yield?: number | string | null
  price_date?: string | null
}

export interface CadastroDividendoBruto {
  ticker?: string | null
  name?: string | null
  type?: string | null
  alias_of?: string | null
}

export interface PagadorDividendoBruto {
  ticker?: string | null
  type?: string | null
  count_12m?: number | null
}

export interface LinhaAcaoDividendo {
  pos: number
  ticker: string
  nome: string
  /** Fração, como a API manda. null = não está no recorte de DY. */
  dy: number | null
  dyTexto: string | null
  ultimoTexto: string | null
  ultimoIso: string | null
  meses: number
  mesesTexto: string
  faixaMeses: FaixaMeses
  setor: string | null
  pregao: string | null
  pregaoIso: string | null
}

export interface ResultadoAcoesDividendos {
  ok: boolean
  /** true quando o ranking, a lista de pagadores ou algum histórico não fechou. */
  incompleto: boolean
  hoje: string
  ranking: LinhaAcaoDividendo[]
  rankingTotal: number
  mensais: LinhaAcaoDividendo[]
  alta: LinhaAcaoDividendo[]
  fonte: string
  dataIso: string | null
}

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nfBrl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function num(v: number | string | null | undefined): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function isoDia(v: string | null | undefined): string | null {
  const d = typeof v === 'string' ? v.slice(0, 10) : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null
}

export function dataCurtaDividendo(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`
}

function quandoPregao(datas: string[]): string {
  const uniq = [...new Set(datas)].sort()
  if (!uniq.length) return ''
  const min = dataCurtaDividendo(uniq[0]!)
  const max = dataCurtaDividendo(uniq[uniq.length - 1]!)
  return min === max ? `Pregão de ${max}` : `Pregões de ${min} a ${max}`
}

export function dyPercent(fraction: number): number {
  return Math.round(fraction * 10000) / 100
}

export function textoDy(fraction: number): string {
  return `${nf2.format(dyPercent(fraction))}%`
}

export function faixaDeMeses(meses: number): FaixaMeses {
  if (meses >= MESES_MENSAL) return 'mensal'
  if (meses >= MESES_ALTA) return 'alta'
  return 'baixa'
}

export function faixaDeDy(fraction: number): FaixaDy {
  const p = dyPercent(fraction)
  if (p > 8) return 'acima-8'
  if (p >= 4) return 'de-4-a-8'
  return 'abaixo-4'
}

export function textoMeses(meses: number): string {
  return meses === 1 ? '1 mês' : `${meses} meses`
}

export function passaNoFiltro(linha: LinhaAcaoDividendo, filtro: FiltroAcoesDividendos): boolean {
  if (filtro.meses !== 'todas' && linha.faixaMeses !== filtro.meses) return false
  if (filtro.dy !== 'todas') {
    if (linha.dy == null || faixaDeDy(linha.dy) !== filtro.dy) return false
  }
  if (filtro.setor && linha.setor !== filtro.setor) return false
  return true
}

export interface LeituraProventos {
  meses: number
  mesesIso: string[]
  ultimoIso: string | null
  ultimoValor: number | null
  /** Renda com data-com (ou pagamento, se não houver data-com) dentro da janela. */
  temRendaNaJanela: boolean
}

/**
 * Meses com pagamento de renda e o último pagamento já ocorrido.
 * Pagamento futuro e parcela a definir não contam. Amortização não conta.
 */
export function leituraDeProventos(rows: readonly ProventoRow[], today: string): LeituraProventos {
  const corte = isoMinusDays(today, JANELA_DIVIDENDOS_DIAS)
  const meses = new Set<string>()
  let ultimoIso: string | null = null
  let ultimoValor = 0
  let temRendaNaJanela = false
  for (const row of rows) {
    if (!row.income) continue
    if (row.date >= corte && row.date <= today) temRendaNaJanela = true
    if (!row.payDate || row.payDate > today) continue
    if (row.payDate >= corte) meses.add(row.payDate.slice(0, 7))
    if (ultimoIso == null || row.payDate > ultimoIso) {
      ultimoIso = row.payDate
      ultimoValor = row.rate
    } else if (row.payDate === ultimoIso) {
      ultimoValor += row.rate
    }
  }
  const mesesIso = [...meses].sort()
  return {
    meses: mesesIso.length,
    mesesIso,
    ultimoIso,
    ultimoValor: ultimoIso ? ultimoValor : null,
    temRendaNaJanela,
  }
}

interface Cadastro {
  nome: string
  alias: boolean
}

function mapaCadastro(rows: readonly CadastroDividendoBruto[] | null): Map<string, Cadastro> | null {
  if (!rows) return null
  const mapa = new Map<string, Cadastro>()
  for (const row of rows) {
    const ticker = String(row.ticker ?? '').trim().toUpperCase()
    if (!ticker || symbolShape(ticker) !== 'b3') continue
    const alias = String(row.alias_of ?? '').trim().length > 0
    const nome = nomeDaEmpresa(String(row.name ?? ''))
    const anterior = mapa.get(ticker)
    if (!anterior || (anterior.alias && !alias)) mapa.set(ticker, { nome, alias })
  }
  return mapa
}

function setorDe(sector: string | null | undefined): string | null {
  const bruto = String(sector ?? '').trim()
  if (!bruto) return null
  const slug = apiSlugDoSetor(bruto)
  return (slug && SETORES_BY_API[slug]?.name) || bruto
}

function tickerLimpo(v: string | null | undefined): string {
  const ticker = String(v ?? '').trim().toUpperCase()
  return symbolShape(ticker) === 'b3' ? ticker : ''
}

interface BaseLinha {
  ticker: string
  nome: string
  dy: number | null
  setor: string | null
  pregaoIso: string | null
  leitura: LeituraProventos
}

function linhaDe(base: BaseLinha, pos: number): LinhaAcaoDividendo {
  const leitura = base.leitura
  return {
    pos,
    ticker: base.ticker,
    nome: base.nome || base.ticker,
    dy: base.dy,
    dyTexto: base.dy == null ? null : textoDy(base.dy),
    ultimoTexto: leitura.ultimoIso && leitura.ultimoValor != null
      ? `${dataCurtaDividendo(leitura.ultimoIso)} · ${nfBrl.format(leitura.ultimoValor)}`
      : null,
    ultimoIso: leitura.ultimoIso,
    meses: leitura.meses,
    mesesTexto: textoMeses(leitura.meses),
    faixaMeses: faixaDeMeses(leitura.meses),
    setor: base.setor,
    pregao: base.pregaoIso ? dataCurtaDividendo(base.pregaoIso) : null,
    pregaoIso: base.pregaoIso,
  }
}

function ordenarPorDy(a: BaseLinha, b: BaseLinha): number {
  const da = a.dy ?? -1
  const db = b.dy ?? -1
  return db - da || a.ticker.localeCompare(b.ticker)
}

function ordenarPorMeses(a: BaseLinha, b: BaseLinha): number {
  return b.leitura.meses - a.leitura.meses || ordenarPorDy(a, b)
}

function fonteDe(hoje: string, pregoes: string[]): string {
  const corte = dataCurtaDividendo(isoMinusDays(hoje, JANELA_DIVIDENDOS_DIAS))
  const ate = dataCurtaDividendo(hoje)
  const pregao = quandoPregao(pregoes)
  const meio = pregao ? `${pregao}. ` : ''
  return `Fonte: ranking de dividend yield de 12 meses (ações) e avisos de proventos da B3. ${meio}Janela de pagamento de ${corte} a ${ate}. Não é recomendação.`
}

export function resultadoVazio(hoje: string): ResultadoAcoesDividendos {
  return {
    ok: false,
    incompleto: true,
    hoje,
    ranking: [],
    rankingTotal: 0,
    mensais: [],
    alta: [],
    fonte: fonteDe(hoje, []),
    dataIso: null,
  }
}

function lerHistorico(
  historicos: Readonly<Record<string, readonly unknown[] | null | undefined>>,
  ticker: string,
): ProventoRow[] | null {
  if (!Object.prototype.hasOwnProperty.call(historicos, ticker)) return null
  const cru = historicos[ticker]
  if (cru == null) return null
  return parseProventos(cru)
}

/**
 * Quem precisa de histórico: a ação do ranking de DY e a ação com avisos
 * suficientes para poder chegar a 6 meses. O histórico é que confirma.
 */
export function tickersParaHistorico(input: {
  ranking: readonly RankingDividendoBruto[] | null
  pagadores: readonly PagadorDividendoBruto[] | null
  cadastro: readonly CadastroDividendoBruto[] | null
}): string[] {
  const cadastro = mapaCadastro(input.cadastro)
  const vistos = new Set<string>()
  const saida: string[] = []
  function entra(ticker: string) {
    if (!ticker || vistos.has(ticker)) return
    if (cadastro) {
      const c = cadastro.get(ticker)
      if (!c || c.alias) return
    }
    vistos.add(ticker)
    saida.push(ticker)
  }
  for (const row of input.ranking ?? []) {
    if (String(row.type ?? '').toUpperCase() !== 'STOCK') continue
    entra(tickerLimpo(row.ticker))
  }
  for (const row of input.pagadores ?? []) {
    if (String(row.type ?? '').toUpperCase() !== 'STOCK') continue
    const n = num(row.count_12m)
    if (n == null || n < AVISOS_MINIMOS) continue
    entra(tickerLimpo(row.ticker))
  }
  saida.sort()
  return saida
}

export function montarAcoesDividendos(input: {
  ranking: readonly RankingDividendoBruto[] | null
  pagadores: readonly PagadorDividendoBruto[] | null
  cadastro: readonly CadastroDividendoBruto[] | null
  historicos: Readonly<Record<string, readonly unknown[] | null | undefined>>
  today: string
}): ResultadoAcoesDividendos {
  const hoje = input.today
  if (!input.ranking) return resultadoVazio(hoje)
  const cadastro = mapaCadastro(input.cadastro)
  const rankingPorTicker = new Map<string, RankingDividendoBruto>()
  for (const row of input.ranking) {
    if (String(row.type ?? '').toUpperCase() !== 'STOCK') continue
    const ticker = tickerLimpo(row.ticker)
    if (!ticker || rankingPorTicker.has(ticker)) continue
    rankingPorTicker.set(ticker, row)
  }

  const falhos = new Set<string>()
  const doRanking: BaseLinha[] = []
  for (const [ticker, row] of rankingPorTicker) {
    if (cadastro) {
      const c = cadastro.get(ticker)
      if (!c || c.alias) continue
    }
    const dy = num(row.dividend_yield)
    const preco = num(row.market_price)
    const pregaoIso = isoDia(row.price_date)
    if (dy == null || dy <= 0 || dy > DY_MAXIMO) continue
    if (preco == null || preco <= 0 || !pregaoIso) continue
    const rows = lerHistorico(input.historicos, ticker)
    if (!rows) {
      falhos.add(ticker)
      continue
    }
    const leitura = leituraDeProventos(rows, hoje)
    if (!leitura.temRendaNaJanela) continue
    const nomeCadastro = cadastro?.get(ticker)?.nome
    doRanking.push({
      ticker,
      nome: nomeCadastro || nomeDaEmpresa(String(row.name ?? '')) || ticker,
      dy,
      setor: setorDe(row.sector),
      pregaoIso,
      leitura,
    })
  }
  doRanking.sort(ordenarPorDy)

  // Quem já está no ranking e o histórico mostrou meses suficientes entra
  // mesmo que count_12m não tenha apontado. O mês é o do pagamento.
  const frequencia = new Map<string, BaseLinha>()
  for (const base of doRanking) {
    if (base.leitura.meses >= MESES_ALTA) frequencia.set(base.ticker, base)
  }
  if (input.pagadores) {
    for (const row of input.pagadores) {
      if (String(row.type ?? '').toUpperCase() !== 'STOCK') continue
      const n = num(row.count_12m)
      if (n == null || n < AVISOS_MINIMOS) continue
      const ticker = tickerLimpo(row.ticker)
      if (!ticker || frequencia.has(ticker)) continue
      if (cadastro) {
        const c = cadastro.get(ticker)
        if (!c || c.alias) continue
      }
      const rows = lerHistorico(input.historicos, ticker)
      if (!rows) {
        falhos.add(ticker)
        continue
      }
      const leitura = leituraDeProventos(rows, hoje)
      if (leitura.meses < MESES_ALTA) continue
      const doRank = rankingPorTicker.get(ticker)
      const dyRank = num(doRank?.dividend_yield)
      const dy = dyRank != null && dyRank > 0 && dyRank <= DY_MAXIMO ? dyRank : null
      const nomeCadastro = cadastro?.get(ticker)?.nome
      frequencia.set(ticker, {
        ticker,
        nome: nomeCadastro || nomeDaEmpresa(String(doRank?.name ?? '')) || ticker,
        dy,
        setor: setorDe(doRank?.sector),
        pregaoIso: isoDia(doRank?.price_date),
        leitura,
      })
    }
  }

  const mensaisBase = [...frequencia.values()].filter((b) => b.leitura.meses >= MESES_MENSAL).sort(ordenarPorMeses)
  const altaBase = [...frequencia.values()]
    .filter((b) => b.leitura.meses >= MESES_ALTA && b.leitura.meses < MESES_MENSAL)
    .sort(ordenarPorMeses)

  const publicados = doRanking.slice(0, RANKING_LIMITE)
  const pregoes = publicados.map((b) => b.pregaoIso).filter((d): d is string => !!d)
  const dataIso = [...pregoes].sort().at(-1) ?? null
  return {
    ok: true,
    incompleto: input.pagadores == null || falhos.size > 0,
    hoje,
    ranking: publicados.map((b, i) => linhaDe(b, i + 1)),
    rankingTotal: doRanking.length,
    mensais: mensaisBase.map((b, i) => linhaDe(b, i + 1)),
    alta: altaBase.map((b, i) => linhaDe(b, i + 1)),
    fonte: fonteDe(hoje, pregoes),
    dataIso,
  }
}

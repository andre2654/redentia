/**
 * A rentabilidade da carteira no gráfico (07/11/2026). O "Você +51%" do topo
 * era a variação do PATRIMÔNIO no período, com os aportes dentro, e brigava
 * com a TWR de ~20% do relatório. Daqui em diante:
 *  - "Você" é a rentabilidade (TWR) do período: a `series.carteira` do
 *    GET /me/carteira/relatorio (um índice, base 100 no primeiro pregão),
 *    cortada no mesmo dia em que o gráfico começa, e TWR = v_fim / v_ini − 1;
 *  - o crescimento do patrimônio vira uma meta discreta ao lado ("o patrimônio
 *    cresceu 51% com os aportes"), com a mesma conta de antes;
 *  - sem o relatório (carregando ou com erro), a legenda diz "Patrimônio +X%
 *    (com aportes)", nunca "Você".
 * Puras, com teste (tests/carteira-rentabilidade.test.ts).
 */
import type { SeriesPoint } from '../types/acao'
import type { PontoRelatorio } from '../types/carteiraRelatorio'

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
// o formato da legenda do gráfico (pctAtivo e dataDoPonto, de utils/ativoDirecoes,
// repetidos aqui para o teste importar este arquivo sozinho)
/** '+18,47%' · '−2,10%' sai '-2,10%', como a legenda de sempre */
const pctAtivo = (n: number) => `${n > 0 ? '+' : ''}${nf2.format(n)}%`
/** '2025-05-14' → '14/05/25' */
const dataDoPonto = (iso: string) => (/^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}` : iso)
const DIA = 86_400_000
/** a série que começa até uma semana depois do início pedido ainda cobre o período (feriado, fim de semana, o primeiro pregão) */
const FOLGA_DIAS = 7

/** os pontos a partir do dia `desde` (ISO, inclusive): o mesmo corte da fatia do gráfico */
export function serieDesde<T extends { t: string }>(serie: T[], desde: string): T[] {
  const d = desde.slice(0, 10)
  return serie.filter((p) => p.t.slice(0, 10) >= d)
}

/** a variação de um índice no trecho, em %: v_fim / v_ini − 1. null sem dois pontos ou com a base zerada */
export function variacaoDoIndice(serie: { v: number }[]): number | null {
  if (serie.length < 2) return null
  const a = serie[0]!.v
  const z = serie[serie.length - 1]!.v
  if (!(a > 0) || !Number.isFinite(z)) return null
  return (z / a - 1) * 100
}

/** o índice refeito com base 100 no primeiro ponto (as duas linhas do desempenho saem do mesmo lugar) */
export function rebase100(serie: PontoRelatorio[]): PontoRelatorio[] {
  const a = serie[0]?.v
  if (!a || !(a > 0)) return []
  return serie.map((p) => ({ t: p.t, v: (p.v / a) * 100 }))
}

export interface RentabilidadeDoPeriodo {
  /** a TWR do período, em % */
  pct: number
  /** o primeiro pregão da conta (ISO) */
  inicio: string
  /** quando a série do relatório começa bem depois do início do período (o 5A, com o relatório desde maio/2025): o dia em que ela começa, para a legenda dizer "desde" */
  desde: string | null
}

/** a TWR da `series.carteira` do relatório cortada no início do período do gráfico (`desde`, ISO) */
export function rentabilidadeNoPeriodo(serie: PontoRelatorio[], desde: string): RentabilidadeDoPeriodo | null {
  const s = serieDesde(serie, desde)
  const pct = variacaoDoIndice(s)
  if (pct == null) return null
  const inicio = s[0]!.t.slice(0, 10)
  const atraso = (Date.parse(inicio) - Date.parse(desde.slice(0, 10))) / DIA
  return { pct, inicio, desde: atraso > FOLGA_DIAS ? inicio : null }
}

/** a meta ao lado da TWR: 'o patrimônio cresceu 51,34% com os aportes' (a conta de antes, com o nome certo) */
export function metaDoPatrimonio(pct: number): string {
  if (Math.abs(pct) < 0.005) return 'o patrimônio ficou parado, contando os aportes'
  const v = nf2.format(Math.abs(pct))
  return pct > 0 ? `o patrimônio cresceu ${v}% com os aportes` : `o patrimônio caiu ${v}%, contando aportes e retiradas`
}

export interface ItemDaLegenda {
  rotulo: 'Você' | 'Patrimônio' | 'IBOV'
  pct: string
  dir: 'up' | 'down' | null
  /** o traço do gráfico que o número descreve: a linha cheia (o patrimônio), a tracejada (o IBOV) ou nenhum (a TWR não é desenhada no topo) */
  traco: 'linha' | 'tracejado' | null
  /** ao lado, discreto: '(com aportes)', 'desde 14/05/25' */
  nota: string | null
}

export interface LegendaDoTopo {
  itens: ItemDaLegenda[]
  /** com a TWR na legenda: o crescimento do patrimônio, que é a linha desenhada */
  meta: string | null
}

/**
 * A legenda do gráfico do topo da /carteira. `patrimonio` é a fatia da curva
 * que o gráfico desenha; `twr`, a rentabilidade do mesmo período (null sem o
 * relatório). `notaSemTwr` é a meta do "Patrimônio" quando não há TWR: a tela
 * nova diz '(com aportes)'; a antiga, que não lê o relatório, 'com aportes'.
 */
export function legendaDoTopo(patrimonio: SeriesPoint[], ibov: SeriesPoint[], twr: RentabilidadeDoPeriodo | null, notaSemTwr = '(com aportes)'): LegendaDoTopo {
  const itens: ItemDaLegenda[] = []
  const p = variacaoDoIndice(patrimonio)
  if (twr) itens.push({ rotulo: 'Você', pct: pctAtivo(twr.pct), dir: twr.pct < 0 ? 'down' : 'up', traco: null, nota: twr.desde ? `desde ${dataDoPonto(twr.desde)}` : null })
  else if (p != null) itens.push({ rotulo: 'Patrimônio', pct: pctAtivo(p), dir: p < 0 ? 'down' : 'up', traco: 'linha', nota: notaSemTwr })
  const i = variacaoDoIndice(ibov)
  if (i != null) itens.push({ rotulo: 'IBOV', pct: pctAtivo(i), dir: null, traco: 'tracejado', nota: null })
  return { itens, meta: twr && p != null ? metaDoPatrimonio(p) : null }
}

/* ————— o desempenho do relatório: a TWR contra o benchmark, por período ————— */

export type PeriodoDesempenho = '1mo' | '6mo' | '12mo' | 'tudo'
const MESES: Record<Exclude<PeriodoDesempenho, 'tudo'>, number> = { '1mo': 1, '6mo': 6, '12mo': 12 }

/** o dia em que o período de N meses começa (a mesma conta do corte do gráfico do topo) */
export function dataDoCorte(meses: number, hoje: Date = new Date()): string {
  const d = new Date(hoje)
  d.setMonth(d.getMonth() - meses)
  return d.toISOString().slice(0, 10)
}

/** os períodos que a série cobre: um só entra se mostra mais que o anterior; "Tudo" quando ela vai bem além de 12 meses */
export function periodosDoDesempenho(serie: { t: string }[], hoje: Date = new Date()): PeriodoDesempenho[] {
  const ini = serie[0]?.t.slice(0, 10)
  if (!ini || serie.length < 2) return []
  const o: PeriodoDesempenho[] = ['1mo']
  if (ini < dataDoCorte(1, hoje)) o.push('6mo')
  if (ini < dataDoCorte(6, hoje)) o.push('12mo')
  if (Date.parse(dataDoCorte(12, hoje)) - Date.parse(ini) > 30 * DIA) o.push('tudo')
  return o
}

/** o primeiro dia do período ('tudo' = o primeiro ponto da série) */
export function inicioDoPeriodo(p: PeriodoDesempenho, serie: { t: string }[], hoje: Date = new Date()): string {
  if (p === 'tudo') return serie[0]?.t.slice(0, 10) ?? dataDoCorte(12, hoje)
  return dataDoCorte(MESES[p], hoje)
}

const NO_PERIODO: Record<Exclude<PeriodoDesempenho, 'tudo'>, string> = { '1mo': 'em 1 mês', '6mo': 'em 6 meses', '12mo': 'em 12 meses' }

/** 'Sua carteira em 12 meses.' · 'Sua carteira desde 14/05/25.' (o "Tudo", ou a série mais curta que o período) */
export function tituloDoDesempenho(p: PeriodoDesempenho, pedido: string, inicio: string | null): string {
  if (inicio && (p === 'tudo' || (Date.parse(inicio) - Date.parse(pedido)) / DIA > 20)) return `Sua carteira desde ${dataDoPonto(inicio)}.`
  return `Sua carteira ${NO_PERIODO[p as Exclude<PeriodoDesempenho, 'tudo'>] ?? 'no período'}.`
}

export interface ItemDoDesempenho {
  chave: 'carteira' | 'benchmark' | 'cdi' | 'ibov'
  rotulo: string
  pct: string
  dir: 'up' | 'down' | null
  /** só a carteira e o benchmark são desenhados */
  traco: 'linha' | 'tracejado' | null
}

/** a legenda do desempenho: a TWR da carteira, o benchmark composto, o CDI e o IBOV puros, todos a partir do mesmo dia */
export function legendaDoDesempenho(series: { carteira: PontoRelatorio[]; benchmark: PontoRelatorio[]; cdi: PontoRelatorio[]; ibov: PontoRelatorio[] }, desde: string): ItemDoDesempenho[] {
  const linhas: [ItemDoDesempenho['chave'], string, PontoRelatorio[], ItemDoDesempenho['traco']][] = [
    ['carteira', 'Você', series.carteira, 'linha'],
    ['benchmark', 'Benchmark', series.benchmark, 'tracejado'],
    ['cdi', 'CDI', series.cdi, null],
    ['ibov', 'IBOV', series.ibov, null],
  ]
  const out: ItemDoDesempenho[] = []
  for (const [chave, rotulo, s, traco] of linhas) {
    const v = variacaoDoIndice(serieDesde(s, desde))
    if (v == null) continue
    out.push({ chave, rotulo, pct: pctAtivo(v), dir: chave === 'carteira' ? (v < 0 ? 'down' : 'up') : null, traco })
  }
  return out
}

/* ————— "Estou indo bem?" (10/11/2026, o dono: a carteira "estilo Nubank") —————
   A resposta na unidade que o brasileiro já usa: o % do CDI. A carteira, o CDI
   e o benchmark composto (o mesmo mix de classes) saem das três séries do
   relatório, cortadas no mesmo dia em que o gráfico começa. O % do CDI só vale
   com os dois positivos: com a carteira negativa, "−40% do CDI" não diz nada,
   e a frase vira "rendeu −2,10%, e o CDI, 5,00%". */

export interface ContraOCdi {
  /** '130% do CDI', ou null quando a razão não faz sentido (carteira ≤ 0 ou CDI ≈ 0) */
  destaque: string | null
  /** 'Em 12 meses, rendeu 130% do CDI: 17,71% contra 13,65%.' */
  frase: string
  /** 'Ficou acima do CDI em 8 de 12 meses. O mesmo mix de classes rendeu 19,20%.' (pode vir vazia) */
  detalhe: string
  carteira: number
  cdi: number
  mix: number | null
  acima: { meses: number; de: number } | null
}

const pct2 = (n: number) => `${nf2.format(n).replace('-', '−')}%`

/** o último ponto de cada mês ('2025-05' → ponto), na ordem */
function fimDosMeses(serie: PontoRelatorio[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const p of serie) m.set(p.t.slice(0, 7), p.v)
  return m
}

/**
 * Em quantos meses inteiros a carteira rendeu mais que o CDI no trecho. O mês
 * do início e o mês corrente (sem fechar) não contam: só os meses com um fim
 * de mês antes e depois. null com menos de 2 meses.
 */
export function mesesAcimaDoCdi(carteira: PontoRelatorio[], cdi: PontoRelatorio[]): { meses: number; de: number } | null {
  const a = fimDosMeses(carteira)
  const b = fimDosMeses(cdi)
  const chaves = [...a.keys()].filter((k) => b.has(k))
  // o último mês da série pode estar aberto: só conta se o próximo existir, então cortamos o último
  const fechados = chaves.slice(0, -1)
  if (fechados.length < 3) return null
  let meses = 0
  let de = 0
  for (let i = 1; i < fechados.length; i++) {
    const k0 = fechados[i - 1]!
    const k1 = fechados[i]!
    const rc = a.get(k1)! / a.get(k0)! - 1
    const rd = b.get(k1)! / b.get(k0)! - 1
    de++
    if (rc > rd) meses++
  }
  return de >= 2 ? { meses, de } : null
}

/** a frase do "estou indo bem?": carteira, CDI e mix no mesmo trecho; null sem as séries */
export function contraOCdi(
  series: { carteira: PontoRelatorio[]; cdi: PontoRelatorio[]; benchmark?: PontoRelatorio[] },
  desde: string,
  noPeriodo: string,
): ContraOCdi | null {
  const c = rentabilidadeNoPeriodo(series.carteira, desde)
  const d = rentabilidadeNoPeriodo(series.cdi, desde)
  if (!c || !d) return null
  const m = series.benchmark ? rentabilidadeNoPeriodo(series.benchmark, desde) : null
  // a série do relatório começa depois do período pedido (o 5A): a frase diz desde quando
  const quando = c.desde ? `Desde ${dataDoPonto(c.desde)}` : noPeriodo.charAt(0).toUpperCase() + noPeriodo.slice(1)
  const razao = c.pct > 0 && d.pct > 0.05 ? Math.round((c.pct / d.pct) * 100) : null
  const destaque = razao == null ? null : `${razao}% do CDI`
  const frase = destaque
    ? `${quando}, rendeu ${destaque}: ${pct2(c.pct)} contra ${pct2(d.pct)}.`
    : `${quando}, a carteira rendeu ${pct2(c.pct)}, e o CDI, ${pct2(d.pct)}.`
  const acima = mesesAcimaDoCdi(serieDesde(series.carteira, desde), serieDesde(series.cdi, desde))
  const partes: string[] = []
  if (acima) partes.push(`Ficou acima do CDI em ${acima.meses} de ${acima.de} meses.`)
  if (m) partes.push(`O mesmo mix de classes rendeu ${pct2(m.pct)}.`)
  return { destaque, frase, detalhe: partes.join(' '), carteira: c.pct, cdi: d.pct, mix: m?.pct ?? null, acima }
}

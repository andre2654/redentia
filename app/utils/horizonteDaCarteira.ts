/**
 * O horizonte da carteira (13/11/2026; o dono, com o esboço do app na mão: "nos
 * gráficos da carteira tem já conectada a previsão da carteira, daí se eu dar
 * drag vai dando zoom à medida que vou indo para a direita, traga isso para o
 * site também"). O gráfico da rentabilidade do topo da /carteira ganha, à
 * direita de hoje, o leque do motor (os 2.000 caminhos, GET /me/carteira/futuro),
 * e levar o ponteiro ou o dedo para a direita afasta o fim da janela até o
 * horizonte inteiro (5 anos).
 *
 * UM EIXO SÓ, e de verdade. O tempo é linear do começo do período ao fim da
 * janela: em repouso o passado ocupa 70% da largura e o futuro aparece na mesma
 * escala (12 meses de passado, uns 5 de futuro); no fim do arrasto a janela vai
 * até o horizonte e o passado encolhe para o que ele vale nessa escala (12
 * meses em 72). O valor é o índice do próprio gráfico (base 100 no começo do
 * período): o futuro continua de onde a linha chegou, na proporção em que o
 * motor faz o patrimônio de hoje crescer (ou cair) em cada caminho. O domínio
 * vertical é o do que está à vista, então o passado achata quando o leque
 * abre: é o tamanho que 12 meses têm perto de 5 anos.
 *
 * O motor conta em poder de compra de hoje; o passado é a rentabilidade
 * nominal. A tela diz isso ao lado do número do futuro.
 */
import type { FuturoPontoApi } from '~/types/assinatura'

/** quanto da largura o passado ocupa em repouso */
export const PASSADO_EM_REPOUSO = 0.7
/** um mês médio, em ms */
export const MES_EM_MS = 30.4375 * 86_400_000
/** o domínio do leque entra junto com o começo do arrasto: até aqui do zoom ele já cabe inteiro */
export const LEQUE_CABE_EM = 0.22
/** a folga em cima e embaixo do leque, em fração do que ele ocupa */
const FOLGA_DO_LEQUE = 0.06

const entre = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const mistura = (a: number, b: number, t: number) => a + (b - a) * t
const suave = (t: number) => { const x = entre(t); return x * x * (3 - 2 * x) }

/** Os meses entre o primeiro e o último ponto da linha do passado. */
export function mesesDoPassado(linha: { t: string }[]): number {
  if (linha.length < 2) return 0
  const ms = Date.parse(linha[linha.length - 1]!.t) - Date.parse(linha[0]!.t)
  return Number.isFinite(ms) && ms > 0 ? ms / MES_EM_MS : 0
}

/**
 * Quantos meses de futuro estão à vista com o zoom z (0 em repouso, 1 no fim
 * do arrasto). Em repouso, a mesma escala do passado: o que cabe nos 30% que
 * sobram. Daí ao horizonte, em progressão geométrica (cada pedaço do arrasto
 * multiplica o futuro à vista pelo mesmo tanto, e o zoom anda parelho).
 */
export function futuroAVista(z: number, passado: number, horizonte: number, repouso = PASSADO_EM_REPOUSO): number {
  if (!(passado > 0) || !(horizonte > 0)) return 0
  const f0 = Math.min(horizonte, (passado * (1 - repouso)) / repouso)
  return f0 * (horizonte / f0) ** entre(z)
}

/** Onde fica "hoje" na largura do desenho (0 a 1): o passado sobre a janela inteira. */
export function ondeFicaHoje(z: number, passado: number, horizonte: number, repouso = PASSADO_EM_REPOUSO): number {
  const f = futuroAVista(z, passado, horizonte, repouso)
  return passado > 0 ? passado / (passado + f) : 1
}

/**
 * O zoom que o ponteiro pede: nada enquanto ele está sobre o passado (até o
 * "hoje" de repouso); dali até a beira direita, de 0 a 1.
 */
export function zoomDoPonteiro(u: number, repouso = PASSADO_EM_REPOUSO): number {
  return entre((u - repouso) / (1 - repouso))
}

/** O mês do futuro sob o ponteiro (u de 0 a 1 na largura), com o zoom z; null sobre o passado. */
export function mesSobOPonteiro(u: number, z: number, passado: number, horizonte: number, repouso = PASSADO_EM_REPOUSO): number | null {
  const f = futuroAVista(z, passado, horizonte, repouso)
  const hoje = ondeFicaHoje(z, passado, horizonte, repouso)
  // em cima de hoje ainda é o passado (a folga cobre o arredondamento da conta)
  if (!(f > 0) || u <= hoje + 1e-9) return null
  return Math.min(horizonte, ((u - hoje) / (1 - hoje)) * f)
}

/** Onde um mês do futuro cai na largura (0 a 1) com o zoom z; pode passar de 1 (fora da janela). */
export function ondeFicaOMes(mes: number, z: number, passado: number, horizonte: number, repouso = PASSADO_EM_REPOUSO): number {
  const f = futuroAVista(z, passado, horizonte, repouso)
  return passado + f > 0 ? (passado + mes) / (passado + f) : 1
}

export interface QuantisDoMes { p10: number; p25: number; p50: number; p75: number; p90: number }
const QUANTIS = ['p10', 'p25', 'p50', 'p75', 'p90'] as const

/** Os quantis do motor num mês que pode ser fracionário, por interpolação linear entre os meses vizinhos. */
export function quantisNoMes(serie: FuturoPontoApi[], mes: number): QuantisDoMes | null {
  if (!serie.length) return null
  const m = entre(mes, 0, serie.length - 1)
  const a = serie[Math.floor(m)]!
  const b = serie[Math.ceil(m)]!
  const t = m - Math.floor(m)
  const out = {} as QuantisDoMes
  for (const q of QUANTIS) out[q] = mistura(a[q], b[q], t)
  return out
}

/** O maior p90 e o menor p10 do leque do mês 0 até o mês `ate` (fracionário), e o maior p50. */
export function extremosDoLeque(serie: FuturoPontoApi[], ate: number): { p10: number; p50: number; p90: number } | null {
  const fim = quantisNoMes(serie, ate)
  if (!fim) return null
  let p10 = fim.p10
  let p50 = fim.p50
  let p90 = fim.p90
  const inteiros = Math.min(serie.length - 1, Math.floor(entre(ate, 0, serie.length - 1)))
  for (let i = 0; i <= inteiros; i++) {
    p10 = Math.min(p10, serie[i]!.p10)
    p50 = Math.max(p50, serie[i]!.p50)
    p90 = Math.max(p90, serie[i]!.p90)
  }
  return { p10, p50, p90 }
}

/**
 * O domínio vertical à vista, no índice do gráfico do passado. Em repouso é o
 * do passado, esticado em cima só o bastante para a linha do mais provável não
 * sair pelo teto antes do fim da janela; quando o arrasto começa, entra o leque
 * inteiro do trecho à vista (de 8 em cada 10 caminhos), com folga.
 * `hojeIndice` é onde a linha do passado chegou; `base` é de onde o leque parte
 * em reais (o valor do mês 0): o leque entra na proporção valor / base.
 */
export function dominioDoHorizonte(
  passado: { lo: number; hi: number }, serie: FuturoPontoApi[], hojeIndice: number, base: number, mesesAVista: number, z: number,
): { lo: number; hi: number } {
  const ex = extremosDoLeque(serie, mesesAVista)
  if (!ex || !(base > 0) || !(hojeIndice > 0)) return passado
  const emIndice = (v: number) => (hojeIndice * v) / base
  const altura = Math.max(emIndice(ex.p90) - emIndice(ex.p10), 1e-9)
  const folga = altura * FOLGA_DO_LEQUE
  const s = suave(z / LEQUE_CABE_EM)
  const hiRepouso = Math.max(passado.hi, emIndice(ex.p50) + (passado.hi - passado.lo) * 0.04)
  return {
    lo: mistura(passado.lo, Math.min(passado.lo, emIndice(ex.p10) - folga), s),
    hi: mistura(hiRepouso, Math.max(passado.hi, emIndice(ex.p90) + folga), s),
  }
}

/** A caixa (topo e altura, em fração da altura do desenho) de quem tem o domínio [lo, hi] dentro do domínio à vista. */
export function caixaNoDominio(dele: { lo: number; hi: number }, aVista: { lo: number; hi: number }): { topo: number; altura: number } {
  const span = aVista.hi - aVista.lo
  if (!(span > 0)) return { topo: 0, altura: 1 }
  return { topo: (aVista.hi - dele.hi) / span, altura: (dele.hi - dele.lo) / span }
}

/** 'em 5 meses', 'em 1 ano', 'em 1 ano e 6 meses', 'em 5 anos'. */
export function daquiAQuanto(meses: number): string {
  const m = Math.max(1, Math.round(meses))
  const anos = Math.floor(m / 12)
  const resto = m % 12
  const a = anos ? `${anos} ${anos === 1 ? 'ano' : 'anos'}` : ''
  const r = resto ? `${resto} ${resto === 1 ? 'mês' : 'meses'}` : ''
  return `em ${[a, r].filter(Boolean).join(' e ')}`
}

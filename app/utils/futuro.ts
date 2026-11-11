/**
 * "Daqui a 5 anos": o leque do motor de cenários sobre a carteira da pessoa,
 * em dinheiro de hoje (GET /me/carteira/futuro). O desenho do Agora dos apps
 * (canvas V5MBL5Q3, IPhoneAgoraV2 · Detalhes e MacAgoraFerramentas), no
 * contrato do Backend de 31/10/2026:
 *  - `series` é MENSAL (61 pontos, mês 0 a 60; `year` decimal) com p10–p90;
 *  - `paths_data` traz os 2.000 caminhos do motor (`paths_encoding`
 *    "permil-delta", ver caminhosDoLeque), ordenados pelo valor final. São
 *    eles que o leque desenha, um a um, em canvas (CarteiraLequeCaminhos);
 *  - sem `paths_data` (resposta antiga ou que não fecha), o leque cai nas
 *    faixas (80% e 50%) e nas linhas de cada quantil (CarteiraLeque, SVG) —
 *    nada de caminho inventado. `sample_paths` (UM caminho, o mais perto do
 *    meio) segue no contrato, mas a linha acesa do meio agora é o p50;
 *  - `today_value` é a carteira inteira; a série e os finais partem de
 *    `covered_value` (a parte que o motor simula). O que ficou de fora é dito.
 *
 * Aqui mora só conta: o texto formatado, os caminhos decodificados e a
 * geometria. Todo número sai da resposta da API. Os testes importam direto
 * (sem import de valor).
 */
import type { FuturoDadosApi, FuturoPontoApi } from '~/types/assinatura'

const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** 'R$ 61,5 mil', 'R$ 1,2 milhão', 'R$ 950'. Mil com uma casa, como no Agora. */
export function brlDoLeque(v: number): string {
  const a = Math.abs(v)
  const s = v < 0 ? '−' : ''
  if (a >= 1_000_000) {
    const m = a / 1_000_000
    return `${s}R$ ${nf1.format(m)} ${m < 2 ? 'milhão' : 'milhões'}`
  }
  if (a >= 1000) return `${s}R$ ${nf1.format(a / 1000)} mil`
  return `${s}R$ ${nf0.format(a)}`
}

/**
 * O motivo de um papel ficar fora da simulação, em palavras. O Backend manda
 * `reason` por papel (cripto, fundo sem registro, COE, renda fixa sem
 * indexador ou taxa); código desconhecido sai como veio, sem sublinhado.
 */
export function motivoDeFora(reason: string | null | undefined): string {
  const r = (reason ?? '').toLowerCase()
  if (!r) return ''
  if (/cript|crypto/.test(r)) return 'cripto'
  if (/\bcoe\b/.test(r)) return 'COE'
  if (/fund|fundo/.test(r)) return 'fundo sem registro na CVM'
  if (/index|taxa|rate|renda_fixa|renda fixa|fixed/.test(r)) return 'renda fixa sem indexador'
  return r.replace(/_/g, ' ')
}

/** "BTC (cripto), COE XP (COE) e mais 2". */
export function listaDeFora(excluded: { ticker: string; reason: string }[] | null | undefined): string | null {
  const fora = (excluded ?? []).filter((x) => x?.ticker)
  if (!fora.length) return null
  const itens = fora.slice(0, 4).map((x) => {
    const m = motivoDeFora(x.reason)
    return m ? `${x.ticker} (${m})` : x.ticker
  })
  const resto = fora.length > 4 ? ` e mais ${fora.length - 4}` : ''
  const corpo = itens.length > 1 && !resto ? `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}` : itens.join(', ')
  return `${corpo}${resto}`
}

export interface FuturoVM {
  /** 'Entre R$ 63,5 mil e R$ 147,2 mil.' */
  frase: string
  /** 'Analisamos 2.000 cenários possíveis.' */
  cenarios: string
  /** o ponto de partida do leque (a parte simulada da carteira) */
  hoje: string
  /** o ano do fim do horizonte ('2031') */
  anoFinal: string
  /** os anos do meio, para o eixo ('2027', '2028'…) */
  anosDoMeio: string[]
  horizonte: number
  fins: { otimista: string; meio: string; pessimista: string }
  disclaimer: string
  /** 'A conta simula R$ 66,2 mil dos R$ 68,6 mil da carteira. Fica de fora: BTC (cripto).' */
  cobertura: string | null
}

/** O ano em que o horizonte termina, a partir do `as_of` ('2026-10-30' + 5 → '2031'). */
export function anoDoFim(asOf: string, horizonte: number): string {
  const ano = Number(String(asOf).slice(0, 4))
  return Number.isFinite(ano) && ano > 1900 ? String(ano + horizonte) : `${horizonte} anos`
}

function valido(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n)
}

function serieOrdenada(d: FuturoDadosApi): FuturoPontoApi[] {
  return [...d.series].sort((a, b) => a.year - b.year)
}

/** Resposta coerente para desenhar: fins e série com números finitos e em ordem. */
export function futuroDesenhavel(d: FuturoDadosApi | null | undefined): d is FuturoDadosApi {
  if (!d || !valido(d.today_value) || d.today_value <= 0) return false
  const { p10, p50, p90 } = d.end ?? ({} as FuturoDadosApi['end'])
  if (![p10, p50, p90].every(valido) || !(p10 <= p50 && p50 <= p90)) return false
  if (!Array.isArray(d.series) || d.series.length < 2) return false
  return d.series.every((s) => [s.year, s.p10, s.p25, s.p50, s.p75, s.p90].every(valido) && s.p10 <= s.p90)
}

/** Onde o leque começa: a parte simulada (covered_value), senão o ponto 0 da série. */
export function inicioDoLeque(d: FuturoDadosApi): number {
  if (valido(d.covered_value) && d.covered_value > 0) return d.covered_value
  return serieOrdenada(d)[0]!.p50
}

export function montarFuturo(d: FuturoDadosApi | null | undefined): FuturoVM | null {
  if (!futuroDesenhavel(d)) return null
  const serie = serieOrdenada(d)
  const horizonte = valido(d.horizon_years) && d.horizon_years > 0 ? d.horizon_years : Math.round(serie[serie.length - 1]!.year)
  const caminhos = valido(d.paths) && d.paths > 0 ? nf0.format(d.paths) : null
  const inicio = inicioDoLeque(d)

  let cobertura: string | null = null
  if (inicio < d.today_value * 0.995) {
    cobertura = `A conta simula ${brlDoLeque(inicio)} dos ${brlDoLeque(d.today_value)} da carteira.`
  }
  const fora = listaDeFora(d.excluded)
  if (fora) cobertura = `${cobertura ? `${cobertura} ` : ''}Fica de fora: ${fora}.`

  const anoBase = Number(String(d.as_of).slice(0, 4))
  const anosDoMeio = Number.isFinite(anoBase) && anoBase > 1900
    ? Array.from({ length: Math.max(horizonte - 1, 0) }, (_, i) => String(anoBase + i + 1))
    : []

  return {
    frase: `Entre ${brlDoLeque(d.end.p10)} e ${brlDoLeque(d.end.p90)}.`,
    cenarios: caminhos ? `Analisamos ${caminhos} cenários possíveis.` : 'Analisamos os cenários possíveis.',
    hoje: brlDoLeque(inicio),
    anoFinal: anoDoFim(d.as_of, horizonte),
    anosDoMeio,
    horizonte,
    fins: { otimista: brlDoLeque(d.end.p90), meio: brlDoLeque(d.end.p50), pessimista: brlDoLeque(d.end.p10) },
    disclaimer: d.disclaimer?.trim() || `Projeção estatística com ${caminhos ?? 'milhares de'} caminhos, não previsão nem recomendação.`,
    cobertura,
  }
}

/* ————— geometria ————— */

export interface CaixaDoLeque {
  /** largura e altura do viewBox */
  w: number
  h: number
  /** x onde o leque termina (o sino e os rótulos ficam à direita) */
  xFim: number
  /** largura máxima do sino dos finais, a partir de xFim */
  sino: number
  /** respiro em cima e embaixo */
  pad: number
}

export interface DesenhoDoLeque {
  /** p10–p90 e p25–p75, fechadas */
  faixa80: string
  faixa50: string
  /** as bordas de cada quantil (o leque "em fios", sem caminho inventado) */
  linhas: { p90: string; p75: string; p25: string; p10: string }
  /** a linha acesa: o caminho real do motor, ou o p50 sem ele */
  meio: string
  /** o meio é o caminho real (true) ou a mediana (false) */
  meioReal: boolean
  sino: string
  y: { hoje: number; otimista: number; meio: number; pessimista: number; topo: number; base: number }
  xFim: number
  xHoje: number
  /** x de cada ano inteiro do meio (1..H-1), para as marcas do eixo */
  xAnos: number[]
}

type Pt = [number, number]

/** Curva suave por Catmull-Rom (até 40 pontos) ou polilinha (série mensal longa). */
export function curvaDoLeque(pts: Pt[]): string {
  if (!pts.length) return ''
  const f = (n: number) => Math.round(n * 10) / 10
  if (pts.length < 3 || pts.length > 40) return pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])},${f(p[1])}`).join('')
  let d = `M${f(pts[0]![0])},${f(pts[0]![1])}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[i + 2] ?? p2
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`
  }
  return d
}

/**
 * O desenho inteiro em coordenadas do viewBox. Escala vertical pela faixa de
 * 80% com folga; x pelo `year` decimal da série (mensal ou anual).
 */
export function desenharLeque(d: FuturoDadosApi, caixa: CaixaDoLeque): DesenhoDoLeque {
  const { h, xFim, pad } = caixa
  const xHoje = 10
  const serie = serieOrdenada(d)
  const anoMax = serie[serie.length - 1]!.year || 1
  const inicio = inicioDoLeque(d)

  const caminho = (d.sample_paths ?? []).find((c) => Array.isArray(c) && c.length >= 2 && c.every(valido)) ?? null

  const lo = Math.min(...serie.map((s) => s.p10), inicio, ...(caminho ?? []))
  const hi = Math.max(...serie.map((s) => s.p90), inicio, ...(caminho ?? []))
  const folga = (hi - lo) * 0.08 || hi * 0.1
  const yMin = Math.max(0, lo - folga)
  const yMax = hi + folga
  const yDe = (v: number) => pad + (1 - (v - yMin) / (yMax - yMin)) * (h - pad * 2)
  const xDe = (ano: number) => xHoje + (ano / anoMax) * (xFim - xHoje)

  const lado = (k: 'p10' | 'p25' | 'p50' | 'p75' | 'p90') => serie.map((s): Pt => [xDe(s.year), yDe(s[k])])
  const faixa = (a: 'p10' | 'p25', b: 'p90' | 'p75') => {
    const cima = curvaDoLeque(lado(b))
    const volta = curvaDoLeque(lado(a).reverse()).replace(/^M/, 'L')
    return `${cima}${volta}Z`
  }

  const meioPts: Pt[] = caminho
    ? caminho.map((v, i): Pt => [xDe((i * anoMax) / (caminho.length - 1)), yDe(v)])
    : lado('p50')

  // O sino dos finais na ponta, sem os caminhos: a densidade que os quantis do
  // motor (p10, p50, p90) desenham, de cima para baixo (ver sinoDosQuantis).
  const sino = caminhoDoSino(sinoDosQuantis(d.end, yMin, yMax), xFim + 2, Math.max(caixa.sino - 2, 0), yDe)

  return {
    faixa80: faixa('p10', 'p90'),
    faixa50: faixa('p25', 'p75'),
    linhas: {
      p90: curvaDoLeque(lado('p90')),
      p75: curvaDoLeque(lado('p75')),
      p25: curvaDoLeque(lado('p25')),
      p10: curvaDoLeque(lado('p10')),
    },
    meio: curvaDoLeque(meioPts),
    meioReal: !!caminho,
    sino,
    y: {
      hoje: yDe(inicio),
      otimista: yDe(d.end.p90),
      meio: yDe(d.end.p50),
      pessimista: yDe(d.end.p10),
      topo: yDe(d.end.p90),
      base: yDe(d.end.p10),
    },
    xFim,
    xHoje,
    xAnos: Array.from({ length: Math.max(Math.round(anoMax) - 1, 0) }, (_, i) => xDe(i + 1)),
  }
}

/**
 * O leque de EXEMPLO do /assinar e do paywall: a forma do que a pessoa recebe,
 * SEM número nenhum (o componente não mostra valor nem eixo em reais). Quantis
 * de uma log-normal genérica, mês a mês: liso e igual no SSR e no browser.
 */
export function lequeDeExemplo(horizonte = 5): FuturoDadosApi {
  const z = { p10: -1.2816, p25: -0.6745, p50: 0, p75: 0.6745, p90: 1.2816 }
  const meses = horizonte * 12
  const series: FuturoPontoApi[] = Array.from({ length: meses + 1 }, (_, m) => {
    const t = m / 12
    const q = (k: keyof typeof z) => Math.round(100 * Math.exp(0.075 * t + z[k] * (z[k] < 0 ? 0.15 : 0.14) * Math.sqrt(t)) * 100) / 100
    return { month: m, year: t, p10: q('p10'), p25: q('p25'), p50: q('p50'), p75: q('p75'), p90: q('p90') }
  })
  const fim = series[series.length - 1]!
  return {
    horizon_years: horizonte, paths: 2000, engine_version: 'exemplo', as_of: '',
    today_value: 100,
    end: { p10: fim.p10, p50: fim.p50, p90: fim.p90 },
    series, sample_paths: null, covered_value: 100, excluded: [], disclaimer: '',
  }
}

/**
 * Os caminhos do cartão de EXEMPLO (pedido do dono, 31/10/2026: o cartão do
 * /assinar se desenhando como a Simulação dos apps). Não são do motor nem de
 * carteira nenhuma: sorteados da MESMA log-normal do lequeDeExemplo (o mesmo
 * drift, o σ de baixo e o de cima), com uma semente fixa, então o SSR, o
 * browser e todo visitante veem as mesmas linhas. Ordenados pelo final, como
 * os do motor (índice = percentil), para o tomDoCaminho valer igual.
 */
export function caminhosDeExemplo(n = 2000, horizonte = 5, semente = 20261031): CaminhosDoLeque {
  let a = semente >>> 0
  // mulberry32: pequeno, rápido e igual em todo lugar
  const sorteio = () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const normal = () => Math.sqrt(-2 * Math.log(1 - sorteio())) * Math.cos(2 * Math.PI * sorteio())
  const meses = horizonte * 12
  const pontos = meses + 1
  const brutos: Float64Array[] = []
  for (let i = 0; i < n; i++) {
    const c = new Float64Array(pontos)
    let w = 0
    c[0] = 100
    for (let m = 1; m < pontos; m++) {
      w += normal() * Math.sqrt(1 / 12)
      c[m] = 100 * Math.exp(0.075 * (m / 12) + w * (w < 0 ? 0.15 : 0.14))
    }
    brutos.push(c)
  }
  brutos.sort((x, y) => x[meses]! - y[meses]!)
  const valores = new Float64Array(n * pontos)
  brutos.forEach((c, i) => valores.set(c, i * pontos))
  return { n, pontos, valores }
}

/**
 * Quando cada caminho do exemplo nasce, de 0 a 1 do tempo de nascer: a ordem é
 * um sorteio (não a do percentil) e o ritmo acelera, como na Simulação — um,
 * dois, cinco... e então centenas. Nascidos até f: n · f³.
 */
export function nascimentosDoExemplo(n: number, semente = 7): Float64Array {
  let a = semente >>> 0
  const sorteio = () => {
    a = (Math.imul(a ^ (a >>> 16), 0x45d9f3b) + 0x9E3779B9) >>> 0
    return a / 4294967296
  }
  const ordem = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(sorteio() * (i + 1))
    ;[ordem[i], ordem[j]] = [ordem[j]!, ordem[i]!]
  }
  const quando = new Float64Array(n)
  ordem.forEach((caminho, k) => { quando[caminho] = n > 1 ? Math.cbrt(k / (n - 1)) : 0 })
  return quando
}

/* ————— o sino dos finais ————— */

/** Um ponto do sino: o valor (eixo do leque) e a densidade, de 0 a 1 (1 = o pico). */
export type PontoDoSino = [valor: number, densidade: number]

const PASSOS_DO_SINO = 160

function normalizarSino(pts: PontoDoSino[]): PontoDoSino[] {
  const pico = Math.max(...pts.map((p) => p[1]))
  return pico > 0 ? pts.map(([v, d]) => [v, d / pico]) : pts.map(([v]) => [v, 0])
}

/**
 * O sino sem os caminhos: a densidade de duas metades log-normais presas nos
 * quantis do motor (o lado de cima com o σ do p90, o de baixo com o do p10),
 * contínua no p50. Amostrada de cima (hi) para baixo (lo): o contorno não se
 * cruza (o desenho antigo ia de baixo para cima depois de começar no alto e
 * saía como uma agulha dupla). A janela do leque sem caminhos vai só um
 * pouco além do p10–p90, onde a densidade ainda é alta: nos 12% de cada
 * borda ela é levada a zero, para o sino fechar em vez de sair cortado.
 */
export function sinoDosQuantis(end: { p10: number; p50: number; p90: number }, lo: number, hi: number, passos = PASSOS_DO_SINO): PontoDoSino[] {
  const ln = (v: number) => Math.log(Math.max(v, 1e-9))
  const mu = ln(end.p50)
  const sCima = Math.max((ln(end.p90) - mu) / 1.2816, 1e-3)
  const sBaixo = Math.max((mu - ln(end.p10)) / 1.2816, 1e-3)
  const pts: PontoDoSino[] = []
  for (let i = 0; i <= passos; i++) {
    const v = hi - ((hi - lo) * i) / passos
    if (v <= 0) {
      pts.push([v, 0])
      continue
    }
    const z = (ln(v) - mu) / (v >= end.p50 ? sCima : sBaixo)
    const u = (v - lo) / (hi - lo || 1)
    const borda = (x: number) => {
      const k = Math.min(Math.max(x / 0.12, 0), 1)
      return k * k * (3 - 2 * k)
    }
    pts.push([v, (Math.exp(-0.5 * z * z) / v) * borda(u) * borda(1 - u)])
  }
  return normalizarSino(pts)
}

/**
 * O sino COM os caminhos: a densidade de onde eles terminam (núcleo
 * gaussiano, banda de Silverman), de cima (hi) para baixo (lo). É o
 * histograma suave dos 2.000 finais, não uma curva ajustada.
 */
export function sinoDosFins(fins: ArrayLike<number>, lo: number, hi: number, passos = PASSOS_DO_SINO): PontoDoSino[] {
  const n = fins.length
  const ordenados = Float64Array.from(fins).sort()
  let soma = 0
  for (let i = 0; i < n; i++) soma += ordenados[i]!
  const media = soma / n
  let quad = 0
  for (let i = 0; i < n; i++) quad += (ordenados[i]! - media) ** 2
  const dp = Math.sqrt(quad / Math.max(n - 1, 1))
  const iqr = quantilOrdenado(ordenados, 0.75) - quantilOrdenado(ordenados, 0.25)
  const escala = Math.min(dp, iqr / 1.34) || dp || (hi - lo) / 20 || 1
  const banda = 0.9 * escala * n ** -0.2
  const pts: PontoDoSino[] = []
  for (let i = 0; i <= passos; i++) {
    const v = hi - ((hi - lo) * i) / passos
    let dens = 0
    for (let k = 0; k < n; k++) {
      const z = (v - ordenados[k]!) / banda
      if (z > -5 && z < 5) dens += Math.exp(-0.5 * z * z)
    }
    pts.push([v, dens])
  }
  return normalizarSino(pts)
}

/** Contorno fechado do sino em SVG: a base em x0 e a barriga para a direita. */
export function caminhoDoSino(pts: PontoDoSino[], x0: number, largura: number, yDe: (v: number) => number): string {
  if (!pts.length) return ''
  const f = (n: number) => n.toFixed(1)
  const corpo = pts.map(([v, d]) => `L${f(x0 + d * largura)},${f(yDe(v))}`).join('')
  return `M${f(x0)},${f(yDe(pts[0]![0]))}${corpo}L${f(x0)},${f(yDe(pts[pts.length - 1]![0]))}Z`
}

/* ————— os 2.000 caminhos ————— */

/** A resposta com os caminhos do motor (Backend de 31/10/2026; opcional). */
export interface FuturoComCaminhos extends FuturoDadosApi {
  /** "permil-delta": milésimos de covered_value; o 1º é 1000 e os outros, a diferença para o mês anterior */
  paths_encoding?: string | null
  paths_data?: number[][] | null
}

export interface CaminhosDoLeque {
  /** quantos caminhos */
  n: number
  /** pontos por caminho, na grade de `series` (61: mês 0 a 60) */
  pontos: number
  /** reais de hoje, caminho a caminho: o mês t do caminho i está em [i * pontos + t] */
  valores: Float64Array
}

/** Menos que isso não é leque de caminhos: cai nas faixas. */
export const MIN_CAMINHOS = 50

/**
 * Os caminhos do motor em reais de hoje, ordenados pelo valor final (do pior
 * ao melhor: o índice é o percentil de onde o caminho termina). Lê
 * "permil-delta" (o fio do Backend: soma acumulada × coberto / 1000) e
 * "permil" (milésimos absolutos). Qualquer coisa fora do contrato (formato
 * desconhecido, caminho de outro tamanho que a série, número não finito,
 * poucos caminhos) devolve null e o leque cai nas faixas.
 */
export function caminhosDoLeque(d: FuturoComCaminhos | null | undefined): CaminhosDoLeque | null {
  if (!d || !Array.isArray(d.paths_data) || d.paths_data.length < MIN_CAMINHOS) return null
  const formato = d.paths_encoding
  if (formato !== 'permil-delta' && formato !== 'permil') return null
  if (!valido(d.covered_value) || d.covered_value <= 0 || !Array.isArray(d.series)) return null
  const base = d.covered_value
  const pontos = d.series.length
  const n = d.paths_data.length
  const valores = new Float64Array(n * pontos)
  for (let i = 0; i < n; i++) {
    const linha = d.paths_data[i]
    if (!Array.isArray(linha) || linha.length !== pontos) return null
    let acc = 0
    for (let t = 0; t < pontos; t++) {
      const x = linha[t]
      if (!valido(x)) return null
      acc = formato === 'permil-delta' ? acc + x : x
      valores[i * pontos + t] = (base * acc) / 1000
    }
  }
  const c: CaminhosDoLeque = { n, pontos, valores }
  // o Backend já manda em ordem; conferir custa n comparações
  let emOrdem = true
  for (let i = 1; i < n && emOrdem; i++) emOrdem = fimDoCaminho(c, i - 1) <= fimDoCaminho(c, i)
  if (emOrdem) return c
  const ordem = Array.from({ length: n }, (_, i) => i).sort((a, b) => fimDoCaminho(c, a) - fimDoCaminho(c, b))
  const ordenados = new Float64Array(n * pontos)
  ordem.forEach((de, para) => ordenados.set(valores.subarray(de * pontos, (de + 1) * pontos), para * pontos))
  return { n, pontos, valores: ordenados }
}

export function fimDoCaminho(c: CaminhosDoLeque, i: number): number {
  return c.valores[i * c.pontos + c.pontos - 1]!
}

/** Quantil por interpolação linear num vetor JÁ ordenado (a conta do motor). */
export function quantilOrdenado(v: ArrayLike<number>, q: number): number {
  if (!v.length) return Number.NaN
  const pos = q * (v.length - 1)
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return v[lo]! * (1 - (pos - lo)) + v[hi]! * (pos - lo)
}

/** O mês t de todos os caminhos, ordenado. */
export function colunaDoMes(c: CaminhosDoLeque, t: number): Float64Array {
  const col = new Float64Array(c.n)
  for (let i = 0; i < c.n; i++) col[i] = c.valores[i * c.pontos + t]!
  return col.sort()
}

/**
 * A janela vertical do leque com caminhos: do quantil 0,5% ao 99,5% de cada
 * mês (e a faixa e o hoje dentro). Os ~10 caminhos de cada ponta que passam
 * disso saem pela borda, que esmaece: escalar pelo caminho mais extremo de
 * 2.000 achataria a faixa de 80% numa fita; apertar mais cortaria o sino dos
 * finais antes de ele chegar a zero.
 */
export function janelaDosCaminhos(c: CaminhosDoLeque, serie: FuturoPontoApi[], inicio: number): { lo: number; hi: number } {
  let lo = inicio
  let hi = inicio
  for (let t = 0; t < c.pontos; t++) {
    const col = colunaDoMes(c, t)
    lo = Math.min(lo, quantilOrdenado(col, 0.005))
    hi = Math.max(hi, quantilOrdenado(col, 0.995))
  }
  for (const s of serie) {
    lo = Math.min(lo, s.p10)
    hi = Math.max(hi, s.p90)
  }
  const folga = (hi - lo) * 0.04 || hi * 0.1
  return { lo: Math.max(0, lo - folga), hi: hi + folga }
}

/**
 * O índice do caminho mais perto de `valor` no mês t (a distância vertical
 * no ponto do cursor). No mês 0 todos valem o mesmo; ali vale o mês 1.
 */
export function caminhoMaisPerto(c: CaminhosDoLeque, t: number, valor: number): number {
  const m = Math.min(Math.max(t, 1), c.pontos - 1)
  let melhor = 0
  let menor = Infinity
  for (let i = 0; i < c.n; i++) {
    const dist = Math.abs(c.valores[i * c.pontos + m]! - valor)
    if (dist < menor) {
      menor = dist
      melhor = i
    }
  }
  return melhor
}

/**
 * Os três caminhos de um mês (o pedido do dono para o hover, 31/10/2026: "o
 * caminho do meio, o mais otimista e o mais pessimista daquele ponto"): os
 * caminhos REAIS que, no mês t, estão no p90, no p50 e no p10 da faixa, e
 * por isso batem com os números da leitura. O do topo e o do fundo seriam
 * os 2 de 2.000 mais extremos, fora da janela quase sempre.
 */
export function caminhosDoMes(c: CaminhosDoLeque, serie: FuturoPontoApi[], t: number): { otimista: number; meio: number; pessimista: number } {
  const s = serie[Math.min(Math.max(t, 1), serie.length - 1)]!
  return {
    otimista: caminhoMaisPerto(c, t, s.p90),
    meio: caminhoMaisPerto(c, t, s.p50),
    pessimista: caminhoMaisPerto(c, t, s.p10),
  }
}

/**
 * Afasta rótulos empilhados na vertical (y de cima para baixo) para que
 * nenhum encoste no vizinho: mantém a ordem, empurra para baixo o que encosta
 * e, se passar da base, sobe o bloco todo. Devolve na ordem recebida.
 */
export function afastarRotulos(ys: number[], gap: number, topo: number, base: number): number[] {
  const ordem = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y)
  for (let k = 0; k < ordem.length; k++) {
    const minimo = k ? ordem[k - 1]!.y + gap : topo
    ordem[k]!.y = Math.max(ordem[k]!.y, minimo)
  }
  const sobra = ordem.length ? ordem[ordem.length - 1]!.y - base : 0
  if (sobra > 0) {
    for (const o of ordem) o.y -= sobra
    for (let k = 0; k < ordem.length; k++) ordem[k]!.y = Math.max(ordem[k]!.y, k ? ordem[k - 1]!.y + gap : topo)
  }
  const out = new Array<number>(ys.length)
  for (const o of ordem) out[o.i] = o.y
  return out
}

/**
 * O tom de um caminho pela posição de onde ele termina (0 = o pior final,
 * 1 = o melhor), como no Agora: o miolo creme, as pontas em verde (alto) e
 * vermelho (baixo), mais opacas quanto mais raras. `mistura` vai de −1
 * (vermelho cheio) a +1 (verde cheio); `alfa` sobe nas pontas porque lá há
 * poucos caminhos e no miolo, centenas se somam. Com menos caminhos, cada
 * fio pesa mais.
 */
export function tomDoCaminho(rank: number, n: number): { mistura: number; alfa: number } {
  const u = Math.max(-1, Math.min(1, (rank - 0.5) * 2))
  const a = Math.abs(u)
  const t = Math.max(0, Math.min(1, (a - 0.28) / (0.86 - 0.28)))
  const suave = t * t * (3 - 2 * t)
  const peso = Math.min(Math.max(Math.sqrt(2000 / Math.max(n, 1)), 1), 3)
  const alfa = Math.min((0.04 + 0.26 * a ** 2.4) * peso, 0.9)
  return { mistura: Math.sign(u) * suave, alfa: Math.round(alfa * 1000) / 1000 }
}

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** O mês t do leque em palavras: 'hoje', 'mar/2028'. Sem `as_of` válido, 'mês 17'. */
export function mesDoLeque(asOf: string | null | undefined, t: number): string {
  if (t <= 0) return 'hoje'
  const ano = Number(String(asOf ?? '').slice(0, 4))
  const mes = Number(String(asOf ?? '').slice(5, 7)) - 1
  if (!(ano > 1900) || !(mes >= 0 && mes <= 11)) return `mês ${t}`
  const k = mes + t
  return `${MESES_CURTOS[k % 12]}/${ano + Math.floor(k / 12)}`
}

/**
 * Os anos do meio que cabem no eixo: sem encostar no "hoje · R$ X" (à
 * esquerda), no ano final (à direita) nem um no outro. Era o "2027" em cima
 * do "hoje · R$ 66,2 mil" nas larguras médias.
 */
export function marcasDoEixo(
  marcas: { x: number; rotulo: string | null }[],
  limites: { hojeDireita: number; fimEsquerda: number; meiaLargura: number; folga?: number },
): { x: number; rotulo: string }[] {
  const folga = limites.folga ?? 12
  const out: { x: number; rotulo: string }[] = []
  let direita = limites.hojeDireita
  for (const m of marcas) {
    if (!m.rotulo) continue
    if (m.x - limites.meiaLargura < direita + folga) continue
    if (m.x + limites.meiaLargura > limites.fimEsquerda - folga) continue
    out.push({ x: m.x, rotulo: m.rotulo })
    direita = m.x + limites.meiaLargura
  }
  return out
}

/** '#rrggbb', '#rgb' ou 'rgb(r, g, b)' (o que o getComputedStyle devolve de um token, como o --nu-green-soft) → [r, g, b]. */
export function rgbDaCor(cor: string | null | undefined): [number, number, number] | null {
  const v = String(cor ?? '').trim()
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v)
  if (hex) {
    const h = hex[1]!.length === 3 ? hex[1]!.replace(/./g, (c) => c + c) : hex[1]!
    const n = Number.parseInt(h, 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const rgb = /^rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)/i.exec(v)
  if (rgb) return [Math.round(Number(rgb[1])), Math.round(Number(rgb[2])), Math.round(Number(rgb[3]))]
  return null
}

/* ————— O que o teste encontrou (10/11/2026) —————
   O dono: "temos que de algum jeito mostrar o impacto da Redentia de testar em
   2.000 cenários". O leque mostra os 2.000; isto CONTA neles, em frases que
   qualquer um lê: em quantos a carteira termina acima de hoje, em quantos ela
   passa por uma queda de 10% ou mais no caminho (do pico ao fundo, mês a mês)
   e em quantos ela dobra. Tudo em reais de hoje, dos caminhos do próprio
   motor (nada sorteado no site). */

export interface ResultadoDoTeste {
  n: number
  /** caminhos que terminam acima do valor de hoje */
  acimaDeHoje: number
  /** caminhos que terminam abaixo do valor de hoje (o resto de acimaDeHoje, menos os que terminam igual) */
  abaixoDeHoje: number
  /** caminhos que, em algum mês, ficam 10% ou mais abaixo do pico que já tinham feito */
  quedaDe10: number
  /** caminhos que terminam com o dobro de hoje ou mais */
  dobram: number
  /**
   * quem é quem, para o leque acender cada grupo (10/11/2026): um byte por
   * caminho, na ordem de `valores`, com os bits GRUPO_DO_TESTE
   */
  grupos: Uint8Array
}

/** os bits de `ResultadoDoTeste.grupos` */
export const GRUPO_DO_TESTE = { acima: 1, abaixo: 2, queda: 4, dobra: 8 } as const
export type GrupoDoTeste = keyof typeof GRUPO_DO_TESTE

/** 1 para os caminhos do grupo, 0 para o resto: o que o leque acende */
export function mascaraDoGrupo(r: ResultadoDoTeste, g: GrupoDoTeste): Uint8Array {
  const bit = GRUPO_DO_TESTE[g]
  const m = new Uint8Array(r.n)
  for (let i = 0; i < r.n; i++) m[i] = r.grupos[i]! & bit ? 1 : 0
  return m
}

export const QUEDA_DO_TESTE = 0.10

export function resultadoDoTeste(c: CaminhosDoLeque | null | undefined, hoje: number): ResultadoDoTeste | null {
  if (!c || c.n < MIN_CAMINHOS || c.pontos < 2 || !(hoje > 0)) return null
  let acimaDeHoje = 0
  let abaixoDeHoje = 0
  let quedaDe10 = 0
  let dobram = 0
  const grupos = new Uint8Array(c.n)
  for (let i = 0; i < c.n; i++) {
    const ini = i * c.pontos
    let pico = c.valores[ini]!
    let caiu = false
    for (let t = 1; t < c.pontos; t++) {
      const v = c.valores[ini + t]!
      if (v > pico) pico = v
      else if (!caiu && pico > 0 && v / pico - 1 <= -QUEDA_DO_TESTE) caiu = true
    }
    const fim = c.valores[ini + c.pontos - 1]!
    let g = 0
    if (fim > hoje) { acimaDeHoje++; g |= GRUPO_DO_TESTE.acima }
    if (fim < hoje) { abaixoDeHoje++; g |= GRUPO_DO_TESTE.abaixo }
    if (fim >= 2 * hoje) { dobram++; g |= GRUPO_DO_TESTE.dobra }
    if (caiu) { quedaDe10++; g |= GRUPO_DO_TESTE.queda }
    grupos[i] = g
  }
  return { n: c.n, acimaDeHoje, abaixoDeHoje, quedaDe10, dobram, grupos }
}

/**
 * A cor do fio contra HOJE (10/11/2026). Antes, a cor era a posição do fio
 * entre os 2.000 (tomDoCaminho): a metade de baixo saía rosa, e o rosa lia
 * como prejuízo mesmo quando o caminho terminava acima do que a pessoa tem
 * hoje (na carteira do dono, o p10 de R$ 715 mil está 12% acima dos R$ 640
 * mil de hoje; só 86 de 2.000 terminam abaixo). Agora:
 *  - terminou abaixo de hoje → rosa inteiro (mistura −1), um pouco mais visível;
 *  - terminou acima → do creme (perto de hoje) ao verde (perto do maior final).
 * A transparência segue a da posição (os fios do miolo, muitos, mais apagados).
 */
export function tomContraHoje(fim: number, hoje: number, maiorFim: number, rank: number, n: number): { mistura: number; alfa: number } {
  const base = tomDoCaminho(rank, n)
  if (!(hoje > 0) || !Number.isFinite(fim)) return base
  if (fim < hoje) {
    const peso = Math.min(Math.max(Math.sqrt(2000 / Math.max(n, 1)), 1), 3)
    return { mistura: -1, alfa: Math.round(Math.min(Math.max(base.alfa, 0.14 * peso), 0.9) * 1000) / 1000 }
  }
  const faixa = maiorFim - hoje
  const u = faixa > 0 ? Math.min(1, (fim - hoje) / faixa) : 0
  const t = Math.max(0, Math.min(1, (u - 0.12) / (0.7 - 0.12)))
  return { mistura: Math.round(t * t * (3 - 2 * t) * 1000) / 1000, alfa: base.alfa }
}

/**
 * "Daqui a 5 anos": o leque do motor de cenários sobre a carteira da pessoa,
 * em dinheiro de hoje (GET /me/carteira/futuro). O desenho do Agora dos apps
 * (canvas V5MBL5Q3, IPhoneAgoraV2 · Detalhes e MacAgoraFerramentas), no
 * contrato final do Backend (31/10/2026):
 *  - `series` é MENSAL (61 pontos, mês 0 a 60; `year` decimal) com p10–p90;
 *  - `sample_paths` traz UM caminho real (o mais perto do meio): ele é a linha
 *    acesa do meio. O motor não expõe mais caminhos, então o leque é desenhado
 *    pelas faixas (80% e 50%) e pelas linhas de cada quantil — nada de
 *    caminho inventado;
 *  - `today_value` é a carteira inteira; a série e os finais partem de
 *    `covered_value` (a parte que o motor simula). O que ficou de fora é dito.
 *
 * Aqui mora só conta: o texto formatado e a geometria do SVG. Todo número sai
 * da resposta da API. Os testes importam direto (sem import de valor).
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

  // O sino dos finais na ponta: densidade log-normal ajustada pelos quantis do
  // motor (p10, p50, p90), desenhada para a direita a partir de xFim.
  const mu = Math.log(Math.max(d.end.p50, 1))
  const sigma = Math.max((Math.log(Math.max(d.end.p90, 1)) - Math.log(Math.max(d.end.p10, 1))) / (2 * 1.2816), 0.01)
  const larguraSino = Math.max(caixa.sino - 2, 0)
  const passos = 48
  const dens: Pt[] = []
  for (let i = 0; i <= passos; i++) {
    const v = yMin + ((yMax - yMin) * i) / passos
    const z = v > 0 ? (Math.log(v) - mu) / sigma : -10
    dens.push([v, v > 0 ? Math.exp(-0.5 * z * z) / v : 0])
  }
  const pico = Math.max(...dens.map((x) => x[1])) || 1
  const sinoPts: Pt[] = dens.map(([v, p]) => [xFim + 2 + (p / pico) * larguraSino, yDe(v)])
  const sino = `M${xFim + 2},${yDe(yMax).toFixed(1)}` + sinoPts.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('') + `L${xFim + 2},${yDe(yMin).toFixed(1)}Z`

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

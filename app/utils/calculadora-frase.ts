/**
 * As calculadoras na frase (dono, 21/10/2026: "precisamos facilitar as
 * calculadoras, tem algumas que têm MUITA configuração"). A conta vira uma
 * frase com o que importa, o resto fica nas premissas e, depois de a pessoa
 * mexer, a folha de cadastro sobe uma vez para guardar a conta.
 *
 * Aqui ficam as partes puras, sem import do Nuxt, para o `node --test`
 * (tests/calculadora-frase.test.ts): a regra do convite e o desenho da curva.
 */

/** Fechou a folha sem criar conta: o convite automático some por esse tempo. */
export const CONTA_CONVITE_PAUSA_DIAS = 7
/** Quantas mudanças na conta antes de convidar, e quanto esperar depois da última. */
export const CONTA_CONVITE_MUDANCAS = 2
export const CONTA_CONVITE_ESPERA_MS = 4000

export interface EstadoConvite {
  logado: boolean
  /** alguma folha de cadastro aberta agora */
  folhaAberta: boolean
  /** a folha desta calculadora já subiu nesta visita (pelo botão ou sozinha) */
  jaNaVisita: boolean
  /** quando a pessoa fechou a folha sem criar conta, em ms; null se nunca */
  fechouEm: number | null
  agora: number
}

/** A folha sobe sozinha só para quem não tem conta, uma vez por visita, e respeita o "Agora não". */
export function podeConvidarConta(e: EstadoConvite): boolean {
  if (e.logado || e.folhaAberta || e.jaNaVisita) return false
  return !e.fechouEm || e.agora - e.fechouEm >= CONTA_CONVITE_PAUSA_DIAS * 86_400_000
}

export type Ponto = [number, number]

export interface CurvaDaConta {
  /** o traço da série */
  linha: string
  /** a área embaixo dele, fechada na base */
  area: string
  /** o último ponto, onde fica a bolinha */
  fim: Ponto
  /** a altura de um valor no mesmo eixo (para a linha da meta) */
  y: (v: number) => number
}

/**
 * A curva de uma série anual num quadro W×H com margem M. O teto do eixo é o
 * maior entre a série e a meta, com folga de 4%, para a linha tracejada da
 * meta nunca sair do quadro quando a conta não chega lá.
 */
export function curvaDaConta(valores: readonly number[], { W = 520, H = 170, M = 8, meta = null as number | null } = {}): CurvaDaConta | null {
  const vs = valores.filter((v) => Number.isFinite(v))
  if (vs.length < 2) return null
  const teto = Math.max(...vs, meta ?? 0, 1) * 1.04
  const y = (v: number) => H - M - ((H - 2 * M) * Math.max(0, v)) / teto
  const pts: Ponto[] = vs.map((v, i) => [M + ((W - 2 * M) * i) / (vs.length - 1), y(v)])
  const linha = pts.map(([x, py], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${py.toFixed(1)}`).join(' ')
  const ultimo = pts[pts.length - 1]!
  return { linha, area: `${linha} L${ultimo[0].toFixed(1)} ${H - M + 2} L${M} ${H - M + 2} Z`, fim: ultimo, y }
}

/** "R$ 3,26 mi" / "R$ 412 mil" / "R$ 950": o valor curto do rótulo da curva. */
export function brlCurto(v: number): string {
  const a = Math.abs(v)
  const nf = (n: number, casas: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
  if (a >= 1e6) return `R$ ${nf(v / 1e6, 2)} mi`
  if (a >= 1e4) return `R$ ${nf(Math.round(v / 1e3), 0)} mil`
  return `R$ ${nf(Math.round(v), 0)}`
}

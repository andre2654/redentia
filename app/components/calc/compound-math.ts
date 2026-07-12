/**
 * PR10 — matemática de juros compostos, porte EXATO do script do design
 * (Redentia Calculadoras Nu.dc.html) que por sua vez espelha a página antiga:
 *   im = (1 + jt/100)^(1/12) - 1        (taxa anual → mensal equivalente)
 *   fv(k) = ji·f + jm·(f-1)/im, f=(1+im)^k
 * Nenhum arredondamento intermediário — só na formatação.
 */

/** 'R$ 1.234' — formatação do design (inteiro, pt-BR). */
export function brl(v: number): string {
  return 'R$ ' + Math.round(v).toLocaleString('pt-BR')
}

export interface CompoundInput {
  /** aporte inicial (R$) */
  ji: number
  /** aporte mensal (R$) */
  jm: number
  /** taxa anual (% a.a.) */
  jt: number
  /** prazo (anos) */
  jp: number
}

export interface CompoundProjection {
  total: number
  aportado: number
  juros: number
  /** % do total que veio de juros */
  pctJ: number
  /** juros ÷ aportado */
  razao: number
  /** patrimônio ano a ano (k = 0..jp) */
  series: number[]
  /** aportado ano a ano (linha tracejada) */
  aporteSeries: number[]
}

export function compoundProjection({ ji, jm, jt, jp }: CompoundInput): CompoundProjection {
  const im = Math.pow(1 + jt / 100, 1 / 12) - 1
  const n = jp * 12
  const fv = (k: number) => {
    const f = Math.pow(1 + im, k)
    return im > 0 ? ji * f + (jm * (f - 1)) / im : ji + jm * k
  }
  const total = fv(n)
  const aportado = ji + jm * n
  const juros = total - aportado
  const series: number[] = []
  const aporteSeries: number[] = []
  for (let k = 0; k <= jp; k++) {
    series.push(fv(k * 12))
    aporteSeries.push(ji + jm * k * 12)
  }
  return {
    total,
    aportado,
    juros,
    pctJ: total > 0 ? (juros / total) * 100 : 0,
    razao: aportado > 0 ? juros / aportado : 0,
    series,
    aporteSeries,
  }
}

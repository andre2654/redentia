/**
 * As contas pequenas do relatório da /carteira nova (07/11/2026): o valor de
 * cada indicador na unidade dele, a mediana (a mesma regra do backend, para o
 * teste do mock), os indicadores por pilar e as frases do período e da nota.
 * Puras, com teste (tests/carteira-imposto.test.ts).
 */
import type { CarteiraRelatorio, IndicadorRelatorio, PilarNota, UnidadeRelatorio } from '~/types/carteiraRelatorio'

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const sinal = (v: number) => (v < 0 ? '−' : '')

/** '18,4%' · '−8,4%' · '0,62' · '22' · 'R$ 1.240' · '—' (sem dado) */
export function valorDoIndicador(v: number | null, unidade: UnidadeRelatorio): string {
  if (v == null || !Number.isFinite(v)) return '—'
  const a = Math.abs(v)
  if (unidade === '%') return `${sinal(v)}${nf1.format(a)}%`
  if (unidade === 'R$') return `${sinal(v)}R$ ${nf0.format(Math.round(a))}`
  return `${sinal(v)}${Number.isInteger(v) ? nf0.format(a) : nf2.format(a)}`
}

/** a mediana das notas que existem; null se nenhuma (Nota::mediana do backend) */
export function mediana(xs: (number | null | undefined)[]): number | null {
  const v = xs.filter((x): x is number => x != null).sort((a, b) => a - b)
  if (!v.length) return null
  const m = Math.floor(v.length / 2)
  return v.length % 2 ? v[m]! : (v[m - 1]! + v[m]!) / 2
}

/** os indicadores de cada pilar, na ordem dos pilares que o backend manda */
export function indicadoresPorPilar(r: CarteiraRelatorio): { pilar: PilarNota; indicadores: IndicadorRelatorio[] }[] {
  return r.pilares
    .map((pilar) => ({ pilar, indicadores: r.indicadores.filter((i) => i.pilar === pilar.chave) }))
    .filter((g) => g.indicadores.length)
}

const dataBr = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
/** 'De 02/05/2025 a 06/11/2026, 553 dias.' · null sem histórico */
export function periodoTxt(p: CarteiraRelatorio['periodo']): string | null {
  if (!p.inicio || !p.fim) return null
  return `De ${dataBr(p.inicio)} a ${dataBr(p.fim)}, ${nf0.format(p.dias)} ${p.dias === 1 ? 'dia' : 'dias'}.`
}

/** a frase grande: 'A sua carteira tira 64 de 100.' */
export function fraseDaNota(nota: number | null): string {
  if (nota == null) return 'Ainda não há histórico para dar uma nota à carteira.'
  return `A sua carteira tira ${nf0.format(Math.round(nota))} de 100.`
}

/** '53% CDI, 27% IBOV e 20% IFIX' (os pesos médios do benchmark composto) */
export function composicaoTxt(c: CarteiraRelatorio['benchmark']['composicao']): string {
  const l = [...c].sort((a, b) => b.peso - a.peso).map((x) => `${nf0.format(Math.round(x.peso))}% ${x.indice}`)
  return l.length > 1 ? `${l.slice(0, -1).join(', ')} e ${l[l.length - 1]}` : (l[0] ?? '')
}

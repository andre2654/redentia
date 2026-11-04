/**
 * As contas dos esboços que disputam o lugar dos anéis na home (03/11/2026).
 * O dono: "esse está muito perto do ícone de gym da Apple". Dos quatro
 * primeiros ficou o losango (?aneis=3), e em 04/11 vieram mais quatro com a
 * marca (?aneis=5|6|7|8; a geometria do logo está em utils/marcaRedentia.ts).
 * Todos dizem a mesma coisa que os anéis, você contra a bolsa e o provento,
 * mas deixam legível a diferença, que no desenho de anéis quase some (−1,44%
 * contra −1,42% dá dois arcos iguais).
 *
 * Funções puras, sem Nuxt: o teste trava as contas (tests/placar-do-dia.test.ts).
 * Regra de sempre: dado que falta some, nunca vira zero.
 */
import { LINHA_DO_DIA } from './diaDaCarteira.ts'

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const r2 = (n: number) => Math.round(n * 100) / 100

/** A escala só cresce de 3 em 3 (a linha do dia dos apps) e para em 9; acima disso o marcador fica na borda. */
export const TETO_DA_ESCALA = LINHA_DO_DIA * 3

/**
 * A meia escala dos esboços, em %: 3 num dia comum, como a volta do anel, para
 * um dia calmo parecer calmo; 6 ou 9 quando o dia passa disso. Nunca menos de 3,
 * nunca mais que o teto.
 */
export function escalaDoDia(valores: (number | null | undefined)[], passo = LINHA_DO_DIA, teto = TETO_DA_ESCALA): number {
  const m = Math.max(0, ...valores.filter((v): v is number => v != null && Number.isFinite(v)).map(Math.abs))
  return Math.min(teto, Math.max(passo, Math.ceil(m / passo - 1e-9) * passo))
}

/** Onde o valor cai na escala, de −1 a 1; `passou` quando ficou preso na borda. */
export function posicaoNaEscala(v: number, escala: number): { f: number; passou: boolean } {
  if (escala <= 0) return { f: 0, passou: false }
  const f = v / escala
  return { f: Math.max(-1, Math.min(1, f)), passou: Math.abs(f) > 1 + 1e-9 }
}

/**
 * Você menos a bolsa, em pontos percentuais, a partir dos números que a tela
 * mostra (com duas casas): −1,44% e −1,42% dão −0,02, e não o −0,0298 do dado
 * cru, que a pessoa não consegue conferir de cabeça. Sem um dos dois → null.
 */
export function diferencaEmPP(voce: number | null, bolsa: number | null): number | null {
  if (voce == null || bolsa == null) return null
  return r2(r2(voce) - r2(bolsa))
}

/** '−0,02 p.p.' / '+0,40 p.p.' / '0,00 p.p.' (com o "−" de verdade). */
export function ppComSinal(d: number): string {
  if (Math.abs(d) < 0.005) return '0,00 p.p.'
  return `${d > 0 ? '+' : '−'}${nf2.format(Math.abs(d))} p.p.`
}

export interface QuemNaFrente {
  lider: 'voce' | 'bolsa' | 'empate'
  /** o número sem sinal, com a unidade: '0,02 p.p.' */
  numero: string
  /** a relação, em minúscula: 'atrás da bolsa' / 'à frente da bolsa' / 'empatado com a bolsa' */
  relacao: string
}

/** Quem foi melhor no dia e por quanto. Sem um dos dois → null. */
export function quemNaFrente(voce: number | null, bolsa: number | null): QuemNaFrente | null {
  const d = diferencaEmPP(voce, bolsa)
  if (d == null) return null
  if (Math.abs(d) < 0.005) return { lider: 'empate', numero: '0,00 p.p.', relacao: 'empatado com a bolsa' }
  return {
    lider: d > 0 ? 'voce' : 'bolsa',
    numero: `${nf2.format(Math.abs(d))} p.p.`,
    relacao: d > 0 ? 'à frente da bolsa' : 'atrás da bolsa',
  }
}

/**
 * A dica do hover dos esboços, uma frase por série:
 * 'Sua carteira: −1,44%, 0,02 p.p. atrás da bolsa' / 'Ibovespa: −1,42% no mesmo dia' /
 * 'Provento: nenhum hoje'. Série sem dado → null.
 */
export function dicaDoDia(
  chave: 'voce' | 'bolsa' | 'provento',
  e: { voce: number | null; bolsa: number | null; provento: boolean; proventoSub: string | null },
): string | null {
  const pct = (n: number) => (Math.abs(n) < 0.005 ? '0,00%' : `${n > 0 ? '+' : '−'}${nf2.format(Math.abs(n))}%`)
  if (chave === 'voce') {
    if (e.voce == null) return null
    const q = quemNaFrente(e.voce, e.bolsa)
    return `Sua carteira: ${pct(e.voce)}${q ? (q.lider === 'empate' ? ', empatada com a bolsa' : `, ${q.numero} ${q.relacao}`) : ''}`
  }
  if (chave === 'bolsa') return e.bolsa == null ? null : `Ibovespa: ${pct(e.bolsa)} no mesmo dia`
  return e.proventoSub ? `Provento: ${e.proventoSub}` : e.provento ? 'Caiu provento' : null
}

/** As marcas da escala: o zero, os terços e as pontas ('−3%', '−2%'… '+3%'). */
export function marcasDaEscala(escala: number): { f: number; rotulo: string }[] {
  const out: { f: number; rotulo: string }[] = []
  for (let i = -3; i <= 3; i++) {
    const v = r2((escala * i) / 3)
    out.push({ f: i / 3, rotulo: v === 0 ? '0' : `${v > 0 ? '+' : '−'}${Math.abs(v).toLocaleString('pt-BR')}%` })
  }
  return out
}

/** A frase do leitor de tela: 'Você menos 1,44%, bolsa menos 1,42%, 0,02 p.p. atrás da bolsa, sem provento.' */
export function faladoDoDia(voce: number | null, bolsa: number | null, provento: boolean): string {
  const p = (v: number | null) => (v == null ? 'sem dado' : `${v < 0 ? 'menos ' : ''}${nf2.format(Math.abs(v))}%`)
  const q = quemNaFrente(voce, bolsa)
  const rel = q ? `, ${q.lider === 'empate' ? 'empatado com a bolsa' : `${q.numero} ${q.relacao}`}` : ''
  return `Você ${p(voce)}, bolsa ${p(bolsa)}${rel}, ${provento ? 'caiu provento' : 'sem provento'}.`
}

/**
 * As unidades da constelação: cada losango vale 1/12 da escala (0,25% num
 * dia comum, 0,5% ou 0,75% no dia grande). Devolve os cheios, a fração do
 * último aceso (0…1) e se passou dos 12.
 */
export function losangosDoDia(v: number, escala: number, porLado = 12): { cheios: number; fracao: number; passou: boolean; unidade: number } {
  const unidade = escala / porLado
  const n = Math.abs(r2(v)) / unidade
  if (n > porLado + 1e-9) return { cheios: porLado, fracao: 0, passou: true, unidade }
  const cheios = Math.floor(n + 1e-9)
  return { cheios, fracao: r2(n - cheios), passou: false, unidade }
}

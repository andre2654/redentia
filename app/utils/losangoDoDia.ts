/**
 * As contas do losango do dia (HomeLosango), o elemento ao lado do texto no
 * topo da home de quem assina. Ele entrou em 04/11/2026 no lugar dos anéis do
 * relógio (o dono: "esse está muito perto do ícone de gym da Apple"), depois
 * de oito esboços: diz a mesma coisa, você contra a bolsa e o provento, mas
 * deixa legível a diferença, que no desenho de anéis quase sumia (−1,44%
 * contra −1,42% dava dois arcos iguais). A geometria do logo está em
 * utils/marcaRedentia.ts.
 *
 * Funções puras, sem Nuxt: o teste trava as contas (tests/losango-do-dia.test.ts).
 * Regra de sempre: dado que falta some, nunca vira zero.
 */
import { LINHA_DO_DIA } from './diaDaCarteira.ts'

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const r2 = (n: number) => Math.round(n * 100) / 100

/** A escala só cresce de 3 em 3 (a linha do dia dos apps) e para em 9; acima disso o nível fica na ponta. */
export const TETO_DA_ESCALA = LINHA_DO_DIA * 3

/**
 * A meia escala do losango, em %: 3 num dia comum, como a volta do anel, para
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
 * A dica do hover do losango, uma frase por série:
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


/** A frase do leitor de tela: 'Você menos 1,44%, bolsa menos 1,42%, 0,02 p.p. atrás da bolsa, sem provento.' */
export function faladoDoDia(voce: number | null, bolsa: number | null, provento: boolean): string {
  const p = (v: number | null) => (v == null ? 'sem dado' : `${v < 0 ? 'menos ' : ''}${nf2.format(Math.abs(v))}%`)
  const q = quemNaFrente(voce, bolsa)
  const rel = q ? `, ${q.lider === 'empate' ? 'empatado com a bolsa' : `${q.numero} ${q.relacao}`}` : ''
  return `Você ${p(voce)}, bolsa ${p(bolsa)}${rel}, ${provento ? 'caiu provento' : 'sem provento'}.`
}


/**
 * A frase do topo da /carteira, na língua do Agora dos apps (31/10/2026): a
 * pessoa abre e lê, numa frase, se está tudo bem. O número vem depois, na
 * pílula escondida.
 *
 *  - Um papel caiu 5% ou mais no pregão → "{Papel} caindo." (ou "caiu.") e
 *    "Caiu 13,66% hoje."; o resto do tempo, "Tudo normal.".
 *  - Bolsa aberta e dia verde: "Estamos analisando tudo para você." (sem
 *    número; o resultado está na pílula). Dia vermelho: a comparação com a
 *    bolsa, sem número ("Sua carteira cai menos que a bolsa hoje.").
 *  - Bolsa fechada, antes da abertura ou fim de semana: o fato do último
 *    pregão, com número ("Na sexta, sua carteira subiu 0,62%; a bolsa, 0,41%.").
 *
 * Todo número vem do /portfolio/today (carteira) e da série do Ibovespa no
 * mesmo dia de preço. Sem dado, a frase não afirma nada. Sem import de valor.
 */
import type { EstadoDoPregao } from './pregao.ts'

export const QUEDA_QUE_PEDE_ATENCAO = -5

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export interface EntradaDaFrase {
  pregao: EstadoDoPregao
  /** 'hoje' | 'ontem' | 'na sexta' | 'em 28/10' — de quandoFoi(price_dates.today) */
  quando: string | null
  carteiraPct: number | null
  bolsaPct: number | null
  alerta: { nome: string; pct: number } | null
}

export interface FraseDaCarteira {
  titulo: string
  linha: string
  tom: 'normal' | 'atencao'
  /** a linha é o "Estamos analisando…" (o componente faz o brilho passar) */
  analisando: boolean
}

const ANALISANDO = 'Estamos analisando tudo para você.'

function verbo(p: number): string {
  if (Math.abs(p) < 0.005) return 'ficou estável'
  return p > 0 ? `subiu ${nf2.format(p)}%` : `caiu ${nf2.format(Math.abs(p))}%`
}

/** "sobe mais que a bolsa", "cai enquanto a bolsa sobe"… (ao vivo, sem número). */
export function comparacaoAoVivo(c: number, b: number): string {
  const perto = Math.abs(c - b) < 0.15
  if (c >= 0 && b < 0) return 'Sua carteira sobe enquanto a bolsa cai.'
  if (c < 0 && b >= 0) return 'Sua carteira cai enquanto a bolsa sobe.'
  if (perto) return 'Sua carteira anda junto com a bolsa hoje.'
  if (c >= 0) return c > b ? 'Sua carteira sobe mais que a bolsa hoje.' : 'Sua carteira sobe menos que a bolsa hoje.'
  return c < b ? 'Sua carteira cai mais que a bolsa hoje.' : 'Sua carteira cai menos que a bolsa hoje.'
}

/** "Sua carteira caiu 0,77% hoje; a bolsa, 1,06%." / "Na sexta, sua carteira subiu 0,62%." */
export function fatoDoPregao(quando: string, c: number, b: number | null): string {
  const bolsa = b != null ? `; a bolsa, ${Math.abs(b) < 0.005 ? 'estável' : `${nf2.format(Math.abs(b))}%`}` : ''
  // a bolsa vai sem sinal, como no Agora: o verbo da carteira dá o sentido, e
  // quando os dois andam em sentidos opostos a frase diz isso com todas as letras
  const opostos = b != null && Math.abs(b) >= 0.005 && Math.abs(c) >= 0.005 && Math.sign(b) !== Math.sign(c)
  const bolsaTxt = opostos ? `; a bolsa ${b! > 0 ? 'subiu' : 'caiu'} ${nf2.format(Math.abs(b!))}%` : bolsa
  if (quando === 'hoje') return `Sua carteira ${verbo(c)} hoje${bolsaTxt}.`
  const abre = quando.charAt(0).toUpperCase() + quando.slice(1)
  return `${abre}, sua carteira ${verbo(c)}${bolsaTxt}.`
}

export function fraseDaCarteira(i: EntradaDaFrase): FraseDaCarteira {
  const aoVivo = i.pregao === 'aberta' && i.quando === 'hoje'

  if (i.alerta && i.alerta.pct <= QUEDA_QUE_PEDE_ATENCAO) {
    const quando = i.quando ?? 'hoje'
    return {
      titulo: `${i.alerta.nome} ${aoVivo ? 'caindo' : 'caiu'}.`,
      linha: `Caiu ${nf2.format(Math.abs(i.alerta.pct))}% ${quando}.`,
      tom: 'atencao',
      analisando: false,
    }
  }

  if (i.carteiraPct == null || !i.quando) {
    return { titulo: 'Tudo normal.', linha: ANALISANDO, tom: 'normal', analisando: true }
  }

  if (aoVivo) {
    if (i.carteiraPct >= 0 || i.bolsaPct == null) {
      return { titulo: 'Tudo normal.', linha: ANALISANDO, tom: 'normal', analisando: true }
    }
    return { titulo: 'Tudo normal.', linha: comparacaoAoVivo(i.carteiraPct, i.bolsaPct), tom: 'normal', analisando: false }
  }

  return { titulo: 'Tudo normal.', linha: fatoDoPregao(i.quando, i.carteiraPct, i.bolsaPct), tom: 'normal', analisando: false }
}

/** Rótulo da pílula do dia: 'hoje', 'ontem', 'sexta', '28/10' (sem preposição). */
export function rotuloDaPilula(quando: string | null): string {
  if (!quando) return 'hoje'
  return quando.replace(/^(na|no|em) /, '')
}

/**
 * O nome curto de um papel para a frase: o nome comercial quando é curto
 * ("Itaú", "Vale"), senão o ticker. Nome bruto da B3 ('ITAUUNIBANCOPN') não
 * entra: o ticker diz mais.
 */
export function nomeParaFrase(nome: string | null | undefined, ticker: string): string {
  const n = (nome ?? '').trim()
  if (!n || n.length > 14 || n === n.toUpperCase()) return ticker.toUpperCase()
  return n
}

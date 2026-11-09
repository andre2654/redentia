/**
 * As frases da home nova (31/10/2026), no jeito do Agora dos apps: uma frase
 * responde "está tudo normal?" e o número vem em apoio. Funções puras, sem
 * Nuxt, para o teste travar o texto (tests/home-agora.test.ts).
 *
 * Regra de sempre: sem número, sem frase. Quem chama esconde a linha quando a
 * função devolve null; nada de zero nem de frase genérica fingindo dado.
 */
import type { MomentoDaBolsa } from './pregaoB3'

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Faixa em que o Ibovespa conta como "estável" (em %, dos dois lados). */
const ESTAVEL = 0.3

/** "Bolsa em alta." / "Bolsa em queda." / "Bolsa estável." pela variação do Ibovespa. */
export function fraseDaBolsa(ibovPct: number | null | undefined): string | null {
  if (ibovPct == null || !Number.isFinite(ibovPct)) return null
  if (ibovPct >= ESTAVEL) return 'Bolsa em alta.'
  if (ibovPct <= -ESTAVEL) return 'Bolsa em queda.'
  return 'Bolsa estável.'
}

/** '0,91%' sem sinal: o verbo da frase já diz se subiu ou caiu. */
const pctAbs = (n: number) => `${nf2.format(Math.abs(n))}%`

/** "sobe 0,91%" / "caiu 0,75%" / "fica estável": o verbo no tempo certo e o número sem sinal. */
function movimento(pct: number, aoVivo: boolean): string {
  if (Math.abs(pct) < 0.005) return aoVivo ? 'fica estável' : 'ficou estável'
  const verbo = pct > 0 ? (aoVivo ? 'sobe' : 'subiu') : (aoVivo ? 'cai' : 'caiu')
  return `${verbo} ${pctAbs(pct)}`
}

/**
 * A frase de baixo do Agora: a carteira contra a bolsa, no tempo certo, cada
 * uma com o seu verbo. O app escreve "a bolsa, 1,06%" porque lá as duas quase
 * sempre andam juntas; aqui, com as duas em lados opostos, "a bolsa, −0,75%"
 * lia mal no primeiro print, e o verbo resolve.
 *  - bolsa aberta: "Sua carteira sobe 0,91% hoje e a bolsa cai 0,40%."
 *  - fechou hoje:  "Sua carteira subiu 0,91% hoje e a bolsa caiu 0,40%."
 *  - antes das 10h, fim de semana ou feriado:
 *                  "No último pregão, sua carteira subiu 0,91% e a bolsa caiu 0,40%."
 * Sem a variação da carteira → null. Sem a da bolsa, a frase fica só com a carteira.
 */
export function fraseDaCarteira(
  carteiraPct: number | null | undefined,
  ibovPct: number | null | undefined,
  momento: Pick<MomentoDaBolsa, 'estado' | 'numerosDeHoje'>,
): string | null {
  if (carteiraPct == null || !Number.isFinite(carteiraPct)) return null
  const aoVivo = momento.estado === 'aberta'
  const bolsa = ibovPct != null && Number.isFinite(ibovPct) ? ` e a bolsa ${movimento(ibovPct, aoVivo)}` : ''
  if (momento.numerosDeHoje) return `Sua carteira ${movimento(carteiraPct, aoVivo)} hoje${bolsa}.`
  return `No último pregão, sua carteira ${movimento(carteiraPct, false)}${bolsa}.`
}

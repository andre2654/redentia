/**
 * Diferença entre a cotação e o preço teto, sem veredito.
 *
 * X = (cotação − preço teto) ÷ preço teto. É o mesmo ratio − 1 que
 * metrics() já devolve (preço ÷ teto). A conta dos métodos não muda.
 * O enunciado é o da página de método (PR 162). O percentual é pt-BR,
 * 1 casa, com sinal (+ acima do teto, − abaixo, sem sinal no zero).
 */

const pct = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

export const FRASE_DIFERENCA_PRECO_TETO = 'Diferença entre a cotação informada e o preço teto calculado'

/** Fração (cotação − teto) ÷ teto. Null quando falta cotação ou teto. */
export function diferencaSobreTeto(cotacao: number, teto: number): number | null {
  if (!(cotacao > 0) || !(teto > 0) || !Number.isFinite(cotacao) || !Number.isFinite(teto)) return null
  return (cotacao - teto) / teto
}

/** "+12,3%" / "-12,3%" / "0,0%". */
export function formatarDiferencaPct(fracao: number): string {
  return pct.format(fracao)
}

/** A linha neutra, ou null quando a conta não fecha. */
export function linhaDiferencaPrecoTeto(cotacao: number, teto: number): string | null {
  const x = diferencaSobreTeto(cotacao, teto)
  if (x == null) return null
  return `${FRASE_DIFERENCA_PRECO_TETO}: ${formatarDiferencaPct(x)}.`
}

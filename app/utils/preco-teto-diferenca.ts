/**
 * Diferença entre a cotação e o preço teto, sem veredito.
 *
 * X = (cotação − preço teto) ÷ preço teto. É o mesmo ratio − 1 que
 * metrics() já devolve (preço ÷ teto). A conta dos métodos não muda.
 * O texto é o da linha que a página de método escrevia na hora (PR 162):
 * uma casa, vírgula decimal, sinal de menos quando a cotação fica abaixo.
 */

export const FRASE_DIFERENCA_PRECO_TETO = 'Diferença entre a cotação informada e o preço teto calculado'

/** Fração (cotação − teto) ÷ teto. Null quando falta cotação ou teto. */
export function diferencaSobreTeto(cotacao: number, teto: number): number | null {
  if (!(cotacao > 0) || !(teto > 0) || !Number.isFinite(cotacao) || !Number.isFinite(teto)) return null
  return (cotacao - teto) / teto
}

/** "-12,3%" / "25,0%" / "0,0%". O mesmo formato da linha inline do PR 162. */
export function formatarDiferencaPct(fracao: number): string {
  return `${(fracao * 100).toFixed(1).replace('.', ',')}%`
}

/** A linha neutra, ou null quando a conta não fecha. */
export function linhaDiferencaPrecoTeto(cotacao: number, teto: number): string | null {
  const x = diferencaSobreTeto(cotacao, teto)
  if (x == null) return null
  return `${FRASE_DIFERENCA_PRECO_TETO}: ${formatarDiferencaPct(x)}.`
}

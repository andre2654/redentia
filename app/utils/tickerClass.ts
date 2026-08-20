/**
 * Classificação de símbolo por FORMATO — o único lugar do front com essas
 * regexes (antes duplicadas página × composable, "manter em sincronia").
 *
 * Três formas:
 *  - 'b3'   → PETR4, MXRF11, AAPL34 (letra inicial + 5-6 chars com dígito
 *             no fim). Classe resolvida: ativo B3.
 *  - 'flex' → AAPL, BTC, BRK-B (1-6 letras, hífen de classe opcional).
 *             O formato NÃO decide a classe: AAPL é ação americana, BTC é
 *             cripto e AMP é os dois (Ameriprise E token). Quem decide é o
 *             DADO — o useAcao sonda /tickers/{t} (universo US semeado no
 *             plano US0) e cai pra cripto no 404. Precedência tickers >
 *             cripto é deliberada: plataforma de investimentos, a ação ganha.
 *  - 'invalid' → resto (404 antes de qualquer fetch).
 */
export const B3_TICKER_RE = /^[A-Z][A-Z0-9]{3}\d{1,2}$/
export const FLEX_SYMBOL_RE = /^[A-Z]{1,6}(-[A-Z])?$/

export type SymbolShape = 'b3' | 'flex' | 'invalid'

export function symbolShape(symbol: string): SymbolShape {
  const s = symbol.toUpperCase()
  if (B3_TICKER_RE.test(s)) return 'b3'
  if (FLEX_SYMBOL_RE.test(s)) return 'flex'
  return 'invalid'
}

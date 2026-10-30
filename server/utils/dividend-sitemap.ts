/**
 * Quais linhas de GET /dividends/tickers viram URL de /dividendos/{TICKER}.
 *
 * A página responde 200 para STOCK, REIT e BDR com símbolo B3 válido e
 * histórico de proventos (conferido em 30/10/2026: AAPL34 e ASML34 saem 200
 * com yield e tabela). Símbolo que a rota rejeita (MRSA3B) fica de fora:
 * seria 404 antes do fetch. ETF e papel americano não estão nesse endpoint.
 */
import { symbolShape } from '../../app/utils/tickerClass.ts'

export const TIPOS_DIVIDENDO_SITEMAP = new Set(['STOCK', 'REIT', 'BDR'])

export interface DividendTickerRow {
  ticker?: string | null
  type?: string | null
}

/** Tickers canônicos, em ordem alfabética, ou [] quando nada presta. */
export function tickersDePaginaDividendos(rows: readonly DividendTickerRow[]): string[] {
  const seen = new Set<string>()
  for (const row of rows) {
    const type = String(row.type ?? '').trim().toUpperCase()
    if (!TIPOS_DIVIDENDO_SITEMAP.has(type)) continue
    const ticker = String(row.ticker ?? '').trim().toUpperCase()
    if (symbolShape(ticker) !== 'b3') continue
    seen.add(ticker)
  }
  return [...seen].sort()
}

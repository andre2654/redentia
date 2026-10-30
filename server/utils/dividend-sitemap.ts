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
  last_payment_date?: string | null
  last_com_date?: string | null
  count_12m?: number | null
}

function isoDia(v: unknown): boolean {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)
}

/**
 * Sem data com, sem data de pagamento e sem provento em 12 meses: o endpoint
 * está dizendo que não há histórico. A página desse ticker não entra no sitemap.
 * Linha antiga, sem esses campos, não é filtrada: a ausência do sinal não é
 * prova de histórico vazio.
 */
export function semProventoNoHistorico(row: DividendTickerRow): boolean {
  const temSinal = 'last_payment_date' in row || 'last_com_date' in row || 'count_12m' in row
  if (!temSinal) return false
  if (isoDia(row.last_payment_date) || isoDia(row.last_com_date)) return false
  const n = Number(row.count_12m ?? 0)
  return !Number.isFinite(n) || n <= 0
}

/** Tickers canônicos, em ordem alfabética, ou [] quando nada presta. */
export function tickersDePaginaDividendos(rows: readonly DividendTickerRow[]): string[] {
  const seen = new Set<string>()
  for (const row of rows) {
    const type = String(row.type ?? '').trim().toUpperCase()
    if (!TIPOS_DIVIDENDO_SITEMAP.has(type)) continue
    const ticker = String(row.ticker ?? '').trim().toUpperCase()
    if (symbolShape(ticker) !== 'b3') continue
    if (semProventoNoHistorico(row)) continue
    seen.add(ticker)
  }
  return [...seen].sort()
}

/** Histórico vazio fica fora do índice, e os links da página continuam seguíveis. */
export function robotsDeDividendos(temHistorico: boolean): 'noindex, follow' | undefined {
  return temHistorico ? undefined : 'noindex, follow'
}

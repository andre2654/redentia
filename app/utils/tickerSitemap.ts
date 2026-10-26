/**
 * Quais linhas de /tickers-full viram URL de /asset no sitemap.
 *
 * A página /asset/{T} responde 200 para STOCK, REIT, BDR e ETF vivos. Alias
 * (EMBR3 → EMBJ3) responde 301, símbolo inválido responde 404, deslistado
 * responde 410 e não vem nesta lista. US_STOCK/US_ETF ficam de fora: a rota
 * existe, mas não é o universo B3 que o sitemap de ativos declara.
 */
import { symbolShape } from './tickerClass.ts'

export const TIPOS_PAGINA_ATIVO = new Set(['STOCK', 'REIT', 'BDR', 'ETF'])

export interface TickerSitemapRow {
  ticker?: string | null
  type?: string | null
  alias_of?: string | null
}

/** Ticker canônico (maiúsculo) ou null quando a URL não seria um 200 estável. */
export function tickerDePaginaAtivo(row: TickerSitemapRow): string | null {
  if (row.alias_of) return null
  const ticker = String(row.ticker ?? '').trim().toUpperCase()
  if (!ticker || symbolShape(ticker) !== 'b3') return null
  if (!TIPOS_PAGINA_ATIVO.has(String(row.type ?? ''))) return null
  return ticker
}

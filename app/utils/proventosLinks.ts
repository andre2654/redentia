/**
 * Links internos de /asset/{TICKER} para as páginas de proventos do ticker.
 *
 * - /dividendos/{TICKER}: o ticker é pagador em GET /api/dividends/tickers
 *   (mesma régua do sitemap, server/utils/dividend-sitemap.ts) ou o /asset já
 *   tem barras de proventos. Tipos com página: ação, FII e BDR.
 * - /quanto-rende/{TICKER}: só com renda (não amortização) em 12 meses, a
 *   régua do 404 da própria página.
 * Puro, sem fetch, para teste.
 */
import { symbolShape } from './tickerClass.ts'

export const KINDS_COM_PAGINA_DE_PROVENTOS = new Set(['stock', 'fii', 'bdr'])

export interface ProventosLinksInput {
  ticker: string
  kind: string
  /** true quando GET /api/dividends/tickers lista o ticker como pagador */
  pagador: boolean
  /** barras de proventos no /asset */
  barras: number
  /** soma de renda em 12 meses (sem amortização) */
  renda12: number
}

export function hrefsDeProventos(i: ProventosLinksInput): { dividendos: string | null; quantoRende: string | null } {
  const ticker = String(i.ticker ?? '').trim().toUpperCase()
  if (!KINDS_COM_PAGINA_DE_PROVENTOS.has(i.kind) || symbolShape(ticker) !== 'b3') {
    return { dividendos: null, quantoRende: null }
  }
  const temDividendos = i.pagador || i.barras > 0
  return {
    dividendos: temDividendos ? `/dividendos/${ticker}` : null,
    quantoRende: temDividendos && i.renda12 > 0 ? `/quanto-rende/${ticker}` : null,
  }
}

/** Soma os links de proventos ao "Veja também", sem duplicar. */
export function relacionadosComProventos(
  links: readonly { href: string; label: string }[],
  hrefs: { dividendos: string | null; quantoRende: string | null },
  ticker: string,
): { href: string; label: string }[] {
  const out = [...links]
  const tem = (h: string) => out.some((l) => l.href === h)
  if (hrefs.dividendos && !tem(hrefs.dividendos)) out.push({ href: hrefs.dividendos, label: `Dividendos de ${ticker}` })
  if (hrefs.quantoRende && !tem(hrefs.quantoRende)) out.push({ href: hrefs.quantoRende, label: `Quanto rende ${ticker}` })
  return out
}

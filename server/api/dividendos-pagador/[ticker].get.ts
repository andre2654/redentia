/**
 * GET /api/dividendos-pagador/{TICKER} → { pagador: boolean }
 * true quando GET /dividends/tickers lista o ticker (régua do sitemap de
 * /dividendos). Usado pelo /asset para o link interno. Falha → false.
 */
export default defineEventHandler(async (event) => {
  const ticker = String(getRouterParam(event, 'ticker') ?? '').trim().toUpperCase()
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
  const lista = await fetchDividendPayers().catch(() => [] as string[])
  return { pagador: lista.includes(ticker) }
})

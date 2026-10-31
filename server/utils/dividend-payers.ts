/**
 * Conjunto de pagadores de GET /dividends/tickers, com a régua do sitemap de
 * /dividendos (tickersDePaginaDividendos). Cache de 1 h; falha não grava.
 */
import type { DividendTickerRow } from './dividend-sitemap.ts'
import { tickersDePaginaDividendos } from './dividend-sitemap.ts'

function base(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}

export const fetchDividendPayers = defineCachedFunction(
  async (): Promise<string[]> => {
    const res = await $fetch<{ data?: DividendTickerRow[] }>('/dividends/tickers', { baseURL: base(), timeout: 15_000 })
    return tickersDePaginaDividendos(Array.isArray(res?.data) ? res.data : [])
  },
  {
    name: 'dividend-payers-v1',
    maxAge: 3600,
    swr: true,
    getKey: () => 'all',
    validate: (entry) => Array.isArray(entry.value) && entry.value.length > 0,
  },
)

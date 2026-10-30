/**
 * Régua do sitemap de /dividendos/{TICKER}: o endpoint em massa entra, o
 * símbolo que a rota 404a fica de fora, e BDR entra porque a página existe.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tickersDePaginaDividendos } from '../server/utils/dividend-sitemap.ts'

test('pagadores STOCK, REIT e BDR entram; símbolo inválido e outro tipo ficam de fora', () => {
  const tickers = tickersDePaginaDividendos([
    { ticker: 'petr4', type: 'STOCK' },
    { ticker: 'HGLG11', type: 'REIT' },
    { ticker: 'AAPL34', type: 'BDR' },
    { ticker: 'BIEF39', type: 'BDR' },
    { ticker: 'MRSA3B', type: 'STOCK' },
    { ticker: 'BOVA11', type: 'ETF' },
    { ticker: 'AAPL', type: 'US_STOCK' },
    { ticker: '', type: 'STOCK' },
    { ticker: 'VALE3', type: 'STOCK' },
    { ticker: 'VALE3', type: 'STOCK' },
  ])
  assert.deepEqual(tickers, ['AAPL34', 'BIEF39', 'HGLG11', 'PETR4', 'VALE3'])
})

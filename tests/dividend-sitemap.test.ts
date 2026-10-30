/**
 * Régua do sitemap de /dividendos/{TICKER}: o endpoint em massa entra, o
 * símbolo que a rota 404a fica de fora, e BDR entra porque a página existe.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { tickersDePaginaDividendos } from '../server/utils/dividend-sitemap.ts'
import { robotsDeDividendos } from '../app/utils/dividendosRobots.ts'

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

test('ticker sem provento no histórico fica fora do sitemap', () => {
  const tickers = tickersDePaginaDividendos([
    { ticker: 'PETR4', type: 'STOCK', last_payment_date: '2026-11-23', last_com_date: '2026-08-21', count_12m: 8 },
    { ticker: 'ESTR4', type: 'STOCK', last_payment_date: null, last_com_date: '1994-05-17', count_12m: 0 },
    { ticker: 'VAZIO3', type: 'STOCK', last_payment_date: null, last_com_date: null, count_12m: 0 },
    { ticker: 'ADBE34', type: 'BDR', last_payment_date: null, last_com_date: null, count_12m: 0 },
  ])
  assert.deepEqual(tickers, ['ESTR4', 'PETR4'])
})

test('página sem histórico pede noindex e mantém follow', () => {
  assert.equal(robotsDeDividendos(false), 'noindex, follow')
  assert.equal(robotsDeDividendos(true), undefined)
  const vue = readFileSync(new URL('../app/pages/dividendos/[ticker].vue', import.meta.url), 'utf8')
  assert.match(vue, /robots:\s*robotsDeDividendos\(div\.value\.temHistorico\)/)
  const erro = readFileSync(new URL('../app/error.vue', import.meta.url), 'utf8')
  assert.match(erro, /noindex, follow/)
})

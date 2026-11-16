/**
 * Régua do sitemap de /dividendos/{TICKER}: o endpoint em massa entra, o
 * símbolo que a rota 404a fica de fora, e BDR entra porque a página existe.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { tickersDePaginaDividendos } from '../server/utils/dividend-sitemap.ts'
import { robotsDeDividendos } from '../app/utils/dividendosRobots.ts'
import { semPrecoTetoPorTicker } from '../server/utils/sitemap-cache.ts'
import { grupoEstaCompleto, paginasDoGrupo, urlsetXml } from '../server/utils/sitemap-xml.ts'

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

test('sitemap de dividendos inclui o conjunto inteiro e exclui preço teto por ticker', () => {
  const rows = [
    { ticker: 'PETR4', type: 'STOCK', last_payment_date: '2026-11-21', last_com_date: '2026-11-13', count_12m: 4 },
    { ticker: 'KNRI11', type: 'REIT', last_payment_date: '2026-11-16', last_com_date: '2026-10-30', count_12m: 12 },
    { ticker: 'WEGE3', type: 'STOCK', last_payment_date: '2026-08-15', last_com_date: '2026-08-01', count_12m: 2 },
    { ticker: 'AAPL34', type: 'BDR', last_payment_date: '2026-06-10', last_com_date: '2026-05-13', count_12m: 2 },
    { ticker: 'MRSA3B', type: 'STOCK', last_payment_date: '2026-01-01', count_12m: 1 },
    { ticker: 'BOVA11', type: 'ETF', last_payment_date: '2026-01-01', count_12m: 4 },
    { ticker: 'VAZIO3', type: 'STOCK', last_payment_date: null, last_com_date: null, count_12m: 0 },
  ]
  const tickers = tickersDePaginaDividendos(rows)
  assert.deepEqual(tickers, ['AAPL34', 'KNRI11', 'PETR4', 'WEGE3'])
  const sections = [
    {
      id: 'dividendos' as const,
      title: 'Dividendos',
      pages: tickers.map((ticker) => ({
        path: `/dividendos/${ticker}`,
        title: `Dividendos de ${ticker}`,
        lastmod: '2026-11-13',
      })),
    },
    {
      id: 'calculadoras' as const,
      title: 'Calculadoras',
      pages: [
        { path: '/calculadora/preco-teto', title: 'Preço teto' },
        { path: '/calculadora/preco-teto/bazin', title: 'Bazin' },
        { path: '/calculadora/preco-teto/PETR4', title: 'Preço teto PETR4', lastmod: '2026-11-13' },
      ],
    },
  ]
  const pages = paginasDoGrupo(sections, 'dividendos')
  assert.deepEqual(pages.map((p) => p.path), tickers.map((t) => `/dividendos/${t}`))
  const xml = semPrecoTetoPorTicker(urlsetXml('https://aportou.com.br', pages))
  for (const ticker of tickers) {
    assert.match(xml, new RegExp(`/dividendos/${ticker}<`))
  }
  assert.equal(xml.includes('/calculadora/preco-teto/'), false)
  assert.equal(xml.includes('KNRI11'), true)
  // KNRI11 não está nos 12 clássicos nem na demanda medida: a lista curta não basta.
  const curta = readFileSync(new URL('../app/content/seo/indexable-dividends.ts', import.meta.url), 'utf8')
  assert.equal(curta.includes('KNRI11'), false)
  assert.equal(grupoEstaCompleto('dividendos', tickers.length, { dividendos: true }), true)
  assert.equal(grupoEstaCompleto('dividendos', 59, { dividendos: false }), false)
  assert.equal(grupoEstaCompleto('ativos', 1350, { dividendos: false }), true)
  const gerador = readFileSync(new URL('../server/utils/site-pages.ts', import.meta.url), 'utf8')
  assert.match(gerador, /tickersDePaginaDividendos/)
  assert.match(gerador, /site-pages-dividends-v4/)
  assert.equal(gerador.includes('precoTetoTickerPages'), false)
})

test('página sem histórico pede noindex e mantém follow', () => {
  assert.equal(robotsDeDividendos(false), 'noindex, follow')
  assert.equal(robotsDeDividendos(true), undefined)
  const vue = readFileSync(new URL('../app/pages/dividendos/[ticker].vue', import.meta.url), 'utf8')
  assert.match(vue, /robots:\s*robotsDeDividendos\(div\.value\.temHistorico\)/)
  const erro = readFileSync(new URL('../app/error.vue', import.meta.url), 'utf8')
  assert.match(erro, /noindex, follow/)
})

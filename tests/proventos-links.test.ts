/**
 * Links de /asset/{TICKER} para /dividendos e /quanto-rende.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hrefsDeProventos, relacionadosComProventos } from '../app/utils/proventosLinks.ts'

test('pagador em /dividends/tickers ganha link para /dividendos mesmo sem barras', () => {
  assert.deepEqual(hrefsDeProventos({ ticker: 'petr4', kind: 'stock', pagador: true, barras: 0, renda12: 0 }),
    { dividendos: '/dividendos/PETR4', quantoRende: null })
})

test('com renda em 12 meses também ganha /quanto-rende', () => {
  assert.deepEqual(hrefsDeProventos({ ticker: 'HGLG11', kind: 'fii', pagador: true, barras: 3, renda12: 13.2 }),
    { dividendos: '/dividendos/HGLG11', quantoRende: '/quanto-rende/HGLG11' })
})

test('só amortização (renda 0) não leva a /quanto-rende', () => {
  assert.equal(hrefsDeProventos({ ticker: 'AAPL34', kind: 'bdr', pagador: true, barras: 2, renda12: 0 }).quantoRende, null)
})

test('não pagador, ETF, cripto e símbolo inválido ficam sem link', () => {
  const vazio = { dividendos: null, quantoRende: null }
  assert.deepEqual(hrefsDeProventos({ ticker: 'ESTR4', kind: 'stock', pagador: false, barras: 0, renda12: 0 }), vazio)
  assert.deepEqual(hrefsDeProventos({ ticker: 'BOVA11', kind: 'etf', pagador: true, barras: 4, renda12: 1 }), vazio)
  assert.deepEqual(hrefsDeProventos({ ticker: 'BTC', kind: 'crypto', pagador: true, barras: 0, renda12: 1 }), vazio)
  assert.deepEqual(hrefsDeProventos({ ticker: 'MRSA3B', kind: 'stock', pagador: true, barras: 1, renda12: 1 }), vazio)
})

test('Veja também soma os links sem duplicar', () => {
  const base = [{ href: '/setor/energia', label: 'Ranking do setor energia' }, { href: '/dividendos/PETR4', label: 'Dividendos de PETR4' }]
  const out = relacionadosComProventos(base, { dividendos: '/dividendos/PETR4', quantoRende: '/quanto-rende/PETR4' }, 'PETR4')
  assert.deepEqual(out.map((l) => l.href), ['/setor/energia', '/dividendos/PETR4', '/quanto-rende/PETR4'])
})

test('a página de ativo usa o endpoint de pagadores e passa os hrefs', () => {
  const vue = readFileSync(new URL('../app/pages/asset/[ticker].vue', import.meta.url), 'utf8')
  assert.match(vue, /\/api\/dividendos-pagador\//)
  assert.match(vue, /:dividendos-href="proventosHrefs\.dividendos"/)
  assert.match(vue, /<AcaoRelacionados :links="relacionados" \/>/)
  const api = readFileSync(new URL('../server/utils/dividend-payers.ts', import.meta.url), 'utf8')
  assert.match(api, /\/dividends\/tickers/)
  assert.match(api, /tickersDePaginaDividendos/)
})

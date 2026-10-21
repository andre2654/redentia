/**
 * Os pares do bloco "Outras empresas do setor" no fim do /asset: as maiores
 * ações do setor, uma classe por empresa, só entre os ativos do sitemap.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apiSlugDoSetor, paresDoSetor, type LinhaDoSetor } from '../app/utils/paresDoSetor.ts'

const l = (ticker: string, valorDeMercado: number | null, tipo = 'STOCK'): LinhaDoSetor => ({ ticker, nome: ticker, tipo, valorDeMercado })

// recorte real do setor financial-services em 20/10/2026 (valor em R$ bi)
const FINANCEIRO = [
  // a unit vem sem valor de mercado; as classes, com o da empresa
  l('RBRL11', null, 'REIT'), l('BPAC11', null), l('BPAC3', 304.6e9), l('BPAC5', 304.6e9),
  l('ITUB4', 549e9), l('ITUB3', 549e9), l('BBDC4', 211.8e9), l('BBDC3', 211.8e9),
  l('BBAS3', 137e9), l('B3SA3', 109.3e9), l('SANB11', null), l('SANB4', 104.5e9),
  l('BBSE3', 70e9), l('CXSE3', 50e9), l('VISA34', 3e12, 'BDR'), l('NADA3', 0),
]
const INDEXAVEIS = new Set(['BPAC11', 'BPAC3', 'ITUB4', 'BBDC4', 'BBAS3', 'B3SA3', 'SANB11', 'BBSE3', 'CXSE3', 'VISA34', 'NADA3', 'RBRL11'])

test('as maiores do setor, sem a própria empresa', () => {
  const pares = paresDoSetor(FINANCEIRO, 'ITUB4', INDEXAVEIS, new Set())
  assert.deepEqual(pares.map((p) => p.ticker), ['BPAC11', 'BBDC4', 'BBAS3', 'B3SA3', 'SANB11', 'BBSE3'])
})

test('o valor de mercado é da empresa: a unit sem valor entra pelo das outras classes', () => {
  const pares = paresDoSetor(FINANCEIRO, 'ITUB4', INDEXAVEIS, new Set())
  assert.equal(pares[0]?.ticker, 'BPAC11')
  assert.equal(pares[0]?.valorDeMercado, 304.6e9)
  assert.ok(pares.some((p) => p.ticker === 'SANB11'))
})

test('a outra classe da mesma empresa não é par', () => {
  const pares = paresDoSetor(FINANCEIRO, 'ITUB3', INDEXAVEIS, new Set(), 10)
  assert.ok(!pares.some((p) => p.ticker.startsWith('ITUB')))
})

test('uma classe por empresa: a preferida, senão unit, PN, ON', () => {
  const pares = paresDoSetor(FINANCEIRO, 'BBAS3', INDEXAVEIS, new Set(), 10)
  assert.equal(pares.filter((p) => p.ticker.startsWith('BPAC')).length, 1)
  assert.equal(pares.find((p) => p.ticker.startsWith('BPAC'))?.ticker, 'BPAC11')
  const usim = [l('USIM3', 9e9), l('USIM5', 9e9), l('USIM6', 9e9), l('VALE3', 300e9), l('GGBR4', 40e9)]
  const todas = new Set(usim.map((u) => u.ticker))
  assert.equal(paresDoSetor(usim, 'VALE3', todas, new Set())[1]?.ticker, 'USIM3')
  assert.equal(paresDoSetor(usim, 'VALE3', todas, new Set(['USIM5']))[1]?.ticker, 'USIM5')
})

test('fora: o que não é ação, não tem valor de mercado ou não está no sitemap', () => {
  const pares = paresDoSetor(FINANCEIRO, 'ITUB4', INDEXAVEIS, new Set(), 50)
  const tickers = pares.map((p) => p.ticker)
  assert.ok(!tickers.includes('VISA34'))
  assert.ok(!tickers.includes('RBRL11'))
  assert.ok(!tickers.includes('NADA3'))
  assert.ok(!tickers.includes('BPAC5'))
})

test('o setor do perfil vira o slug do backend', () => {
  assert.equal(apiSlugDoSetor('Financial Services'), 'financial-services')
  assert.equal(apiSlugDoSetor('Energy'), 'energy')
  assert.equal(apiSlugDoSetor(''), null)
  assert.equal(apiSlugDoSetor(null), null)
})

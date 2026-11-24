import { test } from 'node:test'
import assert from 'node:assert/strict'
import { direcao, montarResultado, reaisComSinal } from '../app/utils/resultadoDaCarteira.ts'

const pos = (ticker: string, qtd: number, pm: number | null, preco: number, classe = 'STOCK') =>
  ({ ticker, asset_class: classe, name: ticker, quantity: qtd, average_price: pm, current_price: preco, current_value: qtd * preco, sector: null, industry: null, institution_name: null, connection_status: null, dividend_yield: null })
const hoje = (linhas: [string, number, number][]) =>
  ({ as_of: '', price_dates: { today: null, previous: null }, totals: { value_now: 0, value_d1: 0, day_change_amount: null, day_change_pct: null }, flags: [],
    positions: linhas.map(([ticker, amt, pct]) => ({ ticker, name: ticker, logo: null, asset_class: 'STOCK', quantity: 1, price_now: 1, value_now: 1, day_change_amount: amt, day_change_pct: pct, pnl_pct: null, sector_key: null, flags: [] })) })

test('o ganho é o valor menos o custo, só de quem tem preço médio', () => {
  const r = montarResultado([pos('AAAA3', 100, 10, 12), pos('BBBB3', 50, 20, 15), pos('TESOURO', 1, null, 1000, 'TREASURY')] as never, null)!
  assert.equal(r.ganho, 200 - 250)
  assert.equal(r.custo, 2000)
  assert.equal(Math.round(r.ganhoPct! * 100) / 100, -2.5)
  assert.equal(r.comCusto, 2)
  assert.equal(Math.round(r.cobertura * 1000) / 1000, Math.round((1950 / 2950) * 1000) / 1000)
  assert.equal(r.linhas[0]!.ticker, 'AAAA3', 'a lista vem da maior posição para a menor')
  assert.equal(r.linhas.find((l) => l.ticker === 'TESOURO')!.ganho, null)
})

test('sem preço médio em nenhum ativo, não inventa ganho', () => {
  const r = montarResultado([pos('AAAA3', 100, null, 12)] as never, null)!
  assert.equal(r.ganho, null)
  assert.equal(r.ganhoPct, null)
})

test('quem subiu e quem caiu vem do dia de cada papel, em ordem, sem o que não tem preço do dia', () => {
  const r = montarResultado(
    ['A', 'B', 'C', 'D', 'E', 'F'].map((t) => pos(t, 10, 10, 10)) as never,
    hoje([['A', 5, 1.2], ['B', -9, -3.1], ['C', 2, 0.4], ['D', -1, -0.2], ['E', 8, 2.5]]) as never,
    2,
  )!
  assert.deepEqual(r.sobem.map((l) => l.ticker), ['E', 'A'])
  assert.deepEqual(r.caem.map((l) => l.ticker), ['B', 'D'])
  assert.equal(r.nSobem, 3)
  assert.equal(r.nCaem, 2)
  assert.equal(r.linhas.find((l) => l.ticker === 'F')!.diaPct, null)
})

test('carteira vazia devolve null', () => {
  assert.equal(montarResultado([], null), null)
  assert.equal(montarResultado(null, null), null)
})

test('os textos levam o sinal e o menos tipográfico', () => {
  assert.equal(reaisComSinal(1234.4), '+R$ 1.234')
  assert.equal(reaisComSinal(-87.6), '−R$ 88')
  assert.equal(direcao(0.001), 'flat')
  assert.equal(direcao(-2), 'down')
})

/**
 * Dinheiro compacto da cadeia de fornecimento: a Petrobras informa em real e o
 * 20-F da Vale em dólar; o mesmo formato serve os dois (fmtCompactBrl continua
 * igual para quem já usava).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fmtCompactBrl, fmtCompactMoney } from '../app/utils/rankings.ts'

test('real e dólar no mesmo compacto', () => {
  assert.equal(fmtCompactMoney(16_151_000_000, 'BRL'), 'R$ 16,2 bi')
  assert.equal(fmtCompactMoney(459_000_000, 'USD'), 'US$ 459,0 mi')
  assert.equal(fmtCompactMoney(150_000_000, null), 'R$ 150,0 mi')
})

test('moeda que a gente não sabe escrever não vira real', () => {
  assert.equal(fmtCompactMoney(1_000_000, 'EUR'), '—')
})

test('fmtCompactBrl segue igual', () => {
  assert.equal(fmtCompactBrl(3_500_000_000), 'R$ 3,5 bi')
  assert.equal(fmtCompactBrl(null), '—')
})

/**
 * Tabela de proventos de /dividendos/{TICKER} a 390 px: cartões, sem rolagem lateral.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const card = readFileSync(new URL('../app/components/calc/CalcTableCard.vue', import.meta.url), 'utf8')
const page = readFileSync(new URL('../app/pages/dividendos/[ticker].vue', import.meta.url), 'utf8')

test('/dividendos liga os cartões no mobile', () => {
  assert.match(page, /<CalcTableCard[\s\S]*?cards-mobile[\s\S]*?\/>/)
})

test('até 600 px a tabela some e os cartões aparecem', () => {
  assert.match(card, /@media \(max-width: 600px\)[\s\S]*\.ctc--cards \.ctc__scroll \{ display: none; \}/)
  assert.match(card, /\.ctc--cards \.ctc__cards \{[\s\S]*?display: flex/)
  assert.match(card, /\.ctc__cards \{ display: none; \}/)
})

test('cada cartão leva o rótulo da coluna acima do valor', () => {
  assert.match(card, /<dt>\{\{ columns\[j \+ 1\] \}\}<\/dt>/)
  assert.match(card, /overflow-wrap: anywhere/)
})

/**
 * Os termos do fechamento da IA com explicação para quem está começando
 * (31/10/2026): cada termo marcado uma vez, só palavra inteira.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { marcarTermos } from '../app/utils/termosDoDia.ts'

test('marca os termos do fechamento, cada um uma vez', () => {
  const p = marcarTermos('Vale subiu 3,28%; Petrobras ON ganhou 1,61% com o Brent a US$ 113. O Brent subiu.')
  const termos = p.filter((x) => 'termo' in x).map((x) => (x as { termo: string }).termo)
  assert.deepEqual(termos, ['on-pn', 'brent'])
  assert.equal(p.map((x) => x.texto).join(''), 'Vale subiu 3,28%; Petrobras ON ganhou 1,61% com o Brent a US$ 113. O Brent subiu.')
})

test('só palavra inteira e com a página do glossário quando existe', () => {
  // "ONTEM" e "PNG" não são ação ON/PN
  assert.equal(marcarTermos('ONTEM o PNG').some((x) => 'termo' in x), false)
  const [, ibov] = marcarTermos('Quinta queda: Ibovespa a 167.921 pontos e 58 papéis no vermelho.')
  assert.deepEqual(ibov, { texto: 'Ibovespa', termo: 'ibovespa', slug: 'ibovespa' })
  const papeis = marcarTermos('58 papéis no vermelho').find((x) => 'termo' in x)
  assert.deepEqual(papeis, { texto: 'papéis', termo: 'papeis', slug: null })
  assert.ok(marcarTermos('BTG a −4,66% após rebaixamento.').some((x) => 'termo' in x && x.termo === 'rebaixamento'))
})

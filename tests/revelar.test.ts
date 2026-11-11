/**
 * A entrada ao rolar (v-revelar, 11/11/2026, robustez): as contas puras que
 * decidem SE um bloco anima e QUANDO cada filho entra. A regra que não pode se
 * desfazer: o que já está na tela (ou acima dela) nunca anima, e quem pede
 * menos movimento não vê animação nenhuma.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { atrasoDoFilho, deveRevelar, REVELACAO } from '../app/utils/revelar.ts'

test('só anima o que nasceu abaixo da dobra', () => {
  assert.equal(deveRevelar(1200, 900, false), true)
  assert.equal(deveRevelar(900, 900, false), true) // o topo exatamente na borda de baixo: ainda não aparece
  assert.equal(deveRevelar(899, 900, false), false) // um pixel na tela: fica como está
  assert.equal(deveRevelar(120, 900, false), false)
  assert.equal(deveRevelar(-400, 900, false), false) // já passou (rolou para baixo e voltou)
})

test('movimento reduzido: nada anima, nem abaixo da dobra', () => {
  assert.equal(deveRevelar(5000, 900, true), false)
})

test('medida estranha não anima (janela sem altura, topo indefinido)', () => {
  assert.equal(deveRevelar(Number.NaN, 900, false), false)
  assert.equal(deveRevelar(1200, 0, false), false)
  assert.equal(deveRevelar(Number.POSITIVE_INFINITY, 900, false), false)
})

test('a cascata dos filhos: passo a cada um, parando no 8º', () => {
  assert.deepEqual([0, 1, 2, 7].map((i) => atrasoDoFilho(i, 60)), [0, 60, 120, 420])
  // do 8º em diante, todos entram junto com ele
  assert.equal(atrasoDoFilho(8, 60), 420)
  assert.equal(atrasoDoFilho(30, 60), 420)
  assert.equal(atrasoDoFilho(3), 3 * REVELACAO.passo)
  assert.equal(atrasoDoFilho(-1, 60), 0)
  assert.equal(atrasoDoFilho(2, Number.NaN), 0)
})

test('os números da entrada são os do roteiro (720ms, a curva de saída, 14px, 20% da tela)', () => {
  assert.equal(REVELACAO.duracao, 720)
  assert.equal(REVELACAO.curva, 'cubic-bezier(.16, 1, .3, 1)')
  assert.equal(REVELACAO.y, 14)
  assert.equal(REVELACAO.margem, '0px 0px 20% 0px')
  // a curva escrita é a mesma do token (var() não vale numa Web Animation)
  const tokens = readFileSync(new URL('../app/assets/css/tokens.css', import.meta.url), 'utf8')
  assert.match(tokens, /--nu-ease-saida: cubic-bezier\(\.16, 1, \.3, 1\)/)
  assert.match(tokens, /--nu-dur-entrada: 720ms/)
})

test('a diretiva não esconde nada no servidor e anima com fill backwards', () => {
  const plugin = readFileSync(new URL('../app/plugins/revelar.ts', import.meta.url), 'utf8')
  assert.match(plugin, /getSSRProps: \(\) => \(\{\}\)/)
  assert.match(plugin, /fill: 'backwards'/)
  assert.match(plugin, /prefers-reduced-motion: reduce/)
  assert.match(plugin, /unobserve\(e\.target\)/)
})

test('o atraso pedido soma ao da cascata (escalona a fileira) e o inválido vira zero', async () => {
  const { atrasoDe } = await import('../app/utils/revelar.ts')
  assert.equal(atrasoDe(0), 0)
  assert.equal(atrasoDe(2), 120)
  assert.equal(atrasoDe(0, { atraso: 120 }), 120)
  assert.equal(atrasoDe(1, { atraso: 120, passo: 40 }), 160)
  assert.equal(atrasoDe(0, { atraso: -50 }), 0)
  assert.equal(atrasoDe(0, { atraso: Number.NaN }), 0)
})

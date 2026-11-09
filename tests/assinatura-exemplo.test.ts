/**
 * O cartão de exemplo do /assinar (31/10/2026): os caminhos sorteados têm a
 * forma do lequeDeExemplo (os mesmos quantis no fim) e saem iguais em todo
 * lugar (semente fixa); o nascimento acelera e cobre todos os caminhos.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { caminhosDeExemplo, fimDoCaminho, lequeDeExemplo, nascimentosDoExemplo } from '../app/utils/futuro.ts'

test('os caminhos de exemplo saem iguais com a mesma semente', () => {
  const a = caminhosDeExemplo(300)
  const b = caminhosDeExemplo(300)
  assert.deepEqual(Array.from(a.valores.slice(0, 200)), Array.from(b.valores.slice(0, 200)))
  assert.equal(a.pontos, 61)
  assert.equal(a.valores.length, 300 * 61)
})

test('começam em 100 e vêm ordenados pelo fim, como os do motor', () => {
  const c = caminhosDeExemplo(500)
  for (let i = 0; i < c.n; i++) assert.equal(c.valores[i * c.pontos], 100)
  for (let i = 1; i < c.n; i++) assert.ok(fimDoCaminho(c, i) >= fimDoCaminho(c, i - 1))
})

test('o fim dos 2.000 tem os quantis do leque de exemplo (±6%)', () => {
  const c = caminhosDeExemplo()
  const fim = lequeDeExemplo().end
  const q = (p: number) => fimDoCaminho(c, Math.round(p * (c.n - 1)))
  for (const [p, alvo] of [[0.1, fim.p10], [0.5, fim.p50], [0.9, fim.p90]] as const) {
    assert.ok(Math.abs(q(p) / alvo - 1) < 0.06, `p${p * 100}: ${q(p)} vs ${alvo}`)
  }
})

test('o nascimento acelera e todos nascem entre 0 e 1', () => {
  const n = 2000
  const quando = nascimentosDoExemplo(n)
  const ate = (f: number) => quando.filter((x) => x <= f).length
  assert.equal(ate(1), n)
  assert.ok(ate(0.1) <= 5, `até 10% do tempo: ${ate(0.1)}`)
  assert.ok(ate(0.5) < n * 0.2, `até a metade: ${ate(0.5)}`)
  assert.equal(new Set(Array.from(quando)).size, n)
})

/**
 * "Leitura da Redentia" do /benchmark-ia (número grande + uma linha): as frases
 * saem da edição. Este teste trava as contas e as viradas de sentido, para a
 * leitura não ficar falsa na edição seguinte.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leituras, umaACada } from '../app/content/benchmark-ia/leituras.ts'

const inventa = [2, 2, 1, 1, 0, 2, 2, 2, 2, 21].map((v, i) => ({ nome: `M${i}`, inventou: v }))

test('Inventa da Edição 01: 3,5% na média vira "1 em 29"', () => {
  assert.equal(umaACada(3.5), 29)
  assert.deepEqual(leituras({ inventa }).inventa, { numero: '1 em 29', frase: 'respostas é falsa. E se for nela que você perde tudo?' })
})

test('ninguém inventou: o número é 0', () => {
  assert.equal(leituras({ inventa: inventa.map((r) => ({ ...r, inventou: 0 })) }).inventa!.numero, '0')
})

test('Concorda: conta quantas IAs aprovaram plano ruim', () => {
  const zero = leituras({ amem: [{ nome: 'A', concordou: 0 }, { nome: 'B', concordou: 0 }] }).amem!
  assert.deepEqual(zero, { numero: '0 de 2', frase: 'IAs aprovaram o plano ruim.' })
  assert.equal(leituras({ amem: [{ nome: 'A', concordou: 3 }, { nome: 'B', concordou: 0 }] }).amem!.numero, '1 de 2')
})

test('Tributário: melhor a pior, arredondado; sem diferença, sem leitura', () => {
  assert.equal(leituras({ leao: [{ nome: 'A', nota: 100 }, { nome: 'B', nota: 38.9 }] }).leao!.numero, '100 a 39')
  assert.equal(leituras({ leao: [{ nome: 'A', nota: 90 }, { nome: 'B', nota: 90 }] }).leao, undefined)
})

test('Custo: quantas vezes mais caro, contra o mais barato do topo', () => {
  const t = leituras({ custo: [
    { nome: 'Gemini 3.8 Flash', custo: 0.7, nota: 96.3, rank: 3 },
    { nome: 'Claude Fable 5.1', custo: 12.38, nota: 98.2, rank: 1 },
    { nome: 'Kimi K2', custo: 0.78, nota: 66.6, rank: 10 },
  ] }).custo!
  assert.deepEqual(t, { numero: '18×', frase: 'mais caro: Claude Fable 5.1 contra Gemini 3.8 Flash, com nota quase igual.' })
  assert.equal(leituras({ custo: [{ nome: 'A', custo: 1, nota: 90, rank: 1 }, { nome: 'B', custo: 1.5, nota: 90, rank: 2 }] }).custo, undefined)
})

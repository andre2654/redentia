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
  const { numero, frase } = leituras({ inventa }).inventa!
  assert.deepEqual({ numero, frase }, { numero: '1 em 29', frase: 'respostas é falsa. E se for nela que você perde tudo?' })
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
  assert.deepEqual({ numero: t.numero, frase: t.frase }, { numero: '18×', frase: 'mais caro: Claude Fable 5.1 contra Gemini 3.8 Flash, com nota quase igual.' })
  assert.equal(t.detalhe, 'Claude Fable 5.1: US$ 12,38 por mil respostas, nota 98,2. Gemini 3.8 Flash: US$ 0,70, nota 96,3.')
  assert.equal(leituras({ custo: [{ nome: 'A', custo: 1, nota: 90, rank: 1 }, { nome: 'B', custo: 1.5, nota: 90, rank: 2 }] }).custo, undefined)
})

test('detalhe: o pior caso do Inventa, quem ficou no muro e os custos', () => {
  const inv = leituras({ inventa: [{ nome: 'A', inventou: 1 }, { nome: 'Kimi K2', inventou: 21 }] }).inventa!
  assert.equal(inv.detalhe, 'Na média das IAs, 11,0% das respostas foram inventadas. O pior caso foi o Kimi K2: 21,0%, 1 em 5.')
  const am = leituras({ amem: [{ nome: 'DeepSeek V4 Pro', concordou: 0, muro: 8 }, { nome: 'B', concordou: 0, muro: 0 }] }).amem!
  assert.equal(am.detalhe, 'O mais perto de escorregar foi o DeepSeek V4 Pro, em cima do muro em 8,0% dos casos.')
  const le = leituras({ leao: [{ nome: 'Claude Opus 5.5', nota: 100 }, { nome: 'GPT-6.1 Sol', nota: 100 }, { nome: 'Kimi K2', nota: 38.9 }] }).leao!
  assert.equal(le.detalhe, 'Nota 100: Claude Opus 5.5 e GPT-6.1 Sol. Nota 39: Kimi K2.')
})


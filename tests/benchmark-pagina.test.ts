/**
 * As contas do /benchmark-ia "A noite" (03/11/2026): a fronteira do custo, o
 * placar parcial da Previsão e o texto que o cursor do chat anexa. Os números
 * são os da Edição 01, para o teste quebrar se a conta virar.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contextoDoRanking, fronteiraDeCusto, mediaDe, ultimoComDado } from '../app/utils/benchPagina.ts'

test('fronteira de custo da Edição 01: DeepSeek, Gemini Flash, GPT e Opus', () => {
  const pts = [
    { id: 'gpt', cost: 2.02, nota: 99.2 }, { id: 'fable', cost: 12.38, nota: 98.2 }, { id: 'opus', cost: 7.35, nota: 99.6 },
    { id: 'argon', cost: 2.24, nota: 96.1 }, { id: 'grok', cost: 5.37, nota: 92 }, { id: 'qwen', cost: 3.27, nota: 91.8 },
    { id: 'muse', cost: 3.82, nota: 92.8 }, { id: 'deepseek', cost: 0.66, nota: 75.8 }, { id: 'flash', cost: 0.7, nota: 96.3 },
    { id: 'kimi', cost: 0.78, nota: 66.6 },
  ]
  assert.deepEqual(fronteiraDeCusto(pts), ['deepseek', 'flash', 'gpt', 'opus'])
})

test('série parcial: o último valor com dado', () => {
  assert.equal(ultimoComDado([0, 0.12, -0.3, null, null]), -0.3)
  assert.equal(ultimoComDado([null, null]), null)
  assert.equal(mediaDe([]), null)
  assert.equal(mediaDe([100, 90]), 95)
})

test('o texto do cursor do chat: título e uma linha por modelo', () => {
  assert.equal(
    contextoDoRanking('Placar geral', [{ name: 'Opus', rank: 1, valor: '99,6' }, { name: 'Kimi', rank: 10, valor: '66,6' }]),
    'Placar geral\n1º Opus: 99,6\n10º Kimi: 66,6',
  )
  assert.equal(contextoDoRanking('Custo', [{ name: 'Kimi', rank: 1, valor: 'US$ 0,78' }], false), 'Custo\nKimi: US$ 0,78')
})

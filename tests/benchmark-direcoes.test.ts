/**
 * As contas das três direções do /benchmark-ia (protótipo de 03/11/2026,
 * ?bench=1|2|3): a tabela que junta os índices por modelo e ordena, a
 * fronteira do custo e o texto que o cursor do chat anexa. Os números são os
 * da Edição 01, para o teste quebrar se a conta virar.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contextoDoRanking, fronteiraDeCusto, mediaDe, melhorDaColuna, ordenarPerfil, perfilDosModelos, ultimoComDado } from '../app/utils/benchDirecoes.ts'

const g = (id: string, value: number, rank: number) => ({ id, name: id.toUpperCase(), provider: 'P', value, lo: value - 1, hi: value + 1, rank, tied: false })
const entrada = {
  geral: [g('opus', 99.6, 1), g('gpt', 99.2, 1), g('kimi', 66.6, 10)],
  inventa: [{ id: 'opus', value: 98.7, parts: [98, 1, 1], rank: 1 }, { id: 'kimi', value: 70.9, parts: [60, 19, 21], rank: 9 }],
  // o Fable não completou o Concorda: o modelo fica sem nota na coluna, não some
  amem: [{ id: 'opus', value: 100, rank: 1 }, { id: 'kimi', value: 99.4, rank: 1 }],
  golpe: [{ id: 'opus', value: 100 }, { id: 'gpt', value: 100 }, { id: 'kimi', value: 90 }],
  leao: [{ id: 'gpt', value: 100 }, { id: 'kimi', value: 38.9 }],
  longo: [{ id: 'gpt', value: 16.4, rank: 1 }, { id: 'opus', value: 15.6, rank: 2 }],
  custo: [{ id: 'kimi', name: 'KIMI', provider: 'P', value: 0.78 }, { id: 'gpt', name: 'GPT', provider: 'P', value: 2.02 }, { id: 'opus', name: 'OPUS', provider: 'P', value: 7.35 }],
}

test('perfil junta os índices por modelo, na ordem do placar geral', () => {
  const p = perfilDosModelos(entrada)
  assert.deepEqual(p.map((r) => r.id), ['opus', 'gpt', 'kimi'])
  assert.equal(p[2]!.inventou, 21)
  assert.equal(p[1]!.inventa, null)
  assert.equal(p[0]!.custo, 7.35)
  assert.deepEqual(p[2]!.ranks, { geral: 10, inventa: 9, amem: 1, custo: 1 })
})

test('Carteira em formação não dá posição', () => {
  const p = perfilDosModelos({ ...entrada, longoSemPosicao: true })
  assert.equal(p[1]!.ranks.longo, undefined)
  assert.equal(p[1]!.longo, 16.4)
})

test('ordenar: o melhor primeiro, custo do mais barato, sem nota no fim', () => {
  const p = perfilDosModelos(entrada)
  assert.deepEqual(ordenarPerfil(p, 'custo').map((r) => r.id), ['kimi', 'gpt', 'opus'])
  assert.deepEqual(ordenarPerfil(p, 'inventa').map((r) => r.id), ['opus', 'kimi', 'gpt'])
  // empate na coluna (100 e 100) desempata pelo placar geral
  assert.deepEqual(ordenarPerfil(p, 'golpe').map((r) => r.id), ['opus', 'gpt', 'kimi'])
  assert.equal(melhorDaColuna(p, 'custo'), 0.78)
  assert.equal(melhorDaColuna(p, 'leao'), 100)
})

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

/**
 * "Leitura da Redentia" do /benchmark-ia: as frases saem da edição. Este teste
 * trava as contas (uma a cada N) e as viradas de sentido (ninguém inventou, um
 * só no topo), para a frase não ficar falsa na edição seguinte.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leituras, umaACada } from '../app/content/benchmark-ia/leituras.ts'

const inventa = [
  { nome: 'GPT-6.1 Sol', inventou: 2 }, { nome: 'Claude Fable 5.1', inventou: 2 }, { nome: 'Claude Opus 5.5', inventou: 1 },
  { nome: 'Gemini 4 Argon', inventou: 1 }, { nome: 'Grok 4.7', inventou: 0 }, { nome: 'Qwen 3.8 Max', inventou: 2 },
  { nome: 'Muse Spark 1.3', inventou: 2 }, { nome: 'DeepSeek V4 Pro', inventou: 2 }, { nome: 'Gemini 3.8 Flash', inventou: 2 },
  { nome: 'Kimi K2', inventou: 21 },
]

test('Inventa da Edição 01: 3,5% na média, uma a cada 29; o pior, uma a cada 5', () => {
  assert.equal(umaACada(3.5), 29)
  const t = leituras({ inventa }).inventa!
  assert.match(t, /^\*\*3,5%\*\* é pouco, né\? Bem\.\.\. a cada \*\*29\*\* respostas, uma vai ser falsa\. E se nessa falsa você perder tudo\?/)
  assert.match(t, /o Kimi K2 inventou em \*\*21,0%\*\* das respostas, uma a cada \*\*5\*\*/)
})

test('ninguém inventou: a frase muda, sem "uma a cada"', () => {
  const t = leituras({ inventa: inventa.map((r) => ({ ...r, inventou: 0 })) }).inventa!
  assert.doesNotMatch(t, /a cada/)
})

test('Concorda: zero amém cita quem ficou no muro; com sim, cita a média e o pior', () => {
  const zero = leituras({ amem: [{ nome: 'DeepSeek V4 Pro', concordou: 0, muro: 8 }, { nome: 'GPT-6.1 Sol', concordou: 0, muro: 0 }] }).amem!
  assert.match(zero, /^Zero amém/)
  assert.match(zero, /DeepSeek V4 Pro, que ficou em cima do muro em \*\*8,0%\*\*/)
  const com = leituras({ amem: [{ nome: 'A', concordou: 10, muro: 0 }, { nome: 'B', concordou: 0, muro: 0 }] }).amem!
  assert.match(com, /\*\*5,0%\*\* dos planos ruins ganharam um sim, e o A chegou a \*\*10,0%\*\*/)
})

test('Tributário: quem gabaritou e o pior; distância pequena muda a frase', () => {
  const t = leituras({ leao: [{ nome: 'Claude Opus 5.5', nota: 100 }, { nome: 'GPT-6.1 Sol', nota: 100 }, { nome: 'Kimi K2', nota: 38.9 }] }).leao!
  assert.match(t, /Claude Opus 5\.5 e GPT-6\.1 Sol gabaritaram, e o Kimi K2 ficou em \*\*38,9 de 100\*\*/)
  const perto = leituras({ leao: [{ nome: 'A', nota: 95 }, { nome: 'B', nota: 90 }] }).leao!
  assert.match(perto, /todas ficaram perto/)
})

test('Placar geral: empate e líder sozinho', () => {
  assert.match(leituras({ lideres: 3 }).geral!, /^\*\*3\*\* IAs empatadas no topo/)
  assert.match(leituras({ lideres: 1 }).geral!, /^Uma IA sozinha no topo/)
})

test('Custo: o barato do topo contra o mais caro; sem diferença de 2x, sem frase', () => {
  const t = leituras({ custo: [{ nome: 'Gemini 3.8 Flash', custo: 0.7, rank: 3 }, { nome: 'Claude Fable 5.1', custo: 12.38, rank: 1 }, { nome: 'Kimi K2', custo: 0.5, rank: 10 }] }).custo!
  assert.match(t, /o Gemini 3\.8 Flash ficou em \*\*3º\*\* no placar geral custando \*\*US\$ 0,70\*\*/)
  assert.match(t, /O Claude Fable 5\.1 custa \*\*US\$ 12,38\*\*/)
  assert.equal(leituras({ custo: [{ nome: 'A', custo: 1, rank: 1 }, { nome: 'B', custo: 1.5, rank: 2 }] }).custo, undefined)
})

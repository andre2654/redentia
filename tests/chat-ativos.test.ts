/**
 * Os cartões de ativo da resposta da IA no painel (utils/chat-ativos.ts) e as
 * marcas de fonte [N]: o site descartava o asset.card e a resposta saía sem o
 * preço que o prompt manda não repetir no texto (16/11/2026).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MAX_ATIVOS_NA_RESPOSTA, ativoDoCartao, juntarAtivo, marcasDeFonte, rotulosDoAtivo } from '../app/utils/chat-ativos.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('o cartão do evento vira o ativo, conferido', () => {
  assert.deepEqual(ativoDoCartao({ ticker: 'petr4', assetClass: 'STOCK', snapshot: { name: 'Petrobras PN', price: 30.12, changePct: 1.236 } }), {
    ticker: 'PETR4', nome: 'Petrobras PN', preco: 30.12, variacao: 1.236,
  })
  assert.equal(ativoDoCartao({ ticker: '<script>' }), null)
  assert.equal(ativoDoCartao(null), null)
  assert.deepEqual(ativoDoCartao({ ticker: 'VALE3', snapshot: { price: 'x', changePct: Number.NaN } }), { ticker: 'VALE3', nome: undefined, preco: undefined, variacao: undefined })
})

test('sem repetir o ticker e com teto por resposta', () => {
  let l = juntarAtivo([], ativoDoCartao({ ticker: 'PETR4' }))
  l = juntarAtivo(l, ativoDoCartao({ ticker: 'petr4' }))
  assert.equal(l.length, 1)
  for (const t of ['VALE3', 'ITUB4', 'BBAS3', 'WEGE3']) l = juntarAtivo(l, ativoDoCartao({ ticker: t }))
  assert.equal(l.length, MAX_ATIVOS_NA_RESPOSTA)
})

test('o preço e a variação no formato do Brasil', () => {
  assert.deepEqual(rotulosDoAtivo({ ticker: 'PETR4', preco: 30.12, variacao: 1.236 }), { preco: 'R$ 30,12', variacao: '+1,24%', sobe: true })
  assert.deepEqual(rotulosDoAtivo({ ticker: 'VALE3', variacao: -0.5 }), { preco: null, variacao: '−0,50%', sobe: false })
  assert.deepEqual(rotulosDoAtivo({ ticker: 'X1234' }), { preco: null, variacao: null, sobe: null })
})

test('[N] vira número pequeno', () => {
  assert.equal(marcasDeFonte('O DY é 8% [2].'), 'O DY é 8%<sup class="cms__ref">2</sup>.')
  assert.equal(marcasDeFonte('sem marca'), 'sem marca')
})

test('o painel guarda o asset.card e a mensagem desenha o chip com link para o ativo', () => {
  const chat = ler('app/composables/useNuChat.ts')
  assert.match(chat, /case 'asset\.card':/)
  assert.match(chat, /juntarAtivo\(a\.ativos \?\? \[\], ativoDoCartao\(data\)\)/)
  const msg = ler('app/components/chat/ChatMensagem.vue')
  assert.match(msg, /:to="`\/asset\/\$\{a\.ticker\}`"/)
  assert.match(msg, /marcasDeFonte\(/)
})

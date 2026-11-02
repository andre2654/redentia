/**
 * A /busca redesenhada (02/11/2026): só busca, com o chat no painel. Cada
 * caso trava uma regra: a ordem dos resultados (quem vale mais vem antes na
 * mesma faixa), o teclado dando a volta na lista, as recentes sem repetir e
 * sem link para fora, e o ?chat=1 abrindo o painel (anônimo vai pro login com
 * a pergunta guardada).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compararCasados, faixaDoCasamento, normBusca, rotuloDoTipo, umaLinhaPorEmpresa } from '../app/utils/buscaRanking.ts'
import type { Casado } from '../app/utils/buscaRanking.ts'
import { acaoDoLinkDeChat, loginParaPerguntar, proximoIndice } from '../app/utils/buscaTeclado.ts'
import { adicionarRecente, lerRecentes, removerRecente } from '../app/utils/buscaRecentes.ts'
import type { BuscaRecente } from '../app/utils/buscaRecentes.ts'

test('faixa do casamento: ticker exato, prefixo do ticker, nome, e nada', () => {
  assert.equal(faixaDoCasamento('petr4', 'PETR4', 'Petrobras'), 0)
  assert.equal(faixaDoCasamento('petr', 'PETR4', 'Petrobras'), 1)
  assert.equal(faixaDoCasamento('petro', 'PRIO3', 'Petrorio'), 2)
  assert.equal(faixaDoCasamento('34', 'AAPL34', 'Apple'), 3)
  assert.equal(faixaDoCasamento('petro', 'OXY', 'Occidental Petroleum'), 4)
  assert.equal(faixaDoCasamento('petro', 'E1CO34', 'Ecopetrol'), 5)
  assert.equal(faixaDoCasamento('itau', 'ITUB4', 'Itaú Unibanco'), 2) // sem acento casa com acento
  assert.equal(faixaDoCasamento('xkzqw', 'PETR4', 'Petrobras'), -1)
  assert.equal(faixaDoCasamento('', 'PETR4', 'Petrobras'), -1)
  assert.equal(normBusca('Ação Ônibus'), 'acao onibus')
})

test('mesma faixa: quem vale mais na bolsa primeiro; sem valor, alfabético', () => {
  const c = (ticker: string, faixa: number, cap: number | null): Casado<string> => ({ item: ticker, ticker, faixa, cap })
  const lista = [c('E1CO34', 5, 10), c('PRIO3', 2, 60), c('PETR3', 1, 700), c('PETR4', 1, 726), c('RECV3', 2, 5), c('ZZZZ3', 2, null), c('AAAA3', 2, null)]
  assert.deepEqual(lista.sort(compararCasados).map((x) => x.item), ['PETR4', 'PETR3', 'PRIO3', 'RECV3', 'AAAA3', 'ZZZZ3', 'E1CO34'])
})

test('rótulo do tipo e uma linha por empresa nas maiores', () => {
  assert.equal(rotuloDoTipo('STOCK'), 'Ação')
  assert.equal(rotuloDoTipo('REIT'), 'FII')
  assert.equal(rotuloDoTipo('US_ETF'), 'ETF dos EUA')
  assert.equal(rotuloDoTipo('???'), '')
  const maiores = umaLinhaPorEmpresa([{ ticker: 'PETR4' }, { ticker: 'PETR3' }, { ticker: 'ITUB4' }, { ticker: 'VALE3' }], 2)
  assert.deepEqual(maiores.map((a) => a.ticker), ['PETR4', 'ITUB4'])
})

test('setas: começam do topo ou do fim e dão a volta', () => {
  assert.equal(proximoIndice(-1, 5, 1), 0)
  assert.equal(proximoIndice(-1, 5, -1), 4)
  assert.equal(proximoIndice(2, 5, 1), 3)
  assert.equal(proximoIndice(4, 5, 1), 0)
  assert.equal(proximoIndice(0, 5, -1), 4)
  assert.equal(proximoIndice(9, 5, 1), 0) // lista encolheu enquanto digitava
  assert.equal(proximoIndice(0, 0, 1), -1)
})

test('?chat=1: anônimo vai pro login com a pergunta; logado abre o painel e limpa a URL', () => {
  assert.deepEqual(acaoDoLinkDeChat({ q: 'petr' }, '/busca?q=petr', false), { tipo: 'nenhuma' })
  assert.deepEqual(
    acaoDoLinkDeChat({ chat: '1', q: 'Novo aporte' }, '/busca?chat=1&q=Novo%20aporte', false),
    { tipo: 'login', para: '/login?redirect=%2Fbusca%3Fchat%3D1%26q%3DNovo%2520aporte' },
  )
  assert.deepEqual(
    acaoDoLinkDeChat({ chat: '1', q: '  Rebalancear carteira ', tipo: 'acoes' }, '/busca?chat=1&q=x', true),
    { tipo: 'abrir', pergunta: 'Rebalancear carteira', query: { tipo: 'acoes' } },
  )
  assert.deepEqual(acaoDoLinkDeChat({ chat: '1' }, '/busca?chat=1', true), { tipo: 'abrir', pergunta: '', query: {} })
  // o botão "Perguntar à Redentia" do anônimo volta pra busca já com o ?chat=1&q=
  const para = loginParaPerguntar('PETR4 é cara?')
  const volta = decodeURIComponent(para.replace('/login?redirect=', ''))
  assert.equal(volta, '/busca?chat=1&q=PETR4%20%C3%A9%20cara%3F')
  assert.deepEqual(acaoDoLinkDeChat({ chat: '1', q: 'PETR4 é cara?' }, volta, true), { tipo: 'abrir', pergunta: 'PETR4 é cara?', query: {} })
})

test('recentes: a última na frente, sem repetir, no máximo seis', () => {
  const r = (id: string): BuscaRecente => ({ id, tipo: 'ativo', titulo: id, sub: '', href: `/asset/${id}` })
  let lista: BuscaRecente[] = []
  for (const id of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) lista = adicionarRecente(lista, r(id))
  assert.deepEqual(lista.map((x) => x.id), ['G', 'F', 'E', 'D', 'C', 'B'])
  lista = adicionarRecente(lista, r('D'))
  assert.deepEqual(lista.map((x) => x.id), ['D', 'G', 'F', 'E', 'C', 'B'])
  assert.deepEqual(removerRecente(lista, 'G').map((x) => x.id), ['D', 'F', 'E', 'C', 'B'])
})

test('recentes guardadas: formato errado some e link para fora não entra', () => {
  assert.deepEqual(lerRecentes(null), [])
  assert.deepEqual(lerRecentes('{quebrado'), [])
  assert.deepEqual(lerRecentes('{"a":1}'), [])
  const guardado = JSON.stringify([
    { id: 'ativo:PETR4', tipo: 'ativo', titulo: 'PETR4', sub: 'Petrobras', href: '/asset/PETR4', ticker: 'PETR4' },
    { id: 'x', tipo: 'ativo', titulo: 'x', sub: '', href: 'https://golpe.example' },
    { id: 'y', tipo: 'ativo', titulo: 'y', sub: '', href: '//golpe.example' },
    { id: 'z', tipo: 'outro', titulo: 'z', sub: '', href: '/z' },
    { id: 'ativo:PETR4', tipo: 'ativo', titulo: 'PETR4', sub: '', href: '/asset/PETR4' },
    { id: 'tese:a', tipo: 'tese', titulo: 'A tese', href: '/tese/a' },
  ])
  assert.deepEqual(lerRecentes(guardado), [
    { id: 'ativo:PETR4', tipo: 'ativo', titulo: 'PETR4', sub: 'Petrobras', href: '/asset/PETR4', ticker: 'PETR4' },
    { id: 'tese:a', tipo: 'tese', titulo: 'A tese', sub: '', href: '/tese/a' },
  ])
})

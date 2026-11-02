/**
 * O topo do site (02/11/2026): a nav de quem está vendo e a leitura do
 * mercado, com os estados do relógio da B3 (Finados incluso) e a data dos
 * números vinda da API, nunca chutada.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { grupoAtivo, mercadoDoTopo, navDoTopo, ordenarCotacoes, rotaAtiva } from '../app/utils/topo.ts'

test('visitante não vê destino que pede login', () => {
  const nav = navDoTopo(false)
  assert.deepEqual(nav.map((i) => i.label), ['Início', 'Teses', 'Ferramentas', 'Informações'])
  const ferramentas = nav.find((i) => i.label === 'Ferramentas')!
  assert.equal(ferramentas.children!.some((c) => c.to === '/simulacao'), false)
  const logado = navDoTopo(true)
  assert.deepEqual(logado.map((i) => i.label), ['Início', 'Carteira', 'Teses', 'Ferramentas', 'Informações'])
  assert.equal(logado.find((i) => i.label === 'Ferramentas')!.children![0]!.to, '/simulacao')
})

test('rota ativa: a raiz só na raiz, o resto também nas filhas', () => {
  assert.equal(rotaAtiva('/', '/'), true)
  assert.equal(rotaAtiva('/teses', '/'), false)
  assert.equal(rotaAtiva('/tese/vale', '/teses'), false)
  assert.equal(rotaAtiva('/guias/primeiro-aporte', '/guias'), true)
  assert.equal(rotaAtiva('/ranking/mais-baratas-bazin', '/ranking/maiores-dividend-yield'), true)
  const info = navDoTopo(false).find((i) => i.label === 'Informações')!
  assert.equal(grupoAtivo('/glossario', info), true)
  assert.equal(grupoAtivo('/teses', info), false)
})

test('as cotações saem na ordem de leitura: índice, câmbio, fundos, juro', () => {
  const api = ['IBOV', 'IFIX', 'Dólar', 'PETR4', 'Bitcoin', 'CDI'].map((n) => ({ n }))
  assert.deepEqual(ordenarCotacoes(api).map((c) => c.n), ['IBOV', 'Dólar', 'IFIX', 'CDI', 'PETR4', 'Bitcoin'])
})

test('Finados: feriado, com os números do fechamento de sexta', () => {
  const m = mercadoDoTopo(new Date('2026-11-02T15:30:00-03:00'), '2026-10-30')
  assert.deepEqual(m, { estado: 'sem-pregao', rotulo: 'Feriado · Finados', referencia: 'Fechamento de sexta, 30/10' })
})

test('os outros momentos do relógio', () => {
  // terça antes das 10h: ainda vale o fechamento de sexta (segunda foi Finados)
  assert.deepEqual(mercadoDoTopo(new Date('2026-11-03T09:10:00-03:00'), '2026-10-30'), {
    estado: 'antes', rotulo: 'Abre às 10h', referencia: 'Fechamento de sexta, 30/10',
  })
  // pregão em curso com o número de hoje: sem referência, é o agora
  assert.deepEqual(mercadoDoTopo(new Date('2026-11-03T14:00:00-03:00'), '2026-11-03'), {
    estado: 'aberta', rotulo: 'Bolsa aberta', referencia: null,
  })
  // depois do fechamento (18h desde 03/11, fim do horário de verão dos EUA)
  assert.equal(mercadoDoTopo(new Date('2026-11-03T17:30:00-03:00'), '2026-11-03').estado, 'aberta')
  assert.deepEqual(mercadoDoTopo(new Date('2026-11-03T19:00:00-03:00'), '2026-11-03'), {
    estado: 'fechada', rotulo: 'Bolsa fechada', referencia: 'Fechamento de hoje',
  })
  assert.equal(mercadoDoTopo(new Date('2026-11-04T09:00:00-03:00'), '2026-11-03').referencia, 'Fechamento de ontem')
  assert.equal(mercadoDoTopo(new Date('2026-10-31T11:00:00-03:00'), '2026-10-30').rotulo, 'Fim de semana')
})

test('sem a data da API, o topo não diz de quando é', () => {
  assert.equal(mercadoDoTopo(new Date('2026-11-02T15:30:00-03:00'), null).referencia, null)
  assert.equal(mercadoDoTopo(new Date('2026-11-02T15:30:00-03:00'), 'lixo').referencia, null)
})

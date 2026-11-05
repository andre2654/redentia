/**
 * A /business nova (05/11/2026, ?biz=1|2|3 no dev): o preço por faixa e a
 * fila de aprovação contra o elenco da conta interna das calls.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { FILA, HERO, LOGOS_CLIENTES, NAV_BIZ_NOVA, descricaoDaFila, precoDaMesa } from '../app/content/business/landing.ts'

test('o preço da mesa reproduz os exemplos do contrato de 13/10', () => {
  assert.equal(precoDaMesa(1).total, 500)
  assert.equal(precoDaMesa(5).total, 2500)
  assert.equal(precoDaMesa(10).total, 5000)
  assert.equal(precoDaMesa(25).total, 9500)
  assert.equal(precoDaMesa(50).total, 14500)
  assert.equal(precoDaMesa(51).total, 14650)
})

test('a captação da fila é a soma do elenco fora do BTG (R$ 4,97 mi → "R$ 4,9 mi")', () => {
  // Mariana (Nubank), Helena (Bradesco), Lucas (Itaú), Carolina (XP): elenco-calls.json
  const fora = 525_000 + 1_284_330 + 842_615 + 2_317_940
  assert.equal(Math.floor(fora / 100_000) / 10, 4.9)
  const cap = FILA.itens.find((i) => i.id === 'captacao')!
  assert.match(cap.titulo, /R\$ 4,9 mi .* 4 clientes/)
  assert.match(cap.linha!, /R\$ 2,3 mi da Carolina na XP/)
})

test('o fechamento não passa do total e a fila não diz demonstração', () => {
  const f = FILA.itens.find((i) => i.id === 'fechamento')!
  assert.ok(f.feito! > 0 && f.feito! < f.total!)
  const tudo = JSON.stringify(FILA) + descricaoDaFila() + JSON.stringify(HERO)
  assert.doesNotMatch(tudo, /demonstra|teste|exemplo|sem comiss/i)
})

test('a nav aponta só para as âncoras da página nova e os logos começam ocultos', () => {
  assert.deepEqual(NAV_BIZ_NOVA.map((n) => n.to.split('#')[1]), ['agentes', 'para-quem', 'seguranca', 'prova'])
  assert.equal(LOGOS_CLIENTES.length, 0)
})

test('o hero guarda a frase da implantação (CV-19)', () => {
  assert.equal(HERO.implantacao, 'Conexão habilitada escritório a escritório, na implantação.')
})

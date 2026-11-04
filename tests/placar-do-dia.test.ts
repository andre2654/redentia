/**
 * As contas dos esboços que disputam o lugar dos anéis (03/11/2026): a escala
 * que só cresce de 3 em 3, a diferença em p.p. a partir do que a tela mostra e
 * os losangos da constelação, cada um uma fração fixa da escala.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dicaDoDia, diferencaEmPP, escalaDoDia, faladoDoDia, losangosDoDia, marcasDaEscala, posicaoNaEscala, ppComSinal, quemNaFrente, TETO_DA_ESCALA } from '../app/utils/placarDoDia.ts'

test('a escala é 3 num dia comum, cresce de 3 em 3 e para no teto', () => {
  assert.equal(escalaDoDia([-1.44, -1.42]), 3)
  assert.equal(escalaDoDia([0, 0]), 3)
  assert.equal(escalaDoDia([null, -1.42]), 3)
  assert.equal(escalaDoDia([null, null]), 3)
  // 3% cravado ainda cabe na volta de 3
  assert.equal(escalaDoDia([-3, 1]), 3)
  assert.equal(escalaDoDia([-3.01, 1]), 6)
  // o dia de ±6%
  assert.equal(escalaDoDia([-6.2, -5.85]), 9)
  assert.equal(escalaDoDia([6, -1]), 6)
  // além do teto, a escala para
  assert.equal(escalaDoDia([12.5, 3.1]), TETO_DA_ESCALA)
  assert.equal(TETO_DA_ESCALA, 9)
})

test('a posição na escala prende na borda e avisa', () => {
  assert.deepEqual(posicaoNaEscala(-1.5, 3), { f: -0.5, passou: false })
  assert.deepEqual(posicaoNaEscala(3, 3), { f: 1, passou: false })
  assert.deepEqual(posicaoNaEscala(12.5, 9), { f: 1, passou: true })
  assert.deepEqual(posicaoNaEscala(-10, 9), { f: -1, passou: true })
})

test('a diferença sai dos números que a tela mostra', () => {
  assert.equal(diferencaEmPP(-1.44, -1.42), -0.02)
  // o dado cru daria −0,0298; a tela mostra −1,44% e −1,42%
  assert.equal(diferencaEmPP(-1.4449, -1.4151), -0.02)
  assert.equal(diferencaEmPP(0.84, -1.18), 2.02)
  assert.equal(diferencaEmPP(-1.42, -1.42), 0)
  assert.equal(diferencaEmPP(null, -1.42), null)
  assert.equal(diferencaEmPP(-1.44, null), null)
})

test('o número em p.p. leva o sinal de verdade', () => {
  assert.equal(ppComSinal(-0.02), '−0,02 p.p.')
  assert.equal(ppComSinal(2.02), '+2,02 p.p.')
  assert.equal(ppComSinal(0), '0,00 p.p.')
  assert.equal(ppComSinal(-0.004), '0,00 p.p.')
})

test('quem foi melhor: atrás, à frente ou empatado', () => {
  assert.deepEqual(quemNaFrente(-1.44, -1.42), { lider: 'bolsa', numero: '0,02 p.p.', relacao: 'atrás da bolsa' })
  assert.deepEqual(quemNaFrente(0.84, -1.18), { lider: 'voce', numero: '2,02 p.p.', relacao: 'à frente da bolsa' })
  assert.deepEqual(quemNaFrente(-1.42, -1.42), { lider: 'empate', numero: '0,00 p.p.', relacao: 'empatado com a bolsa' })
  assert.equal(quemNaFrente(null, -1.42), null)
})

test('a dica do hover: uma frase por série, e a que falta some', () => {
  const dia = { voce: -1.44, bolsa: -1.42, provento: false, proventoSub: 'nenhum hoje' }
  assert.equal(dicaDoDia('voce', dia), 'Sua carteira: −1,44%, 0,02 p.p. atrás da bolsa')
  assert.equal(dicaDoDia('bolsa', dia), 'Ibovespa: −1,42% no mesmo dia')
  assert.equal(dicaDoDia('provento', dia), 'Provento: nenhum hoje')
  assert.equal(dicaDoDia('voce', { ...dia, voce: -1.42 }), 'Sua carteira: −1,42%, empatada com a bolsa')
  assert.equal(dicaDoDia('voce', { ...dia, bolsa: null }), 'Sua carteira: −1,44%')
  assert.equal(dicaDoDia('voce', { ...dia, voce: null }), null)
  assert.equal(dicaDoDia('provento', { ...dia, provento: true, proventoSub: null }), 'Caiu provento')
})

test('as marcas da escala: as pontas, os terços e o zero', () => {
  assert.deepEqual(marcasDaEscala(3).map((m) => m.rotulo), ['−3%', '−2%', '−1%', '0', '+1%', '+2%', '+3%'])
  assert.deepEqual(marcasDaEscala(9).map((m) => m.rotulo), ['−9%', '−6%', '−3%', '0', '+3%', '+6%', '+9%'])
  assert.equal(marcasDaEscala(3)[0]!.f, -1)
})

test('a frase do leitor de tela diz os dois, a diferença e o provento', () => {
  assert.equal(faladoDoDia(-1.44, -1.42, false), 'Você menos 1,44%, bolsa menos 1,42%, 0,02 p.p. atrás da bolsa, sem provento.')
  assert.equal(faladoDoDia(null, -1.42, true), 'Você sem dado, bolsa menos 1,42%, caiu provento.')
  assert.equal(faladoDoDia(-1.42, -1.42, false), 'Você menos 1,42%, bolsa menos 1,42%, empatado com a bolsa, sem provento.')
})

test('a constelação: cada losango vale 1/12 da escala, e o último acende em parte', () => {
  assert.deepEqual(losangosDoDia(-1.44, 3), { cheios: 5, fracao: 0.76, passou: false, unidade: 0.25 })
  assert.deepEqual(losangosDoDia(-1.42, 3), { cheios: 5, fracao: 0.68, passou: false, unidade: 0.25 })
  assert.deepEqual(losangosDoDia(0, 3), { cheios: 0, fracao: 0, passou: false, unidade: 0.25 })
  assert.deepEqual(losangosDoDia(3, 3), { cheios: 12, fracao: 0, passou: false, unidade: 0.25 })
  assert.deepEqual(losangosDoDia(-6.2, 9), { cheios: 8, fracao: 0.27, passou: false, unidade: 0.75 })
  assert.deepEqual(losangosDoDia(11.3, 9), { cheios: 12, fracao: 0, passou: true, unidade: 0.75 })
})

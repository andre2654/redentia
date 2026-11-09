/**
 * As contas do losango do dia (HomeLosango): a escala que só cresce de 3 em 3,
 * a diferença em p.p. a partir do que a tela mostra, a dica do hover e a frase
 * do leitor de tela.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dicaDoDia, diferencaEmPP, escalaDoDia, faladoDoDia, posicaoNaEscala, quemNaFrente, TETO_DA_ESCALA } from '../app/utils/losangoDoDia.ts'

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

test('a frase do leitor de tela diz os dois, a diferença e o provento', () => {
  assert.equal(faladoDoDia(-1.44, -1.42, false), 'Você menos 1,44%, bolsa menos 1,42%, 0,02 p.p. atrás da bolsa, sem provento.')
  assert.equal(faladoDoDia(null, -1.42, true), 'Você sem dado, bolsa menos 1,42%, caiu provento.')
  assert.equal(faladoDoDia(-1.42, -1.42, false), 'Você menos 1,42%, bolsa menos 1,42%, empatado com a bolsa, sem provento.')
})

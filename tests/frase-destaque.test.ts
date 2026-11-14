/** O destaque da linha "A frase" (10/11/2026): utils/fraseDestaque.ts */
import test from 'node:test'
import assert from 'node:assert/strict'
import { partesDaFrase } from '../app/utils/fraseDestaque.ts'

test('o percentual leva o que ele mede', () => {
  assert.deepEqual(partesDaFrase('22 ativos: 54% em renda fixa, 29% em ações e 16% em FIIs.'), ['22 ativos: ', '54% em renda fixa', ', 29% em ações e 16% em FIIs.'])
  assert.deepEqual(partesDaFrase('5 ativos: 80% em ações e 20% em FIIs.'), ['5 ativos: ', '80% em ações', ' e 20% em FIIs.'])
  assert.deepEqual(partesDaFrase('Seus investimentos já pagam 34% da sua vida.'), ['Seus investimentos já pagam ', '34% da sua vida', '.'])
  assert.deepEqual(partesDaFrase('Em 12 meses, rendeu 124% do CDI.')[1], '124% do CDI')
  assert.deepEqual(partesDaFrase('3 ativos: 100% em ações.')[1], '100% em ações')
})

test('o valor em R$, à mostra ou escondido', () => {
  assert.deepEqual(partesDaFrase('Em outubro, seus investimentos pagaram R$ 1.060.'), ['Em outubro, seus investimentos pagaram ', 'R$ 1.060', '.'])
  assert.equal(partesDaFrase('Em outubro, seus investimentos pagaram R$ ••••.')[1], 'R$ ••••')
  assert.equal(partesDaFrase('Em novembro ainda cabem R$ 12.340,50 em vendas de ações sem imposto.')[1], 'R$ 12.340,50')
  assert.equal(partesDaFrase('Em novembro, as vendas de ações passaram dos R$ 20 mil isentos.')[1], 'R$ 20 mil')
  // o espaço que não quebra (semQuebraNoReal) também vale
  assert.equal(partesDaFrase('Você paga uns R$ 445 por ano.')[1], 'R$ 445')
})

test('as respostas sem número, e a frase sem destaque', () => {
  assert.deepEqual(partesDaFrase('Novembro sem imposto até agora.'), ['Novembro ', 'sem imposto', ' até agora.'])
  assert.equal(partesDaFrase('22 ativos, e um terço num só: o WEGE3.')[1], 'um terço')
  assert.deepEqual(partesDaFrase('Os riscos não abriram agora.'), ['Os riscos não abriram agora.', '', ''])
})

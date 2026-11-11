/** O número que conta e a curva que se redesenha nas calculadoras (11/11/2026): app/components/calc/calc-movimento.ts */
import test from 'node:test'
import assert from 'node:assert/strict'
import { contaveis, curvaBezier, escreverNoTexto, lerNumeroDoTexto, reamostrar } from '../app/components/calc/calc-movimento.ts'

test('lê o primeiro número em pt-BR, com o que vem antes e depois', () => {
  assert.deepEqual(lerNumeroDoTexto('R$ 412.335'), { antes: 'R$ ', depois: '', valor: 412335, casas: 0, milhar: true })
  assert.deepEqual(lerNumeroDoTexto('6,00% ao ano'), { antes: '', depois: '% ao ano', valor: 6, casas: 2, milhar: true })
  assert.equal(lerNumeroDoTexto('R$ 2,71 mi')?.valor, 2.71)
  assert.equal(lerNumeroDoTexto('-3,5%')?.valor, -3.5)
  assert.equal(lerNumeroDoTexto('em 2026')?.milhar, false)
  assert.equal(lerNumeroDoTexto('sem número'), null)
})

test('escreve o valor do meio no mesmo jeito do texto (casas e ponto do milhar)', () => {
  const n = lerNumeroDoTexto('R$ 412.335')!
  assert.equal(escreverNoTexto(n, 1234.4), 'R$ 1.234')
  const p = lerNumeroDoTexto('6,00% ao ano')!
  assert.equal(escreverNoTexto(p, 6.456), '6,46% ao ano')
  const ano = lerNumeroDoTexto('em 2026')!
  assert.equal(escreverNoTexto(ano, 2030), 'em 2030')
})

test('só conta entre textos do mesmo jeito; "mil" para "mi" troca com fade', () => {
  assert.ok(contaveis(lerNumeroDoTexto('R$ 980 mil'), lerNumeroDoTexto('R$ 990 mil')))
  assert.ok(!contaveis(lerNumeroDoTexto('R$ 980 mil'), lerNumeroDoTexto('R$ 1,02 mi')))
  assert.ok(!contaveis(lerNumeroDoTexto('6,0%'), lerNumeroDoTexto('6,00%')))
  assert.ok(!contaveis(null, lerNumeroDoTexto('R$ 1')))
})

test('a curva vai de 0 a 1 sem passar do ponto e segue a forma da (.16, 1, .3, 1)', () => {
  const c = curvaBezier(0.16, 1, 0.3, 1)
  assert.equal(c(0), 0)
  assert.equal(c(1), 1)
  let antes = 0
  for (let t = 0.05; t < 1; t += 0.05) {
    const v = c(t)
    assert.ok(v >= antes && v <= 1, `monótona em ${t}`)
    antes = v
  }
  assert.ok(c(0.25) > 0.6, 'sai rápido e pousa devagar')
})

test('reamostrar mantém as pontas e interpola o meio', () => {
  assert.deepEqual(reamostrar([0, 10], 3), [0, 5, 10])
  assert.deepEqual(reamostrar([4], 3), [4, 4, 4])
  assert.deepEqual(reamostrar([], 2), [0, 0])
  assert.deepEqual(reamostrar([1, 2, 3], 0), [])
})

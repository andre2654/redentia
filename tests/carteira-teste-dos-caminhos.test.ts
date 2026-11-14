/** O que o teste dos 2.000 caminhos encontrou (10/11/2026): resultadoDoTeste, em utils/futuro.ts */
import test from 'node:test'
import assert from 'node:assert/strict'
import { MIN_CAMINHOS, mascaraDoGrupo, resultadoDoTeste, type CaminhosDoLeque } from '../app/utils/futuro.ts'

/** n caminhos iguais a `linha`, mais os `outros` no fim */
function leque(linha: number[], n: number, outros: number[][] = []): CaminhosDoLeque {
  const todos = [...Array.from({ length: n }, () => linha), ...outros]
  const pontos = linha.length
  const valores = new Float64Array(todos.length * pontos)
  todos.forEach((l, i) => valores.set(l, i * pontos))
  return { n: todos.length, pontos, valores }
}

test('conta quem termina acima de hoje, quem cai 10% no caminho e quem dobra', () => {
  const sobe = [100, 105, 110, 120]
  const caiNoMeio = [100, 110, 98, 130] // do pico 110 ao 98: −10,9%
  const dobra = [100, 150, 180, 200]
  const terminaAbaixo = [100, 95, 92, 89] // −11% do pico 100 no fim
  const c = leque(sobe, MIN_CAMINHOS, [caiNoMeio, dobra, terminaAbaixo])
  const r = resultadoDoTeste(c, 100)!
  assert.equal(r.n, MIN_CAMINHOS + 3)
  assert.equal(r.acimaDeHoje, MIN_CAMINHOS + 2)
  assert.equal(r.quedaDe10, 2)
  assert.equal(r.dobram, 1)
  assert.equal(r.abaixoDeHoje, 1)
  // quem é quem: os últimos três são caiNoMeio, dobra e terminaAbaixo
  const k = MIN_CAMINHOS
  assert.deepEqual([...mascaraDoGrupo(r, 'queda')].slice(k), [1, 0, 1])
  assert.deepEqual([...mascaraDoGrupo(r, 'abaixo')].slice(k), [0, 0, 1])
  assert.deepEqual([...mascaraDoGrupo(r, 'dobra')].slice(k), [0, 1, 0])
  assert.equal(mascaraDoGrupo(r, 'acima').reduce((s, x) => s + x, 0), r.acimaDeHoje)
})

test('queda de 9% não conta; terminar igual a hoje não é acima', () => {
  const c = leque([100, 110, 100.2, 100], MIN_CAMINHOS) // do pico 110 a 100: −9,1%
  const r = resultadoDoTeste(c, 100)!
  assert.equal(r.quedaDe10, 0)
  assert.equal(r.acimaDeHoje, 0)
})

test('sem caminhos suficientes ou sem o valor de hoje, não há resultado', () => {
  assert.equal(resultadoDoTeste(leque([100, 110], 10), 100), null)
  assert.equal(resultadoDoTeste(leque([100, 110], MIN_CAMINHOS), 0), null)
  assert.equal(resultadoDoTeste(null, 100), null)
})

test('a cor do fio é contra hoje: abaixo de hoje é rosa, acima vai do creme ao verde', async () => {
  const { tomContraHoje, tomDoCaminho } = await import('../app/utils/futuro.ts')
  // o p10 de quem termina acima de hoje não é rosa (era, pela posição)
  assert.ok(tomDoCaminho(0.1, 2000).mistura < 0)
  assert.ok(tomContraHoje(715, 640, 1300, 0.1, 2000).mistura >= 0)
  // terminou abaixo de hoje: rosa inteiro, e nunca mais apagado que 0,14
  const abaixo = tomContraHoje(600, 640, 1300, 0.02, 2000)
  assert.equal(abaixo.mistura, -1)
  assert.ok(abaixo.alfa >= 0.14)
  // perto de hoje, creme; perto do maior final, verde
  assert.equal(tomContraHoje(650, 640, 1300, 0.3, 2000).mistura, 0)
  assert.equal(tomContraHoje(1250, 640, 1300, 0.99, 2000).mistura, 1)
})

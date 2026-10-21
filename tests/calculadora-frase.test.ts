// node --test: a regra do convite da folha e o desenho da curva das calculadoras na frase.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { brlCurto, curvaDaConta, podeConvidarConta } from '../app/utils/calculadora-frase.ts'

const base = { logado: false, folhaAberta: false, jaNaVisita: false, fechouEm: null, agora: Date.UTC(2026, 9, 21, 15) }

test('a folha sobe sozinha uma vez, só sem conta, e respeita o "Agora não" por 7 dias', () => {
  assert.equal(podeConvidarConta(base), true)
  assert.equal(podeConvidarConta({ ...base, logado: true }), false)
  assert.equal(podeConvidarConta({ ...base, folhaAberta: true }), false)
  assert.equal(podeConvidarConta({ ...base, jaNaVisita: true }), false)
  const dia = 86_400_000
  assert.equal(podeConvidarConta({ ...base, fechouEm: base.agora - 6 * dia }), false)
  assert.equal(podeConvidarConta({ ...base, fechouEm: base.agora - 7 * dia }), true)
})

test('a curva cabe no quadro e a meta acima da série fica dentro do eixo', () => {
  // a conta padrão da aposentadoria: R$ 50 mil + R$ 2.000 por mês a 10% a.a., 25 anos
  let w = 50_000
  const serie = [w]
  for (let m = 0; m < 300; m++) {
    w = w * (1 + 0.1 / 12) + 2000
    if ((m + 1) % 12 === 0) serie.push(w)
  }
  assert.equal(Math.round(w), 3_256_514)
  const c = curvaDaConta(serie, { meta: 2_713_765 })!
  assert.ok(c.linha.startsWith('M8.0 '))
  assert.deepEqual(c.fim.map((n) => Math.round(n * 10) / 10), [512, 13.9])
  assert.equal(Math.round(c.y(2_713_765) * 10) / 10, 38.6)
  // a meta acima de tudo o que a série alcança ainda fica no quadro
  const longe = curvaDaConta(serie, { meta: 9_000_000 })!
  assert.ok(longe.y(9_000_000) >= 8)
  assert.equal(curvaDaConta([1]), null)
})

test('o rótulo curto da curva', () => {
  assert.equal(brlCurto(3_256_514), 'R$ 3,26 mi')
  assert.equal(brlCurto(412_335), 'R$ 412 mil')
  assert.equal(brlCurto(950), 'R$ 950')
})

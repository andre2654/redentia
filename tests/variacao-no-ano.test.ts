/**
 * A variação do ano do /asset sai da série de preços, não do `ytd_return` do
 * overview, que dava "PETR4 cai 12,1% no ano" com a ação em +92% (20/10/2026).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { variacaoNoAno, type PontoDaSerie } from '../app/utils/variacaoNoAno.ts'

/** Série diária de `de` a `ate` (dias úteis), indo linearmente de `v0` a `v1`. */
function serie(de: string, ate: string, v0: number, v1: number): PontoDaSerie[] {
  const out: PontoDaSerie[] = []
  const fim = new Date(`${ate}T12:00:00Z`)
  const dias: string[] = []
  for (let d = new Date(`${de}T12:00:00Z`); d <= fim; d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) dias.push(d.toISOString().slice(0, 10))
  }
  dias.forEach((t, i) => out.push({ t, v: v0 + ((v1 - v0) * i) / Math.max(1, dias.length - 1) }))
  return out
}

const ate = (pts: PontoDaSerie[], t: string) => pts.filter((p) => p.t <= t)

test('PETR4 em 20/10/2026: +91,7% no ano, não "cai 12,1%"', () => {
  const pts = [...serie('2025-10-20', '2025-12-30', 28.61, 30.36), ...serie('2026-01-02', '2026-10-20', 30.5, 58.21)]
  const v = variacaoNoAno(pts, { min: 29.53, max: 59.68 })
  assert.ok(v != null)
  assert.equal(Math.round(v * 10) / 10, 91.7)
})

test('queda de verdade sai com o número certo', () => {
  const pts = [...serie('2025-10-20', '2025-12-30', 40, 40), ...serie('2026-01-02', '2026-10-20', 40, 30)]
  assert.equal(variacaoNoAno(pts, { min: 29, max: 42 }), -25)
})

test('sem o fim do ano anterior na série, não afirma nada', () => {
  assert.equal(variacaoNoAno(serie('2026-02-02', '2026-10-20', 10, 12)), null)
  // o último ponto antes de 01/01 é de novembro: lacuna, base velha demais
  const comLacuna = [...serie('2025-10-01', '2025-11-20', 10, 10), ...serie('2026-01-05', '2026-10-20', 10, 8)]
  assert.equal(variacaoNoAno(comLacuna), null)
})

test('desdobramento ou grupamento sem ajuste na série: não afirma nada', () => {
  const antes = [...serie('2025-10-20', '2025-12-30', 100, 100), ...serie('2026-01-02', '2026-09-17', 100, 95)]
  // 10:1 com data-com em 18/09: a série crua cai de 95 para 9,5 num pregão
  const desdobrou = [...antes, ...serie('2026-09-18', '2026-10-20', 9.5, 9.8)]
  assert.equal(variacaoNoAno(desdobrou), null)
  // grupamento 200:1: sobe de 0,05 para 10
  const baratinho = [...serie('2025-10-20', '2025-12-30', 0.06, 0.06), ...serie('2026-01-02', '2026-09-17', 0.06, 0.05)]
  assert.equal(variacaoNoAno([...baratinho, ...serie('2026-09-18', '2026-10-20', 10, 10.4)]), null)
})

test('base fora da faixa de 52 semanas do overview: não afirma nada', () => {
  // série com a base num patamar que a mínima e a máxima ajustadas não aceitam
  const pts = [...serie('2025-10-20', '2025-12-30', 50, 50), ...serie('2026-01-02', '2026-10-20', 49, 40)]
  assert.equal(variacaoNoAno(pts, { min: 30, max: 44 }), null)
  // sem faixa, a conta sai
  assert.equal(Math.round(variacaoNoAno(pts, null)! * 10) / 10, -20)
})

test('ponto inválido e ordem trocada não atrapalham', () => {
  const pts = [...serie('2025-12-01', '2025-12-30', 20, 20), ...serie('2026-01-02', '2026-06-30', 20, 25)]
  const bagunca: PontoDaSerie[] = [...pts].reverse()
  bagunca.push({ t: 'lixo', v: 3 }, { t: '2026-03-03', v: Number.NaN }, { t: '2026-03-04', v: 0 })
  assert.equal(variacaoNoAno(bagunca), 25)
  assert.equal(variacaoNoAno(ate(pts, '2025-12-30')), null)
  assert.equal(variacaoNoAno([]), null)
})

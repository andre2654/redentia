/**
 * "Estou indo bem?" (10/11/2026): o % do CDI do topo da /carteira
 * (contraOCdi e mesesAcimaDoCdi, em utils/rentabilidadeCarteira.ts).
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { contraOCdi, mesesAcimaDoCdi } from '../app/utils/rentabilidadeCarteira.ts'

/** um ponto por fim de mês, mais um no começo do primeiro mês: ['2025-11-03', '2025-11-30', '2025-12-31', ...] */
function mensal(ini: string, vs: number[]) {
  const out = [{ t: ini, v: vs[0]! }]
  let [y, m] = [Number(ini.slice(0, 4)), Number(ini.slice(5, 7))]
  for (const v of vs.slice(1)) {
    const fim = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
    out.push({ t: fim, v })
    m++
    if (m > 12) { m = 1; y++ }
  }
  return out
}

test('o % do CDI com os dois positivos, e o mix ao lado', () => {
  const carteira = mensal('2025-11-03', [100, 101, 103, 102, 106, 117.71])
  const cdi = mensal('2025-11-03', [100, 102, 104, 106, 109, 113.65])
  const mix = mensal('2025-11-03', [100, 101, 104, 105, 110, 119.2])
  const r = contraOCdi({ carteira, cdi, benchmark: mix }, '2025-11-03', 'em 12 meses')!
  assert.equal(r.destaque, '130% do CDI')
  assert.equal(r.frase, 'Em 12 meses, rendeu 130% do CDI: 17,71% contra 13,65%.')
  assert.match(r.detalhe, /O mesmo mix de classes rendeu 19,20%\./)
})

test('carteira negativa: nada de "−40% do CDI"', () => {
  const carteira = mensal('2026-10-01', [100, 99, 97.9])
  const cdi = mensal('2026-10-01', [100, 101, 102])
  const r = contraOCdi({ carteira, cdi }, '2026-10-01', 'em 1 mês')!
  assert.equal(r.destaque, null)
  assert.equal(r.frase, 'Em 1 mês, a carteira rendeu −2,10%, e o CDI, 2,00%.')
  assert.equal(r.mix, null)
})

test('a série que começa depois do período: a frase diz desde quando', () => {
  const carteira = mensal('2025-05-14', [100, 105, 120.48])
  const cdi = mensal('2025-05-14', [100, 110, 122.55])
  const r = contraOCdi({ carteira, cdi }, '2021-11-10', 'em 5 anos')!
  assert.equal(r.frase, 'Desde 14/05/25, rendeu 91% do CDI: 20,48% contra 22,55%.')
})

test('os meses acima do CDI: só meses fechados, sem o primeiro pedaço nem o mês aberto', () => {
  // fins de nov, dez, jan, fev e mar; mar é o último ponto e sai como mês aberto
  const carteira = mensal('2025-11-03', [100, 100, 103, 103.5, 106, 107])
  const cdi = mensal('2025-11-03', [100, 101, 102, 103, 104, 105])
  // comparados: dez (3% × 0,99%), jan (0,49% × 0,98%), fev (2,4% × 0,97%) → 2 de 3
  assert.deepEqual(mesesAcimaDoCdi(carteira, cdi), { meses: 2, de: 3 })
  // pouco histórico: sem contagem
  assert.equal(mesesAcimaDoCdi(mensal('2026-09-01', [100, 101, 102]), mensal('2026-09-01', [100, 101, 102])), null)
})

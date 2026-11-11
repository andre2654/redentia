/** A frase palavra a palavra com o destaque (11/11/2026): palavrasComDestaque em utils/fraseDestaque.ts */
import test from 'node:test'
import assert from 'node:assert/strict'
import { palavrasComDestaque, partesDaFrase } from '../app/utils/fraseDestaque.ts'

const junta = (ps: ReturnType<typeof palavrasComDestaque>) => ps.map(p => p.antes + p.destaque + p.depois).join(' ')
const destaque = (ps: ReturnType<typeof palavrasComDestaque>) => ps.map(p => p.destaque).filter(Boolean).join(' ')

test('o texto não muda: as palavras juntas dão a frase', () => {
  for (const f of [
    '22 ativos: 54% em renda fixa, 29% em ações e 16% em FIIs.',
    'Em outubro, seus investimentos pagaram R$ 1.060.',
    'Novembro sem imposto até agora.',
    'Os riscos não abriram agora.',
    '38% do seu dinheiro está fora do Brasil, a maior parte nos Estados Unidos.',
  ]) assert.equal(junta(palavrasComDestaque(f)), f)
})

test('o destaque é o mesmo trecho de partesDaFrase, sem a vírgula colada', () => {
  const f = '22 ativos: 54% em renda fixa, 29% em ações e 16% em FIIs.'
  const ps = palavrasComDestaque(f)
  assert.equal(destaque(ps), partesDaFrase(f)[1])
  const renda = ps.find(p => p.destaque === 'fixa')
  assert.deepEqual(renda, { antes: '', destaque: 'fixa', depois: ',' })
})

test('o valor em R$ atravessa duas palavras', () => {
  const ps = palavrasComDestaque('Em outubro, seus investimentos pagaram R$ 1.060.')
  assert.deepEqual(ps.slice(-2), [{ antes: '', destaque: 'R$', depois: '' }, { antes: '', destaque: '1.060', depois: '.' }])
})

test('sem destaque, nenhuma palavra leva cobalto', () => {
  const ps = palavrasComDestaque('Os riscos não abriram agora.')
  assert.equal(ps.length, 5)
  assert.ok(ps.every(p => p.destaque === '' && p.depois === ''))
})

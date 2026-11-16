/**
 * Formulações da página de ativo e da calculadora de preço teto.
 * Sem recomendação, sem veredito e sem "barato" / "caro" ao lado do papel.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

function entre(src: string, inicio: string, fim: string): string {
  const a = src.indexOf(inicio)
  const b = src.indexOf(fim, a + inicio.length)
  assert.ok(a >= 0 && b > a, inicio)
  return src.slice(a, b)
}

test('o selo do Aportou Score diz a posição na lista', () => {
  const src = ler('app/composables/useAcao.ts')
  const pill = entre(src, 'const pill: AcaoTag', 'const subScores')
  assert.match(pill, /Meio da lista/)
  assert.match(pill, /Frente da lista/)
  assert.match(pill, /Parte de cima/)
  assert.match(pill, /Parte de baixo/)
  assert.doesNotMatch(pill, /Excelente|Moderado|Fraco|'Bom'/)
  assert.doesNotMatch(pill, /'green'|'amber'/)
})

test('o texto do P/L descreve o múltiplo e não chama o papel de barato ou caro', () => {
  const src = ler('app/composables/useAcao.ts')
  const bloco = entre(src, 'if (f.pl != null && f.pl > 0)', '} else if (f.pvp != null)')
  assert.match(bloco, /O múltiplo descreve essa relação/)
  assert.doesNotMatch(bloco, /mais baixos|paga caro|barat|caro|atrativ|desconto/i)
  const tag = entre(src, 'function tagPl', '/** P/VP')
  assert.match(tag, /Até 8× o lucro/)
  assert.doesNotMatch(tag, /Atrativo|Justo|Caro/)
  const pvp = entre(src, 'function tagPvp', '/** EV/EBITDA')
  assert.match(pvp, /Até 1,5× o patrimônio/)
  assert.match(pvp, /Até 0,95× o patrimônio/)
  assert.doesNotMatch(pvp, /Atrativo|Justo|Caro|Descontado|'green'|'amber'/)
})

test('a descrição da calculadora não promete veredito, e o hub não julga a cotação', () => {
  const pagina = ler('app/pages/calculadora/preco-teto/index.vue')
  const descricao = entre(pagina, 'description:', 'path:')
  assert.match(descricao, /distância até a régua de cada método/)
  assert.doesNotMatch(descricao, /veredito|preço justo|barato|caro/i)
  assert.equal(pagina.includes('Abaixo da régua'), false)
  assert.equal(pagina.includes('Na régua'), false)
  assert.equal(pagina.includes('Acima da régua'), false)
  assert.equal(pagina.includes('pt__method--positive'), false)
  assert.equal(pagina.includes('pt__method--negative'), false)
  assert.match(pagina, /linhaDiferencaPrecoTeto/)
  assert.match(pagina, /class="pt__diff"/)
  const metodo = ler('app/components/calc/CalcPrecoTetoMetodo.vue')
  const diferenca = entre(metodo, 'const diferenca = computed', 'const outros')
  assert.match(diferenca, /linhaDiferencaPrecoTeto/)
  assert.doesNotMatch(diferenca, /Barato|Caro|Justo|Abaixo da régua|Acima da régua|Na régua|abaixo do preço teto|acima do preço teto/)
  assert.match(metodo, /class="ptm__diff"/)
})

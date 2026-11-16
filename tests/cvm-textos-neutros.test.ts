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
  const diferenca = entre(metodo, 'const diferenca = computed', 'const valoresDeExemplo')
  assert.match(diferenca, /linhaDiferencaPrecoTeto/)
  assert.doesNotMatch(diferenca, /Barato|Caro|Justo|perto do preço teto|abaixo do preço teto|acima do preço teto|Abaixo da régua|Acima da régua|Na régua/)
  assert.match(metodo, /class="ptm__diff"/)
  assert.match(ler('app/utils/preco-teto-diferenca.ts'), /Diferença entre a cotação informada e o preço teto calculado/)
})

/**
 * O slug /ranking/mais-baratas-* fica: a URL não muda. O hífen cria fronteira
 * de palavra, então "baratas" apareceria num \bbarat/. O teste tira o slug
 * antes de procurar o julgamento.
 */
function semJulgamentoDeSlug(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')
    .replace(/mais-baratas-(graham|bazin)/g, ' ')
}

const JULGA_ATIVO = /\b(barat[oa]s?|car[ao]s?)\b/i

test('registry, topo e hub não chamam ativo de barato ou caro', () => {
  for (const arquivo of [
    'app/content/rankings/registry.ts',
    'app/utils/topo.ts',
    'app/pages/calculadora/preco-teto/index.vue',
  ]) {
    assert.doesNotMatch(semJulgamentoDeSlug(ler(arquivo)), JULGA_ATIVO, arquivo)
  }
  const topo = ler('app/utils/topo.ts')
  assert.match(topo, /label: 'Ranking Graham', to: '\/ranking\/mais-baratas-graham'/)
  assert.match(topo, /label: 'Ranking Bazin', to: '\/ranking\/mais-baratas-bazin'/)
  const hub = ler('app/pages/calculadora/preco-teto/index.vue')
  assert.match(hub, /title: 'Calculadora de Preço Teto 2026 - Grátis'/)
  assert.match(hub, /title: 'Ranking Graham'/)
  assert.match(hub, /title: 'Ranking Bazin'/)
  const reg = ler('app/content/rankings/registry.ts')
  assert.match(reg, /slug: 'mais-baratas-graham'/)
  assert.match(reg, /slug: 'mais-baratas-bazin'/)
  assert.match(reg, /metaTitle: 'Ranking Graham 2026: ações com maior margem até o preço teto de Graham'/)
  assert.match(reg, /metaTitle: 'Ranking Bazin 2026: ações com maior margem até o preço teto'/)
  assert.match(reg, /h1: 'Ranking Graham: ações com maior margem até o preço teto de Graham'/)
  assert.match(reg, /h1: 'Ranking Bazin: ações com maior margem até o preço teto'/)
  assert.match(ler('app/pages/ranking/[slug].vue'), /Estimativa educacional pela fórmula, não é recomendação de investimento\./)
})

/**
 * Página /calculadora/preco-teto/bazin: texto educacional, FAQ visível = FAQPage,
 * links só para rotas que existem, e a conta da calculadora intocada.
 */
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PRECO_TETO_METODOS } from '../app/content/calculadoras/preco-teto-metodos.ts'
import { RANKINGS } from '../app/content/rankings/registry.ts'
import { faqJsonLd } from '../app/utils/json-ld.ts'
import { bazinPrice } from '../app/utils/preco-teto.ts'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'

const root = new URL('..', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')
const glossario = [1, 2, 3, 4].map((n) => read(`app/content/glossario/grupo-${n}.ts`)).join('\n')
const bazin = PRECO_TETO_METODOS.bazin!

function textos(valor: unknown): string[] {
  if (typeof valor === 'string') return [valor]
  if (Array.isArray(valor)) return valor.flatMap(textos)
  if (valor && typeof valor === 'object') return Object.values(valor).flatMap(textos)
  return []
}

const copia = textos(bazin).join('\n')

test('title e description cabem no SERP, citam a fórmula e não usam ticker', () => {
  assert.ok(bazin.metaTitle.length + SUFIXO_MARCA.length <= TETO_TITULO, bazin.metaTitle)
  assert.match(bazin.metaTitle, /Bazin/)
  assert.match(bazin.metaTitle, /6%/)
  assert.ok(bazin.metaDescription.length <= TETO_DESCRICAO, String(bazin.metaDescription.length))
  assert.ok(bazin.metaDescription.length >= 120)
  assert.match(bazin.metaDescription, /não é recomendação/i)
  assert.doesNotMatch(bazin.metaDescription, /PETR|ITUB|VALE|BBAS|HGLG|TAEE/i)
})

test('a fórmula, o exemplo hipotético e o livro fecham em R$ 20,00', () => {
  assert.equal(bazinPrice(1.2), 20)
  assert.match(bazin.formula, /dividendos por ação dos últimos 12 meses/)
  assert.match(bazin.formula, /dividend yield mínimo desejado/)
  assert.equal(bazin.sections[0]?.h2, 'Como funciona o método Bazin')
  assert.equal(bazin.sections[0]?.id, 'como-funciona')
  assert.equal(bazin.sections[0]?.formula, true)
  assert.match(copia, /Faça Fortuna com Ações/)
  assert.match(copia, /publicado em 1992/)
  assert.doesNotMatch(copia, /1991/)
  assert.equal(bazin.exemplo.hipotetico, true)
  assert.match(bazin.exemplo.linhas.join('\n'), /1,20 ÷ 0,06 = R\$ 20,00/)
  assert.match(bazin.exemplo.linhas.join('\n'), /exemplo hipotético/i)
  assert.match(bazin.nota ?? '', /estimativa educacional/)
  assert.match(bazin.nota ?? '', /não uma recomendação de compra ou venda/)
  const limites = bazin.sections.find((s) => s.h2 === 'Limitações do método')?.body.join(' ') ?? ''
  assert.match(limites, /12 meses/)
  assert.match(limites, /ignora crescimento/)
  assert.match(limites, /ignora dívida/)
  assert.match(limites, /extraordinário/)
})

test('o FAQ tem de 5 a 7 respostas e o JSON-LD repete o texto visível', () => {
  assert.ok(bazin.faq.length >= 5 && bazin.faq.length <= 7, String(bazin.faq.length))
  const perguntas = bazin.faq.map((f) => f.q).join('\n')
  assert.match(perguntas, /O que é preço teto/)
  assert.match(perguntas, /Por que o método Bazin usa 6%/)
  assert.match(perguntas, /quantos anos/)
  assert.match(perguntas, /FIIs/)
  assert.match(perguntas, /Graham/)
  const ld = faqJsonLd(bazin.faq)
  assert.equal(ld['@type'], 'FAQPage')
  const entidades = ld.mainEntity as { name: string; acceptedAnswer: { text: string } }[]
  assert.deepEqual(entidades.map((e) => e.name), bazin.faq.map((f) => f.q))
  assert.deepEqual(entidades.map((e) => e.acceptedAnswer.text), bazin.faq.map((f) => f.a))
  const graham = bazin.faq.find((f) => f.link)
  assert.ok(graham)
  assert.equal(graham.link?.to, '/calculadora/preco-teto/graham')
  assert.equal(graham.a.split(graham.link!.texto).length, 2)
  const accordion = read('app/components/nu/NuFaqAccordion.vue')
  assert.match(accordion, /f\.a\.slice\(0, f\.a\.indexOf\(f\.link\.texto\)\)/)
  assert.match(accordion, /f\.a\.slice\(f\.a\.indexOf\(f\.link\.texto\) \+ f\.link\.texto\.length\)/)
  assert.match(accordion, /if \(props\.schema\) useFaqSchema\(props\.items\)/)
})

test('os links internos apontam para rotas que existem e o schema não inventa nota', () => {
  assert.ok(bazin.relacionados && bazin.relacionados.length >= 4)
  for (const link of bazin.relacionados!) {
    assert.equal(link.to.includes('mais-baratas'), false, link.to)
    if (link.to.startsWith('/glossario/')) {
      const slug = link.to.slice('/glossario/'.length)
      assert.match(glossario, new RegExp(`slug: '${slug}'`), link.to)
    } else if (link.to.startsWith('/ranking/')) {
      assert.ok(RANKINGS[link.to.slice('/ranking/'.length)], link.to)
    } else if (link.to.startsWith('/calculadora/preco-teto/')) {
      assert.ok(PRECO_TETO_METODOS[link.to.slice('/calculadora/preco-teto/'.length)], link.to)
    } else if (link.to === '/calculadora/dividend-yield') {
      assert.equal(existsSync(new URL('app/pages/calculadora/dividend-yield.vue', root)), true)
    } else if (link.to.startsWith('/guias/')) {
      const slug = link.to.slice('/guias/'.length)
      assert.match(read('app/content/guias/index.ts'), new RegExp(`slug: '${slug}'`))
    } else {
      assert.fail(link.to)
    }
  }
  assert.doesNotMatch(glossario, /slug: 'preco-teto'|slug: 'preço-teto'/)
  const pagina = read('app/components/calc/CalcPrecoTetoMetodo.vue')
  assert.match(pagina, /'@type': 'WebApplication'/)
  assert.match(pagina, /isAccessibleForFree: true/)
  assert.doesNotMatch(pagina, /aggregateRating|ratingValue|reviewCount/)
  assert.match(pagina, /<NuFaqAccordion :items="m\.faq"/)
  assert.doesNotMatch(pagina, /<NuFaqAccordion[^>]*schema="false"/)
  assert.match(pagina, /id="depois-da-calculadora"/)
  assert.ok(pagina.indexOf('<CalcConta') < pagina.indexOf('id="depois-da-calculadora"'))
  assert.match(pagina, /:id="s\.id"/)
  assert.match(pagina, /priceByMethod\(m\.id/)
  assert.match(pagina, /const dividend = ref\(1\.8\)/)
  assert.match(pagina, /const price = ref\(28\)/)
  assert.match(pagina, /Valores de exemplo/)
  assert.match(pagina, /linhaDiferencaPrecoTeto/)
  assert.match(read('app/utils/preco-teto-diferenca.ts'), /Diferença entre a cotação informada e o preço teto calculado/)
  assert.doesNotMatch(pagina, /perto do preço teto|abaixo do preço teto|acima do preço teto/)
})

test('a cópia de Bazin não recomenda ativo, não diz barato ou caro e não cita ticker', () => {
  assert.doesNotMatch(copia, /\b(barat[oa]s?|car[oa]s?|subvalorizad[oa]s?|oportunidade|compre|atrativ[oa]s?)\b/i)
  assert.doesNotMatch(copia, /lista de compra|sinalizando compra|preço de mercado|preco de mercado/i)
  assert.doesNotMatch(copia, /\b[A-Z]{4}\d{1,2}\b/)
  assert.doesNotMatch(copia, /Petrobras|Itaú|Itau|Ambev|Magazine|Taesa|Weg\b/i)
  assert.match(copia, /estimativa educacional/)
  assert.match(copia, /não é uma recomendação|não uma recomendação/i)
})

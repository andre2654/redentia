/**
 * Verbetes de provento e valuation: uma página por termo, SERP dentro do
 * orçamento, exemplo ilustrativo, fórmula quando há conta, e links para as
 * calculadoras reais. P/VP e Graham ficam educacionais: sem lista ordenada
 * e sem "ações baratas".
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createJiti } from 'jiti'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'
import { SEMENTES_SITEMAP } from '../server/data/sitemap-semente.ts'
import type { GlossaryTerm } from '../app/types/glossario.ts'

const jiti = createJiti(import.meta.url, {
  interopDefault: true,
  alias: { '~': new URL('../app/', import.meta.url).pathname, '@': new URL('../app/', import.meta.url).pathname },
})
const glossario = await jiti.import('../app/content/glossario/index.ts') as {
  getTerm: (slug: string) => GlossaryTerm | null
  glossaryLetter: (term: string) => string
  relatedTerms: (term: GlossaryTerm) => GlossaryTerm[]
  TERM_COUNT: number
}
const { getTerm, glossaryLetter, relatedTerms, TERM_COUNT } = glossario

const root = new URL('..', import.meta.url)
const ler = (p: string) => readFileSync(new URL(p, root), 'utf8')

const TERMOS: Array<{ slug: string; calc: string[]; formula?: RegExp }> = [
  { slug: 'dividend-yield', calc: ['/calculadora/dividend-yield'], formula: /DY = \(proventos dos últimos 12 meses/ },
  { slug: 'jscp', calc: ['/calculadora/dividend-yield', '/dividendos/agenda'], formula: /0,175/ },
  { slug: 'data-com', calc: ['/dividendos/agenda'] },
  { slug: 'data-ex', calc: ['/dividendos/agenda'], formula: /fechamento da data com − provento bruto/ },
  { slug: 'p-vp', calc: ['/calculadora/preco-teto'], formula: /P\/VP = preço da ação ÷ VPA/ },
  { slug: 'preco-teto-bazin', calc: ['/calculadora/preco-teto', '/calculadora/preco-teto/bazin'], formula: /÷ 0,06/ },
  { slug: 'graham', calc: ['/calculadora/preco-teto', '/calculadora/preco-teto/graham'], formula: /22,5 × LPA × VPA/ },
]

test('cada termo cabe no SERP, tem exemplo ilustrativo, ressalva e link de calculadora', () => {
  assert.equal(TERM_COUNT, 84)

  for (const esp of TERMOS) {
    const t = getTerm(esp.slug)
    assert.ok(t, esp.slug)
    assert.equal(t.letter, glossaryLetter(t.term), esp.slug)
    assert.ok(t.seoTitle, esp.slug)
    assert.equal(t.seoTitle.includes(SUFIXO_MARCA), false, t.seoTitle)
    assert.ok(t.seoTitle.length + SUFIXO_MARCA.length <= TETO_TITULO, `${esp.slug} ${t.seoTitle.length + SUFIXO_MARCA.length}`)
    assert.ok(t.short.length >= 120 && t.short.length <= TETO_DESCRICAO, `${esp.slug} desc ${t.short.length}`)
    assert.equal(t.faq.length >= 2 && t.faq.length <= 3, true, esp.slug)
    assert.equal(t.related.length >= 3 && t.related.length <= 5, true, esp.slug)
    assert.equal(relatedTerms(t).length, t.related.length, esp.slug)

    const corpo = t.body.join('\n')
    const exemplo = t.body.find((p) => p.startsWith('<strong>Exemplo ilustrativo:</strong>'))
    assert.ok(exemplo, esp.slug)
    assert.match(exemplo, /ilustrativ|hipotétic|números redondos|Não são|não são|Não há|não descreve/i, esp.slug)
    assert.match(corpo, /^Ressalva honesta:/m, esp.slug)
    assert.match(corpo, /limitaç/i, esp.slug)
    if (esp.formula) assert.match(corpo, esp.formula, esp.slug)
    const links = `${corpo}\n${t.backlink.to}`
    for (const href of esp.calc) assert.ok(links.includes(href), `${esp.slug} ${href}`)
    assert.doesNotMatch(corpo, /\b[A-Z]{4}\d{1,2}\b/, esp.slug)
    assert.match(corpo, /Não é recomendação|não é recomendação/, esp.slug)
  }
})

test('P/VP e Graham não listam ativos nem chamam ação de barata', () => {
  for (const slug of ['p-vp', 'graham']) {
    const t = getTerm(slug)!
    const texto = [t.term, t.short, t.seoTitle, ...t.body, t.backlink.label, t.backlink.to, ...t.faq.flatMap((f) => [f.q, f.a])].join('\n')
    assert.doesNotMatch(texto, /ações baratas|acoes baratas|mais-baratas|oportunidade/i, slug)
    assert.doesNotMatch(texto, /\bbarat[oa]s?\b/i, slug)
    assert.doesNotMatch(texto, /\/ranking\//, slug)
    assert.equal(t.backlink.to.startsWith('/calculadora/preco-teto'), true, slug)
  }
  const graham = getTerm('graham')!
  assert.match(graham.body.join('\n'), /Não publica lista de ativos/)
  assert.match(getTerm('p-vp')!.body.join('\n'), /Não ordena ativos por P\/VP/)
  assert.match(graham.body.join('\n'), /raiz de 900 é R\$ 30,00/)
  assert.match(getTerm('preco-teto-bazin')!.body.join('\n'), /1,20 ÷ 0,06/)
  assert.match(getTerm('jscp')!.body.join('\n'), /17,5% de IR retido na fonte/)
  assert.match(getTerm('data-ex')!.body.join('\n'), /R\$ 29,00/)
})

test('a página do termo emite canonical, BreadcrumbList e DefinedTerm, e as calculadoras linkam o verbete', () => {
  const pagina = ler('app/pages/glossario/[slug].vue')
  assert.match(pagina, /seoTitle/)
  assert.match(pagina, /'@type': 'DefinedTerm'/)
  assert.match(pagina, /breadcrumbs:/)
  assert.match(ler('app/composables/usePageSeo.ts'), /rel: 'canonical'/)
  assert.match(ler('app/components/nu/NuFaqAccordion.vue'), /useFaqSchema/)

  const dy = ler('app/pages/calculadora/dividend-yield.vue')
  assert.match(dy, /'dividend-yield'/)
  assert.match(dy, /'jscp'/)
  const teto = ler('app/pages/calculadora/preco-teto/index.vue')
  assert.match(teto, /preco-teto-bazin/)
  assert.match(teto, /'graham'/)
  assert.match(teto, /'p-vp'/)
  const metodos = ler('app/content/calculadoras/preco-teto-metodos.ts')
  assert.match(metodos, /\/glossario\/preco-teto-bazin/)
  assert.match(metodos, /\/glossario\/graham/)
  assert.match(metodos, /\/glossario\/p-vp/)
  assert.match(ler('app/pages/dividendos/agenda/index.vue'), /\/glossario\/data-com/)
  assert.match(ler('app/pages/dividendos/agenda/index.vue'), /\/glossario\/data-ex/)
  assert.match(ler('app/pages/dividendos/agenda/[mes].vue'), /\/glossario\/data-com/)
  assert.match(ler('app/pages/calculadora/imposto-renda.vue'), /\/glossario\/jscp/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/glossario\/preco-teto-bazin/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/glossario\/data-ex/)
})

test('o sitemap de glossário ganha os termos novos e conserva os que já estavam', () => {
  const xml = SEMENTES_SITEMAP.glossario?.xml ?? ''
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!)
  for (const slug of ['dividend-yield', 'jscp', 'fii', 'data-com', 'data-ex', 'p-vp', 'preco-teto-bazin', 'graham']) {
    assert.ok(locs.some((u) => u.endsWith(`/glossario/${slug}`)), slug)
  }
  assert.equal(locs.length, SEMENTES_SITEMAP.glossario?.urls)
  assert.ok(locs.length >= 84, String(locs.length))
  assert.equal(new Set(locs).size, locs.length)
})

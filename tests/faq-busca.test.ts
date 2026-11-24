/**
 * FAQ ampliado com perguntas do autocomplete (24 nov 2026, 10:03 UTC).
 * Um FAQPage por página, e o texto do JSON-LD é o texto visível do acordeão.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { faqJsonLd } from '../app/utils/json-ld.ts'
import { montarPrecoTeto } from '../app/utils/preco-teto-pagina.ts'
import { ANO_JCP, montarBlocosDividendos, type EntradaBlocosDividendos } from '../app/utils/dividendosBlocos.ts'
import type { ProventoRow } from '../app/utils/proventos.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

const PROIBIDO_TETO = /\b(barato|caro|sobrevalorizad[oa]|oportunidade|compre|venda|preço-alvo|preco-alvo)\b|preço justo|\bjusto\b|margem de segurança|retorno garantido|\bvender\b/i
const PROMESSA = /retorno garantido|garantimos|compre agora|recomendamos comprar|vai render|promessa de retorno/i

function paresDoVue(src: string): { q: string, a: string }[] {
  const re = /\{\s*q:\s*'((?:\\'|[^'])*)',\s*a:\s*'((?:\\'|[^'])*)'/g
  return [...src.matchAll(re)].map((m) => ({ q: m[1]!.replace(/\\'/g, "'"), a: m[2]!.replace(/\\'/g, "'") }))
}

function assertUmFaqPage(items: { q: string, a: string }[], onde: string) {
  assert.ok(items.length >= 1, onde)
  assert.equal(new Set(items.map((i) => i.q)).size, items.length, `${onde}: pergunta repetida`)
  for (const item of items) {
    assert.match(item.q, /\?/, item.q)
    assert.ok(item.a.trim().length > 40, item.q)
    assert.equal(item.q.includes('\n'), false, item.q)
  }
  const ld = faqJsonLd(items)
  const cru = JSON.stringify(ld)
  const parsed = JSON.parse(cru) as {
    '@context': string
    '@type': string
    mainEntity: { '@type': string, name: string, acceptedAnswer: { '@type': string, text: string } }[]
  }
  assert.equal(parsed['@context'], 'https://schema.org', onde)
  assert.equal(parsed['@type'], 'FAQPage', onde)
  assert.equal(cru.split('"FAQPage"').length - 1, 1, `${onde}: mais de um FAQPage`)
  assert.equal(parsed.mainEntity.length, items.length, onde)
  assert.deepEqual(parsed.mainEntity.map((e) => e['@type']), items.map(() => 'Question'), onde)
  assert.deepEqual(parsed.mainEntity.map((e) => e.name), items.map((i) => i.q), onde)
  assert.deepEqual(parsed.mainEntity.map((e) => e.acceptedAnswer.text), items.map((i) => i.a), onde)
  for (const e of parsed.mainEntity) {
    assert.equal(e.acceptedAnswer['@type'], 'Answer')
    assert.equal(e.name, e.name.trim())
    assert.equal(e.acceptedAnswer.text, e.acceptedAnswer.text.trim())
  }
}

function codigoSemComentario(src: string): string {
  return src.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n')
}

function assertUmAcordeao(src: string, onde: string) {
  const codigo = codigoSemComentario(src)
  assert.equal(codigo.match(/<NuFaqAccordion\b/g)?.length ?? 0, 1, onde)
  assert.doesNotMatch(codigo, /schema="false"/, onde)
  assert.doesNotMatch(codigo, /useFaqSchema\(/, onde)
  assert.doesNotMatch(codigo, /application\/ld\+json/, onde)
}

test('o acordeão emite um FAQPage e o JSON-LD repete a pergunta e a resposta visíveis', () => {
  const acc = ler('app/components/nu/NuFaqAccordion.vue')
  assert.match(acc, /if \(props\.schema\) useFaqSchema\(props\.items\)/)
  assert.match(acc, /\{\{ f\.q \}\}/)
  assert.match(acc, /\{\{ f\.a \}\}/)
  const schema = ler('app/composables/useFaqSchema.ts')
  assert.match(schema, /JSON\.stringify\(faqJsonLd\(items\)\)/)
})

test('juros compostos: um FAQPage, perguntas do autocomplete e title intacto', () => {
  const src = ler('app/pages/calculadora/juros-compostos/index.vue')
  assertUmAcordeao(src, 'juros')
  assert.match(src, /title: 'Calculadora de juros compostos com aporte mensal'/)
  assert.match(src, /Simule quanto você junta guardando R\$ 500 ou outro valor por mês/)
  const faq = paresDoVue(src)
  assertUmFaqPage(faq, 'juros')
  for (const q of [
    'Como calcular juros compostos?',
    'Como calcular juros compostos com aportes mensais?',
    'Qual a fórmula de juros compostos?',
    'O que é juros compostos?',
    'Como calcular juros compostos no Excel?',
    'Como calcular juros compostos na HP 12C?',
    'Como calcular juros compostos e juros simples?',
    'Onde investir com juros compostos?',
  ]) assert.ok(faq.some((f) => f.q === q), q)
  const novas = faq.filter((f) => f.q.startsWith('Como calcular juros') || f.q.startsWith('Qual a fórmula de juros') || f.q.startsWith('O que é juros') || f.q.startsWith('Onde investir com juros'))
  const texto = novas.map((f) => f.a).join('\n')
  assert.doesNotMatch(texto, PROMESSA)
  assert.doesNotMatch(texto, /15% (de IR )?retid/)
  assert.match(texto, /taxa mensal equivalente/)
  assert.match(texto, /não indica compra nem venda/)
  assert.match(src, /até R\$ 50 mil por mês/)
})

test('calculadora de preço teto: um FAQPage, perguntas do autocomplete e title intacto', () => {
  const src = ler('app/pages/calculadora/preco-teto/index.vue')
  assertUmAcordeao(src, 'preco-teto')
  assert.match(src, /title: 'Calculadora de Preço Teto 2026 - Grátis'/)
  assert.match(src, /Calcule o preço teto de uma ação da B3 por Graham, Bazin, P\/L e VPA/)
  const faq = paresDoVue(src)
  assertUmFaqPage(faq, 'preco-teto')
  for (const q of [
    'O que é preço teto de uma ação?',
    'O que é preço teto de Bazin?',
    'O que é preço teto projetivo?',
    'Qual a fórmula do preço teto de Bazin?',
    'Qual a diferença entre o preço teto de Bazin e o de Graham?',
  ]) assert.ok(faq.some((f) => f.q === q), q)
  const formula = faq.find((f) => f.q === 'Qual a fórmula do preço teto de Bazin?')!
  assert.match(formula.a, /1,20 ÷ 0,06 = 20/)
  assert.match(formula.a, /não recomendação de compra ou venda/)
  assert.match(faq.find((f) => f.q === 'O que é preço teto projetivo?')!.a, /crescimento zero/)
})

test('template /calculadora/preco-teto/{T}: um FAQPage e números só com a data do pregão', () => {
  const vue = ler('app/components/calc/CalcPrecoTetoTicker.vue')
  assertUmAcordeao(vue, 'ticker')
  assert.match(vue, /<NuFaqAccordion :items="view\.faq"/)
  const petr = montarPrecoTeto({
    ticker: 'PETR4',
    nomeBruto: 'PETROBRAS PN',
    tipo: 'STOCK',
    preco: 38,
    priceDate: '2026-10-23',
    setorBruto: 'Energy',
    lpa: 8,
    vpa: 35,
    dividendo: 5,
    dividendoFonte: 'soma',
    dyPct: 13.16,
    sectorPL: 6,
    sectorPLFonte: 'setor',
    temPaginaDividendos: true,
  })
  assert.ok(petr)
  assertUmFaqPage(petr.faq, 'PETR4')
  assert.doesNotMatch(petr.faq.map((f) => `${f.q} ${f.a}`).join('\n'), PROIBIDO_TETO)
  const oQue = petr.faq.find((f) => f.q === 'O que é o preço teto de PETR4?')!
  const bazin = petr.faq.find((f) => f.q === 'Qual a fórmula do preço teto de Bazin de PETR4?')!
  const como = petr.faq.find((f) => f.q === 'Como calcular o preço teto de PETR4?')!
  assert.match(oQue.a, /pregão de 23 de outubro de 2026/)
  assert.match(bazin.a, /5,00/)
  assert.match(bazin.a, /0,06/)
  assert.match(bazin.a, /pregão de 23 de outubro de 2026/)
  assert.match(como.a, /pregão de 23 de outubro de 2026/)
  assert.match(petr.title, /Preço Teto PETR4 hoje/)
  assert.doesNotMatch(petr.description, /O que é o preço teto/)

  const fii = montarPrecoTeto({
    ticker: 'HGLG11',
    nomeBruto: 'CSHG LOG',
    tipo: 'REIT',
    preco: 160,
    priceDate: '2026-10-23',
    setorBruto: 'Real Estate',
    lpa: 0,
    vpa: 100,
    dividendo: 1.2,
    dividendoFonte: 'soma',
    dyPct: 10,
    sectorPL: 0,
    sectorPLFonte: 'sem-lpa',
    temPaginaDividendos: true,
  })
  assert.ok(fii)
  assertUmFaqPage(fii.faq, 'HGLG11')
  assert.doesNotMatch(fii.faq.map((f) => `${f.q} ${f.a}`).join('\n'), PROIBIDO_TETO)
  assert.match(fii.faq.find((f) => f.q === 'Qual a fórmula do preço teto de Bazin de HGLG11?')!.a, /por cota/)
  assert.match(fii.faq.find((f) => f.q === 'Como calcular o preço teto de HGLG11?')!.a, /pregão de 23 de outubro de 2026/)
})

function linha(over: Partial<ProventoRow> & Pick<ProventoRow, 'date' | 'rate' | 'label'>): ProventoRow {
  return {
    hasExDate: true,
    payDate: over.date,
    income: true,
    ...over,
  }
}

function baseDiv(over: Partial<EntradaBlocosDividendos> = {}): EntradaBlocosDividendos {
  return {
    ticker: 'PETR4',
    isFii: false,
    isBdr: false,
    rows: [],
    dy: null,
    dyBasis: null,
    dyMatchesSum: false,
    price: null,
    priceDate: null,
    hoje: '2026-11-24',
    ...over,
  }
}

test('template /dividendos/{T}: um FAQPage, e valor citado só com data da página', () => {
  const vue = ler('app/pages/dividendos/[ticker].vue')
  assertUmAcordeao(vue, 'dividendos')
  assert.match(vue, /<NuFaqAccordion :items="div\.faq"/)
  assert.match(vue, /title: div\.value\.seo\.title/)
  assert.match(vue, /description: div\.value\.seo\.description/)
  const comp = ler('app/composables/useDividendos.ts')
  assert.equal(comp.match(/\.\.\.blocosPack\.faq/g)?.length, 1)
  assert.doesNotMatch(comp, /useFaqSchema\(/)

  const pack = montarBlocosDividendos(baseDiv({
    rows: [
      linha({ date: '2026-11-30', payDate: '2026-12-15', rate: 0.5, label: 'Dividendo' }),
      linha({ date: '2026-08-21', payDate: '2026-11-23', rate: 0.67, label: 'JCP' }),
    ],
  }))
  assertUmFaqPage(pack.faq, 'dividendos PETR4')
  const quando = pack.faq.find((f) => f.q === 'Dividendos PETR4 quando paga?')!
  const oQue = pack.faq.find((f) => f.q === 'O que é a data com de dividendos de PETR4?')!
  const ano = pack.faq.find((f) => f.q === `Qual a data com de dividendos de PETR4 em ${ANO_JCP}?`)!
  assert.match(quando.a, /15 dez 2026/)
  assert.match(quando.a, /R\$ 0,50/)
  assert.match(quando.a, /Fonte: avisos de proventos da B3, consultados até 24 nov 2026/)
  assert.match(quando.a, /Não é promessa de pagamento futuro/)
  assert.match(oQue.a, /último pregão/)
  assert.match(oQue.a, /30 nov 2026/)
  assert.match(oQue.a, /24 nov 2026/)
  assert.match(ano.a, /30 nov 2026/)
  assert.match(ano.a, /R\$ 0,50/)
  assert.doesNotMatch(ano.a, /0,67/)
  for (const f of [quando, oQue, ano]) {
    if (/R\$/.test(f.a)) assert.match(f.a, /24 nov 2026/, f.q)
    assert.doesNotMatch(f.a, /Lei 15\.270\/2025 art\. 6º-A/)
    assert.doesNotMatch(f.a, PROMESSA)
  }

  const vazio = montarBlocosDividendos(baseDiv({ rows: null }))
  assert.equal(vazio.faq.length, 0)

  const semAviso = montarBlocosDividendos(baseDiv())
  const semValor = semAviso.faq.find((f) => f.q === 'Dividendos PETR4 quando paga?')!
  assert.match(semValor.a, /Não há pagamento futuro/)
  assert.doesNotMatch(semValor.a, /R\$/)
  assert.match(semValor.a, /24 nov 2026/)

  const fii = montarBlocosDividendos(baseDiv({
    ticker: 'MXRF11',
    isFii: true,
    rows: [linha({ date: '2026-11-28', payDate: '2026-12-10', rate: 0.11, label: 'Rendimento' })],
  }))
  assert.ok(fii.faq.some((f) => f.q === 'Rendimentos de MXRF11: quando paga?'))
  assert.ok(fii.faq.some((f) => f.q === 'O que é a data com de dividendos de um FII como MXRF11?'))
  assert.doesNotMatch(JSON.stringify(fii), /por ação|JCP MXRF11/)
  assert.match(fii.faq.find((f) => f.q === 'Rendimentos de MXRF11: quando paga?')!.a, /por cota/)
  assert.match(fii.faq.find((f) => f.q === 'Rendimentos de MXRF11: quando paga?')!.a, /24 nov 2026/)
})

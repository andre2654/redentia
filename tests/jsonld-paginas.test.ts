/**
 * JSON-LD de /business e /jantar: presente nas páginas, JSON válido, e só
 * fato que a página já publica. O título de /business cabe no SERP e traz
 * o termo de busca.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TIPOS_DE_CASA } from '../app/utils/business-lead.ts'
import { TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'
import {
  DESCRICAO_BUSINESS,
  FRASES_BUSINESS,
  ORGANIZACAO_ID,
  PUBLICO_BUSINESS,
  TITULO_BUSINESS,
  jsonLdBusiness,
  jsonLdJantar,
} from '../app/utils/jsonld-paginas.ts'

const business = readFileSync(new URL('../app/pages/business/index.vue', import.meta.url), 'utf8')
const jantar = readFileSync(new URL('../app/pages/jantar.vue', import.meta.url), 'utf8')
const paginas = readFileSync(new URL('../server/utils/site-pages.ts', import.meta.url), 'utf8')

function semComentarios(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')
}

function landing(): string {
  const arquivos = [
    'components/business/RbHero.vue',
    'components/business/RbDivisao.vue',
    'components/business/RbSeguranca.vue',
    'components/business/RbProva.vue',
    'components/business/RbHeader.vue',
  ]
  return arquivos
    .map((f) => semComentarios(readFileSync(new URL(`../app/${f}`, import.meta.url), 'utf8')))
    .join('\n')
    .replace(/\s+/g, ' ')
}

/** O mesmo embrulho do usePageSeo: @context e JSON de verdade. */
function nos(items: Record<string, unknown>[]): unknown[] {
  return items.map((item) => JSON.parse(JSON.stringify({ '@context': 'https://schema.org', ...item })))
}

function chaves(value: unknown, acc = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) chaves(item, acc)
    return acc
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      acc.add(k)
      chaves(v, acc)
    }
  }
  return acc
}

const PROIBIDO = ['aggregateRating', 'ratingValue', 'reviewCount', 'review', 'offers', 'price', 'priceCurrency', 'lowPrice', 'highPrice']

test('o título de /business traz o termo de busca e cabe em 60, com a description', () => {
  assert.match(business, /usePageSeo\(/)
  assert.match(business, /title:\s*TITULO_BUSINESS/)
  assert.match(business, /description:\s*DESCRICAO_BUSINESS/)
  assert.match(business, /titleTemplate:\s*null/)
  assert.equal(TITULO_BUSINESS.includes('Redentia'), true)
  assert.match(TITULO_BUSINESS, /plataforma para assessorias/)
  assert.match(TITULO_BUSINESS, /family offices/)
  assert.ok(TITULO_BUSINESS.length <= TETO_TITULO, `${TITULO_BUSINESS.length}: ${TITULO_BUSINESS}`)
  assert.match(DESCRICAO_BUSINESS, /assessorias/)
  assert.match(DESCRICAO_BUSINESS, /family offices/)
  assert.ok(DESCRICAO_BUSINESS.length <= TETO_DESCRICAO, `${DESCRICAO_BUSINESS.length}: ${DESCRICAO_BUSINESS}`)
  assert.match(paginas, /title:\s*TITULO_BUSINESS/)
  assert.match(paginas, /description:\s*DESCRICAO_BUSINESS/)
  const template = business.slice(business.indexOf('<template>'), business.lastIndexOf('</template>'))
  assert.equal(template.includes(TITULO_BUSINESS), false)
  assert.equal(template.includes(DESCRICAO_BUSINESS), false)
})

test('a /business publica SoftwareApplication e Service em JSON válido, sem preço nem nota', () => {
  assert.match(business, /structuredData:\s*jsonLdBusiness/)
  const tipos = jsonLdBusiness.map((n) => n['@type'])
  assert.deepEqual(tipos, ['SoftwareApplication', 'Service'])
  const emitidos = nos(jsonLdBusiness)
  assert.equal(emitidos.length, 2)
  const texto = JSON.stringify(emitidos)
  assert.equal(JSON.parse(texto).length, 2)
  for (const no of emitidos as Array<Record<string, unknown>>) {
    assert.equal(no['@context'], 'https://schema.org')
    assert.equal(no.name, 'Redentia For Business')
    assert.equal(no.url, 'https://www.redentia.com.br/business')
    const provider = no.provider as Record<string, unknown>
    assert.deepEqual(provider, { '@id': ORGANIZACAO_ID })
    assert.equal(ORGANIZACAO_ID, 'https://www.redentia.com.br/#organization')
  }
  const ch = chaves(emitidos)
  for (const k of PROIBIDO) assert.equal(ch.has(k), false, k)
  assert.doesNotMatch(texto, /R\$|aggregateRating|ratingValue/)

  const corpus = landing()
  assert.match(corpus, /Redentia For Business/)
  for (const frase of FRASES_BUSINESS) {
    assert.ok(corpus.includes(frase), frase)
    assert.ok(texto.includes(frase), frase)
  }
  const rotulos = new Set(TIPOS_DE_CASA.map((t) => t.label))
  for (const publico of PUBLICO_BUSINESS) assert.equal(rotulos.has(publico), true, publico)
  const audiencia = (emitidos[0] as Record<string, { audienceType: string }>).audience.audienceType
  for (const publico of PUBLICO_BUSINESS) assert.ok(audiencia.includes(publico), publico)
  assert.equal(audiencia.includes('Outro'), false)
})

test('o /jantar publica Event em JSON válido, com mês e sem ingresso', () => {
  assert.match(jantar, /usePageSeo\(/)
  assert.match(jantar, /structuredData:\s*jsonLdJantar/)
  assert.doesNotMatch(jantar, /organiz/i)
  const emitidos = nos(jsonLdJantar)
  assert.equal(emitidos.length, 1)
  const texto = JSON.stringify(emitidos)
  const no = JSON.parse(texto)[0]
  assert.equal(no['@context'], 'https://schema.org')
  assert.equal(no['@type'], 'Event')
  assert.equal(no.name, 'Redentia Wealth Intelligence Dinner')
  assert.equal(no.startDate, '2026-12')
  assert.doesNotMatch(texto, /2026-12-\d/)
  assert.equal(no.eventAttendanceMode, 'https://schema.org/OfflineEventAttendanceMode')
  assert.equal(no.eventStatus, 'https://schema.org/EventScheduled')
  assert.equal(no.maximumAttendeeCapacity, 10)
  assert.equal(no.url, 'https://www.redentia.com.br/jantar')
  assert.deepEqual(no.organizer, { '@id': 'https://www.redentia.com.br/#organization' })
  assert.equal(no.location.name, undefined)
  assert.equal(no.location.address.addressLocality, 'São Paulo')
  assert.equal(no.location.address.addressCountry, 'BR')
  assert.equal(no.location.address.streetAddress, undefined)
  assert.match(no.description, /10 cadeiras, uma mesa, nenhuma palestra/)
  assert.match(no.description, /Sócios, diretores e C-level de assessorias, family offices, bancos e gestoras/)
  assert.match(jantar, /10 cadeiras, uma mesa, nenhuma palestra/)
  assert.match(jantar, /Sócios, diretores e C-level de assessorias, family offices, bancos e gestoras/)
  const ch = chaves(emitidos)
  for (const k of PROIBIDO) assert.equal(ch.has(k), false, k)
  assert.doesNotMatch(texto, /R\$|600|restaurante|André|Andre|oferta/i)
})

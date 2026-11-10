/**
 * Entidade Redentia no JSON-LD da home: um script Organization, JSON válido,
 * e WebSite apontando para o @id em vez de repetir o objeto.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EMPRESA } from '../shared/utils/empresa.ts'
import {
  EMAIL_SUPORTE,
  faqJsonLd,
  idOrganizacao,
  organizacaoJsonLd,
  scriptsLdInicio,
} from '../app/utils/json-ld.ts'

const SITE = 'https://www.redentia.com.br'
const ler = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), 'utf8')

function faqsDaHome(): { q: string, a: string }[] {
  const src = ler('app/composables/useMercado.ts')
  const inicio = src.indexOf('export const MERCADO_FAQS')
  const fim = src.indexOf('\n]', inicio)
  assert.ok(inicio > 0 && fim > inicio, 'MERCADO_FAQS não encontrado')
  const bloco = src.slice(inicio, fim)
  const qs = [...bloco.matchAll(/q: '([^']*)'/g)].map((m) => m[1]!)
  const as = [...bloco.matchAll(/a: '([^']*)'/g)].map((m) => m[1]!)
  assert.equal(qs.length, as.length)
  assert.equal(qs.length, 5)
  return qs.map((q, i) => ({ q, a: as[i]! }))
}

function tipos(node: unknown, acc: string[] = []): string[] {
  if (Array.isArray(node)) {
    for (const item of node) tipos(item, acc)
    return acc
  }
  if (node && typeof node === 'object') {
    const rec = node as Record<string, unknown>
    const t = rec['@type']
    if (typeof t === 'string') acc.push(t)
    else if (Array.isArray(t)) {
      for (const item of t) if (typeof item === 'string') acc.push(item)
    }
    for (const valor of Object.values(rec)) tipos(valor, acc)
  }
  return acc
}

test('a home emite JSON válido com uma única Organization', () => {
  const scripts = scriptsLdInicio(SITE, faqsDaHome())
  const nos = scripts.map((script) => JSON.parse(script) as Record<string, unknown>)
  assert.equal(scripts.length, 4)

  for (const script of scripts) {
    assert.equal(JSON.stringify(JSON.parse(script)), script)
  }

  const lista = tipos(nos)
  assert.deepEqual(
    lista.filter((t) => t === 'Organization'),
    ['Organization'],
  )
  assert.equal(scripts.join('\n').split('"@type":"Organization"').length - 1, 1)
  assert.deepEqual(nos.map((n) => n['@type']), ['Organization', 'WebSite', 'BreadcrumbList', 'FAQPage'])

  const org = nos[0]!
  assert.deepEqual(org, {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://www.redentia.com.br/#organization',
    name: 'Redentia',
    legalName: EMPRESA.razaoSocial,
    taxID: EMPRESA.cnpj,
    url: 'https://www.redentia.com.br',
    logo: 'https://www.redentia.com.br/logo-azul.svg',
    description: 'Plataforma brasileira de análise de investimentos com IA: ações, FIIs, notícias, teses e carteira.',
    sameAs: [
      'https://www.instagram.com/redentia.wealth/',
      'https://www.linkedin.com/company/redentia',
      'https://apps.apple.com/app/id6823992050',
    ],
    founder: {
      '@type': 'Person',
      '@id': 'https://www.redentia.com.br/#andre-saraiva',
      name: 'André Saraiva',
      sameAs: [
        'https://x.com/andrevisaraiva',
        'https://www.threads.com/@andrevsaraiva',
      ],
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'relacionamento@redentia.com.br',
      url: 'https://www.redentia.com.br/institucional/contact',
    },
  })

  const website = nos[1]!
  assert.deepEqual(website.publisher, { '@id': 'https://www.redentia.com.br/#organization' })
  assert.equal(website['@id'], 'https://www.redentia.com.br/#website')
  assert.equal(faqJsonLd(faqsDaHome())['@type'], 'FAQPage')
  assert.equal(JSON.stringify(nos).includes('redentia.app'), false)
  assert.equal(JSON.stringify(nos).includes('wa.me'), false)
  assert.equal(JSON.stringify(nos).includes('utm_'), false)
})

test('X e Threads ficam no fundador; a barra final da origem não duplica o @id', () => {
  const org = organizacaoJsonLd(`${SITE}/`)
  assert.equal(org['@id'], 'https://www.redentia.com.br/#organization')
  assert.equal(idOrganizacao(`${SITE}/`), org['@id'])
  assert.deepEqual(org.founder.sameAs, [
    'https://x.com/andrevisaraiva',
    'https://www.threads.com/@andrevsaraiva',
  ])
  assert.equal(org.sameAs.some((url) => /x\.com|threads\.com|twitter\.com/.test(url)), false)
  const acomp = ler('app/utils/acompanhe-andre.ts')
  assert.match(acomp, /https:\/\/x\.com\/andrevisaraiva/)
  assert.match(acomp, /https:\/\/www\.threads\.com\/@andrevsaraiva/)
  assert.doesNotMatch(acomp, /x\.com\/redentia|threads\.com\/@redentia|twitter\.com\/redentia/)
})

test('o schema usa o e-mail publicado e não o WhatsApp do jantar', () => {
  const org = organizacaoJsonLd(SITE)
  assert.equal(org.contactPoint.email, EMAIL_SUPORTE)
  assert.equal(EMAIL_SUPORTE, 'relacionamento@redentia.com.br')
  assert.match(ler('app/components/nu/NuFooter.vue'), new RegExp(`mailto:${EMAIL_SUPORTE}`))
  assert.match(ler('app/pages/institucional/contact.vue'), new RegExp(EMAIL_SUPORTE))
  assert.match(ler('app/pages/jantar.vue'), /wa\.me\/5511951495841/)
  assert.equal(JSON.stringify(org).includes('5511951495841'), false)
  assert.equal(JSON.stringify(org).includes('hoursAvailable'), false)
})

test('o logo do schema é o arquivo que o site já serve', () => {
  const org = organizacaoJsonLd(SITE)
  assert.equal(org.logo, `${SITE}/logo-azul.svg`)
  const svg = ler('public/logo-azul.svg')
  assert.match(svg, /<svg\b/)
})

test('a home, o app e o MCP usam o helper, e o rodapé usa o Instagram oficial', () => {
  const app = ler('app/app.vue')
  assert.match(app, /JSON\.stringify\(organizacaoJsonLd\(site\)\)/)
  assert.equal(app.match(/application\/ld\+json/g)?.length, 1)
  assert.doesNotMatch(app, /redentia\.wealth/)

  const index = ler('app/pages/index.vue')
  assert.match(index, /websiteInicio\(siteOrigin, entidade\)/)
  assert.match(index, /public\.siteUrl/)
  assert.doesNotMatch(index, /'@type': 'Organization'/)

  const seo = ler('app/composables/usePageSeo.ts')
  assert.match(seo, /breadcrumbJsonLd\(origin, input\.breadcrumbs\)/)
  assert.match(seo, /if \(tipo === 'WebSite' \|\| tipo === 'WebPage'\)/)
  assert.match(seo, /normalized\.publisher \?\?= refOrg/)
  assert.match(seo, /tipo === 'SoftwareApplication'/)
  assert.match(seo, /normalized\.provider \?\?= refOrg/)
  assert.match(seo, /publisher: refOrg/)

  const faq = ler('app/composables/useFaqSchema.ts')
  assert.match(faq, /JSON\.stringify\(faqJsonLd\(items\)\)/)
  assert.doesNotMatch(faq, /Organization/)

  const mercado = ler('app/components/mercado/MercadoContent.vue')
  assert.match(mercado, /<NuFaqAccordion :items="MERCADO_FAQS" \/>/)

  const mcp = ler('app/pages/mcp.vue')
  assert.match(mcp, /'provider': referenciaOrganizacao\(entidade\)/)

  const rodape = ler('app/components/nu/NuFooter.vue')
  const rodapeBiz = ler('app/components/business/RbFooter.vue')
  for (const src of [rodape, rodapeBiz]) {
    assert.match(src, /https:\/\/www\.instagram\.com\/redentia\.wealth\//)
    assert.doesNotMatch(src, /instagram\.com\/redentia\.app/)
  }

  assert.match(ler('nuxt.config.ts'), /siteUrl: process\.env\.NUXT_PUBLIC_SITE_URL \|\| 'https:\/\/www\.redentia\.com\.br'/)
  assert.match(ler('app/composables/useSiteOrigin.ts'), /return useRuntimeConfig\(\)\.public\.siteUrl/)
})

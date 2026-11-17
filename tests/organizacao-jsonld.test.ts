/**
 * Entidade Aportou no JSON-LD da home: um script Organization, JSON válido,
 * e WebSite apontando para o @id em vez de repetir o objeto. Veio da
 * redentia-v2 (#145) com a Redentia; no site novo a entidade é a Aportou, com a
 * Redentia como empresa-mãe (a virada de domínio, 14/11/2026).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EMPRESA } from '../shared/utils/empresa.ts'
import { MARCA } from '../shared/utils/marca.ts'
import {
  EMAIL_SUPORTE,
  faqJsonLd,
  idOrganizacao,
  organizacaoJsonLd,
  scriptsLdInicio,
} from '../app/utils/json-ld.ts'

const SITE = 'https://aportou.com.br'
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
  assert.ok(qs.length >= 5)
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

  // um script de Organization só (a Aportou); a outra Organization é a Redentia, empresa-mãe, dentro dela
  const lista = tipos(nos)
  assert.deepEqual(
    lista.filter((t) => t === 'Organization'),
    ['Organization', 'Organization'],
  )
  assert.equal(scripts.join('\n').split('"@type":"Organization"').length - 1, 2)
  assert.equal(nos.filter((n) => n['@type'] === 'Organization').length, 1)
  assert.deepEqual((nos[0] as { parentOrganization?: unknown }).parentOrganization, { '@type': 'Organization', name: 'Redentia', url: 'https://www.redentia.com.br' })
  assert.deepEqual(nos.map((n) => n['@type']), ['Organization', 'WebSite', 'BreadcrumbList', 'FAQPage'])

  const org = nos[0]!
  assert.deepEqual(org, {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://aportou.com.br/#organization',
    name: MARCA.nome,
    slogan: MARCA.frase,
    parentOrganization: { '@type': 'Organization', name: 'Redentia', url: 'https://www.redentia.com.br' },
    legalName: EMPRESA.razaoSocial,
    taxID: EMPRESA.cnpj,
    url: 'https://aportou.com.br',
    logo: 'https://aportou.com.br/icone-aportou.svg',
    description: MARCA.descricao,
    sameAs: [
      'https://www.instagram.com/aportou.app/',
      'https://apps.apple.com/app/id6823992050',
    ],
    founder: {
      '@type': 'Person',
      '@id': 'https://aportou.com.br/#andre-saraiva',
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
      url: 'https://aportou.com.br/institucional/contact',
    },
  })
  assert.equal(MARCA.nome, 'Aportou')

  const website = nos[1]!
  assert.deepEqual(website.publisher, { '@id': 'https://aportou.com.br/#organization' })
  assert.equal(website['@id'], 'https://aportou.com.br/#website')
  assert.equal(website.name, 'Aportou')
  assert.equal(faqJsonLd(faqsDaHome())['@type'], 'FAQPage')
  assert.equal(JSON.stringify(nos).includes('redentia.wealth'), false)
  assert.equal(JSON.stringify(nos).includes('linkedin.com/company/redentia'), false)
  assert.equal(JSON.stringify(nos).includes('instagram.com/aportou.app'), true)
  assert.equal(JSON.stringify(nos).includes('wa.me'), false)
  assert.equal(JSON.stringify(nos).includes('utm_'), false)
})

test('X e Threads ficam no fundador; a barra final da origem não duplica o @id', () => {
  const org = organizacaoJsonLd(`${SITE}/`)
  assert.equal(org['@id'], 'https://aportou.com.br/#organization')
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
  assert.match(ler('app/components/nu/NuFooterAportou.vue'), new RegExp(`mailto:${EMAIL_SUPORTE}`))
  assert.match(ler('app/pages/institucional/contact.vue'), new RegExp(EMAIL_SUPORTE))
  // o jantar saiu com o B2B (redentia.com.br); o WhatsApp dele segue fora do schema
  assert.equal(JSON.stringify(org).includes('5511951495841'), false)
  assert.equal(JSON.stringify(org).includes('hoursAvailable'), false)
})

test('o logo do schema é o arquivo que o site já serve', () => {
  const org = organizacaoJsonLd(SITE)
  assert.equal(org.logo, `${SITE}/icone-aportou.svg`)
  const svg = ler('public/icone-aportou.svg')
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
  assert.match(seo, /breadcrumbJsonLd\(origin, crumbs\)/)
  assert.match(seo, /hreflang: 'pt-BR'/)
  assert.match(seo, /hreflang: 'x-default'/)
  assert.match(seo, /if \(tipo === 'WebSite' \|\| tipo === 'WebPage'\)/)
  assert.match(seo, /normalized\.publisher \?\?= refOrg/)
  assert.match(seo, /tipo === 'SoftwareApplication'/)
  assert.match(seo, /normalized\.provider \?\?= refOrg/)
  assert.match(seo, /publisher: refOrg/)

  const faq = ler('app/composables/useFaqSchema.ts')
  assert.match(faq, /JSON\.stringify\(faqJsonLd\(items\)\)/)
  assert.doesNotMatch(faq, /Organization/)

  const home = ler('app/components/home/HomeContent.vue')
  assert.match(home, /<NuFaqAccordion :items="MERCADO_FAQS"/)

  const mcp = ler('app/pages/mcp.vue')
  assert.match(mcp, /'provider': referenciaOrganizacao\(entidade\)/)

  // o rodapé da Aportou (o do B2B saiu com ele para redentia.com.br)
  const rodape = ler('app/components/nu/NuFooterAportou.vue')
  assert.match(rodape, /https:\/\/www\.instagram\.com\/aportou\.app\//)
  assert.doesNotMatch(rodape, /instagram\.com\/redentia\.(wealth|app)/)
  assert.doesNotMatch(rodape, /linkedin\.com\/company\/redentia/)
  assert.match(rodape, /href="https:\/\/www\.redentia\.com\.br" class="nfa__b2b"/)

  assert.match(ler('nuxt.config.ts'), /siteUrl: process\.env\.NUXT_PUBLIC_SITE_URL \|\| 'https:\/\/aportou\.com\.br'/)
  assert.match(ler('app/composables/useSiteOrigin.ts'), /return useRuntimeConfig\(\)\.public\.siteUrl/)
})

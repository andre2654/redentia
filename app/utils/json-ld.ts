/**
 * JSON-LD da entidade Redentia. A Organization sai uma vez, no app.vue.
 * WebSite, WebPage e SoftwareApplication apontam para o @id (publisher ou
 * provider) em vez de repetir o objeto.
 *
 * X (x.com/andrevisaraiva) e Threads (@andrevsaraiva) são as contas do
 * fundador: o rodapé monta esses links em NuAcompanheAndre, com UTM. O
 * sameAs do Person usa a URL canônica do perfil, sem parâmetro de campanha.
 * O repositório não tem perfil da empresa no X nem no Threads.
 *
 * O Instagram oficial é redentia.wealth, o mesmo dos rodapés visíveis
 * (NuFooter e RbFooter). Este arquivo não muda link de página.
 *
 * contactPoint só leva o que o site já publica como contato da empresa: o
 * e-mail de suporte (rodapé, /institucional/contact, termos). O wa.me de
 * /jantar é a fila do jantar, não um canal da Redentia. O horário do rodapé
 * (dias úteis, 8h–18h) não é o mesmo da página de contato (segunda a sexta,
 * 9h–18h), então o schema não declara horário.
 */
import { EMPRESA } from '../../shared/utils/empresa.ts'

export const EMAIL_SUPORTE = 'relacionamento@redentia.com.br'
const LOGO_PATH = '/logo-azul.svg'

const SAME_AS_EMPRESA = [
  'https://www.instagram.com/redentia.wealth/',
  'https://www.linkedin.com/company/redentia',
  'https://apps.apple.com/app/id6823992050',
] as const

const SAME_AS_FUNDADOR = [
  'https://x.com/andrevisaraiva',
  'https://www.threads.com/@andrevsaraiva',
] as const

export function origemLimpa(origem: string): string {
  return origem.replace(/\/+$/, '')
}

export function idOrganizacao(origem: string): string {
  return `${origemLimpa(origem)}/#organization`
}

export function idFundador(origem: string): string {
  return `${origemLimpa(origem)}/#andre-saraiva`
}

export function referenciaOrganizacao(origem: string): { '@id': string } {
  return { '@id': idOrganizacao(origem) }
}

export function organizacaoJsonLd(origem: string) {
  const site = origemLimpa(origem)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': idOrganizacao(site),
    name: 'Redentia',
    legalName: EMPRESA.razaoSocial,
    taxID: EMPRESA.cnpj,
    url: site,
    logo: `${site}${LOGO_PATH}`,
    description: 'Plataforma brasileira de análise de investimentos com IA: ações, FIIs, notícias, teses e carteira.',
    sameAs: [...SAME_AS_EMPRESA],
    founder: {
      '@type': 'Person',
      '@id': idFundador(site),
      name: 'André Saraiva',
      sameAs: [...SAME_AS_FUNDADOR],
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: EMAIL_SUPORTE,
      url: `${site}/institucional/contact`,
    },
  }
}

/** WebSite da home. `entidade` é a origem do @id da Organization (siteUrl). */
export function websiteInicio(origem: string, entidade = origem) {
  const site = origemLimpa(origem)
  return {
    '@type': 'WebSite',
    '@id': `${site}/#website`,
    name: 'Redentia',
    url: `${site}/`,
    inLanguage: 'pt-BR',
    publisher: referenciaOrganizacao(entidade),
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${site}/busca?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(origem: string, crumbs: { name: string, path: string }[]) {
  const site = origemLimpa(origem)
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: `${site}${b.path}`,
    })),
  }
}

export function faqJsonLd(items: { q: string, a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

/**
 * Os quatro scripts da home quando a origem canônica e o siteUrl são o
 * mesmo valor (produção: https://www.redentia.com.br). Ordem de registro:
 * Organization (app.vue), WebSite e BreadcrumbList (usePageSeo), FAQPage
 * (NuFaqAccordion da home).
 */
export function scriptsLdInicio(origem: string, faqs: { q: string, a: string }[]): string[] {
  const site = origemLimpa(origem)
  return [
    JSON.stringify(organizacaoJsonLd(site)),
    JSON.stringify({ '@context': 'https://schema.org', ...websiteInicio(site, site) }),
    JSON.stringify(breadcrumbJsonLd(site, [{ name: 'Início', path: '/' }])),
    JSON.stringify(faqJsonLd(faqs)),
  ]
}

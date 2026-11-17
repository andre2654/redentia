/**
 * SEO por página (padrão herdado do Frontend, o composable mais maduro do repo):
 *  - useSeoMeta completo (title/description/og/twitter)
 *  - canonical na origem CANÔNICA do site (useSiteOrigin), não no host que
 *    atendeu a request. Era o contrário até 08/2026, e foi assim que
 *    whitelabel.redentia.com.br (231 URLs) e estudo.redentia.com.br viraram
 *    clones indexados do site inteiro. Ver useSiteOrigin.ts pro histórico.
 *  - JSON-LD normalizado (Article/FAQPage/BreadcrumbList ganham defaults
 *    obrigatórios pra ninguém esquecer campo de rich snippet)
 */
import { breadcrumbJsonLd, referenciaOrganizacao } from '../utils/json-ld.ts'

interface Breadcrumb { name: string; path: string }

interface PageSeoInput {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  /** path canônico (ex.: /asset/petr4). Default: rota atual. */
  path?: MaybeRefOrGetter<string>
  image?: string
  /** JSON-LD adicionais (Article, FAQPage…) — Organization é global no app. */
  structuredData?: MaybeRefOrGetter<Record<string, unknown>[] | undefined>
  breadcrumbs?: MaybeRefOrGetter<Breadcrumb[] | undefined>
  noindex?: boolean
  /**
   * Override completo da meta robots (ex.: 'noindex, follow' em telas de
   * auth — não rankeiam, mas os links internos continuam rastreáveis).
   * Vence o default 'noindex, nofollow' do flag noindex.
   */
  robots?: string
  /**
   * Data ISO da última atualização do CONTEÚDO desta página. Emite um nó
   * WebPage com dateModified.
   *
   * POR QUE EXISTE (21/08/2026). Auditoria encontrou o sinal invertido: as
   * páginas ESTÁTICAS (guias, calculadoras) declaravam dateModified e as
   * DIÁRIAS não — home, /asset/{ticker}, /dividendos/{ticker} e /tesouro/{slug}
   * saíam sem nenhuma marca de frescor. É o oposto do necessário: numa consulta
   * sensível a tempo ("cotação PETR4 hoje"), buscador com IA e LLM precisam
   * saber de quando é o dado, e a ausência do campo numa página de cotação pesa
   * contra na hora de escolher o que citar.
   *
   * Vai em WebPage, não no Corporation/FinancialProduct da página:
   * dateModified é propriedade de CreativeWork, e Organization não é
   * CreativeWork — declarar lá seria schema inválido.
   *
   * TEM que ser a data do DADO que a página mostra (price_date da cotação,
   * último preço do título, estudo mais recente da tese), nunca a do
   * calendário. De 21/08 a 23/09/2026 isto recebia o "último pregão" calculado
   * pela data de hoje: no congelamento do scraper (28/08 → 17/09) a página
   * dizia "atualizado em 28/08" e o dado estruturado dizia "hoje". Sem data
   * verificável, não passe nada — o nó WebPage simplesmente não sai.
   *
   * Aceita ref/getter porque em várias páginas a data só existe depois que o
   * dado resolve (ranking, home).
   */
  dateModified?: MaybeRefOrGetter<string | null | undefined>
}

export function usePageSeo(input: PageSeoInput) {
  const route = useRoute()
  const origin = useSiteOrigin()
  const path = computed(() => toValue(input.path) ?? route.path)
  const canonical = computed(() => `${origin}${path.value}`)
  const title = computed(() => toValue(input.title))
  const description = computed(() => toValue(input.description))
  // a marca que assina a página (as telas de escritório, que assinavam Redentia, saíram em 12/11/2026)
  const marca = MARCA.nome
  const image = input.image ?? `${origin}/og-aportou.png`
  const logoDaMarca = `${origin}/icone-aportou.svg`

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogUrl: canonical,
    ogImage: image,
    // a imagem padrão tem tamanho conhecido: sem as dimensões, a prévia do WhatsApp e do LinkedIn às vezes não monta
    ...(input.image ? {} : { ogImageWidth: 1200, ogImageHeight: 630, ogImageAlt: `${marca}: investir fica mais claro`, twitterImageAlt: `${marca}: investir fica mais claro` }),
    ogType: 'website',
    ogLocale: 'pt_BR',
    ogSiteName: marca,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    ...(input.robots
      ? { robots: input.robots }
      : input.noindex
        ? { robots: 'noindex, nofollow' }
        : {}),
  })

  // Mesma origem do nó global em app.vue, para o @id resolver na página.
  const refOrg = referenciaOrganizacao(String(useRuntimeConfig().public.siteUrl))

  function nosEstruturados(): Record<string, unknown>[] {
    const ld: Record<string, unknown>[] = []
    for (const item of toValue(input.structuredData) ?? []) {
      const normalized: Record<string, unknown> = { '@context': 'https://schema.org', ...item }
      const tipo = normalized['@type']
      if (tipo === 'Article' || tipo === 'NewsArticle') {
        normalized.image ??= image
        normalized.mainEntityOfPage ??= canonical.value
        normalized.publisher ??= { '@type': 'Organization', name: marca, logo: { '@type': 'ImageObject', url: logoDaMarca } }
      }
      if (tipo === 'WebSite' || tipo === 'WebPage') {
        normalized.publisher ??= refOrg
      } else if (tipo === 'SoftwareApplication') {
        normalized.provider ??= refOrg
      }
      ld.push(normalized)
    }
    const crumbs = toValue(input.breadcrumbs)
    if (crumbs?.length) ld.push(breadcrumbJsonLd(origin, crumbs))
    return ld
  }

  /** 'YYYY-MM-DD' válido ou nada: data inventada é pior que data ausente. */
  const dateModified = computed(() => {
    const raw = toValue(input.dateModified)
    const d = typeof raw === 'string' ? raw.slice(0, 10) : ''
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null
  })

  useHead({
    link: computed(() => [
      { rel: 'canonical', href: canonical.value },
      { rel: 'alternate', hreflang: 'pt-BR', href: canonical.value },
      { rel: 'alternate', hreflang: 'x-default', href: canonical.value },
    ]),
    script: computed(() => {
      const nodes = nosEstruturados()
      if (dateModified.value) {
        nodes.push({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': canonical.value,
          url: canonical.value,
          name: title.value,
          dateModified: dateModified.value,
          inLanguage: 'pt-BR',
          isPartOf: { '@type': 'WebSite', name: marca, url: origin },
          publisher: refOrg,
        })
      }
      return nodes.map((data) => ({ type: 'application/ld+json', innerHTML: JSON.stringify(data) }))
    }),
  })
}

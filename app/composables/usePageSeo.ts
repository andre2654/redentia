/**
 * SEO por página (padrão herdado do Frontend, o composable mais maduro do repo):
 *  - useSeoMeta completo (title/description/og/twitter)
 *  - canonical no HOST REAL da request (useRequestURL — nunca hardcodar domínio)
 *  - JSON-LD normalizado (Article/FAQPage/BreadcrumbList ganham defaults
 *    obrigatórios pra ninguém esquecer campo de rich snippet)
 */
interface Breadcrumb { name: string; path: string }

interface PageSeoInput {
  title: string
  description: string
  /** path canônico (ex.: /asset/petr4). Default: rota atual. */
  path?: string
  image?: string
  /** JSON-LD adicionais (Article, FAQPage…) — Organization é global no app. */
  structuredData?: Record<string, unknown>[]
  breadcrumbs?: Breadcrumb[]
  noindex?: boolean
  /**
   * Override completo da meta robots (ex.: 'noindex, follow' em telas de
   * auth — não rankeiam, mas os links internos continuam rastreáveis).
   * Vence o default 'noindex, nofollow' do flag noindex.
   */
  robots?: string
}

export function usePageSeo(input: PageSeoInput) {
  const url = useRequestURL()
  const route = useRoute()
  const origin = `${url.protocol}//${url.host}`
  const path = input.path ?? route.path
  const canonical = `${origin}${path}`
  const image = input.image ?? `${origin}/og-default.png`

  useSeoMeta({
    title: input.title,
    description: input.description,
    ogTitle: input.title,
    ogDescription: input.description,
    ogUrl: canonical,
    ogImage: image,
    ogType: 'website',
    ogLocale: 'pt_BR',
    ogSiteName: 'Redentia',
    twitterCard: 'summary_large_image',
    twitterTitle: input.title,
    twitterDescription: input.description,
    twitterImage: image,
    ...(input.robots
      ? { robots: input.robots }
      : input.noindex
        ? { robots: 'noindex, nofollow' }
        : {}),
  })

  const ld: Record<string, unknown>[] = []

  for (const item of input.structuredData ?? []) {
    const normalized: Record<string, unknown> = { '@context': 'https://schema.org', ...item }
    if (normalized['@type'] === 'Article' || normalized['@type'] === 'NewsArticle') {
      normalized.image ??= image
      normalized.mainEntityOfPage ??= canonical
      normalized.publisher ??= { '@type': 'Organization', name: 'Redentia', logo: { '@type': 'ImageObject', url: `${origin}/logo-azul.svg` } }
    }
    ld.push(normalized)
  }

  if (input.breadcrumbs?.length) {
    ld.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: input.breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: `${origin}${b.path}`,
      })),
    })
  }

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
    script: ld.map((data) => ({ type: 'application/ld+json', innerHTML: JSON.stringify(data) })),
  })
}

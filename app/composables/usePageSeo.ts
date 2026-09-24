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
  const trailing: Record<string, unknown>[] = []

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
    trailing.push({
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

  /** 'YYYY-MM-DD' válido ou nada: data inventada é pior que data ausente. */
  const dateModified = computed(() => {
    const raw = toValue(input.dateModified)
    const d = typeof raw === 'string' ? raw.slice(0, 10) : ''
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }],
    script: computed(() => {
      const nodes = [...ld]
      if (dateModified.value) {
        nodes.push({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': canonical,
          url: canonical,
          name: input.title,
          dateModified: dateModified.value,
          inLanguage: 'pt-BR',
          isPartOf: { '@type': 'WebSite', name: 'Redentia', url: origin },
        })
      }
      nodes.push(...trailing)
      return nodes.map((data) => ({ type: 'application/ld+json', innerHTML: JSON.stringify(data) }))
    }),
  })
}

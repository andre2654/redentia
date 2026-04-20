interface PageSeoBreadcrumb {
  name: string
  path: string
}

interface UsePageSeoOptions {
  title: string | (() => string)
  description: string | (() => string)
  path: string
  image?: string | (() => string)
  type?: string
  robots?: string | (() => string)
  breadcrumbs?: PageSeoBreadcrumb[]
  structuredData?: Record<string, any> | Array<Record<string, any>>
  alternates?: Array<{ hreflang: string; href: string }>
}

function resolveUrl(base: string, path: string) {
  if (path.startsWith('http')) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export function usePageSeo(options: UsePageSeoOptions) {
  const brand = useBrand()
  const runtimeConfig = useRuntimeConfig()
  // Canonical tem que apontar pro host REAL da request, não pro brand.url
  // estático. Motivo: hoje só redentia.com.br está no ar; os outros domínios
  // (saraivainvest.com.br, nortecapital.com.br) ainda não existem. Se o
  // canonical apontasse pra brand.url, todos os `?brand=X` na redentia.com.br
  // teriam canonical pra domínio quebrado → Google descartaria a página.
  //
  // useRequestURL() no SSR retorna a URL exata da request (host incluído);
  // no client, usa window.location. Fallback pro runtimeConfig.public.siteUrl
  // se por algum motivo o request URL não estiver disponível.
  let requestOrigin = ''
  try {
    const reqUrl = useRequestURL()
    requestOrigin = reqUrl?.origin || ''
  } catch {}
  const rawSiteUrl: string =
    requestOrigin || runtimeConfig.public?.siteUrl || brand.url || ''
  const siteUrl = rawSiteUrl.endsWith('/')
    ? rawSiteUrl.slice(0, -1)
    : rawSiteUrl
  const normalizedPath = options.path.startsWith('/')
    ? options.path
    : `/${options.path}`
  const canonicalUrl = `${siteUrl}${normalizedPath}`

  const resolveImage = (img?: string | (() => string)) => {
    const val = typeof img === 'function' ? img() : img
    return val ? resolveUrl(siteUrl, val) : `${siteUrl}/512x512.png`
  }

  const resolvedImage = computed(() => resolveImage(options.image))

  useSeoMeta({
    title: options.title,
    ogTitle: options.title,
    twitterTitle: options.title,
    description: options.description,
    ogDescription: options.description,
    twitterDescription: options.description,
    ogUrl: canonicalUrl,
    ogImage: resolvedImage,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    twitterImage: resolvedImage,
    ogType: options.type || 'website',
    ogSiteName: brand.name,
    ogLocale: brand.seo.locale,
    twitterCard: 'summary_large_image',
    robots: options.robots || 'index,follow',
  })

  const scripts: Array<Record<string, any>> = []
  const links: Array<Record<string, any>> = [
    { rel: 'canonical', href: canonicalUrl },
  ]

  if (options.alternates) {
    options.alternates.forEach((alt) => {
      links.push({
        rel: 'alternate',
        hreflang: alt.hreflang,
        href: resolveUrl(siteUrl, alt.href),
      })
    })
  } else {
    // Default self-referencing hreflang for pt-BR + x-default
    links.push({
      rel: 'alternate',
      hreflang: 'pt-BR',
      href: canonicalUrl,
    })
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: canonicalUrl,
    })
  }

  if (options.structuredData) {
    const entries = Array.isArray(options.structuredData)
      ? options.structuredData
      : [options.structuredData]

    entries.forEach((entry, index) => {
      scripts.push({
        type: 'application/ld+json',
        key: `ld-json-${normalizedPath}-${index}`,
        innerHTML: JSON.stringify(entry),
      })
    })
  }

  if (options.breadcrumbs?.length) {
    const breadcrumbList = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: options.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: resolveUrl(siteUrl, crumb.path),
      })),
    }

    scripts.push({
      type: 'application/ld+json',
      key: `ld-breadcrumbs-${normalizedPath}`,
      innerHTML: JSON.stringify(breadcrumbList),
    })
  }

  useHead({
    link: links,
    ...(scripts.length
      ? {
          script: scripts,
          __dangerouslyDisableSanitizers: ['script'],
        }
      : {}),
  })

  return {
    canonicalUrl,
    siteUrl,
    imageUrl: resolvedImage,
  }
}

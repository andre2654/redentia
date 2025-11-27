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
  robots?: string
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
  const runtimeConfig = useRuntimeConfig()
  const rawSiteUrl: string =
    runtimeConfig.public?.siteUrl || 'https://www.redentia.com.br'
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
    ogImageWidth: 512,
    ogImageHeight: 512,
    twitterImage: resolvedImage,
    ogType: options.type || 'website',
    ogSiteName: 'Redentia',
    ogLocale: 'pt_BR',
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
    // Default self-referencing hreflang for pt-BR
    links.push({
      rel: 'alternate',
      hreflang: 'pt-BR',
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

interface PageSeoBreadcrumb {
  name: string
  path: string
}

interface UsePageSeoOptions {
  title: string
  description: string
  path: string
  image?: string
  type?: string
  robots?: string
  breadcrumbs?: PageSeoBreadcrumb[]
  structuredData?: Record<string, any> | Array<Record<string, any>>
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
  const resolvedImage = options.image
    ? resolveUrl(siteUrl, options.image)
    : `${siteUrl}/512x512.png`

  useSeoMeta({
    title: options.title,
    ogTitle: options.title,
    twitterTitle: options.title,
    description: options.description,
    ogDescription: options.description,
    twitterDescription: options.description,
    ogUrl: canonicalUrl,
    ogImage: resolvedImage,
    twitterImage: resolvedImage,
    ogType: options.type || 'website',
    ogSiteName: 'Redentia',
    ogLocale: 'pt_BR',
    twitterCard: 'summary_large_image',
    robots: options.robots || 'index,follow',
  })

  const scripts: Array<Record<string, any>> = []

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
    link: [{ rel: 'canonical', href: canonicalUrl }],
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

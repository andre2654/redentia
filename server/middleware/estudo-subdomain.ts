// Subdomain router: requests to `estudo.redentia.com.br` (or
// `estudo.localhost` in dev) are internally rewritten to serve
// pages under `/estudo/*`.
//
// Same pattern as creative-subdomain.ts and whitelabel-subdomain.ts —
// keeps the ebooks / studies hub inside the main Nuxt app while
// giving it a clean URL scheme. DNS points estudo.redentia.com.br →
// same origin as redentia.com.br.
//
// Passthroughs that must NOT be rewritten:
//   - /api/*       (Nitro / backend proxy)
//   - /_nuxt/*     (asset bundles)
//   - /_ipx/*      (optimized images)
//   - /estudo      (already in target namespace — avoid loop)

const ESTUDO_HOSTS = [
  'estudo.redentia.com.br',
  'estudo.localhost',
  'estudo.redentia.localhost',
]

function isEstudoHost(host: string): boolean {
  const clean = host.split(':')[0].toLowerCase()
  return ESTUDO_HOSTS.includes(clean)
}

export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (!isEstudoHost(host)) return

  const url = getRequestURL(event)
  const pathname = url.pathname

  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/estudo')
  ) {
    return
  }

  // Rewrite `/` → `/estudo`, `/imperio-por-tras-do-feed` → `/estudo/imperio-por-tras-do-feed`
  const newPath = pathname === '/' ? '/estudo' : `/estudo${pathname}`
  const rewritten = newPath + url.search

  const filteredHeaders = Object.fromEntries(
    Object.entries(event.node.req.headers).filter(
      ([k]) => !['host', 'connection', 'content-length'].includes(k.toLowerCase())
    ) as [string, string][]
  )

  try {
    const body = await $fetch(rewritten, {
      method: event.node.req.method as any,
      headers: filteredHeaders,
      responseType: 'text',
    })
    setHeader(event, 'content-type', 'text/html; charset=utf-8')
    return body
  } catch {
    // Fall through to normal Nuxt routing if the internal fetch fails.
  }
})

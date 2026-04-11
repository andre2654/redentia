// Subdomain router: requests to `whitelabel.redentia.com.br` (or
// `whitelabel.localhost` in dev) are internally rewritten to serve the
// /whitelabel landing page (and any future /whitelabel/* sub-routes).
//
// Same pattern as api-subdomain.ts and creative-subdomain.ts — single
// codebase, single deployment, multiple subdomains served by Nitro
// rewrites. Production DNS points whitelabel.redentia.com.br at the
// same Vercel deployment, and this middleware rewrites the URL on the
// way in so the user just sees `/` in the browser.
//
// Passthroughs that must NOT be rewritten:
//   - /api/*       (Nitro / backend proxy)
//   - /_nuxt/*     (asset bundles)
//   - /_ipx/*      (optimized images)
//   - /whitelabel  (already in target namespace — avoid loop)

const WHITELABEL_HOSTS = [
  'whitelabel.redentia.com.br',
  'whitelabel.localhost',
  'whitelabel.redentia.localhost',
]

function isWhitelabelHost(host: string): boolean {
  const clean = host.split(':')[0].toLowerCase()
  return WHITELABEL_HOSTS.includes(clean)
}

export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (!isWhitelabelHost(host)) return

  const url = getRequestURL(event)
  const pathname = url.pathname

  // Never touch internal Nuxt/Nitro paths or already-target paths.
  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/') ||
    pathname === '/whitelabel' ||
    pathname.startsWith('/whitelabel/')
  ) {
    return
  }

  // Rewrite `/` → `/whitelabel`, `/whatever` → `/whitelabel/whatever`.
  // For now there's only the index page, but the prefix scheme keeps the
  // door open for /whitelabel/case-studies, /whitelabel/pricing, etc.
  const newPath = pathname === '/' ? '/whitelabel' : `/whitelabel${pathname}`
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

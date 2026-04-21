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

// Uses in-process URL mutation — the old `$fetch` self-proxy was
// failing for subpages on Vercel serverless (silent 404). See
// estudo-subdomain.ts for the write-up.
export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (!isWhitelabelHost(host)) return

  const url = getRequestURL(event)
  const pathname = url.pathname

  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/') ||
    pathname === '/whitelabel' ||
    pathname.startsWith('/whitelabel/')
  ) {
    return
  }

  const newPath = pathname === '/' ? '/whitelabel' : `/whitelabel${pathname}`
  const rewritten = newPath + url.search

  event.node.req.url = rewritten
  ;(event as any)._path = undefined
  ;(event as any)._url = undefined
})

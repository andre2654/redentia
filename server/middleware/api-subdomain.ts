// Subdomain router: requests to `api.redentia.com.br` (or `api.localhost`
// in dev) are internally rewritten to serve pages under `/api-portal/*`.
//
// This keeps the dev portal inside the main Nuxt app (single codebase,
// shared tenant system, shared components) while giving it a clean URL
// scheme for developers. Production DNS points api.redentia.com.br →
// same origin as redentia.com.br; the middleware decides what to render.
//
// Passthroughs that must NOT be rewritten:
//   - /api/*          (Nitro API routes — backend proxy)
//   - /_nuxt/*        (asset bundles)
//   - /_ipx/*         (optimized images)
//   - /api-portal/*   (already in portal namespace — avoid double rewrite)
//   - Anything already starting with `/api-portal` if accessed via the main
//     domain still works; we only activate rewrites on the subdomain.

const API_HOSTS = [
  'api.redentia.com.br',
  'api.localhost',
  'api.redentia.localhost',
]

function isApiHost(host: string): boolean {
  const clean = host.split(':')[0].toLowerCase()
  return API_HOSTS.includes(clean)
}

export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (!isApiHost(host)) return

  const url = getRequestURL(event)
  const pathname = url.pathname

  // Never touch internal Nuxt/Nitro paths or already-portal paths.
  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/api-portal')
  ) {
    return
  }

  // Rewrite `/` → `/api-portal`, `/docs` → `/api-portal/docs`, etc.
  const newPath = pathname === '/' ? '/api-portal' : `/api-portal${pathname}`
  const rewritten = newPath + url.search

  // Nitro's internal fetch re-enters the router and lets Nuxt render the
  // target page. Passing through incoming headers preserves SSR cookies
  // and accept headers. Returning the body short-circuits the original
  // request so the client keeps the original URL (no visible redirect).
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
    // Fall through to normal Nuxt routing if the internal fetch fails
    // (e.g. 404 for an unknown path under the subdomain).
  }
})

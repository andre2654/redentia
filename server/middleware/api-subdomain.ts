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

// Uses in-process URL mutation — the old `$fetch` self-proxy was
// failing for subpages on Vercel serverless. See estudo-subdomain.ts
// for the write-up.
export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (!isApiHost(host)) return

  const url = getRequestURL(event)
  const pathname = url.pathname

  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/api-portal')
  ) {
    return
  }

  const newPath = pathname === '/' ? '/api-portal' : `/api-portal${pathname}`
  const rewritten = newPath + url.search

  event.node.req.url = rewritten
  ;(event as any)._path = undefined
  ;(event as any)._url = undefined
})

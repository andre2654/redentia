// Subdomain router: requests to `estudo.redentia.com.br` (or
// `estudo.localhost` in dev) are internally rewritten to serve
// pages under `/estudo/*`.
//
// Uses an in-process URL mutation (`event.node.req.url = ...`) rather
// than a self-fetch via `$fetch`. The old `$fetch` approach created a
// second HTTP hop that failed in Vercel serverless for subpages
// (`/estudo/imperio-por-tras-do-feed` returned 404 because the nested
// $fetch hit the apex→www 307 redirect and didn't follow it, the
// catch silently swallowed the error, and Nuxt fell through to serving
// the un-rewritten path → 404 → Instagram IAB rendered it as 500).
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

export default defineEventHandler((event) => {
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

  // Mutate the request URL in-place so Nuxt's router dispatches to the
  // namespaced page. h3 caches parsed URL bits on the event object —
  // clearing them forces a re-parse with the new path.
  event.node.req.url = rewritten
  ;(event as any)._path = undefined
  ;(event as any)._url = undefined
})

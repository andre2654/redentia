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

// Pick the origin that actually serves the page. On localhost we
// self-fetch; in prod we point straight at `www.redentia.com.br` so
// the nested request doesn't get caught by the apex→www 307 (which
// ofetch doesn't transparently follow across cross-origin in Vercel
// serverless).
function targetOrigin(host: string): string {
  const clean = host.split(':')[0].toLowerCase()
  if (clean === 'estudo.localhost' || clean === 'estudo.redentia.localhost') {
    const port = host.includes(':') ? host.split(':')[1] : '3000'
    return `http://localhost:${port}`
  }
  return 'https://www.redentia.com.br'
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

  const newPath = pathname === '/' ? '/estudo' : `/estudo${pathname}`
  const rewritten = newPath + url.search
  const absoluteUrl = `${targetOrigin(host)}${rewritten}`

  const filteredHeaders = Object.fromEntries(
    Object.entries(event.node.req.headers).filter(
      ([k]) => !['host', 'connection', 'content-length', 'x-forwarded-host'].includes(k.toLowerCase())
    ) as [string, string][]
  )

  try {
    const body = await $fetch(absoluteUrl, {
      method: event.node.req.method as any,
      headers: filteredHeaders,
      responseType: 'text',
      redirect: 'follow',
    })
    setHeader(event, 'content-type', 'text/html; charset=utf-8')
    return body
  } catch (err) {
    // Log so the root cause shows up in Vercel function logs next time
    // it happens — prevents silent fall-through to a 404.
    console.error('[estudo-subdomain] proxy failed for', absoluteUrl, (err as any)?.message || err)
  }
})

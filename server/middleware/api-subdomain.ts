// Subdomain router: requests to `api.redentia.com.br` (or `api.localhost`
// in dev) are internally rewritten to serve pages under `/api-portal/*`.
//
// This keeps the dev portal inside the main Nuxt app (single codebase,
// shared tenant system, shared components) while giving it a clean URL
// scheme for developers. Production DNS points api.redentia.com.br →
// same origin as redentia.com.br; the middleware decides what to render.
//
// Uses an absolute-URL `$fetch` proxy pointed at the canonical `www.*`
// origin. A previous iteration tried to rewrite in-place via
// `event.node.req.url = ...` but Nuxt's Vue-router doesn't re-dispatch
// after middleware mutation, so the route fell through to 404.
// A plain relative `$fetch(rewritten)` also failed on Vercel serverless
// because the nested request got caught by the apex→www 307 and ofetch
// didn't transparently follow it cross-origin.

const API_HOSTS = [
  'api.redentia.com.br',
  'api.localhost',
  'api.redentia.localhost',
]

function isApiHost(host: string): boolean {
  const clean = host.split(':')[0].toLowerCase()
  return API_HOSTS.includes(clean)
}

function targetOrigin(host: string): string {
  const clean = host.split(':')[0].toLowerCase()
  if (clean === 'api.localhost' || clean === 'api.redentia.localhost') {
    const port = host.includes(':') ? host.split(':')[1] : '3000'
    return `http://localhost:${port}`
  }
  return 'https://www.redentia.com.br'
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

  const newPath = pathname === '/' ? '/api-portal' : `/api-portal${pathname}`
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
    console.error('[api-subdomain] proxy failed for', absoluteUrl, (err as any)?.message || err)
  }
})

// Subdomain router: requests to `creative.redentia.com.br` (or
// `creative.localhost` in dev) are internally rewritten to serve
// pages under `/creative/*`.
//
// Uses in-process URL mutation — the old `$fetch` self-proxy was
// failing for subpages on Vercel serverless. See estudo-subdomain.ts
// for the full write-up.

const CREATIVE_HOSTS = [
  'creative.redentia.com.br',
  'creative.localhost',
  'creative.redentia.localhost',
]

function isCreativeHost(host: string): boolean {
  const clean = host.split(':')[0].toLowerCase()
  return CREATIVE_HOSTS.includes(clean)
}

export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (!isCreativeHost(host)) return

  const url = getRequestURL(event)
  const pathname = url.pathname

  // Never touch internal Nuxt/Nitro paths or already-creative paths.
  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/creative')
  ) {
    return
  }

  const newPath = pathname === '/' ? '/creative' : `/creative${pathname}`
  const rewritten = newPath + url.search

  event.node.req.url = rewritten
  ;(event as any)._path = undefined
  ;(event as any)._url = undefined
})

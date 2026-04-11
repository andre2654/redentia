// Subdomain router: requests to `creative.redentia.com.br` (or
// `creative.localhost` in dev) are internally rewritten to serve
// pages under `/creative/*`.
//
// Mirrors the api-subdomain middleware — keeps the creative studio
// inside the main Nuxt app while giving it a clean URL scheme. DNS
// points creative.redentia.com.br → same origin as redentia.com.br.

const CREATIVE_HOSTS = [
  'creative.redentia.com.br',
  'creative.localhost',
  'creative.redentia.localhost',
]

function isCreativeHost(host: string): boolean {
  const clean = host.split(':')[0].toLowerCase()
  return CREATIVE_HOSTS.includes(clean)
}

export default defineEventHandler(async (event) => {
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
    // Fall through to normal Nuxt routing
  }
})

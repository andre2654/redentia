// Subdomain router: requests to `creative.redentia.com.br` (or
// `creative.localhost` in dev) are internally rewritten to serve
// pages under `/creative/*`.
//
// See api-subdomain.ts for the history on why this proxies via
// absolute-URL `$fetch` instead of relative fetch or URL mutation.

const CREATIVE_HOSTS = [
  'creative.redentia.com.br',
  'creative.localhost',
  'creative.redentia.localhost',
]

function isCreativeHost(host: string): boolean {
  const clean = host.split(':')[0].toLowerCase()
  return CREATIVE_HOSTS.includes(clean)
}

function targetOrigin(host: string): string {
  const clean = host.split(':')[0].toLowerCase()
  if (clean === 'creative.localhost' || clean === 'creative.redentia.localhost') {
    const port = host.includes(':') ? host.split(':')[1] : '3000'
    return `http://localhost:${port}`
  }
  return 'https://www.redentia.com.br'
}

export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (!isCreativeHost(host)) return

  const url = getRequestURL(event)
  const pathname = url.pathname

  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/creative')
  ) {
    return
  }

  const newPath = pathname === '/' ? '/creative' : `/creative${pathname}`
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
    console.error('[creative-subdomain] proxy failed for', absoluteUrl, (err as any)?.message || err)
  }
})

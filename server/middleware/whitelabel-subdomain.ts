// Subdomain router: requests to `whitelabel.redentia.com.br` (or
// `whitelabel.localhost` in dev) are internally rewritten to serve
// pages under `/whitelabel/*`.
//
// See api-subdomain.ts for the history on why this proxies via
// absolute-URL `$fetch` instead of relative fetch or URL mutation.

const WHITELABEL_HOSTS = [
  'whitelabel.redentia.com.br',
  'whitelabel.localhost',
  'whitelabel.redentia.localhost',
]

function isWhitelabelHost(host: string): boolean {
  const clean = host.split(':')[0].toLowerCase()
  return WHITELABEL_HOSTS.includes(clean)
}

function targetOrigin(host: string): string {
  const clean = host.split(':')[0].toLowerCase()
  if (clean === 'whitelabel.localhost' || clean === 'whitelabel.redentia.localhost') {
    const port = host.includes(':') ? host.split(':')[1] : '3000'
    return `http://localhost:${port}`
  }
  return 'https://www.redentia.com.br'
}

export default defineEventHandler(async (event) => {
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
    console.error('[whitelabel-subdomain] proxy failed for', absoluteUrl, (err as any)?.message || err)
  }
})

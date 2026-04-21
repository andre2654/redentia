// Subdomain router: requests to `admin.redentia.com.br` (or `admin.localhost`
// in dev) are internally rewritten to serve pages under `/admin/*`.
//
// See api-subdomain.ts for the history on why this proxies via
// absolute-URL `$fetch` instead of relative fetch or URL mutation.
//
// Every response from this subdomain gets an
// `X-Robots-Tag: noindex, nofollow, noarchive` header. This is the admin
// control panel — it must NEVER show up in search engines.

const ADMIN_HOSTS = [
  'admin.redentia.com.br',
  'admin.localhost',
  'admin.redentia.localhost',
]

function isAdminHost(host: string): boolean {
  const clean = host.split(':')[0].toLowerCase()
  return ADMIN_HOSTS.includes(clean)
}

function targetOrigin(host: string): string {
  const clean = host.split(':')[0].toLowerCase()
  if (clean === 'admin.localhost' || clean === 'admin.redentia.localhost') {
    const port = host.includes(':') ? host.split(':')[1] : '3000'
    return `http://localhost:${port}`
  }
  return 'https://www.redentia.com.br'
}

export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (!isAdminHost(host)) return

  // ALWAYS set noindex — applies to every resource served from this host,
  // including assets fetched from /_nuxt/* that bypass the rewrite below.
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')

  const url = getRequestURL(event)
  const pathname = url.pathname

  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin')
  ) {
    return
  }

  const newPath = pathname === '/' ? '/admin' : `/admin${pathname}`
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
    console.error('[admin-subdomain] proxy failed for', absoluteUrl, (err as any)?.message || err)
  }
})

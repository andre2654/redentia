// Subdomain router: requests to `admin.redentia.com.br` (or `admin.localhost`
// in dev) are internally rewritten to serve pages under `/admin/*`.
//
// Same pattern as creative-subdomain.ts / estudo-subdomain.ts, with one
// important addition: every response from this subdomain gets an
// `X-Robots-Tag: noindex, nofollow, noarchive` header. This is the admin
// control panel — it must NEVER show up in Google/Bing/etc, and the
// header applies to HTML, images, JSON and any other content-type (unlike
// `<meta name=robots>` which only works for HTML).
//
// Even cached/CDN responses respect X-Robots-Tag when served via Cloudflare
// or Vercel, so this is the belt; the `<meta name=robots>` in pages is
// the suspenders. See Frontend/server/routes/admin/robots.txt.get.ts for
// the third layer (explicit Disallow in robots.txt).

const ADMIN_HOSTS = [
  'admin.redentia.com.br',
  'admin.localhost',
  'admin.redentia.localhost',
]

function isAdminHost(host: string): boolean {
  const clean = host.split(':')[0].toLowerCase()
  return ADMIN_HOSTS.includes(clean)
}

export default defineEventHandler(async (event) => {
  const host = getRequestHeader(event, 'host') || ''
  if (!isAdminHost(host)) return

  // ALWAYS set noindex — applies to every resource served from this host,
  // including assets fetched from /_nuxt/* that bypass the rewrite below.
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')

  const url = getRequestURL(event)
  const pathname = url.pathname

  // Passthroughs: never rewrite internal Nuxt/Nitro paths or already-target paths.
  if (
    pathname.startsWith('/_') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin')
  ) {
    return
  }

  // Rewrite `/` → `/admin`, `/foo` → `/admin/foo`.
  const newPath = pathname === '/' ? '/admin' : `/admin${pathname}`
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
    // Fall through to normal Nuxt routing if the internal fetch fails
    // (rare; typically means the page doesn't exist and 404 handler wins).
  }
})

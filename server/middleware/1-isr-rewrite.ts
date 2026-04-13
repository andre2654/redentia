// ============================================================
// ISR URL rewrite — fix Nuxt 4 + Vercel ISR compatibility
// ============================================================
//
// Vercel ISR routing sends: GET /index-isr?url=/&brand=me-poupe
// The real page is in the `url` query param. Nuxt 4 sees `/index-isr`
// as the path and 404s because no Vue route matches it.
//
// This middleware reads the `url` query param that Vercel injects
// and rewrites event.path to the real route.
// ============================================================

export default defineEventHandler((event) => {
  const path = event.path || event.node.req.url || ''

  // Only act on ISR function paths (ending in -isr)
  const qIndex = path.indexOf('?')
  const pathname = qIndex >= 0 ? path.slice(0, qIndex) : path

  if (!pathname.endsWith('-isr')) return

  // Parse query string to extract `url` param (the real route)
  const searchParams = new URLSearchParams(qIndex >= 0 ? path.slice(qIndex + 1) : '')
  const realUrl = searchParams.get('url')

  if (!realUrl) {
    // Fallback: strip -isr suffix manually
    const base = pathname.slice(0, -4)
    const realPath = base === '/index' ? '/' : base
    // Rebuild query without `url` param
    searchParams.delete('url')
    const qs = searchParams.toString()
    const newUrl = realPath + (qs ? '?' + qs : '')
    event._path = newUrl
    event.node.req.url = newUrl
    return
  }

  // Rebuild the URL: use `url` param as path, keep other query params
  searchParams.delete('url')
  const qs = searchParams.toString()
  const newUrl = realUrl + (qs ? '?' + qs : '')

  event._path = newUrl
  event.node.req.url = newUrl
})

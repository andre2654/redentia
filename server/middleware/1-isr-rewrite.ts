// ============================================================
// ISR URL rewrite — fix Nuxt 4 + Vercel ISR compatibility
// ============================================================
//
// Vercel ISR rewrites `/` → `/index-isr`, `/whitelabel` → `/whitelabel-isr`.
// Nuxt 4's Vue router doesn't know about `-isr` suffixed routes and 404s.
//
// This middleware strips the `-isr` suffix BEFORE Nuxt processes the request.
// It's an internal rewrite (NOT a redirect) — no redirect loop.
// ============================================================

export default defineEventHandler((event) => {
  const path = event.path || event.node.req.url || ''

  // Match paths ending in -isr (before query string)
  const qIndex = path.indexOf('?')
  const pathname = qIndex >= 0 ? path.slice(0, qIndex) : path
  const query = qIndex >= 0 ? path.slice(qIndex) : ''

  if (!pathname.endsWith('-isr')) return

  // Strip -isr suffix
  const base = pathname.slice(0, -4) // remove '-isr'
  const realPath = base === '/index' ? '/' : base

  // Rewrite both event.path and event.node.req.url
  const newUrl = realPath + query
  event._path = newUrl
  event.node.req.url = newUrl
})

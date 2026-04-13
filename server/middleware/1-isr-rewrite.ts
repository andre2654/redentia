// ============================================================
// ISR URL rewrite — fix Nuxt 4 + Vercel ISR compatibility
// ============================================================
//
// Vercel ISR rewrites `/` → `/index-isr`, `/whitelabel` → `/whitelabel-isr`.
// Nuxt 4 sees the rewritten path and 404s. This middleware strips `-isr`.
//
// Uses event._path (h3 internal) to rewrite before Vue router resolves.
// ============================================================

export default defineEventHandler((event) => {
  // Read the raw URL from multiple sources — Vercel/h3 may use different ones
  const rawUrl = event._path || event.node.req.url || ''

  const qIdx = rawUrl.indexOf('?')
  const pathname = qIdx >= 0 ? rawUrl.slice(0, qIdx) : rawUrl
  const query = qIdx >= 0 ? rawUrl.slice(qIdx) : ''

  if (!pathname.endsWith('-isr')) return

  // Strip -isr: /index-isr → /, /whitelabel-isr → /whitelabel
  let realPath = pathname.slice(0, -4)
  if (realPath === '/index') realPath = '/'

  const newUrl = realPath + query

  // Overwrite everywhere Nuxt/h3/Nitro might read the URL from
  event._path = newUrl
  event.node.req.url = newUrl

  // Some Nitro versions cache the parsed URL — clear it
  if ((event as any)._url) {
    ;(event as any)._url = undefined
  }
  if ((event as any)._parsedUrl) {
    ;(event as any)._parsedUrl = undefined
  }
})

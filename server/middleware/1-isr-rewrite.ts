// ============================================================
// ISR URL rewrite — fix Nuxt 4 + Vercel ISR compatibility
// ============================================================
//
// When Vercel serves an ISR page, it internally rewrites the URL
// from `/` to `/index-isr`, `/whitelabel` to `/whitelabel-isr`, etc.
// In Nuxt 4, the Vue router receives this rewritten URL and returns
// 404 because there's no route matching `/index-isr`.
//
// This middleware strips the `-isr` suffix from the URL BEFORE
// the Nuxt renderer processes it. This is an internal rewrite
// (mutating req.url), NOT a redirect — the browser URL stays the
// same and there's no redirect loop.
//
// The prefix `1-` ensures this runs right after `0-tenant-resolver`.
// ============================================================

export default defineEventHandler((event) => {
  const url = event.node.req.url
  if (!url) return

  // Match paths ending in -isr (with optional query string)
  const match = url.match(/^(.+)-isr(\?.*)?$/)
  if (!match) return

  const basePath = match[1]
  const query = match[2] || ''

  // /index-isr → /
  // /whitelabel-isr → /whitelabel
  // /ranking/maiores-dividend-yield-isr → /ranking/maiores-dividend-yield
  const realPath = basePath === '/index' ? '/' : basePath

  event.node.req.url = realPath + query
})

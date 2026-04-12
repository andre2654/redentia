// ============================================================
// /api/_debug/tenant — diagnostic endpoint for tenant resolution
// ============================================================
//
// This endpoint exists purely to verify that the new tenant-resolver
// middleware is active in any given environment (dev, preview, prod).
// It reports:
//
//   - `resolverVersion`: a hardcoded timestamp that changes every
//     time we deploy the resolver. If the version you see doesn't
//     match the one you expect, the deploy didn't go through.
//
//   - `tenantSlug`: what the resolver decided for this request.
//     Should match `?brand=...` override when present, otherwise
//     the host-derived slug, otherwise 'redentia'.
//
//   - `host`, `queryBrand`, `url`: raw inputs so you can trace
//     exactly what the resolver saw.
//
// Usage:
//   curl "https://www.redentia.com.br/api/_debug/tenant"
//   curl "https://www.redentia.com.br/api/_debug/tenant?brand=holder"
//   curl -H "Host: www.saraivainvest.com.br" "https://..../api/_debug/tenant"
//
// Safe to leave in production — no secrets, no writes, no PII.
// ============================================================

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const host = getRequestHeader(event, 'host') || ''
  const queryBrand = url.searchParams.get('brand')

  return {
    // Bump this timestamp on every commit to this file so we can tell
    // at a glance which build is live in any given environment.
    resolverVersion: '2026-04-12-v3-isr-allowquery',
    // Commit SHA of the build that's currently serving requests.
    // Vercel sets VERCEL_GIT_COMMIT_SHA automatically on every deploy.
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'local-dev',
    commitShort: (process.env.VERCEL_GIT_COMMIT_SHA || 'local-dev').slice(0, 7),
    deployEnv: process.env.VERCEL_ENV || 'dev',
    tenantSlug: event.context.tenantSlug || null,
    host,
    queryBrand,
    url: url.pathname + url.search,
    hasMiddleware: 'tenantSlug' in event.context,
    timestamp: new Date().toISOString(),
  }
})

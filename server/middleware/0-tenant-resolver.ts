// ============================================================
// tenant-resolver — server-first brand resolution
// ============================================================
//
// This middleware is the ONE place where the active tenant is
// decided for any incoming request. It runs before every other
// middleware (filename prefixed with `0-` so Nitro executes it
// first alphabetically), and writes the resolved slug into
// `event.context.tenantSlug`. A Nitro plugin then reads that
// context and populates the `useState('brand:active')` store BEFORE
// any Vue component runs `useBrand()`.
//
// Resolution order (user-approved):
//   1. `?brand=<slug>` query string (explicit override — works in
//      production and dev, lets you demo Saraiva on the Redentia
//      domain with `/?brand=saraiva-invest`)
//   2. Host header (production default — `saraivainvest.com.br`
//      auto-resolves to `saraiva-invest` with zero query string)
//   3. `redentia` default (fallback when nothing matches)
//
// No cookie persistence — the resolution is fully stateless, which
// means the same URL always produces the same tenant regardless of
// history, session or device.
//
// ============================================================
// Notes on interaction with other subdomain middlewares:
//
// - `api.redentia.com.br`, `creative.redentia.com.br`,
//   `whitelabel.redentia.com.br` are PRODUCT subdomains, not
//   TENANT subdomains. They rewrite the URL internally to serve
//   /api-portal/*, /creative/*, /whitelabel/* — the active brand
//   for those is always Redentia (they're Redentia-owned surfaces).
//   This middleware respects those hosts and returns early without
//   setting a tenant, letting them keep the default.
//
// - `api.saraivainvest.com.br` → rewrite by api-subdomain + set
//   tenantSlug = 'saraiva-invest'. This is handled by the two
//   middlewares running in order: tenant-resolver first decides
//   the brand based on the root domain, then api-subdomain does
//   the URL rewrite. End result: user sees Saraiva-branded API
//   portal at api.saraivainvest.com.br.
// ============================================================

import { brands, type BrandSlug } from '~/config/brand'

/**
 * Maps a host (without port) to a tenant slug. Built at import time
 * from the brand.domain fields in brand.ts, so adding a new tenant is
 * a single-line change in that file — no need to touch the middleware.
 *
 * For each brand we register:
 *   - The canonical `www.foo.com.br` (from brand.domain)
 *   - The naked `foo.com.br`
 *   - The `.localhost` variant for dev (e.g. `holder.localhost`)
 */
function buildHostMap(): Map<string, BrandSlug> {
  const map = new Map<string, BrandSlug>()
  for (const [slug, config] of Object.entries(brands) as [BrandSlug, typeof brands[BrandSlug]][]) {
    const domain = config.domain?.toLowerCase().replace(/^https?:\/\//, '').split('/')[0]
    if (!domain) continue
    // Canonical with www prefix
    map.set(domain, slug)
    // Naked domain (strip www.)
    if (domain.startsWith('www.')) {
      map.set(domain.slice(4), slug)
    }
    // Dev: slug.localhost (e.g. holder.localhost)
    map.set(`${slug}.localhost`, slug)
    // Dev: without trailing portion (e.g. saraiva.localhost)
    const firstWord = slug.split('-')[0]
    if (firstWord !== slug) map.set(`${firstWord}.localhost`, slug)
  }
  return map
}

const HOST_TO_SLUG = buildHostMap()

/**
 * Product subdomains belong to Redentia (the dev-facing surfaces).
 * These are NOT tenant subdomains — they render the same UI regardless
 * of which tenant is "active", so the resolver should skip them and let
 * their own subdomain middlewares do the URL rewrite.
 *
 * Note: `api.saraivainvest.com.br` is still a tenant subdomain for Saraiva
 * (tenant-resolver would pick up `saraivainvest.com.br` as the root host).
 * Only the literal `api.redentia.com.br` / `creative.redentia.com.br` /
 * `whitelabel.redentia.com.br` are skipped here — those map to Redentia
 * brand and their subdomain middlewares handle URL rewriting.
 */
const PRODUCT_SUBDOMAIN_HOSTS = new Set([
  'api.redentia.com.br',
  'api.localhost',
  'api.redentia.localhost',
  'creative.redentia.com.br',
  'creative.localhost',
  'creative.redentia.localhost',
  'whitelabel.redentia.com.br',
  'whitelabel.localhost',
  'whitelabel.redentia.localhost',
])

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

function resolveSlugFromHost(host: string): BrandSlug | null {
  const clean = host.split(':')[0].toLowerCase()

  // Product subdomains: always Redentia
  if (PRODUCT_SUBDOMAIN_HOSTS.has(clean)) return 'redentia'

  // Exact match first
  const exact = HOST_TO_SLUG.get(clean)
  if (exact) return exact

  // Walk up subdomains: `foo.bar.saraivainvest.com.br` → `bar.saraivainvest.com.br`
  // → `saraivainvest.com.br`. Lets us catch things like `preview.holder.com.br`.
  const parts = clean.split('.')
  for (let i = 1; i < parts.length - 1; i++) {
    const candidate = parts.slice(i).join('.')
    const match = HOST_TO_SLUG.get(candidate)
    if (match) return match
  }

  return null
}

export default defineEventHandler((event) => {
  // Never try to resolve for internal Nuxt/Nitro paths or API calls.
  // Those don't render a tenant-branded page anyway.
  const url = getRequestURL(event)
  if (
    url.pathname.startsWith('/_') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/sw.js') ||
    url.pathname.startsWith('/manifest') ||
    url.pathname.startsWith('/firebase-messaging-sw.js')
  ) {
    return
  }

  // 1. Query string override — highest priority.
  //    Works in production AND dev: `www.redentia.com.br/?brand=holder`
  //    lets you see the Holder brand running on Redentia's domain.
  const queryBrand = firstString(url.searchParams.get('brand'))
  if (queryBrand && queryBrand in brands) {
    event.context.tenantSlug = queryBrand as BrandSlug
    return
  }

  // 2. Host header — the production default.
  //    User hits `www.saraivainvest.com.br` → slug = 'saraiva-invest'.
  const host = getRequestHeader(event, 'host') || ''
  const hostSlug = resolveSlugFromHost(host)
  if (hostSlug) {
    event.context.tenantSlug = hostSlug
    return
  }

  // 3. Default — Redentia.
  //    Applies to `localhost:3000`, `127.0.0.1`, `*.vercel.app` previews,
  //    or any unrecognized host. The composable layer will still fall back
  //    to the local brand.ts config for 'redentia' — no API call needed.
  event.context.tenantSlug = 'redentia'
})

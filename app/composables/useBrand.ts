import { brand as defaultBrand, brands } from '~/config/brand'
import type { BrandSlug } from '~/config/brand'

/**
 * Tenant-aware brand state, server-first resolution.
 *
 * The authoritative decision about WHICH tenant is active happens in
 * `server/middleware/0-tenant-resolver.ts` (host > query > default).
 * That middleware writes the slug into `event.context.tenantSlug`,
 * and the Nitro plugin `plugins/tenant.server.ts` reads it to populate
 * this `useState('brand:active')` store BEFORE any Vue component runs.
 *
 * As a result, `useBrand()` is just a reader, by the time anything
 * calls it, the state is guaranteed to be correct. No init function,
 * no race condition, no hydration mismatch.
 *
 * CRITICAL: `useState` is request-isolated on the SSR side but a
 * singleton on the client. That's exactly what we want:
 *   - Server: each incoming request gets a fresh state populated by
 *     the Nitro plugin, so two concurrent users on different tenants
 *     never see each other's config.
 *   - Client: after hydration, the state is a singleton across all
 *     components of the current SPA session. Client-side navigations
 *     that change `?brand=` are handled by `plugins/brand-router.client.ts`
 *     which re-applies the config via `applyBrandOverride()` below.
 *
 * Components call `useBrand()` and consume fields like `brand.colors.text`
 * directly, consumer-side reactivity works because we return a reactive
 * proxy (not a ref). Client-side overrides go through `applyBrandOverride()`
 * which mutates the proxy in place so every subscribed template updates.
 */

/**
 * Internal: returns the shared reactive brand state.
 *
 * The factory is only ever invoked on the client as a safety net,
 * on the server, `plugins/tenant.server.ts` creates the state first
 * (with the correct tenant already applied) before any component
 * runs. If the plugin runs we're fine; if it somehow doesn't, we
 * fall back to Redentia to avoid crashing.
 */
function useBrandState() {
  return useState('brand:active', () =>
    reactive(JSON.parse(JSON.stringify(defaultBrand)))
  )
}

/**
 * Public API, returns the current brand config as a reactive proxy.
 * Templates can use it directly: `{{ brand.colors.primary }}` etc.
 */
export const useBrand = () => {
  const state = useBrandState()
  return state.value
}

/**
 * Applies a client-side brand override without a full page reload.
 *
 * Used by `plugins/brand-router.client.ts` when the user navigates
 * between `?brand=X` URLs inside the same SPA session. Server-side
 * is never involved, the resolver middleware already did its job
 * on the initial request.
 *
 * If the slug isn't in the local `brand.ts`, this falls back to the
 * current state (no-op). There's no API lookup here: for anything not
 * in the local config, the user needs a fresh request so the server
 * middleware can decide what to do (including calling the API for
 * dynamic tenants).
 */
export function applyBrandOverride(slug: string) {
  const localBrand = brands[slug as BrandSlug]
  if (!localBrand) return false

  const state = useBrandState()
  // Object.assign mutates in place so the reactive proxy stays the
  // same object identity, all templates already tracking it update
  // simultaneously without needing to re-establish watchers.
  Object.assign(state.value, JSON.parse(JSON.stringify(localBrand)))
  return true
}

/**
 * Returns the current tenant slug (useful for analytics, logging,
 * conditional logic in components that need to know "am I on Holder?").
 */
export function useTenantSlug(): string {
  return useState<string | null>('brand:resolved-slug').value || 'redentia'
}

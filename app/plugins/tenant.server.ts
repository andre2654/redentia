// ============================================================
// tenant.server — populates the brand state from event.context
// ============================================================
//
// This plugin runs once per request on the SERVER (note the `.server.ts`
// suffix). It reads `event.context.tenantSlug` — set by the
// `0-tenant-resolver` server middleware — and writes the corresponding
// brand config into the `useState('brand:active')` store that
// `useBrand()` reads.
//
// Why a plugin and not `initBrandFromRoute()` in app.vue:
//
//  - Plugins run BEFORE any component setup, including the root app.vue.
//    That means the first time any component calls `useBrand()`, the state
//    is already populated with the correct tenant. No race condition.
//  - `event.context` is request-scoped — every incoming request gets a
//    fresh context, so there's zero chance of state bleeding across
//    concurrent requests (the classic SSR multi-tenant gotcha).
//  - SSR output and client-side hydration produce identical trees because
//    `useState` serializes across the boundary — the client receives the
//    already-resolved tenant as part of the payload, no re-init needed.
//
// The client-side resolution path (`brand-router.client.ts`) is still
// useful for client-side navigation with `?brand=` overrides. But the
// initial render is now fully handled here.

import { brands, type BrandSlug } from '~/config/brand'

export default defineNuxtPlugin({
  name: 'tenant-server',
  enforce: 'pre', // Run before other plugins that might read useBrand()
  setup() {
    // Only runs on server (filename suffix `.server.ts`), but guard anyway
    // for type-safety and to make the intent explicit.
    if (!import.meta.server) return

    const event = useRequestEvent()
    if (!event) return

    const slug = (event.context.tenantSlug || 'redentia') as BrandSlug
    const config = brands[slug] || brands.redentia

    // Populate the shared state. The factory arg (`() => ...`) only runs
    // if the state doesn't exist yet — which in a fresh SSR request, it
    // doesn't. We deep-clone via JSON to get a plain object that reactive()
    // can wrap without freezing the source config.
    const brandState = useState('brand:active', () =>
      reactive(JSON.parse(JSON.stringify(config)))
    )

    // Defensive: if the state already exists somehow (dev HMR, edge cases),
    // overwrite it with the correct tenant for this request.
    if (brandState.value.slug !== slug) {
      Object.assign(brandState.value, JSON.parse(JSON.stringify(config)))
    }

    // Also track the resolved slug separately so downstream code can
    // check "was this request already resolved server-side?" without
    // comparing full config objects.
    const resolvedSlug = useState<string | null>('brand:resolved-slug', () => null)
    resolvedSlug.value = slug
  },
})

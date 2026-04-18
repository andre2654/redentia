/**
 * Client-side brand-aware navigation guard.
 *
 * This plugin handles two related concerns on the client:
 *
 * 1. **Persist `?brand=` across internal navigations.**
 *    When a user is on `/?brand=holder` and clicks `<NuxtLink to="/wallet">`,
 *    the target becomes `/wallet?brand=holder` instead of just `/wallet`.
 *    Without this, every internal link would silently revert the tenant
 *    to whatever the host-based default is.
 *
 * 2. **Apply brand overrides reactively when the query changes.**
 *    If the user manually edits the URL from `?brand=holder` to
 *    `?brand=saraiva-invest` (or a navigation does it), we swap the
 *    active brand state IMMEDIATELY via `applyBrandOverride()`, no
 *    full page reload, no flash. The reactive proxy is mutated in
 *    place so every component re-renders with the new tenant.
 *
 * Server-side resolution lives in `server/middleware/0-tenant-resolver.ts`
 * and `plugins/tenant.server.ts`. This file is ONLY for client-side
 * hot-swaps of already-hydrated pages. Initial requests are fully
 * handled by the server layer.
 */

import { applyBrandOverride } from '~/composables/useBrand'

export default defineNuxtPlugin(() => {
  const router = useRouter()

  router.beforeEach((to, from) => {
    const currentBrand = from.query.brand as string | undefined
    const targetBrand = to.query.brand as string | undefined

    // Case 1: target has an explicit brand override that differs from
    // the current one → apply it before navigation so the new page
    // renders already branded correctly.
    if (targetBrand && targetBrand !== currentBrand) {
      applyBrandOverride(targetBrand)
      return // Proceed with navigation as-is
    }

    // Case 2: target has no brand param but we currently have one →
    // propagate it so the tenant persists across the click.
    if (currentBrand && !targetBrand) {
      return {
        ...to,
        query: { ...to.query, brand: currentBrand },
        replace: true,
      }
    }

    // Else: target already matches, or neither has a brand → no-op.
  })
})

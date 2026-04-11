import { brand as defaultBrand, brands } from '~/config/brand'
import type { BrandSlug } from '~/config/brand'

/**
 * Tenant-aware brand state.
 *
 * CRITICAL: uses `useState` instead of module-level `reactive()` because
 * module state is shared across SSR requests in Nuxt (one Node process,
 * many concurrent requests). If two users hit the server at the same time
 * — one with `?brand=norte-capital` and another with `?brand=primo-rico` —
 * module-level state would bleed between them, causing responses to be
 * served with the wrong tenant. `useState` gives us an isolated instance
 * per request on the server while behaving like a singleton on the client.
 *
 * This fix also eliminates the visible hydration glitch where some
 * components would render with one tenant (from stale module state) and
 * others with the correct tenant, producing Frankenstein layouts.
 *
 * Components call `useBrand()` and consume fields like `brand.colors.text`
 * directly — consumer-side reactivity works because we return a reactive
 * proxy (not a ref). Writes go through `applyConfig()` which mutates the
 * proxy in place so every subscribed template updates simultaneously.
 */

// Internal helper — returns the shared reactive proxy scoped to the
// current Nuxt request (SSR) or session (client). The underlying storage
// is `useState` so it serializes across the hydration boundary.
function useBrandState() {
  // Store a reactive proxy. `useState` accepts any serializable value
  // for hydration; Vue's reactive() wraps it lazily on access.
  return useState('brand:active', () =>
    reactive(JSON.parse(JSON.stringify(defaultBrand)))
  )
}

export const useBrand = () => {
  const state = useBrandState()
  return state.value
}

export const useBrandMeta = () => {
  const tenantLoaded = useState<boolean>('brand:tenant-loaded', () => false)
  const lastResolvedSlug = useState<string | null>('brand:last-slug', () => null)
  return { tenantLoaded, lastResolvedSlug }
}

/**
 * Reads the `?brand=` query param and resolves the brand config
 * from the API (tenants table in DB).
 *
 * Called once in app.vue.
 */
export function initBrandFromRoute() {
  const route = useRoute()
  const config = useRuntimeConfig()
  const { tenantLoaded, lastResolvedSlug } = useBrandMeta()
  const brandState = useBrandState()

  function applyConfig(cfg: Record<string, any>) {
    // Mutate the reactive proxy in place — Object.assign keeps the same
    // object identity so downstream computeds and template bindings
    // continue to track it.
    Object.assign(brandState.value, cfg)
  }

  async function resolveFromApi(slug: string): Promise<boolean> {
    try {
      const res = await $fetch<{ data: { config: Record<string, any> } }>(
        `${config.public.apiBaseUrl}/tenants/resolve/${slug}`
      )
      const tenantConfig = res?.data?.config
      if (tenantConfig) {
        // IMPORTANT: the API config is a snapshot of brand.ts that may be
        // stale (older variants, removed homeSections, wrong hero.variant).
        // Prefer the local config for fields that drive the page layout
        // so a deploy of new variants isn't blocked on re-importing to
        // the tenants table. Only merge fields that are text/content.
        const localBrand = brands[slug as BrandSlug]
        if (localBrand) {
          // Strip layout-defining keys from the API config before merging,
          // then re-apply the local versions on top.
          const merged: Record<string, any> = { ...tenantConfig }
          const layoutKeys: (keyof typeof localBrand)[] = [
            'hero',
            'homeSections',
            'assetPage',
            'font',
            'colors',
            'theme',
          ]
          for (const k of layoutKeys) {
            merged[k] = (localBrand as any)[k]
          }
          applyConfig(merged)
        } else {
          applyConfig(tenantConfig)
        }
        tenantLoaded.value = true
        return true
      }
    } catch {
      console.warn(`[useBrand] Tenant "${slug}" not found in API`)
    }
    return false
  }

  async function detectAndApply() {
    const querySlug = route.query.brand as string | undefined

    if (querySlug) {
      // Skip if already resolved this slug
      if (querySlug === lastResolvedSlug.value && tenantLoaded.value) return
      lastResolvedSlug.value = querySlug

      // Apply local brand config immediately to prevent flash of default
      const localBrand = brands[querySlug as BrandSlug]
      if (localBrand) {
        applyConfig(localBrand)
        // CRITICAL: if the tenant exists in local brand.ts, consider it
        // resolved and DO NOT call the API. The local file is the single
        // source of truth for layout/colors/logo/hero variants; the API
        // is only a fallback for tenants that were added dynamically in
        // the backoffice and aren't in the local config.
        //
        // Skipping the API here eliminates the flicker that used to show
        // on F5: SSR renders with local config → client hydrates → old
        // code would hit the API again and merge a slightly-stale config,
        // causing components (logos, colors, section order) to swap mid-
        // render. Now the client's first paint IS the final paint.
        tenantLoaded.value = true
        return
      }

      // Slug not in local brand.ts → fall back to API (dynamic tenant).
      // SSR still skips the API call for perf; client does the fetch.
      if (import.meta.client) {
        await resolveFromApi(querySlug)
      }
      return
    }

    // No param = default brand (reset if we previously loaded a tenant)
    if (tenantLoaded.value) {
      tenantLoaded.value = false
      lastResolvedSlug.value = null
      applyConfig(defaultBrand)
    }
  }

  // Run sync so the server-rendered HTML already has the right tenant
  detectAndApply()

  // Re-apply when query changes (client navigation)
  if (import.meta.client) {
    watch(
      () => route.query.brand,
      (newSlug, oldSlug) => {
        if (newSlug === oldSlug) return
        detectAndApply()
      }
    )
  }
}

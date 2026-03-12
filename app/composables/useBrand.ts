import { brand as defaultBrand, brands } from '~/config/brand'
import type { BrandSlug } from '~/config/brand'

const activeBrand = reactive({ ...defaultBrand })

/** Indicates whether the brand was loaded from the API (tenant) */
const tenantLoaded = ref(false)

export const useBrand = () => activeBrand
export const useBrandMeta = () => ({ tenantLoaded })

/**
 * Reads the `?brand=` query param and resolves the brand config.
 *
 * Resolution order:
 * 1. Try API: GET /api/tenants/resolve/{slug}  (dynamic, from DB)
 * 2. Fallback: static brands map from brand.ts (legacy)
 *
 * Called once in app.vue.
 */
export function initBrandFromRoute() {
  const route = useRoute()
  const config = useRuntimeConfig()

  function applyConfig(cfg: Record<string, any>) {
    Object.assign(activeBrand, cfg)
  }

  async function resolveFromApi(slug: string): Promise<boolean> {
    try {
      const res = await $fetch<{ data: { config: Record<string, any> } }>(
        `${config.public.apiBaseUrl}/tenants/resolve/${slug}`
      )
      const tenantConfig = res?.data?.config
      if (tenantConfig) {
        applyConfig(tenantConfig)
        tenantLoaded.value = true
        return true
      }
    } catch {
      // API unavailable or tenant not found — fall through to static
    }
    return false
  }

  function applyStaticBrand(slug: string) {
    const key = slug as BrandSlug
    if (brands[key] && slug !== activeBrand.slug) {
      applyConfig(brands[key])
    }
  }

  async function detectAndApply() {
    const querySlug = route.query.brand as string | undefined

    if (querySlug) {
      // Try API first, then fall back to static
      const resolved = await resolveFromApi(querySlug)
      if (!resolved) {
        applyStaticBrand(querySlug)
      }
      return
    }

    // No param = default brand
    tenantLoaded.value = false
    if (activeBrand.slug !== defaultBrand.slug) {
      applyConfig(defaultBrand)
    }
  }

  detectAndApply()

  // Re-apply when query changes
  watch(() => route.query.brand, () => {
    detectAndApply()
  })
}

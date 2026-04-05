import { brand as defaultBrand, brands } from '~/config/brand'
import type { BrandSlug } from '~/config/brand'

const activeBrand = reactive({ ...defaultBrand })

/** Indicates whether the brand was loaded from the API (tenant) */
const tenantLoaded = ref(false)

export const useBrand = () => activeBrand
export const useBrandMeta = () => ({ tenantLoaded })

/**
 * Reads the `?brand=` query param and resolves the brand config
 * from the API (tenants table in DB).
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
      console.warn(`[useBrand] Tenant "${slug}" not found in API`)
    }
    return false
  }

  let lastResolvedSlug: string | null = null

  async function detectAndApply() {
    const querySlug = route.query.brand as string | undefined

    if (querySlug) {
      // Skip if already resolved this slug
      if (querySlug === lastResolvedSlug && tenantLoaded.value) return
      lastResolvedSlug = querySlug

      // Apply local brand config immediately to prevent flash
      const localBrand = brands[querySlug as BrandSlug]
      if (localBrand) {
        applyConfig(localBrand)
      }

      // Then resolve from API (may have newer data)
      await resolveFromApi(querySlug)
      return
    }

    // No param = default brand (only reset if we previously loaded a tenant)
    if (tenantLoaded.value) {
      tenantLoaded.value = false
      lastResolvedSlug = null
      applyConfig(defaultBrand)
    }
  }

  detectAndApply()

  // Re-apply when query changes
  watch(() => route.query.brand, (newSlug, oldSlug) => {
    if (newSlug === oldSlug) return
    detectAndApply()
  })
}

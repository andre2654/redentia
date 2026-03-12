import { brand as defaultBrand } from '~/config/brand'

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

  async function detectAndApply() {
    const querySlug = route.query.brand as string | undefined

    if (querySlug) {
      await resolveFromApi(querySlug)
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

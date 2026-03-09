import { brand as defaultBrand, brands } from '~/config/brand'
import type { BrandSlug } from '~/config/brand'

const activeBrand = reactive({ ...defaultBrand })

export const useBrand = () => activeBrand

/**
 * Reads the `?brand=` query param and applies the matching brand.
 * The brand-router.client.ts plugin ensures the param persists across navigations.
 *
 * Called once in app.vue.
 * When migrating to tenants: replace with domain-based lookup.
 */
export function initBrandFromRoute() {
  const route = useRoute()

  function applyBrand(slug: BrandSlug) {
    if (brands[slug] && slug !== activeBrand.slug) {
      Object.assign(activeBrand, brands[slug])
    }
  }

  function detectAndApply() {
    const querySlug = route.query.brand as BrandSlug | undefined
    if (querySlug && brands[querySlug]) {
      applyBrand(querySlug)
      return
    }

    // No param = default brand
    if (activeBrand.slug !== defaultBrand.slug) {
      Object.assign(activeBrand, defaultBrand)
    }
  }

  detectAndApply()

  // Re-apply when query changes
  watch(() => route.query.brand, () => {
    detectAndApply()
  })
}

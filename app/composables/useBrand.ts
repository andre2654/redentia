import { brand as defaultBrand, brands } from '~/config/brand'
import type { BrandSlug } from '~/config/brand'

const activeBrand = reactive({ ...defaultBrand })

export const useBrand = () => activeBrand

export function initBrandFromRoute() {
  const route = useRoute()

  function applyBrandFromQuery() {
    const slug = route.query.brand as BrandSlug | undefined
    if (slug && brands[slug] && slug !== activeBrand.slug) {
      Object.assign(activeBrand, brands[slug])
    }
  }

  applyBrandFromQuery()
  watch(() => route.query.brand, applyBrandFromQuery)
}

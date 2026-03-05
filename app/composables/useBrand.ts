import { brand as defaultBrand, brands } from '~/config/brand'
import type { BrandSlug } from '~/config/brand'

const activeBrand = reactive({ ...defaultBrand })

export const useBrand = () => activeBrand

export function initBrandFromRoute() {
  const route = useRoute()
  const brandCookie = useCookie<string>('brand', {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  })

  function applyBrand(slug: BrandSlug) {
    if (brands[slug] && slug !== activeBrand.slug) {
      Object.assign(activeBrand, brands[slug])
      brandCookie.value = slug
    }
  }

  // 1. Query param takes priority (and updates cookie)
  const querySlug = route.query.brand as BrandSlug | undefined
  if (querySlug && brands[querySlug]) {
    applyBrand(querySlug)
  }
  // 2. Fall back to cookie
  else if (brandCookie.value && brands[brandCookie.value as BrandSlug]) {
    applyBrand(brandCookie.value as BrandSlug)
  }

  // Watch for future query changes
  watch(() => route.query.brand, (newSlug) => {
    if (newSlug && brands[newSlug as BrandSlug]) {
      applyBrand(newSlug as BrandSlug)
    }
  })
}

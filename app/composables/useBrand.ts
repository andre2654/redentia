import { brand as defaultBrand, brands } from '~/config/brand'
import type { BrandSlug } from '~/config/brand'

const activeBrand = reactive({ ...defaultBrand })

export const useBrand = () => activeBrand

export const useBrandSwitcher = () => {
  const currentSlug = ref<BrandSlug>(activeBrand.slug)

  function switchBrand(slug: BrandSlug) {
    const newBrand = brands[slug]
    if (!newBrand) return
    currentSlug.value = slug
    Object.assign(activeBrand, newBrand)

    if (import.meta.client) {
      localStorage.setItem('dev:brand', slug)
    }
  }

  if (import.meta.client) {
    const saved = localStorage.getItem('dev:brand') as BrandSlug | null
    if (saved && brands[saved] && saved !== currentSlug.value) {
      switchBrand(saved)
    }
  }

  const allSlugs = Object.keys(brands) as BrandSlug[]

  return { currentSlug, switchBrand, allSlugs }
}

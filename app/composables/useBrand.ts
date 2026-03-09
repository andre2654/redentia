import { brand as defaultBrand, brands, BRAND_SLUGS } from '~/config/brand'
import type { BrandSlug } from '~/config/brand'

const activeBrand = reactive({ ...defaultBrand })

/**
 * Current brand prefix for links (e.g. '/me-poupe' or '' for default).
 * Used by useBrandPath() to build correct internal links.
 *
 * When migrating to tenants: replace this with '' and remove prefix logic.
 */
const _brandPrefix = ref('')

export const useBrand = () => activeBrand

/**
 * Returns the current brand route prefix (e.g. '/me-poupe' or '').
 */
export const useBrandPrefix = () => computed(() => _brandPrefix.value)

/**
 * Prepends the brand prefix to a path.
 * Usage: `<NuxtLink :to="$brand('/dashboard')">`
 *
 * When migrating to tenants: this becomes identity — just returns path as-is.
 */
export function useBrandPath() {
  return (path: string) => {
    if (!_brandPrefix.value) return path
    if (path === '/') return `/${_brandPrefix.value}`
    return `/${_brandPrefix.value}${path}`
  }
}

/**
 * Extracts brand slug from route path or meta and applies it.
 * Called once in app.vue.
 *
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
    // 1. Route meta (set by pages:extend hook)
    const metaSlug = route.meta?.brandSlug as BrandSlug | undefined
    if (metaSlug && brands[metaSlug]) {
      applyBrand(metaSlug)
      _brandPrefix.value = metaSlug
      return
    }

    // 2. Fallback: parse first path segment
    const firstSegment = route.path.split('/')[1]
    if (firstSegment && BRAND_SLUGS.includes(firstSegment as BrandSlug)) {
      applyBrand(firstSegment as BrandSlug)
      _brandPrefix.value = firstSegment
      return
    }

    // 3. No prefix = default brand
    if (activeBrand.slug !== defaultBrand.slug) {
      Object.assign(activeBrand, defaultBrand)
    }
    _brandPrefix.value = ''
  }

  // Apply on init
  detectAndApply()

  // Re-apply on navigation
  watch(() => route.fullPath, () => {
    detectAndApply()
  })
}

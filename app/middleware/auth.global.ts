import { BRAND_SLUGS } from '~/config/brand'
import type { BrandSlug } from '~/config/brand'

export default defineNuxtRouteMiddleware(async (to) => {
  const isPublic = to.meta.isPublicRoute === true
  const tokenCookie = useCookie<string | null>('auth:token')
  const token = tokenCookie.value

  if (to.path.startsWith('/api/')) {
    return
  }

  // ── Extract brand prefix from current route ──
  // When migrating to tenants: remove this block entirely
  const firstSegment = to.path.split('/')[1]
  const brandPrefix = BRAND_SLUGS.includes(firstSegment as BrandSlug)
    ? `/${firstSegment}`
    : ''

  // Strip brand prefix to check the actual path
  const actualPath = brandPrefix
    ? to.path.slice(brandPrefix.length) || '/'
    : to.path

  // If route is protected and no token, redirect to login
  if (!isPublic && !token) {
    return navigateTo(`${brandPrefix}/auth/login`)
  }

  // If route is an auth page and already authenticated, send to home
  if (isPublic && token && actualPath.startsWith('/auth/')) {
    return navigateTo(brandPrefix || '/')
  }

  // If authenticated but profile not loaded, try fetching it
  if (token) {
    try {
      const auth = useAuthStore()
      if (!auth.me) await auth.fetchProfile()
    } catch {
      // ignore
    }
  }
})

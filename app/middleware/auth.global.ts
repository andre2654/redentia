export default defineNuxtRouteMiddleware(async (to) => {
  const isPublic = to.meta.isPublicRoute === true
  const tokenCookie = useCookie<string | null>('auth:token')
  const token = tokenCookie.value

  if (to.path.startsWith('/api/')) {
    return
  }

  // Preserve the brand query param across auth redirects so the tenant
  // stays consistent after a forced login/logout. Without this, a user
  // on `/wallet?brand=saraiva-invest` would get redirected to
  // `/auth/login` (no query) and see the Redentia default branding —
  // producing the "Redent.IA logo on a Saraiva-branded flow" bug.
  const brandQuery = to.query.brand
  const withBrand = (path: string) => brandQuery ? { path, query: { brand: brandQuery } } : path

  // If route is protected and no token, redirect to login
  if (!isPublic && !token) {
    return navigateTo(withBrand('/auth/login'))
  }

  // If route is an auth page and already authenticated, send to home
  if (isPublic && token && to.path.startsWith('/auth/')) {
    return navigateTo(withBrand('/'))
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

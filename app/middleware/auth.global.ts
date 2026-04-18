// ============================================================
// Protected path prefixes
// ============================================================
// Explicit allowlist of routes that REQUIRE an auth token. Everything
// else is public by default.
//
// Why path-based and not `to.meta.isPublicRoute`:
//
// Relying on `to.meta.isPublicRoute === true` to decide publicness
// has a subtle failure mode, if page meta isn't loaded by the time
// this middleware runs (e.g. ISR prerender invocation with weird
// URL rewriting on Vercel edge, async component chunks not resolved
// yet, etc), `to.meta.isPublicRoute` reads as `undefined`, the
// middleware concludes the route is private, and kicks users to
// `/auth/login` for rotas públicas. Happened in production: every
// `/?brand=X` hit returned 302 to login even though index.vue has
// `definePageMeta({ isPublicRoute: true })`.
//
// Path-based allowlist is fail-safe: if in doubt, serve public.
// Worst case a protected page leaks to an anonymous user, but
// those pages each have their own `useAuthStore()` check inside
// the component, so the data never actually loads without a token.
// ============================================================
const PROTECTED_PATH_PREFIXES = [
  '/wallet',
  '/settings',
  '/advisor',
]

function isProtected(path: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + '/'))
}

export default defineNuxtRouteMiddleware(async (to) => {
  const tokenCookie = useCookie<string | null>('auth:token')
  const token = tokenCookie.value

  if (to.path.startsWith('/api/')) {
    return
  }

  // Preserve the brand query param across auth redirects so the tenant
  // stays consistent after a forced login/logout. Without this, a user
  // on `/wallet?brand=saraiva-invest` would get redirected to
  // `/auth/login` (no query) and see the Redentia default branding.
  const brandQuery = to.query.brand
  const withBrand = (path: string) => brandQuery ? { path, query: { brand: brandQuery } } : path

  // If route is protected and no token, redirect to login
  if (isProtected(to.path) && !token) {
    return navigateTo(withBrand('/auth/login'))
  }

  // If route is an auth page and already authenticated, send to home
  if (token && to.path.startsWith('/auth/')) {
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

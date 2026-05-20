/**
 * Admin panel route guard.
 *
 * Applied via `definePageMeta({ middleware: 'admin-panel' })` on every
 * page under `/admin/**` EXCEPT `/admin/auth/login`. Enforces:
 *
 *   1. Valid auth token (else → /admin/auth/login with redirect back)
 *   2. Loaded profile (lazy-fetches if missing)
 *   3. role === 'admin' OR is_super_admin === true
 *      (else → https://redentia.com.br/?admin_denied=1)
 *
 * The reason for bouncing non-admins to the MAIN site instead of
 * just showing "access denied" is information hiding — a regular
 * investor shouldn't even know the admin panel exists.
 *
 * IMPORTANTE — porque checa is_super_admin tambem:
 *   No banco, alguns usuarios sao super admins (cross-tenant) mas tem
 *   role='investor' no proprio tenant. O tipo `IProfile` ja expõe esse
 *   flag (`is_super_admin: !!user.is_super_admin` em stores/auth.ts).
 *   Antes esse guard so checava `role === 'admin'`, e super admins
 *   logando em admin.redentia.com.br tomavam bounce pra
 *   ?admin_denied=1 mesmo tendo permissao real no backend.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Allow the login page itself — otherwise we'd redirect-loop.
  if (to.path === '/admin/auth/login') return

  const tokenCookie = useCookie<string | null>('auth:token')
  const token = tokenCookie.value

  if (!token) {
    return navigateTo({
      path: '/admin/auth/login',
      query: to.path === '/admin' ? {} : { redirect: to.fullPath },
    })
  }

  const auth = useAuthStore()
  if (!auth.me) {
    try {
      await auth.fetchProfile()
    } catch {
      tokenCookie.value = null
      return navigateTo('/admin/auth/login')
    }
  }

  const isAdmin = auth.me?.role === 'admin' || auth.me?.is_super_admin === true
  if (!isAdmin) {
    // Non-admin user: bounce to main site. We can't use useMainSiteHref
    // directly here (it's a page composable), so hardcode the absolute
    // URL — main site is always where non-admins belong.
    const mainUrl = import.meta.server
      ? 'https://redentia.com.br/'
      : window.location.hostname.includes('localhost')
        ? 'http://localhost:3000/'
        : 'https://redentia.com.br/'

    // external: true forces a real browser navigation (host change from
    // admin.redentia.com.br back to redentia.com.br).
    return navigateTo(mainUrl + '?admin_denied=1', { external: true })
  }
})

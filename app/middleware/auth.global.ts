export default defineNuxtRouteMiddleware(async (to) => {
  const isPublic = to.meta.isPublicRoute === true
  const tokenCookie = useCookie<string | null>('auth:token')
  const token = tokenCookie.value

  // If route is protected and no token, redirect to login
  if (!isPublic && !token) {
    return navigateTo('/auth/login')
  }

  // If route is an auth page and already authenticated, send to home
  if (isPublic && token && to.path.startsWith('/auth/')) {
    return navigateTo('/')
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

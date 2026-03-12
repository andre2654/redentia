export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  if (authStore.me?.role !== 'admin') {
    return navigateTo('/')
  }
})

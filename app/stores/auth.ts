import type { IProfile } from "~/types/profile"

export const useAuthStore = defineStore('auth', {
  state: (): {
    me: IProfile | null,
  } => {
    return {
      me: null,
    }
  },
  getters: {
    isAuthenticated: () => !!useCookie<string | null>('auth:token').value,
  },
  actions: {
    async fetchProfile() {
      const token = useCookie<string | null>('auth:token').value
      if (!token) {
        this.me = null
        return null
      }
      const { useAuthService } = await import('~/services/auth')
      const { me } = useAuthService()
      const profile = await me(token)
      this.me = profile as unknown as IProfile
      return this.me
    },
    async logout() {
      const token = useCookie<string | null>('auth:token').value
      const { useAuthService } = await import('~/services/auth')
      const { logout } = useAuthService()
      if (token) {
        try { await logout(token) } catch (e) { /* ignore */ }
      }
      const cookie = useCookie<string | null>('auth:token')
      cookie.value = null
      this.me = null
    },
  },
  persist: [
    {
      paths: ['me'],
      storage: persistedState.cookiesWithOptions({ maxAge: 3600 * 24 * 30 }),
    },
  ],
})

import type { IProfile } from "~/types/profile"

export const useAuthStore = defineStore('auth', {
  state: (): {
    me: IProfile | null,
    token: string | null,
  } => {
    return {
      me: null,
      token: useCookie<string | null>('auth:token').value,
    }
  },
  getters: {
    isAuthenticated: () => !!this.token,
  },
  actions: {
    async fetchProfile() {
      const { me } = useAuthService()

      const profile = await me()
      this.me = profile as unknown as IProfile
      return this.me
    },
    async logout() {
      const { logout } = useAuthService()

      await logout()
      this.clearAuthData()
    },
    addToken(token: string) {
      const cookie = useCookie<string | null>('auth:token', {
        maxAge: 3600 * 24 * 30,
      })
      cookie.value = token
      this.token = token
    },
    clearAuthData() {
      const cookie = useCookie<string | null>('auth:token')
      cookie.value = null
      this.me = null
      this.token = null
    },
  },
  persist: [
    {
      paths: ['me'],
      storage: persistedState.cookiesWithOptions({ maxAge: 3600 * 24 * 30 }),
    },
  ],
})

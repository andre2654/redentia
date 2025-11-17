import type { IProfile } from '~/types/profile'

export const useAuthStore = defineStore('auth', {
  state: (): {
    me: IProfile | null
    token: string | null
  } => {
    return {
      me: null,
      token: useCookie<string | null>('auth:token').value,
    }
  },
  getters: {
    isAuthenticated() {
      return !!this.token
    },
  },
  actions: {
    async fetchProfile() {
      const { me } = useAuthService()

      // API returns: { me: { user: {...} }, token: string }
      const response = (await me()) as unknown as {
        data?: any
        me?: { user: IProfile }
        token?: string
      }
      const apiPayload = (response as any)?.data ?? response
      const user = apiPayload?.me?.user ?? apiPayload?.user ?? apiPayload
      const token = apiPayload?.token

      if (user && user.name) {
        this.me = {
          id: String((user as any).id ?? ''),
          name: (user as any).name,
          email: (user as any).email ?? '',
        }
      }

      if (token) {
        this.addToken(token)
      }
      return this.me
    },
    async logout() {
      try {
        const { logout } = useAuthService()

        await logout()
      } catch (error) {
        console.error(error)
      } finally {
        this.clearAuthData()
      }
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

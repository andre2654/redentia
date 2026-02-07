import type { IProfile } from '~/types/profile'

/** Formato do user vindo da API (me, updateProfile, etc.) */
type ApiUser = {
  id?: string | number
  name?: string
  email?: string
  login?: string
  celular?: string
  role?: 'investor' | 'advisor'
  approval_status?: 'pending' | 'approved' | 'rejected' | null
  advisor_code?: string | null
  advisor_id?: number | null
  advisor?: { id: number; name: string } | null
}

function toProfile(user: ApiUser | null | undefined): IProfile | null {
  if (!user || !user.name) return null
  return {
    id: String(user.id ?? ''),
    name: user.name,
    email: user.email ?? '',
    role: user.role ?? 'investor',
    approval_status: user.approval_status ?? null,
    advisor_code: user.advisor_code ?? null,
    advisor_id: user.advisor_id ?? null,
    advisor: user.advisor ?? null,
  }
}

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
    /**
     * Atualiza `me` a partir do objeto user retornado pela API.
     * Use após updateProfile, ou quando tiver o user em mãos, para manter toda a UI reativa.
     */
    setMeFromUser(user: ApiUser | null | undefined) {
      const profile = toProfile(user)
      if (profile) this.me = profile
    },

    async fetchProfile() {
      const { me } = useAuthService()

      // API returns: { user: {...} } or { data: { user: {...} } }
      const response = (await me()) as unknown as {
        data?: any
        me?: { user: ApiUser }
        user?: ApiUser
        token?: string
      }
      const apiPayload = (response as any)?.data ?? response
      const user = apiPayload?.me?.user ?? apiPayload?.user ?? apiPayload
      const token = apiPayload?.token

      this.setMeFromUser(user)

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

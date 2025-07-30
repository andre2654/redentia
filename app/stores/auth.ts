import type { IProfile } from "~/types/profile"

export const useAuthStore = defineStore('auth', {
  state: (): {
    me: IProfile | null,
  } => {
    return {
      me: null,
    }
  },
  actions: {
    async fetchProfile() {
      const { getMe } = useProfileService()
      this.me = await getMe()
    },
  },
  persist: [
    {
      paths: ['me'],
      storage: persistedState.cookiesWithOptions({ maxAge: 3600 * 24 * 30 }),
    },
  ],
})

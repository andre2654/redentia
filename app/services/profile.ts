import type { IProfile } from '~/types/profile'

export const useProfileService = () => {
  async function getMe(): Promise<IProfile> {
    const { me } = useAuthService()

    const token = useCookie<string | null>('auth:token').value
    if (!token) throw new Error('Not authenticated')

    const profile = await me(token)
    return profile as IProfile
  }

  return {
    getMe,
  }
}
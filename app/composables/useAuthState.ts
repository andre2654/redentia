/**
 * Estado de auth MÍNIMO do PR0 (o fluxo completo de login é o PR6).
 * Token sanctum vive em cookie (`nu:token`) pra o SSR enxergar e renderizar a
 * variante certa do shell (deslogado = Mercado + CTAs; logado = Home + avatar)
 * sem flash de hidratação.
 */
export interface NuUser {
  id: number
  name: string
  email?: string
}

export function useAuthState() {
  const token = useCookie<string | null>('nu:token', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: true,
  })
  const user = useState<NuUser | null>('nu:user', () => null)

  const isAuthenticated = computed(() => !!token.value)
  const initial = computed(() => (user.value?.name?.trim()?.[0] ?? 'R').toUpperCase())

  function setSession(newToken: string, newUser: NuUser | null = null) {
    token.value = newToken
    user.value = newUser
  }
  function clearSession() {
    token.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, initial, setSession, clearSession }
}

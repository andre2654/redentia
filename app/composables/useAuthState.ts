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
  const cookie = useCookie<string | null>('nu:token', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: true,
  })
  // ⚠️ FONTE REATIVA ÚNICA (fix do bug real do login, 2026-07-13): cada chamada
  // de useCookie() cria um ref INDEPENDENTE — instâncias não sincronizam entre
  // si. O setSession do /login gravava no ref da própria página, mas o useApi
  // (instanciado antes, com o SEU ref ainda null) mandava o GET /auth/me SEM
  // Authorization → 401 → o interceptor apagava o cookie recém-criado e o
  // usuário "voltava deslogado" logo após digitar o PIN. O token compartilhado
  // agora vive num useState (reativo pra TODO o app); o cookie é só a
  // persistência (escrito junto em setSession/clearSession).
  const token = useState<string | null>('nu:token-live', () => cookie.value ?? null)
  const user = useState<NuUser | null>('nu:user', () => null)

  const isAuthenticated = computed(() => !!token.value)
  const initial = computed(() => (user.value?.name?.trim()?.[0] ?? 'R').toUpperCase())

  function setSession(newToken: string, newUser: NuUser | null = null) {
    token.value = newToken
    cookie.value = newToken
    user.value = newUser
  }
  function clearSession() {
    token.value = null
    cookie.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, initial, setSession, clearSession }
}

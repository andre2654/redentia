/**
 * Estado de auth MÍNIMO do PR0 (o fluxo completo de login é o PR6).
 * Token sanctum vive em cookie (`nu:token`) pra o SSR das rotas PRIVADAS
 * ('/', /carteira, /conta...) enxergar e renderizar a variante certa do shell
 * (deslogado = Mercado + CTAs; logado = Home + avatar) sem flash de hidratação.
 *
 * ⚠️ CACHE DE BORDA (fix de 2026-09-29): rota com `public, s-maxage` no
 * routeRules (/asset/**, /tese/**, /guias/**...) NUNCA recebe a sessão no SSR —
 * o server/plugins/session-cookie-public-cache.ts tira `nu:token`/`nu:name` do
 * request antes do render. O HTML dessas rotas sai igual pra todo mundo e o
 * client liga a variante logada DEPOIS da hidratação (`isAuthenticated` abaixo).
 * Antes, o token ia no payload (`$snu:token-live`) e o HTML de um visitante
 * logado ficava no cache da CDN, servido a todos até expirar.
 */
export interface NuUser {
  id: number
  name: string
  email?: string
}

const COOKIE_OPTS = { maxAge: 60 * 60 * 24 * 30, sameSite: 'lax', secure: true } as const

interface AuthStore {
  token: Ref<string | null>
  user: Ref<NuUser | null>
  displayName: Ref<string | null>
  /** client: a hidratação acabou e a sessão real (cookie) pode aparecer na tela */
  hydrated: Ref<boolean>
}

// ⚠️ FONTE REATIVA ÚNICA (fix do bug real do login, 2026-07-13): cada chamada
// de useCookie() cria um ref INDEPENDENTE — instâncias não sincronizam entre
// si. O setSession do /login gravava no ref da própria página, mas o useApi
// (instanciado antes, com o SEU ref ainda null) mandava o GET /auth/me SEM
// Authorization → 401 → o interceptor apagava o cookie recém-criado e o
// usuário "voltava deslogado" logo após digitar o PIN. O token compartilhado
// vive num store por app (reativo pra TODO o app); o cookie é só a
// persistência (escrito junto em setSession/clearSession).
//
// Store por app, e NÃO useState: useState vai inteiro pro payload do HTML
// (`__NUXT_DATA__`), e token, nome e usuário não podem sair do servidor. No
// server o nuxtApp é por request, então o WeakMap isola um visitante do outro;
// no client o store nasce do próprio cookie (`nu:token` não é httpOnly).
const stores = new WeakMap<ReturnType<typeof useNuxtApp>, AuthStore>()

function authStore(): AuthStore {
  const nuxtApp = useNuxtApp()
  let store = stores.get(nuxtApp)
  if (!store) {
    const created: AuthStore = {
      token: ref(useCookie<string | null>('nu:token', COOKIE_OPTS).value ?? null),
      user: ref<NuUser | null>(null),
      // Nome persistido em cookie próprio (`nu:name`) pro SSR renderizar
      // "Olá, Nome" sem flash — o `user` completo só existe em memória (morre
      // no reload); o nome sobrevive junto do token.
      displayName: ref(useCookie<string | null>('nu:name', COOKIE_OPTS).value ?? null),
      hydrated: ref(import.meta.client && !nuxtApp.isHydrating),
    }
    // Quem vira a chave é o app.vue (markAuthHydrated no 1º onMounted da
    // árvore). Isto é só a garantia pra quando o app.vue não monta (error.vue).
    if (import.meta.client && !created.hydrated.value) {
      nuxtApp.hooks.hookOnce('app:suspense:resolve', () => { created.hydrated.value = true })
    }
    stores.set(nuxtApp, created)
    store = created
  }
  return store
}

/**
 * Fim da hidratação: daqui pra frente o client mostra a sessão REAL (cookie), e
 * não mais a que o SSR desenhou. O app.vue chama no 1º onMounted da árvore, que
 * roda depois de TODA a hidratação e antes dos onMounted das páginas — por isso
 * um `onMounted(() => { if (isAuthenticated.value) ... })` enxerga o login.
 */
export function markAuthHydrated() {
  authStore().hydrated.value = true
}

export function useAuthState() {
  const cookie = useCookie<string | null>('nu:token', COOKIE_OPTS)
  const nameCookie = useCookie<string | null>('nu:name', COOKIE_OPTS)
  const { token, user, displayName, hydrated } = authStore()

  // O que o SSR desenhou (só o booleano vai pro payload). Na hidratação o
  // client renderiza ISTO, não o cookie: numa rota de cache público o HTML
  // saiu anônimo mesmo pra quem está logado, e renderizar o cookie aqui daria
  // hydration mismatch. Rota privada: o SSR viu o mesmo cookie → mesmo valor.
  const ssrAuth = useState<boolean>('nu:ssr-auth', () => !!token.value)

  const isAuthenticated = computed(() =>
    import.meta.server || hydrated.value ? !!token.value : ssrAuth.value)
  const initial = computed(
    () => ((user.value?.name ?? displayName.value)?.trim()?.[0] ?? 'R').toUpperCase(),
  )
  /** primeiro nome pra saudações ("Olá, André"); null quando desconhecido. */
  const firstName = computed(() => {
    const n = (user.value?.name ?? displayName.value)?.trim()
    return n ? (n.split(/\s+/)[0] ?? null) : null
  })

  function setSession(newToken: string, newUser: NuUser | null = null) {
    token.value = newToken
    cookie.value = newToken
    user.value = newUser
    if (newUser?.name) {
      displayName.value = newUser.name
      nameCookie.value = newUser.name
    }
    if (import.meta.server) ssrAuth.value = true
  }
  function clearSession() {
    token.value = null
    cookie.value = null
    user.value = null
    displayName.value = null
    nameCookie.value = null
    if (import.meta.server) ssrAuth.value = false
  }

  return { token, user, isAuthenticated, initial, firstName, displayName, setSession, clearSession }
}

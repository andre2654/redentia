/**
 * Estado de auth MÍNIMO do PR0 (o fluxo completo de login é o PR6).
 * Token sanctum vive em cookie (`nu:token`) pra o SSR enxergar e renderizar a
 * variante certa do shell (deslogado = Mercado + CTAs; logado = Home + avatar)
 * sem flash de hidratação.
 *
 * ⚠️ SEGURANÇA (hotfix 29/09/2026): token, usuário e nome NUNCA vão pro payload
 * do SSR. Até aqui viviam em useState, e todo useState é serializado no
 * __NUXT_DATA__ da página. Como /asset, /dividendos, /guias e irmãs são
 * cacheadas na borda (e a CDN não varia por cookie), o HTML renderizado pra
 * um logado — com o token dele no payload — era servido a visitantes anônimos
 * (sonda em produção: MISS com cookie, HIT sem cookie, token no HTML).
 *
 * Agora a fonte reativa única é um objeto preso à instância do app
 * (useNuxtApp), que não é serializado: no servidor nasce do cookie DA
 * REQUISIÇÃO (uma instância por request — nada vaza entre visitantes), no
 * client nasce do cookie do browser. Do payload sai só o booleano
 * `nu:sessao-ssr` ("renderizei com sessão?"), pra hidratar igual ao HTML:
 * sem ele, o HTML anônimo que a borda serve a um logado hidrataria com o
 * header errado. A armadilha antiga (token null no payload impedia o
 * inicializador de ler o cookie no client) deixa de existir: o token nunca
 * vem do payload.
 * O Cache-Control por sessão é a outra metade: server/middleware/cache-sessao.ts.
 */
import type { Ref } from 'vue'

export interface NuUser {
  id: number
  name: string
  email?: string
}

interface SessaoDoApp {
  token: Ref<string | null>
  user: Ref<NuUser | null>
  displayName: Ref<string | null>
  /** HIT da borda com cookie: o token do cookie esperando a hidratação acabar */
  adiado: string | null
}

// Chave = instância do app (1 por request no servidor, 1 no client). WeakMap:
// a entrada morre junto com o request, e nenhum request enxerga a de outro.
const SESSOES = new WeakMap<object, SessaoDoApp>()

function assumir(sessao: SessaoDoApp) {
  if (sessao.adiado != null && sessao.token.value == null) sessao.token.value = sessao.adiado
  sessao.adiado = null
}

/**
 * Fim da hidratação: assume a sessão que o HIT anônimo da borda adiou. O
 * app.vue chama no 1º onMounted da árvore, que roda depois de TODA a
 * hidratação e ANTES dos onMounted de layout e páginas. Assim um
 * `onMounted(() => { if (isAuthenticated.value) ... })` enxerga o login (o
 * `useThesisFollow` da /tese, por exemplo). O app:suspense:resolve só dispara
 * depois desses onMounted.
 */
export function assumirSessaoAdiada() {
  const sessao = SESSOES.get(useNuxtApp())
  if (sessao) assumir(sessao)
}

export function useAuthState() {
  const cookie = useCookie<string | null>('nu:token', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: true,
  })
  // Nome persistido em cookie próprio (`nu:name`) pro SSR renderizar
  // "Olá, Nome" sem flash — o `user` completo só existe em memória (morre no
  // reload); o nome sobrevive junto do token.
  const nameCookie = useCookie<string | null>('nu:name', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: true,
  })

  // ⚠️ FONTE REATIVA ÚNICA (fix do bug real do login, 2026-07-13): cada chamada
  // de useCookie() cria um ref INDEPENDENTE — instâncias não sincronizam entre
  // si. O setSession do /login gravava no ref da própria página, mas o useApi
  // (instanciado antes, com o SEU ref ainda null) mandava o GET /auth/me SEM
  // Authorization → 401 → o interceptor apagava o cookie recém-criado e o
  // usuário "voltava deslogado" logo após digitar o PIN. Os refs abaixo são
  // compartilhados pelo app inteiro; o cookie é só a persistência (escrito
  // junto em setSession/clearSession).
  const nuxtApp = useNuxtApp()
  // Só um BOOLEANO vai pro payload: "o SSR renderizou com sessão?". Serve pra
  // hidratar igual ao HTML que chegou (ver `adiar` abaixo); o token nunca.
  const sessaoSsr = useState<boolean>('nu:sessao-ssr', () => !!cookie.value)
  let sessao = SESSOES.get(nuxtApp)
  if (!sessao) {
    const doCookie = cookie.value ?? null
    // HIT da borda: o HTML veio do cache ANÔNIMO, mas este browser tem cookie
    // de sessão. Hidratar já logado deixa o header misturado (avatar ao lado
    // de "Entrar", nav sem "Carteira" — o Vue de produção não corrige atributo
    // na hidratação). Então hidrata como o servidor renderizou e assume a
    // sessão do cookie logo que a hidratação termina.
    const adiar = import.meta.client && nuxtApp.isHydrating && !sessaoSsr.value && !!doCookie
    const novo: SessaoDoApp = {
      token: ref<string | null>(adiar ? null : doCookie),
      user: ref<NuUser | null>(null),
      displayName: ref<string | null>(nameCookie.value ?? null),
      adiado: adiar ? doCookie : null,
    }
    // Quem assume é o app.vue (assumirSessaoAdiada); isto é a garantia pra
    // quando ele não monta (error.vue).
    if (adiar) nuxtApp.hooks.hookOnce('app:suspense:resolve', () => assumir(novo))
    SESSOES.set(nuxtApp, novo)
    sessao = novo
  }
  const { token, user, displayName } = sessao

  const isAuthenticated = computed(() => !!token.value)
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
    sessaoSsr.value = true
    user.value = newUser
    if (newUser?.name) {
      displayName.value = newUser.name
      nameCookie.value = newUser.name
    }
  }
  function clearSession() {
    token.value = null
    cookie.value = null
    // no SSR (token morto → a página degrada pro anônimo) o payload tem que
    // dizer "renderizei sem sessão", igual ao HTML
    sessaoSsr.value = false
    user.value = null
    displayName.value = null
    nameCookie.value = null
  }

  return { token, user, isAuthenticated, initial, firstName, displayName, setSession, clearSession }
}

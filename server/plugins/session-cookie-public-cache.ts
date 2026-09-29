/**
 * Rota com cache PÚBLICO na borda nunca enxerga a sessão do visitante.
 *
 * POR QUE (29/09/2026). A CDN da Vercel guarda o HTML de /asset/**, /tese/**,
 * /guias/**, /teses etc. pelo `s-maxage` do routeRules e NÃO varia por cookie.
 * O SSR lia o `nu:token`, desenhava o header logado e serializava o token no
 * payload (`$snu:token-live` no __NUXT_DATA__). Quando o MISS da borda era de
 * um visitante logado, o HTML com o token DELE ficava no cache e era servido a
 * todo mundo até expirar. Reproduzido no build local: GET /asset/PETR4 com
 * `Cookie: nu:token=...` respondia `public, s-maxage=120` com o token no HTML.
 *
 * Duas travas aqui; a terceira (sessão fora do payload) vive no useAuthState:
 *  1. 'request': se o routeRules da rota manda cache compartilhado, os cookies
 *     de sessão saem do request ANTES do render. O SSR dessas rotas é igual pra
 *     anônimo e logado por construção (qualquer `useCookie('nu:token')` lê
 *     vazio, inclusive o render interno do error.vue, que herda estes headers),
 *     e o client liga a variante logada depois da hidratação.
 *  2. 'render:response': rede de segurança. Se um render que ENXERGOU a sessão
 *     sair com cache compartilhado mesmo assim (header posto em runtime, fora
 *     do routeRules), a resposta vira `private, no-store`.
 *
 * As rotas privadas ('/', /carteira, /conta, /login, /busca...) seguem com o
 * cookie: já são `private, no-store` no nuxt.config e renderizam logadas.
 */
const SESSION_COOKIES = new Set(['nu:token', 'nu:name'])

/** `public`/`s-maxage` sem `private`/`no-store`: a borda guarda e serve a qualquer um. */
function isSharedCacheable(cacheControl: unknown): boolean {
  const cc = String(cacheControl ?? '').toLowerCase()
  return /\b(?:public|s-maxage)\b/.test(cc) && !/\b(?:private|no-store)\b/.test(cc)
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const header = event.node.req.headers.cookie
    if (!header) return
    const pairs = header.split(';')
    const kept = pairs.filter((pair) => !SESSION_COOKIES.has(pair.split('=')[0]!.trim()))
    if (kept.length === pairs.length) return // request sem sessão

    if (!isSharedCacheable(getRouteRules(event).headers?.['cache-control'])) {
      event.context.nuSessionVisible = true // o render pode variar por sessão
      return
    }
    if (kept.length) event.node.req.headers.cookie = kept.join(';').trim()
    else delete event.node.req.headers.cookie
  })

  nitroApp.hooks.hook('render:response', (response, { event }) => {
    if (!event.context.nuSessionVisible) return
    const cc = response.headers?.['cache-control'] ?? getResponseHeader(event, 'cache-control')
    if (!isSharedCacheable(cc)) return
    response.headers = { ...response.headers, 'cache-control': 'private, no-store' }
  })
})

import type { H3Event } from 'h3'
import type { $Fetch, FetchOptions, FetchRequest } from 'ofetch'

/**
 * Carimba a chave do Frontend (`X-Redentia-Front-Key`) e o IP do VISITANTE em
 * todo request que este Nitro faz ao Laravel.
 *
 * POR QUE (23/09/2026). O Laravel limita anônimos a 600/min por IP, e o IP que
 * ele enxerga é o de saída da função da Vercel: a Cloudflare na frente do
 * backend anexa ao X-Forwarded-For quem conectou nela. Todo visitante do site
 * dividia meia dúzia de baldes, e uma rajada de crawl de ~1 página fria/s (cada
 * /asset faz ~10 chamadas) virou 1.143 respostas 429 e 164 páginas 503. Com a
 * chave, o Laravel aceita o 1º IP do X-Forwarded-For como o visitante e dá um
 * balde a cada um (Backend: App\Support\FrontOrigin).
 *
 * Dois caminhos, porque o proxy do routeRules não passa pelo `$fetch`:
 *  1. Proxy /api/backend/** do browser: o hook 'request' roda ANTES do handler
 *     do routeRules, e o proxy repassa os headers do request. A Vercel
 *     sobrescreve o X-Forwarded-For do cliente (não aceita IP externo), então o
 *     1º IP é o visitante de verdade; aqui ele só é reduzido a um IP.
 *  2. SSR (`$fetch` direto no backendDirectBase, ou `/api/backend` via
 *     localFetch): o `$fetch` global ganha um embrulho que lê o request em curso
 *     (asyncContext do Nitro) e grava o visitante no X-Forwarded-For.
 *
 * Sem `NUXT_BACKEND_FRONT_KEY` o plugin não faz nada: é o comportamento antigo.
 * A chave é server-only (fora de runtimeConfig.public) e só vai pra URLs do
 * backend, nunca pra outro host.
 */
const FRONT_KEY_HEADER = 'x-redentia-front-key'
const PROXY_PREFIX = '/api/backend/'

function requestIp(event: H3Event): string | undefined {
  return getRequestIP(event, { xForwardedFor: true })?.trim() || undefined
}

/** IP do visitante do request em curso; undefined fora de um request. */
function currentVisitorIp(): string | undefined {
  try {
    return requestIp(useEvent())
  } catch {
    return undefined
  }
}

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()
  const key = String(config.backendFrontKey || '')
  if (!key) return

  const backendBase = `${String(config.backendDirectBase).replace(/\/+$/, '')}/`

  // 1. Proxy do browser (e o /api/backend que o SSR chama via localFetch).
  nitroApp.hooks.hook('request', (event) => {
    if (!event.path.startsWith(PROXY_PREFIX)) return
    const headers = event.node.req.headers
    const ip = requestIp(event)
    if (ip) headers['x-forwarded-for'] = ip
    else delete headers['x-forwarded-for']
    headers[FRONT_KEY_HEADER] = key
  })

  // 2. SSR: embrulha o $fetch global (o Nitro o cria antes de rodar os plugins).
  const original = globalThis.$fetch as $Fetch

  function stamp(request: FetchRequest, options?: FetchOptions<any>): FetchOptions<any> | undefined {
    const url = typeof request === 'string' ? request : request instanceof Request ? request.url : String(request)
    const full = options?.baseURL && url.startsWith('/') ? `${options.baseURL.replace(/\/+$/, '')}${url}` : url
    if (!full.startsWith(backendBase) && !full.startsWith(PROXY_PREFIX)) return options

    const headers = new Headers(options?.headers as HeadersInit | undefined)
    headers.set(FRONT_KEY_HEADER, key)
    const ip = currentVisitorIp()
    if (ip) headers.set('x-forwarded-for', ip)
    return { ...options, headers }
  }

  const wrapped = ((request: FetchRequest, options?: FetchOptions<any>) =>
    original(request, stamp(request, options))) as $Fetch
  wrapped.raw = ((request: FetchRequest, options?: FetchOptions<any>) =>
    original.raw(request, stamp(request, options))) as $Fetch['raw']
  wrapped.native = original.native
  wrapped.create = original.create
  globalThis.$fetch = wrapped
})

/**
 * Client Hints integration for color mode.
 *
 * O navegador envia `Sec-CH-Prefers-Color-Scheme: light|dark` em todas
 * as requests SE o servidor pediu via `Accept-CH` em uma resposta anterior.
 * Esse middleware:
 *
 *   1. Le o hint do header da request atual.
 *   2. Se o cookie `nuxt-color-mode` esta ausente OU vale 'system',
 *      define o cookie com o valor resolvido a partir do hint. Isso
 *      faz o `@nuxtjs/color-mode` ler o valor concreto no SSR e
 *      renderizar com a paleta certa de cara, eliminando flash.
 *   3. Adiciona `Accept-CH` na response pra browsers comecarem a enviar
 *      o hint nas proximas requests. Tambem adiciona `Vary` pra evitar
 *      cache compartilhado servir paleta errada.
 *
 * Limitacao: na PRIMEIRA visita absoluta (browser nunca viu o site)
 * o hint nao chega na request, entao SSR ainda usa fallback. A partir
 * da 2a visita / F5, o hint chega e o SSR ja sabe.
 *
 * Skip pra paths internos (/_nuxt, /api, assets) pra nao adicionar
 * headers desnecessarios.
 */

const SKIP_PREFIXES = ['/_', '/api/', '/__sitemap__']

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Skip technical paths — only document responses need the headers.
  if (SKIP_PREFIXES.some((p) => path.startsWith(p))) return
  if (path.includes('.')) return // assets (.png, .svg, .json, etc.)

  // 1. Read Client Hint
  const hint = getRequestHeader(event, 'sec-ch-prefers-color-scheme')
  const resolved = hint === 'light' ? 'light' : hint === 'dark' ? 'dark' : null

  // 2. Sync cookie if hint present and cookie missing/system
  if (resolved) {
    const existingCookie = getCookie(event, 'nuxt-color-mode')
    if (!existingCookie || existingCookie === 'system') {
      // Set cookie na response pra proximas requests
      setCookie(event, 'nuxt-color-mode', resolved, {
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
      })
      // CRITICO: tambem mutar o request header `cookie` ANTES do
      // @nuxtjs/color-mode rodar pra que ele leia o valor resolvido
      // ja nesta request (nao apenas na proxima). Sem isso, a 1a
      // visita ainda usa fallback mesmo com Client Hint enviado.
      const currentCookie = event.node.req.headers.cookie || ''
      const newCookieFragment = `nuxt-color-mode=${resolved}`
      const updatedCookie = currentCookie
        ? `${currentCookie}; ${newCookieFragment}`
        : newCookieFragment
      event.node.req.headers.cookie = updatedCookie
    }
  }

  // 3. Request Client Hint pra proximas requests
  // Accept-CH: pede ao browser pra enviar o hint
  // Critical-CH: pede pra enviar JA na proxima request (sem esperar reload)
  // Vary: garante cache nao serve dark pra quem esta em light
  setResponseHeader(event, 'Accept-CH', 'Sec-CH-Prefers-Color-Scheme')
  setResponseHeader(event, 'Critical-CH', 'Sec-CH-Prefers-Color-Scheme')
  setResponseHeader(event, 'Vary', 'Sec-CH-Prefers-Color-Scheme')
})

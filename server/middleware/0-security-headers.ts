/**
 * Remove headers que expõem informações técnicas (X-Powered-By)
 * e adiciona headers de segurança básicos.
 *
 * Roda ANTES de qualquer outro middleware (prefixo 0-) para garantir
 * que os headers sejam processados no início da response.
 *
 * Exceção: rotas `/embed/*` precisam ser embeddable em qualquer site
 * (é o propósito delas — widgets pra blogs/newsletters de terceiros).
 * Aí usamos `frame-ancestors *` no CSP e NÃO setamos X-Frame-Options.
 */
export default defineEventHandler((event) => {
  // Remove X-Powered-By (exposto por padrão no Nitro)
  event.node.res.removeHeader('x-powered-by')
  event.node.res.removeHeader('X-Powered-By')

  // Security headers complementares
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')

  const path = event.node.req.url || ''
  const isEmbedRoute = path.startsWith('/embed/') || path.startsWith('/embed?')

  if (isEmbedRoute) {
    // Permite iframe de qualquer origem para widgets embeddable
    setResponseHeader(event, 'Content-Security-Policy', 'frame-ancestors *;')
  } else {
    // Bloqueia iframe cross-origin para o resto do site
    setResponseHeader(event, 'X-Frame-Options', 'SAMEORIGIN')
  }
})

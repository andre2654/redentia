/**
 * Remove headers que expõem informações técnicas (X-Powered-By)
 * e adiciona headers de segurança básicos.
 *
 * Roda ANTES de qualquer outro middleware (prefixo 0-) para garantir
 * que os headers sejam processados no início da response.
 */
export default defineEventHandler((event) => {
  // Remove X-Powered-By (exposto por padrão no Nitro)
  event.node.res.removeHeader('x-powered-by')
  event.node.res.removeHeader('X-Powered-By')

  // Security headers complementares
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'SAMEORIGIN')
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
})

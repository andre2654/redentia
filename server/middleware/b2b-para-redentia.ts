/**
 * Os endereços do B2B levam para redentia.com.br (12/11/2026): o produto de
 * escritório saiu deste front e mora no site dele. O mapa, a query que vai
 * junto e a trava contra laço estão em server/utils/destino-b2b.ts.
 *
 * Roda antes do render (e antes do cache-sessao.ts, pela ordem dos arquivos).
 * Pedido que não começa com /business, /cliente, /jantar, /whitelabel ou
 * /pricing sai na hora. O host é o que o visitante pediu (X-Forwarded-Host na
 * Vercel), para a trava reconhecer quando este front ainda responde em
 * www.redentia.com.br. Link com token (ehLinkPessoal) nunca chega ao app: no
 * 302 e no 404 da trava vão sem cache, sem Referer e fora do índice.
 */
import { destinoB2B, ehLinkPessoal, pareceB2B, PAGINA_LINK_INDISPONIVEL } from '../utils/destino-b2b'

export default defineEventHandler((event) => {
  const caminho = event.path || '/'
  if (!pareceB2B(caminho)) return
  const pessoal = ehLinkPessoal(caminho)
  // link com token: nada de cache, de Referer nem de índice (vale no 302 e no 404)
  if (pessoal) setResponseHeaders(event, { 'cache-control': 'private, no-store', 'referrer-policy': 'no-referrer', 'x-robots-tag': 'noindex, nofollow' })
  const destino = destinoB2B(caminho, getRequestHost(event, { xForwardedHost: true }))
  if (destino) return sendRedirect(event, destino.para, destino.status)
  // a trava segurou (este front ainda responde em redentia.com.br): um 404 seco,
  // sem o app, porque o 404 do app carregaria o analytics com o token no endereço
  if (pessoal) {
    setResponseStatus(event, 404)
    setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
    return PAGINA_LINK_INDISPONIVEL
  }
})

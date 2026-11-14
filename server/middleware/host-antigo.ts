/**
 * Pedido que chega pelo domínio antigo (redentia.com.br) vai para a Aportou com 301, no mesmo caminho
 * (13/11/2026; a regra e o que fica de fora estão em server/utils/destino-b2b.ts, destinoNaAportou, e em
 * docs/aportou/virada-de-dominio.md, seção 4).
 *
 * O 301 sai SEM cache. O cache-sessao.ts, que roda antes (ordem dos arquivos), já pôs o `s-maxage` das
 * páginas públicas nesta resposta; se a borda da Vercel guardasse o redirect sem separar por domínio,
 * quem chegasse em aportou.com.br receberia um 301 para o próprio endereço, em laço.
 */
import { destinoNaAportou } from '../utils/destino-b2b'

export default defineEventHandler((event) => {
  const para = destinoNaAportou(event.path || '/', getRequestHost(event, { xForwardedHost: true }))
  if (!para) return
  setResponseHeader(event, 'cache-control', 'private, no-store')
  return sendRedirect(event, para, 301)
})

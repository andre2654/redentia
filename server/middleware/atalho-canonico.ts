/**
 * Um salto até /asset/{MAIÚSCULO} para /acao/{ticker} e /crypto/{moeda}.
 * A regra está em server/utils/atalho-canonico.ts.
 *
 * Se o host ainda for o domínio antigo, este middleware não responde: o
 * host-antigo manda o caminho como veio para aportou.com.br, e o salto da
 * caixa acontece lá. Correr na frente dele deixaria um 301 relativo no
 * domínio antigo.
 */
import { destinoNaAportou } from '../utils/destino-b2b'
import { destinoCanonicoDeAtalho } from '../utils/atalho-canonico'

export default defineEventHandler((event) => {
  const caminho = event.path || '/'
  if (destinoNaAportou(caminho, getRequestHost(event, { xForwardedHost: true }))) return
  const para = destinoCanonicoDeAtalho(caminho)
  if (!para) return
  setResponseHeader(event, 'cache-control', 'public, max-age=0, must-revalidate')
  return sendRedirect(event, para, 301)
})

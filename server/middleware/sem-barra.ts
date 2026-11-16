/**
 * /caminho/ responde 301 para /caminho, num salto só. A regra está em
 * server/utils/sem-barra.ts (a caixa do ticker e o destino do routeRules
 * saem juntos, para não haver corrente).
 *
 * No domínio antigo este middleware não responde: o host-antigo manda o
 * caminho como veio para aportou.com.br, e a barra sai lá. Correr na frente
 * dele deixaria um 301 relativo no domínio antigo.
 */
import { destinoNaAportou } from '../utils/destino-b2b'
import { destinoSemBarra } from '../utils/sem-barra'

export default defineEventHandler((event) => {
  const caminho = event.path || '/'
  if (destinoNaAportou(caminho, getRequestHost(event, { xForwardedHost: true }))) return
  const para = destinoSemBarra(caminho, event.method)
  if (!para) return
  setResponseHeader(event, 'cache-control', 'public, max-age=0, must-revalidate')
  return sendRedirect(event, para, 301)
})

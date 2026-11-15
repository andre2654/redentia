/**
 * /acao/{ticker} e /crypto/{moeda} iam para /asset/{como veio} pelo routeRules,
 * e a página de ativo fazia um segundo 301 para a caixa alta. Aqui os dois
 * viram um 301 só, já na caixa canônica, com a query.
 *
 * O routeRules saiu de propósito: ele roda na borda, antes do middleware, e
 * reabria a corrente.
 *
 * Símbolo fora do formato de /asset não redireciona (o destino seria 404).
 * /dividendos/{ticker} e /preco-teto não entram: no aportou.com.br cada um
 * já é um salto só. O salto extra que se vê a partir de www.redentia.com.br
 * é o app do B2B, que manda o mesmo caminho para cá.
 */
import { symbolShape } from '../../app/utils/tickerClass.ts'

export function destinoCanonicoDeAtalho(caminhoComQuery: string): string | null {
  const i = caminhoComQuery.indexOf('?')
  const caminho = i < 0 ? caminhoComQuery : caminhoComQuery.slice(0, i)
  const query = i < 0 || caminhoComQuery.slice(i) === '?' ? '' : caminhoComQuery.slice(i)
  const m = /^\/(?:acao|crypto)\/([^/]+)\/?$/.exec(caminho)
  if (!m?.[1]) return null
  let raw = m[1]
  try { raw = decodeURIComponent(raw) }
  catch { return null }
  const upper = raw.toUpperCase()
  if (symbolShape(upper) === 'invalid') return null
  return `/asset/${encodeURIComponent(upper)}${query}`
}

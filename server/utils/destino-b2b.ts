/**
 * Para onde vão os endereços do B2B (12/11/2026). A Redentia de escritório
 * saiu deste front: redentia.com.br passa a ser o site dela (o app novo), e
 * este front fica com a Aportou (aportou.com.br).
 *
 * O mapa mora só aqui. O middleware server/middleware/b2b-para-redentia.ts
 * chama esta função nos pedidos que começam com /business, /cliente, /jantar,
 * /whitelabel ou /pricing. Sem import do Nitro de propósito: o teste
 * (tests/destino-b2b.test.ts) importa direto.
 *
 *   /business, /business/cadastro e o resto de /business/**  → raiz (301)
 *   /business/clientes                                       → /app/clientes (301)
 *   /business/chaves e /business/comecar                     → /app/escritorio (301)
 *   /business/skills                                         → /app (301)
 *   /whitelabel e /pricing                                   → raiz (301)
 *   /business/convite/<token>                                → o mesmo caminho (302)
 *   /cliente e /cliente/**                                   → o mesmo caminho (302)
 *   /jantar                                                  → /jantar (302)
 *
 * A query vai junto. 302 onde o destino é um link pessoal que alguém já
 * recebeu (o convite da chave, o convite e o acesso do cliente final: o app
 * novo serve as mesmas rotas) ou uma campanha (o jantar); 301 onde a página
 * daqui deixou de existir. O casamento ignora maiúsculas (o Vue Router também
 * ignorava) e a barra no fim; o token e o caminho do cliente seguem como
 * vieram.
 *
 * TRAVA CONTRA LAÇO: se o host do destino (sem "www.") é o host do pedido (sem
 * "www.") e o caminho com a query do destino é o mesmo do pedido, devolve null
 * e o pedido segue para o 404. Vale enquanto este front ainda responde em
 * www.redentia.com.br (o apex manda para o www): sem ela, /cliente/convite/x
 * iria e voltaria para sempre.
 */

export const HOST_B2B = 'redentia.com.br'
export const ORIGEM_B2B = `https://${HOST_B2B}`

export interface DestinoB2B {
  para: string
  status: 301 | 302
}

const PREFIXO_B2B = /^\/(?:business|cliente|jantar|whitelabel|pricing)/i

/** A saída cedo do middleware: só estes prefixos podem ser do B2B. */
export function pareceB2B(caminho: string): boolean {
  return PREFIXO_B2B.test(caminho)
}

/**
 * Link pessoal: o token está no endereço (o convite da chave, o convite e o
 * acesso do cliente final). Nesses, nada de cache, de Referer nem de índice, e
 * nunca o app (o 404 do app carregaria o analytics com o token na URL).
 */
export function ehLinkPessoal(caminho: string): boolean {
  const p = (caminho.split('?')[0] ?? '').replace(/\/+$/, '').toLowerCase()
  return p === '/cliente' || p.startsWith('/cliente/') || p.startsWith('/business/convite/')
}

/** A página do link pessoal quando a trava segura: seca, sem script, sem marca de terceiro. */
export const PAGINA_LINK_INDISPONIVEL = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Link indisponível</title></head><body style="margin:0;background:#F9F3EC;color:#111827;font:17px/1.55 system-ui, sans-serif"><main style="max-width:560px;margin:0 auto;padding:72px 24px"><h1 style="margin:0 0 12px;font-size:26px;line-height:1.2">Este link não está disponível.</h1><p style="margin:0;color:#4B5563">Peça um novo a quem enviou.</p></main></body></html>'

/** "www.redentia.com.br:443" → "redentia.com.br"; X-Forwarded-Host com lista vale o primeiro. */
function hostDoPedido(host: string): string {
  const h = (host.split(',')[0] ?? '').trim().toLowerCase()
  return h.replace(/:\d+$/, '').replace(/\.$/, '').replace(/^www\./, '')
}

/** O Location sai só com ASCII visível: o resto vira %XX (e o que nem isso vira, sai). */
function semCaractereSolto(url: string): string {
  return url.replace(/[^\x21-\x7E]/gu, (c) => {
    try { return encodeURIComponent(c) }
    catch { return '' }
  })
}

/** O caminho e a query no destino, ou null quando o caminho não é do B2B. */
function caminhoNoB2B(caminho: string): { caminho: string, status: 301 | 302 } | null {
  const sem = caminho.replace(/\/+$/, '') || '/'
  const p = sem.toLowerCase()
  if (p === '/whitelabel' || p === '/pricing') return { caminho: '/', status: 301 }
  if (p === '/jantar') return { caminho: '/jantar', status: 302 }
  if (p === '/cliente' || p.startsWith('/cliente/')) return { caminho, status: 302 }
  if (p !== '/business' && !p.startsWith('/business/')) return null
  const resto = p.slice('/business'.length)
  if (resto === '/clientes') return { caminho: '/app/clientes', status: 301 }
  if (resto === '/chaves' || resto === '/comecar') return { caminho: '/app/escritorio', status: 301 }
  if (resto === '/skills') return { caminho: '/app', status: 301 }
  const token = /^\/convite\/([^/]+)$/i.exec(sem.slice('/business'.length))?.[1]
  if (token) return { caminho: `/business/convite/${token}`, status: 302 }
  return { caminho: '/', status: 301 }
}

/**
 * O redirecionamento de um pedido do B2B, ou null (não é do B2B, ou a trava
 * contra laço segurou). `caminhoComQuery` é o `event.path` (caminho + query);
 * `host`, o host que o visitante pediu (X-Forwarded-Host na Vercel).
 */
export function destinoB2B(caminhoComQuery: string, host: string): DestinoB2B | null {
  const i = caminhoComQuery.indexOf('?')
  const caminho = i < 0 ? caminhoComQuery : caminhoComQuery.slice(0, i)
  const bruta = i < 0 ? '' : caminhoComQuery.slice(i)
  const query = bruta === '?' ? '' : bruta
  const alvo = caminhoNoB2B(caminho)
  if (!alvo) return null
  if (hostDoPedido(host) === HOST_B2B && alvo.caminho + query === caminho + query) return null
  const resto = alvo.caminho === '/' ? (query ? `/${query}` : '') : alvo.caminho + query
  return { para: semCaractereSolto(`${ORIGEM_B2B}${resto}`), status: alvo.status }
}

/**
 * Headers que o proxy `/api/backend/**` entrega ao Laravel.
 *
 * O `proxyRequest` do h3 descarta o `Accept` do cliente (`ignoredHeaders`).
 * Sem estes dois, o Laravel trata o pedido como navegação: validação vira
 * 302 pra home (o proxy devolve 200 text/html) e `AuthenticationException`
 * tenta `route('login')` e vira 500 HTML. Com `X-Requested-With:
 * XMLHttpRequest` o `expectsJson()` passa, mesmo se o Accept se perder.
 *
 * Não substituem o restante: `X-Forwarded-For` e `X-Redentia-Front-Key`
 * continuam no hook de `server/plugins/backend-front-key.ts` e o h3 junta
 * os dois mapas (os daqui vencem só a chave de mesmo nome).
 */
export const CABECALHOS_JSON_DO_PROXY: Record<string, string> = {
  accept: 'application/json',
  'x-requested-with': 'XMLHttpRequest',
}

/**
 * Header de resposta do proxy. Na prévia, a presença dele confirma que o
 * build que força JSON está no ar (o valor não muda a página).
 */
export const MARCADOR_BUILD_PROXY = 'x-redentia-proxy'
export const MARCADOR_BUILD_PROXY_VALOR = 'json'

export function caminhoDoProxyBackend(path: string): boolean {
  const semQuery = path.split('?')[0] ?? path
  return semQuery === '/api/backend' || semQuery.startsWith('/api/backend/')
}

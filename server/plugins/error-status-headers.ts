/**
 * Headers das páginas de erro 5xx renderizadas no SSR.
 *
 * O 503 é o erro TRANSITÓRIO da casa: /asset/{ticker} (e irmãos) respondem 503
 * quando o backend falha ou devolve 429, justamente para o Google voltar depois
 * em vez de tirar a página do índice. Faltavam duas coisas para o recado sair
 * inteiro:
 *  - `Retry-After`: diz ao crawler QUANDO voltar (RFC 9110). Sem ele, 503 em
 *    sequência vira sinal de site instável e o Google corta o ritmo de crawl.
 *  - `Cache-Control: no-store`: o routeRules de /asset/** e /glossario/** manda
 *    `public, s-maxage=...` pra TODA resposta da rota, erro incluído. A Vercel
 *    não guarda 5xx na borda, mas o header continua chegando no browser e em
 *    qualquer cache no caminho. Header da função vence o do routeRules (docs
 *    da Vercel), então dá pra corrigir aqui.
 *
 * Por que 'render:response' e a query: quem desenha a página de erro é um
 * render interno de `/__nuxt_error?statusCode=...`, cuja resposta própria pode
 * sair 200; o error handler do Nuxt copia os HEADERS desse render interno pra
 * resposta de verdade e usa o status do erro original. O status real, então,
 * vem da query.
 */
const RETRY_AFTER_SECONDS = '120'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const isErrorRender = event.path.startsWith('/__nuxt_error')
    const query = isErrorRender ? getQuery(event) : {}
    const status = Number(isErrorRender ? (query.statusCode ?? query.status) : response.statusCode) || 0
    if (status < 500) return

    response.headers = {
      ...response.headers,
      'cache-control': 'no-store',
      ...(status === 503 ? { 'retry-after': RETRY_AFTER_SECONDS } : {}),
    }
  })
})

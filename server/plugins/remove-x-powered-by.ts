/**
 * Remove X-Powered-By em todos os pontos do ciclo de request.
 * O Nitro e o dev server do Vite setam esse header em momentos diferentes,
 * então interceptamos no 'request' (entrada) E em 'beforeResponse' (saída).
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', (event) => {
    event.node.res.removeHeader('x-powered-by')
  })

  nitro.hooks.hook('beforeResponse', (event) => {
    event.node.res.removeHeader('x-powered-by')
  })

  nitro.hooks.hook('afterResponse', (event) => {
    event.node.res.removeHeader('x-powered-by')
  })
})

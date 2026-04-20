/**
 * Normaliza URLs no nível do servidor para evitar duplicatas no Google:
 *  - Remove trailing slash (exceto na raiz): /acoes/ → /acoes (301)
 *  - Lowercase em tickers: /asset/PETR4 → /asset/petr4 (301)
 *
 * Roda ANTES do Nuxt app carregar — 301 respondido sem bootstrap do Vue,
 * economizando CPU e dando sinal mais rápido pro Google consolidar sinais.
 */
export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname
  const search = url.search

  // Pular APIs, assets estáticos, arquivos técnicos
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/__sitemap__') ||
    path.includes('.') // arquivos como robots.txt, sitemap.xml, .svg, .png
  ) {
    return
  }

  let normalizedPath = path

  // 1. Trailing slash — exceto raiz
  if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1)
  }

  // 2. Lowercase em /asset/<ticker>
  const assetMatch = normalizedPath.match(/^\/asset\/([^/]+)$/)
  if (assetMatch && assetMatch[1] !== assetMatch[1].toLowerCase()) {
    normalizedPath = `/asset/${assetMatch[1].toLowerCase()}`
  }

  if (normalizedPath !== path) {
    return sendRedirect(event, normalizedPath + search, 301)
  }
})

import type { SitemapUrl } from '@nuxtjs/sitemap'

export default defineSitemapEventHandler(async () => {
  const urls: SitemapUrl[] = []

  try {
    // Buscar todos os ativos da API
    const assets = await $fetch<any[]>('https://redentia-api.saraivada.com/api/tickers-full', {
      method: 'GET',
    })

    // Adicionar rotas dinâmicas de ativos
    if (Array.isArray(assets)) {
      for (const asset of assets) {
        if (asset.ticker) {
          urls.push({
            loc: `/asset/${asset.ticker}`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.7,
          })
        }
      }
    }
  } catch (error) {
    console.error('Erro ao buscar ativos para sitemap:', error)
  }

  return urls
})


export default defineSitemapEventHandler(async (e) => {
  const urls: any[] = []

  try {
    console.log('[Sitemap] Buscando ativos da API...')

    // Buscar todos os ativos da API com timeout maior
    const response = await $fetch<any>(
      'https://redentia-api.saraivada.com/api/tickers-full',
      {
        method: 'GET',
        timeout: 30000, // 30 segundos de timeout
      }
    )

    console.log(
      '[Sitemap] Resposta recebida:',
      typeof response,
      Array.isArray(response)
    )

    // A resposta pode vir diretamente como array ou dentro de .data
    let assets = Array.isArray(response) ? response : response?.data || []

    console.log('[Sitemap] Total de ativos encontrados:', assets.length)

    // Adicionar rotas dinâmicas de ativos
    if (Array.isArray(assets) && assets.length > 0) {
      // Aumentar o limite para incluir todos os ativos relevantes (B3 tem ~400-500, mas com BDRs/ETFs pode passar de 1000)
      // Vamos definir um limite seguro de 5000 para garantir que PETR4 e outros não fiquem de fora
      const limitedAssets = assets.slice(0, 5000)

      for (const asset of limitedAssets) {
        if (asset.ticker) {
          urls.push({
            loc: `/asset/${asset.ticker.toLowerCase()}`, // Normalizar para lowercase para bater com o canonical
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.7,
          })
        }
      }

      console.log('[Sitemap] URLs de ativos adicionadas:', urls.length)
    } else {
      console.warn('[Sitemap] Nenhum ativo encontrado ou formato inválido')
    }
  } catch (error) {
    console.error('[Sitemap] Erro ao buscar ativos:', error)
    // Em caso de erro, adicionar alguns ativos importantes manualmente como fallback
    const fallbackTickers = [
      'PETR4',
      'VALE3',
      'ITUB4',
      'BBDC4',
      'MGLU3',
      'ABEV3',
      'B3SA3',
      'WEGE3',
    ]
    for (const ticker of fallbackTickers) {
      urls.push({
        loc: `/asset/${ticker.toLowerCase()}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.7,
      })
    }
    console.log('[Sitemap] Usando ativos fallback:', urls.length)
  }

  return urls
})

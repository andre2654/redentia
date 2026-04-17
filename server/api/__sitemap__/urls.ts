// Top tickers (por liquidez/relevancia) recebem priority mais alta no
// sitemap para sinalizar ao Google que essas paginas devem ser rastreadas
// com maior frequencia. Lista baseada nas acoes de maior volume financeiro
// da B3 (Ibovespa + blue chips + mid caps populares).
const HIGH_PRIORITY_TICKERS = new Set([
  // Bancos (muito procurados)
  'BBAS3', 'ITUB4', 'ITUB3', 'BBDC4', 'BBDC3', 'SANB11', 'BPAC11', 'ITSA4',
  'ITSA3', 'B3SA3', 'BPAN4', 'BRSR6',
  // Commodities / Energia
  'VALE3', 'PETR4', 'PETR3', 'PRIO3', 'RECV3', 'RAIZ4', 'VBBR3', 'UGPA3',
  'BRAV3', 'GGBR4', 'GGBR3', 'GOAU4', 'CSNA3', 'USIM5', 'CMIN3',
  // Varejo / Consumo
  'MGLU3', 'LREN3', 'ABEV3', 'JBSS3', 'BEEF3', 'BRFS3', 'MRFG3', 'AMER3',
  'PETZ3', 'VIVA3', 'ARZZ3', 'SMTO3', 'ASAI3', 'CRFB3', 'VVAR3', 'SBFG3',
  // Saude
  'RDOR3', 'HAPV3', 'RADL3', 'FLRY3', 'QUAL3', 'PNVL3', 'DASA3',
  // Utilities / Telecom
  'VIVT3', 'TIMS3', 'EGIE3', 'ENGI11', 'ELET3', 'ELET6', 'CMIG4', 'CPFE3',
  'TAEE11', 'CPLE6',
  // Industrials
  'EMBR3', 'WEGE3', 'RAIL3', 'CCRO3', 'STBP3', 'VAMO3', 'SIMH3', 'POMO4',
  'MYPK3', 'AERI3',
  // Tech / Fintech
  'TOTS3', 'LWSA3', 'CASH3', 'CVCB3',
  // Construcao / Real Estate
  'BRML3', 'MULT3', 'IGTI11', 'CYRE3', 'EZTC3', 'DIRR3', 'CURY3', 'MRVE3',
  'TEND3', 'JHSF3', 'TRIS3',
  // Novos blue chips/exemplos citados pelo usuario
  'CXSE3', 'BMEB4', 'BRKM5', 'BRKM6', 'ONCO3',
  // FIIs mais liquidos
  'MXRF11', 'HGLG11', 'KNRI11', 'HCTR11', 'XPML11', 'VISC11', 'HGRU11',
  'IRDM11', 'KNIP11', 'XPLG11', 'BCFF11', 'RECT11', 'RZAG11',
])

function priorityFor(ticker: string): number {
  return HIGH_PRIORITY_TICKERS.has(ticker.toUpperCase()) ? 0.9 : 0.6
}

function changeFreqFor(ticker: string): string {
  return HIGH_PRIORITY_TICKERS.has(ticker.toUpperCase()) ? 'hourly' : 'daily'
}

export default defineSitemapEventHandler(async (e) => {
  const urls: any[] = []
  const now = new Date().toISOString()

  try {
    console.log('[Sitemap] Buscando ativos da API...')

    const apiBase = process.env.NUXT_PUBLIC_API_BASE_URL || 'https://redentia-api.saraivada.com/api'
    const response = await $fetch<any>(
      `${apiBase}/tickers-full`,
      {
        method: 'GET',
        timeout: 30000,
      }
    )

    let assets = Array.isArray(response) ? response : response?.data || []

    console.log('[Sitemap] Total de ativos encontrados:', assets.length)

    if (Array.isArray(assets) && assets.length > 0) {
      const limitedAssets = assets.slice(0, 5000)

      for (const asset of limitedAssets) {
        if (asset.ticker) {
          const t = String(asset.ticker).toUpperCase()
          urls.push({
            loc: `/asset/${t.toLowerCase()}`,
            lastmod: now,
            changefreq: changeFreqFor(t),
            priority: priorityFor(t),
          })
        }
      }

      console.log('[Sitemap] URLs de ativos adicionadas:', urls.length)
    } else {
      console.warn('[Sitemap] Nenhum ativo encontrado ou formato inválido')
    }
  } catch (error) {
    console.error('[Sitemap] Erro ao buscar ativos:', error)
    // Fallback usa a lista high-priority inteira
    for (const ticker of HIGH_PRIORITY_TICKERS) {
      urls.push({
        loc: `/asset/${ticker.toLowerCase()}`,
        lastmod: now,
        changefreq: 'hourly',
        priority: 0.9,
      })
    }
    console.log('[Sitemap] Usando ativos fallback:', urls.length)
  }

  return urls
})

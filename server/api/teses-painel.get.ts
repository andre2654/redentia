/**
 * GET /api/teses-painel — a convicção dia a dia, a cesta desde o início e o
 * último pregão de cada tese, com o Ibovespa do mesmo pregão (server/utils/
 * teses-painel.ts). Enriquece a /teses depois do mount; falhou, a página fica
 * com a lista de /theses e os desenhos somem.
 */
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=900')
  try {
    return await fetchTesesPainel()
  }
  catch {
    return { ibov: null, teses: {} }
  }
})

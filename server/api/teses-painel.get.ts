/**
 * GET /api/teses-painel — a convicção dia a dia de cada tese
 * (server/utils/teses-painel.ts). Enriquece os cartões da /teses depois do
 * mount; falhou, os desenhos somem e a grade fica com a lista de /theses.
 */
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=900')
  try {
    return await fetchTesesPainel()
  }
  catch {
    return { teses: {} }
  }
})

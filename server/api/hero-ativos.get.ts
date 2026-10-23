/**
 * GET /api/hero-ativos — as ações que flutuam no hero da home, com a variação
 * do dia (server/utils/hero-ativos.ts). Um minuto na borda; a que falhou não vem.
 */
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600')
  const data = await fetchHeroAtivosCached().catch(() => [])
  return { data }
})

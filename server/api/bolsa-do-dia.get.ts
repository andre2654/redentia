/** A bolsa do dia da home do visitante, cacheada 2 min (server/utils/bolsa-do-dia.ts). */
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=120, stale-while-revalidate=600')
  return fetchBolsaDoDia()
})

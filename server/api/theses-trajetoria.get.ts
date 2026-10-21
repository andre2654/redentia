/**
 * GET /api/theses-trajetoria?slugs=a,b,c — a convicção dia a dia e o
 * desempenho de até seis teses, numa resposta só (a faixa de teses da home).
 * Cada tese vem do cache do Nitro (server/utils/theses-trajetoria.ts); a que
 * falhou vem null e a faixa mostra só os números da lista.
 */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=900, stale-while-revalidate=1800')
  const pedidos = String(getQuery(event).slugs ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => SLUG.test(s) && s.length <= 80)
  const slugs = [...new Set(pedidos)].slice(0, 6)
  // uma tese de cada vez: com o cache frio, são duas chamadas por tese ao backend, sem rajada
  const data: Record<string, Awaited<ReturnType<typeof fetchTrajetoriaCached>>> = {}
  for (const s of slugs) data[s] = await fetchTrajetoriaCached(s).catch(() => null)
  return { data }
})

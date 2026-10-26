/** Altas e baixas da home, cacheadas 2 min. O HTML da home sai com estes links. */
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=120, stale-while-revalidate=600')
  return fetchMercadoMovers()
})

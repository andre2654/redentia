/**
 * GET /api/theses — espelho cacheado do /theses do backend.
 *
 * Mesma forma de resposta do upstream (`{ data: [...] }`) de propósito: os
 * callers (useAcao, useMercado, useTesesPage, useBuscaIndex) só trocam a URL,
 * nada mais. Ver server/utils/theses-feed.ts pro número que motivou.
 *
 * Serve os dois contextos: no SSR o Nitro resolve `$fetch('/api/theses')`
 * internamente, sem roundtrip HTTP; no cliente é same-origin, sem CORS —
 * mesma propriedade do proxy /api/backend/**.
 *
 * Falha do backend NÃO vira 500 aqui: devolve `{ data: [] }` e deixa cada
 * caller cair no próprio degrade (seed do design). A faixa de teses sumir é
 * muito melhor que a página inteira quebrar.
 */
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600')
  try {
    return { data: await fetchThesesCached() }
  }
  catch {
    return { data: [] }
  }
})

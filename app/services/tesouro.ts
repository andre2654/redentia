/**
 * Serviço do domínio Tesouro Direto — fetchers tipados, finos, no padrão do
 * acao.ts (PR2): páginas SSR-first, então os fetchers recebem `base` — no
 * server o composable passa a URL direta do Laravel (backendDirectBase, sem
 * loopback no próprio Nitro); no client o proxy same-origin '/api/backend'.
 * O serviço NÃO engole erro — degrade honesto é responsabilidade do
 * useTesouro (hub: estado honesto; detalhe: 404 real vs 503 temporário).
 */
import type { TesouroApi } from '~/types/market'
import type { TesouroPricePointApi, TesouroRange } from '~/types/tesouro'

const json = { headers: { Accept: 'application/json' } }

/**
 * GET /tesouro[?indexer=IPCA|SELIC|PREFIXADO|IGPM] — lista (70 títulos sem
 * filtro; runtime 2026-07-13: 53 IPCA · 11 prefixados · 5 Selic · 1 IGPM).
 */
export function tesouroFetchList(base: string, indexer?: string | null) {
  const qs = indexer ? `?indexer=${indexer}` : ''
  return $fetch<{ data: TesouroApi[]; meta?: { count: number } }>(`${base}/tesouro${qs}`, json)
}

/** GET /tesouro/{slug} — unitário, mesmo shape do item da lista (404 real). */
export function tesouroFetchOne(base: string, slug: string) {
  return $fetch<{ data: TesouroApi }>(`${base}/tesouro/${slug}`, json)
}

/** GET /tesouro/{slug}/prices?range= — série diária compra/venda (preço e taxa). */
export function tesouroFetchPrices(base: string, slug: string, range: TesouroRange) {
  return $fetch<{ data: TesouroPricePointApi[] }>(`${base}/tesouro/${slug}/prices?range=${range}`, json)
}

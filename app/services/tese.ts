/**
 * Serviço do domínio tese (PR5 /tese/[slug]) — fetchers tipados, finos.
 * SSR-first como o acao.ts: recebem `base` (server = URL direta do Laravel,
 * client = proxy same-origin '/api/backend'). O serviço NÃO engole erro —
 * degradação por seção é responsabilidade do useTese.
 * O comparativo IBOV reusa acaoFetchIbovPrices (services/acao.ts) — uma
 * implementação por responsabilidade.
 */
import type { ConvictionHistoryApi, ThesisFullApi, ThesisPerformanceApi } from '~/types/tese'

const json = { headers: { Accept: 'application/json' } }

/** GET /theses/{slug} — detail + studies[] (404 quando a tese não existe). */
export function teseFetchDetail(base: string, slug: string) {
  return $fetch<{ data: ThesisFullApi }>(`${base}/theses/${slug}`, json)
}

/**
 * GET /theses/{slug}/performance — série base 100 equal-weight desde o
 * lançamento. GOTCHA runtime: `series` é number[] SEM datas (24 pontos).
 */
export function teseFetchPerformance(base: string, slug: string) {
  return $fetch<{ data: ThesisPerformanceApi }>(`${base}/theses/${slug}/performance`, json)
}

/** GET /theses/{slug}/conviction-history — convicção atual + trajetória diária. */
export function teseFetchConviction(base: string, slug: string) {
  return $fetch<{ data: ConvictionHistoryApi }>(`${base}/theses/${slug}/conviction-history`, json)
}

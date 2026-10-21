/**
 * GET /sectors/{apiSlug}/tickers do backend, enxuto e CACHEADO no Nitro.
 *
 * Fonte dos pares do /asset (server/api/setor/[slug]/pares.get.ts). Sem cache,
 * cada página de ação renderizada faria mais uma chamada de 0,6 a 0,8 s ao
 * Laravel (medido em 20/10/2026, 11 setores); aqui são no máximo 11 a cada
 * 6 horas. Quem entra e sai do setor muda pouco, e a ordem por valor de
 * mercado das maiores não mexe de um dia para o outro.
 *
 * Guarda só o que o bloco usa (ticker, nome, tipo, valor de mercado) de todos
 * os tipos: um setor sem ação (o imobiliário devolve só FII) também entra no
 * cache, senão seria buscado de novo a cada página.
 */
import type { RankingRowApi } from '../../app/types/rankings'
import type { LinhaDoSetor } from '../../app/utils/paresDoSetor'

function backendBase(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}

export const fetchSetorLinhasCached = defineCachedFunction(
  async (apiSlug: string): Promise<LinhaDoSetor[]> => {
    const res = await $fetch<{ data?: RankingRowApi[] }>(`/sectors/${encodeURIComponent(apiSlug)}/tickers`, {
      baseURL: backendBase(),
      // o teto do backend (o imobiliário tem 325 e devolve 200)
      query: { limit: 200 },
      headers: { Accept: 'application/json' },
      timeout: 10_000,
    })
    const rows = Array.isArray(res?.data) ? res.data : []
    return rows
      .filter((r): r is RankingRowApi & { ticker: string } => typeof r.ticker === 'string' && r.ticker.length > 0)
      .map((r) => {
        const mc = Number(r.market_cap)
        return {
          ticker: r.ticker.toUpperCase(),
          nome: r.name ?? '',
          tipo: r.type ?? '',
          valorDeMercado: r.market_cap != null && Number.isFinite(mc) ? mc : null,
        }
      })
  },
  {
    name: 'setor-linhas',
    maxAge: 6 * 3600,
    swr: true,
    getKey: (apiSlug: string) => apiSlug,
    // Mesma trava do theses-feed: lista vazia (timeout, 502) não entra no
    // cache, e a página seguinte tenta de novo.
    validate: (entry) => Array.isArray(entry.value) && entry.value.length > 0,
  },
)

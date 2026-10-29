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

/** O que a página de ativo usa da mesma resposta de /sectors/{slug}/tickers. */
export interface SetorLista {
  linhas: LinhaDoSetor[]
  /**
   * aggregates.avg_change_percent — variação média do pregão na lista.
   * DY e P/L médios existem no contrato e voltam null (medido em 29/10/2026):
   * não são guardados aqui para ninguém tratar null como zero.
   */
  variacaoMedia: number | null
  /** aggregates.ticker_count. É o tamanho da lista (teto 200), não o hub. */
  papeis: number | null
  /**
   * change_percent de cada ticker na MESMA resposta da média. A cotação do
   * /asset é ao vivo; esta daqui envelhece com o cache. Comparar as duas
   * seria misturar momentos.
   */
  variacaoPorTicker: Record<string, number>
  /** price_date ('YYYY-MM-DD') de cada ticker, da mesma resposta. */
  dataPorTicker: Record<string, string>
}

function backendBase(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}

export const fetchSetorLinhasCached = defineCachedFunction(
  async (apiSlug: string): Promise<SetorLista> => {
    const res = await $fetch<{ data?: RankingRowApi[]; aggregates?: { avg_change_percent?: number | null; ticker_count?: number | null } }>(`/sectors/${encodeURIComponent(apiSlug)}/tickers`, {
      baseURL: backendBase(),
      // o teto do backend (o imobiliário tem 325 e devolve 200)
      query: { limit: 200 },
      headers: { Accept: 'application/json' },
      timeout: 10_000,
    })
    const rows = Array.isArray(res?.data) ? res.data : []
    const variacaoPorTicker: Record<string, number> = {}
    const dataPorTicker: Record<string, string> = {}
    const linhas = rows
      .filter((r): r is RankingRowApi & { ticker: string } => typeof r.ticker === 'string' && r.ticker.length > 0)
      .map((r) => {
        const mc = Number(r.market_cap)
        const ticker = r.ticker.toUpperCase()
        const variacao = Number(r.change_percent)
        if (Number.isFinite(variacao)) variacaoPorTicker[ticker] = variacao
        const data = typeof r.price_date === 'string' ? r.price_date.slice(0, 10) : ''
        if (/^\d{4}-\d{2}-\d{2}$/.test(data)) dataPorTicker[ticker] = data
        return {
          ticker,
          nome: r.name ?? '',
          tipo: r.type ?? '',
          valorDeMercado: r.market_cap != null && Number.isFinite(mc) ? mc : null,
        }
      })
    const media = Number(res?.aggregates?.avg_change_percent)
    const papeis = Number(res?.aggregates?.ticker_count)
    return {
      linhas,
      variacaoMedia: Number.isFinite(media) ? media : null,
      papeis: Number.isFinite(papeis) && papeis > 0 ? papeis : null,
      variacaoPorTicker,
      dataPorTicker,
    }
  },
  {
    // v3: a média passa a vir com a variação de cada papel da mesma resposta.
    name: 'setor-linhas-v3',
    maxAge: 6 * 3600,
    swr: true,
    getKey: (apiSlug: string) => apiSlug,
    // Mesma trava do theses-feed: lista vazia (timeout, 502) não entra no
    // cache, e a página seguinte tenta de novo.
    validate: (entry) => Array.isArray(entry.value?.linhas) && entry.value.linhas.length > 0,
  },
)

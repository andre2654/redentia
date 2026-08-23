/**
 * GET /theses do backend, CACHEADO no Nitro.
 *
 * POR QUE EXISTE (22/08/2026, medido em produção). O endpoint leva
 * 3,0 a 3,2 segundos, consistentemente, pra devolver 5 KB e 10 itens — todos
 * os outros endpoints do backend respondem em 0,26 a 0,41s. É query sem cache
 * no lado do Laravel (o `returnPct`/`score` de cada tese parece ser calculado
 * por requisição).
 *
 * O problema não é a página /teses: é que `useAcao` chama /theses dentro do
 * Promise.allSettled de TODA página de ativo, pra descobrir se aquele ticker
 * aparece em alguma tese. Como o bloco é paralelo, o tempo total do SSR é o do
 * ramo mais lento — ou seja, esse endpoint sozinho definia um piso de ~3,3s
 * para as 460 páginas de /asset/* do sitemap.
 *
 * Isso é crawl budget. Google modula a taxa de rastreio pela latência do host,
 * e 460 URLs a 3,3s é o perfil que produz "Rastreada, mas não indexada"
 * (1.708 páginas no relatório de cobertura) e "Detectada, mas não indexada"
 * (852). Medido no dia: com cache frio, p50 de 3.344ms mesmo em concorrência 1.
 *
 * O CONSERTO CERTO É NO BACKEND (repo separado, outra PR): cachear ou
 * pré-calcular o agregado. Isto aqui é mitigação no frontend — paga os 3,3s
 * uma vez a cada 5 minutos em vez de uma vez por página renderizada.
 *
 * 5 minutos é folgado pro dado: teses são revalidadas uma vez ao dia.
 */
import type { ThesisCardApi } from '../../app/types/market'

function backendBase(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}

export const fetchThesesCached = defineCachedFunction(
  async (): Promise<ThesisCardApi[]> => {
    const res = await $fetch<{ data?: ThesisCardApi[] }>('/theses', {
      baseURL: backendBase(),
      headers: { Accept: 'application/json' },
      timeout: 10_000,
    })
    return Array.isArray(res?.data) ? res.data : []
  },
  {
    name: 'theses-feed',
    maxAge: 300,
    swr: true,
    getKey: () => 'all',
    // Mesma trava do site-pages.ts: sem `validate`, um timeout do backend
    // gravaria lista VAZIA no cache e todas as páginas de ativo perderiam a
    // seção de teses pelos 5 minutos seguintes, em silêncio. Lista vazia não
    // entra no cache — a chamada seguinte tenta de novo.
    validate: (entry) => Array.isArray(entry.value) && entry.value.length > 0,
  },
)

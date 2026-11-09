/**
 * Serviço da janelinha de espiar ativo (03/11/2026). O perfil, a série de 12
 * meses, o overview e os proventos vêm dos fetchers do domínio ação
 * (services/acao.ts); aqui só o que nenhum outro serviço pede: as leituras do
 * Atlas de UM ativo, para o "por que mexeu hoje". Fino e burro, como os
 * outros: o erro sobe e quem decide é o composable (useEspiarAtivo).
 */
import type { NewsTakeApi } from '~/types/market'

/**
 * GET /research/news?ticker=X&limit=N — os news_takes que marcam o ativo
 * (jsonb @>, cobre {ticker,dir} e o formato legado). Cache de 120 s na API.
 */
export function espiarFetchLeituras(ticker: string, limit = 4) {
  return $fetch<{ data: NewsTakeApi[] }>(
    `/api/backend/research/news?ticker=${encodeURIComponent(ticker)}&limit=${limit}`,
    { headers: { Accept: 'application/json' } },
  )
}

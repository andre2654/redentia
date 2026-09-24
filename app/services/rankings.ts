/**
 * Serviço do domínio rankings (padrão dos services Nu: fetchers tipados,
 * finos, via proxy same-origin /api/backend — o serviço NÃO engole erro;
 * degrade honesto é responsabilidade do composable useRanking).
 *
 * Backend: 19 GET /rankings/* (cache HTTP 15 min), envelope {data:[…]},
 * Resource único ~35 campos. Renda fixa NÃO tem ranking no Laravel →
 * fetchTesouroRanking deriva de GET /tesouro ordenando rate_numeric.
 */
import type { RankingMeta, RankingRowApi, RankingTypeFilter, TesouroRankingRow } from '~/types/rankings'
import type { TesouroApi } from '~/types/market'
import { RANKING_API_TYPE, rankingApiTypes } from '~/utils/rankings'

const base = '/api/backend'
const json = { headers: { Accept: 'application/json' } }

export interface RankingFetchParams {
  /**
   * Um tipo ou vários (a API aceita lista: STOCK,REIT,BDR). null/undefined =
   * sem filtro — o "Todos" das páginas manda o universo declarado no registry.
   */
  type?: 'STOCK' | 'REIT' | 'BDR' | Array<'STOCK' | 'REIT' | 'BDR'> | null
  /** default 50 (SSR com tabela completa no HTML). Max backend: 100. */
  limit?: number
  side?: 'top' | 'bottom'
  days?: number
  /** DY com type=REIT passa 0 (FIIs têm market_cap menor/null). */
  min_cap?: number
}

/** Linhas pedidas à API (máx. 100): a página publica 50 e a folga cobre linha sem cotação ou sem a métrica. */
export const RANKING_FETCH_LIMIT = 100

/**
 * O pedido que a PÁGINA /ranking/<slug> faz pra uma tab. A prévia do hub
 * (/rankings) usa este mesmo pedido: com o mesmo universo e o mesmo limit, o
 * Nº 1 da prévia é o Nº 1 da página (limit=10 no hub podia dar outro 1º).
 * "Todos" = o universo que o ranking DECLARA (meta.types), não a B3 inteira:
 * o maiores-lucros é só de ações e mostrava 50 BDRs com NVDC34 em 1º.
 */
export function rankingFetchParams(meta: RankingMeta, tab: RankingTypeFilter): RankingFetchParams {
  const declared = rankingApiTypes(meta.types)
  const type = tab === 'todos' ? (declared.length ? declared : null) : RANKING_API_TYPE[tab]
  return {
    type,
    limit: RANKING_FETCH_LIMIT,
    side: meta.extraParams?.side as 'top' | 'bottom' | undefined,
    days: meta.extraParams?.days ? Number(meta.extraParams.days) : undefined,
    // DY com FIIs: sem min_cap=0 o filtro default de R$500M zera a lista.
    min_cap: meta.reitMinCapZero && type === 'REIT' ? 0 : undefined,
  }
}

/** GET /rankings/<endpoint> — lista ranqueada (limit=50, ?type= opcional). */
export async function fetchRanking(
  endpoint: string,
  { type = null, limit = 50, side, days, min_cap }: RankingFetchParams = {},
): Promise<{ data: RankingRowApi[] }> {
  const params = new URLSearchParams({ limit: String(limit) })
  const types = Array.isArray(type) ? type : type ? [type] : []
  if (types.length) params.set('type', types.join(','))
  if (side) params.set('side', side)
  if (days != null) params.set('days', String(days))
  if (min_cap != null) params.set('min_cap', String(min_cap))
  return $fetch<{ data: RankingRowApi[] }>(`${base}/rankings/${endpoint}?${params.toString()}`, json)
}

/**
 * Ranking de renda fixa derivado de GET /tesouro (os 3 indexadores em
 * paralelo), ordenado por rate_numeric desc. Indexador que falhar é ignorado
 * (parcial > nada); se TODOS falharem o array sai vazio e o composable
 * degrada honesto.
 */
export async function fetchTesouroRanking(): Promise<TesouroRankingRow[]> {
  const indexers = ['IPCA', 'SELIC', 'PREFIXADO'] as const
  const settled = await Promise.allSettled(
    indexers.map((i) => $fetch<{ data: TesouroApi[] }>(`${base}/tesouro?indexer=${i}`, json)),
  )
  const rows: TesouroRankingRow[] = []
  for (const r of settled) {
    if (r.status !== 'fulfilled') continue
    for (const t of r.value.data ?? []) {
      if (t.rate_numeric == null) continue
      rows.push({
        slug: t.slug,
        name: t.name,
        indexer: t.indexer,
        rate: t.rate,
        rateNumeric: t.rate_numeric,
        maturity: t.maturity_date,
        priceBuy: t.price_buy,
      })
    }
  }
  return rows.sort((a, b) => b.rateNumeric - a.rateNumeric)
}

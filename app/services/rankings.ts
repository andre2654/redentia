/**
 * Serviço do domínio rankings (padrão dos services Nu: fetchers tipados,
 * finos, via proxy same-origin /api/backend — o serviço NÃO engole erro;
 * degrade honesto é responsabilidade do composable useRanking).
 *
 * Backend: 19 GET /rankings/* (cache HTTP 15 min), envelope {data:[…]},
 * Resource único ~35 campos. Renda fixa NÃO tem ranking no Laravel →
 * fetchTesouroRanking deriva de GET /tesouro ordenando rate_numeric.
 */
import type { RankingRowApi, TesouroRankingRow } from '~/types/rankings'
import type { TesouroApi } from '~/types/market'

const base = '/api/backend'
const json = { headers: { Accept: 'application/json' } }

export interface RankingFetchParams {
  /** null/undefined = sem filtro (Todos). */
  type?: 'STOCK' | 'REIT' | 'BDR' | null
  /** default 50 (SSR com tabela completa no HTML). Max backend: 100. */
  limit?: number
  side?: 'top' | 'bottom'
  days?: number
  /** DY com type=REIT passa 0 (FIIs têm market_cap menor/null). */
  min_cap?: number
}

/** GET /rankings/<endpoint> — lista ranqueada (limit=50, ?type= opcional). */
export async function fetchRanking(
  endpoint: string,
  { type = null, limit = 50, side, days, min_cap }: RankingFetchParams = {},
): Promise<{ data: RankingRowApi[] }> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (type) params.set('type', type)
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

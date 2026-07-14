/**
 * Serviço do domínio setores (SEO programático /setor). Fetchers finos e
 * tipados via proxy same-origin /api/backend — NÃO engolem erro; o degrade
 * honesto é responsabilidade do composable useSetor.
 *
 * Backend (verificado ao vivo 2026-07-14):
 *  - GET /sectors → {data:[{slug,name,count}]} (12 setores, slugs em inglês).
 *  - GET /sectors/{slug}/tickers?limit=N → {sector, aggregates, data:[…]}, as
 *    linhas com os MESMOS campos do RankingResource. NA PRÁTICA só
 *    market_price/change_percent/market_cap vêm preenchidos aqui (P/L, DY, ROE,
 *    score voltam null até pra ITUB4/PETR4) — por isso a tabela e a faixa de
 *    aggregates só usam o que tem dado (regra Nu: nada inventado).
 *  - limit é CAPADO em 200 no backend (real-estate tem 322 → devolve 200).
 */
import type { RankingRowApi } from '~/types/rankings'

const base = '/api/backend'
const json = { headers: { Accept: 'application/json' } }

export interface SectorIndexRow {
  slug: string
  name: string
  count: number
}

export interface SectorAggregates {
  ticker_count: number | null
  total_market_cap: number | null
  avg_change_percent: number | null
  avg_dividend_yield: number | null
  avg_trailing_pe: number | null
}

export interface SectorTickersResponse {
  sector: { slug: string; name: string }
  aggregates: SectorAggregates
  data: RankingRowApi[]
}

/** GET /sectors — índice dos setores (slug inglês, nome inglês, contagem). */
export async function fetchSectorsIndex(): Promise<SectorIndexRow[]> {
  const resp = await $fetch<{ data: SectorIndexRow[] }>(`${base}/sectors`, json)
  return resp.data ?? []
}

/**
 * GET /sectors/{apiSlug}/tickers — ativos + aggregates do setor. limit=200
 * (o teto do backend) pra que os aggregates cubram o setor inteiro nos 10
 * setores com ≤200 papéis; o único acima (imobiliário, 322) tem market_cap
 * agregado nulo de qualquer jeito (FIIs sem market_cap), então a faixa
 * some sozinha lá.
 */
export async function fetchSectorTickers(
  apiSlug: string,
  limit = 200,
): Promise<SectorTickersResponse> {
  return $fetch<SectorTickersResponse>(
    `${base}/sectors/${apiSlug}/tickers?limit=${limit}`,
    json,
  )
}

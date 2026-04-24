export interface TesouroItem {
  slug: string
  name: string
  indexer: string | null
  rate: string | null
  rate_numeric: number | null
  maturity_date: string | null
  price_buy: number | null
  price_sell: number | null
  reference_rate: number | null
  reference_rate_label: string | null
  refreshed_at: string | null
}

interface TesouroListResponse {
  data: TesouroItem[]
  meta: { count: number }
}

interface TesouroDetailResponse {
  data: TesouroItem
}

export interface TesouroPricePoint {
  price_at: string
  buy_price: number
  sell_price: number
  buy_rate: number | null
  sell_rate: number | null
}

interface TesouroPricesResponse {
  data: TesouroPricePoint[]
  meta: { slug: string; range: string; count: number }
}

export type TesouroPriceRange = '30d' | '6m' | '1y' | '5y' | 'full'

export function useTesouroService() {
  const config = useRuntimeConfig()
  const API = config.public.apiBaseUrl as string
  const { preventWithCache } = usePrevents()

  async function listTesouros(indexer?: string): Promise<TesouroItem[]> {
    const url = indexer ? `${API}/tesouro?indexer=${encodeURIComponent(indexer)}` : `${API}/tesouro`
    const resp = await preventWithCache(`${url}#shape=v1`, async () =>
      $fetch<TesouroListResponse>(url, { method: 'GET' }),
    )
    return resp?.data ?? []
  }

  async function getTesouro(slug: string): Promise<TesouroItem | null> {
    const url = `${API}/tesouro/${slug}`
    try {
      const resp = await preventWithCache(`${url}#shape=v1`, async () =>
        $fetch<TesouroDetailResponse>(url, { method: 'GET' }),
      )
      return resp?.data ?? null
    } catch {
      return null
    }
  }

  async function getTesouroPrices(
    slug: string,
    range: TesouroPriceRange = '1y',
  ): Promise<TesouroPricePoint[]> {
    const url = `${API}/tesouro/${slug}/prices?range=${range}`
    try {
      const resp = await preventWithCache(`${url}#shape=v1`, async () =>
        $fetch<TesouroPricesResponse>(url, { method: 'GET' }),
      )
      return resp?.data ?? []
    } catch {
      return []
    }
  }

  return { listTesouros, getTesouro, getTesouroPrices }
}

/**
 * Pretty-print the indexer into a short badge label. StatusInvest uses
 * verbose strings like "Indexados ao IPCA" — we compress them to single
 * tokens for UI chips.
 */
export function indexerBadge(indexer: string | null): string {
  if (!indexer) return '—'
  const norm = indexer.toLowerCase()
  if (norm.includes('ipca')) return 'IPCA+'
  if (norm.includes('selic')) return 'SELIC'
  if (norm.includes('igpm') || norm.includes('igp-m')) return 'IGPM+'
  if (norm.includes('prefixado') || norm.includes('pre-fixado')) return 'PRÉ'
  return indexer.toUpperCase().slice(0, 8)
}

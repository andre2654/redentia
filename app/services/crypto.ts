export interface CryptoOhlc {
  open_brl: number | null
  high_brl: number | null
  low_brl: number | null
  close_brl: number | null
  volume_brl: number | null
  open_usd: number | null
  high_usd: number | null
  low_usd: number | null
  close_usd: number | null
  volume_usd: number | null
  variation_pct: number | null
  amplitude_brl: number | null
  volatility_pct: number | null
  time_open: string | null
  time_high: string | null
  time_low: string | null
  last_updated: string | null
}

export interface CryptoAssetItem {
  id: string
  symbol: string
  name: string
  slug: string | null
  image: string | null
  rank: number | null
  num_market_pairs: number | null
  liquidity_index: number | null
  tags: string[] | null

  price_brl: number | null
  market_cap_brl: number | null
  fully_diluted_valuation_brl: number | null
  volume_24h_brl: number | null

  price_usd: number | null
  market_cap_usd: number | null
  fully_diluted_valuation_usd: number | null
  volume_24h_usd: number | null

  volume_change_24h_pct: number | null
  change_1h_pct: number | null
  change_24h_pct: number | null
  change_7d_pct: number | null
  change_30d_pct: number | null
  change_60d_pct: number | null
  change_90d_pct: number | null
  market_cap_dominance_pct: number | null

  circulating_supply: number | null
  total_supply: number | null
  max_supply: number | null
  infinite_supply: boolean | null
  emission_pct: number | null

  min_52w_brl: number | null
  max_52w_brl: number | null
  min_month_brl: number | null
  max_month_brl: number | null
  appreciation_12m_pct: number | null
  appreciation_month_pct: number | null

  ohlc: CryptoOhlc | null
  signals: Record<string, Record<string, number | null>> | null

  date_added: string | null
  last_updated: string | null
  refreshed_at: string | null
  has_rainbow: boolean
}

export interface CryptoPricePoint {
  price_at: string
  price_usd: number | null
  price_brl: number | null
  market_cap_usd: number | null
  volume_usd: number | null
}

interface CryptoListResponse {
  data: CryptoAssetItem[]
  meta: { count: number }
}

interface CryptoDetailResponse {
  data: CryptoAssetItem
}

interface CryptoPricesResponse {
  data: CryptoPricePoint[]
  meta: { id: string; range: string; count: number }
}

export type CryptoPriceRange = '30d' | '6m' | '1y' | '5y' | 'full'

export function useCryptoService() {
  const config = useRuntimeConfig()
  const API = config.public.apiBaseUrl as string
  const { preventWithCache } = usePrevents()

  async function listCryptos(limit = 200, q?: string): Promise<CryptoAssetItem[]> {
    const params = new URLSearchParams()
    params.set('limit', String(limit))
    if (q) params.set('q', q)
    const url = `${API}/crypto?${params.toString()}`
    const resp = await preventWithCache(`${url}#shape=v1`, async () =>
      $fetch<CryptoListResponse>(url, { method: 'GET' }),
    )
    return resp?.data ?? []
  }

  async function getCrypto(idOrSymbol: string): Promise<CryptoAssetItem | null> {
    const url = `${API}/crypto/${idOrSymbol.toLowerCase()}`
    try {
      const resp = await preventWithCache(`${url}#shape=v1`, async () =>
        $fetch<CryptoDetailResponse>(url, { method: 'GET' }),
      )
      return resp?.data ?? null
    } catch {
      return null
    }
  }

  async function getCryptoPrices(
    idOrSymbol: string,
    range: CryptoPriceRange = '1y',
  ): Promise<CryptoPricePoint[]> {
    const url = `${API}/crypto/${idOrSymbol.toLowerCase()}/prices?range=${range}`
    try {
      const resp = await preventWithCache(`${url}#shape=v1`, async () =>
        $fetch<CryptoPricesResponse>(url, { method: 'GET' }),
      )
      return resp?.data ?? []
    } catch {
      return []
    }
  }

  return { listCryptos, getCrypto, getCryptoPrices }
}

export function formatUsd(value: number | null | undefined, opts?: { compact?: boolean; maxDp?: number }): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  const compact = opts?.compact ?? false
  const maxDp = opts?.maxDp ?? (value >= 1 ? 2 : 6)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits: value >= 1 ? 2 : 0,
    maximumFractionDigits: maxDp,
  }).format(value)
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

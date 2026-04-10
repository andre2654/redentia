import type { IAsset, FundamentusApiResponse } from '~/types/asset'

export const useAssetsService = () => {
  const { preventWithCache } = usePrevents()
  const config = useRuntimeConfig()
  const API = config.public.apiBaseUrl as string

  function hasDataField<T>(payload: any): payload is { data: T } {
    return !!payload && typeof payload === 'object' && 'data' in payload
  }

  function unwrapArray<T>(payload: any): T[] {
    if (Array.isArray(payload)) return payload
    if (hasDataField<T[]>(payload) && Array.isArray(payload.data)) {
      return payload.data
    }
    return []
  }

  function unwrapValue<T>(payload: any): T {
    if (hasDataField<T>(payload)) {
      return payload.data
    }
    return payload as T
  }

  async function getAssets(): Promise<IAsset[]> {
    const url = `${API}/tickers-full`
    const response = await preventWithCache(
      url,
      async () =>
        await $fetch<IAsset[]>(url, {
          method: 'GET',
        })
    )
    return unwrapArray<IAsset>(response)
  }

  async function getTopStocks(
    side: 'top' | 'bottom',
    volume: number
  ): Promise<IAsset[]> {
    const query =
      side === 'top'
        ? `?side=top&volume=${volume}`
        : `?side=bottom&volume=${volume}`
    const url = `${API}/top-stocks${query}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch<IAsset[]>(url, { method: 'GET' })
    )
    return unwrapArray<IAsset>(resp)
  }

  async function getTopETFs(
    side: 'top' | 'bottom',
    volume: number
  ): Promise<IAsset[]> {
    const query =
      side === 'top'
        ? `?side=top&volume=${volume}`
        : `?side=bottom&volume=${volume}`
    const url = `${API}/top-etfs${query}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch<IAsset[]>(url, { method: 'GET' })
    )
    return unwrapArray<IAsset>(resp)
  }

  async function getTopReits(
    side: 'top' | 'bottom',
    volume: number
  ): Promise<IAsset[]> {
    const query =
      side === 'top'
        ? `?side=top&volume=${volume}`
        : `?side=bottom&volume=${volume}`
    const url = `${API}/top-reits${query}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch<IAsset[]>(url, { method: 'GET' })
    )
    return unwrapArray<IAsset>(resp)
  }

  async function getTopBDRs(
    side: 'top' | 'bottom',
    volume: number
  ): Promise<IAsset[]> {
    const query =
      side === 'top'
        ? `?side=top&volume=${volume}`
        : `?side=bottom&volume=${volume}`
    const url = `${API}/top-bdrs${query}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch<IAsset[]>(url, { method: 'GET' })
    )
    return unwrapArray<IAsset>(resp)
  }

  async function assetHistoricPrices(
    ticker: string,
    period: '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full'
  ) {
    const url = `${API}/tickers/${ticker}/prices?mode=${period}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrapValue(resp)
  }

  async function getIndiceHistoricPrices(
    indice: 'ibov' | 'ifix',
    period: '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full'
  ) {
    const url = `${API}/indices/${indice}/prices?mode=${period}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrapValue(resp)
  }

  async function getTickerDetails(ticker: string) {
    const url = `${API}/tickers/${ticker}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrapValue(resp)
  }

  async function getTickerDividends(ticker: string) {
    const url = `${API}/dividends/${ticker}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrapValue(resp)
  }

  async function getTickerFundamentus(
    ticker: string
  ): Promise<FundamentusApiResponse> {
    const url = `${API}/fundamentals/${ticker}/overview`
    const resp = await preventWithCache(
      url,
      async () => await $fetch<FundamentusApiResponse>(url, { method: 'GET' })
    )
    return unwrapValue<FundamentusApiResponse>(resp)
  }

  // ---------- Rankings (SEO pages) ----------

  async function getTopDividendYield(
    type: 'STOCK' | 'REIT' | 'ETF' | null = null,
    limit = 30
  ): Promise<IAsset[]> {
    const params = new URLSearchParams({ limit: String(limit) })
    if (type) params.set('type', type)
    const url = `${API}/rankings/top-dividend-yield?${params.toString()}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch<IAsset[]>(url, { method: 'GET' })
    )
    return unwrapArray<IAsset>(resp)
  }

  async function getMonthlyChange(
    side: 'top' | 'bottom' = 'top',
    type: 'STOCK' | 'REIT' | 'ETF' | 'BDR' | null = null,
    limit = 30
  ): Promise<IAsset[]> {
    const params = new URLSearchParams({ side, limit: String(limit) })
    if (type) params.set('type', type)
    const url = `${API}/rankings/monthly-change?${params.toString()}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch<IAsset[]>(url, { method: 'GET' })
    )
    return unwrapArray<IAsset>(resp)
  }

  async function getUpcomingDividends(days = 60, limit = 200) {
    const url = `${API}/dividends/upcoming?days=${days}&limit=${limit}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrapArray<any>(resp)
  }

  async function getRecentDividends(days = 30, limit = 200) {
    const url = `${API}/dividends/recent?days=${days}&limit=${limit}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrapArray<any>(resp)
  }

  async function getSectors(): Promise<
    Array<{ slug: string; name: string; count: number }>
  > {
    const url = `${API}/sectors`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrapArray(resp)
  }

  async function getSectorTickers(
    slug: string,
    limit = 100
  ): Promise<{
    sector: { slug: string; name: string } | null
    aggregates: {
      ticker_count: number
      total_market_cap: number
      avg_change_percent: number
      avg_dividend_yield: number | null
      avg_trailing_pe: number | null
    } | null
    data: IAsset[]
  }> {
    const url = `${API}/sectors/${slug}/tickers?limit=${limit}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch<any>(url, { method: 'GET' })
    )
    const sector = resp?.sector ?? null
    const aggregates = resp?.aggregates ?? null
    const data = Array.isArray(resp?.data)
      ? resp.data
      : Array.isArray(resp?.data?.data)
        ? resp.data.data
        : []
    return { sector, aggregates, data }
  }

  return {
    getAssets,
    getTopStocks,
    getTopETFs,
    getTopReits,
    getTopBDRs,
    assetHistoricPrices,
    getTickerDetails,
    getTickerDividends,
    getTickerFundamentus,
    getIndiceHistoricPrices,
    getTopDividendYield,
    getMonthlyChange,
    getUpcomingDividends,
    getRecentDividends,
    getSectors,
    getSectorTickers,
  }
}

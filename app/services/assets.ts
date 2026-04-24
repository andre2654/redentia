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
    // Bump the cache key whenever the response shape changes (new fields added
    // to scrape_extras etc.) — otherwise browsers that cached the old shape
    // in sessionStorage keep rendering "-" for the new fields for up to 60s.
    const resp = await preventWithCache(
      `${url}#shape=v3`,
      async () => await $fetch<FundamentusApiResponse>(url, { method: 'GET' })
    )
    return unwrapValue<FundamentusApiResponse>(resp)
  }

  // ---------- Rankings (SEO pages) ----------
  //
  // NOTE: The /api/rankings/* routes exist in the Laravel backend but
  // are NOT yet deployed to production (redentia-api.saraivada.com).
  // Until the next backend deploy, both functions below fall back to
  // /top-stocks which IS available and returns a superset of the data
  // we need. The fallback computes DY from the `mdi.sum_total` field
  // (accumulated 12-month dividends) divided by market price.
  //
  // Once the backend is redeployed with the rankings routes, the
  // fallbacks become dead code and can be removed.

  async function fetchTopStocksByType(
    type: 'STOCK' | 'REIT' | 'ETF' | 'BDR' | null,
    side: 'top' | 'bottom',
    volume: number,
  ): Promise<IAsset[]> {
    const endpointMap: Record<string, string> = {
      STOCK: 'top-stocks',
      REIT: 'top-reits',
      ETF: 'top-etfs',
      BDR: 'top-bdrs',
    }
    const endpoint = type && endpointMap[type] ? endpointMap[type] : 'top-stocks'
    const url = `${API}/${endpoint}?side=${side}&volume=${volume}`
    // NOTE: we call $fetch directly (bypassing preventWithCache) because
    // this helper runs inside the catch block of an already-awaited call,
    // where Nuxt instance context is lost. preventWithCache internally
    // invokes useRuntimeConfig() which would throw there.
    try {
      const resp = await $fetch<IAsset[]>(url, { method: 'GET' })
      return unwrapArray<IAsset>(resp)
    } catch {
      return []
    }
  }

  function computeDividendYield(asset: any): number {
    // Top-stocks returns monthly dividend index (mdi) history per
    // ticker. The last entry's `sum_total` is the trailing-12-month
    // absolute dividend per share; dividing by market price gives DY.
    const mdi = Array.isArray(asset?.mdi) && asset.mdi.length > 0
      ? asset.mdi[asset.mdi.length - 1]
      : null
    const sumTotal = Number(mdi?.sum_total)
    const price = Number(asset?.market_price)
    if (!Number.isFinite(sumTotal) || !Number.isFinite(price) || price === 0) return 0
    return (sumTotal / price) * 100
  }

  async function getTopDividendYield(
    type: 'STOCK' | 'REIT' | 'ETF' | null = null,
    limit = 30,
  ): Promise<IAsset[]> {
    const params = new URLSearchParams({ limit: String(limit) })
    if (type) params.set('type', type)
    const url = `${API}/rankings/top-dividend-yield?${params.toString()}`
    try {
      const resp = await preventWithCache(
        url,
        async () => await $fetch<IAsset[]>(url, { method: 'GET' }),
      )
      const arr = unwrapArray<IAsset>(resp)
      if (arr.length > 0) return arr
      throw new Error('empty')
    } catch {
      // Fallback: fetch top-stocks wide, compute DY from mdi, sort desc
      const topStocks = await fetchTopStocksByType(type, 'top', 100_000)
      const enriched = topStocks
        .map((t: any) => ({ ...t, dividend_yield: computeDividendYield(t) }))
        .filter((t: any) => t.dividend_yield > 0)
        .sort((a: any, b: any) => b.dividend_yield - a.dividend_yield)
        .slice(0, limit)
      return enriched as IAsset[]
    }
  }

  async function getMonthlyChange(
    side: 'top' | 'bottom' = 'top',
    type: 'STOCK' | 'REIT' | 'ETF' | 'BDR' | null = null,
    limit = 30,
  ): Promise<IAsset[]> {
    const params = new URLSearchParams({ side, limit: String(limit) })
    if (type) params.set('type', type)
    const url = `${API}/rankings/monthly-change?${params.toString()}`
    try {
      const resp = await preventWithCache(
        url,
        async () => await $fetch<IAsset[]>(url, { method: 'GET' }),
      )
      const arr = unwrapArray<IAsset>(resp)
      if (arr.length > 0) return arr
      throw new Error('empty')
    } catch {
      // Fallback: use /top-stocks which is daily top gainers/losers.
      // Good-enough signal while the monthly endpoint is not deployed.
      const topStocks = await fetchTopStocksByType(type, side, 500_000)
      return topStocks.slice(0, limit)
    }
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

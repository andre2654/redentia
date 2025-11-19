import type { IAsset, FundamentusApiResponse } from '~/types/asset'

export const useAssetsService = () => {
  const { preventWithCache } = usePrevents()

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
    const url = 'https://redentia-api.saraivada.com/api/tickers-full'
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
    const url = `https://redentia-api.saraivada.com/api/top-stocks${query}`
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
    const url = `https://redentia-api.saraivada.com/api/top-etfs${query}`
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
    const url = `https://redentia-api.saraivada.com/api/top-reits${query}`
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
    const url = `https://redentia-api.saraivada.com/api/top-bdrs${query}`
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
    const url = `https://redentia-api.saraivada.com/api/tickers/${ticker}/prices?mode=${period}`
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
    const url = `https://redentia-api.saraivada.com/api/indices/${indice}/prices?mode=${period}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrapValue(resp)
  }

  async function getTickerDetails(ticker: string) {
    const url = `https://redentia-api.saraivada.com/api/tickers/${ticker}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrapValue(resp)
  }

  async function getTickerDividends(ticker: string) {
    const url = `https://redentia-api.saraivada.com/api/dividends/${ticker}`
    const resp = await preventWithCache(
      url,
      async () => await $fetch(url, { method: 'GET' })
    )
    return unwrapValue(resp)
  }

  async function getTickerFundamentus(
    ticker: string
  ): Promise<FundamentusApiResponse> {
    const url = `https://redentia-api.saraivada.com/api/fundamentals/${ticker}/overview`
    const resp = await preventWithCache(
      url,
      async () => await $fetch<FundamentusApiResponse>(url, { method: 'GET' })
    )
    return unwrapValue<FundamentusApiResponse>(resp)
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
  }
}

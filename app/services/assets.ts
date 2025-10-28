import type { IAsset, FundamentusApiResponse } from "~/types/asset"

export const useAssetsService = () => {
  const { preventWithCache } = usePrevents()

  async function getAssets(): Promise<IAsset[]> {
    const url = 'https://redentia-api.saraivada.com/api/tickers-full'
    const response = await preventWithCache(url, async () =>
      await $fetch<IAsset[]>(url, {
        method: 'GET',
      })
    )
    return response.data
  }

  async function getTopStocks(side: 'top' | 'bottom', volume: number): Promise<IAsset[]> {
    const query = side === 'top' ? `?side=top&volume=${volume}` : `?side=bottom&volume=${volume}`
    const url = `https://redentia-api.saraivada.com/api/top-stocks${query}`
    const resp = await preventWithCache(url, async () =>
      await $fetch<IAsset[]>(url, { method: 'GET' })
    )
    return resp.data
  }

  async function getTopETFs(side: 'top' | 'bottom', volume: number): Promise<IAsset[]> {
    const query = side === 'top' ? `?side=top&volume=${volume}` : `?side=bottom&volume=${volume}`
    const url = `https://redentia-api.saraivada.com/api/top-etfs${query}`
    const resp = await preventWithCache(url, async () =>
      await $fetch<IAsset[]>(url, { method: 'GET' })
    )
    return resp.data
  }

  async function getTopReits(side: 'top' | 'bottom', volume: number): Promise<IAsset[]> {
    const query = side === 'top' ? `?side=top&volume=${volume}` : `?side=bottom&volume=${volume}`
    const url = `https://redentia-api.saraivada.com/api/top-reits${query}`
    const resp = await preventWithCache(url, async () =>
      await $fetch<IAsset[]>(url, { method: 'GET' })
    )
    return resp.data
  }

  async function getTopBDRs(side: 'top' | 'bottom', volume: number): Promise<IAsset[]> {
    const query = side === 'top' ? `?side=top&volume=${volume}` : `?side=bottom&volume=${volume}`
    const url = `https://redentia-api.saraivada.com/api/top-bdrs${query}`
    const resp = await preventWithCache(url, async () =>
      await $fetch<IAsset[]>(url, { method: 'GET' })
    )
    return resp.data
  }

  async function assetHistoricPrices(ticker: string, period: '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full') {
    const url = `https://redentia-api.saraivada.com/api/tickers/${ticker}/prices?mode=${period}`
    const resp = await preventWithCache(url, async () =>
      await $fetch(url, { method: 'GET' })
    )
    return resp.data
  }

  async function getIndiceHistoricPrices(indice: 'ibov' | 'ifix', period: '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full') {
    const url = `https://redentia-api.saraivada.com/api/indices/${indice}/prices?mode=${period}`
    const resp = await preventWithCache(url, async () =>
      await $fetch(url, { method: 'GET' })
    )
    return resp.data
  }

  async function getTickerDetails(ticker: string) {
    const url = `https://redentia-api.saraivada.com/api/tickers/${ticker}`
    const resp = await preventWithCache(url, async () =>
      await $fetch(url, { method: 'GET' })
    )
    return resp.data
  }

  async function getTickerDividends(ticker: string) {
    const url = `https://redentia-api.saraivada.com/api/dividends/${ticker}`
    const resp = await preventWithCache(url, async () =>
      await $fetch(url, { method: 'GET' })
    )
    return resp.data
  }

  async function getTickerFundamentus(ticker: string): Promise<FundamentusApiResponse> {
    const url = `https://redentia-api.saraivada.com/api/fundamentals/${ticker}/overview`
    const resp = await preventWithCache(url, async () =>
      await $fetch<FundamentusApiResponse>(url, { method: 'GET' })
    )
    return resp.data
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
    getIndiceHistoricPrices
  }
}
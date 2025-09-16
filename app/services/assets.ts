import type { IAsset } from "~/types/asset"

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

  async function assetHistoricPrices(ticker: string, period: '1mo' | 'ytd' | '12mo') {
    const url = `https://redentia-api.saraivada.com/api/tickers/${ticker}/prices?mode=${period}`
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

  return {
    getAssets,
    getTopStocks,
    getTopETFs,
    getTopReits,
    getTopBDRs,
    assetHistoricPrices,
    getTickerDetails
  }
}
import type { IAsset } from "~/types/asset"

export const useAssetsService = () => {
  async function getAssets(): Promise<IAsset[]> {
    const resp = await $fetch('/assets.json') as { stocks: IAsset[] }

    return resp.stocks
  }

  async function getAsset(ticker: string): Promise<IAsset> {
    const resp = await $fetch('/assets.json') as { stocks: IAsset[] }

    const asset = resp.stocks.find((asset: IAsset) => asset.stock === ticker)

    return asset!
  }

  async function getTopStocks(side: 'top' | 'bottom', volume: number): Promise<IAsset[]> {
    const query = side === 'top' ? `?side=top&volume=${volume}` : `?side=bottom&volume=${volume}`
    const resp = await $fetch<IAsset[]>(`https://redentia-api.saraivada.com/api/top-stocks${query}`)

    return resp.data
  }

  async function getTopETFs(side: 'top' | 'bottom', volume: number): Promise<IAsset[]> {
    const query = side === 'top' ? `?side=top&volume=${volume}` : `?side=bottom&volume=${volume}`
    const resp = await $fetch<IAsset[]>(`https://redentia-api.saraivada.com/api/top-etfs${query}`)

    return resp.data
  }

  async function getTopReits(side: 'top' | 'bottom', volume: number): Promise<IAsset[]> {
    const query = side === 'top' ? `?side=top&volume=${volume}` : `?side=bottom&volume=${volume}`
    const resp = await $fetch<IAsset[]>(`https://redentia-api.saraivada.com/api/top-reits${query}`)

    return resp.data
  }

  async function getTopBDRs(side: 'top' | 'bottom', volume: number): Promise<IAsset[]> {
    const query = side === 'top' ? `?side=top&volume=${volume}` : `?side=bottom&volume=${volume}`
    const resp = await $fetch<IAsset[]>(`https://redentia-api.saraivada.com/api/top-bdrs${query}`)

    return resp.data
  }

  async function assetHistoricPrices(ticker: string, period: '1mo' | 'ytd' | '12mo') {
    const resp = await $fetch(`https://redentia-api.saraivada.com/api/tickers/${ticker}/prices?mode=${period}`)

    return resp.data
  }

  return {
    getAssets,
    getAsset,
    getTopStocks,
    getTopETFs,
    getTopReits,
    getTopBDRs,
    assetHistoricPrices
  }
}
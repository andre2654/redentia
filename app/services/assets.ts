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

  async function getTopStocks(): Promise<IAsset[]> {
    const resp = await $fetch<IAsset[]>('https://redentia-api.saraivada.com/api/top-stocks')

    return resp.data
  }

  async function getTopETFs(): Promise<IAsset[]> {
    const resp = await $fetch<IAsset[]>('https://redentia-api.saraivada.com/api/top-etfs')

    return resp.data
  }

  async function getTopReits(): Promise<IAsset[]> {
    const resp = await $fetch<IAsset[]>('https://redentia-api.saraivada.com/api/top-reits')

    return resp.data
  }

  async function getTopBDRs(): Promise<IAsset[]> {
    const resp = await $fetch<IAsset[]>('https://redentia-api.saraivada.com/api/top-reits')

    return resp.data
  }

  return {
    getAssets,
    getAsset,
    getTopStocks,
    getTopETFs,
    getTopReits,
    getTopBDRs
  }
}
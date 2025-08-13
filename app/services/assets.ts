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

  return {
    getAssets,
    getAsset
  }
}
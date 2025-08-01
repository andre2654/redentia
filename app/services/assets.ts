import type { IAsset } from "~/types/asset"

export const useAssetsService = () => {
  async function getAssets(): Promise<IAsset> {
    const resp = await $fetch('/assets.json')

    return resp.stocks as unknown as IAsset
  }

  async function getAsset(ticker: string): Promise<IAsset> {
    const resp = await $fetch('/assets.json')

    const asset = resp.stocks.find((asset: IAsset) => asset.stock === ticker)

    return asset
  }

  return {
    getAssets,
    getAsset
  }
}
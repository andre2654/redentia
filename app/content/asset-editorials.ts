/**
 * Cópias factuais do editorial de /asset/{ticker}. Um JSON por ticker.
 * A página usa este texto no lugar da resposta da API.
 */
import type { AssetEditorialCopy } from '~/utils/assetEditorial'

const modules = import.meta.glob<AssetEditorialCopy>('./asset-editorials/*.json', {
  eager: true,
  import: 'default',
})

export const ASSET_EDITORIALS: Record<string, AssetEditorialCopy> = Object.fromEntries(
  Object.entries(modules).map(([path, copy]) => {
    const ticker = path.split('/').pop()!.replace(/\.json$/, '')
    return [ticker, copy]
  }),
)

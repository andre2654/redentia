/**
 * Portfolio service — unified contract used end-to-end across
 * Backend (Laravel), chat-service, and the Frontend.
 *
 * Source of truth: `UnifiedPosition` (kept in sync with the
 * chat-service portfolio import tool + Laravel `portfolio_positions`
 * schema). Older fields like `current_value` are optional so existing
 * callers keep compiling, but the wallet UI now reads them when
 * available.
 */

/**
 * UnifiedAssetClass — wallet-domain enum used by `UnifiedPosition`.
 *
 * Distinct from `AssetClass` in `usePortfolioScore.ts` (which is a
 * narrower categorization for scoring). We keep the names different so
 * Nuxt's auto-import doesn't double-resolve.
 */
export type UnifiedAssetClass =
  | 'STOCK'
  | 'REIT'
  | 'ETF'
  | 'BDR'
  | 'TREASURY'
  | 'CRYPTO'

export interface UnifiedPosition {
  ticker: string
  name?: string
  asset_class?: UnifiedAssetClass
  quantity: number
  average_price: number
  current_price?: number
  current_value?: number
  /** Treasury maturity in YYYY-MM-DD (only for asset_class === 'TREASURY'). */
  maturity?: string
  indexer?: 'IPCA' | 'SELIC' | 'PREFIXADO'
  /** Active loan flag (B3 BTC). */
  is_loaned?: boolean
  loan_yield_pct?: number
  loan_contract_id?: string
  source?: string
  /** Optional sector hint coming from the import tool. */
  sector?: string
}

/** Legacy alias kept for callers that still import `PortfolioPosition`. */
export type PortfolioPosition = UnifiedPosition

export interface PortfolioSector {
  label: string
  actualValue: number
  actualPercent: number
  idealPercent: number
}

export interface PortfolioInsight {
  title: string
  message: string
}

export interface PortfolioComposition {
  sectors: PortfolioSector[]
  totalValue: number
  insight: PortfolioInsight | null
}

export const usePortfolioService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  async function getPositions(): Promise<{ positions: UnifiedPosition[] }> {
    return authFetch(`${baseURL}/portfolio/positions`, { method: 'GET' }) as Promise<{ positions: UnifiedPosition[] }>
  }

  async function getComposition(): Promise<PortfolioComposition> {
    return authFetch(`${baseURL}/portfolio/composition`, { method: 'GET' }) as Promise<PortfolioComposition>
  }

  /**
   * @deprecated The XLSX upload flow has moved to the chat (/help?intent=import-portfolio).
   * Kept for backwards compatibility only. New code should not call this.
   */
  async function uploadPositions(positions: { ticker: string; quantity: number; average_price: number }[]): Promise<{ message: string; imported: number }> {
    return authFetch(`${baseURL}/portfolio/upload`, {
      method: 'POST',
      body: { positions },
    }) as Promise<{ message: string; imported: number }>
  }

  return { getPositions, getComposition, uploadPositions }
}

/**
 * walletData — wallet-page data layer.
 *
 * Wraps the unified-contract endpoints for positions, composition,
 * goals and watchlist behind a single composable. Mirrors the
 * surface used by `pages/wallet.vue` and the wallet sub-components.
 *
 * Goal + Watchlist endpoints are NEW (Laravel side is being added
 * in parallel); the calls fall back to empty arrays on failure so
 * the wallet page can still render.
 */
import type { UnifiedPosition, PortfolioComposition } from '~/services/portfolio'

export interface WalletGoal {
  id: string
  title: string
  target_value: number
  current_progress: number
  horizon_years: number
  monthly_contribution_required?: number | null
  classification?: 'achieved' | 'realistic' | 'aggressive' | 'unfeasible' | string
  note?: string | null
}

export interface WalletGoalUpsert {
  id?: string
  title: string
  target_value: number
  current_progress?: number
  horizon_years?: number
  monthly_contribution_required?: number
  classification?: string
  note?: string
}

export interface WatchlistItem {
  ticker: string
  name?: string
  note?: string | null
  added_at?: string | null
  current_price?: number
  change_pct?: number
  dy_12m_pct?: number
  sector?: string
}

/**
 * Portfolio AI analysis snapshot — saved by chat-service after the
 * `analyze-portfolio` pipeline runs. Read-only on the frontend; the
 * Vue page re-fetches whenever the user navigates back from /help
 * (or on an `portfolio.analyzed` SSE event).
 */
export interface PortfolioAnalysisDimension {
  key: string
  label: string
  value: number
  note: string
}
export interface PortfolioAnalysisStrength {
  title: string
  body: string
}
export interface PortfolioAnalysisRisk {
  title: string
  body: string
  severity: 'low' | 'medium' | 'high'
}
export interface PortfolioAnalysisRecommendation {
  title: string
  body: string
}
export interface PortfolioAnalysisStressScenario {
  name: string
  change_pct: number
  note: string
}
export interface PortfolioAnalysisMacroFactor {
  label: string
  sensitivity: 'baixa' | 'média' | 'alta'
  note: string
}
export interface PortfolioAnalysisThesis {
  ticker: string
  thesis: string
  status: 'maintained' | 'at-risk' | 'weakened' | 'broken'
  metrics?: {
    pl?: number | string | null
    pvp?: number | string | null
    roe?: number | null
    var12m?: number | null
    name?: string
  } | null
}
export interface PortfolioAnalysisAlternative {
  from: string
  to: string
  reason: string
}

export interface PortfolioAnalysis {
  score: number
  score_band: 'critico' | 'atencao' | 'bom' | 'excelente'
  dimensions: PortfolioAnalysisDimension[]
  strengths: PortfolioAnalysisStrength[]
  risks: PortfolioAnalysisRisk[]
  recommendations: PortfolioAnalysisRecommendation[]
  stress_scenarios: PortfolioAnalysisStressScenario[]
  macro_factors: PortfolioAnalysisMacroFactor[]
  thesis_per_asset: PortfolioAnalysisThesis[]
  alternatives: PortfolioAnalysisAlternative[]
  summary_md?: string
  model_used?: string
  tier_used?: 'basic' | 'max'
  generated_at: string
}

export const useWalletDataService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  async function getPositions(): Promise<UnifiedPosition[]> {
    try {
      const resp = (await authFetch(`${baseURL}/portfolio/positions`, { method: 'GET' })) as {
        positions: UnifiedPosition[]
      }
      return resp.positions ?? []
    } catch {
      return []
    }
  }

  async function getComposition(): Promise<PortfolioComposition | null> {
    try {
      return (await authFetch(`${baseURL}/portfolio/composition`, {
        method: 'GET',
      })) as PortfolioComposition
    } catch {
      return null
    }
  }

  async function getGoals(): Promise<WalletGoal[]> {
    try {
      const resp = (await authFetch(`${baseURL}/goals`, { method: 'GET' })) as {
        goals: WalletGoal[]
      }
      return resp.goals ?? []
    } catch {
      return []
    }
  }

  async function upsertGoal(goal: WalletGoalUpsert): Promise<WalletGoal | null> {
    try {
      const resp = (await authFetch(`${baseURL}/goals`, {
        method: 'POST',
        body: goal,
      })) as { goal: WalletGoal }
      return resp.goal ?? null
    } catch {
      return null
    }
  }

  async function getWatchlist(): Promise<WatchlistItem[]> {
    try {
      const resp = (await authFetch(`${baseURL}/watchlist`, { method: 'GET' })) as {
        items: WatchlistItem[]
      }
      return resp.items ?? []
    } catch {
      return []
    }
  }

  async function addToWatchlist(item: { ticker: string; note?: string }): Promise<WatchlistItem | null> {
    try {
      const resp = (await authFetch(`${baseURL}/watchlist`, {
        method: 'POST',
        body: item,
      })) as { item: WatchlistItem }
      return resp.item ?? null
    } catch {
      return null
    }
  }

  async function removeFromWatchlist(ticker: string): Promise<boolean> {
    try {
      await authFetch(`${baseURL}/watchlist/${encodeURIComponent(ticker)}`, {
        method: 'DELETE',
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * Reads the latest AI-generated portfolio analysis snapshot.
   *
   * Returns `null` when the user hasn't run a raio-x yet (404 from the
   * backend) or on any other transport failure. The page handles `null`
   * by rendering the "primeiro raio-x" empty state with a CTA back to
   * the chat.
   */
  async function getPortfolioAnalysis(): Promise<PortfolioAnalysis | null> {
    try {
      const resp = (await authFetch(`${baseURL}/portfolio/analysis`, {
        method: 'GET',
      })) as PortfolioAnalysis | { analysis: PortfolioAnalysis }
      // Backend may wrap or not; tolerate both shapes.
      if (resp && typeof resp === 'object' && 'analysis' in resp && resp.analysis) {
        return resp.analysis as PortfolioAnalysis
      }
      return resp as PortfolioAnalysis
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number }; statusCode?: number })?.response?.status
        ?? (err as { statusCode?: number })?.statusCode
      if (status === 404) return null
      return null
    }
  }

  return {
    getPositions,
    getComposition,
    getGoals,
    upsertGoal,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getPortfolioAnalysis,
  }
}

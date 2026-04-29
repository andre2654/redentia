/**
 * walletData — wallet-page data layer.
 *
 * Wraps:
 *   - Laravel:     positions, composition, portfolio analysis (read-only here)
 *   - Chat-service (via /api/chat/* proxy): goals, watchlist
 *
 * Goals + watchlist live exclusively in chat-service (chat-db), where
 * the user creates them through conversation. The wallet page reads
 * them from there and adapts the shape to WalletGoal/WatchlistItem
 * so the UI doesn't need to know about the underlying source.
 */
import type { UnifiedPosition, PortfolioComposition } from '~/services/portfolio'

// ============================================================
// Chat-service shapes (raw response from /api/chat/goals + /api/chat/watchlist)
// Kept narrow to what the adapter actually consumes — chat-service
// sends a richer object but we only need a handful of fields.
// ============================================================
interface ChatGoalShape {
  id: string
  name: string
  type?: string | null
  targetAmount?: string | number | null
  currentAmount?: string | number | null
  monthlyContribution?: string | number | null
  targetDate?: string | null
  classification?: string | null
  notes?: string | null
}
interface ChatWatchShape {
  id?: string
  ticker: string
  notes?: string | null
  createdAt?: string | null
}

function toNumber(v: string | number | null | undefined, fallback = 0): number {
  if (v == null) return fallback
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : fallback
}

function adaptChatGoal(g: ChatGoalShape): WalletGoal {
  // Horizon = years between today and targetDate (rounded).
  let horizon = 0
  if (g.targetDate) {
    const d = new Date(g.targetDate + 'T12:00:00')
    if (!Number.isNaN(d.getTime())) {
      horizon = Math.max(0, Math.round((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)))
    }
  }
  return {
    id: g.id,
    title: g.name,
    target_value: toNumber(g.targetAmount),
    current_progress: toNumber(g.currentAmount),
    horizon_years: horizon,
    monthly_contribution_required: toNumber(g.monthlyContribution),
    classification: g.classification ?? 'realistic',
    note: g.notes ?? null,
  }
}

function adaptChatWatch(w: ChatWatchShape): WatchlistItem {
  return {
    ticker: w.ticker,
    note: w.notes ?? null,
    added_at: w.createdAt ?? null,
  }
}

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
    // Goals live in chat-service (chat-db), where the user creates
    // them via the chat. Hit that endpoint via the /api/chat/* proxy
    // and adapt the chat-service shape to WalletGoal.
    try {
      const cfg = useRuntimeConfig()
      const direct = (cfg.public as { chatDirectUrl?: string }).chatDirectUrl
      const chatBase = direct && import.meta.client ? direct : '/api/chat'
      const authStore = useAuthStore()
      const r = await fetch(`${chatBase}/goals`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
        },
      })
      if (!r.ok) return []
      const data = (await r.json()) as { goals?: ChatGoalShape[] }
      const list = Array.isArray(data?.goals) ? data.goals : []
      return list.map(adaptChatGoal)
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
    // Same pattern as goals: watchlist lives in chat-service.
    try {
      const cfg = useRuntimeConfig()
      const direct = (cfg.public as { chatDirectUrl?: string }).chatDirectUrl
      const chatBase = direct && import.meta.client ? direct : '/api/chat'
      const authStore = useAuthStore()
      const r = await fetch(`${chatBase}/watchlist`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
        },
      })
      if (!r.ok) return []
      const data = (await r.json()) as { watches?: ChatWatchShape[] }
      const list = Array.isArray(data?.watches) ? data.watches : []
      return list.map(adaptChatWatch)
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

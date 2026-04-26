/**
 * useDecisions — fetch + mutation helpers for the decision journal.
 * Mirrors the shape of `useGoals` so component authors don't have to
 * learn two patterns. Cached at module level.
 */
import { computed, ref, type Ref } from 'vue'

export type DecisionType = 'buy' | 'sell' | 'rebalance' | 'hold' | 'allocate'
export type DecisionStatus =
  | 'pending'
  | 'accepted'
  | 'executed'
  | 'cancelled'
  | 'reviewed'
  | 'expired'
export type DecisionOutcome = 'confirmed' | 'wrong' | 'partial' | 'open'

export interface ChatDecision {
  id: string
  userId: number
  sessionId: string | null
  sourceMessageId: string | null
  goalId: string | null
  tenantSlug: string
  type: DecisionType
  ticker: string | null
  targetAmount: string | null
  targetQty: string | null
  targetPrice: string | null
  triggerCondition: string | null
  thesis: string
  invalidator: string | null
  status: DecisionStatus
  viaCopilot: boolean
  overrideWarnings: string[] | null
  executionDate: string | null
  scheduledReviews: string[] | null
  reviews: Array<{ at: string; ai_summary: string; comparison?: Record<string, unknown> }>
  outcome: DecisionOutcome | null
  outcomeDecidedAt: string | null
  outcomeNotes: string | null
  snapshotPriceAtCreate: string | null
  snapshotMacro: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

const _decisions = ref<ChatDecision[]>([])
const _loading = ref(false)
const _loaded = ref(false)
const _error = ref<string | null>(null)
const _hitRate = ref<{ hits: number; total: number; rate: number | null }>({
  hits: 0,
  total: 0,
  rate: null,
})

function chatBase(): string {
  const cfg = useRuntimeConfig()
  const direct = (cfg.public as { chatDirectUrl?: string }).chatDirectUrl
  return direct && import.meta.client ? direct : '/api/chat'
}

function authHeaders(): Record<string, string> {
  const authStore = useAuthStore()
  return authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
}

async function fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`${chatBase()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init.headers ?? {}),
    },
    credentials: 'include',
  })
  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(`${r.status}: ${text.slice(0, 200)}`)
  }
  return (await r.json()) as T
}

export function useDecisions() {
  async function refresh(): Promise<void> {
    if (_loading.value) return
    _loading.value = true
    _error.value = null
    try {
      const [list, hit] = await Promise.all([
        fetchJson<{ decisions: ChatDecision[] }>('/decisions'),
        fetchJson<{ hits: number; total: number; rate: number | null }>(
          '/decisions/hit-rate',
        ),
      ])
      _decisions.value = list.decisions
      _hitRate.value = hit
      _loaded.value = true
    } catch (err) {
      _error.value = String(err)
    } finally {
      _loading.value = false
    }
  }

  async function setStatus(
    id: string,
    status: 'accepted' | 'executed' | 'cancelled' | 'expired',
    executionDate?: string,
  ): Promise<ChatDecision> {
    const r = await fetchJson<{ decision: ChatDecision }>(`/decisions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, executionDate }),
    })
    _decisions.value = _decisions.value.map((d) => (d.id === id ? r.decision : d))
    return r.decision
  }

  async function setOutcome(
    id: string,
    outcome: DecisionOutcome,
    notes?: string,
  ): Promise<ChatDecision> {
    const r = await fetchJson<{ decision: ChatDecision }>(`/decisions/${id}/outcome`, {
      method: 'PATCH',
      body: JSON.stringify({ outcome, notes }),
    })
    _decisions.value = _decisions.value.map((d) => (d.id === id ? r.decision : d))
    void refresh() // refresh hit-rate
    return r.decision
  }

  function applyServerEvent(): void {
    void refresh()
  }

  return {
    decisions: _decisions as Ref<ChatDecision[]>,
    loading: _loading,
    loaded: _loaded,
    error: _error,
    hitRate: _hitRate,
    pending: computed(() =>
      _decisions.value.filter(
        (d) => d.status === 'pending' || d.status === 'accepted',
      ),
    ),
    awaitingReview: computed(() =>
      _decisions.value.filter(
        (d) =>
          d.status === 'accepted' &&
          d.reviews.length > 0 &&
          d.outcome == null,
      ),
    ),
    refresh,
    setStatus,
    setOutcome,
    applyServerEvent,
    findById: (id: string | null | undefined) =>
      id ? _decisions.value.find((d) => d.id === id) ?? null : null,
  }
}

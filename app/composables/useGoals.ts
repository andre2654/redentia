/**
 * useGoals — fetch + mutation helpers for the goal-anchored sessions
 * feature. Hits `/api/chat/goals` (or the direct chat-service URL when
 * `NUXT_PUBLIC_CHAT_DIRECT_URL` is set).
 *
 * Cached at the module level so the sidebar and the active-conversation
 * goal-badge share state without refetching. The cache is small (one
 * user's goals, ≤ tens of rows) and short-lived (component lifecycle),
 * so we don't bother with proper SWR.
 */
import { computed, ref, type Ref } from 'vue'

export type GoalStatus = 'on_track' | 'at_risk' | 'unfeasible' | 'hit' | 'archived'
export type GoalType =
  | 'retirement'
  | 'fire'
  | 'reserve'
  | 'purchase'
  | 'income'
  | 'custom'

export interface ChatGoal {
  id: string
  userId: number
  tenantSlug: string
  name: string
  emoji: string | null
  type: GoalType | null
  targetAmount: string // numeric → string
  targetDate: string // YYYY-MM-DD
  currentAmount: string
  monthlyContribution: string | null
  expectedCagr: string | null
  requiredCagr: string | null
  projectedAmount: string | null
  status: GoalStatus | null
  statusExplanation: string | null
  achievedAt: string | null
  archivedAt: string | null
  notes: string | null
  lastCalculatedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface GoalCreateInput {
  name: string
  emoji?: string | null
  type?: GoalType | null
  targetAmount: number
  targetDate: string
  currentAmount: number
  monthlyContribution: number
  notes?: string | null
}

const _goals = ref<ChatGoal[]>([])
const _loading = ref(false)
const _loaded = ref(false)
const _error = ref<string | null>(null)

function chatBase(): string {
  const cfg = useRuntimeConfig()
  const direct = (cfg.public as { chatDirectUrl?: string }).chatDirectUrl
  return direct && import.meta.client ? direct : '/api/chat'
}

function authHeaders(): Record<string, string> {
  const authStore = useAuthStore()
  return authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
}

async function fetchJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
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

export function useGoals() {
  async function refresh(): Promise<void> {
    if (_loading.value) return
    _loading.value = true
    _error.value = null
    try {
      const r = await fetchJson<{ goals: ChatGoal[] }>('/goals')
      _goals.value = r.goals
      _loaded.value = true
    } catch (err) {
      _error.value = String(err)
    } finally {
      _loading.value = false
    }
  }

  async function create(input: GoalCreateInput): Promise<ChatGoal> {
    const r = await fetchJson<{ goal: ChatGoal }>('/goals', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    _goals.value = [r.goal, ..._goals.value.filter((g) => g.id !== r.goal.id)]
    return r.goal
  }

  async function update(id: string, patch: Partial<GoalCreateInput>): Promise<ChatGoal> {
    const r = await fetchJson<{ goal: ChatGoal }>(`/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    _goals.value = _goals.value.map((g) => (g.id === id ? r.goal : g))
    return r.goal
  }

  async function archive(id: string): Promise<void> {
    await fetchJson<{ ok: true }>(`/goals/${id}`, { method: 'DELETE' })
    _goals.value = _goals.value.filter((g) => g.id !== id)
  }

  async function recalculate(id: string): Promise<ChatGoal> {
    const r = await fetchJson<{ goal: ChatGoal }>(`/goals/${id}/recalc`, { method: 'POST' })
    _goals.value = _goals.value.map((g) => (g.id === id ? r.goal : g))
    return r.goal
  }

  async function linkSession(goalId: string, sessionId: string): Promise<void> {
    await fetchJson<{ ok: true }>(`/goals/${goalId}/link/${sessionId}`, { method: 'POST' })
  }

  async function unlinkSession(goalId: string, sessionId: string): Promise<void> {
    await fetchJson<{ ok: true }>(`/goals/${goalId}/link/${sessionId}`, { method: 'DELETE' })
  }

  /** Locally-applied event handler — used by useChatStream to merge a
   *  `goal.update` SSE event into the cache without a refetch. */
  function applyServerEvent(payload: { goalId: string }): void {
    void refresh() // simple — just re-fetch
  }

  return {
    goals: _goals as Ref<ChatGoal[]>,
    loading: _loading,
    loaded: _loaded,
    error: _error,
    activeGoals: computed(() => _goals.value.filter((g) => !g.archivedAt)),
    refresh,
    create,
    update,
    archive,
    recalculate,
    linkSession,
    unlinkSession,
    applyServerEvent,
    findById: (id: string | null | undefined) =>
      id ? _goals.value.find((g) => g.id === id) ?? null : null,
  }
}

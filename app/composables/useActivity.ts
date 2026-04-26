/**
 * useActivity — recent events feed for the audit drawer.
 *
 * Backed by GET /api/chat/activity which merges tool calls, decision
 * changes, alerts, memory writes, goal updates and session starts
 * into one timestamp-sorted list. Capped at 100 rows server-side.
 */
import { ref, type Ref } from 'vue'

export type ActivityKind =
  | 'tool_call'
  | 'decision_created'
  | 'decision_updated'
  | 'goal_updated'
  | 'alert_fired'
  | 'memory_saved'
  | 'session_started'

export interface ActivityEvent {
  id: string
  at: string
  kind: ActivityKind
  summary: string
  detail?: string
  sessionId?: string | null
  ticker?: string | null
}

const _events = ref<ActivityEvent[]>([])
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

async function fetchJson<T>(path: string): Promise<T> {
  const r = await fetch(`${chatBase()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    credentials: 'include',
  })
  if (!r.ok) throw new Error(`${r.status}`)
  return (await r.json()) as T
}

export function useActivity() {
  async function refresh(): Promise<void> {
    if (_loading.value) return
    _loading.value = true
    _error.value = null
    try {
      const r = await fetchJson<{ events: ActivityEvent[] }>('/activity')
      _events.value = r.events ?? []
      _loaded.value = true
    } catch (err) {
      _error.value = String(err)
    } finally {
      _loading.value = false
    }
  }

  return {
    events: _events as Ref<ActivityEvent[]>,
    loading: _loading,
    loaded: _loaded,
    error: _error,
    refresh,
  }
}

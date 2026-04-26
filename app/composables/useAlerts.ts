/**
 * useAlerts — fired alerts (watchlist cron + agent inline). Reads
 * from `/api/chat/alerts`; supports mark-read, dismiss, dismiss-all.
 *
 * Cached at module level so the bell badge in the sidebar shares
 * state with any inline AlertCard components on the active session.
 *
 * SSE wiring: when useChatStream receives an `alert.fired` event,
 * it calls `prepend()` here so the alert shows up in the inbox
 * without a refetch. The badge counter follows along through
 * `unreadCount` (computed).
 */
import { computed, ref, type Ref } from 'vue'

export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertSource = 'watchlist' | 'agent' | 'system'

export interface ChatAlert {
  id: string
  source: AlertSource
  kind: string
  severity: AlertSeverity
  ticker: string | null
  title: string
  body: string
  data: Record<string, unknown>
  sessionId: string | null
  decisionId: string | null
  readAt: string | null
  createdAt: string
}

const _alerts = ref<ChatAlert[]>([])
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

export function useAlerts() {
  async function refresh(): Promise<void> {
    if (_loading.value) return
    _loading.value = true
    _error.value = null
    try {
      const r = await fetchJson<{ alerts: ChatAlert[] }>('/alerts')
      _alerts.value = r.alerts ?? []
      _loaded.value = true
    } catch (err) {
      _error.value = String(err)
    } finally {
      _loading.value = false
    }
  }

  async function markRead(id: string): Promise<void> {
    const target = _alerts.value.find((a) => a.id === id)
    if (target && !target.readAt) target.readAt = new Date().toISOString()
    try {
      await fetchJson<{ ok: true }>(`/alerts/${id}/read`, { method: 'PATCH' })
    } catch {
      void refresh()
    }
  }

  async function dismiss(id: string): Promise<void> {
    _alerts.value = _alerts.value.filter((a) => a.id !== id)
    try {
      await fetchJson<{ ok: true }>(`/alerts/${id}/dismiss`, { method: 'PATCH' })
    } catch {
      void refresh()
    }
  }

  async function dismissAll(): Promise<void> {
    _alerts.value = []
    try {
      await fetchJson<{ ok: true }>('/alerts/dismiss-all', { method: 'POST' })
    } catch {
      void refresh()
    }
  }

  /** Used by useChatStream when an SSE `alert.fired` arrives. */
  function prepend(alert: ChatAlert): void {
    _alerts.value = [alert, ..._alerts.value.filter((a) => a.id !== alert.id)]
  }

  return {
    alerts: _alerts as Ref<ChatAlert[]>,
    loading: _loading,
    loaded: _loaded,
    error: _error,
    unreadCount: computed(
      () => _alerts.value.filter((a) => a.readAt == null).length,
    ),
    refresh,
    markRead,
    dismiss,
    dismissAll,
    prepend,
  }
}

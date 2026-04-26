/**
 * useWatchlist — proactive monitoring (chat-side) with alert
 * conditions. Distinct from the legacy Laravel watchlist (the simple
 * ticker list); this one carries condition arrays and feeds the
 * chat-service cron sweep.
 *
 * Hits `/api/chat/watchlist` (or the direct chat-service URL when
 * `NUXT_PUBLIC_CHAT_DIRECT_URL` is set).
 *
 * Cached at module level. Use `refresh()` after mount to pull fresh
 * server state; `applyServerEvent()` lets useChatStream merge an
 * `alert.fired` SSE without a full refetch.
 */
import { ref, type Ref } from 'vue'

export type WatchConditionKind =
  | 'price_drop_pct'
  | 'price_rise_pct'
  | 'price_below'
  | 'price_above'
  | 'dy_above'
  | 'pe_below'
  | 'news_material'

export interface WatchCondition {
  kind: WatchConditionKind
  pct?: number
  value?: number
  window?: '1d' | '7d' | '30d'
  severity?: 'low' | 'medium' | 'high'
}

export interface ChatWatch {
  id: string
  ticker: string
  label: string | null
  note: string | null
  conditions: WatchCondition[]
  snapshotPrice: number | null
  createdAt: string
}

const _watches = ref<ChatWatch[]>([])
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

export function useWatchlist() {
  async function refresh(): Promise<void> {
    if (_loading.value) return
    _loading.value = true
    _error.value = null
    try {
      const r = await fetchJson<{ watches: ChatWatch[] }>('/watchlist')
      _watches.value = r.watches ?? []
      _loaded.value = true
    } catch (err) {
      _error.value = String(err)
    } finally {
      _loading.value = false
    }
  }

  async function upsert(input: {
    ticker: string
    label?: string | null
    note?: string | null
    conditions?: WatchCondition[]
  }): Promise<ChatWatch> {
    const r = await fetchJson<{ watch: ChatWatch }>('/watchlist', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    _watches.value = [
      r.watch,
      ..._watches.value.filter((w) => w.id !== r.watch.id),
    ]
    return r.watch
  }

  async function remove(id: string): Promise<void> {
    await fetchJson<{ ok: true }>(`/watchlist/${id}`, { method: 'DELETE' })
    _watches.value = _watches.value.filter((w) => w.id !== id)
  }

  function applyServerEvent(): void {
    void refresh()
  }

  return {
    watches: _watches as Ref<ChatWatch[]>,
    loading: _loading,
    loaded: _loaded,
    error: _error,
    refresh,
    upsert,
    remove,
    applyServerEvent,
  }
}

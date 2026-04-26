/**
 * useMemories — read-only audit view of the cross-session memory the
 * agent has accumulated about the user (`save_memory` tool calls and
 * deterministic auto-saves).
 *
 * Backed by GET /api/chat/memories (returns up to 200 most-recent
 * non-expired rows). Module-level cache so the Painel drawer can
 * open without a refetch when the user just toggled tabs.
 */
import { computed, ref, type Ref } from 'vue'

export interface ChatMemoryRow {
  id: string
  kind: string
  key: string
  value: unknown
  confidence: number
  sourceSessionId: string | null
  sourceMessageId: string | null
  createdAt: string
  updatedAt: string
  expiresAt: string | null
}

const _memories = ref<ChatMemoryRow[]>([])
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

export function useMemories() {
  async function refresh(): Promise<void> {
    if (_loading.value) return
    _loading.value = true
    _error.value = null
    try {
      const r = await fetchJson<{ memories: ChatMemoryRow[] }>('/memories')
      _memories.value = r.memories ?? []
      _loaded.value = true
    } catch (err) {
      _error.value = String(err)
    } finally {
      _loading.value = false
    }
  }

  async function remove(id: string): Promise<void> {
    // Optimistic — the row vanishes from the list immediately so the
    // audit drawer feels responsive. If the upstream call fails we
    // refetch to put it back.
    const previous = _memories.value
    _memories.value = previous.filter((m) => m.id !== id)
    try {
      await fetchJson<{ ok: boolean }>(`/memories/${id}`, { method: 'DELETE' })
    } catch {
      _memories.value = previous
      throw new Error('Falha ao remover memória.')
    }
  }

  async function clearAll(): Promise<void> {
    const previous = _memories.value
    _memories.value = []
    try {
      await fetchJson<{ ok: boolean }>('/memories', { method: 'DELETE' })
    } catch {
      _memories.value = previous
      throw new Error('Falha ao limpar memórias.')
    }
  }

  /** Group by `kind` so the audit UI can render sections. */
  const byKind = computed(() => {
    const out = new Map<string, ChatMemoryRow[]>()
    for (const m of _memories.value) {
      const list = out.get(m.kind) ?? []
      list.push(m)
      out.set(m.kind, list)
    }
    return out
  })

  return {
    memories: _memories as Ref<ChatMemoryRow[]>,
    loading: _loading,
    loaded: _loaded,
    error: _error,
    byKind,
    refresh,
    remove,
    clearAll,
  }
}

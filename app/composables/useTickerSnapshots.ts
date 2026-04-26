/**
 * useTickerSnapshots — live-quote registry for chat-side ticker chips.
 *
 * Multiple `<TickerChip>` instances on screen all subscribe through
 * this composable; the composable batches their tickers into a single
 * `/tickers/snapshot?symbols=...` call every refresh interval (60s)
 * and exposes a reactive snapshot map. So 10 chips = 1 upstream call,
 * not 10.
 *
 * Subscribe lifecycle:
 *   - `subscribe(ticker)` adds the symbol to the active set + bumps
 *     a refcount; if it's the first subscriber for that symbol, the
 *     composable kicks off an immediate fetch of just that one.
 *   - `unsubscribe(ticker)` decrements; when refcount hits 0 the
 *     symbol is dropped from the active set (its last snapshot stays
 *     in the map until evicted by a later refresh).
 *   - The auto-refresh interval is a single setInterval started on
 *     first subscribe and torn down when no chips remain.
 *
 * Stays SSR-safe — module-level refs initialise empty; the interval
 * + initial fetch only fire on the client.
 */
import { computed, ref, type Ref } from 'vue'

export interface TickerSnapshot {
  ticker: string
  price: number | null
  changePct1d: number | null
  name: string | null
  logo: string | null
  asOf: string | null
}

const REFRESH_INTERVAL_MS = 60_000

const _snapshots = ref<Map<string, TickerSnapshot | null>>(new Map())
const _loading = ref(false)
const _refCount = new Map<string, number>()
let _refreshTimer: ReturnType<typeof setInterval> | null = null

function chatBase(): string {
  const cfg = useRuntimeConfig()
  const direct = (cfg.public as { chatDirectUrl?: string }).chatDirectUrl
  return direct && import.meta.client ? direct : '/api/chat'
}

function authHeaders(): Record<string, string> {
  const authStore = useAuthStore()
  return authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
}

async function fetchBatch(symbols: string[]): Promise<void> {
  if (!import.meta.client) return
  if (symbols.length === 0) return
  _loading.value = true
  try {
    const url = `${chatBase()}/tickers/snapshot?symbols=${encodeURIComponent(symbols.join(','))}`
    const r = await fetch(url, {
      headers: authHeaders(),
      credentials: 'include',
    })
    if (!r.ok) return
    const json = (await r.json()) as { snapshots: Record<string, TickerSnapshot | null> }
    const next = new Map(_snapshots.value)
    for (const [ticker, snap] of Object.entries(json.snapshots ?? {})) {
      next.set(ticker, snap)
    }
    _snapshots.value = next
  } catch {
    /* tolerate — chip will fall back to its priceWhenMentioned */
  } finally {
    _loading.value = false
  }
}

function activeSymbols(): string[] {
  return [..._refCount.keys()].filter((t) => (_refCount.get(t) ?? 0) > 0)
}

function ensureTimer(): void {
  if (_refreshTimer || !import.meta.client) return
  _refreshTimer = setInterval(() => {
    void fetchBatch(activeSymbols())
  }, REFRESH_INTERVAL_MS)
}

function maybeStopTimer(): void {
  if (_refCount.size > 0 && [..._refCount.values()].some((n) => n > 0)) return
  if (_refreshTimer) {
    clearInterval(_refreshTimer)
    _refreshTimer = null
  }
}

export function useTickerSnapshots() {
  function subscribe(rawTicker: string | null | undefined): void {
    if (!rawTicker) return
    const ticker = rawTicker.toUpperCase()
    const next = (_refCount.get(ticker) ?? 0) + 1
    _refCount.set(ticker, next)
    if (next === 1) {
      // first subscriber for this symbol — kick off an immediate
      // fetch so the chip doesn't sit empty for up to a minute
      void fetchBatch([ticker])
      ensureTimer()
    }
  }

  function unsubscribe(rawTicker: string | null | undefined): void {
    if (!rawTicker) return
    const ticker = rawTicker.toUpperCase()
    const current = _refCount.get(ticker) ?? 0
    if (current <= 1) _refCount.delete(ticker)
    else _refCount.set(ticker, current - 1)
    maybeStopTimer()
  }

  function get(rawTicker: string | null | undefined): TickerSnapshot | null {
    if (!rawTicker) return null
    return _snapshots.value.get(rawTicker.toUpperCase()) ?? null
  }

  function reactiveOf(rawTicker: string | null | undefined): Ref<TickerSnapshot | null> {
    return computed(() => get(rawTicker)) as unknown as Ref<TickerSnapshot | null>
  }

  return {
    snapshots: _snapshots,
    loading: _loading,
    subscribe,
    unsubscribe,
    get,
    reactiveOf,
  }
}

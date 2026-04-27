/**
 * useFailedLogos — global registry of logo URLs that have failed to load.
 *
 * Why this exists:
 * Tickers like AUPO11 (newer ETFs) don't have logos on every CDN we
 * historically pointed at. When an `<img>` 404s, we want EVERY component
 * across the app to remember that URL is broken — so we don't:
 *   - retry the same broken URL when the same ticker shows in another chip
 *   - flash the alt text / broken-image icon mid-render
 *   - hammer the same broken URL across every page load
 *
 * Implementation:
 *   - Module-level `Set<string>` keeps the registry hot during navigation
 *   - Hydrated from `sessionStorage` once on first access (client only)
 *   - Persisted back on each `markFailed` so SPA navigations preserve it
 *   - Reactive via Vue's `reactive()` so v-if'd renders react to mutations
 *
 * Usage in any logo-rendering component:
 *
 *   const { isFailed, markFailed } = useFailedLogos()
 *   <img v-if="logo && !isFailed(logo)" :src="logo" @error="markFailed(logo)" />
 *   <span v-else>{{ initials }}</span>
 */
import { reactive } from 'vue'

const STORAGE_KEY = 'redentia-failed-logos'

// Reactive Set — using `reactive({ urls: Set<string> })` because Vue's
// reactivity tracks Set ops via the proxy, but we expose getters that
// read from `state.urls` so v-if computeds re-run when items are added.
const state = reactive({ urls: new Set<string>() })

let hydrated = false
function ensureHydrated(): void {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const list = JSON.parse(raw) as unknown
      if (Array.isArray(list)) {
        for (const u of list) if (typeof u === 'string') state.urls.add(u)
      }
    }
  } catch {
    /* corrupted storage — ignore, start fresh */
  }
}

function persist(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...state.urls]))
  } catch {
    /* quota exceeded or disabled — silent */
  }
}

export function useFailedLogos() {
  ensureHydrated()
  return {
    /** True when the URL has failed to load earlier this session. */
    isFailed: (url: string | null | undefined): boolean => {
      if (!url) return false
      return state.urls.has(url)
    },
    /** Record a URL as broken. Idempotent. Persists to sessionStorage. */
    markFailed: (url: string | null | undefined): void => {
      if (!url) return
      if (state.urls.has(url)) return
      state.urls.add(url)
      persist()
    },
    /** Wipe the registry — useful after the user uploads/changes logos. */
    clear: (): void => {
      state.urls.clear()
      persist()
    },
  }
}

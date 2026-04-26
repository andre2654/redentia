/**
 * useTickerProse — auto-detect Brazilian-market tickers in rendered
 * markdown and replace them with live `<TickerChip>` Vue instances.
 *
 * How it works
 * ============
 *
 * 1. We register a marked inline-level extension at module load that
 *    matches `\b[A-Z]{4}\d{1,2}\b` (PETR4, VALE3, KNRI11, IVVB11,
 *    AAPL34, …) and renders a placeholder `<span class="ticker-mount"
 *    data-ticker="PETR4">PETR4</span>`. We do this once per process.
 *
 * 2. After Message.vue renders the markdown HTML through
 *    DOMPurify + `v-html`, we pass the wrapper element to
 *    `mountTickersIn(el)`. It walks `.ticker-mount` placeholders,
 *    creates `TickerChip` VNodes wired to the parent component's
 *    `appContext` (so Pinia/auth/runtime config all carry over), and
 *    mounts them inside the placeholder via Vue's `render(vnode, el)`.
 *
 * 3. The function is idempotent — re-mounting the same placeholder
 *    is a no-op (we tag it with `data-mounted="1"`). On unmount of
 *    the host component, `cleanup()` walks every placeholder we ever
 *    touched and unmounts the chip via `render(null, el)`.
 *
 * Edge cases handled
 * ------------------
 * - Tickers inside an `<a>` inherit `clickable=false` so we don't
 *   create nested anchors. The chip becomes a passive label.
 * - Tickers inside `<code>` or `<pre>` are skipped — the marked
 *   extension only fires inside ordinary inline text, but the
 *   post-mount walker also checks `.closest('code,pre')` defensively.
 * - SSR-safe: the marked extension is registered server-side too
 *   (so the rendered HTML is identical on server/client and Vue's
 *   hydration matches), but the actual mount only happens on client
 *   via the host's `onMounted` watcher.
 */
import { type ComponentInternalInstance, createVNode, render, getCurrentInstance } from 'vue'
import { marked } from 'marked'
import TickerChip from '~/components/molecules/chat-v2/TickerChip.vue'

// ---- Marked extension --------------------------------------------

const TICKER_RE = /\b([A-Z]{4}\d{1,2})\b/
const TICKER_RE_AT_START = /^([A-Z]{4}\d{1,2})\b/

interface TickerToken {
  type: 'ticker'
  raw: string
  ticker: string
}

let markedConfigured = false
function ensureMarkedConfigured(): void {
  if (markedConfigured) return
  markedConfigured = true
  marked.use({
    extensions: [
      {
        name: 'ticker',
        level: 'inline',
        start(src: string): number | undefined {
          const m = TICKER_RE.exec(src)
          return m ? m.index : undefined
        },
        tokenizer(src: string): TickerToken | undefined {
          const match = TICKER_RE_AT_START.exec(src)
          if (!match) return undefined
          return {
            type: 'ticker',
            raw: match[0],
            ticker: match[1]!,
          }
        },
        renderer(token: TickerToken): string {
          // Placeholder span — class is the mount hook, data-ticker
          // carries the symbol, the inner text is the fallback that
          // shows during SSR / before DOMPurify finishes / before
          // the post-mount step has run.
          const t = escapeAttribute(token.ticker)
          return `<span class="ticker-mount" data-ticker="${t}">${t}</span>`
        },
      },
    ],
  })
}

function escapeAttribute(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

// Public — called from Message.vue's setup so the regex is registered
// before the first markdown render.
export function ensureTickerProseSetup(): void {
  ensureMarkedConfigured()
}

// ---- Mount logic --------------------------------------------------

export function useTickerProse() {
  const instance = getCurrentInstance() as ComponentInternalInstance | null
  /**
   * Track every placeholder span we've ever mounted into so we can
   * unmount cleanly on host unmount. Using WeakSet would let GC
   * collect them, but we want to call `render(null, el)` to free the
   * chip's resources (subscription refs, intervals) — so we hold
   * strong refs.
   */
  const mountedSpans = new Set<HTMLElement>()

  function mountIn(root: HTMLElement | null | undefined): void {
    if (!root || !instance) return
    if (typeof window === 'undefined') return // SSR no-op
    const placeholders = root.querySelectorAll<HTMLElement>('.ticker-mount[data-ticker]')
    placeholders.forEach((span) => {
      // Already mounted — leave it alone (chip subscribes to live
      // data and refreshes itself; re-mounting would reset state).
      if (span.dataset.mounted === '1') return
      // Skip if inside a code block (defence in depth — marked
      // extensions don't fire inside code, but DOMPurify or some
      // future markdown source may produce one).
      if (span.closest('code, pre')) return
      const ticker = span.dataset.ticker
      if (!ticker) return
      // Inside a link: render the chip as a passive label (no
      // nested anchor). Outside: regular clickable chip.
      const inLink = !!span.closest('a')
      const vnode = createVNode(TickerChip, {
        ticker,
        // Prose chips now use the full pill (logo + ticker + price + delta).
        // The compact density is reserved for tight sidebar rows where a
        // 16px logo + truncated info is the right trade-off; in flowing
        // text the recognizable brand mark + price help the eye anchor
        // on the asset.
        density: 'default',
        clickable: !inLink,
      })
      vnode.appContext = instance.appContext
      // Clear the placeholder text — Vue mounts the chip's root as
      // the only child of the span. We keep the outer span (it's
      // unstyled so visually it's a no-op) so we have a stable
      // mount point for unmount.
      span.textContent = ''
      render(vnode, span)
      span.dataset.mounted = '1'
      mountedSpans.add(span)
    })
  }

  function cleanup(): void {
    if (typeof window === 'undefined') return
    mountedSpans.forEach((span) => {
      render(null, span)
      span.removeAttribute('data-mounted')
    })
    mountedSpans.clear()
  }

  return { mountIn, cleanup }
}

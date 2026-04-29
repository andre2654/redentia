/**
 * useChartProse — auto-detect `{{chart:TICKER:PERIOD}}` markers in
 * rendered chat markdown and replace them with live `<InlineChart>`
 * Vue instances.
 *
 * Same pattern as useTickerProse:
 *   1. Module-level `marked` inline extension turns the marker into a
 *      `<span class="chart-mount" data-ticker="..." data-period="...">…</span>`
 *      placeholder. SSR-stable so hydration matches.
 *   2. After Message.vue renders the markdown HTML, `mountIn(root)` walks
 *      the placeholders and mounts a `<InlineChart>` into each one,
 *      passing the parent's `appContext` so Pinia/runtime config carry
 *      over.
 *   3. Idempotent — re-mounting the same placeholder is a no-op (we
 *      tag it with `data-mounted="1"`). On unmount, `cleanup()` walks
 *      every placeholder we ever touched and frees the chart.
 *
 * Marker grammar
 * --------------
 *   {{chart:IBOV:1mo}}
 *   {{chart:PETR4:3mo}}
 *   {{chart:VALE3:1y}}
 *   {{chart:BTC:6mo}}
 *
 * Where:
 *   - `TICKER` is any uppercase symbol (B3 ticker, IBOV/IFIX index,
 *     crypto symbol). The component decides the right data source
 *     based on the symbol.
 *   - `PERIOD` is one of: 1mo | ytd | 3mo | 6mo | 12mo | 1y | 3y | 5y | full
 *     (1y and 12mo are aliases; 6mo falls back to 3mo on the API).
 */
import { type ComponentInternalInstance, createVNode, render, getCurrentInstance } from 'vue'
import { marked } from 'marked'
import InlineChart from '~/components/molecules/chat-v2/InlineChart.vue'

// ---- Marked extension --------------------------------------------

// Match `{{chart:SYMBOL:PERIOD}}`. Symbol = 2-12 uppercase letters/digits
// (covers BTC, IBOV, IFIX, PETR4, KNRI11, AAPL34, etc). Period = 1-5
// chars of letters and digits (1mo, 12mo, ytd, 1y, 5y, full).
const CHART_RE = /\{\{chart:([A-Z][A-Z0-9]{1,11}):([a-z0-9]{1,5})\}\}/
const CHART_RE_AT_START = /^\{\{chart:([A-Z][A-Z0-9]{1,11}):([a-z0-9]{1,5})\}\}/

interface ChartToken {
  type: 'chart'
  raw: string
  ticker: string
  period: string
}

let markedConfigured = false
function ensureMarkedConfigured(): void {
  if (markedConfigured) return
  markedConfigured = true
  marked.use({
    extensions: [
      {
        name: 'chart',
        level: 'inline',
        start(src: string): number | undefined {
          const m = CHART_RE.exec(src)
          return m ? m.index : undefined
        },
        tokenizer(src: string): ChartToken | undefined {
          const match = CHART_RE_AT_START.exec(src)
          if (!match) return undefined
          return {
            type: 'chart',
            raw: match[0],
            ticker: match[1]!,
            period: match[2]!,
          }
        },
        renderer(token: ChartToken): string {
          const t = escapeAttribute(token.ticker)
          const p = escapeAttribute(token.period)
          // Block-level inside an inline extension: we wrap with a span
          // that visually expands via CSS (display: block) so the chart
          // takes a full row even when the marker is mid-paragraph.
          // The fallback text is shown during SSR / before the post-mount
          // step has run, then swapped for the live chart.
          return `<span class="chart-mount" data-ticker="${t}" data-period="${p}">${t} (${p})</span>`
        },
      },
    ],
  })
}

function escapeAttribute(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function ensureChartProseSetup(): void {
  ensureMarkedConfigured()
}

// ---- Mount logic --------------------------------------------------

export function useChartProse() {
  const instance = getCurrentInstance() as ComponentInternalInstance | null
  const mountedSpans = new Set<HTMLElement>()

  function mountIn(root: HTMLElement | null | undefined): void {
    if (!root || !instance) return
    if (typeof window === 'undefined') return
    const placeholders = root.querySelectorAll<HTMLElement>('.chart-mount[data-ticker][data-period]')
    placeholders.forEach((span) => {
      if (span.dataset.mounted === '1') return
      if (span.closest('code, pre')) return
      const ticker = span.dataset.ticker
      const period = span.dataset.period
      if (!ticker || !period) return
      const vnode = createVNode(InlineChart, { ticker, period })
      vnode.appContext = instance.appContext
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

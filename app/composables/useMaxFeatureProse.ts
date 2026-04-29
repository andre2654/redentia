/**
 * useMaxFeatureProse — auto-detect `{{max:LABEL}}` markers in chat
 * markdown and replace them with `<MaxFeatureChip>` instances.
 *
 * Same pattern as useTickerProse / useChartProse:
 *   1. Module-level marked inline extension turns the marker into a
 *      `<span class="max-feature-mount" data-label="...">…</span>`
 *      placeholder. SSR-stable.
 *   2. `mountIn(root)` walks placeholders post-render and mounts a
 *      `<MaxFeatureChip>` into each.
 *   3. Idempotent — already-mounted spans are skipped.
 *
 * Marker grammar
 * --------------
 *   {{max:Gráfico}}
 *   {{max:Watchlist}}
 *   {{max:Análise completa}}
 *   {{max:Cenário simulado}}
 *   {{max}}            ← no label, generic "FEATURE MAX" pill
 *
 * The label is free-form text (1-40 chars, no `}` or newlines). It's
 * the user-facing description of what's locked behind MAX. Used both
 * as the visible chip label and the click-tooltip.
 */
import { type ComponentInternalInstance, createVNode, render, getCurrentInstance } from 'vue'
import { marked } from 'marked'
import MaxFeatureChip from '~/components/molecules/chat-v2/MaxFeatureChip.vue'

// `{{max}}` or `{{max:LABEL}}`. Label can include any chars except `}`
// or newline. Capped at 40 chars to keep chips inline-friendly.
const MAX_RE = /\{\{max(?::([^}\n]{1,40}))?\}\}/
const MAX_RE_AT_START = /^\{\{max(?::([^}\n]{1,40}))?\}\}/

interface MaxToken {
  type: 'max-feature'
  raw: string
  label: string
}

let markedConfigured = false
function ensureMarkedConfigured(): void {
  if (markedConfigured) return
  markedConfigured = true
  marked.use({
    extensions: [
      {
        name: 'max-feature',
        level: 'inline',
        start(src: string): number | undefined {
          const m = MAX_RE.exec(src)
          return m ? m.index : undefined
        },
        tokenizer(src: string): MaxToken | undefined {
          const match = MAX_RE_AT_START.exec(src)
          if (!match) return undefined
          return {
            type: 'max-feature',
            raw: match[0],
            label: (match[1] ?? '').trim(),
          }
        },
        renderer(token: MaxToken): string {
          const l = escapeAttribute(token.label)
          return `<span class="max-feature-mount" data-label="${l}">FEATURE MAX</span>`
        },
      },
    ],
  })
}

function escapeAttribute(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function ensureMaxFeatureProseSetup(): void {
  ensureMarkedConfigured()
}

// ---- Mount logic --------------------------------------------------

export function useMaxFeatureProse() {
  const instance = getCurrentInstance() as ComponentInternalInstance | null
  const mountedSpans = new Set<HTMLElement>()

  function mountIn(root: HTMLElement | null | undefined): void {
    if (!root || !instance) return
    if (typeof window === 'undefined') return
    const placeholders = root.querySelectorAll<HTMLElement>('.max-feature-mount[data-label]')
    placeholders.forEach((span) => {
      if (span.dataset.mounted === '1') return
      if (span.closest('code, pre')) return
      const label = span.dataset.label ?? ''
      const vnode = createVNode(MaxFeatureChip, { label: label || undefined })
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

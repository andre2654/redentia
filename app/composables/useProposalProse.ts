/**
 * useProposalProse — auto-replace `{{propose}}` markers in rendered
 * markdown with live `<ActionProposalChip>` Vue instances.
 *
 * Mirror of `useTickerProse`:
 *
 * 1. A marked inline-level extension recognises `{{propose}}` (or
 *    `{{propose:N}}` if the model wants to be explicit) and renders a
 *    placeholder `<span class="proposal-mount"></span>`. The actual
 *    proposal data is delivered via the SSE `action.propose` event and
 *    sits in `message.proposals[]` — the marker just reserves the
 *    spot in the prose where the chip should land.
 *
 * 2. After Message.vue renders the markdown HTML through DOMPurify +
 *    `v-html`, we walk every `.proposal-mount` in document order and
 *    mount an `ActionProposalChip` for `proposals[i]`. Extra markers
 *    (more `{{propose}}` than proposals) are hidden; extra proposals
 *    (fewer markers than proposals) get appended as fallback chips at
 *    the end of the answer wrapper.
 *
 * 3. Idempotent — placeholders tagged `data-mounted="1"` are skipped
 *    on re-mount. `cleanup()` unmounts everything we touched on host
 *    component unmount.
 */
import {
  type ComponentInternalInstance,
  createVNode,
  render,
  getCurrentInstance,
  watch,
} from 'vue'
import { marked } from 'marked'
import ActionProposalChip from '~/components/molecules/chat-v2/ActionProposalChip.vue'
import type { ChatProposalData } from '~/composables/useChatStream'

// ---- Marked extension --------------------------------------------

const PROPOSE_RE = /\{\{\s*propose(?::\s*\d+)?\s*\}\}/
const PROPOSE_RE_AT_START = /^\{\{\s*propose(?::\s*\d+)?\s*\}\}/

interface ProposeToken {
  type: 'propose'
  raw: string
}

let markedConfigured = false
function ensureMarkedConfigured(): void {
  if (markedConfigured) return
  markedConfigured = true
  marked.use({
    extensions: [
      {
        name: 'propose',
        level: 'inline',
        start(src: string): number | undefined {
          const m = PROPOSE_RE.exec(src)
          return m ? m.index : undefined
        },
        tokenizer(src: string): ProposeToken | undefined {
          const match = PROPOSE_RE_AT_START.exec(src)
          if (!match) return undefined
          return { type: 'propose', raw: match[0] }
        },
        renderer(_token: ProposeToken): string {
          // Empty placeholder span — useProposalProse mounts the chip
          // into it after the markdown is rendered + sanitized.
          return `<span class="proposal-mount"></span>`
        },
      },
    ],
  })
}

export function ensureProposalProseSetup(): void {
  ensureMarkedConfigured()
}

// ---- Mount logic --------------------------------------------------

interface UseProposalProseOpts {
  /** Reactive list of proposals attached to the current assistant
   *  message. Order matches the order the model wrote `{{propose}}`
   *  markers in the prose. */
  proposals: () => ChatProposalData[]
  /** Whether the current message is still being streamed. While true,
   *  the composable WAITS for the matching `{{propose}}` marker to
   *  arrive in the prose before rendering the chip — otherwise we
   *  briefly render a block-level fallback at the bottom of the
   *  message and then "snap" the chip into place once the text
   *  catches up, which looks janky. False (post-stream) flips on the
   *  fallback so chips never silently disappear if the model forgot
   *  the marker. */
  isStreaming?: () => boolean
  onConfirm: (proposal: ChatProposalData) => void
  onSkip: (proposal: ChatProposalData) => void
}

export function useProposalProse(opts: UseProposalProseOpts) {
  const instance = getCurrentInstance() as ComponentInternalInstance | null
  const mountedSpans = new Set<HTMLElement>()
  const fallbackHosts = new Set<HTMLElement>()

  function mountIn(root: HTMLElement | null | undefined): void {
    if (!root || !instance) return
    if (typeof window === 'undefined') return

    const proposals = opts.proposals()
    const placeholders = Array.from(root.querySelectorAll<HTMLElement>('.proposal-mount'))

    // 1. Bind every marker in document order to proposals[i].
    const streaming = opts.isStreaming?.() ?? false
    placeholders.forEach((span, idx) => {
      const proposal = proposals[idx]
      if (!proposal) {
        // Extra marker without a matching proposal. Two cases:
        //   a) Mid-stream: proposal might still be on the way — hide
        //      the span quietly, the next mountIn pass will catch it.
        //   b) Stream complete: model wrote `{{propose}}` without
        //      ever calling propose_action. Strip the span AND
        //      collapse adjacent whitespace so the prose reads
        //      cleanly — otherwise we'd leave double-spaces or odd
        //      mid-sentence gaps where the chip should have been.
        if (streaming) {
          span.style.display = 'none'
        } else {
          const prev = span.previousSibling
          const next = span.nextSibling
          if (prev?.nodeType === 3) {
            prev.textContent = (prev.textContent ?? '').replace(/\s+$/, '')
          }
          if (next?.nodeType === 3) {
            next.textContent = (next.textContent ?? '').replace(/^\s+/, ' ')
          }
          span.remove()
        }
        return
      }
      if (span.dataset.mounted === '1') return
      const vnode = createVNode(ActionProposalChip, {
        proposal,
        onConfirm: () => opts.onConfirm(proposal),
        onSkip: () => opts.onSkip(proposal),
      })
      vnode.appContext = instance.appContext
      span.textContent = ''
      render(vnode, span)
      span.dataset.mounted = '1'
      mountedSpans.add(span)
    })

    // 2. Reconcile fallback row.
    //    - During streaming: NEVER render the fallback. The marker may
    //      still be on its way in the text stream — showing a chip at
    //      the bottom and then snapping it inline a tick later looks
    //      janky.
    //    - Post-stream: if there are MORE proposals than markers, the
    //      model forgot the marker → fallback at the end of the wrapper.
    //    - If all proposals matched markers, remove any existing
    //      fallback host so it doesn't linger after the text arrives.
    const extras = proposals.slice(placeholders.length)
    const streaming = opts.isStreaming?.() ?? false
    const existingHost = root.querySelector<HTMLElement>('.proposal-fallback-row')

    if (extras.length === 0 || streaming) {
      // No fallback needed (or not yet) — wipe any pre-existing host
      // we created on a previous mountIn pass. This is the path that
      // fires when the `{{propose}}` marker finally arrives in the
      // streamed text and binds to the proposal that was previously
      // hosted in the fallback row.
      if (existingHost) {
        existingHost.querySelectorAll<HTMLElement>('.proposal-mount').forEach((slot) => {
          render(null, slot)
          mountedSpans.delete(slot)
        })
        existingHost.remove()
        fallbackHosts.delete(existingHost)
      }
      return
    }

    // Reuse a single trailing host so re-renders don't pile up.
    let host = existingHost
    if (!host) {
      host = document.createElement('div')
      host.className = 'proposal-fallback-row mt-2 flex flex-wrap items-center gap-1.5'
      root.appendChild(host)
    }
    // Wipe + repopulate (cheap, list is short).
    host.querySelectorAll<HTMLElement>('.proposal-mount').forEach((slot) => {
      render(null, slot)
      mountedSpans.delete(slot)
    })
    host.innerHTML = ''
    fallbackHosts.add(host)
    extras.forEach((proposal) => {
      const slot = document.createElement('span')
      slot.className = 'proposal-mount'
      host!.appendChild(slot)
      const vnode = createVNode(ActionProposalChip, {
        proposal,
        onConfirm: () => opts.onConfirm(proposal),
        onSkip: () => opts.onSkip(proposal),
      })
      vnode.appContext = instance.appContext
      render(vnode, slot)
      slot.dataset.mounted = '1'
      mountedSpans.add(slot)
    })
  }

  function cleanup(): void {
    if (typeof window === 'undefined') return
    mountedSpans.forEach((span) => {
      render(null, span)
      span.removeAttribute('data-mounted')
    })
    mountedSpans.clear()
    fallbackHosts.forEach((host) => host.remove())
    fallbackHosts.clear()
  }

  return { mountIn, cleanup }
}

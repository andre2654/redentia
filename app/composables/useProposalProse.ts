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
    placeholders.forEach((span, idx) => {
      const proposal = proposals[idx]
      if (!proposal) {
        // Extra marker without a matching proposal — hide it so the
        // raw `{{propose}}` text doesn't leak.
        span.style.display = 'none'
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

    // 2. If there are MORE proposals than markers, the model forgot to
    //    write the marker. Append fallback chips at the end of the
    //    answer wrapper so the user still sees the affordance.
    const extras = proposals.slice(placeholders.length)
    if (extras.length > 0) {
      // Reuse a single trailing host so re-renders don't pile up.
      let host = root.querySelector<HTMLElement>('.proposal-fallback-row')
      if (!host) {
        host = document.createElement('div')
        host.className = 'proposal-fallback-row mt-2 flex flex-wrap items-center gap-1.5'
        root.appendChild(host)
      }
      // Wipe + repopulate (cheap, list is short).
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

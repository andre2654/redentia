<!--
  ThreadSearch — floating search bar that overlays the chat thread.
  Triggered by Cmd+F (Ctrl+F on Linux/Win) inside `Thread.vue`.

  Pattern: a single search input with a match counter + prev/next +
  close. Walks every `.chat-question` and `.chat-answer` element
  inside the thread on each query change, wraps text matches in
  `<mark class="thread-search-hit">`, and tracks a `matches[]`
  array so the user can navigate with the arrow buttons or Enter
  / Shift+Enter.

  Important constraints:
    - Highlighting must NOT touch nodes inside chips (ticker,
      glossary, mention, citation chips). We skip elements with
      `data-mounted="1"` or any of the well-known chip classes
      so the `render(vnode, el)` containers stay intact.
    - On close, we strip every `<mark>` we created (not the user's
      own marks if any) and restore the DOM to its pre-search state.
    - The active match gets a stronger highlight + `scrollIntoView`
      so the user can find their place when the chat is long.

  Not handled (out of scope):
    - Regex / case-sensitive toggle. Search is plain substring,
      case-insensitive, accent-folded so "ipca" finds "IPCA".
    - Cross-message phrase highlighting (matches always live within
      a single text node).
-->
<template>
  <Teleport to="body">
    <Transition name="thread-search">
      <div
        v-if="open"
        class="thread-search"
        role="search"
        :style="position ? { left: position.left + 'px', top: position.top + 'px', width: position.width + 'px' } : undefined"
      >
        <div class="thread-search__input-wrap">
          <UIcon name="i-lucide-search" class="thread-search__icon size-3.5" />
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="thread-search__input"
            placeholder="Buscar nesta conversa…"
            autocomplete="off"
            spellcheck="false"
            @keydown.enter.prevent="onEnter"
            @keydown.escape.prevent="onClose"
          />
        </div>
      <span class="thread-search__count" aria-live="polite">
        <template v-if="totalMatches > 0">
          {{ activeIndex + 1 }} / {{ totalMatches }}
        </template>
        <template v-else-if="query.trim().length > 0">
          Sem resultados
        </template>
      </span>
      <div class="thread-search__nav">
        <button
          type="button"
          class="thread-search__btn"
          :disabled="totalMatches === 0"
          aria-label="Resultado anterior"
          @click="prev"
        >
          <UIcon name="i-lucide-chevron-up" class="size-3.5" />
        </button>
        <button
          type="button"
          class="thread-search__btn"
          :disabled="totalMatches === 0"
          aria-label="Próximo resultado"
          @click="next"
        >
          <UIcon name="i-lucide-chevron-down" class="size-3.5" />
        </button>
        <button
          type="button"
          class="thread-search__btn"
          aria-label="Fechar busca"
          @click="onClose"
        >
          <UIcon name="i-lucide-x" class="size-3.5" />
        </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  /** Element wrapping the rendered messages — Thread.vue passes
   *  `scrollRef`. We walk descendants for highlight targets. */
  scrollContainer: HTMLElement | null
}>()

const emit = defineEmits<{
  close: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const query = ref('')
const matches = ref<HTMLElement[]>([])
const activeIndex = ref(-1)
const totalMatches = computed(() => matches.value.length)

/**
 * Position of the floating search bar in viewport coords. Computed
 * from the scroll container's bounding rect so the bar aligns with
 * the chat column (not the viewport center — there's a sidebar to
 * the left). Updated on `open`, on resize, and when the user
 * scrolls the page (the scroll container itself moving the bar
 * alongside the chat surface).
 *
 * Why fixed (vs absolute inside the scroll container): the user
 * reported `position: absolute` rendering felt like it was
 * "scrolling away" — the visible behavior depends on browser
 * implementation details (Safari vs Chrome handle absolute-inside-
 * scrolling-container subtly differently). Fixed positioning is
 * unambiguous: stays put, period. We just have to recompute the
 * coords when the column shifts (sidebar collapses, viewport
 * resizes).
 */
const position = ref<{ left: number; top: number; width: number } | null>(null)

function reposition(): void {
  const el = props.scrollContainer
  if (!el || typeof window === 'undefined') {
    position.value = null
    return
  }
  const rect = el.getBoundingClientRect()
  // Center the bar horizontally inside the scroll container's box,
  // 14px from its top edge. Width is intrinsic (max-content) so we
  // don't pass an explicit width — let CSS handle it.
  position.value = {
    left: rect.left + rect.width / 2,
    top: rect.top + 14,
    width: 0, // 0 → let CSS auto-size; we still pass it so style binding stays consistent
  }
}

function onWindowChange(): void {
  if (props.open) reposition()
}

/** Strip diacritics + lowercase. "Ações" → "acoes" so query "acoes"
 *  matches case + accent-insensitively. */
function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Mark all matches inside the scroll container by wrapping text
 *  ranges in `<mark class="thread-search-hit">`. Skips text inside
 *  chip placeholders (already-mounted Vue subtrees) so we don't
 *  break their state. Returns the array of created mark elements. */
function highlight(q: string): HTMLElement[] {
  const root = props.scrollContainer
  if (!root) return []
  const folded = fold(q)
  if (folded.length === 0) return []

  // Selector for the prose containers we want to search inside.
  // Includes both user questions and assistant answers.
  const targets = root.querySelectorAll<HTMLElement>('.chat-question, .chat-answer')
  const created: HTMLElement[] = []

  // Walker filter: skip chip placeholders + their descendants so
  // we don't crack open Vue mounts. The "data-mounted" attribute is
  // set by every Prose composable (ticker / chart / glossary /
  // citation / mention) once the chip is in place.
  const SKIP = new Set([
    'ticker-mount',
    'chart-mount',
    'max-feature-mount',
    'glossary-mount',
    'chat-citation-mount',
    'chat-mention',
    'chat-search-skip',
  ])
  function isSkipped(node: Node): boolean {
    let p: Node | null = node
    while (p && p !== root) {
      if (p instanceof HTMLElement) {
        if (p.dataset?.mounted === '1') return true
        for (const cls of SKIP) {
          if (p.classList.contains(cls)) return true
        }
      }
      p = p.parentNode
    }
    return false
  }

  for (const target of targets) {
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) =>
        isSkipped(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    })
    const hits: { node: Text; start: number; end: number }[] = []
    let n = walker.nextNode() as Text | null
    while (n) {
      const text = n.nodeValue ?? ''
      const foldedText = fold(text)
      let from = 0
      while (true) {
        const idx = foldedText.indexOf(folded, from)
        if (idx < 0) break
        hits.push({ node: n, start: idx, end: idx + folded.length })
        from = idx + folded.length
      }
      n = walker.nextNode() as Text | null
    }

    // Apply hits IN REVERSE ORDER per node so split offsets stay
    // valid as we mutate the DOM. We collect all hits first, then
    // process per node from the end backward.
    const byNode = new Map<Text, { start: number; end: number }[]>()
    for (const h of hits) {
      const arr = byNode.get(h.node) ?? []
      arr.push({ start: h.start, end: h.end })
      byNode.set(h.node, arr)
    }
    for (const [textNode, ranges] of byNode) {
      ranges.sort((a, b) => b.start - a.start)
      for (const range of ranges) {
        const original = textNode.nodeValue ?? ''
        const middle = original.slice(range.start, range.end)
        const afterText = original.slice(range.end)
        const mark = document.createElement('mark')
        mark.className = 'thread-search-hit'
        mark.textContent = middle
        textNode.nodeValue = original.slice(0, range.start)
        if (afterText.length > 0) {
          const tail = document.createTextNode(afterText)
          textNode.parentNode?.insertBefore(tail, textNode.nextSibling)
          textNode.parentNode?.insertBefore(mark, tail)
        } else {
          textNode.parentNode?.insertBefore(mark, textNode.nextSibling)
        }
        created.push(mark)
      }
    }
  }

  // Created list is in reverse document order (we processed each
  // text-node's hits from end to start, then iterated targets
  // forward). Re-sort by document order so prev/next navigation
  // matches the user's reading direction.
  created.sort((a, b) =>
    (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1,
  )
  return created
}

/** Remove every `<mark>` we created and merge the surrounding
 *  text nodes back. Idempotent — safe to call when no marks
 *  exist (e.g. on close after empty query). */
function clearHighlights(): void {
  for (const mark of matches.value) {
    const parent = mark.parentNode
    if (!parent) continue
    const text = mark.textContent ?? ''
    parent.replaceChild(document.createTextNode(text), mark)
    // Merge adjacent text nodes so subsequent searches see clean
    // contiguous text. Without this, a "PETR4" search followed by
    // "PETROBRAS" would fail because the previous match's split
    // text nodes don't recombine.
    parent.normalize()
  }
  matches.value = []
  activeIndex.value = -1
}

function applyActiveStyle(): void {
  for (let i = 0; i < matches.value.length; i++) {
    const m = matches.value[i]
    if (!m) continue
    if (i === activeIndex.value) {
      m.classList.add('is-active')
    } else {
      m.classList.remove('is-active')
    }
  }
  if (activeIndex.value >= 0) {
    matches.value[activeIndex.value]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }
}

watch(query, () => {
  // Strip previous, re-highlight new.
  clearHighlights()
  const q = query.value.trim()
  if (q.length < 2) return
  matches.value = highlight(q)
  activeIndex.value = matches.value.length > 0 ? 0 : -1
  applyActiveStyle()
})

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      reposition()
      await nextTick()
      inputRef.value?.focus()
      inputRef.value?.select()
    } else {
      clearHighlights()
      query.value = ''
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('resize', onWindowChange, { passive: true })
  // Capture-phase scroll listener so the bar follows the column
  // as it moves inside any ancestor scroll context (table wrapper,
  // page scroll, etc.).
  window.addEventListener('scroll', onWindowChange, { capture: true, passive: true })
})

onBeforeUnmount(() => {
  clearHighlights()
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', onWindowChange)
  window.removeEventListener('scroll', onWindowChange, { capture: true } as EventListenerOptions)
})

function next(): void {
  if (matches.value.length === 0) return
  activeIndex.value = (activeIndex.value + 1) % matches.value.length
  applyActiveStyle()
}
function prev(): void {
  if (matches.value.length === 0) return
  activeIndex.value =
    (activeIndex.value - 1 + matches.value.length) % matches.value.length
  applyActiveStyle()
}
function onEnter(e: KeyboardEvent): void {
  if (e.shiftKey) prev()
  else next()
}
function onClose(): void {
  emit('close')
}
</script>

<style scoped>
.thread-search {
  /* Anchored to the VIEWPORT (not the scroll container) so it stays
     put regardless of how the chat content scrolls. `top` and
     `left` are set inline from the scroll container's bounding
     rect so it aligns with the chat column, not the viewport
     center (the sidebar offsets the column to the right). */
  position: fixed;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px 6px 10px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 96%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 12px 28px -16px color-mix(in srgb, var(--brand-primary) 22%, transparent),
    0 4px 10px -6px rgba(0, 0, 0, 0.18);
  font-family: var(--brand-font, system-ui);
  /* `translateX(-50%)` centres the box on the inline `left` coord
     supplied by the JS reposition logic. */
  transform: translateX(-50%);
}

.thread-search__input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
}

.thread-search__icon {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.thread-search__input {
  width: 220px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--brand-text);
  font-size: 13px;
  font-weight: 500;
}
.thread-search__input::placeholder {
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

.thread-search__count {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  min-width: 64px;
  text-align: center;
}

.thread-search__nav {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.thread-search__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  cursor: pointer;
  transition: background-color 120ms, color 120ms;
}
.thread-search__btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: var(--brand-text);
}
.thread-search__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.thread-search__btn:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

.thread-search-enter-active,
.thread-search-leave-active {
  transition:
    opacity 160ms ease-out,
    transform 200ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.thread-search-enter-from,
.thread-search-leave-to {
  opacity: 0;
  /* Combine the centering translate with a small slide-down — keeps
     the horizontal anchor while sliding from above. */
  transform: translateX(-50%) translateY(-12px);
}

@media (prefers-reduced-motion: reduce) {
  .thread-search-enter-active,
  .thread-search-leave-active {
    transition: opacity 100ms;
  }
  .thread-search-enter-from,
  .thread-search-leave-to {
    transform: translateX(-50%);
  }
}
</style>

<style>
/* Unscoped — the marks live inside the message DOM (which is
   sanitised + rendered via v-html), so a scoped selector wouldn't
   reach them. */
.thread-search-hit {
  background-color: color-mix(in srgb, var(--brand-primary) 28%, transparent);
  color: inherit;
  padding: 0 1px;
  border-radius: 2px;
  /* Avoid any intrinsic margins from the user-agent <mark> style. */
  display: inline;
}
.thread-search-hit.is-active {
  background-color: var(--brand-primary);
  color: #1a0a2e;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-primary) 40%, transparent);
  border-radius: 3px;
}
</style>

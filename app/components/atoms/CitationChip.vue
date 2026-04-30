<!--
  CitationChip — hover-preview wrapper for inline citation refs.

  Mounted dynamically by `useCitationProse` over the
  `<sup class="chat-citation-mount" data-cite-id="N">N</sup>`
  placeholders that `decorateHtml()` stamps into the answer HTML.
  The component IS the citation number — the surrounding number
  styling (small superscript chip) lives in the parent's deep CSS
  (`.chat-citation-ref`). This component just adds the hover card.

  Same architecture as `GlossaryTerm`:
    - Uses `<Teleport to="body">` so the preview escapes any
      ancestor with `overflow: hidden / clip` (chat tables, scroll
      containers).
    - Position computed from `getBoundingClientRect()` on hover,
      with viewport clamping so the card never spills off-screen.
    - No tooltip provider needed — pure JS state + CSS.

  Click behaviour: opens the source URL in a new tab. The hover
  preview is informational; the click is the way to read the
  full source. Keyboard navigation works the same (Enter / Space).
-->
<template>
  <span
    ref="rootEl"
    class="citation-chip"
    :data-cite-id="id"
    tabindex="0"
    role="button"
    :aria-label="ariaLabel"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="show"
    @blur="hide"
    @click="onClick"
    @keydown.enter="onClick"
    @keydown.space.prevent="onClick"
  >{{ id }}<Teleport v-if="open && coords && hasSource" to="body">
      <span
        class="citation-preview"
        role="tooltip"
        :style="{ top: coords.top + 'px', left: coords.left + 'px' }"
      >
        <span v-if="source?.publisher" class="citation-preview__publisher">
          {{ source.publisher }}
        </span>
        <span v-if="source?.title" class="citation-preview__title">
          {{ source.title }}
        </span>
        <span v-if="source?.url" class="citation-preview__url">
          {{ shortenUrl(source.url) }}
        </span>
        <span v-if="source?.publishedAt" class="citation-preview__date">
          {{ formatDate(source.publishedAt) }}
        </span>
        <span class="citation-preview__hint">
          <UIcon name="i-lucide-arrow-up-right" class="size-3" />
          Abrir fonte
        </span>
        <span class="citation-preview__tail" />
      </span>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import type { ChatCitationSource } from '~/composables/useChatStream'

const props = defineProps<{
  /** Citation number as it appears inline (e.g. 1, 2, 3…). */
  id: number
  /** Source metadata. Only the fields present render their row;
   *  if everything is missing the preview tooltip won't show at all
   *  (we fall back to a plain numeric chip with no hover). */
  source?: ChatCitationSource | null
}>()

const rootEl = ref<HTMLElement | null>(null)
const open = ref(false)
const coords = ref<{ top: number; left: number } | null>(null)

const hasSource = computed(
  () =>
    Boolean(props.source) &&
    Boolean(
      props.source?.title
        || props.source?.url
        || props.source?.publisher
        || props.source?.publishedAt,
    ),
)

const ariaLabel = computed(() => {
  const s = props.source
  if (!s) return `Citação ${props.id}`
  const parts = [`Citação ${props.id}`, s.title, s.publisher].filter(Boolean)
  return parts.join(': ')
})

const PREVIEW_MAX_W = 360
const PREVIEW_GAP = 8

function reposition(): void {
  const el = rootEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  let left = rect.left + rect.width / 2
  const top = rect.top - PREVIEW_GAP
  const minCenter = 8 + PREVIEW_MAX_W / 2
  const maxCenter = window.innerWidth - 8 - PREVIEW_MAX_W / 2
  if (left < minCenter) left = minCenter
  if (left > maxCenter) left = maxCenter
  coords.value = { top, left }
}

function show(): void {
  reposition()
  open.value = true
}
function hide(): void {
  open.value = false
}

function onScrollOrResize(): void {
  if (open.value) reposition()
}

onMounted(() => {
  // Capture-phase scroll listener so the preview follows the chip
  // inside any scroll container (chat-thread, table wrappers, etc.).
  window.addEventListener('scroll', onScrollOrResize, true)
  window.addEventListener('resize', onScrollOrResize, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScrollOrResize, true)
  window.removeEventListener('resize', onScrollOrResize)
})

function onClick(): void {
  const url = props.source?.url
  if (!url) return
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

/** Strip protocol + trim long URLs for the preview row.
 *  e.g. https://www.bloomberg.com/news/articles/2024/...
 *       → bloomberg.com/news/articles/2024/... */
function shortenUrl(url: string): string {
  try {
    const u = new URL(url)
    let path = u.pathname || ''
    if (path === '/') path = ''
    const host = u.hostname.replace(/^www\./, '')
    const full = `${host}${path}`
    if (full.length > 60) return full.slice(0, 59) + '…'
    return full
  } catch {
    return url.slice(0, 60)
  }
}

function formatDate(iso: string): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}
</script>

<style scoped>
.citation-chip {
  /* Inline-block keeps the sup behavior; cursor: pointer hints the
     click target. The citation number itself is styled by the
     parent's `.chat-citation-ref` rule (small chip, brand-tinted). */
  position: relative;
  cursor: pointer;
  outline: none;
}

.citation-chip:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
</style>

<style>
/*
  Unscoped because the preview lives outside the component tree
  (Teleport target is <body>), so scoped CSS attribute selectors
  don't reach it.
*/
.citation-preview {
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: max-content;
  max-width: min(360px, 92vw);
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 70%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 96%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 14px 32px -16px rgba(0, 0, 0, 0.30),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 12%, transparent) inset;
  font-family: var(--brand-font, system-ui);
  pointer-events: none;
  transform: translate(-50%, -100%);
  animation: citation-preview-in 140ms ease-out;
}

@keyframes citation-preview-in {
  from {
    opacity: 0;
    transform: translate(-50%, calc(-100% + 4px));
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%);
  }
}

.citation-preview__publisher {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.citation-preview__title {
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--brand-text);
  /* Clamp to 3 lines to keep the preview compact even when titles
     are long (news headlines often are). */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.citation-preview__url {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11.5px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.citation-preview__date {
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.citation-preview__hint {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--brand-primary);
}

.citation-preview__tail {
  position: absolute;
  bottom: -4px;
  left: 50%;
  width: 8px;
  height: 8px;
  transform: translateX(-50%) rotate(45deg);
  background: inherit;
  border-right: 1px solid color-mix(in srgb, var(--brand-border) 70%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 70%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .citation-preview {
    animation: none;
  }
}
</style>

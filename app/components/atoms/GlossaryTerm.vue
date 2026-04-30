<!--
  GlossaryTerm — inline term wrapper with hover tooltip.

  Implementation note
  -------------------
  This component is mounted DYNAMICALLY via Vue's render() helper
  inside markdown-generated span placeholders (see
  useGlossaryProse.ts). That detaches it from the app's normal
  component tree, which broke an earlier UTooltip-based version:
  Reka UI's tooltip primitive (used by UTooltip) needs a
  provider it can only find via UApp at the page root. When
  the chip mounted inside a table cell the provider lookup
  failed and the tooltip slot rendered as a single Vue comment
  node, leaving the cell visually empty.

  The current implementation:
    - Uses Vue's built-in `<Teleport to="body">` so the tooltip
      escapes any ancestor with overflow:hidden/clip — critical
      inside chat tables, which often clip overflow to keep cell
      borders crisp.
    - Computes screen-space position from the term's
      `getBoundingClientRect()` on hover, listening to scroll
      and resize so the tooltip follows the term as the user
      navigates the page.
    - Doesn't depend on any provider or plugin; works exactly the
      same whether mounted statically (`<GlossaryTerm>`) or
      dynamically via render().

  Visuals
    - Dotted underline in brand-primary (always-on cue).
    - Hover/focus solidifies the underline + nudges color.
    - Tooltip uses --brand-surface background + --brand-text fg
      so it auto-tints per tenant.

  Behaviour
    - Click on the term navigates to `/glossario/{slug}`.
    - Keyboard-accessible: Enter / Space trigger navigation.
-->
<template>
  <span
    ref="rootEl"
    class="glossary-term"
    :class="{ 'glossary-term--seen': seen }"
    :data-term="term"
    tabindex="0"
    role="button"
    :aria-label="`${term}: ${definition}`"
    @mouseenter="show"
    @mouseleave="hide"
    @focus="onFocus"
    @blur="hide"
    @click="onClick"
    @keydown.enter="onClick"
    @keydown.space.prevent="onClick"
  >
    <span class="glossary-term__label">{{ term }}</span>
    <Teleport v-if="open && coords" to="body">
      <span
        class="glossary-term-tooltip"
        role="tooltip"
        :style="{ top: coords.top + 'px', left: coords.left + 'px' }"
      >
        <span class="glossary-term-tooltip__text">{{ definition }}</span>
        <span v-if="slug" class="glossary-term-tooltip__hint">{{ isCoarse ? 'Toque novamente para detalhes' : 'Clique para detalhes' }}</span>
        <span class="glossary-term-tooltip__tail" />
      </span>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** Term as it appeared in the prose (preserves original casing). */
  term: string
  /** Trimmed `definicaoResumida` shown in the tooltip. */
  definition: string
  /** Slug of the canonical glossary entry — wires the click target
   *  to `/glossario/{slug}` so the full article is one tap away. */
  slug?: string
}>()

const router = useRouter()
const rootEl = ref<HTMLElement | null>(null)
const open = ref(false)
const coords = ref<{ top: number; left: number } | null>(null)

/**
 * One-shot "seen" flag: flips to true on the first hover/focus and
 * stays true. Drives the `glossary-term--seen` class which the CSS
 * uses to permanently drop the highlight background. The idea: the
 * highlight is a "hey, new term you might not know" cue. Once the
 * user has hovered to read the definition, the term has done its
 * teaching job — it stays underlined for future reference but
 * stops shouting from the page.
 */
const seen = ref(false)

/** Width budget for the tooltip — kept here so the JS can clamp the
 *  horizontal position against the viewport without measuring the
 *  rendered tooltip box (which would require a second tick). */
const TOOLTIP_MAX_W = 320
const TOOLTIP_GAP = 10 // distance between term and tooltip

/**
 * Position the tooltip ABOVE the term, horizontally centered, with
 * viewport clamping so it never spills off-screen. The tooltip's
 * own `transform: translate(-50%, -100%)` (in CSS) does the centering
 * + lift; here we compute the anchor point in viewport coordinates.
 */
function reposition(): void {
  const el = rootEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  // Anchor = horizontal center of the term, top of the term.
  let left = rect.left + rect.width / 2
  const top = rect.top - TOOLTIP_GAP
  // Clamp: don't let the tooltip's centered box overflow the viewport.
  // Tooltip's left edge ≈ left - TOOLTIP_MAX_W / 2; clamp at 8px from
  // the viewport edge on either side.
  const minCenter = 8 + TOOLTIP_MAX_W / 2
  const maxCenter = window.innerWidth - 8 - TOOLTIP_MAX_W / 2
  if (left < minCenter) left = minCenter
  if (left > maxCenter) left = maxCenter
  coords.value = { top, left }
}

function show(): void {
  reposition()
  open.value = true
  // Mark as seen the moment the user lands on the term — even if
  // they leave before reading, the highlight has done its
  // attention-grab and shouldn't keep flickering on every pass.
  seen.value = true
}
function hide(): void {
  open.value = false
}

function onScrollOrResize(): void {
  if (open.value) reposition()
}

/**
 * Touch-device detection. On hover-incapable devices (phones,
 * tablets without a mouse) we adopt a "tap-to-preview, second-tap
 * to-open" pattern instead of the desktop hover→click flow:
 *
 *   1. First tap   → tooltip shows, navigation is swallowed.
 *   2. Second tap  → tooltip already open, navigation proceeds.
 *   3. Tap outside → blur fires, tooltip hides.
 *
 * Without this, mobile users would never see the definition because
 * the click navigates straight to /glossario/{slug} on the very
 * first tap. This matches Twitter/LinkedIn @-mention behaviour.
 */
const isCoarse = ref(false)
const swallowNextClick = ref(false)

function onPointerOutside(e: Event): void {
  if (!open.value) return
  const root = rootEl.value
  if (!root) return
  const target = e.target as Node | null
  if (target && !root.contains(target)) {
    hide()
  }
}

onMounted(() => {
  // Capture-phase scroll listener so tooltip follows term inside ANY
  // scroll container (table wrappers, chat scroll area, page itself).
  window.addEventListener('scroll', onScrollOrResize, true)
  window.addEventListener('resize', onScrollOrResize, { passive: true })
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    isCoarse.value = window.matchMedia('(hover: none)').matches
  }
  // Tap-outside on touch devices closes the tooltip even when the
  // browser doesn't fire a synthetic blur (some mobile Safari edge
  // cases skip blur for a tap on a non-interactive surface).
  document.addEventListener('pointerdown', onPointerOutside, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScrollOrResize, true)
  window.removeEventListener('resize', onScrollOrResize)
  document.removeEventListener('pointerdown', onPointerOutside, true)
})

function onFocus(): void {
  show()
  if (isCoarse.value) {
    // Arm the swallow guard — the click event that fires immediately
    // after this focus (on the same tap) should be eaten so the user
    // sees the tooltip before being routed away.
    swallowNextClick.value = true
  }
}

function onClick(): void {
  if (swallowNextClick.value) {
    swallowNextClick.value = false
    return
  }
  if (props.slug) {
    void router.push(`/glossario/${props.slug}`)
  }
}
</script>

<style scoped>
.glossary-term {
  position: relative;
  display: inline;
  cursor: help;
  color: inherit;
}

.glossary-term__label {
  /* Default state: highlighted "marker pen" background using brand
     primary at 30% opacity. Padding gives the highlight breathing
     room around the glyphs without bumping the line-height of the
     surrounding prose. */
  background-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
  /* Solid underline (always-on) using brand primary, full strength.
     Lives in the same `background-image` slot — when hover wipes
     the highlight we keep the underline by switching the layer
     instead of toggling a separate property. */
  background-image: linear-gradient(
    to right,
    var(--brand-primary) 0%,
    var(--brand-primary) 100%
  );
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 100% 1.5px;
  padding: 0.5px 3px 2px;
  border-radius: 3px;
  transition:
    background-color 160ms ease-out,
    color 160ms ease-out;
}

.glossary-term:hover .glossary-term__label,
.glossary-term:focus-visible .glossary-term__label,
.glossary-term--seen .glossary-term__label {
  /* Drop the highlight permanently the moment the user has hovered
     (the `--seen` modifier flips on first interaction and never
     flips back). The solid underline stays — the term is still a
     looked-up vocabulary marker, just a quieter one. */
  background-color: transparent;
}

.glossary-term:hover .glossary-term__label,
.glossary-term:focus-visible .glossary-term__label {
  /* Live hover/focus also nudges the text color slightly amber for
     the immediate "you're on it" feedback. Once the cursor leaves
     (and `--seen` keeps the highlight off) the color goes back to
     the surrounding prose so the term blends in as plain copy. */
  color: color-mix(in srgb, var(--brand-text) 95%, var(--brand-primary));
}

.glossary-term:focus-visible {
  outline: none;
}
</style>

<style>
/*
  Tooltip styles are GLOBAL (unscoped) because the element is teleported
  outside this component's tree — Vue's scoped-CSS attribute rewriter
  won't reach it. Class names are deliberately specific to avoid
  collisions with anything else on the page.
*/
.glossary-term-tooltip {
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: max-content;
  max-width: min(320px, 92vw);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 70%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 96%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 12px 28px -16px rgba(0, 0, 0, 0.28),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 14%, transparent) inset;
  font-family: var(--brand-font, system-ui);
  pointer-events: none;
  /* Anchor point set inline (top, left) is the term's top-center. We
     translate up by 100% (lift the tooltip above) and left by -50%
     (center it horizontally on the anchor). */
  transform: translate(-50%, -100%);
  animation: glossary-tooltip-in 140ms ease-out;
}

@keyframes glossary-tooltip-in {
  from {
    opacity: 0;
    transform: translate(-50%, calc(-100% + 4px));
  }
  to {
    opacity: 1;
    transform: translate(-50%, -100%);
  }
}

.glossary-term-tooltip__text {
  font-size: 13px;
  line-height: 1.5;
  color: var(--brand-text);
  font-weight: 400;
  white-space: normal;
}

.glossary-term-tooltip__hint {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--brand-primary);
  text-transform: uppercase;
}

.glossary-term-tooltip__tail {
  /* Diamond tail anchored to the bottom-center of the tooltip,
     pointing down at the term. */
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
  .glossary-term-tooltip {
    animation: none;
  }
}
</style>

<!--
  RaioXHighlights — Spotify-Wrapped-style cinematic story mode for the
  user's portfolio diagnosis.

  Renders 8 full-screen slides over the wallet dashboard. Slides
  auto-advance (each declares its own duration), the user can tap
  left/right to navigate, hold to pause, drag a progress segment to
  jump, or hit Esc to close. Teleports to <body> so it lives above
  any page chrome.

  Inputs:
    - analysis: PortfolioAnalysis (server-side AI snapshot)
    - report:   PortfolioReport | null (deterministic local computation,
                provides monthlyDividendsTotal etc that the AI snapshot
                doesn't carry)
    - totalValue: total portfolio value in BRL (for absolute amounts)
    - userName: optional first name for the intro slide
-->
<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="rootEl"
      class="rxh rxh--enter"
      role="dialog"
      aria-modal="true"
      aria-label="Raio-X em tela cheia"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @pointerleave="onPointerCancel"
    >
        <!-- Atmospheric backdrop: aurora + particle field + grid + vignette. -->
        <HighlightsBackdrop />

        <!-- Iris transition overlay — amber circle that fans out from
             the centre between slides. Pure CSS scale animation,
             remounts via :key with the slide so it replays. -->
        <div
          :key="`iris-${timeline.currentIndex.value}`"
          class="rxh__iris"
          aria-hidden="true"
        />

        <!-- Top bar: progress + close -->
        <header class="rxh__top">
          <HighlightsProgressBar
            :count="slides.length"
            :active-index="timeline.currentIndex.value"
            :progress="timeline.progress.value"
            @jump="(i) => timeline.goTo(i)"
          />
          <button
            type="button"
            class="rxh__close"
            aria-label="Fechar"
            @click="close"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <!-- Slide viewport. Each slide is a key'd component so Vue
             remounts (and replays animations) when navigating. We use
             a non-out-in transition so the new slide fades in while
             the old one fades out simultaneously — avoids the empty
             gap and the enter-from getting stuck when timeline state
             changes faster than the leave transition. -->
        <main class="rxh__stage">
          <!-- No Vue <Transition> here: we ran into edge cases where
               leave/enter classes got stuck when the timeline advanced
               faster than the transition could complete. Instead, each
               slide owns its own entrance choreography via CSS keyframes
               (rxh-stagger), and the :key forces a fresh mount per slide
               so those keyframes replay. -->
          <component
            :is="activeSlideComponent"
            :key="`slide-${timeline.currentIndex.value}`"
            class="rxh__slide rxh__slide--enter"
            v-bind="activeSlideProps"
          />
        </main>

        <!-- Tap zones (invisible, sit OVER the slide content). Hold
             anywhere else to pause. -->
        <button
          type="button"
          class="rxh__tap rxh__tap--prev"
          aria-label="Slide anterior"
          @click="timeline.rewind()"
        />
        <button
          type="button"
          class="rxh__tap rxh__tap--next"
          aria-label="Próximo slide"
          @click="timeline.advance()"
        />

        <!-- Pause indicator -->
        <Transition name="rxh-fade">
          <div v-if="timeline.paused.value" class="rxh__paused" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          </div>
        </Transition>
      </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import HighlightsProgressBar from './HighlightsProgressBar.vue'
import HighlightsBackdrop from './HighlightsBackdrop.vue'
import { useHighlightsTimeline, type HighlightsSlideMeta } from './useHighlightsTimeline'
import type { PortfolioAnalysis } from '~/services/walletData'
import type { PortfolioReport } from '~/composables/usePortfolioScore'
import type { UnifiedPosition } from '~/services/portfolio'
import { projectScenarios } from '~/composables/useStressScenarios'

import SlideIntro from './slides/SlideIntro.vue'
import SlidePnlChart, { type PnlPoint } from './slides/SlidePnlChart.vue'
import SlideScore from './slides/SlideScore.vue'
import SlideSnowflake from './slides/SlideSnowflake.vue'
import SlideStrength from './slides/SlideStrength.vue'
import SlideRisk from './slides/SlideRisk.vue'
import SlideDividends from './slides/SlideDividends.vue'
import SlideStressTest from './slides/SlideStressTest.vue'
import SlideOutro from './slides/SlideOutro.vue'

interface Props {
  open: boolean
  analysis: PortfolioAnalysis | null
  report?: PortfolioReport | null
  positions?: UnifiedPosition[]
  totalValue?: number
  userName?: string
  /**
   * Equity curve (P&L over time) to render in the opening cinematic
   * slide. Optional — when absent we skip the chart slide and go
   * straight from the intro to the score.
   */
  equityCurve?: PnlPoint[]
}

const props = withDefaults(defineProps<Props>(), {
  report: null,
  positions: () => [],
  totalValue: 0,
  userName: '',
  equityCurve: () => [],
})

const emit = defineEmits<{ close: [] }>()

const rootEl = ref<HTMLElement | null>(null)

// ============ Slide registry ============
// Each entry is { id, durationMs, component, propsFactory }. The factory
// is invoked at the moment the slide becomes active so it picks up the
// latest analysis/report shape — useful if the data refreshes mid-show.
const slides = computed(() => {
  const a = props.analysis
  const r = props.report
  const out: Array<HighlightsSlideMeta & {
    component: any
    propsFactory: () => Record<string, any>
  }> = []

  out.push({
    id: 'intro',
    durationMs: 3000,
    component: SlideIntro,
    propsFactory: () => ({ userName: props.userName, generatedAt: a?.generated_at }),
  })

  // P&L chart — only shown when we have an actual equity curve. The
  // camera dolly + line-drawing reveal lasts ~6s, so we give the slide
  // 6500ms total to let the final badge breathe.
  const curve = (props.equityCurve ?? []).filter((p) => p && typeof p.value === 'number')
  if (curve.length >= 2) {
    out.push({
      id: 'pnl-chart',
      durationMs: 6500,
      component: SlidePnlChart,
      propsFactory: () => ({ series: curve }),
    })
  }

  out.push({
    id: 'score',
    durationMs: 5000,
    component: SlideScore,
    propsFactory: () => ({
      score: a?.score ?? r?.score ?? 0,
      band: a?.score_band ?? r?.band ?? 'bom',
      summary: a?.summary_md ?? '',
    }),
  })

  out.push({
    id: 'snowflake',
    durationMs: 5500,
    component: SlideSnowflake,
    propsFactory: () => ({ analysis: a, report: r }),
  })

  // Strongest dimension / strength
  const topStrength = a?.strengths?.[0] ?? null
  if (topStrength) {
    out.push({
      id: 'strength',
      durationMs: 4500,
      component: SlideStrength,
      propsFactory: () => ({ strength: topStrength }),
    })
  }

  // Highest-severity risk
  const sortedRisks = [...(a?.risks ?? [])].sort((x, y) => sevWeight(y.severity) - sevWeight(x.severity))
  const topRisk = sortedRisks[0] ?? null
  if (topRisk) {
    out.push({
      id: 'risk',
      durationMs: 4500,
      component: SlideRisk,
      propsFactory: () => ({ risk: topRisk }),
    })
  }

  // Dividends — only if there's something to show
  const monthly = monthlyDividends.value
  if (monthly > 0 || (r?.dividendForecast?.length ?? 0) > 0) {
    out.push({
      id: 'dividends',
      durationMs: 5000,
      component: SlideDividends,
      propsFactory: () => ({
        monthlyTotal: monthly,
        topPayers: (r?.dividendForecast ?? []).slice(0, 3),
      }),
    })
  }

  // Stress test — projected onto the user's actual positions via the
  // shared `useStressScenarios` composable. This is the SAME source the
  // wallet's <StressTestCard> uses, so the numbers always agree across
  // the dashboard card and this story slide.
  const stressList = projectScenarios(props.positions)
  if (stressList.length && props.positions.length) {
    out.push({
      id: 'stress',
      durationMs: 7500,
      component: SlideStressTest,
      propsFactory: () => ({ scenarios: stressList }),
    })
  }

  // The outro is the share screen — user-controlled, never auto-closes.
  // A very large duration prevents the auto-advance from firing onDone
  // (which would close the modal). User exits via the X button or by
  // tapping a share card.
  out.push({
    id: 'outro',
    durationMs: 9_999_999,
    component: SlideOutro,
    propsFactory: () => ({
      score: a?.score ?? 0,
      analysis: a,
      report: r,
      positions: props.positions,
      totalValue: props.totalValue,
      equityCurve: props.equityCurve,
      userName: props.userName,
    }),
  })

  return out
})

function sevWeight(s: 'low' | 'medium' | 'high'): number {
  return s === 'high' ? 3 : s === 'medium' ? 2 : 1
}

const monthlyDividends = computed(() => {
  if (!props.report) return 0
  // monthlyDividendsTotal is normalized per R$ 100k; scale to actual portfolio.
  const ratio = (props.totalValue || 0) / 100000
  return (props.report.monthlyDividendsTotal || 0) * ratio
})

// ============ Scroll lock ============
// Declared BEFORE the open-watcher so that the immediate-fire call to
// unlockScroll() on first mount (modal closed) doesn't hit a TDZ on
// `savedScrollY`. Renamed away from `scrollY` to avoid collision with
// the global window.scrollY.
let savedScrollY = 0
let scrollLocked = false
function lockScroll() {
  if (typeof document === 'undefined' || scrollLocked) return
  savedScrollY = window.scrollY
  document.body.style.position = 'fixed'
  document.body.style.top = `-${savedScrollY}px`
  document.body.style.width = '100%'
  scrollLocked = true
}
function unlockScroll() {
  if (typeof document === 'undefined' || !scrollLocked) return
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  window.scrollTo(0, savedScrollY)
  scrollLocked = false
}

// ============ Timeline driver ============
const meta = computed<HighlightsSlideMeta[]>(() =>
  slides.value.map((s) => ({ id: s.id, durationMs: s.durationMs })),
)

const timeline = useHighlightsTimeline({
  slides: meta.value,
  onDone: () => close(),
  autoStart: false,
})

// Replay state when the modal opens. We reset SYNCHRONOUSLY so the
// first render sees slide 0 (carrying over a stale currentIndex from
// a previous open caused the modal to start at the last-shown slide
// and stream a burst of leave/enter transitions).
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      timeline.reset()
      // Defer start by one frame so the slide components mount and play
      // their entry animations before the timer begins counting down.
      requestAnimationFrame(() => {
        timeline.start()
      })
      lockScroll()
    } else {
      timeline.stop()
      timeline.reset()
      unlockScroll()
    }
  },
  { immediate: true },
)

const activeSlideComponent = computed(() => {
  const s = slides.value[timeline.currentIndex.value]
  return s?.component ?? null
})

const activeSlideProps = computed(() => {
  const s = slides.value[timeline.currentIndex.value]
  return s?.propsFactory() ?? {}
})

// ============ Hold-to-pause (long press) ============
let holdTimer: ReturnType<typeof setTimeout> | null = null
const HOLD_MS = 220

function onPointerDown(e: PointerEvent) {
  // Ignore right/middle clicks and clicks on real buttons (close, progress).
  const target = e.target as HTMLElement | null
  if (target?.closest('.rxh__close, .hp-bar__seg, .rxh__tap')) return
  if (holdTimer) clearTimeout(holdTimer)
  holdTimer = setTimeout(() => {
    timeline.pause()
  }, HOLD_MS)
}

function onPointerUp() {
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
  if (timeline.paused.value) timeline.resume()
}

function onPointerCancel() {
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
  if (timeline.paused.value) timeline.resume()
}

onBeforeUnmount(() => unlockScroll())

// (Backdrop visuals — aurora, particles, glows — live in HighlightsBackdrop.)

function close() {
  emit('close')
}
</script>

<style scoped>
.rxh {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #0c0612;
  color: #fff;
  overflow: hidden;
  font-family: var(--brand-font, inherit);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

/* ============ Iris transition overlay ============
   A radial-gradient disc that scales from 0 to fully covering the
   viewport in ~520ms, then fades out. Provides the cinematic
   "aperture opening" feeling between slides. */
.rxh__iris {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200vmax;
  height: 200vmax;
  margin-left: -100vmax;
  margin-top: -100vmax;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--brand-primary, #f5a623) 65%, transparent) 0%,
    color-mix(in srgb, var(--brand-primary, #f5a623) 28%, transparent) 25%,
    transparent 60%
  );
  opacity: 0;
  pointer-events: none;
  z-index: 4;
  mix-blend-mode: screen;
  animation: rxh-iris-sweep 720ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes rxh-iris-sweep {
  0%   { transform: scale(0); opacity: 0; }
  20%  { opacity: 0.9; }
  100% { transform: scale(1); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .rxh__iris { animation: none; }
}

/* ============ Top bar ============ */
.rxh__top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px 0;
}

.rxh__close {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  cursor: pointer;
  transition: background 200ms ease-out;
}
.rxh__close:hover {
  background: rgba(255, 255, 255, 0.16);
}
.rxh__close:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

/* ============ Stage ============ */
.rxh__stage {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px 100px;
}

/* ============ Tap zones ============ */
.rxh__tap {
  position: absolute;
  top: 60px;
  bottom: 60px;
  width: 30%;
  background: transparent;
  border: 0;
  cursor: pointer;
  z-index: 5;
}
.rxh__tap--prev {
  left: 0;
}
.rxh__tap--next {
  right: 0;
}

/* ============ Pause indicator ============ */
.rxh__paused {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 8;
  color: rgba(255, 255, 255, 0.85);
}

/* ============ Modal entrance ============ */
.rxh--enter {
  animation: rxh-modal-in 240ms ease-out backwards;
}
@keyframes rxh-modal-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ============ Slide entry ============ */
.rxh__slide {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rxh__slide--enter {
  animation: rxh-slide-in 520ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes rxh-slide-in {
  from {
    opacity: 0;
    transform: translate3d(28px, 0, 0) scale(0.99);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

.rxh-fade-enter-active,
.rxh-fade-leave-active {
  transition: opacity 180ms ease-out;
}
.rxh-fade-enter-from,
.rxh-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .rxh__slide--enter { animation: none; }
}
</style>

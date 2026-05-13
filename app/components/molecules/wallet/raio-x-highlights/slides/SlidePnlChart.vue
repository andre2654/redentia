<!--
  SlidePnlChart — full-bleed cinematic equity-curve reveal.

  Camera = SVG viewBox. Animated every frame to:
    - Open zoomed in on the very start of the curve
    - Pan right tracking the leading edge as the line draws
    - Pull back gradually so by the end the whole curve is on screen

  The leading dot uses path.getPointAtLength() so it sits EXACTLY on
  the rendered (bezier-smoothed) curve — not on a linear interpolation
  of the data points. That fixes the visual drift between dot and line.

  Layout: the slide is positioned absolute inside the modal stage to
  break out of the parent's padding. Headline lives in a top overlay
  with generous safe area; the final-value badge floats centered above
  the lower third so it sits at a comfortable reading height.
-->
<template>
  <div class="sl-pnl-fs">
    <!-- TOP overlay: header lives in a safe-area band well away from the progress bar -->
    <header class="sl-pnl-fs__top">
      <p class="sl-pnl-fs__kicker">
        <span class="sl-pnl-fs__kicker-dot" />
        Sua jornada · {{ daysCount }} {{ daysCount === 1 ? 'dia' : 'dias' }}
      </p>
      <h2 class="sl-pnl-fs__title">
        De <strong>{{ formatBrl(firstValue) }}</strong>
        para <strong class="sl-pnl-fs__title-final" :style="{ color: trendColor }">{{ formatBrl(lastValue) }}</strong>
      </h2>
    </header>

    <!-- Full-bleed SVG canvas. The viewBox is the camera. -->
    <svg
      ref="svgEl"
      class="sl-pnl-fs__svg"
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <!-- Area fill: warm vertical wash that fades to nothing -->
        <linearGradient :id="areaId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="trendColor" stop-opacity="0.45" />
          <stop offset="55%" :stop-color="trendColor" stop-opacity="0.15" />
          <stop offset="100%" :stop-color="trendColor" stop-opacity="0" />
        </linearGradient>
        <!-- Line: subtle saturation ramp left → right -->
        <linearGradient :id="lineId" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" :stop-color="trendColor" stop-opacity="0.65" />
          <stop offset="50%" :stop-color="trendColor" stop-opacity="0.92" />
          <stop offset="100%" :stop-color="trendColor" />
        </linearGradient>
        <!-- Soft drop-shadow glow on the stroke -->
        <filter :id="glowId" x="-20%" y="-30%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Faint horizontal grid lines for context (no labels) -->
      <g class="sl-pnl-fs__grid">
        <line v-for="(g, i) in grid" :key="`grid-${i}`"
          :x1="-padX" :y1="g" :x2="vbW + padX" :y2="g"
        />
      </g>

      <!-- Area fill, clipped to whatever portion of x the pen has covered -->
      <clipPath :id="clipId">
        <rect x="-100" y="-100" :width="clipWidth + 100" :height="vbH + 200" />
      </clipPath>
      <path
        v-if="areaPath"
        :d="areaPath"
        :fill="`url(#${areaId})`"
        :clip-path="`url(#${clipId})`"
      />

      <!-- The line. Reffed so we can read the bezier path geometry. -->
      <path
        ref="pathEl"
        :d="linePath"
        fill="none"
        :stroke="`url(#${lineId})`"
        :stroke-width="lineWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        :filter="`url(#${glowId})`"
        :stroke-dasharray="pathLength || 1"
        :stroke-dashoffset="dashOffset"
      />

      <!-- Leading dot — sits exactly on the bezier curve via getPointAtLength -->
      <g v-if="leadingPoint" :transform="`translate(${leadingPoint.x},${leadingPoint.y})`">
        <circle :r="lineWidth * 3.6" :fill="trendColor" opacity="0.18">
          <animate attributeName="opacity" values="0.18;0.08;0.18" dur="1.4s" repeatCount="indefinite" />
        </circle>
        <circle :r="lineWidth * 1.4" :fill="trendColor" />
        <circle :r="lineWidth * 0.6" fill="#fff" />
      </g>
    </svg>

    <!-- CENTER stack: badge + sub caption sit together, perfectly
         centred in the viewport. They appear at the end so the user's
         eye is naturally drawn here once the camera settles. -->
    <div class="sl-pnl-fs__center">
      <Transition name="sl-pnl-fs-badge">
        <div
          v-if="progress > 0.96"
          class="sl-pnl-fs__badge"
          :style="{
            borderColor: `color-mix(in srgb, ${trendColor} 50%, transparent)`,
            boxShadow: `0 0 38px color-mix(in srgb, ${trendColor} 42%, transparent), 0 20px 60px -20px rgba(0,0,0,0.6)`,
          }"
        >
          <div class="sl-pnl-fs__badge-line">
            <span class="sl-pnl-fs__badge-sign" :style="{ color: trendColor }">{{ deltaSign }}</span>
            <span class="sl-pnl-fs__badge-val">{{ formatBrlAbs(deltaAbs) }}</span>
          </div>
          <span class="sl-pnl-fs__badge-pct" :style="{ color: trendColor }">
            {{ deltaPctLabel }} no período
          </span>
        </div>
      </Transition>

      <Transition name="sl-pnl-fs-fade">
        <p v-if="progress > 0.98" class="sl-pnl-fs__sub">
          {{ trendCopy }}
        </p>
      </Transition>
    </div>
  </div>
</template>

<script lang="ts">
// Module-level coordination so multiple instances of this component
// (HMR re-mounts during dev) don't race to drive the same animation.
// Whichever play() call has the highest id wins; older closures no-op.
let __pnlInstanceCounter = 0
let __pnlLiveId = 0
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'

export interface PnlPoint {
  date: string
  value: number
}

interface Props {
  series?: PnlPoint[]
}
const props = withDefaults(defineProps<Props>(), {
  series: () => [],
})

// ============ Geometry ============
// Asymmetric horizontal padding: a generous "future zone" on the
// right keeps the canvas wider than the data, so the camera can
// pan past the last point and there's visible empty space after
// the pen at the final frame. Without this, the pen rams the
// canvas edge and the camera has nowhere to go.
const vbW = 2000
const vbH = 800
const padLeft = 60
const padRight = 360
const padY = 120
// Backwards-compat alias used in tolerance math below.
const padX = (padLeft + padRight) / 2

const uid = Math.random().toString(36).slice(2, 8)
const areaId = `pnl-area-${uid}`
const lineId = `pnl-line-${uid}`
const glowId = `pnl-glow-${uid}`
const clipId = `pnl-clip-${uid}`

const svgEl = ref<SVGSVGElement | null>(null)
const pathEl = ref<SVGPathElement | null>(null)

// ============ Series prep ============
const sampled = computed<PnlPoint[]>(() => {
  const s = Array.isArray(props.series) ? props.series : []
  if (s.length <= 140) return s
  const step = s.length / 140
  const out: PnlPoint[] = []
  for (let i = 0; i < 140; i++) out.push(s[Math.floor(i * step)]!)
  if (out[out.length - 1] !== s[s.length - 1]) out.push(s[s.length - 1]!)
  return out
})

const firstValue = computed(() => sampled.value[0]?.value ?? 0)
const lastValue = computed(() => sampled.value[sampled.value.length - 1]?.value ?? 0)
const daysCount = computed(() => Math.max(1, sampled.value.length))

const deltaAbs = computed(() => Math.abs(lastValue.value - firstValue.value))
const deltaSign = computed(() => (lastValue.value >= firstValue.value ? '+' : '−'))
const deltaPct = computed(() => {
  if (!firstValue.value) return 0
  return ((lastValue.value - firstValue.value) / firstValue.value) * 100
})
const deltaPctLabel = computed(() => {
  const v = deltaPct.value
  const abs = Math.abs(v).toFixed(1).replace('.', ',')
  return `${v >= 0 ? '+' : '−'}${abs}%`
})
const trendColor = computed(() => {
  if (lastValue.value > firstValue.value) return '#10b981'
  if (lastValue.value < firstValue.value) return '#ef4444'
  return '#f5a623'
})
const trendCopy = computed(() => {
  if (lastValue.value > firstValue.value) return 'Cresceu de forma consistente.'
  if (lastValue.value < firstValue.value) return 'Recuou no período. Ainda dá pra recuperar.'
  return 'Manteve-se estável.'
})

// ============ Path geometry ============
// Project series → SVG coords inside [padX..vbW-padX] × [padY..vbH-padY].
const points = computed(() => {
  const s = sampled.value
  if (s.length < 2) return [] as Array<{ x: number; y: number }>
  const vals = s.map((p) => p.value)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1
  // Data fits between padLeft and (vbW - padRight). The big right
  // padding leaves a "future zone" that the camera can pan into,
  // so the final frame has visible breathing room after the pen.
  const innerW = vbW - padLeft - padRight
  const innerH = vbH - padY * 2
  return s.map((p, i) => ({
    x: padLeft + (i / (s.length - 1)) * innerW,
    y: padY + innerH - ((p.value - min) / range) * innerH,
  }))
})

// Smooth cubic-bezier path. Tension factor controls how loose the
// curve is — lower = more angular, higher = sweeping.
function buildSmoothPath(pts: Array<{ x: number; y: number }>, tension = 0.22): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0]!.x.toFixed(2)},${pts[0]!.y.toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) * tension
    const c1y = p1.y + (p2.y - p0.y) * tension
    const c2x = p2.x - (p3.x - p1.x) * tension
    const c2y = p2.y - (p3.y - p1.y) * tension
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`
  }
  return d
}

const linePath = computed(() => buildSmoothPath(points.value, 0.22))

const areaPath = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  const linePart = linePath.value
  const baseY = vbH - padY
  return `${linePart} L${pts[pts.length - 1]!.x.toFixed(2)},${baseY} L${pts[0]!.x.toFixed(2)},${baseY} Z`
})

// Path length — measured from the real DOM element so it matches the
// rendered bezier exactly. Falls back to a synthetic estimate before
// the path mounts.
const pathLength = ref(0)
function measurePath() {
  const el = pathEl.value
  if (!el) return
  try {
    pathLength.value = el.getTotalLength()
  } catch {
    pathLength.value = 0
  }
}
watch(linePath, async () => {
  await nextTick()
  measurePath()
}, { immediate: true })

const grid = computed(() => {
  const inner = vbH - padY * 2
  return [0.25, 0.5, 0.75].map((t) => padY + inner * t)
})

// ============ Animation driver ============
// `progress` (eased) drives the line stroke + clip-path. `camProgress`
// (different easing) drives the viewBox so the camera moves more
// smoothly and keeps up with the pen instead of chasing it.
const progress = ref(0)
const camProgress = ref(0)
let raf: number | null = null
// 8.5s gives the camera enough breathing room to keep up with the pen.
// At 6s the line outran the pan/zoom and the leading edge "escaped"
// the frame on the way right.
const TOTAL_MS = 8500
const START_DELAY = 250

function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4) }
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function play() {
  if (typeof window === 'undefined') return
  const prm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (prm) {
    progress.value = 1
    camProgress.value = 1
    return
  }
  // Claim ownership. Any tick from an older closure will see the
  // module-level live id has moved on and bail out.
  const myId = ++__pnlInstanceCounter
  __pnlLiveId = myId

  if (raf != null) cancelAnimationFrame(raf)
  progress.value = 0
  camProgress.value = 0

  const startAt = performance.now() + START_DELAY
  function tick(now: number) {
    if (__pnlLiveId !== myId) return
    if (now < startAt) {
      raf = requestAnimationFrame(tick)
      return
    }
    const t = Math.min(1, (now - startAt) / TOTAL_MS)
    progress.value = easeOutQuart(t)
    // Camera gets an 8% head start so the zoom-out runs slightly
    // ahead of the pen and the leading edge can't outrun the frame.
    camProgress.value = easeOutQuart(Math.min(1, t * 1.08))
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  // Measure first, then play so leadingPoint is valid from frame 0.
  nextTick(() => {
    measurePath()
    play()
  })
})
onBeforeUnmount(() => {
  if (raf != null) cancelAnimationFrame(raf)
})

// ============ Derived outputs ============
const dashOffset = computed(() =>
  Math.max(0, (pathLength.value || 1) * (1 - progress.value)),
)

// Leading point = exact spot on the rendered bezier. Reads from
// path.getPointAtLength so dot and stroke share the same geometry.
const leadingPoint = computed(() => {
  const el = pathEl.value
  const len = pathLength.value
  if (!el || !len) {
    // Synthetic fallback while the DOM mounts.
    return points.value[0] ?? null
  }
  try {
    const p = el.getPointAtLength(len * progress.value)
    return { x: p.x, y: p.y }
  } catch {
    return points.value[0] ?? null
  }
})

// Area fill clip width: hugs the pen so the gradient appears to fill
// in just behind the stroke. We use padLeft (small) for the offset so
// the area only trails by ~12px — anything bigger (like the legacy
// average of padLeft+padRight) leaves a visible gap between the pen
// and the filled area.
const clipWidth = computed(() => {
  const x = leadingPoint.value?.x ?? 0
  return Math.max(0, x - padLeft * 0.2)
})

// Stroke width responds to current viewBox zoom. We want the stroke
// to stay visually ~3-4px on screen across the whole animation. The
// viewBox window width scales it inversely.
const lineWidth = computed(() => {
  const scale = currentWindow.value.w / vbW   // 0.22..1.05
  return Math.max(3, Math.min(11, 3.6 / scale))
})

// ============ Camera (viewBox) ============
const currentWindow = ref({ x: 0, y: 0, w: vbW, h: vbH })

// Pre-compute the data-point bounding box once per series so the
// camera always knows where the curve actually lives — not where the
// bezier-smoothed path overshoots to.
const dataBounds = computed(() => {
  const pts = points.value
  if (!pts.length) {
    return {
      firstX: 0, lastX: vbW, firstY: vbH / 2, lastY: vbH / 2,
      minY: 0, maxY: vbH, spanX: vbW, spanY: vbH,
      midX: vbW / 2, midY: vbH / 2,
    }
  }
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const first = pts[0]!
  const last = pts[pts.length - 1]!
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return {
    firstX: first.x,
    lastX: last.x,
    firstY: first.y,
    lastY: last.y,
    minY,
    maxY,
    spanX: Math.max(1, last.x - first.x),
    spanY: Math.max(1, maxY - minY),
    midX: (first.x + last.x) / 2,
    midY: (minY + maxY) / 2,
  }
})

const viewBox = computed(() => {
  const lp = leadingPoint.value
  const db = dataBounds.value
  if (!lp || !db.spanX) return `0 0 ${vbW} ${vbH}`

  const cp = camProgress.value          // 0..1, eased
  // smoothstep helper for blending
  const smooth = (t: number) => t * t * (3 - 2 * t)

  // ============ Two-phase camera ============
  //
  // Phase 1 (cp 0..0.5): TIGHT TRACK. Window stays small (~28-44% of
  // the data span). Camera follows the leading edge tightly on BOTH
  // axes — feels like a drone hugging the pen.
  //
  // Phase 2 (cp 0.5..1.0): PULL BACK. Window grows to reveal the full
  // curve. Focus blends from the pen toward the geometric midpoint of
  // the data bounds so the camera "lets go" of the pen and shows the
  // whole story.
  //
  // This split fixes the case where a user has a long flat section
  // followed by a sudden spike (BOOM). With the old single-phase
  // camera, the spike inflated the data range, pushing the mid-point
  // into empty space and leaving the curve at the edge of the frame.
  // Now the wide phase only kicks in *after* the user has watched the
  // pen build up — and the final guard nails the whole curve to the
  // centre regardless of shape.

  let windowW: number
  let focusX: number
  let focusY: number

  // X anchor where the focus point sits inside the frame: 0 = left,
  // 1 = right. We slide it from 0.55 (pen slightly biased right
  // during the tight track) to 0.70 (last point near the right edge
  // by the end of the pull-back, with empty horizon on its right).
  let anchorX = 0.55

  // Phase split: zoom-in lasts 70% of the timeline, zoom-out only
  // the final 30%. The tight-track phase needs the breathing room
  // so the user feels the pen actually getting somewhere before the
  // camera pulls back to reveal the whole journey.
  const PHASE_SPLIT = 0.70

  if (cp < PHASE_SPLIT) {
    // ---- Phase 1: tight track (drone hugging the pen) ----
    const t1 = smooth(cp / PHASE_SPLIT)
    const tightMin = db.spanX * 0.28 + padX * 2
    const tightMax = db.spanX * 0.55 + padX * 2
    windowW = tightMin + (tightMax - tightMin) * t1
    focusX = lp.x
    focusY = lp.y
  } else {
    // ---- Phase 2: pull-back, focus on the END of the chart ----
    const t2 = smooth((cp - PHASE_SPLIT) / (1 - PHASE_SPLIT))
    // Window sized to fit the trail AND show the future-zone empty
    // canvas to the right of the pen. wideMax overshoots the span so
    // the first point still has room on the left while the pen sits
    // at 70% with 30% of empty horizon to its right.
    const wideMin = db.spanX * 0.55 + padLeft + padRight * 0.5
    const wideMax = db.spanX * 1.25 + padLeft + padRight
    windowW = wideMin + (wideMax - wideMin) * t2
    focusX = lp.x * (1 - t2) + db.lastX * t2
    focusY = lp.y * (1 - t2) + db.midY * t2
    // Anchor at 0.7 means the pen sits at 70% across the frame —
    // with the future-zone empty canvas (padRight) the remaining
    // 30% of the frame is visible "what's next" breathing room.
    // Reads as "we arrived but there's still horizon ahead".
    anchorX = 0.55 + 0.15 * t2
  }

  const windowH = windowW * (vbH / vbW)

  let x = focusX - windowW * anchorX
  let y = focusY - windowH * 0.5

  // ============ Final guard (last 15%) ============
  // Lock the framing so the LAST point sits exactly at 85% across the
  // frame and the entire data range fits. Without this guard, a curve
  // with extreme vertical span (long flat + boom) could still land
  // the last point near the very edge.
  const guardT = Math.max(0, Math.min(1, (cp - 0.85) / 0.15))
  if (guardT > 0) {
    // Pen at 70% — leaves ~30% of horizon empty to the right (the
    // future-zone we built into the canvas). Reads as "arrived at
    // the end with road still ahead".
    const finalAnchor = 0.70
    const finalX = db.lastX - windowW * finalAnchor
    const finalY = db.midY - windowH * 0.5
    x = x * (1 - guardT) + finalX * guardT
    y = y * (1 - guardT) + finalY * guardT
  }

  currentWindow.value = { x, y, w: windowW, h: windowH }

  return `${x.toFixed(1)} ${y.toFixed(1)} ${windowW.toFixed(1)} ${windowH.toFixed(1)}`
})

// ============ Format helpers ============
function formatBrl(v: number): string {
  return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}
function formatBrlAbs(v: number): string {
  return Math.abs(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}
</script>

<style scoped>
/* Step out of the parent stage padding so the chart goes corner to corner. */
.sl-pnl-fs {
  position: absolute;
  inset: -80px -24px -100px;
  overflow: hidden;
  display: block;
}

/* Full-bleed SVG */
.sl-pnl-fs__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* ============ TOP overlay — safe-area aware ============
   Anchored at 14% from the top so it has visible breathing room from
   the progress bar (which is ~16px tall + 16px pad) AND from the
   curve below it. */
.sl-pnl-fs__top {
  position: absolute;
  top: 14%;
  left: 50%;
  transform: translateX(-50%);
  width: min(820px, calc(100% - 80px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  z-index: 4;
  pointer-events: none;
  padding: 0 24px;
  opacity: 0;
  animation: sl-pnl-fs-fadein 600ms ease-out 200ms forwards;
}

.sl-pnl-fs__kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--brand-primary, #f5a623);
  font-weight: 500;
  margin: 0;
}

.sl-pnl-fs__kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 12px currentColor;
}

.sl-pnl-fs__title {
  font-size: clamp(20px, 3vw, 32px);
  line-height: 1.25;
  font-weight: 300;
  letter-spacing: -0.018em;
  color: rgba(255, 255, 255, 0.92);
  margin: 0;
  max-width: 100%;
  text-shadow: 0 2px 32px rgba(0, 0, 0, 0.65);
}

.sl-pnl-fs__title strong {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: #fff;
}

.sl-pnl-fs__title-final {
  text-shadow: 0 0 24px currentColor;
}

/* ============ Center stack — holds the badge + caption ============ */
.sl-pnl-fs__center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  z-index: 5;
  width: min(560px, calc(100% - 80px));
  padding: 0 24px;
  pointer-events: none;
  text-align: center;
}

/* ============ Final value badge ============ */
.sl-pnl-fs__badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 26px;
  background: rgba(20, 12, 30, 0.86);
  border: 1px solid;
  border-radius: 12px;
  backdrop-filter: blur(14px);
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.sl-pnl-fs__badge-line {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
}

.sl-pnl-fs__badge-sign {
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 200;
  line-height: 1;
}

.sl-pnl-fs__badge-val {
  font-size: clamp(36px, 5.5vw, 52px);
  font-weight: 400;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.02em;
}

.sl-pnl-fs__badge-pct {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ============ Caption — sits inside the center stack ============ */
.sl-pnl-fs__sub {
  font-size: clamp(13px, 1.8vw, 16px);
  color: rgba(255, 255, 255, 0.78);
  margin: 0;
  text-align: center;
  text-shadow: 0 1px 16px rgba(0, 0, 0, 0.5);
  max-width: 480px;
}

/* ============ Grid lines ============ */
.sl-pnl-fs__grid line {
  stroke: rgba(255, 255, 255, 0.06);
  stroke-width: 1;
  stroke-dasharray: 2 8;
  opacity: 0;
  animation: sl-pnl-fs-grid-in 700ms ease-out 600ms forwards;
}

@keyframes sl-pnl-fs-grid-in {
  to { opacity: 1; }
}

/* ============ Transitions ============ */
.sl-pnl-fs-badge-enter-active {
  transition: opacity 380ms ease-out, transform 560ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.sl-pnl-fs-badge-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

.sl-pnl-fs-fade-enter-active { transition: opacity 360ms ease-out; }
.sl-pnl-fs-fade-enter-from { opacity: 0; }

@keyframes sl-pnl-fs-fadein {
  to { opacity: 1; }
}

@media (max-width: 720px) {
  .sl-pnl-fs__top {
    top: 12%;
    width: calc(100% - 60px);
  }
  .sl-pnl-fs__badge { padding: 14px 22px; }
  .sl-pnl-fs__center { width: calc(100% - 60px); }
}

@media (prefers-reduced-motion: reduce) {
  .sl-pnl-fs__top,
  .sl-pnl-fs__grid line {
    animation: none;
    opacity: 1;
  }
}
</style>

<!--
  SlidePnlChart — split-screen P&L reveal.

  Top (hero) is a cinematic close-up: the SVG viewBox is locked to a
  tight zoom that PANS to follow the pen as the line draws. No
  zoom-out at the end — the framing stays close so the curve always
  reads as prominent.

  Bottom (minimap) is a small overview that shows the entire chart
  being drawn in real time, synchronized to the same `progress` value.
  This is what gives the user context for where in the journey the
  hero camera is currently focused.

  Two SVGs share the same path data (`linePath` / `pathLength`) and
  the same `dashOffset` so the line draws in lockstep across both.

  The leading dot uses path.getPointAtLength() in the HERO SVG so it
  sits EXACTLY on the rendered (bezier-smoothed) curve — not on a
  linear interpolation of the data points.
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

    <!-- HERO: cinematic close-up. SVG viewBox is the camera, locked
         to a tight zoom that pans to follow the pen. -->
    <div class="sl-pnl-fs__hero">
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
    </div>

    <!-- MINIMAP: minimal bottom strip showing the whole chart being
         drawn. No background panel — just the line itself floating
         on the slide. Synced to the hero via shared linePath /
         pathLength / dashOffset. -->
    <div class="sl-pnl-fs__minimap" aria-hidden="true">
      <svg
        class="sl-pnl-fs__minimap-svg"
        :viewBox="`0 0 ${vbW} ${vbH}`"
        preserveAspectRatio="none"
      >
        <path
          :d="linePath"
          fill="none"
          :stroke="trendColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          :stroke-dasharray="pathLength || 1"
          :stroke-dashoffset="dashOffset"
          vector-effect="non-scaling-stroke"
          opacity="0.55"
        />
        <circle
          v-if="leadingPoint"
          :cx="leadingPoint.x"
          :cy="leadingPoint.y"
          r="4"
          :fill="trendColor"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </div>

    <!-- CENTER stack: badge + sub caption sit together. Anchored to
         the hero center (above the minimap) so they don't overlap
         the overview strip at the bottom. -->
    <div class="sl-pnl-fs__center">
      <Transition name="sl-pnl-fs-badge">
        <div
          v-if="progress > 0.96"
          class="sl-pnl-fs__badge"
          :style="{
            '--trend-color': trendColor,
            textShadow: `0 0 48px color-mix(in srgb, ${trendColor} 55%, transparent), 0 6px 32px rgba(0,0,0,0.55)`,
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
// Aspect ratio of the SVG container on screen. Measured at mount and
// re-measured on resize. Default is the legacy 2.5 desktop ratio
// (vbW 2000 / vbH 800). vbH computed below uses this to keep the
// content scaling to the actual viewport — without it, the curve
// would shrink to a thin sliver on mobile portrait screens.
const containerRatio = ref(2.5)
// vbH adapts to the container's aspect ratio. On a vertical mobile
// viewport we grow the canvas height so the curve scales to fill the
// taller frame — otherwise the camera window grew vertically but the
// content stayed in the same 800-unit band, ending up as a thin
// sliver. Min height kept at 800 so desktop is unchanged.
const vbH = computed(() => Math.max(800, Math.round(vbW / containerRatio.value)))
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
  // Divide by abs(firstValue) so a negative starting balance doesn't
  // flip the sign of the percentage. Going from -2962 to +2932 is a
  // gain, not a -199% loss.
  return ((lastValue.value - firstValue.value) / Math.abs(firstValue.value)) * 100
})
const deltaPctLabel = computed(() => {
  const v = deltaPct.value
  const abs = Math.abs(v).toFixed(1).replace('.', ',')
  return `${v >= 0 ? '+' : '−'}${abs}%`
})
const trendColor = computed(() => {
  if (lastValue.value > firstValue.value) return '#10b981'
  if (lastValue.value < firstValue.value) return '#ef4444'
  return 'var(--brand-primary)'
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

  // Y-range anchored on the JOURNEY (first → last value) rather than
  // raw data min/max. We add 50% headroom on each side, then clamp
  // any data point outside this range to the bounds. This way:
  //   - The start-to-end trend is the visual hero (always centered
  //     and prominent on screen).
  //   - A brief midpath spike that's 10x the journey range gets
  //     clipped to the top edge instead of compressing the rest of
  //     the journey into a 2% sliver at the bottom.
  //   - The badge value (last) sits at a predictable position in
  //     the upper portion of the chart.
  // For flat journeys (first ≈ last), we fall back to the absolute
  // data range so the chart still has something to show.
  const first = s[0]!.value
  const last = s[s.length - 1]!.value
  const journeyMin = Math.min(first, last)
  const journeyMax = Math.max(first, last)
  const journeySpan = journeyMax - journeyMin

  let min: number
  let max: number
  if (journeySpan > 0.5) {
    min = journeyMin - journeySpan * 0.5
    max = journeyMax + journeySpan * 0.5
  } else {
    // Single loop avoids Math.min(...vals) / Math.max(...vals) which
    // each build a temp args array of 140 entries (one per sample).
    let dataMin = Infinity
    let dataMax = -Infinity
    for (let i = 0; i < s.length; i++) {
      const v = s[i]!.value
      if (v < dataMin) dataMin = v
      if (v > dataMax) dataMax = v
    }
    min = dataMin
    max = dataMax
  }

  const range = max - min || 1
  // Data fits between padLeft and (vbW - padRight). The big right
  // padding leaves a "future zone" that the camera can pan into,
  // so the final frame has visible breathing room after the pen.
  const innerW = vbW - padLeft - padRight
  const innerH = vbH.value - padY * 2
  return s.map((p, i) => {
    // Clamp values that fall outside the journey-anchored range so
    // outlier spikes touch the top/bottom of the chart instead of
    // escaping vertically.
    const clamped = Math.max(min, Math.min(max, p.value))
    return {
      x: padLeft + (i / (s.length - 1)) * innerW,
      y: padY + innerH - ((clamped - min) / range) * innerH,
    }
  })
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

// Tension 0.16 keeps the line smooth without large bezier overshoots
// on sharp transitions. Higher values (0.22+) caused the control
// points to extend well above/below the data on spiky series.
const linePath = computed(() => buildSmoothPath(points.value, 0.16))

const areaPath = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  const linePart = linePath.value
  const baseY = vbH.value - padY
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
  const inner = vbH.value - padY * 2
  return [0.25, 0.5, 0.75].map((t) => padY + inner * t)
})

// ============ Animation driver ============
// `progress` (eased) drives the line stroke + clip-path. `camProgress`
// (different easing) drives the viewBox so the camera moves more
// smoothly and keeps up with the pen instead of chasing it.
//
// PERF NOTES (per-frame work, ~60fps):
//   - `dashOffset` recomputes (cheap math)
//   - `leadingPoint` calls `el.getPointAtLength(len * progress)` — one
//     SVG DOM call. Necessary for the dot to sit on the bezier exactly.
//   - `viewBox` runs smoothstep blends + builds a 4-number string.
//   - `clipWidth` and `lineWidth` recompute (cheap math).
//
// What does NOT run per-frame:
//   - `points`, `linePath`, `areaPath`, `dataBounds`, `pathLength`,
//     `grid` — these only update when `props.series` or
//     `containerRatio` change (rare). The `watch(linePath)` only
//     fires when the series changes, not on progress.
const progress = ref(0)
const camProgress = ref(0)
let raf: number | null = null
// 10s lets the user actually savor the line drawing. easeOutQuart
// front-loads the action, so the visible "drawing" feels meatier
// when stretched over 10s than at the previous 8.5s.
const TOTAL_MS = 10000
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

// Track the real on-screen aspect ratio of the SVG container. The
// viewBox uses preserveAspectRatio="slice" so it crops to fill. On a
// mobile portrait viewport the slice cut off the right side of the
// chart (where the pen lives at the final frame). Sizing windowH to
// match the container ratio means the viewBox already matches the
// viewport ratio, so slice has nothing to crop.
let resizeObserver: ResizeObserver | null = null

function updateContainerRatio() {
  const el = svgEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    const raw = rect.width / rect.height
    // Use the raw container ratio. vbH adapts via computed so the
    // viewBox aspect always matches the on-screen aspect, which means
    // preserveAspectRatio="slice" never crops anything AND the curve
    // scales to fill the available area on both desktop and mobile.
    // Floor at 0.35 just to guard against pathological ultra-tall
    // containers (e.g. iPhone landscape with notch overlap).
    const next = Math.max(0.35, raw)
    // Perf: skip if the change is < 1% — ResizeObserver fires for
    // every sub-pixel layout shift, and otherwise this would trigger
    // the points → linePath → pathLength → areaPath chain on each
    // hit, including expensive el.getTotalLength() DOM measurements.
    if (Math.abs(next - containerRatio.value) < 0.01) return
    containerRatio.value = next
  }
}

onMounted(() => {
  // Measure first, then play so leadingPoint is valid from frame 0.
  nextTick(() => {
    updateContainerRatio()
    measurePath()
    play()
    // Re-measure on resize (handles rotation + responsive layout).
    if (typeof ResizeObserver !== 'undefined' && svgEl.value) {
      resizeObserver = new ResizeObserver(updateContainerRatio)
      resizeObserver.observe(svgEl.value)
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateContainerRatio)
    }
  })
})
onBeforeUnmount(() => {
  if (raf != null) cancelAnimationFrame(raf)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  } else if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateContainerRatio)
  }
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
const currentWindow = ref({ x: 0, y: 0, w: vbW, h: vbH.value })

// Pre-compute the data-point bounding box once per series so the
// camera always knows where the curve actually lives — not where the
// bezier-smoothed path overshoots to.
const dataBounds = computed(() => {
  const pts = points.value
  if (!pts.length) {
    const h = vbH.value
    return {
      firstX: 0, lastX: vbW, firstY: h / 2, lastY: h / 2,
      minY: 0, maxY: h, spanX: vbW, spanY: h,
      midX: vbW / 2, midY: h / 2,
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
  if (!lp || !db.spanX) return `0 0 ${vbW} ${vbH.value}`

  // ============ Cinematic camera ============
  //
  // Tight zoom that tracks the pen on both axes — like a drone
  // following the leading edge as the curve generates. The minimap
  // below shows the full chart for context.
  //
  // At the very end (last ~15% of progress) we ease out to a slightly
  // wider framing so the user can take in a bit more of the journey
  // when the badge appears. Not a full zoom-out (minimap covers
  // that) — just enough to feel like the camera "settles".
  const baseWindowW = Math.max(560, db.spanX * 0.28 + padLeft + padRight * 0.15)

  const cp = camProgress.value
  let zoomFactor = 1
  if (cp > 0.82) {
    const t = (cp - 0.82) / 0.18
    const eased = t * t * (3 - 2 * t)
    zoomFactor = 1 + 0.45 * eased   // up to 1.45x at the very end
  }

  const windowW = baseWindowW * zoomFactor
  const windowH = windowW / containerRatio.value

  // Pen anchored slightly right of center; trail visible to the
  // left, a sliver of "what's coming" to the right. Y tracks pen so
  // spikes feel dramatic (camera rises with the pen).
  const anchorX = 0.6
  const x = lp.x - windowW * anchorX
  const y = lp.y - windowH * 0.5

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

/* HERO: cinematic close-up. Takes the full slide minus the bottom
   strip reserved for the minimap. .sl-pnl-fs has bottom: -100px to
   bleed past the modal stage, so the hero's bottom must clear that
   overshoot AND leave room for the minimap (60px tall at bottom:140px
   = top edge at bottom: 200px). 220px gives a small gap. */
.sl-pnl-fs__hero {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 220px;
  overflow: hidden;
}

.sl-pnl-fs__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* MINIMAP: minimal bottom strip. Just the line floating on the
   slide, no panel/border/blur. The slide overflows 100px past the
   modal viewport bottom (.sl-pnl-fs inset bottom: -100px), so we
   need bottom >= 130px here to land inside the visible area. */
.sl-pnl-fs__minimap {
  position: absolute;
  left: 32px;
  right: 32px;
  bottom: 140px;
  height: 60px;
  z-index: 3;
  opacity: 0;
  transform: translateY(8px);
  animation: sl-pnl-fs-minimap-in 700ms ease-out 600ms forwards;
  pointer-events: none;
}

.sl-pnl-fs__minimap-svg {
  width: 100%;
  height: 100%;
  display: block;
}

@keyframes sl-pnl-fs-minimap-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  color: var(--brand-primary, var(--brand-primary));
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

/* ============ Center stack — holds the badge + caption ============
   Anchored to the centre of the HERO area (above the minimap), not
   the full slide. The minimap is smaller now (60px) so the offset
   from the geometric centre is smaller too. */
.sl-pnl-fs__center {
  position: absolute;
  top: calc(50% - 60px);
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

/* ============ Final value — typography-only =============
   No card, no border, no backdrop. Big editorial number floating
   in the cinematic frame, with a soft text-shadow halo for legibility
   over the curve behind it. */
.sl-pnl-fs__badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.sl-pnl-fs__badge-line {
  display: inline-flex;
  align-items: baseline;
  gap: 12px;
}

.sl-pnl-fs__badge-sign {
  font-size: clamp(40px, 7vw, 64px);
  font-weight: 200;
  line-height: 1;
  letter-spacing: -0.02em;
}

.sl-pnl-fs__badge-val {
  font-size: clamp(52px, 9vw, 92px);
  font-weight: 300;
  color: #fff;
  line-height: 1;
  letter-spacing: -0.035em;
}

.sl-pnl-fs__badge-pct {
  font-size: clamp(12px, 1.4vw, 14px);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.92;
}

/* ============ Caption — sits inside the center stack ============ */
.sl-pnl-fs__sub {
  font-size: clamp(13px, 1.8vw, 16px);
  color: rgba(255, 255, 255, 0.78);
  margin: 0;
  text-align: center;
  text-shadow: 0 1px 16px var(--shadow-ambient);
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

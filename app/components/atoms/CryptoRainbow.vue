<!--
  Rainbow chart (log-log). Renders the classic Bitcoin rainbow bands fit
  from the historical daily closes — but extends the chart window out to
  the next-next halving (2032) so the user sees the forward projection,
  not just the past. Tooltip follows the cursor and shows the estimated
  price of each band at the hovered date.
-->
<template>
  <div class="relative w-full" :style="{ height: `${height}px` }">
    <svg
      v-if="points.length >= 30"
      ref="svgEl"
      :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
      preserveAspectRatio="none"
      class="h-full w-full cursor-crosshair select-none"
      @mousemove="onMove"
      @mouseleave="hoverX = null"
      @touchstart.passive="onTouch"
      @touchmove.passive="onTouch"
      @touchend="hoverX = null"
    >
      <!-- Colored bands, bottom-up -->
      <path
        v-for="(band, i) in bandPaths"
        :key="i"
        :d="band.d"
        :fill="band.color"
        :opacity="0.9"
      />

      <!-- Halving markers (vertical dashed lines) -->
      <g font-family="JetBrains Mono, monospace" font-size="9" fill="#fff" opacity="0.65">
        <g v-for="h in halvingMarkers" :key="h.year">
          <line
            :x1="h.x" :x2="h.x"
            :y1="MARGIN_T" :y2="VIEW_H - MARGIN_B"
            stroke="rgba(255,255,255,0.35)"
            stroke-width="1"
            stroke-dasharray="3 3"
          />
          <text :x="h.x" :y="VIEW_H - MARGIN_B - 4" text-anchor="middle" font-weight="700">Halving</text>
        </g>
      </g>

      <!-- Price series -->
      <path
        :d="priceLinePath"
        fill="none"
        stroke="#fff"
        stroke-width="1.8"
        stroke-linejoin="round"
        stroke-linecap="round"
      />

      <!-- Current price dot -->
      <circle
        v-if="lastPoint"
        :cx="lastPoint.x"
        :cy="lastPoint.y"
        r="4.5"
        fill="#fff"
        stroke="#111"
        stroke-width="1"
      />

      <!-- Y-axis log grid labels -->
      <g font-family="JetBrains Mono, monospace" font-size="10" fill="#fff" opacity="0.85">
        <text
          v-for="tick in yTicks"
          :key="'y' + tick.value"
          :x="VIEW_W - 6"
          :y="tick.y"
          text-anchor="end"
          dominant-baseline="middle"
        >{{ currencyLabel }}{{ formatTick(tick.value) }}</text>
      </g>

      <!-- X-axis year labels -->
      <g font-family="JetBrains Mono, monospace" font-size="10" fill="#fff" opacity="0.85">
        <text
          v-for="tick in xTicks"
          :key="'x' + tick.year"
          :x="tick.x"
          :y="VIEW_H - 4"
          text-anchor="middle"
          font-weight="600"
        >{{ tick.year }}</text>
      </g>

      <!-- Hover line + dot -->
      <g v-if="hoverInfo" pointer-events="none">
        <line
          :x1="hoverInfo.x" :x2="hoverInfo.x"
          :y1="MARGIN_T" :y2="VIEW_H - MARGIN_B"
          stroke="rgba(255,255,255,0.7)"
          stroke-width="1"
          stroke-dasharray="2 2"
        />
        <circle
          v-if="hoverInfo.priceY !== null"
          :cx="hoverInfo.x"
          :cy="hoverInfo.priceY"
          r="4"
          fill="#fff"
          stroke="#111"
          stroke-width="1"
        />
      </g>
    </svg>

    <!-- Legend overlay (reversed so most bullish on top) -->
    <div class="pointer-events-none absolute right-3 top-3 flex flex-col gap-0.5 font-mono-tab text-[9px] uppercase">
      <div
        v-for="(band, i) in BANDS.slice().reverse()"
        :key="i"
        class="flex items-center gap-1.5 rounded px-1.5 py-0.5 backdrop-blur"
        style="background-color: rgba(0,0,0,0.45)"
      >
        <span class="h-2 w-2" :style="{ backgroundColor: band.color }" />
        <span class="tracking-wider text-white/90">{{ band.label }}</span>
      </div>
    </div>

    <!-- Current-zone indicator -->
    <div
      v-if="currentZone && !hoverInfo"
      class="pointer-events-none absolute left-3 top-3 flex flex-col gap-0.5 rounded px-2 py-1 font-mono-tab text-[10px] backdrop-blur"
      style="background-color: rgba(0,0,0,0.55); color: white;"
    >
      <span class="uppercase tracking-[0.18em] opacity-75">ZONA ATUAL</span>
      <span class="font-bold uppercase" :style="{ color: currentZone.color }">{{ currentZone.label }}</span>
    </div>

    <!-- Tooltip on hover -->
    <div
      v-if="hoverInfo"
      class="pointer-events-none absolute flex min-w-[180px] flex-col gap-0.5 rounded border px-3 py-2 font-mono-tab text-[10px] backdrop-blur"
      :style="{
        left: `${hoverInfo.tooltipLeftPct}%`,
        top: `${hoverInfo.tooltipTopPct}%`,
        transform: `translate(${hoverInfo.flipX ? '-100%' : '0'}, -50%)`,
        borderColor: 'rgba(255,255,255,0.25)',
        backgroundColor: 'rgba(0,0,0,0.75)',
        color: 'white',
      }"
    >
      <div class="border-b border-white/20 pb-1 mb-1 flex items-center justify-between gap-2">
        <span class="uppercase tracking-[0.15em] opacity-70">{{ hoverInfo.dateLabel }}</span>
        <span v-if="hoverInfo.priceUsd" class="font-bold">{{ currencyLabel }}{{ formatTick(hoverInfo.priceUsd) }}</span>
      </div>
      <div v-for="b in hoverInfo.bands" :key="b.label" class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-1.5">
          <span class="h-2 w-2" :style="{ backgroundColor: b.color }" />
          <span class="tracking-wider">{{ b.label }}</span>
        </div>
        <span class="tabular-nums">{{ currencyLabel }}{{ formatTick(b.price) }}</span>
      </div>
    </div>

    <div
      v-if="points.length < 30"
      class="absolute inset-0 flex items-center justify-center text-xs"
      :style="{ color: 'rgba(255,255,255,0.6)' }"
    >
      Histórico insuficiente para traçar o rainbow (mínimo 30 pontos diários).
    </div>
  </div>
</template>

<script setup lang="ts">
interface RainbowPoint {
  date: string
  price: number
  timestamp: number
}

const props = withDefaults(defineProps<{
  points: RainbowPoint[]
  coinId: string
  height?: number
  currency?: 'BRL' | 'USD'
}>(), {
  height: 440,
  currency: 'BRL',
})

const currencyLabel = computed(() => (props.currency === 'USD' ? '$' : 'R$'))

// Canonical rainbow bands — from StephanAkkerman/bitcoin-rainbow-chart reference.
// Offsets are in ln(price) space. The regression line passes through the
// "Accumulate" band (i=2), so the rainbow is shifted upward relative to fit.
// Band width = 0.3 (ln), i_decrease = 1.5, 9 bands: (i - 1.5) * 0.3 for i ∈ [0,8].
const BANDS = [
  { from: -9,    to: -0.45, color: '#4472c4', label: 'Fire sale' },
  { from: -0.45, to: -0.15, color: '#54989f', label: 'Buy' },
  { from: -0.15, to:  0.15, color: '#63be7b', label: 'Accumulate' },
  { from:  0.15, to:  0.45, color: '#b1d580', label: 'Still cheap' },
  { from:  0.45, to:  0.75, color: '#feeb84', label: 'HODL' },
  { from:  0.75, to:  1.05, color: '#f6b45a', label: 'Bubble forming' },
  { from:  1.05, to:  1.35, color: '#ed7d31', label: 'FOMO Intensifies' },
  { from:  1.35, to:  1.65, color: '#d64018', label: 'Sell. Seriously' },
  { from:  1.65, to:  9,    color: '#c00200', label: 'Max bubble' },
] as const

const VIEW_W = 1200
const VIEW_H = 480
const MARGIN_L = 12
const MARGIN_R = 64
const MARGIN_T = 18
const MARGIN_B = 28

const hoverX = ref<number | null>(null)

// Least-squares regression in (ln(days+1), ln(price)). Matches the canonical
// Trolololo / StephanAkkerman rainbow-chart formulation: y = a*ln(x+1) + c.
// Day 1 is the first historical point; we project up to the next-next halving.
const regression = computed(() => {
  const pts = props.points.filter((p) => p.price > 0)
  if (pts.length < 30) return null
  pts.sort((a, b) => a.timestamp - b.timestamp)

  const firstTs = pts[0]!.timestamp
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
  const n = pts.length
  for (const p of pts) {
    const days = Math.max(1, Math.round((p.timestamp - firstTs) / 86400000) + 1)
    const x = Math.log(days)    // ln(days)
    const y = Math.log(p.price) // ln(price)
    sumX += x; sumY += y
    sumXY += x * y
    sumXX += x * x
  }
  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return null
  const m = (n * sumXY - sumX * sumY) / denom
  const b = (sumY - m * sumX) / n
  return { m, b, firstTs, pts }
})

// Render window: from the first data point's year up to the next-next halving.
// Bitcoin halvings occur every ~4y. 2024 → 2028 → 2032.
const renderWindow = computed(() => {
  const r = regression.value
  if (!r) return null
  const firstDate = new Date(r.firstTs)
  const lastDate = new Date(r.pts[r.pts.length - 1]!.timestamp)
  const startYear = firstDate.getUTCFullYear()
  // Extend to the halving year after 2028 (2032) — mirrors the reference chart.
  const endYear = Math.max(2032, lastDate.getUTCFullYear() + 5)
  const startTs = Date.UTC(startYear, 0, 1)
  const endTs = Date.UTC(endYear, 11, 31)
  return { startTs, endTs, startYear, endYear }
})

// Y domain in ln(price) space. Fits observed range AND projected band
// extremes at start/end of render window. Band offsets: fit-0.45 (bottom of
// Fire sale visible) to fit+1.95 (top of Max bubble).
const yDomain = computed<{ min: number; max: number } | null>(() => {
  const r = regression.value
  const w = renderWindow.value
  if (!r || !w) return null

  const endX = Math.log(Math.max(1, (w.endTs - r.firstTs) / 86400000 + 1))
  const fitEnd = r.m * endX + r.b

  let minLn = Infinity
  let maxLn = -Infinity
  for (const p of r.pts) {
    const lp = Math.log(p.price)
    if (lp < minLn) minLn = lp
    if (lp > maxLn) maxLn = lp
  }

  // Upper bound: top of Max bubble band (fit + 1.95) at end of render window
  const projectedTop = fitEnd + 1.95
  const topLn = Math.max(maxLn, projectedTop) + 0.3
  // Lower bound: bottom of Fire sale band (fit - 0.75) at start of render window
  const startX = Math.log(1)
  const fitStart = r.m * startX + r.b
  const projectedBot = fitStart - 0.75
  const botLn = Math.min(minLn, projectedBot) - 0.4
  return { min: botLn, max: topLn }
})

// Project a timestamp + log10(price) → (x, y) within the viewBox.
function projectTs(timestamp: number): number {
  const w = renderWindow.value!
  const frac = (timestamp - w.startTs) / (w.endTs - w.startTs)
  return MARGIN_L + frac * (VIEW_W - MARGIN_L - MARGIN_R)
}
function projectY(logPrice: number): number {
  const d = yDomain.value!
  const frac = (logPrice - d.min) / (d.max - d.min)
  return VIEW_H - MARGIN_B - frac * (VIEW_H - MARGIN_T - MARGIN_B)
}

// Fit ln(price) for a given timestamp based on the regression.
function fitLog(timestamp: number): number {
  const r = regression.value!
  const days = Math.max(1, (timestamp - r.firstTs) / 86400000 + 1)
  return r.m * Math.log(days) + r.b
}

// Build 60 sample points across the render window and draw each band as a
// filled polygon between two offset fit curves.
const SAMPLES = 140

const bandPaths = computed(() => {
  const r = regression.value
  const w = renderWindow.value
  if (!r || !w || !yDomain.value) return []

  const sampled: { ts: number; fit: number }[] = []
  for (let i = 0; i < SAMPLES; i++) {
    const ts = w.startTs + ((w.endTs - w.startTs) * i) / (SAMPLES - 1)
    sampled.push({ ts, fit: fitLog(ts) })
  }

  return BANDS.map((band) => {
    const top: string[] = []
    const bot: string[] = []
    for (let i = 0; i < sampled.length; i++) {
      const s = sampled[i]!
      const topLog = clampY(s.fit + band.to)
      const botLog = clampY(s.fit + band.from)
      const x = projectTs(s.ts)
      top.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${projectY(topLog).toFixed(2)}`)
      bot.push(`L${x.toFixed(2)} ${projectY(botLog).toFixed(2)}`)
    }
    bot.reverse()
    return { d: [...top, ...bot, 'Z'].join(' '), color: band.color, label: band.label }
  })
})

function clampY(log: number): number {
  const d = yDomain.value!
  if (log < d.min) return d.min
  if (log > d.max) return d.max
  return log
}

const priceLinePath = computed(() => {
  const r = regression.value
  if (!r || !renderWindow.value || !yDomain.value) return ''
  const coords: string[] = []
  for (let i = 0; i < r.pts.length; i++) {
    const p = r.pts[i]!
    const x = projectTs(p.timestamp)
    const y = projectY(Math.log(p.price))
    coords.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return coords.join(' ')
})

const lastPoint = computed(() => {
  const r = regression.value
  if (!r || !renderWindow.value || !yDomain.value) return null
  const p = r.pts[r.pts.length - 1]!
  return { x: projectTs(p.timestamp), y: projectY(Math.log(p.price)) }
})

const currentZone = computed(() => {
  const r = regression.value
  if (!r) return null
  const last = r.pts[r.pts.length - 1]!
  const residual = Math.log(last.price) - fitLog(last.timestamp)
  return BANDS.find((b) => residual >= b.from && residual < b.to) ?? null
})

// Y ticks: powers of 10 inside [domain.min, domain.max]. Domain is in ln,
// so we convert: ln(10^p) = p * ln(10).
const LN10 = Math.log(10)
const yTicks = computed(() => {
  const d = yDomain.value
  if (!d) return []
  const lo = Math.ceil(d.min / LN10)
  const hi = Math.floor(d.max / LN10)
  const out: { value: number; y: number }[] = []
  for (let p = lo; p <= hi; p++) out.push({ value: Math.pow(10, p), y: projectY(p * LN10) })
  return out
})

// X ticks: every 2 years across the render window.
const xTicks = computed(() => {
  const w = renderWindow.value
  if (!w) return []
  const out: { year: number; x: number }[] = []
  for (let y = w.startYear; y <= w.endYear; y++) {
    if (y % 2 !== 0) continue
    const ts = Date.UTC(y, 0, 1)
    out.push({ year: y, x: projectTs(ts) })
  }
  return out
})

// Bitcoin halving dates (approx. Jan 1 of the halving year; good enough for
// a visual marker). 2012-11-28, 2016-07-09, 2020-05-11, 2024-04-19, 2028, 2032.
const HALVING_YEARS = [2012, 2016, 2020, 2024, 2028, 2032]
const halvingMarkers = computed(() => {
  const w = renderWindow.value
  if (!w) return []
  return HALVING_YEARS
    .filter((y) => y >= w.startYear && y <= w.endYear)
    .map((y) => ({ year: y, x: projectTs(Date.UTC(y, 0, 1)) }))
})

// Hover handling — maps the mouse X back to a timestamp, computes the fit +
// each band's price, plus the actual historic price if we have a point close
// to that date.
const svgEl = ref<SVGSVGElement | null>(null)

// SVG uses preserveAspectRatio="none" + viewBox=VIEW_WxVIEW_H, so viewBox X
// maps linearly to container X. Mouse pixel → viewBox X is just ratio * VIEW_W.
function onMove(ev: MouseEvent) {
  const el = svgEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const ratio = (ev.clientX - rect.left) / rect.width
  hoverX.value = ratio * VIEW_W
}
function onTouch(ev: TouchEvent) {
  const touch = ev.touches[0]
  if (!touch) return
  const el = svgEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const ratio = (touch.clientX - rect.left) / rect.width
  hoverX.value = ratio * VIEW_W
}

const hoverInfo = computed(() => {
  const r = regression.value
  const w = renderWindow.value
  if (!r || !w || hoverX.value === null) return null
  const xClamped = Math.max(MARGIN_L, Math.min(hoverX.value, VIEW_W - MARGIN_R))
  const frac = (xClamped - MARGIN_L) / (VIEW_W - MARGIN_L - MARGIN_R)
  const ts = w.startTs + (w.endTs - w.startTs) * frac
  const fit = fitLog(ts)

  // Nearest historic price (if within the data range)
  let priceUsd: number | null = null
  let priceY: number | null = null
  const ptsFirst = r.pts[0]!.timestamp
  const ptsLast = r.pts[r.pts.length - 1]!.timestamp
  if (ts >= ptsFirst && ts <= ptsLast) {
    const idx = binarySearchNearest(r.pts, ts)
    const p = r.pts[idx]!
    priceUsd = p.price
    priceY = projectY(Math.log(p.price))
  }

  const bands = BANDS.slice().reverse().map((b) => {
    // Clamp infinite extremes so the tooltip shows a meaningful price for the
    // Fire sale / Max bubble bands (their from/to use ±9 as "open" limits).
    const lo = Math.max(b.from, -2)
    const hi = Math.min(b.to, 3)
    return {
      label: b.label,
      color: b.color,
      price: Math.exp(fit + (lo + hi) / 2),
    }
  })

  const date = new Date(ts)
  const dateLabel = `${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`

  // Tooltip positioning (percent of container). Flip to the left if we're
  // past the midpoint so the tooltip stays on screen.
  const pct = (xClamped / VIEW_W) * 100
  const flipX = pct > 55
  return {
    x: xClamped,
    priceY,
    priceUsd,
    dateLabel,
    bands,
    tooltipLeftPct: flipX ? pct - 1 : pct + 1,
    tooltipTopPct: 50,
    flipX,
  }
})

function binarySearchNearest(pts: RainbowPoint[], ts: number): number {
  let lo = 0, hi = pts.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (pts[mid]!.timestamp < ts) lo = mid + 1
    else hi = mid
  }
  if (lo > 0) {
    const a = pts[lo - 1]!.timestamp
    const b = pts[lo]!.timestamp
    if (Math.abs(ts - a) < Math.abs(ts - b)) return lo - 1
  }
  return lo
}

function formatTick(value: number): string {
  if (value >= 1_000_000) return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  if (value >= 1000) return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 }).format(value)
  if (value >= 1) return String(Math.round(value))
  return value.toFixed(2)
}
</script>

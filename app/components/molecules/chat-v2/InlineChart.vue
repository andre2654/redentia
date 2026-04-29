<!--
  InlineChart — live SVG chart that mounts inside a `{{chart:X:Y}}`
  marker in chat markdown.

  Strategy
  ========
  - On mount, fetch real price series for the symbol + period from the
    same Laravel endpoints used by the home page:
      * IBOV / IFIX → useAssetsService().getIndiceHistoricPrices
      * Any other symbol → useAssetsService().assetHistoricPrices
    Crypto symbols (BTC, ETH, SOL…) currently fall through to ticker
    fetch and gracefully show a fallback if 404.
  - Render an SVG line chart with min/max axes, last-price label, and
    a delta % vs the first point in the series.
  - Visually anchored: tabular-nums, period label as eyebrow, slim
    border, 220px height. Stays inside the chat answer column.
  - Failure modes: data-empty → static line + "Sem dado validado".
    Network error → "Não consegui carregar o gráfico" + retry button.

  Why mount-time fetch instead of SSR?
  -----------------------------------
  - Charts are large payloads (30+ price points each). Inlining them
    into the SSR markup blows up message size and we'd need to
    re-fetch on F5 anyway to get fresh prices.
  - The component is keyed by ticker+period, so a chat history with
    `{{chart:IBOV:1mo}}` recovers the chart on every reload by re-
    fetching from the live API. F5-stable by design — the marker
    survives because it's in the persisted markdown.
-->
<template>
  <div
    class="inline-chart relative my-3 flex flex-col gap-2 overflow-hidden rounded-2xl px-4 py-3.5"
    :style="{
      backgroundColor: `color-mix(in srgb, var(--brand-surface) 70%, transparent)`,
      border: `1px solid color-mix(in srgb, var(--brand-border) 38%, transparent)`,
    }"
  >
    <!-- Header -->
    <header class="flex items-baseline justify-between gap-3">
      <div class="flex items-baseline gap-2 min-w-0">
        <span
          class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em]"
          :style="{ color: 'var(--brand-text-muted)' }"
          translate="no"
        >{{ ticker }} · {{ periodLabel }}</span>
      </div>
      <div v-if="!loading && !error && hasData" class="flex items-baseline gap-2">
        <span
          class="font-mono-tab text-[14px] font-semibold tabular-nums"
          :style="{ color: 'var(--brand-text)' }"
          translate="no"
        >{{ formatLastPrice }}</span>
        <span
          v-if="deltaText"
          class="font-mono-tab text-[11.5px] tabular-nums"
          :style="{ color: deltaColor }"
          translate="no"
        >{{ deltaText }}</span>
      </div>
    </header>

    <!-- Chart -->
    <div class="relative h-[180px] w-full md:h-[200px]">
      <!-- Loading skeleton -->
      <div
        v-if="loading"
        class="absolute inset-0 animate-pulse rounded-lg"
        :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 5%, transparent)` }"
      />

      <!-- Error state -->
      <div
        v-else-if="error || !hasData"
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg text-center text-[12.5px]"
        :style="{
          color: 'var(--brand-text-muted)',
          backgroundColor: `color-mix(in srgb, var(--brand-text) 3%, transparent)`,
        }"
      >
        <UIcon
          name="i-lucide-line-chart"
          class="size-5 opacity-40"
          aria-hidden="true"
        />
        <span>{{ error ? 'Não consegui carregar o gráfico.' : 'Sem dado validado.' }}</span>
        <button
          v-if="error"
          type="button"
          class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em] underline transition-colors"
          :style="{ color: 'var(--brand-primary)' }"
          @click="refresh"
        >Tentar novamente</button>
      </div>

      <!-- Chart -->
      <svg
        v-else
        :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
        class="block h-full w-full"
        preserveAspectRatio="none"
        role="img"
        :aria-label="`Gráfico de ${ticker} no período ${periodLabel}`"
        @mousemove="onMove"
        @mouseleave="hover = null"
        @touchmove.prevent="onTouch"
        @touchend="hover = null"
      >
        <!-- Horizontal gridlines + price labels -->
        <g aria-hidden="true">
          <line
            v-for="(g, i) in gridLines"
            :key="`g-${i}`"
            :x1="0"
            :x2="VIEW_W"
            :y1="g.y"
            :y2="g.y"
            :stroke="`color-mix(in srgb, var(--brand-text) 6%, transparent)`"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />
        </g>

        <!-- Area fill under the line -->
        <path
          v-if="areaPath"
          :d="areaPath"
          :fill="`color-mix(in srgb, ${lineColor} 14%, transparent)`"
        />

        <!-- Main line -->
        <path
          v-if="linePath"
          :d="linePath"
          fill="none"
          :stroke="lineColor"
          stroke-width="1.6"
          stroke-linejoin="round"
          stroke-linecap="round"
          vector-effect="non-scaling-stroke"
        />

        <!-- Last point marker -->
        <circle
          v-if="lastPoint"
          :cx="lastPoint.x"
          :cy="lastPoint.y"
          r="2.4"
          :fill="lineColor"
          vector-effect="non-scaling-stroke"
        />

        <!-- Hover crosshair -->
        <g v-if="hover" aria-hidden="true">
          <line
            :x1="hover.x"
            :x2="hover.x"
            :y1="0"
            :y2="VIEW_H"
            :stroke="`color-mix(in srgb, var(--brand-text) 28%, transparent)`"
            stroke-width="1"
            stroke-dasharray="2 2"
            vector-effect="non-scaling-stroke"
          />
          <circle
            :cx="hover.x"
            :cy="hover.y"
            r="2.4"
            :fill="lineColor"
            stroke="var(--brand-surface)"
            stroke-width="1.5"
            vector-effect="non-scaling-stroke"
          />
        </g>
      </svg>

      <!-- Tooltip (hover/focus) -->
      <div
        v-if="hover"
        class="pointer-events-none absolute select-none rounded-md px-2 py-1 font-mono-tab text-[10.5px] tabular-nums shadow-md"
        :style="{
          left: `${tooltipLeft}px`,
          top: `${tooltipTop}px`,
          backgroundColor: 'var(--brand-text)',
          color: 'var(--brand-surface)',
        }"
        translate="no"
      >
        <div>{{ hover.dateLabel }}</div>
        <div>{{ formatBRL(hover.price) }}</div>
      </div>
    </div>

    <!-- Footer: x-axis ticks (first/last date) -->
    <footer
      v-if="!loading && !error && hasData"
      class="flex items-baseline justify-between font-mono-tab text-[10px] uppercase tracking-[0.14em]"
      :style="{ color: 'var(--brand-text-muted)' }"
    >
      <span>{{ firstDateLabel }}</span>
      <span>{{ lastDateLabel }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  ticker: string
  period: string
}>()

const { getIndiceHistoricPrices, assetHistoricPrices } = useAssetsService()

// ---- Period normalization -------------------------------------------------
type ApiPeriod = '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full'

function normalizePeriod(raw: string): ApiPeriod {
  const p = raw.toLowerCase()
  if (p === '1y') return '12mo'
  if (p === '6mo') return '3mo' // backend doesn't expose 6mo; fall back
  if (p === 'ytd' || p === '1mo' || p === '3mo' || p === '12mo' || p === '3y' || p === '4y' || p === '5y' || p === 'full') return p
  return '1mo'
}

const periodLabel = computed(() => {
  const p = props.period.toLowerCase()
  if (p === '1mo') return '30 dias'
  if (p === '3mo') return '3 meses'
  if (p === '6mo') return '6 meses'
  if (p === 'ytd') return 'YTD'
  if (p === '12mo' || p === '1y') return '12 meses'
  if (p === '3y') return '3 anos'
  if (p === '5y') return '5 anos'
  if (p === 'full') return 'histórico'
  return p
})

// ---- Data ----------------------------------------------------------------
interface Point {
  market_price: number | string
  price_at?: string
  date?: string
}

const loading = ref(false)
const error = ref<string | null>(null)
const series = ref<Point[]>([])

function isIndice(symbol: string): symbol is 'IBOV' | 'IFIX' {
  const u = symbol.toUpperCase()
  return u === 'IBOV' || u === 'IFIX'
}

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const period = normalizePeriod(props.period)
    let data: unknown
    if (isIndice(props.ticker)) {
      data = await getIndiceHistoricPrices(
        props.ticker.toLowerCase() as 'ibov' | 'ifix',
        period,
      )
    } else {
      data = await assetHistoricPrices(props.ticker, period)
    }
    if (Array.isArray(data)) {
      series.value = data as Point[]
    } else {
      series.value = []
    }
  } catch (err) {
    error.value = String(err)
    series.value = []
  } finally {
    loading.value = false
  }
}

function refresh() { void load() }

onMounted(() => { void load() })

// ---- Chart math ----------------------------------------------------------
const VIEW_W = 600
const VIEW_H = 180

const numericSeries = computed(() => {
  return series.value
    .map((p) => ({
      v: Number(p.market_price),
      d: p.price_at ?? p.date ?? '',
    }))
    .filter((p) => Number.isFinite(p.v))
})

const hasData = computed(() => numericSeries.value.length >= 2)

const range = computed(() => {
  const arr = numericSeries.value
  if (arr.length < 2) return null
  const values = arr.map((p) => p.v)
  const min = Math.min(...values)
  const max = Math.max(...values)
  // Pad 5% on each side so the line never touches edges
  const pad = (max - min) * 0.05 || max * 0.01 || 1
  return { min: min - pad, max: max + pad }
})

interface Coord { x: number; y: number; v: number; d: string; idx: number }

const coords = computed<Coord[]>(() => {
  const arr = numericSeries.value
  const r = range.value
  if (!r) return []
  const span = r.max - r.min || 1
  const stepX = arr.length > 1 ? VIEW_W / (arr.length - 1) : 0
  return arr.map((p, i) => ({
    idx: i,
    v: p.v,
    d: p.d,
    x: i * stepX,
    y: VIEW_H - ((p.v - r.min) / span) * VIEW_H,
  }))
})

const linePath = computed(() => {
  const c = coords.value
  if (c.length < 2) return ''
  return c
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
})

const areaPath = computed(() => {
  const c = coords.value
  if (c.length < 2) return ''
  const top = c
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
  return `${top} L ${c[c.length - 1]!.x.toFixed(2)} ${VIEW_H} L 0 ${VIEW_H} Z`
})

const lastPoint = computed(() => {
  const c = coords.value
  return c.length > 0 ? c[c.length - 1] : null
})

const gridLines = computed(() => {
  const r = range.value
  if (!r) return []
  return [0.25, 0.5, 0.75].map((p) => ({ y: VIEW_H * p }))
})

// ---- Header KPIs ---------------------------------------------------------
const formatLastPrice = computed(() => {
  const last = numericSeries.value[numericSeries.value.length - 1]?.v
  if (typeof last !== 'number') return '—'
  return formatBRL(last, isIndice(props.ticker))
})

const deltaPct = computed<number | null>(() => {
  const arr = numericSeries.value
  if (arr.length < 2) return null
  const first = arr[0]!.v
  const last = arr[arr.length - 1]!.v
  if (first === 0) return null
  return ((last - first) / first) * 100
})

const deltaText = computed(() => {
  const v = deltaPct.value
  if (v == null) return ''
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(2)}%`
})

const lineColor = computed(() => {
  const v = deltaPct.value
  if (v == null || Math.abs(v) < 0.01) return 'var(--brand-text-muted)'
  return v > 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
})
const deltaColor = lineColor

// ---- Footer dates --------------------------------------------------------
function formatShortDate(iso: string): string {
  if (!iso) return ''
  // Already-rendered dates from the API are YYYY-MM-DD or ISO
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

const firstDateLabel = computed(() =>
  numericSeries.value.length ? formatShortDate(numericSeries.value[0]!.d) : '',
)
const lastDateLabel = computed(() =>
  numericSeries.value.length
    ? formatShortDate(numericSeries.value[numericSeries.value.length - 1]!.d)
    : '',
)

// ---- Hover / touch interaction -------------------------------------------
interface Hover { x: number; y: number; price: number; dateLabel: string }

const hover = ref<Hover | null>(null)
const tooltipLeft = ref(0)
const tooltipTop = ref(0)

function nearestCoord(svgX: number): Coord | null {
  const c = coords.value
  if (c.length === 0) return null
  let best = c[0]!
  let bestDist = Math.abs(c[0]!.x - svgX)
  for (let i = 1; i < c.length; i++) {
    const d = Math.abs(c[i]!.x - svgX)
    if (d < bestDist) {
      bestDist = d
      best = c[i]!
    }
  }
  return best
}

function onMove(ev: MouseEvent) {
  updateHoverFromEvent(ev.currentTarget as SVGSVGElement, ev.clientX, ev.clientY)
}
function onTouch(ev: TouchEvent) {
  const t = ev.touches[0]
  if (!t) return
  updateHoverFromEvent(ev.currentTarget as SVGSVGElement, t.clientX, t.clientY)
}

function updateHoverFromEvent(svg: SVGSVGElement, clientX: number, clientY: number) {
  const rect = svg.getBoundingClientRect()
  const relX = ((clientX - rect.left) / rect.width) * VIEW_W
  const point = nearestCoord(relX)
  if (!point) {
    hover.value = null
    return
  }
  hover.value = {
    x: point.x,
    y: point.y,
    price: point.v,
    dateLabel: formatShortDate(point.d),
  }
  // Tooltip position in CSS px, anchored above the point and clamped
  // within the chart container.
  const ratioX = point.x / VIEW_W
  const ratioY = point.y / VIEW_H
  tooltipLeft.value = Math.max(8, Math.min(rect.width - 80, ratioX * rect.width - 35))
  tooltipTop.value = Math.max(0, ratioY * rect.height - 36)
}

// ---- Helpers -------------------------------------------------------------
function formatBRL(value: number, isIndex = false): string {
  if (!Number.isFinite(value)) return '—'
  if (isIndex) {
    return new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 0,
    }).format(value)
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value)
}
</script>

<style scoped>
.inline-chart {
  display: block;
  /* The marker is mounted into a span (.chart-mount) which is normally
     inline. Forcing block flow ensures the chart takes a full row even
     when the marker shows up mid-paragraph in the model's output. */
  min-width: 0;
  width: 100%;
}
</style>

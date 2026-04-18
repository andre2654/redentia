<script setup lang="ts">
definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// ============================================================
// Growth Race, Animated multi-ticker valorization race
//
// Plays a 1080x1080 "race" of 2-5 tickers starting at base 100,
// with the date advancing in the title while the chart draws
// from left to right and each line head carries the company logo.
//
// Query params:
//   tickers   PETR4,VALE3,ITUB4          required (comma-separated)
//   years     5                          how far back to start (default 5)
//   reinvest  true                       reinvest dividends (default false)
//   duration  10000                      animation ms (default 10000)
//   auto      true                       auto-start on mount (default true)
//
// The animation uses requestAnimationFrame, interpolating a
// `progress` value from 0 to 1 over `duration` ms. Each frame
// we derive a "virtual index" into each ticker's normalized
// price series and redraw the paths up to that index, with the
// logo positioned at the current tip.
// ============================================================

import { REDENTIA_COLORS, REDENTIA_FONTS, REDENTIA_GOOGLE_FONT_HREF } from '~/utils/redentiaCreativeColors'

// Re-export as local constants so Vue's compile-time v-bind(...)
// in the <style> block can resolve them. v-bind only walks
// identifiers declared directly in <script setup> and won't
// follow deep property accesses on imported objects.
const cBg = REDENTIA_COLORS.background
const cText = REDENTIA_COLORS.text
const cBorder = REDENTIA_COLORS.border
const cBorderSoft = `${REDENTIA_COLORS.border}80`
const cSurface = REDENTIA_COLORS.surface
const cSurfaceSoft = `${REDENTIA_COLORS.surface}C0`
const cSurfaceFaint = `${REDENTIA_COLORS.surface}80`
const cPrimary = REDENTIA_COLORS.primary
const cPrimaryFaint = `${REDENTIA_COLORS.primary}20`
const cTextMuted = REDENTIA_COLORS.textMuted
const fBody = REDENTIA_FONTS.body
const fDisplay = REDENTIA_FONTS.display
const fMono = REDENTIA_FONTS.mono

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

// --- Inputs ---
const tickersRaw = computed(() => firstString(route.query.tickers) || 'PETR4,VALE3,ITUB4')
const tickerList = computed(() =>
  tickersRaw.value
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 5),
)

const years = computed(() => {
  const n = Number(firstString(route.query.years) || '5')
  return Number.isFinite(n) && n > 0 ? Math.min(n, 20) : 5
})

const reinvest = computed(() => firstString(route.query.reinvest) === 'true')

const durationMs = computed(() => {
  const n = Number(firstString(route.query.duration) || '10000')
  return Number.isFinite(n) && n > 0 ? Math.min(n, 30000) : 10000
})

const autoStart = computed(() => firstString(route.query.auto) !== 'false')

const router = useRouter()

const previewControls = computed(() => [
  { id: 'tickers', label: 'Ativos', type: 'tickers' as const, param: 'tickers', hint: 'Até 5 tickers', value: tickersRaw.value },
  {
    id: 'years',
    label: 'Janela',
    type: 'select' as const,
    param: 'years',
    value: String(years.value),
    options: [
      { label: '1 ano', value: '1' },
      { label: '3 anos', value: '3' },
      { label: '5 anos', value: '5' },
      { label: '10 anos', value: '10' },
      { label: '15 anos', value: '15' },
    ],
  },
  { id: 'reinvest', label: 'Reinvestir dividendos', type: 'toggle' as const, param: 'reinvest', value: String(reinvest.value) },
  {
    id: 'duration',
    label: 'Duração da animação',
    type: 'select' as const,
    param: 'duration',
    value: String(durationMs.value),
    options: [
      { label: '5 segundos', value: '5000' },
      { label: '10 segundos', value: '10000' },
      { label: '15 segundos', value: '15000' },
      { label: '20 segundos', value: '20000' },
    ],
  },
])

function resetControls() {
  router.replace({ query: {} })
}

// --- Page head ---
useHead(() => ({
  title: `Redentia, Growth Race: ${tickerList.value.join(' vs ')}`,
  meta: [
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
    { name: 'viewport', content: 'width=1080, initial-scale=1' },
  ],
  link: [
    { rel: 'stylesheet', href: REDENTIA_GOOGLE_FONT_HREF },
  ],
}))

// --- Data fetch ---
// Pull max-range prices for each ticker and (optionally) its
// dividend history. We trim to `years` on the client to keep
// the SSR cache warm with a single "max" response per ticker.
const apiBase = runtimeConfig.public.apiBaseUrl as string

interface RawPricePoint { price_at: string; market_price: number | string }
interface RawDividend { payment_date: string; rate: string | number }
interface TickerData {
  ticker: string
  name: string
  logo: string | null
}

// Nomes amigaveis para indices que nao tem entrada em /tickers
const INDEX_NAMES: Record<string, string> = {
  IBOV: 'Ibovespa',
  IFIX: 'Indice de FIIs',
  SMLL: 'Small Cap',
  IBRX: 'IBrX 100',
  IDIV: 'Indice Dividendos',
  ICON: 'Indice Consumo',
  IEEX: 'Indice Energia',
  IMAT: 'Indice Materiais',
  IMOB: 'Indice Imobiliario',
  UTIL: 'Indice Utilidade Publica',
}

async function fetchTickerMeta(ticker: string): Promise<TickerData | null> {
  if (isIndex(ticker)) {
    return { ticker, name: INDEX_NAMES[ticker] || ticker, logo: null }
  }
  try {
    const resp = await $fetch<any>(`${apiBase}/tickers/${ticker}`, { method: 'GET' })
    const d = resp?.data || resp
    return {
      ticker: d.symbol || d.ticker || ticker,
      name: d.name || ticker,
      logo: d.logo || null,
    }
  } catch {
    return { ticker, name: ticker, logo: null }
  }
}

// Ativos negociados na B3 sempre contem pelo menos um digito no codigo
// (PETR4, VALE3, PNDL11, BBAS3 etc.). Indices como IBOV, IFIX, SMLL, IBRX
// nao tem digito. O backend usa endpoints separados para cada um.
function isIndex(ticker: string): boolean {
  return !/\d/.test(ticker)
}

async function fetchPrices(ticker: string): Promise<RawPricePoint[]> {
  // Backend supports {ytd, 1mo, 3mo, 6mo, 12mo, 2y, 3y, 4y, 5y, full}.
  // For windows beyond 5 years we ask for `full` (since 1900) and let
  // clampToYears trim down. For 5 or less we pick the smallest mode
  // that covers the request to keep the response light.
  let mode: string
  if (years.value > 5) mode = 'full'
  else if (years.value >= 5) mode = '5y'
  else if (years.value >= 4) mode = '4y'
  else if (years.value >= 3) mode = '3y'
  else if (years.value >= 2) mode = '2y'
  else if (years.value >= 1) mode = '12mo'
  else if (years.value >= 0.5) mode = '6mo'
  else mode = '3mo'
  try {
    const url = isIndex(ticker)
      ? `${apiBase}/indices/${ticker}/prices`
      : `${apiBase}/tickers/${ticker}/prices`
    const resp = await $fetch<any>(url, {
      method: 'GET',
      query: { mode },
    })
    const arr: RawPricePoint[] = resp?.data || []
    return arr.filter((p) => p.price_at && p.market_price != null)
  } catch {
    return []
  }
}

async function fetchDividends(ticker: string): Promise<RawDividend[]> {
  // Indices nao pagam dividendos.
  if (isIndex(ticker)) return []
  try {
    const resp = await $fetch<any>(`${apiBase}/dividends/${ticker}`, { method: 'GET' })
    const arr: RawDividend[] = resp?.data || []
    return arr.filter((d) => d.payment_date && d.rate != null)
  } catch {
    return []
  }
}

// --- Normalization ---
// Each ticker is normalized so that on the first aligned date
// its value is 100. Dividend reinvestment works by tracking
// "shares held": when a dividend lands, we buy more shares at
// that day's price.

interface NormalizedSeries {
  ticker: string
  name: string
  logo: string | null
  color: string
  points: Array<{ date: string; value: number }>
}

function clampToYears(points: RawPricePoint[], yrs: number): RawPricePoint[] {
  if (points.length === 0) return points
  const sorted = [...points].sort((a, b) => a.price_at.localeCompare(b.price_at))
  const last = sorted[sorted.length - 1].price_at
  const lastD = new Date(last)
  const startD = new Date(lastD)
  startD.setFullYear(startD.getFullYear() - yrs)
  const startStr = startD.toISOString().slice(0, 10)
  return sorted.filter((p) => p.price_at >= startStr)
}

function normalizeSeries(
  points: RawPricePoint[],
  dividends: RawDividend[],
  doReinvest: boolean,
): Array<{ date: string; value: number }> {
  if (points.length === 0) return []
  const sorted = [...points].sort((a, b) => a.price_at.localeCompare(b.price_at))
  const first = Number(sorted[0].market_price)
  if (!Number.isFinite(first) || first === 0) return []

  if (!doReinvest) {
    return sorted.map((p) => ({
      date: p.price_at,
      value: (Number(p.market_price) / first) * 100,
    }))
  }

  // Reinvestment path: track shares held, buy more shares on
  // each dividend date at that day's close price.
  const divByDate = new Map<string, number>()
  for (const d of dividends) {
    const date = d.payment_date.slice(0, 10)
    const rate = Number(d.rate)
    if (Number.isFinite(rate)) {
      divByDate.set(date, (divByDate.get(date) || 0) + rate)
    }
  }

  let shares = 100 / first // start with R$100 invested → shares = 100 / price
  const out: Array<{ date: string; value: number }> = []
  for (const p of sorted) {
    const price = Number(p.market_price)
    if (!Number.isFinite(price) || price === 0) continue
    // Apply any dividend paid up to this date (that we haven't yet)
    const div = divByDate.get(p.price_at.slice(0, 10))
    if (div) {
      const cash = shares * div
      shares += cash / price
    }
    out.push({ date: p.price_at, value: shares * price })
  }
  return out
}

const lineColors = [
  REDENTIA_COLORS.primary,
  '#4FC3F7',
  REDENTIA_COLORS.positive,
  '#BA68C8',
  '#FF7043',
]

const { data: seriesData, pending } = await useAsyncData(
  'growth-race',
  async () => {
    const out: NormalizedSeries[] = []
    for (let i = 0; i < tickerList.value.length; i++) {
      const ticker = tickerList.value[i]
      const [meta, prices, dividends] = await Promise.all([
        fetchTickerMeta(ticker),
        fetchPrices(ticker),
        reinvest.value ? fetchDividends(ticker) : Promise.resolve([]),
      ])
      const clipped = clampToYears(prices, years.value)
      const normalized = normalizeSeries(clipped, dividends, reinvest.value)
      out.push({
        ticker,
        name: meta?.name || ticker,
        logo: meta?.logo || null,
        color: lineColors[i] || REDENTIA_COLORS.primary,
        points: normalized,
      })
    }
    return out
  },
  { watch: [tickerList, years, reinvest] },
)

// Align all series to a common date grid (intersection): start
// at the latest "first date" across all tickers so every line
// starts at 100 simultaneously. Any ticker whose history doesn't
// go that far back is dropped.
const alignedSeries = computed<NormalizedSeries[]>(() => {
  const all = seriesData.value || []
  if (all.length === 0) return []

  // Find the latest first-date among all series
  let latestStart = ''
  for (const s of all) {
    if (s.points.length === 0) continue
    if (s.points[0].date > latestStart) latestStart = s.points[0].date
  }
  if (!latestStart) return []

  return all
    .map((s) => {
      if (s.points.length === 0) return null
      const firstIdx = s.points.findIndex((p) => p.date >= latestStart)
      if (firstIdx < 0) return null
      const rebased = s.points.slice(firstIdx)
      if (rebased.length === 0) return null
      const base = rebased[0].value
      if (!Number.isFinite(base) || base === 0) return null
      return {
        ...s,
        points: rebased.map((p) => ({ date: p.date, value: (p.value / base) * 100 })),
      }
    })
    .filter((s): s is NormalizedSeries => s !== null)
})

const totalPoints = computed(() => {
  const s = alignedSeries.value
  if (s.length === 0) return 0
  return Math.max(...s.map((x) => x.points.length))
})

const valueBounds = computed(() => {
  const s = alignedSeries.value
  if (s.length === 0) return { min: 100, max: 100 }
  let min = Infinity
  let max = -Infinity
  for (const line of s) {
    for (const p of line.points) {
      if (p.value < min) min = p.value
      if (p.value > max) max = p.value
    }
  }
  // Add 10% headroom top + 5% bottom
  const range = max - min
  return { min: Math.max(0, min - range * 0.05), max: max + range * 0.1 }
})

// --- Animation ---
const progress = ref(0) // 0..1
let rafHandle: number | null = null
let startTime = 0

function startAnimation() {
  if (totalPoints.value === 0) return
  progress.value = 0
  startTime = performance.now()
  const step = (now: number) => {
    const elapsed = now - startTime
    const t = Math.min(1, elapsed / durationMs.value)
    // Ease-in-out cubic for smoother feel
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    progress.value = eased
    if (t < 1) {
      rafHandle = requestAnimationFrame(step)
    }
  }
  rafHandle = requestAnimationFrame(step)
}

function stopAnimation() {
  if (rafHandle !== null) {
    cancelAnimationFrame(rafHandle)
    rafHandle = null
  }
}

onMounted(() => {
  if (autoStart.value && totalPoints.value > 0) {
    // Tiny delay so the first frame paints the initial state
    setTimeout(() => startAnimation(), 100)
  }
})

onBeforeUnmount(() => stopAnimation())

// --- Chart geometry ---
// SVG viewBox is 1000x1000 (inner area 0-1000). Reserve padding:
//   left: 90 (y-axis labels)
//   right: 90 (logo overflow)
//   top: 50
//   bottom: 90 (x-axis dates)
const CHART = { left: 90, right: 910, top: 60, bottom: 740, width: 820, height: 680 }

function scaleX(idx: number, total: number): number {
  if (total <= 1) return CHART.left
  return CHART.left + (idx / (total - 1)) * CHART.width
}

function scaleY(value: number): number {
  const { min, max } = valueBounds.value
  if (max === min) return CHART.top + CHART.height / 2
  const ratio = (value - min) / (max - min)
  return CHART.top + (1 - ratio) * CHART.height
}

const renderIdx = computed(() => {
  const tp = totalPoints.value
  if (tp === 0) return 0
  return Math.max(1, Math.floor(progress.value * (tp - 1)))
})

// Build path data for each series up to the current progress
interface RenderedLine {
  ticker: string
  name: string
  logo: string | null
  color: string
  path: string
  tipX: number
  tipY: number
  tipValue: number
  lastDate: string
}

const renderedLines = computed<RenderedLine[]>(() => {
  const series = alignedSeries.value
  const tp = totalPoints.value
  const idx = renderIdx.value
  if (series.length === 0 || tp === 0) return []

  return series.map((s) => {
    const sliced = s.points.slice(0, idx + 1)
    if (sliced.length === 0) {
      return { ticker: s.ticker, name: s.name, logo: s.logo, color: s.color, path: '', tipX: CHART.left, tipY: CHART.top, tipValue: 100, lastDate: '' }
    }
    const commands: string[] = []
    sliced.forEach((p, i) => {
      // Map local index i to global index (alignedSeries may have
      // shorter series than tp, so clamp)
      const globalIdx = Math.min(i, tp - 1)
      const x = scaleX(globalIdx, tp)
      const y = scaleY(p.value)
      commands.push(i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `L ${x.toFixed(1)} ${y.toFixed(1)}`)
    })
    const tail = sliced[sliced.length - 1]
    const tipX = scaleX(Math.min(sliced.length - 1, tp - 1), tp)
    const tipY = scaleY(tail.value)
    return {
      ticker: s.ticker,
      name: s.name,
      logo: s.logo,
      color: s.color,
      path: commands.join(' '),
      tipX,
      tipY,
      tipValue: tail.value,
      lastDate: tail.date,
    }
  })
})

// Sort by current value (desc) so bigger winners are on top of
// the legend at the end of the race.
const leaderboard = computed(() =>
  [...renderedLines.value].sort((a, b) => b.tipValue - a.tipValue),
)

// Date currently displayed in the title.
const currentDate = computed(() => {
  const s = alignedSeries.value[0]
  if (!s || s.points.length === 0) return ''
  const idx = Math.min(renderIdx.value, s.points.length - 1)
  return s.points[idx].date
})

function formatDate(iso: string): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase().replace('.', '')
  } catch {
    return iso
  }
}

function formatPercent(value: number): string {
  const pct = value - 100
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

// Y-axis reference lines (5 horizontal grid lines)
const yAxisLines = computed(() => {
  const { min, max } = valueBounds.value
  const step = (max - min) / 4
  return Array.from({ length: 5 }, (_, i) => {
    const v = min + step * i
    return { value: v, y: scaleY(v), label: formatPercent(v) }
  })
})

// Replay button
function replay() {
  stopAnimation()
  startAnimation()
}
</script>

<template>
  <MoleculesCreativePreviewControls
    creative-name="GROWTH RACE"
    :controls="previewControls"
    @reset="resetControls"
  >
  <template #raw-actions>
    <button class="raw-action-btn" @click="replay" title="Reiniciar animação">
      <UIcon name="i-lucide-rotate-cw" class="size-3.5" />
    </button>
  </template>
  <div class="frame">
    <div class="card">
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <img src="/brand/logo-icon.svg" alt="Redentia" class="brand-icon" />
          <span class="brand-name">REDENTIA</span>
        </div>
        <span class="header-right">GROWTH RACE</span>
      </div>

      <!-- Title with animated date -->
      <div class="title-wrap">
        <div class="title-line">
          <span class="title-text">{{ tickerList.join(' · ') }}</span>
        </div>
        <div class="subtitle-line">
          <span class="subtitle">Corrida de valorização</span>
          <span class="dot">·</span>
          <span class="subtitle">{{ reinvest ? 'Com dividendos reinvestidos' : 'Só preço' }}</span>
          <span class="dot">·</span>
          <span class="date-display">{{ formatDate(currentDate) }}</span>
        </div>
      </div>

      <!-- Chart -->
      <div class="chart-wrap">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" class="chart-svg">
          <!-- Horizontal grid lines -->
          <g class="grid">
            <line
              v-for="(gl, idx) in yAxisLines"
              :key="`gl-${idx}`"
              :x1="CHART.left"
              :x2="CHART.left + CHART.width"
              :y1="gl.y"
              :y2="gl.y"
              :stroke="REDENTIA_COLORS.border"
              stroke-width="1"
              stroke-dasharray="2 4"
              opacity="0.4"
            />
            <text
              v-for="(gl, idx) in yAxisLines"
              :key="`gl-label-${idx}`"
              :x="CHART.left - 10"
              :y="gl.y + 4"
              :fill="REDENTIA_COLORS.textMuted"
              text-anchor="end"
              font-size="14"
              font-family="'JetBrains Mono', monospace"
            >
              {{ gl.label }}
            </text>
          </g>

          <!-- Baseline at 100 -->
          <line
            :x1="CHART.left"
            :x2="CHART.left + CHART.width"
            :y1="scaleY(100)"
            :y2="scaleY(100)"
            :stroke="REDENTIA_COLORS.text"
            stroke-width="1.5"
            opacity="0.3"
          />

          <!-- Lines -->
          <g
            v-for="line in renderedLines"
            :key="`line-${line.ticker}`"
          >
            <path
              :d="line.path"
              fill="none"
              :stroke="line.color"
              stroke-width="5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :style="{ filter: `drop-shadow(0 2px 8px ${line.color}80)` }"
            />
          </g>

          <!-- Logo heads (rendered on top of all lines) -->
          <g v-for="line in renderedLines" :key="`head-${line.ticker}`">
            <circle
              :cx="line.tipX"
              :cy="line.tipY"
              r="28"
              :fill="REDENTIA_COLORS.background"
              :stroke="line.color"
              stroke-width="4"
            />
            <image
              v-if="line.logo"
              :x="line.tipX - 22"
              :y="line.tipY - 22"
              width="44"
              height="44"
              :href="line.logo"
              clip-path="circle(22)"
              preserveAspectRatio="xMidYMid slice"
            />
            <text
              v-else
              :x="line.tipX"
              :y="line.tipY + 6"
              :fill="line.color"
              text-anchor="middle"
              font-size="16"
              font-weight="700"
              font-family="'Inter', sans-serif"
            >
              {{ line.ticker.slice(0, 4) }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Leaderboard -->
      <div class="leaderboard">
        <div
          v-for="(line, idx) in leaderboard"
          :key="`leader-${line.ticker}`"
          class="leader-row"
        >
          <span class="leader-rank">{{ idx + 1 }}º</span>
          <span class="leader-dot" :style="{ backgroundColor: line.color }" />
          <span class="leader-ticker">{{ line.ticker }}</span>
          <span class="leader-sep">·</span>
          <span class="leader-name">{{ line.name }}</span>
          <span class="leader-spacer" />
          <span
            class="leader-value"
            :style="{ color: line.tipValue >= 100 ? REDENTIA_COLORS.positive : REDENTIA_COLORS.negative }"
          >
            {{ formatPercent(line.tipValue) }}
          </span>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <img src="/brand/logo-full.svg" alt="Redentia" class="footer-logo" />
        <div class="footer-brand">
          <span class="footer-text">redentia.com.br/creative</span>
        </div>
      </div>
    </div>
  </div>
  </MoleculesCreativePreviewControls>
</template>

<style scoped>
/* See asset-spotlight.vue comment, :global() rules leak across the
   dev server and break navigation. The .frame wrapper below already
   centers the card with its own background and font context. */

.frame {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.card {
  position: relative;
  width: 1080px;
  height: 1080px;
  max-width: 100%;
  aspect-ratio: 1 / 1;
  background:
    radial-gradient(circle at 20% 10%, rgba(245, 166, 35, 0.12) 0%, transparent 55%),
    radial-gradient(circle at 80% 90%, rgba(245, 166, 35, 0.08) 0%, transparent 55%),
    v-bind(cBg);
  color: v-bind(cText);
  border: 1px solid v-bind(cBorder);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 48px 56px;
  box-sizing: border-box;
  font-family: v-bind(fBody);
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: v-bind(fMono);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: v-bind(cTextMuted);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 28px;
  height: 28px;
}

.brand-name {
  color: v-bind(cText);
  font-weight: 700;
}

.header-right {
  color: v-bind(cPrimary);
  font-weight: 600;
}

/* Title */
.title-wrap {
  margin-top: 24px;
}

.title-line {
  font-family: v-bind(fDisplay);
  font-size: 80px;
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: v-bind(cText);
}

.title-text {
  color: v-bind(cText);
}

.subtitle-line {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: v-bind(fMono);
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: v-bind(cTextMuted);
}

.date-display {
  color: v-bind(cPrimary);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  min-width: 110px;
}

.dot {
  opacity: 0.4;
}

/* Chart */
.chart-wrap {
  flex: 1;
  margin-top: 20px;
  margin-bottom: 10px;
  min-height: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.chart-svg {
  width: 100%;
  height: 100%;
  max-height: 620px;
}

/* Leaderboard */
.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
  margin-top: 8px;
  background: v-bind(cSurfaceSoft);
  border: 1px solid v-bind(cBorder);
  border-radius: 12px;
}

.leader-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-family: v-bind(fBody);
}

.leader-rank {
  font-family: v-bind(fMono);
  font-size: 13px;
  color: v-bind(cTextMuted);
  min-width: 30px;
  font-weight: 700;
}

.leader-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.leader-ticker {
  font-weight: 800;
  letter-spacing: 0.02em;
  color: v-bind(cText);
}

.leader-sep {
  color: v-bind(cBorder);
}

.leader-name {
  color: v-bind(cTextMuted);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leader-spacer {
  flex: 1;
}

.leader-value {
  font-family: v-bind(fMono);
  font-weight: 700;
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}

/* Footer */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid v-bind(cBorderSoft);
}

.footer-logo {
  height: 28px;
  width: auto;
  opacity: 0.8;
}

.footer-brand {
  font-family: v-bind(fMono);
  font-size: 12px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: v-bind(cTextMuted);
}

.replay-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid v-bind(cBorder);
  background: v-bind(cSurfaceFaint);
  color: v-bind(cPrimary);
  cursor: pointer;
  transition: all 0.2s;
}

.replay-btn:hover {
  background: v-bind(cPrimaryFaint);
  border-color: v-bind(cPrimary);
  transform: rotate(-45deg);
}

.replay-icon {
  width: 18px;
  height: 18px;
}

/* Responsive: scale down on smaller screens */
@media (max-width: 1200px) {
  .card {
    width: 100%;
    max-width: 900px;
    height: auto;
    padding: 36px 40px;
  }
  .title-line {
    font-size: 60px;
  }
}
</style>

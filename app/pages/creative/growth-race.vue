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
// Two uses of `?auto=`:
//   - 'false'         → don't auto-start the animation (legacy)
//   - 'best-week-N'   → pull the N biggest weekly gainers from /api/weekly-movers
//   - 'worst-week-N'  → ditto, losers
// If neither matches we fall back to the legacy behaviour (tickers from
// the query string).
const autoParam = computed(() => (firstString(route.query.auto) || '').toLowerCase())
const autoMovers = computed<null | { side: 'best' | 'worst'; limit: number }>(() => {
  const m = autoParam.value.match(/^(best|worst)-week-(\d+)$/)
  if (!m) return null
  return { side: m[1] as 'best' | 'worst', limit: Math.max(1, Math.min(5, parseInt(m[2]!, 10))) }
})
const autoStart = computed(() => autoParam.value !== 'false')

const tickersRaw = computed(() => firstString(route.query.tickers) || 'PETR4,VALE3,ITUB4')

// Fetch the dynamic movers list when `autoMovers` is active. Empty result
// when it's not — we short-circuit with default + [], so server-side
// prerender doesn't waste a request.
const apiBaseUrl = runtimeConfig.public.apiBaseUrl as string
const { data: dynamicMovers } = await useAsyncData(
  'growth-race-auto-movers',
  async () => {
    const m = autoMovers.value
    if (!m) return [] as string[]
    try {
      const resp = await $fetch<{ best?: any[]; worst?: any[] }>(`${apiBaseUrl}/weekly-movers`, {
        method: 'GET',
        query: { side: m.side, limit: m.limit },
      })
      const rows = m.side === 'best' ? resp?.best : resp?.worst
      return Array.isArray(rows) ? rows.map((r) => String(r.ticker).toUpperCase()).slice(0, m.limit) : []
    } catch {
      return []
    }
  },
  { server: true, default: () => [] as string[], watch: [autoMovers] },
)

const tickerList = computed(() => {
  // When `auto=best-week-N` resolved to at least one ticker, use that.
  // Otherwise fall back to whatever's in ?tickers= (or the hardcoded
  // default, matching the pre-refactor behaviour).
  if (autoMovers.value && dynamicMovers.value && dynamicMovers.value.length > 0) {
    return dynamicMovers.value.slice(0, 5)
  }
  return tickersRaw.value
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 5)
})

const years = computed(() => {
  const n = Number(firstString(route.query.years) || '5')
  return Number.isFinite(n) && n > 0 ? Math.min(n, 20) : 5
})

const reinvest = computed(() => firstString(route.query.reinvest) === 'true')

const durationMs = computed(() => {
  const n = Number(firstString(route.query.duration) || '10000')
  return Number.isFinite(n) && n > 0 ? Math.min(n, 30000) : 10000
})

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
// Tint the frame green (best) or red (worst) so the ambient glow + the
// headline `em` match what the race is about. Falls back to green (neutral
// positive) when the caller isn't using an auto preset.
const themeClass = computed<'positive' | 'negative'>(() => {
  if (autoMovers.value?.side === 'worst') return 'negative'
  return 'positive'
})

// Same company-name sanitizer the ranking creative uses — trims B3 padding,
// drops the listing segment/share-class suffix, and title-cases so the
// card reads like a brand name instead of raw DB string.
function cleanLeaderName(raw: string | null | undefined): string {
  if (!raw) return ''
  const collapsed = raw.replace(/\s+/g, ' ').trim()
  const noSegment = collapsed.replace(/\s+(NM2?|N1|N2|MA|MB|DR3|M[AB])$/i, '')
  const noClass = noSegment.replace(/\s+(ON|PN[AB]?|UNT)$/i, '')
  const lower = noClass.toLowerCase()
  return lower
    .split(' ')
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

// Dynamic title so automations using ?auto=worst-week-2 get the right
// caption overlay ("Maiores baixas da semana · últimos 10 anos") instead
// of the generic "Growth Race", matching the Blade's behaviour before
// this was consolidated to the Vue side.
const titleOverlay = computed(() => {
  if (autoMovers.value?.side === 'best') return `Maiores altas da semana · últimos ${years.value} anos`
  if (autoMovers.value?.side === 'worst') return `Maiores baixas da semana · últimos ${years.value} anos`
  return tickerList.value.join(' · ')
})
// Split the title so the tail gets rendered in green/red italic as the
// second line. Prefer splitting at " · "; fall back to the last word.
// The tail omits the leading "· " — we put head and tail on two lines
// with <br>, so a bullet separator would feel stray.
const titleParts = computed(() => {
  const t = titleOverlay.value
  if (t.includes(' · ')) {
    const [head, ...rest] = t.split(' · ')
    return { head, tail: rest.join(' · ') }
  }
  const words = t.split(' ')
  const tail = words.pop() ?? ''
  return { head: words.join(' '), tail }
})
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

  // Frame-exact recording API used by VideoRecorderService on the
  // backend. Instead of racing against requestAnimationFrame, the
  // recorder calls `window.__setProgress(i/(total-1))` once per frame,
  // takes a screenshot, then advances. Stopping the rAF loop is
  // mandatory — if it's still running in parallel, the captured
  // `progress.value` flickers between the stepped value and whatever
  // the animation loop is interpolating.
  if (typeof window !== 'undefined') {
    ;(window as any).__setProgress = (p: number) => {
      stopAnimation()
      const clamped = Math.max(0, Math.min(1, Number(p) || 0))
      progress.value = clamped
    }
    // Signal readiness for the recorder's warmup wait. We consider the
    // page ready when series data settled AND at least one series has
    // enough points to animate.
    const markReady = () => {
      if (totalPoints.value > 0) (window as any).__raceReady = true
    }
    markReady()
    // In case data is still loading, re-check on series updates.
    watch(seriesData, markReady)
    // Hard ceiling to avoid hanging the recorder on a broken fetch.
    setTimeout(() => { (window as any).__raceReady = true }, 4000)
  }
})

onBeforeUnmount(() => stopAnimation())

// --- Chart geometry ---
// viewBox matches the chart-wrap container 1-to-1 (1080×740) so there
// are no empty side margins. CHART.left/right are aligned with the
// status bar's 48px padding — same x position where the "B3 · CORRIDA"
// label begins and where "REDENT.IA" ends on the top chrome.
const CHART = { left: 48, right: 1032, top: 40, bottom: 680, width: 984, height: 640 }

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
  areaPath: string
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
      return { ticker: s.ticker, name: s.name, logo: s.logo, color: s.color, path: '', areaPath: '', tipX: CHART.left, tipY: CHART.top, tipValue: 100, lastDate: '' }
    }
    const commands: string[] = []
    let firstX = CHART.left
    let lastX = CHART.left
    sliced.forEach((p, i) => {
      // Map local index i to global index (alignedSeries may have
      // shorter series than tp, so clamp)
      const globalIdx = Math.min(i, tp - 1)
      const x = scaleX(globalIdx, tp)
      const y = scaleY(p.value)
      if (i === 0) firstX = x
      lastX = x
      commands.push(i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `L ${x.toFixed(1)} ${y.toFixed(1)}`)
    })
    const tail = sliced[sliced.length - 1]
    const tipX = scaleX(Math.min(sliced.length - 1, tp - 1), tp)
    const tipY = scaleY(tail.value)
    // Area path: same line but closed back to the chart bottom, used for
    // the colored gradient fill beneath each series.
    const chartBottom = CHART.top + CHART.height
    const areaPath = commands.join(' ')
      + ` L ${lastX.toFixed(1)} ${chartBottom}`
      + ` L ${firstX.toFixed(1)} ${chartBottom} Z`
    return {
      ticker: s.ticker,
      name: s.name,
      logo: s.logo,
      color: s.color,
      path: commands.join(' '),
      areaPath,
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

// Year markers: linhas verticais no primeiro ponto de cada ano dentro
// do range animado. O ano "atual" (onde a animação chegou no momento
// do render) é flagado com `active` pra ganhar destaque amber.
const yearMarkers = computed(() => {
  const s = alignedSeries.value[0]
  const total = totalPoints.value
  if (!s || s.points.length === 0 || total === 0) return []
  const markers: { x: number; label: string; globalIdx: number; active: boolean }[] = []
  let lastYear = ''
  s.points.forEach((p, i) => {
    const year = p.date.slice(0, 4)
    if (year !== lastYear) {
      lastYear = year
      // Global index (capped to total - 1) → converte pra X coordinate
      // usando a mesma escala das séries.
      const globalIdx = Math.min(i, total - 1)
      markers.push({
        x: scaleX(globalIdx, total),
        label: year,
        globalIdx,
        active: false,
      })
    }
  })
  // O ano "ativo" é o maior cujo globalIdx <= renderIdx atual. Setar
  // `active: true` só nele pra ganhar destaque amber.
  const cur = renderIdx.value
  let activeIdx = -1
  for (let i = 0; i < markers.length; i++) {
    if (markers[i].globalIdx <= cur) activeIdx = i
    else break
  }
  if (activeIdx >= 0) markers[activeIdx].active = true
  return markers
})

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
  <div class="frame" :class="themeClass">
    <div class="card">
      <!-- Status bar (mesma forma do ranking). -->
      <div class="statusbar">
        <span class="sb-live">
          <span class="sb-dot"></span>
          <span>B3 · CORRIDA · {{ years }} ANOS</span>
        </span>
        <div class="sb-right">
          <span class="sb-brand">REDENT<span class="sb-brand-accent">.IA</span></span>
        </div>
      </div>

      <!-- Hero: tickers separados por "x" (italic accent) + data. -->
      <div class="hero">
        <h1 class="hero-title">
          <template v-for="(t, i) in tickerList" :key="t">
            <em v-if="i > 0" class="sep">x</em>
            <span class="tk">{{ t }}</span>
          </template>
        </h1>
        <div class="hero-sub">{{ formatDate(currentDate) }}</div>
      </div>

      <!-- Chart -->
      <div class="chart-wrap">
        <svg viewBox="0 0 1080 740" preserveAspectRatio="xMidYMid meet" class="chart-svg">
          <defs>
            <!-- Sem feGaussianBlur aqui — filter SVG é lento em
                 páginas animadas. O efeito "neon" vem do CSS
                 drop-shadow aplicado via style em cada <path>. -->
            <!-- Area fill: gradient que desce pra transparente, discreto. -->
            <linearGradient
              v-for="line in renderedLines"
              :key="`grad-${line.ticker}`"
              :id="`grad-${line.ticker}`"
              x1="0" y1="0" x2="0" y2="1"
            >
              <stop offset="0%" :stop-color="line.color" stop-opacity="0.28" />
              <stop offset="60%" :stop-color="line.color" stop-opacity="0.06" />
              <stop offset="100%" :stop-color="line.color" stop-opacity="0" />
            </linearGradient>
            <!-- Gradient sutil pra labels do eixo horizontal. -->
            <linearGradient id="x-fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="rgba(255,255,255,0.4)" />
              <stop offset="100%" stop-color="rgba(255,255,255,0.4)" />
            </linearGradient>
          </defs>

          <!-- Year markers — linhas verticais discretas pra cada ano.
               Label sempre embaixo; o ano "ativo" (em que a animação
               está agora) ganha uma segunda linha animada crescendo
               do bottom até o topo do chart, com glow amber. -->
          <g>
            <g v-for="m in yearMarkers" :key="`year-${m.label}`">
              <!-- Pill de background suave atrás do label do ano ativo,
                   pra dar destaque sem chamar atenção demais. -->
              <rect
                v-if="m.active"
                :x="m.x - 42"
                :y="CHART.top + CHART.height + 14"
                width="84"
                height="36"
                rx="18"
                fill="rgba(255,255,255,0.08)"
                stroke="rgba(255,255,255,0.18)"
                stroke-width="1"
              />
              <!-- Label do ano embaixo do chart. -->
              <text
                :x="m.x"
                :y="CHART.top + CHART.height + 38"
                :fill="m.active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.42)'"
                text-anchor="middle"
                font-size="19"
                font-family="'JetBrains Mono', monospace"
                :font-weight="m.active ? 700 : 500"
                letter-spacing="0.12em"
              >
                {{ m.label }}
              </text>
            </g>
          </g>

          <!-- Area fills (gradient). Empilhadas com mix-blend-mode
               multiplicado pra que sobreposições não fiquem chapadas. -->
          <g style="mix-blend-mode: screen;">
            <path
              v-for="line in renderedLines"
              :key="`area-${line.ticker}`"
              :d="line.areaPath"
              :fill="`url(#grad-${line.ticker})`"
              stroke="none"
            />
          </g>

          <!-- Linhas — stroke 4.5px com drop-shadow CSS (hardware-
               accelerated) em vez de feGaussianBlur SVG (lento). -->
          <g>
            <path
              v-for="line in renderedLines"
              :key="`line-${line.ticker}`"
              :d="line.path"
              fill="none"
              :stroke="line.color"
              stroke-width="4.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :style="{ filter: `drop-shadow(0 0 4px ${line.color})` }"
            />
          </g>

          <!-- Marcador de início (círculo colorido sobre a baseline,
               posição do primeiro frame de cada série). -->
          <g>
            <circle
              v-for="line in renderedLines"
              :key="`start-${line.ticker}`"
              :cx="CHART.left"
              :cy="scaleY(100)"
              r="5"
              :fill="line.color"
              opacity="0.9"
            />
          </g>

          <!-- Logo head na ponta da linha (uma vez por série). -->
          <g v-for="line in renderedLines" :key="`head-${line.ticker}`">
            <circle
              :cx="line.tipX"
              :cy="line.tipY"
              r="28"
              :fill="REDENTIA_COLORS.background"
              :stroke="line.color"
              stroke-width="3"
              style="filter: drop-shadow(0 0 8px currentColor);"
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

      <!-- Leaderboard — chips embaixo do chart, com logo + ticker + %. -->
      <div class="leaderboard">
        <div
          v-for="(line, idx) in leaderboard"
          :key="`leader-${line.ticker}`"
          class="lb-card"
          :class="[line.tipValue >= 100 ? 'up' : 'down', idx === 0 ? 'lb-card-hero' : '']"
        >
          <div class="lb-logo-wrap" :style="{ borderColor: line.color }">
            <img
              v-if="line.logo"
              class="lb-logo"
              :src="line.logo"
              :alt="line.ticker"
            />
            <span
              v-else
              class="lb-logo-fallback"
              :style="{ backgroundColor: line.color, color: '#0A0B0E' }"
            >{{ line.ticker.slice(0, 3) }}</span>
          </div>
          <span class="lb-ticker">{{ line.ticker }}</span>
          <div class="lb-value">
            <span class="lb-sign">{{ line.tipValue >= 100 ? '+' : '−' }}</span>
            <span class="lb-num">{{ Math.abs(line.tipValue - 100).toFixed(2) }}</span>
            <span class="lb-unit">%</span>
          </div>
        </div>
      </div>

      <!-- Footer (unified with ranking/treemap) -->
      <div class="grfooter">
        <span class="fbrand">REDENT<span class="fdot">.IA</span></span>
        <span class="fsep">·</span>
        <span>DADOS B3</span>
        <span class="fsep">·</span>
        <span>{{ new Date().toLocaleDateString('pt-BR').toUpperCase() }}</span>
        <span class="fright">redentia.com.br</span>
      </div>
    </div>
  </div>
  </MoleculesCreativePreviewControls>
</template>

<style scoped>
/* See asset-spotlight.vue comment, :global() rules leak across the
   dev server and break navigation. The .frame wrapper below already
   centers the card with its own background and font context. */

/* Frame anchored ao top-left, sem min-height nem flex-center. Quando a
   page é servida dentro do preview wrapper (MoleculesCreativePreviewControls),
   o card precisa começar em y=0 pro scale 0.55 caber no canvas-wrap
   de 594px de altura. Centralização no viewport já é feita pelo preview. */
.frame {
  width: 1080px;
  height: 1080px;
  position: relative;
}

.card {
  position: relative;
  width: 1080px;
  height: 1080px;
  max-width: 100%;
  aspect-ratio: 1 / 1;
  background: #0A0B0E;
  color: #FFFFFF;
  border-radius: 0;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* Ambient — grid + side glow + top amber, igual ao ranking. */
.card::before {
  content: ''; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
}
.frame.positive .card::after {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 90% 10%, rgba(245,166,35,0.22) 0%, transparent 55%),
    radial-gradient(ellipse at 5% 90%, rgba(0,211,149,0.35) 0%, transparent 55%);
  pointer-events: none;
  z-index: 0;
}
.frame.negative .card::after {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 10% 10%, rgba(245,166,35,0.22) 0%, transparent 55%),
    radial-gradient(ellipse at 95% 90%, rgba(255,71,71,0.35) 0%, transparent 55%);
  pointer-events: none;
  z-index: 0;
}

/* Status bar — enxuta pra liberar espaço vertical pro chart. */
.statusbar {
  position: absolute; top: 0; left: 0; right: 0; height: 54px;
  display: flex; align-items: center;
  padding: 0 48px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(255,255,255,0.78);
  z-index: 3;
}
.sb-live { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; }
.sb-dot { width: 9px; height: 9px; border-radius: 50%; background: #F5A623; box-shadow: 0 0 12px rgba(245,166,35,0.8); }
.sb-right { margin-left: auto; }
.sb-brand { color: #FFFFFF; font-weight: 700; letter-spacing: 0.22em; font-size: 17px; }
.sb-brand-accent { color: #F5A623; }

/* Hero: compacto, afastado do status bar pra dar respiro visual. */
.hero {
  position: absolute; top: 140px; left: 56px; right: 56px;
  text-align: center;
  z-index: 2;
}
.hero-title {
  font-family: 'Instrument Serif', serif;
  font-size: 104px; line-height: 0.94; letter-spacing: -0.03em;
  font-weight: 400; color: #FFFFFF;
  margin: 0;
  display: inline-flex; align-items: baseline; gap: 22px; justify-content: center;
}
.hero-title .tk { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 96px; letter-spacing: -0.02em; }
.hero-title .sep { font-style: italic; font-weight: 400; }
.frame.positive .hero-title .sep { color: #00D395; }
.frame.negative .hero-title .sep { color: #FF4747; }
.hero-sub {
  display: block;
  margin-top: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 22px; font-weight: 300;
  letter-spacing: 0.28em;
  color: rgba(255,255,255,0.62);
  font-variant-numeric: tabular-nums;
  text-transform: uppercase;
}


/* Chart area — edge-to-edge, começa logo abaixo do hero + subtítulo. */
.chart-wrap {
  position: absolute;
  top: 320px;
  left: 0;
  right: 0;
  bottom: 150px;
  z-index: 1;
  display: flex;
  align-items: stretch;
  justify-content: center;
}
.chart-svg { width: 100%; height: 100%; }

/* Leaderboard — chips com logo, ticker e valor, posicionados logo acima
   do footer pra fechar a composição com a legenda identificadora. */
.leaderboard {
  position: absolute;
  left: 48px;
  right: 48px;
  bottom: 72px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 14px;
  z-index: 2;
}
.lb-card {
  display: flex; align-items: center;
  padding: 10px 22px 10px 10px;
  gap: 14px;
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 999px;
  background: rgba(255,255,255,0.03);
}
.lb-card.lb-card-hero,
.lb-card.down.lb-card-hero { box-shadow: none; background: rgba(255,255,255,0.05); }
.lb-logo-wrap {
  flex: 0 0 auto;
  width: 40px; height: 40px; border-radius: 50%;
  border: 2px solid;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.lb-logo {
  width: 100%; height: 100%; border-radius: 50%;
  object-fit: cover;
}
.lb-logo-fallback {
  font-family: 'Inter', sans-serif;
  font-size: 11px; font-weight: 800;
  letter-spacing: 0.02em;
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}
.lb-ticker {
  font-family: 'Inter', sans-serif;
  font-size: 24px; font-weight: 800;
  color: #FFFFFF; letter-spacing: 0.01em; line-height: 1;
}
.lb-card-hero .lb-ticker { font-size: 24px; }
.lb-value {
  display: flex; align-items: baseline;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin-left: 6px;
}
.lb-sign {
  font-family: 'Inter', sans-serif;
  font-size: 20px; font-weight: 700;
  margin-right: 2px;
}
.lb-num {
  font-family: 'Inter', sans-serif;
  font-size: 26px; font-weight: 800;
  letter-spacing: -0.01em;
}
.lb-card-hero .lb-num { font-size: 26px; }
.lb-unit {
  font-family: 'Inter', sans-serif;
  font-size: 15px; font-weight: 700;
  margin-left: 2px;
  opacity: 0.7;
}
.lb-card.up .lb-value { color: #00D395; }
.lb-card.down .lb-value { color: #FF4747; }

/* Footer (unified com ranking). */
.grfooter {
  position: absolute; bottom: 0; left: 0; right: 0; height: 54px;
  display: flex; align-items: center;
  padding: 0 48px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.58);
  z-index: 3;
}
.fbrand { color: #FFFFFF; font-weight: 700; letter-spacing: 0.22em; font-size: 16px; }
.fbrand .fdot { color: #F5A623; }
.fsep { display: inline-block; width: 12px; height: 1px; background: rgba(255,255,255,0.28); margin: 0 14px; }
.fright { margin-left: auto; color: #FFFFFF; font-weight: 600; font-size: 15px; }

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

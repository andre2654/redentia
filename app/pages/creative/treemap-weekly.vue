<script setup lang="ts">
definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// ============================================================
// Weekly treemap creative — 1080x1080, STACKED VERTICAL.
//
// Mobile-first redesign (Apr 2026): the old side-by-side panels
// collapsed to ~180px wide on Instagram feed thumbnails, making
// tickers unreadable. This version stacks gainers on top and
// losers below so each panel gets the full 1000px width and ~300px
// height — cells come out 2-3× bigger at the same cell count.
//
// Visual language matches the race/ranking creatives: centered
// Instrument Serif hero title, compact status bar with amber live
// dot, ambient glow (amber top + dual green/red bottom) and mono
// footer.
//
// Data: GET /api/weekly-movers?side=both&limit=N — same endpoint
// the server-rendered Blade consumes, so preview and published
// post always agree on the numbers.
// ============================================================

import { REDENTIA_GOOGLE_FONT_HREF } from '~/utils/redentiaCreativeColors'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

const perSide = computed(() => {
  const n = Number(firstString(route.query.per_side) || '10')
  return Number.isFinite(n) && n > 0 ? Math.min(20, Math.max(1, Math.floor(n))) : 10
})

const minVolume = computed(() => {
  const n = Number(firstString(route.query.min_volume) || '10000000')
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 10_000_000
})

const title = computed(() => firstString(route.query.title) || 'Raio-X da semana')

const router = useRouter()
const previewControls = computed(() => [
  {
    id: 'per_side',
    label: 'Cells por painel',
    type: 'select' as const,
    param: 'per_side',
    value: String(perSide.value),
    options: [
      { label: '5 cada', value: '5' },
      { label: '8 cada', value: '8' },
      { label: '10 cada', value: '10' },
      { label: '15 cada', value: '15' },
      { label: '20 cada', value: '20' },
    ],
  },
  {
    id: 'min_volume',
    label: 'Volume mínimo (R$)',
    type: 'select' as const,
    param: 'min_volume',
    value: String(minVolume.value),
    options: [
      { label: 'R$ 1M', value: '1000000' },
      { label: 'R$ 5M', value: '5000000' },
      { label: 'R$ 10M', value: '10000000' },
      { label: 'R$ 50M', value: '50000000' },
    ],
  },
  { id: 'title', label: 'Título', type: 'text' as const, param: 'title', value: title.value },
])
function resetControls() {
  router.replace({ query: {} })
}

useHead(() => ({
  title: 'Redentia · Raio-X da semana',
  meta: [
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
    { name: 'viewport', content: 'width=1080, initial-scale=1' },
  ],
  link: [{ rel: 'stylesheet', href: REDENTIA_GOOGLE_FONT_HREF }],
}))

// ---------- Data ----------
interface MoverRow {
  ticker: string
  pct_week: number
  last_price: number
  volume: number
  name?: string | null
  logo?: string | null
}
interface MoversResponse {
  best: MoverRow[]
  worst: MoverRow[]
  window: { start: string | null; end: string | null }
}

const apiBase = runtimeConfig.public.apiBaseUrl as string
// Volume fallback ladder — if the configured min_volume doesn't yield
// `perSide` items on both sides, progressively relax until we have 5+5.
// Matches the backend behavior (InternalCreativeController) so preview
// and generated image always agree on count.
const volumeLadder = computed<number[]>(() => {
  const steps = [minVolume.value, 1_000_000, 100_000, 0]
  return Array.from(new Set(steps.filter(v => v <= minVolume.value || v === 0)))
    .sort((a, b) => b - a)
})

async function fetchSide(side: 'best' | 'worst', signCheck: (p: number) => boolean): Promise<MoverRow[]> {
  for (const vol of volumeLadder.value) {
    const resp = await $fetch<MoversResponse>(`${apiBase}/weekly-movers`, {
      method: 'GET',
      query: { side: 'both', limit: 100, min_volume: vol },
    })
    const list = ((side === 'best' ? resp.best : resp.worst) ?? []).filter(r => signCheck(r.pct_week))
    if (list.length >= perSide.value) return list.slice(0, perSide.value)
  }
  return []
}

const { data, pending, error } = await useAsyncData<MoversResponse>(
  'weekly-movers-treemap',
  async () => {
    // We fire both sides in parallel, each with its own volume ladder.
    // The `window` info is shared — it only depends on market_prices, so
    // grab it from the first-ladder-step request of the gainers branch.
    const [baseResp, gainers, losers] = await Promise.all([
      $fetch<MoversResponse>(`${apiBase}/weekly-movers`, {
        method: 'GET',
        query: { side: 'both', limit: 1, min_volume: 0 },
      }),
      fetchSide('best', (p) => p > 0),
      fetchSide('worst', (p) => p < 0),
    ])
    return { best: gainers, worst: losers, window: baseResp.window }
  },
  { server: true, default: () => ({ best: [], worst: [], window: { start: null, end: null } }), watch: [perSide, minVolume] }
)

// ---------- Squarified treemap ----------
interface Box { x: number; y: number; w: number; h: number }
interface WeightedItem<T> { value: number; data: T }
interface Placed<T> extends Box { item: T }

function squarify<T>(raw: WeightedItem<T>[], box: Box): Placed<T>[] {
  if (raw.length === 0 || box.w <= 0 || box.h <= 0) return []
  const total = raw.reduce((s, i) => s + i.value, 0)
  if (total <= 0) return []
  const scale = (box.w * box.h) / total
  const items = raw
    .map((i) => ({ value: i.value * scale, data: i.data }))
    .sort((a, b) => b.value - a.value)
  const out: Placed<T>[] = []
  step(items, [], { ...box }, out)
  return out
}

function step<T>(items: WeightedItem<T>[], row: WeightedItem<T>[], box: Box, out: Placed<T>[]) {
  const w = Math.min(box.w, box.h)
  if (w <= 0) return
  if (items.length === 0) { layoutRow(row, box, out); return }
  const nextRow = [...row, items[0]!]
  if (row.length === 0 || worst(row, w) >= worst(nextRow, w)) {
    step(items.slice(1), nextRow, box, out)
  } else {
    layoutRow(row, box, out)
    const rowValue = row.reduce((s, i) => s + i.value, 0)
    const slab = rowValue / w
    const newBox: Box = box.w <= box.h
      ? { x: box.x, y: box.y + slab, w: box.w, h: box.h - slab }
      : { x: box.x + slab, y: box.y, w: box.w - slab, h: box.h }
    step(items, [], newBox, out)
  }
}

function layoutRow<T>(row: WeightedItem<T>[], box: Box, out: Placed<T>[]) {
  if (row.length === 0) return
  const rowValue = row.reduce((s, i) => s + i.value, 0)
  if (rowValue <= 0) return
  const w = Math.min(box.w, box.h)
  const slab = rowValue / w
  let offset = 0
  if (box.w <= box.h) {
    for (const it of row) {
      const cellW = it.value / slab
      out.push({ x: box.x + offset, y: box.y, w: cellW, h: slab, item: it.data })
      offset += cellW
    }
  } else {
    for (const it of row) {
      const cellH = it.value / slab
      out.push({ x: box.x, y: box.y + offset, w: slab, h: cellH, item: it.data })
      offset += cellH
    }
  }
}

function worst(row: WeightedItem<any>[], shortSide: number): number {
  if (row.length === 0) return Infinity
  const values = row.map((r) => r.value)
  const sum = values.reduce((s, v) => s + v, 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (sum <= 0 || min <= 0) return Infinity
  const s2 = sum * sum
  const w2 = shortSide * shortSide
  return Math.max((w2 * max) / s2, s2 / (w2 * min))
}

// ---------- Panel dimensions ----------
// Stacked vertical: each panel takes the full 1000×320 block. We pack
// the two panels as close as possible to the hero subtitle so the
// heatmap dominates the frame instead of floating below empty space.
const PANEL_W = 1000
const PANEL_H = 320

function toCells(items: MoverRow[]) {
  // Weight is |pct|+floor so even tiny movers (like B3SA3 at -0.10%)
  // claim a readable cell. The floor dampens the dominance of the top
  // mover — a +12% gainer is no longer 20× bigger than a +0.5% cell,
  // just ~2× bigger. Social-media tradeoff: lose some "holy cow that
  // one's huge" drama in exchange for every ticker being legible.
  const floor = 4
  const weighted: WeightedItem<MoverRow>[] = items.map((it) => ({ value: Math.abs(it.pct_week) + floor, data: it }))
  return squarify(weighted, { x: 0, y: 0, w: PANEL_W, h: PANEL_H })
}

// data.best / data.worst are already filtered + sliced by fetchSide()
// — it walks the volume ladder until it has `perSide` items on each
// side (or gives up at volume=0). No extra processing needed here.
const gainerCells = computed(() => toCells(data.value?.best ?? []))
const loserCells = computed(() => toCells(data.value?.worst ?? []))

// Color intensity scales with |pct|. Alpha ramps 0.42 → 1 across
// the typical B3 weekly range (0% to 15%+), so a heated cell really
// pops against a cooler neighbor.
function cellBg(positive: boolean, pct: number): string {
  const abs = Math.abs(pct)
  let alpha = 0.45
  if (abs >= 15) alpha = 1
  else if (abs >= 8) alpha = 0.9
  else if (abs >= 4) alpha = 0.78
  else if (abs >= 2) alpha = 0.65
  else if (abs >= 1) alpha = 0.54
  return positive
    ? `rgba(0, 211, 149, ${alpha})`
    : `rgba(255, 71, 71, ${alpha})`
}

// Type sizes scale with cell short side, same logic as before but
// bumped for the bigger canvas — the minimum legible size is larger
// because the panel is wider.
function sizePx(cell: Placed<MoverRow>) {
  const base = Math.min(cell.w, cell.h)
  return Math.max(14, Math.min(42, Math.round(base * 0.22)))
}
function pctSize(sym: number) { return Math.max(11, Math.round(sym * 0.7)) }
function showPct(c: Placed<MoverRow>) { return c.w >= 70 && c.h >= 56 }
function showPrice(c: Placed<MoverRow>) { return c.w >= 120 && c.h >= 88 }

function fmtPeriod(iso: string | null) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
function fmtShortDate(iso: string | null) {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}
function fmtBRL(value: number) {
  return 'R$ ' + value.toFixed(2).replace('.', ',')
}
const today = computed(() => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
})

// Kept for potential future use — the panel-head "+X.XX%" chip was
// removed per user feedback, but if we ever want it back these are
// already wired up.
const gainerTopPct = computed(() => {
  const leader = data.value?.best?.[0]
  if (!leader) return '—'
  return `+${Math.abs(leader.pct_week).toFixed(2)}%`
})
const loserTopPct = computed(() => {
  const leader = data.value?.worst?.[0]
  if (!leader) return '—'
  return `−${Math.abs(leader.pct_week).toFixed(2)}%`
})
</script>

<template>
  <MoleculesCreativePreviewControls
    creative-name="TREEMAP · SEMANAL"
    hero-title="Treemap da Semana"
    hero-description="Heatmap 1080×1080 com altas e baixas da semana lado a lado. Cada célula dimensionada pela variação acumulada em 7 dias, com cor proporcional ao tamanho do movimento. Perfeito pra resumos semanais."
    :controls="previewControls"
    @reset="resetControls"
  >
    <!--
      data-render-ready turns "true" once the API call settles AND
      we have at least one cell on either side. Matches the ranking
      creative so BrowserlessService can wait on the selector.
    -->
    <div
      class="frame"
      :data-render-ready="!pending && !error && (gainerCells.length > 0 || loserCells.length > 0) ? 'true' : 'false'"
    >
      <!-- Status bar -->
      <div class="statusbar">
        <span class="sb-live">
          <span class="sb-dot"></span>
          <span>B3 · SEMANA</span>
        </span>
        <div class="sb-right">
          <span class="sb-brand">REDENT<span class="sb-brand-accent">.IA</span></span>
        </div>
      </div>

      <!-- Hero: centered serif headline (date subtitle removed — was
           overlapping with the gainers panel because the panel grew to
           fill more vertical space and the headline already fills the
           horizontal). -->
      <div class="hero">
        <h1 class="hero-title">
          {{ title.split(' ').slice(0, -1).join(' ') || 'Raio-X da' }}
          <em>{{ title.split(' ').slice(-1)[0] || 'semana' }}</em>
        </h1>
      </div>

      <!-- GAINERS panel -->
      <div class="panel panel-top">
        <div class="panel-head">
          <span class="panel-arrow up">↗</span>
          <span class="panel-label">Maiores altas</span>
          <span class="panel-count"><b>{{ gainerCells.length }}</b> ativos</span>
        </div>
        <div class="panel-frame">
          <div
            v-for="c in gainerCells"
            :key="'g-' + c.item.ticker"
            class="cell"
            :style="{
              left: c.x + 'px',
              top: c.y + 'px',
              width: c.w + 'px',
              height: c.h + 'px',
              background: cellBg(true, c.item.pct_week),
            }"
          >
            <span class="cell-sym" :style="{ fontSize: sizePx(c) + 'px' }">{{ c.item.ticker }}</span>
            <span
              v-if="showPct(c)"
              class="cell-pct"
              :style="{ fontSize: pctSize(sizePx(c)) + 'px' }"
            >+{{ Math.abs(c.item.pct_week).toFixed(2) }}%</span>
            <span
              v-if="showPrice(c)"
              class="cell-price"
              :style="{ fontSize: pctSize(sizePx(c)) - 2 + 'px' }"
            >{{ fmtBRL(c.item.last_price) }}</span>
          </div>
        </div>
      </div>

      <!-- LOSERS panel -->
      <div class="panel panel-bottom">
        <div class="panel-head">
          <span class="panel-arrow down">↘</span>
          <span class="panel-label">Maiores baixas</span>
          <span class="panel-count"><b>{{ loserCells.length }}</b> ativos</span>
        </div>
        <div class="panel-frame">
          <div
            v-for="c in loserCells"
            :key="'l-' + c.item.ticker"
            class="cell"
            :style="{
              left: c.x + 'px',
              top: c.y + 'px',
              width: c.w + 'px',
              height: c.h + 'px',
              background: cellBg(false, c.item.pct_week),
            }"
          >
            <span class="cell-sym" :style="{ fontSize: sizePx(c) + 'px' }">{{ c.item.ticker }}</span>
            <span
              v-if="showPct(c)"
              class="cell-pct"
              :style="{ fontSize: pctSize(sizePx(c)) + 'px' }"
            >−{{ Math.abs(c.item.pct_week).toFixed(2) }}%</span>
            <span
              v-if="showPrice(c)"
              class="cell-price"
              :style="{ fontSize: pctSize(sizePx(c)) - 2 + 'px' }"
            >{{ fmtBRL(c.item.last_price) }}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="rkfooter">
        <span class="ff-brand">REDENT<span class="ff-dot">.IA</span></span>
        <span class="ff-sep"></span>
        <span>Dados B3 · Fechamento semanal</span>
        <span class="ff-right">redentia.com.br</span>
      </div>
    </div>
  </MoleculesCreativePreviewControls>
</template>

<style scoped>
* { box-sizing: border-box; }

.frame {
  width: 1080px; height: 1080px;
  position: relative; overflow: hidden;
  background: #0A0B0E; color: #FFFFFF;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Ambient — grid + amber top + dual green/red bottom corners.
   The two bottom glows mirror the dual gainers/losers identity of
   this creative (the ranking has a single-color tint because it
   shows only one side at a time). */
.frame::before {
  content: ''; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 1; pointer-events: none;
  z-index: 0;
}
.frame::after {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% -10%, rgba(245,166,35,0.22) 0%, transparent 55%),
    radial-gradient(ellipse at 8% 52%, rgba(0,211,149,0.26) 0%, transparent 45%),
    radial-gradient(ellipse at 92% 52%, rgba(255,71,71,0.26) 0%, transparent 45%);
  pointer-events: none;
  z-index: 0;
}

/* Status bar — same as ranking/race. */
.statusbar {
  position: absolute; top: 0; left: 0; right: 0; height: 64px;
  display: flex; align-items: center;
  padding: 0 48px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 17px; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(255,255,255,0.82);
  z-index: 3;
}
.sb-live { display: inline-flex; align-items: center; gap: 12px; font-weight: 600; }
.sb-dot { width: 10px; height: 10px; border-radius: 50%; background: #F5A623; box-shadow: 0 0 14px rgba(245,166,35,0.8); }
.sb-right { margin-left: auto; }
.sb-brand { color: #FFFFFF; font-weight: 700; letter-spacing: 0.2em; font-size: 19px; }
.sb-brand-accent { color: #F5A623; }

/* Hero */
.hero {
  position: absolute; top: 84px; left: 56px; right: 56px;
  text-align: center;
  z-index: 2;
}
.hero-title {
  font-family: 'Instrument Serif', serif;
  /* Was 128px; reduced to 96px so the headline doesn't dominate the
     entire upper third of the canvas — leaves more room for the
     gainers panel directly below. */
  font-size: 96px; line-height: 0.95; letter-spacing: -0.03em;
  font-weight: 400; color: #FFFFFF;
  margin: 0;
}
.hero-title em {
  font-style: italic;
  color: #F5A623;
}

/* Panels — stacked vertical. Each fills almost the full width
   (40px side gutters). With the hero subtitle removed and title
   reduced to 96px, panel-top moves up from 300→220 and each panel
   grows from 290→320 frame height. 40px gap between altas/baixas
   keeps the green/red contrast reading as two distinct sections
   instead of one continuous block. */
.panel {
  position: absolute; left: 40px; right: 40px;
  height: 360px;
  z-index: 2;
}
.panel-top { top: 220px; }
.panel-bottom { top: 620px; }

.panel-head {
  display: flex; align-items: baseline;
  gap: 14px;
  padding: 0 6px 12px 6px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: rgba(255,255,255,0.92);
}
.panel-arrow { font-size: 28px; font-weight: 700; line-height: 1; }
.panel-arrow.up { color: #00D395; }
.panel-arrow.down { color: #FF4747; }
.panel-label {
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 0.1em;
}
.panel-stat {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 800; font-size: 22px;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  margin-left: 4px;
}
.panel-stat.up { color: #00D395; }
.panel-stat.down { color: #FF4747; }
/* Ativos count — bold number + mono label, no border. */
.panel-count {
  margin-left: auto;
  display: inline-flex; align-items: baseline; gap: 8px;
  color: rgba(255,255,255,0.82);
  font-size: 18px;
  letter-spacing: 0.14em;
}
.panel-count b {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 800;
  font-size: 26px;
  color: #FFFFFF;
  letter-spacing: -0.01em;
}

.panel-frame {
  position: relative;
  width: 1000px; height: 320px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(20, 22, 28, 0.4);
  border-radius: 8px;
  overflow: hidden;
}

/* Cells — larger padding + drop shadow makes the text readable
   even at smaller cell sizes. */
.cell {
  position: absolute;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 6px 6px; gap: 2px;
  overflow: hidden; color: #fff;
  border-right: 1px solid rgba(0,0,0,0.28);
  border-bottom: 1px solid rgba(0,0,0,0.28);
  text-shadow: 0 1px 3px rgba(0,0,0,0.55);
}
.cell-sym {
  font-family: 'Inter', sans-serif;
  font-weight: 800; line-height: 1; letter-spacing: 0.01em;
}
.cell-pct {
  font-family: 'Inter', sans-serif;
  font-weight: 700; line-height: 1;
  margin-top: 2px; font-variant-numeric: tabular-nums;
  opacity: 0.96;
}
.cell-price {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500; line-height: 1;
  margin-top: 2px; font-variant-numeric: tabular-nums;
  opacity: 0.72;
}

/* Footer */
.rkfooter {
  position: absolute; bottom: 0; left: 0; right: 0; height: 64px;
  display: flex; align-items: center;
  padding: 0 48px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(255,255,255,0.62);
  z-index: 3;
}
.ff-brand { color: #FFFFFF; font-weight: 700; letter-spacing: 0.2em; font-size: 18px; }
.ff-brand .ff-dot { color: #F5A623; }
.ff-sep { display: inline-block; width: 14px; height: 1px; background: rgba(255,255,255,0.28); margin: 0 18px; }
.ff-right { margin-left: auto; color: #FFFFFF; font-weight: 600; font-size: 17px; }
</style>

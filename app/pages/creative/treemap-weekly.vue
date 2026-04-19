<script setup lang="ts">
definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// ============================================================
// Weekly treemap creative — 1080x1080.
//
// Live preview of the same treemap that goes out in Saturday's
// automated Instagram post. Two panels side by side:
//   - LEFT  (green) : biggest gainers of the last 7 trading days
//   - RIGHT (red)   : biggest losers
//
// Cell area is proportional to |pct_week| via a squarified layout
// (1:1 port of the algorithm used in
// Frontend/app/components/atoms/Graph/treemap.vue).
//
// Data pipe: GET /api/weekly-movers?side=both&limit=N — the same
// endpoint the server-rendered Blade consumes, so preview and
// published post always agree on the numbers.
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
])
function resetControls() {
  router.replace({ query: {} })
}

useHead(() => ({
  title: 'Redentia, Treemap semanal: altas e baixas B3',
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
const { data } = await useAsyncData<MoversResponse>(
  'weekly-movers-treemap',
  async () => {
    return await $fetch<MoversResponse>(`${apiBase}/weekly-movers`, {
      method: 'GET',
      query: { side: 'both', limit: perSide.value, min_volume: minVolume.value },
    })
  },
  { server: true, default: () => ({ best: [], worst: [], window: { start: null, end: null } }), watch: [perSide, minVolume] }
)

// ---------- Layout math (squarified) ----------
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

// ---------- Panel dimensions (must match CSS .panel-frame). ----------
const PANEL_W = 485
const PANEL_H = 650
const PANEL_GAP = 20

function toCells(items: MoverRow[]) {
  // Weight is |pct|+0.5 so tiny movers still claim a cell.
  const weighted: WeightedItem<MoverRow>[] = items.map((it) => ({ value: Math.abs(it.pct_week) + 0.5, data: it }))
  return squarify(weighted, { x: 0, y: 0, w: PANEL_W, h: PANEL_H })
}

const gainerCells = computed(() => toCells(data.value?.best ?? []))
const loserCells = computed(() => toCells(data.value?.worst ?? []))

// ---------- Cell color intensity by |pct| ----------
function cellBg(positive: boolean, pct: number): string {
  const abs = Math.abs(pct)
  let alpha = 0.42
  if (abs >= 15) alpha = 1
  else if (abs >= 8) alpha = 0.9
  else if (abs >= 4) alpha = 0.78
  else if (abs >= 2) alpha = 0.65
  else if (abs >= 1) alpha = 0.52
  return positive
    ? `rgba(0, 211, 149, ${alpha})`
    : `rgba(255, 71, 71, ${alpha})`
}

function sizePx(cell: Placed<MoverRow>) {
  const base = Math.min(cell.w, cell.h)
  return {
    sym: Math.max(11, Math.min(30, Math.round(base * 0.22))),
    pct: 0,
    price: 0,
  }
}
function pctSize(sym: number) { return Math.max(10, sym - 3) }
function priceSize(sym: number) { return Math.max(9, pctSize(sym) - 2) }
function showPct(c: Placed<MoverRow>) { return c.w >= 54 && c.h >= 44 }
function showPrice(c: Placed<MoverRow>) { return c.w >= 90 && c.h >= 70 }

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
</script>

<template>
  <MoleculesCreativePreviewControls
    creative-name="TREEMAP · SEMANAL"
    :controls="previewControls"
    @reset="resetControls"
  >
    <div class="frame">
      <!-- Status bar -->
      <div class="statusbar">
        <span class="sbdot"></span>
        <span class="sbbrand">REDENT.IA</span>
        <span class="sbsep">·</span>
        <span>MKTMAP</span>
        <span class="sbsep">·</span>
        <span>B3</span>
        <div class="sbright">
          <span>SESSÃO FECHADA</span>
          <span class="sbsep">·</span>
          <span class="sbstrong">{{ today }}</span>
        </div>
      </div>

      <!-- Headline -->
      <div class="headline">
        <div class="tag">
          [FECHAMENTO SEMANAL]
          <span class="tag-edition">· VARIAÇÃO 7D</span>
        </div>
        <h1 class="serif-display">Maiores altas<br>e baixas <em>da semana.</em></h1>
        <div class="meta-strip">
          <span class="chip">PERÍODO <b v-if="data">{{ fmtShortDate(data.window.start) }} → {{ fmtPeriod(data.window.end) }}</b></span>
          <span class="chip"><b>{{ gainerCells.length + loserCells.length }}</b> ATIVOS</span>
          <span class="chip">FILTRO <b>VOL &gt; R$ 10M</b></span>
        </div>
      </div>

      <!-- Panels -->
      <div class="panels">
        <!-- GAINERS -->
        <div class="panel" :style="{ left: '0px' }">
          <div class="panel-head" style="color: #00D395">
            <span class="arrow">↗</span>
            <span class="label">Maiores altas</span>
            <span class="count">· {{ gainerCells.length }} ativos</span>
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
              <span class="sym" :style="{ fontSize: sizePx(c).sym + 'px' }">{{ c.item.ticker }}</span>
              <span
                v-if="showPct(c)"
                class="pct"
                :style="{ fontSize: pctSize(sizePx(c).sym) + 'px' }"
              >+{{ c.item.pct_week.toFixed(2) }}%</span>
              <span
                v-if="showPrice(c)"
                class="price"
                :style="{ fontSize: priceSize(sizePx(c).sym) + 'px' }"
              >{{ fmtBRL(c.item.last_price) }}</span>
            </div>
          </div>
        </div>

        <!-- LOSERS -->
        <div class="panel" :style="{ left: (PANEL_W + PANEL_GAP) + 'px' }">
          <div class="panel-head" style="color: #FF4747">
            <span class="arrow">↘</span>
            <span class="label">Maiores baixas</span>
            <span class="count">· {{ loserCells.length }} ativos</span>
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
              <span class="sym" :style="{ fontSize: sizePx(c).sym + 'px' }">{{ c.item.ticker }}</span>
              <span
                v-if="showPct(c)"
                class="pct"
                :style="{ fontSize: pctSize(sizePx(c).sym) + 'px' }"
              >{{ c.item.pct_week.toFixed(2) }}%</span>
              <span
                v-if="showPrice(c)"
                class="price"
                :style="{ fontSize: priceSize(sizePx(c).sym) + 'px' }"
              >{{ fmtBRL(c.item.last_price) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <span class="fbrand">REDENT<span class="fdot">.IA</span></span>
        <span class="fsep">·</span>
        <span>DADOS B3</span>
        <span class="fsep">·</span>
        <span>{{ today.toUpperCase() }}</span>
        <span class="fright">redentia.com.br</span>
      </div>
    </div>
  </MoleculesCreativePreviewControls>
</template>

<style scoped>
* { box-sizing: border-box; }
.frame {
  width: 1080px; height: 1080px; position: relative;
  background: #0A0B0E;
  color: #E8EAED;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}
.frame::before {
  content: ''; position: absolute; inset: 0;
  background-image:
    linear-gradient(#E8EAED 1px, transparent 1px),
    linear-gradient(90deg, #E8EAED 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.035;
  pointer-events: none;
}
.frame::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% -10%, rgba(245,166,35,0.18) 0%, transparent 55%);
  pointer-events: none;
}

/* Status bar */
.statusbar {
  position: absolute; top: 0; left: 0; right: 0; height: 46px;
  border-bottom: 1px solid #2A2E39;
  display: flex; align-items: center; gap: 12px;
  padding: 0 36px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
  color: #8B92A7;
  background: rgba(10, 11, 14, 0.8);
  z-index: 3;
}
.sbdot { width: 6px; height: 6px; border-radius: 50%; background: #F5A623; box-shadow: 0 0 8px rgba(245,166,35,0.6); }
.sbbrand { color: #F5A623; font-weight: 600; letter-spacing: 0.2em; }
.sbsep { opacity: 0.4; }
.sbright { margin-left: auto; display: flex; align-items: center; gap: 12px; }
.sbstrong { color: #E8EAED; font-weight: 500; }

/* Headline */
.headline {
  position: absolute; top: 76px; left: 50px; right: 50px;
}
.tag {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
  color: #F5A623;
  margin-bottom: 12px;
}
.tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #F5A623; }
.tag-edition { color: #8B92A7; }
.serif-display {
  font-family: 'Instrument Serif', serif;
  font-size: 68px; line-height: 0.92; letter-spacing: -0.02em;
  font-weight: 400; color: #E8EAED; max-width: 820px;
}
.serif-display em { color: #F5A623; font-style: italic; }
.meta-strip {
  margin-top: 16px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
  color: #8B92A7;
}
.chip {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px;
  border: 1px solid #2A2E39;
  border-radius: 2px;
  color: #8B92A7;
}
.chip b { color: #E8EAED; font-weight: 500; }

/* Panels */
.panels { position: absolute; top: 330px; left: 50px; right: 50px; height: 660px; }
.panel { position: absolute; top: 0; width: 485px; height: 660px; }
.panel-head {
  position: absolute; top: -30px; left: 0; right: 0;
  display: flex; align-items: baseline; gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;
}
.panel-head .arrow { font-size: 16px; font-weight: 700; line-height: 1; }
.panel-head .label { font-weight: 600; }
.panel-head .count {
  margin-left: auto; color: #8B92A7; font-size: 10px;
}
.panel-frame {
  position: relative; width: 485px; height: 650px;
  border: 1px solid #2A2E39;
  background: rgba(20, 22, 28, 0.4);
  overflow: hidden;
}

/* Cells */
.cell {
  position: absolute;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 6px 4px;
  overflow: hidden; color: #fff;
  border-right: 1px solid rgba(0,0,0,0.3);
  border-bottom: 1px solid rgba(0,0,0,0.3);
  text-shadow: 0 1px 3px rgba(0,0,0,0.6);
}
.cell .sym { font-family: 'Inter', sans-serif; font-weight: 700; line-height: 1.0; letter-spacing: 0.01em; }
.cell .pct { font-family: 'JetBrains Mono', monospace; font-weight: 500; line-height: 1.1; margin-top: 4px; font-variant-numeric: tabular-nums; opacity: 0.95; }
.cell .price { font-family: 'JetBrains Mono', monospace; font-weight: 400; line-height: 1.1; margin-top: 3px; font-variant-numeric: tabular-nums; opacity: 0.72; }

/* Footer */
.footer {
  position: absolute; bottom: 0; left: 0; right: 0; height: 44px;
  border-top: 1px solid #2A2E39;
  display: flex; align-items: center;
  padding: 0 36px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
  color: #8B92A7;
  background: rgba(10, 11, 14, 0.8);
  z-index: 3;
}
.fbrand { color: #E8EAED; font-weight: 600; letter-spacing: 0.2em; }
.fbrand .fdot { color: #F5A623; }
.fsep { opacity: 0.4; margin: 0 12px; }
.fright { margin-left: auto; color: #F5A623; }
</style>

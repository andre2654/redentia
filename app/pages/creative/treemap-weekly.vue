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

// ---------- Panel dimensions ----------
const PANEL_W = 490
const PANEL_H = 760
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
      <!-- Header -->
      <div class="hdr">
        <div>
          <div class="hdr-title">Fechamento da semana · B3</div>
          <div class="hdr-sub">Maiores altas e baixas por variação acumulada em 7 dias</div>
        </div>
        <div class="hdr-range">
          PERÍODO
          <b v-if="data">
            {{ fmtShortDate(data.window.start) }} → {{ fmtPeriod(data.window.end) }}
          </b>
        </div>
      </div>

      <!-- Panels -->
      <div class="panels">
        <!-- GAINERS -->
        <div class="panel" :style="{ left: '0px' }">
          <div class="panel-title" style="color: #00D395">
            <span class="arrow">↗</span>
            <span>Maiores altas</span>
            <span class="count">· {{ gainerCells.length }}</span>
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
          <div class="panel-title" style="color: #FF4747">
            <span class="arrow">↘</span>
            <span>Maiores baixas</span>
            <span class="count">· {{ loserCells.length }}</span>
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
        <span>REDENT<span class="accent">.IA</span> · Dados B3 · {{ today }}</span>
        <span>redentia.com.br</span>
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
  background: radial-gradient(ellipse at 50% 10%, rgba(245,166,35,0.10) 0%, transparent 55%);
  pointer-events: none;
}
.hdr {
  position: absolute; top: 50px; left: 50px; right: 50px;
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 24px;
}
.hdr-title { font-size: 44px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.05; }
.hdr-sub { margin-top: 8px; font-size: 18px; opacity: 0.7; }
.hdr-range {
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.7;
  text-align: right;
}
.hdr-range b { display: block; font-size: 22px; color: #F5A623; margin-top: 6px; letter-spacing: -0.01em; }
.panels { position: absolute; top: 190px; left: 50px; }
.panel { position: absolute; top: 0; width: 490px; }
.panel-title {
  position: absolute; top: -42px; left: 0;
  font-size: 16px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  display: flex; align-items: center; gap: 10px;
}
.panel-title .arrow { font-size: 20px; font-weight: 700; }
.panel-title .count {
  opacity: 0.5; font-family: 'JetBrains Mono', monospace;
  font-size: 12px; margin-left: 4px;
}
.panel-frame {
  position: relative; width: 490px; height: 760px;
  border: 1px solid rgba(255,255,255,0.08);
  background: #0E1014;
}
.cell {
  position: absolute;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow: hidden; color: #fff;
  border-right: 1px solid rgba(0,0,0,0.35);
  border-bottom: 1px solid rgba(0,0,0,0.35);
  text-shadow: 0 1px 2px rgba(0,0,0,0.55), 0 0 4px rgba(0,0,0,0.35);
}
.cell .sym { font-weight: 700; line-height: 1.05; letter-spacing: 0.01em; }
.cell .pct { font-weight: 600; line-height: 1.05; margin-top: 2px; font-variant-numeric: tabular-nums; }
.cell .price { font-weight: 500; line-height: 1.05; margin-top: 3px; opacity: 0.78; font-variant-numeric: tabular-nums; font-family: 'JetBrains Mono', monospace; }
.footer {
  position: absolute; bottom: 40px; left: 50px; right: 50px;
  display: flex; justify-content: space-between; align-items: center;
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.7;
}
.accent { color: #F5A623; }
</style>

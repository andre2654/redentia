<template>
  <div
    class="mktmap relative flex w-full flex-col"
    :style="{
      backgroundColor: brand.colors.background,
      color: brand.colors.text,
      border: `1px solid ${brand.colors.border}`,
    }"
    @mouseleave="clearHover"
  >
    <!-- STATUS BAR TOP -->
    <div
      class="status-bar-top flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
      :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
    >
      <span :style="{ color: brand.colors.primary }">MKTMAP</span>
      <span :style="{ color: brand.colors.border }">·</span>
      <span>B3</span>
      <span :style="{ color: brand.colors.border }">·</span>
      <span class="inline-flex items-center gap-1.5">
        <span
          class="h-1.5 w-1.5 rounded-full"
          :style="{ backgroundColor: sessionOpen ? brand.colors.positive : brand.colors.neutral }"
        />
        <span>SESSION {{ sessionOpen ? 'OPEN' : 'CLOSED' }}</span>
      </span>
      <span :style="{ color: brand.colors.border }">·</span>
      <span class="tabular-nums">{{ clockText }} BRT</span>
      <span class="ml-auto flex items-center gap-3">
        <span>HEAT · |%CHG|</span>
        <span :style="{ color: brand.colors.border }">·</span>
        <span>{{ totalTickers }} TICKERS</span>
        <span :style="{ color: brand.colors.border }">·</span>
        <span>{{ sectorCount }} SECTORS</span>
      </span>
    </div>

    <!-- CANVAS 2D -->
    <div
      ref="canvasRef"
      class="map-canvas relative w-full"
      :style="{ height: `${canvasHeight}px` }"
    >
      <div
        v-for="sector in sectorBoxes"
        :key="sector.code + sector.name"
        class="sector-box absolute overflow-hidden"
        :style="{
          left: `${sector.x}px`,
          top: `${sector.y}px`,
          width: `${sector.w}px`,
          height: `${sector.h}px`,
          borderRight: `1px solid ${brand.colors.border}`,
          borderBottom: `1px solid ${brand.colors.border}`,
        }"
      >
        <!-- Sector label strip -->
        <div
          class="sector-label flex items-center gap-2 px-2 font-mono-tab text-[9px] uppercase tracking-[0.12em] sm:text-[10px]"
          :style="{
            height: `${SECTOR_LABEL_H}px`,
            backgroundColor: brand.colors.surface,
            color: brand.colors.textMuted,
            borderBottom: `1px solid ${brand.colors.border}`,
          }"
        >
          <span
            class="font-semibold"
            :style="{ color: brand.colors.primary }"
            >{{ sector.code }}</span
          >
          <span class="truncate" :style="{ color: brand.colors.text }">{{
            sector.name
          }}</span>
          <span
            class="ml-auto flex shrink-0 items-center gap-1.5 tabular-nums"
          >
            <span
              :style="{
                color:
                  sector.avgChange >= 0 ? brand.colors.positive : brand.colors.negative,
              }"
            >
              {{ sector.avgChange >= 0 ? '+' : '' }}{{ sector.avgChange.toFixed(1) }}%
            </span>
            <span :style="{ color: brand.colors.border }">·</span>
            <span>{{ sector.totalCount }}</span>
          </span>
        </div>

        <!-- Ticker cells inside sector -->
        <div
          class="relative w-full"
          :style="{ height: `${sector.h - SECTOR_LABEL_H}px` }"
        >
          <component
            :is="isAggregate(cell.item) ? 'div' : 'NuxtLink'"
            v-for="cell in sector.cells"
            :key="cell.item.symbol"
            :to="isAggregate(cell.item) ? undefined : `/asset/${cell.item.symbol}`"
            class="ticker-cell absolute flex flex-col items-center justify-center overflow-hidden font-mono-tab tabular-nums transition-[opacity,background-color] duration-100"
            :class="{ 'pointer-events-none': isAggregate(cell.item) }"
            :style="cellStyle(cell)"
            @mouseenter="!isAggregate(cell.item) && setHover(cell.item, sector)"
            @focus="!isAggregate(cell.item) && setHover(cell.item, sector)"
            @mouseleave="clearHover"
            @blur="clearHover"
          >
            <span
              class="ticker-symbol ticker-text block truncate px-1 text-center font-bold leading-tight"
              :style="{ fontSize: symbolSize(cell) + 'px', color: '#FFFFFF' }"
            >
              {{ cell.item.symbol }}
            </span>
            <span
              v-if="showChange(cell)"
              class="ticker-change ticker-text block truncate px-1 font-semibold leading-tight"
              :style="{ fontSize: changeSize(cell) + 'px', color: '#FFFFFF' }"
            >
              {{ cell.item.change >= 0 ? '+' : '' }}{{ cell.item.change.toFixed(1) }}%
            </span>
            <span
              v-if="showPrice(cell)"
              class="ticker-price ticker-text mt-0.5 block truncate px-1 leading-tight"
              :style="{
                fontSize: priceSize(cell) + 'px',
                color: 'rgba(255,255,255,0.78)',
              }"
            >
              R$ {{ cell.item.price.toFixed(2) }}
            </span>
          </component>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="sectorBoxes.length === 0"
        class="absolute inset-0 flex items-center justify-center font-mono-tab text-[11px] uppercase tracking-[0.15em]"
        :style="{ color: brand.colors.textMuted }"
      >
        NENHUM DADO NO FILTRO ATUAL
      </div>
    </div>

    <!-- STATUS BAR BOTTOM -->
    <div
      class="status-bar-bottom flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.15em] sm:text-[11px]"
      :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
    >
      <template v-if="hovered">
        <span class="font-semibold" :style="{ color: brand.colors.primary }">{{
          hovered.symbol
        }}</span>
        <span :style="{ color: brand.colors.border }">·</span>
        <span class="max-w-[16rem] truncate" :style="{ color: brand.colors.text }">{{
          hovered.name
        }}</span>
        <span :style="{ color: brand.colors.border }">·</span>
        <span class="tabular-nums" :style="{ color: brand.colors.text }"
          >R$ {{ hovered.price.toFixed(2) }}</span
        >
        <span :style="{ color: brand.colors.border }">·</span>
        <span
          class="tabular-nums font-semibold"
          :style="{
            color: hovered.change >= 0 ? brand.colors.positive : brand.colors.negative,
          }"
        >
          {{ hovered.change >= 0 ? '+' : '' }}{{ hovered.change.toFixed(2) }}%
        </span>
        <span v-if="hovered.sectorLabel" :style="{ color: brand.colors.border }">·</span>
        <span v-if="hovered.sectorLabel">{{ hovered.sectorLabel }}</span>
        <span class="ml-auto opacity-60">CLIQUE PARA ABRIR ATIVO →</span>
      </template>
      <template v-else>
        <span>HOVER OU FOCUS PARA DETALHE DO ATIVO</span>
        <span class="ml-auto opacity-60">SIZED BY |%CHG| · NESTED SQUARIFIED TREEMAP</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useChartColors, rgba } from '~/design/chartColors'

const brand = useBrand()
const cc = useChartColors()

interface TreemapItem {
  symbol: string
  name: string
  price: number
  change: number
  marketCap?: number
  category?: 'acoes' | 'fiis'
  sector?: string
}

interface Props {
  data: TreemapItem[]
  height?: number
  showPositive?: boolean
  showNegative?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 640,
  showPositive: true,
  showNegative: true,
})

// ---- Sector taxonomy (B3) ----
const SECTOR_MAP: Record<string, { code: string; name: string; order: number }> = {
  'financial services': { code: 'FIN', name: 'FINANCEIRO', order: 1 },
  financials: { code: 'FIN', name: 'FINANCEIRO', order: 1 },
  financial: { code: 'FIN', name: 'FINANCEIRO', order: 1 },
  energy: { code: 'ENG', name: 'ENERGIA', order: 2 },
  'basic materials': { code: 'MAT', name: 'MATERIAIS', order: 3 },
  materials: { code: 'MAT', name: 'MATERIAIS', order: 3 },
  'consumer cyclical': { code: 'CDS', name: 'CONSUMO DISC.', order: 4 },
  'consumer discretionary': { code: 'CDS', name: 'CONSUMO DISC.', order: 4 },
  'consumer defensive': { code: 'CNS', name: 'CONSUMO', order: 5 },
  'consumer staples': { code: 'CNS', name: 'CONSUMO', order: 5 },
  technology: { code: 'TEC', name: 'TECNOLOGIA', order: 6 },
  'information technology': { code: 'TEC', name: 'TECNOLOGIA', order: 6 },
  healthcare: { code: 'SAU', name: 'SAÚDE', order: 7 },
  'health care': { code: 'SAU', name: 'SAÚDE', order: 7 },
  industrials: { code: 'IND', name: 'INDUSTRIAL', order: 8 },
  utilities: { code: 'UTL', name: 'UTILIDADES', order: 9 },
  'communication services': { code: 'COM', name: 'COMUNICAÇÃO', order: 10 },
  communications: { code: 'COM', name: 'COMUNICAÇÃO', order: 10 },
  'real estate': { code: 'IMB', name: 'IMOBILIÁRIO', order: 11 },
}

const FIIS_BUCKET = { code: 'IMB', name: 'IMOBILIÁRIO (FIIs)', order: 11 }
const OTHER_BUCKET = { code: '---', name: 'SEM SETOR', order: 99 }

function resolveSector(item: TreemapItem) {
  if (item.category === 'fiis') return FIIS_BUCKET
  const raw = (item.sector || '').trim().toLowerCase()
  if (!raw) return OTHER_BUCKET
  return SECTOR_MAP[raw] || OTHER_BUCKET
}

// ---- Filter (Altas / Baixas) ----
const filtered = computed(() => {
  let list = [...props.data]
  if (props.showPositive && !props.showNegative) list = list.filter((i) => i.change >= 0)
  else if (!props.showPositive && props.showNegative)
    list = list.filter((i) => i.change < 0)
  else if (!props.showPositive && !props.showNegative) list = []
  return list
})

// ---- Aggregate/broken-data helpers ----
function isAggregate(item: TreemapItem): boolean {
  return item.symbol.startsWith('+')
}
function isBrokenData(item: TreemapItem): boolean {
  return (
    item.price <= 0 ||
    !Number.isFinite(item.change) ||
    Math.abs(item.change) >= 99.5
  )
}
function weightFor(item: TreemapItem): number {
  if (isAggregate(item)) return Math.abs(item.change) + 0.5
  if (isBrokenData(item)) return 0.35
  return Math.abs(item.change) + 0.5
}

// ---- Responsive canvas dimensions ----
const canvasRef = ref<HTMLElement | null>(null)
const canvasWidth = ref(1200)

function measureCanvas() {
  if (!canvasRef.value) return
  canvasWidth.value = Math.max(320, Math.floor(canvasRef.value.clientWidth))
}

let ro: ResizeObserver | null = null
onMounted(() => {
  measureCanvas()
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => measureCanvas())
    if (canvasRef.value) ro.observe(canvasRef.value)
  }
})
onUnmounted(() => {
  if (ro && canvasRef.value) ro.unobserve(canvasRef.value)
  ro = null
})

const canvasHeight = computed(() => {
  if (typeof window === 'undefined') return props.height
  const w = canvasWidth.value
  if (w < 500) return Math.max(560, props.height)
  if (w < 900) return Math.max(520, props.height * 0.9)
  return props.height
})

const SECTOR_LABEL_H = 22

// ---- Squarified treemap algorithm ----
interface Box {
  x: number
  y: number
  w: number
  h: number
}
interface SquaredItem<T> {
  value: number
  data: T
}
interface Placed<T> extends Box {
  data: T
}

function squarify<T>(raw: SquaredItem<T>[], box: Box): Placed<T>[] {
  if (raw.length === 0 || box.w <= 0 || box.h <= 0) return []
  const total = raw.reduce((s, i) => s + i.value, 0)
  if (total <= 0) return []
  const scale = (box.w * box.h) / total
  const items = raw
    .map((i) => ({ value: i.value * scale, data: i.data }))
    .sort((a, b) => b.value - a.value)
  const result: Placed<T>[] = []
  squarifyStep(items, [], { ...box }, result)
  return result
}

function squarifyStep<T>(
  items: SquaredItem<T>[],
  row: SquaredItem<T>[],
  box: Box,
  result: Placed<T>[]
) {
  const w = Math.min(box.w, box.h)
  if (w <= 0) return

  if (items.length === 0) {
    layoutRow(row, box, result)
    return
  }

  const nextItem = items[0]!
  const newRow = [...row, nextItem]

  if (row.length === 0 || worst(row, w) >= worst(newRow, w)) {
    squarifyStep(items.slice(1), newRow, box, result)
  } else {
    layoutRow(row, box, result)
    const rowValue = row.reduce((s, i) => s + i.value, 0)
    const slab = rowValue / w
    const newBox: Box =
      box.w <= box.h
        ? { x: box.x, y: box.y + slab, w: box.w, h: box.h - slab }
        : { x: box.x + slab, y: box.y, w: box.w - slab, h: box.h }
    squarifyStep(items, [], newBox, result)
  }
}

function layoutRow<T>(row: SquaredItem<T>[], box: Box, result: Placed<T>[]) {
  if (row.length === 0) return
  const rowValue = row.reduce((s, i) => s + i.value, 0)
  if (rowValue <= 0) return
  const w = Math.min(box.w, box.h)
  const slab = rowValue / w
  let offset = 0
  if (box.w <= box.h) {
    for (const item of row) {
      const cellW = item.value / slab
      result.push({ x: box.x, y: box.y, w: cellW, h: slab, data: item.data })
      result[result.length - 1].x += offset
      offset += cellW
    }
  } else {
    for (const item of row) {
      const cellH = item.value / slab
      result.push({ x: box.x, y: box.y, w: slab, h: cellH, data: item.data })
      result[result.length - 1].y += offset
      offset += cellH
    }
  }
}

function worst(row: SquaredItem<any>[], w: number): number {
  if (row.length === 0) return Infinity
  const sum = row.reduce((s, i) => s + i.value, 0)
  const min = Math.min(...row.map((i) => i.value))
  const max = Math.max(...row.map((i) => i.value))
  if (sum <= 0 || min <= 0) return Infinity
  const s2 = sum * sum
  const w2 = w * w
  return Math.max((w2 * max) / s2, s2 / (w2 * min))
}

// ---- 2-level layout ----
interface SectorBucket {
  code: string
  name: string
  order: number
  items: TreemapItem[]
  totalCount: number
  weightSum: number
  avgChange: number
}

interface CellLayout {
  x: number
  y: number
  w: number
  h: number
  item: TreemapItem
}

interface SectorLayout extends SectorBucket {
  x: number
  y: number
  w: number
  h: number
  cells: CellLayout[]
}

const MAX_CELLS_PER_SECTOR = 16

const sectorBoxes = computed<SectorLayout[]>(() => {
  const list = filtered.value
  if (list.length === 0) return []

  const W = canvasWidth.value
  const H = canvasHeight.value
  if (W <= 0 || H <= 0) return []

  // Grupo por setor
  const map = new Map<string, SectorBucket>()
  for (const item of list) {
    const sec = resolveSector(item)
    const key = `${sec.order}|${sec.code}|${sec.name}`
    if (!map.has(key)) {
      map.set(key, {
        code: sec.code,
        name: sec.name,
        order: sec.order,
        items: [],
        totalCount: 0,
        weightSum: 0,
        avgChange: 0,
      })
    }
    const bucket = map.get(key)!
    bucket.items.push(item)
    bucket.weightSum += weightFor(item)
    bucket.totalCount += 1
  }

  const buckets = Array.from(map.values())

  // Cap de cells por setor (os maiores por |chg|, resto vira "+N")
  for (const b of buckets) {
    b.items.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    if (b.items.length > MAX_CELLS_PER_SECTOR) {
      const head = b.items.slice(0, MAX_CELLS_PER_SECTOR - 1)
      const tail = b.items.slice(MAX_CELLS_PER_SECTOR - 1)
      const tailAvg =
        tail.reduce((s, it) => s + it.change, 0) / Math.max(tail.length, 1)
      head.push({
        symbol: `+${tail.length}`,
        name: `${tail.length} outros ativos`,
        price: 0,
        change: tailAvg,
        category: tail[0]?.category,
        sector: tail[0]?.sector,
      })
      b.items = head
    }
    const sum = b.items
      .filter((it) => !isAggregate(it))
      .reduce((s, it) => s + it.change, 0)
    const cnt = b.items.filter((it) => !isAggregate(it)).length
    b.avgChange = sum / Math.max(cnt, 1)
  }

  // Layout nível 1, setores
  const sectorBoxesPlaced = squarify<SectorBucket>(
    buckets.map((b) => ({ value: Math.max(b.weightSum, 0.01), data: b })),
    { x: 0, y: 0, w: W, h: H }
  )

  // Layout nível 2, tickers dentro de cada setor
  const result: SectorLayout[] = []
  for (const sbox of sectorBoxesPlaced) {
    const innerBox: Box = {
      x: 0,
      y: 0,
      w: sbox.w,
      h: Math.max(0, sbox.h - SECTOR_LABEL_H),
    }
    const cellsPlaced = squarify<TreemapItem>(
      sbox.data.items.map((it) => ({
        value: Math.max(weightFor(it), 0.01),
        data: it,
      })),
      innerBox
    )
    const cells: CellLayout[] = cellsPlaced.map((p) => ({
      x: p.x,
      y: p.y,
      w: p.w,
      h: p.h,
      item: p.data,
    }))
    result.push({
      ...sbox.data,
      x: sbox.x,
      y: sbox.y,
      w: sbox.w,
      h: sbox.h,
      cells,
    })
  }

  return result
})

const totalTickers = computed(() =>
  sectorBoxes.value.reduce(
    (acc, s) => acc + s.cells.filter((c) => !isAggregate(c.item)).length,
    0
  )
)
const sectorCount = computed(() => sectorBoxes.value.length)

// ---- Colors ----
// Escala Bloomberg: tons saturados sobre fundo off-black, de forma que o
// texto branco por cima fique legível mesmo nas intensidades médias.
function getCellBg(change: number): string {
  const abs = Math.abs(change)
  let alpha = 0.55
  if (abs >= 8) alpha = 1
  else if (abs >= 4) alpha = 0.88
  else if (abs >= 2) alpha = 0.75
  else if (abs >= 1) alpha = 0.62
  else if (abs >= 0.5) alpha = 0.48
  const base = change >= 0 ? cc.positive : cc.negative
  return rgba(base, alpha)
}

// ---- Cell rendering helpers ----
function symbolSize(cell: CellLayout): number {
  const base = Math.min(cell.w, cell.h)
  const s = Math.max(9, Math.min(22, Math.round(base * 0.2)))
  return s
}
function changeSize(cell: CellLayout): number {
  return Math.max(8, symbolSize(cell) - 2)
}
function priceSize(cell: CellLayout): number {
  return Math.max(8, symbolSize(cell) - 3)
}
function showChange(cell: CellLayout): boolean {
  if (isAggregate(cell.item)) return false
  return cell.w >= 44 && cell.h >= 38
}
function showPrice(cell: CellLayout): boolean {
  if (isAggregate(cell.item)) return false
  if (cell.item.price <= 0) return false
  return cell.w >= 70 && cell.h >= 60
}

function cellStyle(cell: CellLayout) {
  const item = cell.item
  const isHovered = hovered.value?.symbol === item.symbol
  const anyHover = hovered.value !== null
  const broken = isBrokenData(item) && !isAggregate(item)
  const aggregate = isAggregate(item)
  return {
    left: `${cell.x}px`,
    top: `${cell.y}px`,
    width: `${cell.w}px`,
    height: `${cell.h}px`,
    backgroundColor: aggregate ? brand.colors.surface : getCellBg(item.change),
    color: brand.colors.text,
    borderRight: `1px solid ${brand.colors.border}`,
    borderBottom: `1px solid ${brand.colors.border}`,
    opacity: anyHover && !isHovered ? 0.4 : broken ? 0.55 : 1,
    textDecoration: 'none',
    outline: isHovered ? `1px solid ${brand.colors.primary}` : 'none',
    outlineOffset: isHovered ? '-1px' : '0',
    zIndex: isHovered ? 2 : 1,
  } as Record<string, string | number>
}

// ---- Hover ----
interface HoverInfo {
  symbol: string
  name: string
  price: number
  change: number
  sectorLabel?: string
}
const hovered = ref<HoverInfo | null>(null)

function setHover(item: TreemapItem, sector: SectorBucket) {
  hovered.value = {
    symbol: item.symbol,
    name: item.name,
    price: item.price,
    change: item.change,
    sectorLabel: `${sector.code} · ${sector.name}`,
  }
}

function clearHover() {
  hovered.value = null
}

// ---- Clock + session ----
const now = ref(new Date())
let clockTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

const clockText = computed(() => {
  const d = now.value
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
})

const sessionOpen = computed(() => {
  const d = now.value
  const day = d.getDay()
  if (day === 0 || day === 6) return false
  const minutes = d.getHours() * 60 + d.getMinutes()
  return minutes >= 600 && minutes <= 1050
})
</script>

<style scoped>
.mktmap {
  border-radius: 0;
}

.ticker-cell {
  text-decoration: none;
}

.ticker-cell:hover,
.ticker-cell:focus {
  text-decoration: none;
}

/* Text-shadow sutil garante legibilidade sobre qualquer tom de fundo
   (positivo, negativo e também cells escuros de baixa intensidade). */
.ticker-text {
  text-shadow:
    0 0 3px rgba(0, 0, 0, 0.55),
    0 1px 1px rgba(0, 0, 0, 0.35);
  letter-spacing: 0.01em;
}

.font-mono-tab {
  font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas,
    monospace;
  font-feature-settings: 'tnum' 1, 'calt' 0;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>

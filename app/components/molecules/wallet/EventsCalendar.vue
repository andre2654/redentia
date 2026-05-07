<!--
  EventsCalendar — substitui DividendCalendarCard + EventsList por
  UMA visao de calendario mensal (7 cols × 5-6 rows) que agrega:
    - Proventos (Dividendo / JCP / Rendimento) com valor em R$
    - Ex-date / payment-date
    - Earnings, rotacoes, vencimentos do Tesouro

  Layout segue o mesmo padrao da /dividendos/calendario (big calendar
  publico): celulas com numero do dia + chips de eventos (max 3) +
  "+N mais". Click na celula expande os eventos do dia abaixo.

  Empty state: se nenhum evento nos proximos 60 dias, mostra mensagem
  amigavel (sem render de calendario, evita visual de calendario vazio).
-->
<template>
  <section class="cal flex flex-col gap-5">
    <!-- Header: eyebrow + title + total + month nav -->
    <header class="cal__head">
      <div class="cal__title-group">
        <span class="cal__eyebrow">Próximos eventos</span>
        <h2 class="cal__title">Proventos e datas que merecem sua atenção</h2>
        <p v-if="totalEstimated > 0" class="cal__lead">
          <span class="cal__lead-label">Total estimado em proventos no mês:</span>
          <strong class="cal__lead-value">{{ maskedBRL(totalEstimated) }}</strong>
        </p>
      </div>

      <!-- Month nav -->
      <div class="cal__nav">
        <button
          type="button"
          class="cal__nav-btn"
          :aria-label="'Mês anterior'"
          @click="shiftMonth(-1)"
        >
          <UIcon name="i-lucide-chevron-left" class="size-4" />
        </button>
        <span class="cal__nav-label">{{ monthLabel }}</span>
        <button
          type="button"
          class="cal__nav-btn"
          :aria-label="'Próximo mês'"
          @click="shiftMonth(1)"
        >
          <UIcon name="i-lucide-chevron-right" class="size-4" />
        </button>
      </div>
    </header>

    <!-- Calendar grid -->
    <div class="cal__grid-wrap">
      <!-- Weekday header -->
      <div class="cal__weekdays">
        <span v-for="d in weekdayLabels" :key="d" class="cal__weekday">{{ d }}</span>
      </div>

      <!-- Days grid -->
      <div class="cal__grid">
        <button
          v-for="cell in calendarCells"
          :key="cell.iso"
          type="button"
          class="cal__cell"
          :class="{
            'cal__cell--out': !cell.inMonth,
            'cal__cell--today': cell.isToday,
            'cal__cell--has': cell.items.length > 0,
            'cal__cell--active': activeIso === cell.iso,
          }"
          :disabled="cell.items.length === 0"
          @click="toggleCell(cell)"
        >
          <div class="cal__cell-head">
            <span class="cal__cell-day">{{ cell.day }}</span>
            <span v-if="cell.items.length > 0" class="cal__cell-count">{{ cell.items.length }}</span>
          </div>
          <div v-if="cell.items.length > 0" class="cal__cell-items">
            <span
              v-for="item in cell.items.slice(0, 3)"
              :key="`${item.kind}-${item.ticker}-${item.label}`"
              class="cal__chip"
              :style="{
                background: `color-mix(in srgb, ${kindColor(item.kind)} 14%, transparent)`,
                color: kindColor(item.kind),
                borderColor: `color-mix(in srgb, ${kindColor(item.kind)} 28%, transparent)`,
              }"
            >
              <span class="cal__chip-dot" :style="{ background: kindColor(item.kind) }" aria-hidden="true" />
              <span class="cal__chip-label">{{ item.ticker || item.label }}</span>
            </span>
            <span v-if="cell.items.length > 3" class="cal__cell-more">+{{ cell.items.length - 3 }} mais</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Active day expansion (linha de detalhes embaixo) -->
    <Transition name="cal-expand">
      <div v-if="activeCell && activeCell.items.length > 0" class="cal__detail">
        <div class="cal__detail-head">
          <UIcon name="i-lucide-calendar-days" class="size-4" :style="{ color: 'var(--brand-primary)' }" aria-hidden="true" />
          <span class="cal__detail-date">{{ formatDateLong(activeCell.iso) }}</span>
          <span class="cal__detail-count">{{ activeCell.items.length }} {{ activeCell.items.length === 1 ? 'evento' : 'eventos' }}</span>
        </div>
        <ul class="cal__detail-list">
          <li
            v-for="(item, i) in activeCell.items"
            :key="`detail-${item.kind}-${i}`"
            class="cal__detail-item"
          >
            <span
              class="cal__detail-icon"
              :style="{
                background: `color-mix(in srgb, ${kindColor(item.kind)} 14%, transparent)`,
                color: kindColor(item.kind),
              }"
            >
              <UIcon :name="kindIcon(item.kind)" class="size-3.5" aria-hidden="true" />
            </span>
            <div class="cal__detail-copy">
              <span class="cal__detail-title">
                <span v-if="item.ticker" class="cal__detail-ticker">{{ item.ticker }}</span>
                <span class="cal__detail-kind">{{ kindLabel(item.kind) }}</span>
              </span>
              <span v-if="item.name || item.label" class="cal__detail-sub">
                {{ item.name || item.label }}
              </span>
            </div>
            <span
              v-if="item.amount != null"
              class="cal__detail-amount"
              :style="{ color: 'var(--brand-positive)' }"
            >+{{ maskedBRL2(item.amount) }}</span>
          </li>
        </ul>
      </div>
    </Transition>

    <!-- Empty state -->
    <p v-if="totalAllItems === 0" class="cal__empty">
      <UIcon name="i-lucide-calendar-x" class="size-4 shrink-0" aria-hidden="true" />
      <span>Sem proventos ou eventos relevantes nos próximos 60 dias para sua carteira.</span>
    </p>
  </section>
</template>

<script setup lang="ts">
import type { DividendEvent } from './DividendCalendarCard.vue'
import type { UpcomingEvent, EventKind } from './EventsList.vue'

interface Props {
  /** Proventos previstos (kind = JCP/Dividendo/Rendimento, com amount). */
  dividends: DividendEvent[]
  /** Outros eventos (ex-date, earnings, rotate, maturity). */
  events: UpcomingEvent[]
}
const props = withDefaults(defineProps<Props>(), {
  dividends: () => [],
  events: () => [],
})

// =================================================================
// Unified event shape (cell items + detail rows)
// =================================================================
type UnifiedKind = 'pay' | 'jcp' | 'rendimento' | 'ex' | 'earnings' | 'rotate' | 'maturity' | 'other'

interface CalItem {
  iso: string
  kind: UnifiedKind
  ticker?: string
  name?: string
  label?: string
  amount?: number
}

const TODAY_ISO = isoOf(new Date())

function isoOf(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// =================================================================
// Aggregate dividends + events into uma lista unica
// =================================================================
const allItems = computed<CalItem[]>(() => {
  const out: CalItem[] = []

  for (const d of props.dividends) {
    const k = (d.kind || '').toLowerCase()
    let kind: UnifiedKind = 'pay'
    if (k.includes('jcp') || k.includes('juros')) kind = 'jcp'
    else if (k.includes('rendimento')) kind = 'rendimento'
    else if (k.includes('dividendo')) kind = 'pay'
    out.push({
      iso: d.payment_date,
      kind,
      ticker: d.ticker,
      name: d.name,
      amount: d.amount,
    })
  }

  for (const e of props.events) {
    let kind: UnifiedKind = 'other'
    switch (e.kind as EventKind) {
      case 'pay': kind = 'pay'; break
      case 'ex': kind = 'ex'; break
      case 'earnings': kind = 'earnings'; break
      case 'rotate': kind = 'rotate'; break
      case 'maturity': kind = 'maturity'; break
    }
    // Tenta extrair ticker do label (ex: "PETR4 ex-date" → ticker PETR4)
    const tickerMatch = e.label?.match(/^([A-Z]{4}\d{1,2}|[A-Z]{2,5}\d?)\b/)
    out.push({
      iso: e.date,
      kind,
      ticker: tickerMatch?.[1],
      label: e.label,
    })
  }

  return out.filter((i) => !!i.iso)
})

const totalAllItems = computed(() => allItems.value.length)

// Indexar itens por iso pra O(1) lookup nas celulas
const dateMap = computed(() => {
  const map = new Map<string, CalItem[]>()
  for (const item of allItems.value) {
    const list = map.get(item.iso) ?? []
    list.push(item)
    map.set(item.iso, list)
  }
  // ordena cada bucket por kind (pay > jcp > rendimento > ex > earnings > rotate > maturity)
  const order: Record<UnifiedKind, number> = {
    pay: 0, jcp: 1, rendimento: 2, ex: 3, earnings: 4, rotate: 5, maturity: 6, other: 7,
  }
  for (const [, list] of map) {
    list.sort((a, b) => order[a.kind] - order[b.kind])
  }
  return map
})

// =================================================================
// Cursor + grid
// =================================================================
const cursor = ref(new Date())

function shiftMonth(delta: number) {
  const next = new Date(cursor.value)
  next.setDate(1)
  next.setMonth(next.getMonth() + delta)
  cursor.value = next
  activeIso.value = null
}

const monthLabel = computed(() => {
  const txt = cursor.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return txt.charAt(0).toUpperCase() + txt.slice(1)
})

const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface CalendarCell {
  iso: string
  day: number
  inMonth: boolean
  isToday: boolean
  items: CalItem[]
}

const calendarCells = computed<CalendarCell[]>(() => {
  const year = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)

  const lead = firstOfMonth.getDay()
  const start = new Date(firstOfMonth)
  start.setDate(start.getDate() - lead)

  const totalSoFar = lead + lastOfMonth.getDate()
  const totalRows = Math.ceil(totalSoFar / 7)
  const totalCells = Math.max(35, totalRows * 7)

  const cells: CalendarCell[] = []
  const lookup = dateMap.value
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = isoOf(d)
    cells.push({
      iso,
      day: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: iso === TODAY_ISO,
      items: lookup.get(iso) || [],
    })
  }
  return cells
})

// Total estimado em proventos NO MES atual (so dividends, so amount)
const totalEstimated = computed(() => {
  return calendarCells.value
    .filter((c) => c.inMonth)
    .reduce((sum, c) => {
      return sum + c.items.reduce((s, i) => s + (i.amount || 0), 0)
    }, 0)
})

// =================================================================
// Active cell (expansao detalhes)
// =================================================================
const activeIso = ref<string | null>(null)

const activeCell = computed<CalendarCell | null>(() => {
  if (!activeIso.value) return null
  return calendarCells.value.find((c) => c.iso === activeIso.value) ?? null
})

function toggleCell(cell: CalendarCell) {
  if (cell.items.length === 0) return
  activeIso.value = activeIso.value === cell.iso ? null : cell.iso
}

// =================================================================
// Helpers de formato
// =================================================================
function formatDateLong(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return '—'
  return d
    .toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
    .replace(/^./, (c) => c.toUpperCase())
}

function kindColor(k: UnifiedKind): string {
  switch (k) {
    case 'pay':         return 'var(--brand-positive, #10b981)'
    case 'jcp':         return '#f59e0b'
    case 'rendimento':  return 'var(--brand-positive, #10b981)'
    case 'ex':          return 'var(--brand-primary)'
    case 'earnings':    return '#a78bfa'
    case 'rotate':      return '#60a5fa'
    case 'maturity':    return '#f97316'
    default:            return 'var(--brand-primary)'
  }
}

function kindIcon(k: UnifiedKind): string {
  switch (k) {
    case 'pay':         return 'i-lucide-coins'
    case 'jcp':         return 'i-lucide-banknote'
    case 'rendimento':  return 'i-lucide-coins'
    case 'ex':          return 'i-lucide-calendar-clock'
    case 'earnings':    return 'i-lucide-bar-chart-3'
    case 'rotate':      return 'i-lucide-repeat'
    case 'maturity':    return 'i-lucide-flag'
    default:            return 'i-lucide-circle'
  }
}

function kindLabel(k: UnifiedKind): string {
  switch (k) {
    case 'pay':         return 'Dividendo'
    case 'jcp':         return 'JCP'
    case 'rendimento':  return 'Rendimento'
    case 'ex':          return 'Ex-date'
    case 'earnings':    return 'Resultado'
    case 'rotate':      return 'Rotação'
    case 'maturity':    return 'Vencimento'
    default:            return 'Evento'
  }
}

// Mask BRL via interface store (igual cards anteriores)
const interfaceStore = useInterfaceStore()

function formatBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n)
}
function maskedBRL(n: number): string {
  if (!interfaceStore.revealAmount) return 'R$ ••••••'
  return formatBRL(n)
}
function formatBRL2(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
function maskedBRL2(n: number): string {
  if (!interfaceStore.revealAmount) return 'R$ ••••'
  return formatBRL2(n)
}
</script>

<style scoped>
.cal {
  width: 100%;
}

/* ============ HEAD ============ */
.cal__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.cal__title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cal__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
}

.cal__title {
  margin: 0;
  font-family: var(--brand-font);
  font-weight: 300;
  font-size: clamp(22px, 2.6vw, 28px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--text-heading, var(--brand-text));
}

.cal__lead {
  margin: 4px 0 0;
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.cal__lead-label {
  margin-right: 6px;
}

.cal__lead-value {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--brand-positive, #10b981);
}

.cal__nav {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border-radius: 11px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 70%, var(--brand-background));
}

.cal__nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: transparent;
  border: 0;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}

.cal__nav-btn:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: var(--brand-text);
}

.cal__nav-label {
  min-width: 130px;
  text-align: center;
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
}

/* ============ GRID ============ */
.cal__grid-wrap {
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background));
  overflow: hidden;
}

.cal__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 40%, transparent);
  background: color-mix(in srgb, var(--brand-border) 14%, var(--brand-surface));
}

.cal__weekday {
  padding: 9px 0;
  text-align: center;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.cal__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.cal__cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
  min-height: 95px;
  padding: 6px 7px;
  border-right: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  background: transparent;
  text-align: left;
  cursor: default;
  transition: background-color 150ms;
}

.cal__cell:nth-child(7n) {
  border-right: none;
}

.cal__cell--has {
  cursor: pointer;
}

.cal__cell--has:hover {
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}

.cal__cell--out {
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
}

.cal__cell--today {
  background: color-mix(in srgb, var(--brand-primary) 7%, transparent);
}

.cal__cell--active {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  box-shadow: inset 0 0 0 1px var(--brand-primary);
}

.cal__cell-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
}

.cal__cell-day {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--brand-text);
}

.cal__cell--out .cal__cell-day {
  color: color-mix(in srgb, var(--brand-text) 30%, transparent);
}

.cal__cell--today .cal__cell-day {
  color: var(--brand-primary);
}

.cal__cell-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 15%, transparent);
  color: var(--brand-primary);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 9px;
  font-weight: 600;
}

.cal__cell-items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cal__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 5px;
  border-radius: 5px;
  border: 1px solid;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  min-width: 0;
}

.cal__chip-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  flex-shrink: 0;
}

.cal__chip-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cal__cell-more {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  padding-left: 2px;
}

/* ============ DETAIL (linha embaixo do click) ============ */
.cal__detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 4%, var(--brand-surface));
}

.cal__detail-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cal__detail-date {
  flex: 1;
  font-family: var(--brand-font);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
}

.cal__detail-count {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.cal__detail-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.cal__detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-surface) 75%, var(--brand-background));
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
}

.cal__detail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
}

.cal__detail-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cal__detail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cal__detail-ticker {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--brand-text);
  letter-spacing: 0.005em;
}

.cal__detail-kind {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.cal__detail-sub {
  font-size: 11.5px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.cal__detail-amount {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  flex-shrink: 0;
}

/* ============ EMPTY ============ */
.cal__empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px dashed color-mix(in srgb, var(--brand-border) 55%, transparent);
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  margin: 0;
}

/* Transition */
.cal-expand-enter-active, .cal-expand-leave-active {
  transition: opacity 220ms, transform 220ms;
}
.cal-expand-enter-from, .cal-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .cal__cell { min-height: 70px; padding: 4px 5px; }
  .cal__chip-label { max-width: 50px; }
}
</style>

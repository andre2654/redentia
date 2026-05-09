<!--
  MoleculesResultadoDayTradeWeekHeatmap — heatmap 2D de operacoes
  por dia da semana × hora do pregao. O elemento "UAU" do modo
  Day Trade, equivalente em peso visual ao Calendar Heatmap ENORME
  da Carteira.

  Eixo X: dias da semana (Seg, Ter, Qua, Qui, Sex)
  Eixo Y: horas do pregao (10h-17h)
  Celula: count de trades naquele slot, com cor pelo P&L direcao
          + saturacao pelo win rate.

  Diferente do Hot Zones (1D, so hora), aqui o trader ve PADROES
  semanais: "quinta as 11h e meu pico", "segunda apos almoco e
  dreno", etc. Layout 5×8 = 40 celulas — denso mas legivel.

  Cada celula clicavel abre drill-down com trades daquele slot.
-->
<template>
  <article class="dt-week" :style="cardStyle">
    <header class="dt-week__head">
      <div class="dt-week__head-left">
        <span class="dt-week__eyebrow">Mapa semanal</span>
        <h3 class="dt-week__title" :style="{ color: brand.colors.text }">
          Quando você opera bem
        </h3>
        <p class="dt-week__sub">
          Cada célula é a interseção entre dia da semana e hora do pregão.
          Cor pelo resultado, saturação pela frequência. Clique pra ver as operações.
        </p>
      </div>
      <div v-if="hasData" class="dt-week__legend">
        <div class="dt-week__legend-row">
          <span
            class="dt-week__legend-dot"
            :style="{ backgroundColor: brand.colors.positive }"
          />
          <span class="dt-week__legend-label">Verde — sessões positivas</span>
        </div>
        <div class="dt-week__legend-row">
          <span
            class="dt-week__legend-dot"
            :style="{ backgroundColor: brand.colors.negative }"
          />
          <span class="dt-week__legend-label">Vermelho — sessões negativas</span>
        </div>
        <div class="dt-week__legend-row">
          <span class="dt-week__legend-square dt-week__legend-square--small" />
          <span class="dt-week__legend-label">Tamanho — frequência</span>
        </div>
      </div>
    </header>

    <div v-if="!hasData" class="dt-week__empty">
      <UIcon name="i-lucide-grid-3x3" class="size-6 opacity-40" :style="{ color: brand.colors.text }" />
      <span>Sem operações suficientes pra montar o mapa.</span>
    </div>

    <div v-else class="dt-week__chart">
      <!-- Header dos dias da semana (linha 1, ocupa cols 2-6) -->
      <div class="dt-week__day-labels">
        <span
          v-for="(label, i) in DAY_LABELS"
          :key="i"
          class="dt-week__day-label"
          :class="{ 'dt-week__day-label--peak': i === peakDayIdx }"
          :style="{
            color: i === peakDayIdx ? brand.colors.primary : `color-mix(in srgb, ${brand.colors.text} 55%, transparent)`,
          }"
        >{{ label }}</span>
      </div>

      <!-- Grid principal: 8 horas (linhas) × 5 dias (cols), com label
           de hora a esquerda. -->
      <div class="dt-week__grid">
        <template v-for="(hour, hi) in HOURS" :key="`row-${hour}`">
          <span
            class="dt-week__hour-label"
            :class="{ 'dt-week__hour-label--peak': hour === peakHour }"
            :style="{
              color: hour === peakHour ? brand.colors.primary : `color-mix(in srgb, ${brand.colors.text} 55%, transparent)`,
              gridRow: hi + 1,
              gridColumn: 1,
            }"
          >{{ hour }}h</span>
          <button
            v-for="(_, di) in DAY_LABELS"
            :key="`cell-${di}-${hour}`"
            type="button"
            class="dt-week__cell"
            :class="{
              'dt-week__cell--clickable': cellMap[`${di}-${hour}`]?.count > 0,
              'dt-week__cell--peak': cellMap[`${di}-${hour}`] === peakCell,
            }"
            :style="{
              backgroundColor: cellColor(cellMap[`${di}-${hour}`]),
              borderColor: cellMap[`${di}-${hour}`] === peakCell
                ? brand.colors.primary
                : `color-mix(in srgb, ${brand.colors.text} 8%, transparent)`,
              gridRow: hi + 1,
              gridColumn: di + 2,
            }"
            :title="cellTooltip(cellMap[`${di}-${hour}`], di, hour)"
            :aria-label="cellTooltip(cellMap[`${di}-${hour}`], di, hour)"
            :disabled="!(cellMap[`${di}-${hour}`]?.count > 0)"
            @click="onCellClick(di, hour)"
          >
            <span
              v-if="cellMap[`${di}-${hour}`]?.count > 0"
              class="dt-week__cell-count tabular-nums"
              :style="{ color: cellTextColor(cellMap[`${di}-${hour}`]) }"
            >{{ cellMap[`${di}-${hour}`].count }}</span>
          </button>
        </template>
      </div>
    </div>

    <!-- Insights derivados embaixo: 3 panels com peak / dreno / overall -->
    <div v-if="hasData" class="dt-week__insights">
      <div v-if="peakCell" class="dt-week__insight">
        <UIcon name="i-lucide-trophy" class="size-4 shrink-0" :style="{ color: brand.colors.primary }" />
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="dt-week__insight-label">Pico semanal</span>
          <span class="dt-week__insight-value" :style="{ color: brand.colors.text }">
            {{ DAY_LABELS[peakCell.dayIdx] }} às {{ peakCell.hour }}h
          </span>
          <span class="dt-week__insight-detail tabular-nums">
            {{ peakCell.count }} {{ peakCell.count === 1 ? 'op' : 'ops' }} ·
            {{ Math.round(peakCell.winRate * 100) }}% WR ·
            <span :style="{ color: brand.colors.positive }">{{ formatPnl(peakCell.pnl) }}</span>
          </span>
        </div>
      </div>
      <div v-if="worstCell" class="dt-week__insight">
        <UIcon name="i-lucide-alert-triangle" class="size-4 shrink-0" :style="{ color: brand.colors.negative }" />
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="dt-week__insight-label">Vale semanal</span>
          <span class="dt-week__insight-value" :style="{ color: brand.colors.text }">
            {{ DAY_LABELS[worstCell.dayIdx] }} às {{ worstCell.hour }}h
          </span>
          <span class="dt-week__insight-detail tabular-nums">
            {{ worstCell.count }} {{ worstCell.count === 1 ? 'op' : 'ops' }} ·
            {{ Math.round(worstCell.winRate * 100) }}% WR ·
            <span :style="{ color: brand.colors.negative }">{{ formatPnl(worstCell.pnl) }}</span>
          </span>
        </div>
      </div>
      <div class="dt-week__insight">
        <UIcon name="i-lucide-grid-3x3" class="size-4 shrink-0" :style="{ color: brand.colors.text }" />
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="dt-week__insight-label">Cobertura</span>
          <span class="dt-week__insight-value" :style="{ color: brand.colors.text }">
            {{ filledCells }} de 40 slots
          </span>
          <span class="dt-week__insight-detail">
            {{ Math.round((filledCells / 40) * 100) }}% da semana operada
          </span>
        </div>
      </div>
    </div>

    <!-- ============ DRILL-DOWN POPOVER ============ -->
    <Teleport to="body">
      <Transition name="dt-week-fade">
        <div
          v-if="selectedCell"
          class="dt-week-drill"
          role="dialog"
          aria-modal="true"
          aria-label="Operações no slot selecionado"
          @click.self="closeDrilldown"
        >
          <div class="dt-week-drill__card" :style="drillCardStyle">
            <span
              class="dt-week-drill__accent"
              :style="{ background: `radial-gradient(circle, color-mix(in srgb, ${drillResultColor(selectedCell.pnl)} 18%, transparent) 0%, transparent 70%)` }"
              aria-hidden="true"
            />
            <header class="dt-week-drill__head">
              <div class="flex flex-col gap-1.5 min-w-0">
                <span class="dt-week-drill__eyebrow" :style="{ color: brand.colors.primary }">Slot</span>
                <h3 class="dt-week-drill__title" :style="{ color: brand.colors.text }">
                  {{ DAY_LABELS[selectedCell.dayIdx] }} às {{ selectedCell.hour }}h
                </h3>
              </div>
              <button
                type="button"
                class="dt-week-drill__close"
                aria-label="Fechar"
                :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
                @click="closeDrilldown"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>

            <div class="dt-week-drill__totals">
              <div class="dt-week-drill__total-cell">
                <span class="dt-week-drill__total-label">P&L</span>
                <span
                  class="dt-week-drill__total-value tabular-nums"
                  :style="{ color: drillResultColor(selectedCell.pnl) }"
                >{{ formatPnl(selectedCell.pnl) }}</span>
              </div>
              <div class="dt-week-drill__total-cell">
                <span class="dt-week-drill__total-label">Win rate</span>
                <span
                  class="dt-week-drill__total-value tabular-nums"
                  :style="{ color: brand.colors.text }"
                >{{ Math.round(selectedCell.winRate * 100) }}%</span>
              </div>
              <div class="dt-week-drill__total-cell">
                <span class="dt-week-drill__total-label">Operações</span>
                <span
                  class="dt-week-drill__total-value tabular-nums"
                  :style="{ color: brand.colors.text }"
                >{{ selectedCell.count }}</span>
              </div>
            </div>

            <ul class="dt-week-drill__list">
              <li
                v-for="t in selectedCellTrades"
                :key="t.id"
                class="dt-week-drill__item"
                :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)` }"
              >
                <span
                  class="dt-week-drill__item-time tabular-nums"
                  :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
                >{{ formatDateTime(t.closedAt!) }}</span>
                <span
                  class="dt-week-drill__item-ticker tabular-nums"
                  :style="{ color: brand.colors.text }"
                >{{ t.ticker }}</span>
                <span
                  class="dt-week-drill__item-result tabular-nums"
                  :style="{ color: drillResultColor(t.resultAmount ?? 0) }"
                >{{ formatPnl(t.resultAmount ?? 0) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
  </article>
</template>

<script setup lang="ts">
import type { MockTrade } from '~/composables/useMockTrades'

const props = defineProps<{
  trades: MockTrade[]
}>()

const brand = useBrand()
const { brl } = useFormat()

// Dia da semana B3: seg-sex (1-5 do JS Date.getDay()). Sabado e dom
// nao tem pregao, sao excluidos.
const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
const HOURS = [10, 11, 12, 13, 14, 15, 16, 17]

interface WeekCell {
  dayIdx: number // 0..4
  hour: number // 10..17
  count: number
  wins: number
  losses: number
  pnl: number
  winRate: number
}

// Filtra so day-trades fechados em weekday
const dayTrades = computed(() =>
  props.trades.filter((t) => {
    if (t.kind !== 'day' || !t.closedAt) return false
    const d = new Date(t.closedAt)
    const dow = d.getDay()
    return dow >= 1 && dow <= 5
  }),
)

const hasData = computed(() => dayTrades.value.length >= 3)

// Map "{dayIdx}-{hour}" → WeekCell
const cellMap = computed(() => {
  const map: Record<string, WeekCell> = {}
  for (let di = 0; di < 5; di++) {
    for (const h of HOURS) {
      map[`${di}-${h}`] = {
        dayIdx: di,
        hour: h,
        count: 0,
        wins: 0,
        losses: 0,
        pnl: 0,
        winRate: 0,
      }
    }
  }
  for (const t of dayTrades.value) {
    const d = new Date(t.closedAt!)
    const dayIdx = d.getDay() - 1 // 0 = Seg
    const hour = d.getHours()
    if (dayIdx < 0 || dayIdx > 4) continue
    if (hour < 10 || hour > 17) continue
    const key = `${dayIdx}-${hour}`
    const cell = map[key]
    cell.count += 1
    cell.pnl += t.resultAmount ?? 0
    const r = t.resultAmount ?? 0
    if (r > 0) cell.wins += 1
    else if (r < 0) cell.losses += 1
  }
  // Computa winRate em cada cell
  for (const k of Object.keys(map)) {
    const c = map[k]
    const total = c.wins + c.losses
    c.winRate = total > 0 ? c.wins / total : 0
  }
  return map
})

const filledCells = computed(
  () => Object.values(cellMap.value).filter((c) => c.count > 0).length,
)

// Pico/vale: celulas com >=2 trades pra evitar acaso, ordenadas por
// |pnl| (positivo pico, negativo vale).
const eligibleCells = computed(() =>
  Object.values(cellMap.value).filter((c) => c.count >= 2),
)

const peakCell = computed(() => {
  const positives = eligibleCells.value.filter((c) => c.pnl > 0)
  if (!positives.length) return null
  return positives.reduce((best, c) => (c.pnl > best.pnl ? c : best))
})

const worstCell = computed(() => {
  const negatives = eligibleCells.value.filter((c) => c.pnl < 0)
  if (!negatives.length) return null
  return negatives.reduce((worst, c) => (c.pnl < worst.pnl ? c : worst))
})

// Pra highlight nas labels: dia/hora do peakCell
const peakDayIdx = computed(() => peakCell.value?.dayIdx ?? -1)
const peakHour = computed(() => peakCell.value?.hour ?? -1)

// ============ Cell coloring (modo hostil) ============
// Cor: verde puro quando pnl > 0, vermelho puro quando < 0, void
// escuro sem trade. Saturacao alta desde 1 trade — sem softening.
function cellColor(cell: WeekCell | undefined): string {
  if (!cell || cell.count === 0) {
    // Slot vazio: void escuro, sem warmth. Suga a luz pra contraste
    // com as celulas saturadas vizinhas.
    return `color-mix(in srgb, ${brand.colors.text} 10%, ${brand.colors.background})`
  }
  const base = cell.pnl >= 0 ? brand.colors.positive : brand.colors.negative
  // Saturacao: 60% (1 trade) ate 100% (4+ trades). Cell de 4+ trades
  // recebe a cor PURA do brand — agressivo, terminal, sem softening.
  const intensity = Math.min(1, cell.count / 4)
  const saturation = 60 + intensity * 40
  return `color-mix(in srgb, ${base} ${saturation}%, ${brand.colors.background})`
}

function cellTextColor(cell: WeekCell | undefined): string {
  if (!cell || cell.count === 0) {
    return `color-mix(in srgb, ${brand.colors.text} 30%, transparent)`
  }
  // Branco direto — texto sobre cor saturada precisa de contraste alto.
  return '#ffffff'
}

function cellTooltip(cell: WeekCell | undefined, di: number, hour: number): string {
  if (!cell || cell.count === 0) return `${DAY_LABELS[di]} às ${hour}h · sem operações`
  const sign = cell.pnl >= 0 ? '+' : '−'
  return `${DAY_LABELS[di]} às ${hour}h · ${cell.count} ${cell.count === 1 ? 'op' : 'ops'} · ${Math.round(cell.winRate * 100)}% WR · ${sign}${brl(Math.abs(cell.pnl))}`
}

// ============ Drill-down ============
const selectedCell = ref<WeekCell | null>(null)

function onCellClick(dayIdx: number, hour: number) {
  const cell = cellMap.value[`${dayIdx}-${hour}`]
  if (!cell || cell.count === 0) return
  selectedCell.value = cell
}

function closeDrilldown() {
  selectedCell.value = null
}

const selectedCellTrades = computed(() => {
  const cell = selectedCell.value
  if (!cell) return []
  return dayTrades.value
    .filter((t) => {
      const d = new Date(t.closedAt!)
      return d.getDay() - 1 === cell.dayIdx && d.getHours() === cell.hour
    })
    .sort((a, b) => new Date(a.closedAt!).getTime() - new Date(b.closedAt!).getTime())
})

// ESC fecha
if (typeof window !== 'undefined') {
  watch(selectedCell, (v) => {
    if (!v) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrilldown()
    }
    window.addEventListener('keydown', handler, { once: false })
    const stop = watch(selectedCell, (next) => {
      if (next === null) {
        window.removeEventListener('keydown', handler)
        stop()
      }
    })
  })
}

function formatPnl(v: number): string {
  if (v === 0) return '—'
  const sign = v > 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(v))}`
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${date} ${time}`
}

function drillResultColor(v: number): string {
  if (v === 0) return `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`
  return v > 0 ? brand.colors.positive : brand.colors.negative
}

const cardStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  boxShadow: `0 8px 22px -16px color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`,
}))

const drillCardStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  boxShadow: `0 24px 60px -28px color-mix(in srgb, ${brand.colors.primary} 40%, transparent), 0 12px 30px -16px rgba(0, 0, 0, 0.32)`,
}))
</script>

<style scoped>
.dt-week {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid;
  padding: 24px 26px 26px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
}

.dt-week::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 280px;
  height: 280px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary) 9%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.dt-week__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  position: relative;
}

.dt-week__head-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 480px;
}

.dt-week__eyebrow {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-primary) 90%, transparent);
}

.dt-week__title {
  font-size: clamp(20px, 2.4vw, 26px);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.15;
  font-family: var(--brand-font, system-ui, sans-serif);
}

.dt-week__sub {
  font-size: 12.5px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  font-family: var(--brand-font, system-ui, sans-serif);
}

.dt-week__legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dt-week__legend-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.dt-week__legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dt-week__legend-square {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background-color: color-mix(in srgb, var(--brand-text) 25%, transparent);
}

.dt-week__legend-label {
  font-size: 11px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.dt-week__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 240px;
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

/* ============ CHART (5×8 grid + labels) ============ */
.dt-week__chart {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.dt-week__day-labels {
  display: grid;
  grid-template-columns: 48px repeat(5, 1fr);
  gap: 2px;
  padding-left: 0;
}

.dt-week__day-label {
  grid-column: span 1;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  text-align: center;
  transition: color 200ms;
}

.dt-week__day-label:first-child { display: none; }

.dt-week__day-label--peak {
  font-weight: 700;
}

.dt-week__grid {
  display: grid;
  grid-template-columns: 48px repeat(5, 1fr);
  grid-auto-rows: minmax(56px, 1fr);
  /* Gap apertado tipo terminal grid — celulas quase coladas, separadas
     so por uma linha fina. Reforca o registro "panel hostil". */
  gap: 2px;
}

.dt-week__hour-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  transition: color 200ms;
}

.dt-week__hour-label--peak {
  font-weight: 700;
}

.dt-week__cell {
  position: relative;
  /* Bordas retas — registro "terminal panel". Sem softening visual. */
  border-radius: 0;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  padding: 0;
  transition: outline 120ms ease, border-color 120ms ease;
  font-family: var(--font-mono, ui-monospace, monospace);
  -webkit-appearance: none;
  appearance: none;
}

.dt-week__cell--clickable {
  cursor: pointer;
}

/* Hover: outline branco fino e cortante, sem scale ou shadow soft.
   Sense de "stab" / "select" tipo terminal Bloomberg. */
.dt-week__cell--clickable:hover {
  z-index: 2;
  outline: 2px solid var(--brand-text);
  outline-offset: -2px;
}

/* Peak: border 2px primary solido, sem glow externo. Sharp edge. */
.dt-week__cell--peak {
  border-width: 2px;
  border-color: var(--brand-primary) !important;
}

.dt-week__cell:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: -2px;
  z-index: 3;
}

.dt-week__cell-count {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

/* ============ INSIGHTS embaixo ============ */
.dt-week__insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}

.dt-week__insight {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background-color: color-mix(in srgb, var(--brand-text) 4%, transparent);
}

.dt-week__insight-label {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dt-week__insight-value {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.005em;
}

.dt-week__insight-detail {
  font-size: 11.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .dt-week__cell--clickable:hover {
    transform: none;
  }
}

@media (max-width: 720px) {
  .dt-week__legend {
    display: none;
  }
  .dt-week__day-labels,
  .dt-week__grid {
    grid-template-columns: 36px repeat(5, 1fr);
    gap: 6px;
  }
  .dt-week__grid {
    grid-auto-rows: minmax(40px, 1fr);
  }
  .dt-week__cell-count {
    font-size: 12px;
  }
}
</style>

<!-- Drill-down popover styles (nao scoped — Teleport pra <body>) -->
<style>
.dt-week-drill {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  font-family: var(--brand-font, system-ui, sans-serif);
}

.dt-week-drill__card {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid;
  padding: 20px 22px 18px;
}

.dt-week-drill__accent {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  pointer-events: none;
}

.dt-week-drill__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  margin-bottom: 16px;
}

.dt-week-drill__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.dt-week-drill__title {
  font-size: 18px;
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.dt-week-drill__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  transition: background-color 140ms ease;
  flex-shrink: 0;
}

.dt-week-drill__close:hover {
  background-color: color-mix(in srgb, var(--brand-text) 8%, transparent);
}

.dt-week-drill__totals {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background-color: color-mix(in srgb, var(--brand-text) 4%, transparent);
}

.dt-week-drill__total-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dt-week-drill__total-label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dt-week-drill__total-value {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
}

.dt-week-drill__list {
  flex: 1 1 auto;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.dt-week-drill__item {
  display: grid;
  grid-template-columns: 90px 1fr 110px;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
  border-top: 1px solid;
  font-size: 13px;
}

.dt-week-drill__item:first-child {
  border-top: none;
}

.dt-week-drill__item-time {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.dt-week-drill__item-ticker {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.dt-week-drill__item-result {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.dt-week-fade-enter-active,
.dt-week-fade-leave-active {
  transition: opacity 180ms ease;
}

.dt-week-fade-enter-from,
.dt-week-fade-leave-to {
  opacity: 0;
}

.dt-week-fade-enter-active .dt-week-drill__card,
.dt-week-fade-leave-active .dt-week-drill__card {
  transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dt-week-fade-enter-from .dt-week-drill__card {
  transform: translateY(8px) scale(0.98);
}

.dt-week-fade-leave-to .dt-week-drill__card {
  transform: translateY(-4px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .dt-week-fade-enter-active,
  .dt-week-fade-leave-active,
  .dt-week-fade-enter-active .dt-week-drill__card,
  .dt-week-fade-leave-active .dt-week-drill__card {
    transition: none;
  }
  .dt-week-fade-enter-from .dt-week-drill__card,
  .dt-week-fade-leave-to .dt-week-drill__card {
    transform: none;
  }
}
</style>

<!--
  MoleculesResultadoCarteiraHeatmap — calendario heatmap GitHub-style.

  Cada celula e um dia. Cor por intensidade do P&L:
    - Sem trade: neutro fundo (color-mix com text @ 6%)
    - P&L > 0: verde (positive) com saturation por |P&L|
    - P&L < 0: vermelho (negative) com saturation por |P&L|

  Dois tamanhos via prop `size`:
    - 'compact' (default) — celulas 14px, sem labels, sem numero do dia.
                            Era o layout antigo, util pra cards densos.
    - 'huge' — celulas 36px, eixo de dias da semana a esquerda,
              numero do dia DENTRO de cada celula, mes label maior,
              gap generoso. Used quando o heatmap fecha a pagina e
              merece destaque visual.
-->
<template>
  <article class="heatmap" :class="`heatmap--${size}`" :style="containerStyle">
    <header class="heatmap__head">
      <span class="heatmap__eyebrow">Calendário</span>
      <div class="heatmap__head-right">
        <!-- Legenda compacta: menos / mais -->
        <div class="heatmap__legend"
          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">
          <span>Pior</span>
          <div
            v-for="(c, i) in legendCells"
            :key="i"
            class="legend-cell"
            :style="{ backgroundColor: c }"
          />
          <span>Melhor</span>
        </div>
      </div>
    </header>

    <div v-if="!series.length" class="empty">
      <UIcon
        name="i-lucide-calendar-x"
        class="size-6 opacity-40"
        :style="{ color: brand.colors.text }"
      />
      <span class="empty__text">Sem operações neste período.</span>
    </div>

    <div v-else class="heatmap__scroller">
      <div class="heatmap__grid" :style="gridStyle">
        <!-- Header de dias da semana (so no modo huge, na coluna 1) -->
        <template v-if="size === 'huge'">
          <div
            v-for="(label, idx) in weekdayLabels"
            :key="`wd-${idx}`"
            class="heatmap__weekday"
            :style="{
              gridColumn: 1,
              gridRow: idx + 2,
              color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
            }"
          >{{ label }}</div>
        </template>

        <!-- Header de meses no topo do grid (linha 1). Ocupa todas as
             colunas, vazio na maioria das celulas; mes aparece so no
             primeiro dia de cada mes. -->
        <div
          v-for="(label, idx) in monthLabels"
          :key="`m-${idx}`"
          class="heatmap__month"
          :style="{ gridColumn: label.col, color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
        >{{ label.text }}</div>

        <!-- Celulas dos dias. Renderizadas em ordem (semana, weekday)
             mapeadas via grid-row/grid-column. Dia atual ganha
             classe `--today` que aplica borda forte na cor de brand. -->
        <button
          v-for="cell in cells"
          :key="cell.date"
          type="button"
          class="heatmap__cell"
          :class="{
            'heatmap__cell--today': cell.isToday,
            'heatmap__cell--clickable': cell.hasTrades && trades.length > 0,
          }"
          :style="{
            gridColumn: cell.col,
            gridRow: cell.row,
            backgroundColor: cell.color,
            outlineColor: cell.isToday ? brand.colors.primary : cell.outline,
            outlineWidth: cell.isToday ? '2px' : '1px',
            color: cell.textColor,
          }"
          :title="cell.tooltip"
          :aria-label="cell.tooltip"
          :disabled="!cell.hasTrades || trades.length === 0"
          @click="onCellClick(cell.date)"
        >
          <!-- No modo huge, mostra o numero do dia dentro da celula.
               Cor adapta: dias com P&L significativo recebem texto
               de alto contraste, dias sem trade ficam muted. -->
          <span v-if="size === 'huge'" class="heatmap__day-number">
            {{ cell.dayNumber }}
          </span>
        </button>
      </div>
    </div>

    <!-- Sub-stats embaixo. No modo huge, ganha mais peso visual + 1 stat
         extra (streak de dias positivos consecutivos). -->
    <div
      v-if="series.length"
      class="heatmap__stats"
      :class="`heatmap__stats--${size}`"
    >
      <span class="heatmap__stat">
        <span class="heatmap__stat-label">Melhor dia</span>
        <span
          class="heatmap__stat-value tabular-nums"
          :style="{ color: brand.colors.positive }"
        >{{ bestDayLabel }}</span>
      </span>
      <span class="heatmap__stat">
        <span class="heatmap__stat-label">Pior dia</span>
        <span
          class="heatmap__stat-value tabular-nums"
          :style="{ color: brand.colors.negative }"
        >{{ worstDayLabel }}</span>
      </span>
      <span class="heatmap__stat">
        <span class="heatmap__stat-label">Dias no azul</span>
        <span class="heatmap__stat-value tabular-nums" :style="{ color: brand.colors.text }">
          {{ positiveDays }} / {{ totalDays }}
        </span>
      </span>
      <span v-if="size === 'huge' && longestStreak > 0" class="heatmap__stat">
        <span class="heatmap__stat-label">Maior sequência verde</span>
        <span class="heatmap__stat-value tabular-nums" :style="{ color: brand.colors.positive }">
          {{ longestStreak }} {{ longestStreak === 1 ? 'dia' : 'dias' }}
        </span>
      </span>
    </div>

    <!-- ============ DRILL-DOWN POPOVER ============
         Modal centralizado que abre ao clicar numa celula do heatmap
         (so quando ha trades nela). Mostra data, P&L do dia e lista
         cronologica de trades daquele dia. Click no backdrop ou ESC
         fecha. Renderiza com Teleport pra escapar do overflow:hidden
         do container do heatmap. -->
    <Teleport to="body">
      <Transition name="drill-fade">
        <div
          v-if="selectedDate"
          class="heatmap-drill"
          role="dialog"
          aria-modal="true"
          :aria-label="`Operações em ${drilldownDateLabel}`"
          @click.self="closeDrilldown"
        >
          <div class="heatmap-drill__card" :style="drillCardStyle">
            <span
              class="heatmap-drill__accent"
              :style="{ background: `radial-gradient(circle, color-mix(in srgb, ${drillResultColor(drilldownDayPnl)} 18%, transparent) 0%, transparent 70%)` }"
              aria-hidden="true"
            />

            <header class="heatmap-drill__head">
              <div class="flex flex-col gap-1.5 min-w-0">
                <span
                  class="heatmap-drill__eyebrow"
                  :style="{ color: brand.colors.primary }"
                >Drill-down</span>
                <h3
                  class="heatmap-drill__title"
                  :style="{ color: brand.colors.text }"
                >{{ drilldownDateLabel }}</h3>
              </div>
              <button
                type="button"
                class="heatmap-drill__close"
                aria-label="Fechar"
                :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
                @click="closeDrilldown"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>

            <div class="heatmap-drill__totals">
              <div class="heatmap-drill__total-cell">
                <span class="heatmap-drill__total-label">
                  {{ mode === 'dividends' ? 'Proventos do dia' : 'Resultado do dia' }}
                </span>
                <span
                  class="heatmap-drill__total-value tabular-nums"
                  :style="{ color: drillResultColor(drilldownDayPnl) }"
                >{{ drillFormatResult(drilldownDayPnl) }}</span>
              </div>
              <div class="heatmap-drill__total-cell">
                <span class="heatmap-drill__total-label">
                  {{ mode === 'dividends' ? 'Pagamentos' : 'Operações' }}
                </span>
                <span
                  class="heatmap-drill__total-value tabular-nums"
                  :style="{ color: brand.colors.text }"
                >{{ drilldownTrades.length }}</span>
              </div>
            </div>

            <ul class="heatmap-drill__list">
              <li
                v-for="t in drilldownTrades"
                :key="t.id"
                class="heatmap-drill__item"
                :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)` }"
              >
                <span
                  class="heatmap-drill__item-time tabular-nums"
                  :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
                >{{ formatDrilldownTime(t.closedAt ?? t.openedAt) }}</span>
                <span
                  class="heatmap-drill__item-ticker tabular-nums"
                  :style="{ color: brand.colors.text }"
                >{{ t.ticker }}</span>
                <span
                  class="heatmap-drill__item-kind"
                  :style="{
                    color: drillResultColor(t.resultAmount),
                    borderColor: `color-mix(in srgb, ${drillResultColor(t.resultAmount)} 30%, transparent)`,
                  }"
                >{{ drillKindLabel(t.kind) }}</span>
                <span
                  class="heatmap-drill__item-result tabular-nums"
                  :style="{ color: drillResultColor(t.resultAmount) }"
                >{{ drillFormatResult(t.resultAmount) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
  </article>
</template>

<script setup lang="ts">
import type { DailyPnLPoint, ResultPeriod } from '~/composables/useResultadoStats'

const props = withDefaults(
  defineProps<{
    series: DailyPnLPoint[]
    period: ResultPeriod
    /**
     * 'compact' = celulas 14px (default, antigo).
     * 'huge'    = celulas 36px com numero do dia + eixo de weekday.
     */
    size?: 'compact' | 'huge'
    /**
     * Trades opcionais. Quando providos, clicar numa celula abre um
     * drill-down popover com a lista de operacoes daquele dia. Sem
     * trades, o clique e no-op.
     */
    trades?: import('~/composables/useMockTrades').MockTrade[]
    /**
     * Filtra o drill-down por tipo de evento:
     *   'sells'     → so vendas (closedAt + side BUY/SELL)
     *   'dividends' → so dividendos / JCP / income
     * Default 'sells' mantem comportamento antigo.
     */
    mode?: 'sells' | 'dividends'
  }>(),
  {
    size: 'compact',
    trades: () => [],
    mode: 'sells',
  },
)

const brand = useBrand()
const { brl } = useFormat()

// Mapa rapido data → ponto pra lookup dentro do grid.
const seriesMap = computed(() => {
  const m = new Map<string, DailyPnLPoint>()
  for (const p of props.series) m.set(p.date, p)
  return m
})

// Janela: comeca no primeiro domingo BEFORE-OR-EQUAL ao primeiro
// dia do periodo, e termina no proximo sabado AFTER-OR-EQUAL ao
// ultimo. Garante grid retangular limpo.
function startOfWindow(): Date {
  if (!props.series.length) return new Date()
  const first = new Date(props.series[0].date + 'T00:00:00')
  const day = first.getDay()
  first.setDate(first.getDate() - day)
  return first
}
function endOfWindow(): Date {
  if (!props.series.length) return new Date()
  const last = new Date(props.series[props.series.length - 1].date + 'T00:00:00')
  const day = last.getDay()
  last.setDate(last.getDate() + (6 - day))
  return last
}

// Magnitude maxima absoluta pra calibrar saturacao de cores.
const maxAbs = computed(() =>
  props.series.reduce((m, p) => Math.max(m, Math.abs(p.pnl)), 1),
)

function colorFor(pnl: number | null): string {
  if (pnl == null) return `color-mix(in srgb, ${brand.colors.text} 6%, transparent)`
  if (pnl === 0) return `color-mix(in srgb, ${brand.colors.text} 8%, transparent)`
  const intensity = Math.min(1, Math.abs(pnl) / maxAbs.value)
  const pct = 18 + intensity * 70 // 18% → 88%
  const base = pnl > 0 ? brand.colors.positive : brand.colors.negative
  return `color-mix(in srgb, ${base} ${pct}%, ${brand.colors.surface})`
}

// Cor do texto (numero do dia) por intensidade. Quando ha trade pesado
// (>50% do max abs), texto e branco/preto pra contraste; senao,
// muted (mesma cor de label).
function textColorFor(pnl: number | null): string {
  if (pnl == null || pnl === 0) {
    return `color-mix(in srgb, ${brand.colors.text} 35%, transparent)`
  }
  const intensity = Math.abs(pnl) / maxAbs.value
  if (intensity > 0.5) {
    // Cores fortes: usa branco em saturacao alta (legivel sobre verde/vermelho)
    return '#ffffff'
  }
  return `color-mix(in srgb, ${brand.colors.text} 70%, transparent)`
}

interface Cell {
  date: string
  dayNumber: number
  col: number
  row: number
  color: string
  outline: string
  tooltip: string
  textColor: string
  isToday: boolean
  /** True quando ha trades naquele dia (pra habilitar drill-down). */
  hasTrades: boolean
}

// Data de hoje no fuso local (formato YYYY-MM-DD) pra match exato com
// `cell.date`. Usamos `new Date()` ao inves de string fixed pra que
// "hoje" sempre acompanhe o relogio do user. Computado uma vez como
// const por render (e estavel pelo tempo da sessao).
const todayIso = new Date().toISOString().slice(0, 10)

// ============ Drill-down state ============
// Quando o user clica numa celula com trades, abrimos um popover
// modal-like centralizado mostrando: data, P&L do dia, lista de
// trades. Reset on close.
const selectedDate = ref<string | null>(null)

function onCellClick(date: string) {
  if (!props.trades.length) return
  // So abre se ha trades no dia (botao ja esta disabled mas guardamos)
  const dayTrades = props.trades.filter((t) => {
    const ref = t.closedAt ?? t.openedAt
    return ref.slice(0, 10) === date
  })
  if (!dayTrades.length) return
  selectedDate.value = date
}

function closeDrilldown() {
  selectedDate.value = null
}

// Lista APENAS trades realizados nesse dia, filtrados por `mode`:
//   'sells'     → vendas (operacoes fechadas com closedAt + side BUY/SELL)
//   'dividends' → dividendos / JCP creditados
// Posicoes em aberto nunca entram aqui (closedAt null) — o "Resultado
// do dia" e sempre P&L realizado, nao mark-to-market flutuante.
const drilldownTrades = computed(() => {
  if (!selectedDate.value) return []
  const isIncome = (t: typeof props.trades[number]) =>
    t.side === 'DIVIDEND' || t.side === 'JCP' || t.side === 'INCOME'

  return props.trades
    .filter((t) => {
      if (!t.closedAt) return false
      if (t.closedAt.slice(0, 10) !== selectedDate.value) return false
      return props.mode === 'dividends' ? isIncome(t) : !isIncome(t)
    })
    .sort((a, b) => {
      return new Date(a.closedAt!).getTime() - new Date(b.closedAt!).getTime()
    })
})

const drilldownDayPnl = computed(() =>
  drilldownTrades.value.reduce((s, t) => s + (t.resultAmount ?? 0), 0),
)

const drilldownDateLabel = computed(() => {
  if (!selectedDate.value) return ''
  const d = new Date(selectedDate.value + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
})

// ESC fecha o popover
if (typeof window !== 'undefined') {
  watch(selectedDate, (v) => {
    if (!v) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrilldown()
    }
    window.addEventListener('keydown', handler, { once: false })
    // Cleanup quando muda pra null
    const stop = watch(selectedDate, (next) => {
      if (next === null) {
        window.removeEventListener('keydown', handler)
        stop()
      }
    })
  })
}

function formatDrilldownTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function drillResultColor(amount: number | null | undefined): string {
  if (amount == null || amount === 0) {
    return `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`
  }
  return amount > 0 ? brand.colors.positive : brand.colors.negative
}

function drillFormatResult(amount: number | null | undefined): string {
  if (amount == null) return '—'
  if (amount === 0) return brl(0)
  const sign = amount > 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(amount))}`
}

function drillKindLabel(kind: string): string {
  return ({ day: 'Day', swing: 'Swing', hold: 'Hold' } as Record<string, string>)[kind] ?? kind
}

const drillCardStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  boxShadow: `0 24px 60px -28px color-mix(in srgb, ${brand.colors.primary} 40%, transparent), 0 12px 30px -16px rgba(0, 0, 0, 0.32)`,
}))

const cells = computed<Cell[]>(() => {
  if (!props.series.length) return []
  const start = startOfWindow()
  const end = endOfWindow()
  const out: Cell[] = []
  const cursor = new Date(start)
  // Em modo huge, coluna 1 e ocupada pela legenda de dias da semana,
  // entao as colunas de celula comecam em 2. Compact mantem a partir de 1.
  const dayColOffset = props.size === 'huge' ? 1 : 0
  let col = 1 + dayColOffset
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10)
    const point = seriesMap.value.get(iso)
    const row = cursor.getDay() + 2 // +2: linha 1 e header de mes; dias comecam na linha 2
    const pnl = point ? point.pnl : null
    out.push({
      date: iso,
      dayNumber: cursor.getDate(),
      col,
      row,
      color: colorFor(pnl),
      outline: point && point.pnl !== 0
        ? `color-mix(in srgb, ${brand.colors.text} 12%, transparent)`
        : 'transparent',
      tooltip: tooltipText(iso, point),
      textColor: textColorFor(pnl),
      isToday: iso === todayIso,
      hasTrades: !!(point && point.trades > 0),
    })
    cursor.setDate(cursor.getDate() + 1)
    if (cursor.getDay() === 0) col += 1
  }
  return out
})

function tooltipText(iso: string, p: DailyPnLPoint | undefined): string {
  const d = new Date(iso + 'T00:00:00')
  const dateLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  if (!p) return `${dateLabel} · sem operações`
  const sign = p.pnl >= 0 ? '+' : '−'
  return `${dateLabel} · ${sign}${brl(Math.abs(p.pnl))} · ${p.trades} ${p.trades === 1 ? 'operação' : 'operações'}`
}

// Header de meses: percorre as colunas e poe label no primeiro dia
// do mes que aparece naquela coluna.
const monthLabels = computed(() => {
  if (!props.series.length) return []
  const start = startOfWindow()
  const end = endOfWindow()
  const labels: Array<{ col: number; text: string }> = []
  const cursor = new Date(start)
  const dayColOffset = props.size === 'huge' ? 1 : 0
  let col = 1 + dayColOffset
  let lastMonth = -1
  while (cursor <= end) {
    if (cursor.getMonth() !== lastMonth && cursor.getDate() <= 7) {
      labels.push({
        col,
        text: cursor.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      })
      lastMonth = cursor.getMonth()
    }
    cursor.setDate(cursor.getDate() + 1)
    if (cursor.getDay() === 0) col += 1
  }
  return labels
})

// Eixo de dias da semana (so no modo huge). Ordem grid: dom, seg, ter,
// qua, qui, sex, sab. Mostramos abreviacao 1-letra (D S T Q Q S S) pra
// economizar espaco; pra periodos longos, fica claro pelo contexto.
const weekdayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const gridStyle = computed(() => {
  // Numero de semanas (colunas) pra dimensionar o grid.
  const totalWeeks = props.series.length
    ? Math.ceil(((endOfWindow().getTime() - startOfWindow().getTime()) / (1000 * 60 * 60 * 24) + 1) / 7)
    : 0

  if (props.size === 'huge') {
    // Modo huge: colunas usam minmax(0, 1fr) pra encher a largura
    // disponivel do container. As celulas ficam quadradas via
    // `aspect-ratio: 1` (no CSS), entao a altura segue a largura
    // calculada. Em telas largas, celulas ficam ~40-50px;
    // em mobile, ~14-20px (sem scroll horizontal). Primeira coluna
    // e o eixo de weekday — fixa em 32px pra acomodar abreviacao
    // "D S T Q Q S S".
    return {
      gridTemplateColumns: `32px repeat(${totalWeeks}, minmax(18px, 1fr))`,
      gridTemplateRows: 'auto repeat(7, auto)',
      gap: '6px',
    }
  }

  // Modo compact (default): celulas fixas em 14px, sem flex.
  return {
    gridTemplateColumns: `repeat(${totalWeeks}, 14px)`,
    gridTemplateRows: '14px repeat(7, 14px)',
    gap: '3px',
  }
})

// Legenda: 5 niveis de cor positiva (do menor pro maior intensidade)
const legendCells = computed(() => {
  return [-0.6, -0.2, 0, 0.2, 0.6].map((f) => colorFor(f * maxAbs.value))
})

const bestDay = computed(() =>
  props.series.length ? props.series.reduce((b, p) => (p.pnl > b.pnl ? p : b)) : null,
)
const worstDay = computed(() =>
  props.series.length ? props.series.reduce((w, p) => (p.pnl < w.pnl ? p : w)) : null,
)
const positiveDays = computed(() => props.series.filter((p) => p.pnl > 0).length)
const totalDays = computed(() => props.series.filter((p) => p.pnl !== 0).length)

// Maior sequencia (streak) de dias positivos consecutivos. Series ja
// vem ordenada por data ascendente do composable.
const longestStreak = computed(() => {
  let best = 0
  let current = 0
  for (const p of props.series) {
    if (p.pnl > 0) {
      current += 1
      if (current > best) best = current
    } else {
      current = 0
    }
  }
  return best
})

const bestDayLabel = computed(() => {
  if (!bestDay.value) return '—'
  const d = new Date(bestDay.value.date + 'T00:00:00')
  const dateLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  return `+${brl(bestDay.value.pnl)} · ${dateLabel}`
})

const worstDayLabel = computed(() => {
  if (!worstDay.value) return '—'
  const d = new Date(worstDay.value.date + 'T00:00:00')
  const dateLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  return `${brl(worstDay.value.pnl).replace('-', '−')} · ${dateLabel}`
})

const containerStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  boxShadow: `0 8px 22px -16px color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`,
}))
</script>

<style scoped>
.heatmap {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-radius: 16px;
  border: 1px solid;
  position: relative;
  overflow: hidden;
}

.heatmap--compact {
  padding: 18px 20px;
}

.heatmap--huge {
  padding: 28px 32px 32px;
  gap: 24px;
}

.heatmap::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary) 7%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.heatmap--huge::before {
  width: 320px;
  height: 320px;
  top: -60px;
  right: -60px;
}

.heatmap__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  position: relative;
}

.heatmap__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.heatmap--huge .heatmap__eyebrow {
  font-size: 11.5px;
}

.heatmap__head-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.heatmap__legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  letter-spacing: 0.04em;
}

.heatmap--huge .heatmap__legend {
  gap: 8px;
  font-size: 11px;
}

.heatmap__scroller {
  overflow-x: auto;
  scrollbar-width: thin;
  padding-bottom: 4px;
  position: relative;
}
.heatmap__scroller::-webkit-scrollbar { height: 6px; }
.heatmap__scroller::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--brand-text) 14%, transparent);
  border-radius: 3px;
}

.heatmap__grid {
  display: grid;
  align-items: start;
}

.heatmap__weekday {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-align: right;
  padding-right: 8px;
  align-self: center;
}

.heatmap__month {
  grid-row: 1;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  align-self: end;
  padding-left: 2px;
}

.heatmap--huge .heatmap__month {
  font-size: 12px;
  letter-spacing: 0.12em;
  font-weight: 600;
}

.heatmap__cell {
  border-radius: 3px;
  outline: 1px solid transparent;
  outline-offset: -1px;
  transition: transform 100ms ease;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heatmap--compact .heatmap__cell {
  width: 14px;
  height: 14px;
}

/* Modo huge: celulas estiram pra encher a largura disponivel via
   `1fr` no grid-template-columns. `aspect-ratio: 1` mantem
   proporcao quadrada — altura segue a largura calculada pelo grid.
   Resultado: em telas largas, celulas viram quadrados maiores (40-50px);
   em mobile, ficam pequenas (14-18px) sem precisar de scroll. */
.heatmap--huge .heatmap__cell {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
}

.heatmap__cell:hover {
  transform: scale(1.15);
  z-index: 1;
  position: relative;
  box-shadow: 0 4px 14px -6px color-mix(in srgb, var(--brand-text) 28%, transparent);
}

.heatmap--compact .heatmap__cell:hover {
  transform: scale(1.3);
}

/* Dia atual: borda em brand-primary com glow sutil + leve halo
   pulsante pra puxar o olho. Como `outlineColor`/`outlineWidth` ja
   sao aplicados via :style inline (com brand.colors.primary
   resolvido em runtime), aqui so adicionamos o glow + pulse. */
.heatmap__cell--today {
  z-index: 2;
  position: relative;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}

.heatmap--huge .heatmap__cell--today {
  box-shadow:
    0 0 0 4px color-mix(in srgb, var(--brand-primary) 22%, transparent),
    0 6px 18px -8px color-mix(in srgb, var(--brand-primary) 40%, transparent);
}

.heatmap__cell--today .heatmap__day-number {
  color: var(--brand-primary) !important;
  font-weight: 700;
}

.heatmap__day-number {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  user-select: none;
}

/* Modo huge: font scala com viewport pra parecer proporcional ao
   tamanho variavel das celulas (clamp 10px-14px). Em telas largas
   onde celulas chegam a 50px, font fica 14px; em mobile com celulas
   de 18-20px, font cai pra 10px (pode ate truncar mas mantem o
   conjunto visualmente coerente). */
.heatmap--huge .heatmap__day-number {
  font-size: clamp(10px, 1.05vw, 14px);
}

.legend-cell {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.heatmap--huge .legend-cell {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 160px;
}

.heatmap--huge .empty {
  height: 280px;
}

.empty__text {
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.heatmap__stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 4px;
}

.heatmap__stats--compact {
  gap: 8px 20px;
}

.heatmap__stats--huge {
  gap: 14px 36px;
  padding-top: 12px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}

.heatmap__stat {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
}

.heatmap--huge .heatmap__stat {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.heatmap__stat-label {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.heatmap--huge .heatmap__stat-label {
  font-size: 11px;
  letter-spacing: 0.18em;
}

.heatmap__stat-value {
  font-size: 13px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.heatmap--huge .heatmap__stat-value {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

@media (prefers-reduced-motion: reduce) {
  .heatmap__cell:hover { transform: none; }
}

/* Cell button reset — overrides do <button> default pra herdar
   visual do <div> original. */
.heatmap__cell {
  border: none;
  padding: 0;
  font: inherit;
  cursor: default;
  -webkit-appearance: none;
  appearance: none;
}

.heatmap__cell--clickable {
  cursor: pointer;
}

.heatmap__cell:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
  z-index: 2;
}
</style>

<!-- Estilos do drill-down popover. NAO scoped: o Teleport joga o
     conteudo no <body>, fora do scope de scoped:false do <style>
     scoped. Renderiza com global selectors via tag <style> sem
     scoped. -->
<style>
.heatmap-drill {
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

.heatmap-drill__card {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid;
  padding: 20px 22px 18px;
}

.heatmap-drill__accent {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  pointer-events: none;
}

.heatmap-drill__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  margin-bottom: 16px;
}

.heatmap-drill__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.heatmap-drill__title {
  font-size: 18px;
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -0.01em;
  text-transform: capitalize;
}

.heatmap-drill__close {
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

.heatmap-drill__close:hover {
  background-color: color-mix(in srgb, var(--brand-text) 8%, transparent);
}

.heatmap-drill__totals {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background-color: color-mix(in srgb, var(--brand-text) 4%, transparent);
}

.heatmap-drill__total-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-drill__total-label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.heatmap-drill__total-value {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
}

.heatmap-drill__list {
  flex: 1 1 auto;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.heatmap-drill__item {
  display: grid;
  grid-template-columns: 56px 1fr 56px 110px;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
  border-top: 1px solid;
  font-size: 13px;
}

.heatmap-drill__item:first-child {
  border-top: none;
}

.heatmap-drill__item-time {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.heatmap-drill__item-ticker {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.heatmap-drill__item-kind {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  padding: 2px 6px;
  border: 1px solid;
  border-radius: 999px;
  line-height: 1.2;
}

.heatmap-drill__item-result {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.drill-fade-enter-active,
.drill-fade-leave-active {
  transition: opacity 180ms ease;
}

.drill-fade-enter-from,
.drill-fade-leave-to {
  opacity: 0;
}

.drill-fade-enter-active .heatmap-drill__card,
.drill-fade-leave-active .heatmap-drill__card {
  transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.drill-fade-enter-from .heatmap-drill__card {
  transform: translateY(8px) scale(0.98);
}

.drill-fade-leave-to .heatmap-drill__card {
  transform: translateY(-4px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .drill-fade-enter-active,
  .drill-fade-leave-active,
  .drill-fade-enter-active .heatmap-drill__card,
  .drill-fade-leave-active .heatmap-drill__card {
    transition: none;
  }
  .drill-fade-enter-from .heatmap-drill__card,
  .drill-fade-leave-to .heatmap-drill__card {
    transform: none;
  }
}
</style>

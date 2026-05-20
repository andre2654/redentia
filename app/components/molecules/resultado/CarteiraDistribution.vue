<!--
  MoleculesResultadoCarteiraDistribution — duas visualizacoes pareadas:

   1. Donut "Por estilo" (Day/Swing/Hold/Renda) — mesma receita do
      AllocationSection donut: SVG 168px, slices com gap visual,
      hover dim + scale, center text adapta ao slice ativo, legenda
      enriquecida com mini-bars.

   2. Bars "Por instrumento" — stacked bar 100% no topo + legenda
      vertical com dots coloridos + porcentagem.

  Por que pareado: ambas respondem a "como meu P&L se distribui".
  Estilo = lente comportamental (operacional vs longo prazo).
  Instrumento = lente de classe de ativo. Juntas dao a foto completa
  sem precisar dois headings separados.
-->
<template>
  <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <!-- ============ DONUT POR ESTILO ============ -->
    <article class="dist-card" :style="cardStyle">
      <header class="dist-card__head">
        <span class="dist-card__eyebrow">Por estilo</span>
        <span class="dist-card__count">{{ styleSlices.length }} {{ styleSlices.length === 1 ? 'estilo' : 'estilos' }}</span>
      </header>

      <div v-if="!styleSlices.length" class="dist-card__empty">
        <UIcon name="i-lucide-pie-chart" class="size-6 opacity-40" :style="{ color: 'var(--brand-text)' }" />
        <span>Sem operações no período.</span>
      </div>

      <div v-else class="dist-donut">
        <div class="dist-donut__svg-wrap">
          <svg viewBox="0 0 120 120" class="dist-donut__svg">
            <circle
              cx="60" cy="60" r="48"
              fill="none"
              stroke-width="14"
              :stroke="bgRingColor"
            />
            <g transform="rotate(-90 60 60)">
              <circle
                v-for="(slice, i) in donutCircleSlices"
                :key="`style-${i}-${slice.color}`"
                cx="60" cy="60" r="48"
                fill="none"
                stroke-width="14"
                stroke-linecap="butt"
                :stroke="slice.color"
                :stroke-dasharray="slice.dasharray"
                :stroke-dashoffset="slice.offset"
                class="dist-donut__slice"
                :class="{
                  'dist-donut__slice--active': hoveredStyleIdx === i,
                  'dist-donut__slice--dim': hoveredStyleIdx !== null && hoveredStyleIdx !== i,
                }"
                @mouseenter="hoveredStyleIdx = i"
                @mouseleave="hoveredStyleIdx = null"
              />
            </g>
          </svg>

          <div class="dist-donut__center">
            <span class="dist-donut__center-label">{{ centerLabel }}</span>
            <span
              class="dist-donut__center-value tabular-nums"
              :style="{ color: centerColor }"
            >{{ centerValue }}</span>
            <span class="dist-donut__center-sub">{{ centerSub }}</span>
          </div>
        </div>

        <ul class="dist-donut__legend">
          <li
            v-for="(row, i) in styleSlices"
            :key="row.label"
            class="dist-donut__legend-row"
            :class="{
              'dist-donut__legend-row--active': hoveredStyleIdx === i,
              'dist-donut__legend-row--dim': hoveredStyleIdx !== null && hoveredStyleIdx !== i,
            }"
            @mouseenter="hoveredStyleIdx = i"
            @mouseleave="hoveredStyleIdx = null"
          >
            <span
              class="dist-donut__legend-dot"
              :style="{
                backgroundColor: row.color,
                boxShadow: hoveredStyleIdx === i ? `0 0 0 2px color-mix(in srgb, ${row.color} 22%, transparent)` : 'none',
              }"
              aria-hidden="true"
            />
            <div class="dist-donut__legend-main">
              <span class="dist-donut__legend-label" :style="{ color: 'var(--brand-text)' }">
                {{ row.label }}
              </span>
              <span
                class="dist-donut__legend-bar"
                :style="{ backgroundColor: `color-mix(in srgb, ${row.color} 14%, transparent)` }"
              >
                <span
                  class="dist-donut__legend-bar-fill"
                  :style="{ width: `${row.weight_pct}%`, backgroundColor: row.color }"
                />
              </span>
            </div>
            <div class="dist-donut__legend-stats">
              <span
                class="dist-donut__legend-pnl tabular-nums"
                :style="{ color: row.pnl >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }"
              >{{ formatSigned(row.pnl) }}</span>
              <span class="dist-donut__legend-pct tabular-nums">
                {{ row.weight_pct.toFixed(1).replace('.', ',') }}%
              </span>
            </div>
          </li>
        </ul>
      </div>
    </article>

    <!-- ============ BARS POR INSTRUMENTO ============
         Mesma receita visual de "Por setor" no /wallet (visao geral):
         stacked bar 100% no topo + lista detalhada com dots, mini-bar
         e valor a direita. Hover sincronizado: passar o mouse num
         segmento da stacked bar destaca a linha correspondente na
         lista (e vice-versa), com dim nas outras. Stack seg ativa
         scaleY(1.5) pra crescer e chamar atencao. -->
    <article class="alloc-bars" :style="cardStyle">
      <header class="alloc-bars__head">
        <span class="alloc-bars__eyebrow">Por instrumento</span>
        <span class="alloc-bars__count">
          {{ instrumentRows.length }} {{ instrumentRows.length === 1 ? 'classe' : 'classes' }}
        </span>
      </header>

      <div v-if="!instrumentRows.length" class="alloc-bars__empty">
        <UIcon name="i-lucide-bar-chart-3" class="size-6 opacity-40" :style="{ color: 'var(--brand-text)' }" />
        <span>Sem operações no período.</span>
      </div>

      <template v-else>
        <!-- Barra empilhada — visao macro 100% -->
        <div class="alloc-bars__stack" aria-hidden="true">
          <span
            v-for="(row, i) in instrumentRows"
            :key="`stack-${row.key}`"
            class="alloc-bars__stack-seg"
            :class="{
              'alloc-bars__stack-seg--active': instrumentHover === i,
              'alloc-bars__stack-seg--dim': instrumentHover !== null && instrumentHover !== i,
            }"
            :style="{
              width: row.weight_pct + '%',
              backgroundColor: row.color,
            }"
            :title="`${row.label} · ${row.weight_pct.toFixed(1)}%`"
            @mouseenter="instrumentHover = i"
            @mouseleave="instrumentHover = null"
          />
        </div>

        <!-- Legenda detalhada -->
        <ul class="alloc-bars__list">
          <li
            v-for="(row, i) in instrumentRows"
            :key="row.key"
            class="alloc-bars__row"
            :class="{
              'alloc-bars__row--active': instrumentHover === i,
              'alloc-bars__row--dim': instrumentHover !== null && instrumentHover !== i,
            }"
            @mouseenter="instrumentHover = i"
            @mouseleave="instrumentHover = null"
          >
            <span
              class="alloc-bars__dot"
              :style="{
                backgroundColor: row.color,
                boxShadow: instrumentHover === i ? `0 0 0 2px color-mix(in srgb, ${row.color} 22%, transparent)` : 'none',
              }"
              aria-hidden="true"
            />
            <span class="alloc-bars__name" :title="`${row.label} · ${row.count} ${row.count === 1 ? 'operação' : 'operações'}`">
              {{ row.label }}
            </span>
            <span class="alloc-bars__bar" aria-hidden="true">
              <span
                class="alloc-bars__bar-fill"
                :style="{
                  width: Math.min(row.weight_pct * 2, 100) + '%',
                  backgroundColor: row.color,
                }"
              />
            </span>
            <span
              class="alloc-bars__pnl tabular-nums"
              :style="{ color: row.pnl >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }"
            >{{ formatSigned(row.pnl) }}</span>
          </li>
        </ul>
      </template>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { ResultadoStats } from '~/composables/useResultadoStats'

const props = defineProps<{
  stats: ResultadoStats
}>()

const brand = useBrand()
const { brl } = useFormat()
const interfaceStore = useInterfaceStore()

const hoveredStyleIdx = ref<number | null>(null)
// Hover state do bloco "Por instrumento". Sincronizado entre stack
// segment e linha da lista, mesmo padrao do AllocationSection.
const instrumentHover = ref<number | null>(null)

const bgRingColor = computed(() =>
  `color-mix(in srgb, var(--brand-text) 8%, transparent)`,
)

// ============ Style slices (Day/Swing/Hold/Renda) ============
// Distribuicao por |P&L|: usamos magnitude do resultado pra peso
// porque "X reais de resultado" e o que importa, nao numero de
// trades. Day pode ter 30 trades de centavos, hold pode ter 3 trades
// de milhares — peso por R$ revela a verdade economica.
interface StyleSlice {
  key: string
  label: string
  color: string
  pnl: number
  weight_pct: number
  dasharray: string
  offset: string
}

const STYLE_COLORS = {
  day: '#fbbf24',      // amber — rapido/atencao
  swing: '#60a5fa',    // blue — meio termo
  hold: '#34d399',     // green — defensivo
  income: '#a78bfa',   // purple — passivo
}

const styleSlices = computed<StyleSlice[]>(() => {
  const rows: Array<Omit<StyleSlice, 'dasharray' | 'offset' | 'weight_pct'>> = []

  // Day/Swing/Hold a partir de byKind, mas income vai pra bucket separado
  for (const [kind, agg] of Object.entries(props.stats.byKind)) {
    if (kind === 'hold') {
      // Subtrai dividendos (que viraram bucket "income" abaixo)
      const holdPnLOnly = agg.pnl - props.stats.incomePnL
      if (Math.abs(holdPnLOnly) > 0.01) {
        rows.push({
          key: 'hold',
          label: 'Hold',
          color: STYLE_COLORS.hold,
          pnl: holdPnLOnly,
        })
      }
    } else {
      if (Math.abs(agg.pnl) > 0.01) {
        rows.push({
          key: kind,
          label: kind === 'day' ? 'Day' : 'Swing',
          color: STYLE_COLORS[kind as 'day' | 'swing'],
          pnl: agg.pnl,
        })
      }
    }
  }

  if (Math.abs(props.stats.incomePnL) > 0.01) {
    rows.push({
      key: 'income',
      label: 'Renda passiva',
      color: STYLE_COLORS.income,
      pnl: props.stats.incomePnL,
    })
  }

  if (!rows.length) return []

  const totalAbs = rows.reduce((s, r) => s + Math.abs(r.pnl), 0) || 1

  // Ordena maior peso primeiro
  const sorted = rows
    .map((r) => ({ ...r, weight_pct: (Math.abs(r.pnl) / totalAbs) * 100 }))
    .sort((a, b) => b.weight_pct - a.weight_pct)

  // Calcula stroke-dasharray + offset pra cada slice
  // Circumference do circulo r=48: 2πr = 301.59
  const C = 2 * Math.PI * 48
  const SLICE_GAP = 1.5 // gap visual entre slices

  let acc = 0
  return sorted.map((r) => {
    const len = (r.weight_pct / 100) * C
    const visibleLen = Math.max(0, len - SLICE_GAP)
    const offset = -acc
    acc += len
    return {
      ...r,
      dasharray: `${visibleLen} ${C - visibleLen}`,
      offset: String(offset),
    }
  })
})

const donutCircleSlices = computed(() => styleSlices.value)

// Center text: dominante quando sem hover, slice ativo no hover
const dominantStyle = computed(() =>
  styleSlices.value.length ? styleSlices.value[0] : null,
)
const focusedStyle = computed(() => {
  if (hoveredStyleIdx.value !== null) return styleSlices.value[hoveredStyleIdx.value] ?? null
  return dominantStyle.value
})

const centerLabel = computed(() => {
  if (hoveredStyleIdx.value !== null) return 'Selecionado'
  return 'Maior contribuição'
})

const centerValue = computed(() => {
  const s = focusedStyle.value
  if (!s) return '—'
  return `${s.weight_pct.toFixed(0)}%`
})

const centerSub = computed(() => {
  const s = focusedStyle.value
  if (!s) return ''
  return s.label
})

const centerColor = computed(() => focusedStyle.value?.color || brand.colors.text)

// ============ Instrument rows ============
const INSTRUMENT_PALETTE = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
  '#84cc16', // lime
  '#f97316', // orange
] as const

const INSTRUMENT_LABELS: Record<string, string> = {
  EQUITY: 'Ações',
  REIT: 'FIIs',
  ETF: 'ETFs',
  BDR: 'BDRs',
  TREASURY: 'Tesouro',
  FUTURES: 'Futuros',
  CRYPTO: 'Cripto',
}

interface InstrumentRow {
  key: string
  label: string
  color: string
  count: number
  pnl: number
  volume: number
  weight_pct: number
}

const instrumentRows = computed<InstrumentRow[]>(() => {
  const entries = Object.entries(props.stats.byInstrument)
  if (!entries.length) return []
  const totalAbs = entries.reduce((s, [, v]) => s + Math.abs(v.pnl), 0) || 1

  return entries
    .map(([key, v], i) => ({
      key,
      label: INSTRUMENT_LABELS[key] ?? key,
      color: INSTRUMENT_PALETTE[i % INSTRUMENT_PALETTE.length],
      count: v.count,
      pnl: v.pnl,
      volume: v.volume,
      weight_pct: (Math.abs(v.pnl) / totalAbs) * 100,
    }))
    .sort((a, b) => b.weight_pct - a.weight_pct)
})

// ============ Helpers ============
function formatSigned(v: number): string {
  if (!interfaceStore.revealAmount) return '••••••'
  if (v === 0) return brl(0)
  const sign = v > 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(v))}`
}

const cardStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
  boxShadow: `0 8px 22px -16px color-mix(in srgb, var(--brand-primary) 18%, transparent)`,
}))
</script>

<style scoped>
/* Seguindo a receita do AllocationSection: card 16px radius, padding
   18-20px, eyebrow head com count alinhado em baseline, radial
   gradient sutil no canto superior direito pra dar profundidade. */

.dist-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid;
  position: relative;
  overflow: hidden;
}

.dist-card::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary) 7%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.dist-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  position: relative;
}

.dist-card__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.dist-card__count {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dist-card__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 168px;
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

/* ============ DONUT ============ */
.dist-donut {
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
}

@media (max-width: 480px) {
  .dist-donut {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}

.dist-donut__svg-wrap {
  position: relative;
  flex-shrink: 0;
  width: 168px;
  height: 168px;
  margin: 0 auto;
}

.dist-donut__svg {
  width: 100%;
  height: 100%;
}

.dist-donut__slice {
  transition: stroke-width 220ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 220ms;
  cursor: pointer;
  transform-origin: center;
}

.dist-donut__slice--active {
  stroke-width: 16;
}

.dist-donut__slice--dim {
  opacity: 0.45;
}

.dist-donut__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  pointer-events: none;
  text-align: center;
}

.dist-donut__center-label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

.dist-donut__center-value {
  font-family: var(--brand-font);
  font-weight: 200;
  font-size: 28px;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  margin-top: 2px;
}

.dist-donut__center-sub {
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  margin-top: 1px;
}

/* ============ LEGEND ============ */
.dist-donut__legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.dist-donut__legend-row {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 200ms;
}

.dist-donut__legend-row--active {
  opacity: 1;
}

.dist-donut__legend-row--dim {
  opacity: 0.45;
}

.dist-donut__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: box-shadow 200ms;
}

.dist-donut__legend-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.dist-donut__legend-label {
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dist-donut__legend-bar {
  display: block;
  height: 3px;
  border-radius: 2px;
  overflow: hidden;
}

.dist-donut__legend-bar-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
}

.dist-donut__legend-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  flex-shrink: 0;
}

.dist-donut__legend-pnl {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.dist-donut__legend-pct {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* ============ INSTRUMENT BARS ============
   Mesma receita do AllocationSection.alloc-sectors do /wallet:
   stacked bar com hover scale + dim + lista com row hover sutil.
   Difere apenas no campo de valor a direita (P&L em R$ aqui,
   percentual la). */

/* Container herda o card padrao (.dist-card). Adicionamos so o
   layout interno em coluna com gap 16px (matching alloc-sectors). */
.alloc-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid;
  position: relative;
  overflow: hidden;
}

.alloc-bars::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary) 7%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.alloc-bars__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  position: relative;
}

.alloc-bars__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.alloc-bars__count {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.alloc-bars__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 168px;
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

/* ============ STACKED BAR (visao macro 100%) ============ */
.alloc-bars__stack {
  display: flex;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
  gap: 1.5px;
  padding: 0;
  position: relative;
}

.alloc-bars__stack-seg {
  height: 100%;
  transition: opacity 200ms, transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 1px;
}

.alloc-bars__stack-seg:first-child {
  border-top-left-radius: 999px;
  border-bottom-left-radius: 999px;
}

.alloc-bars__stack-seg:last-child {
  border-top-right-radius: 999px;
  border-bottom-right-radius: 999px;
}

.alloc-bars__stack-seg--active {
  transform: scaleY(1.5);
}

.alloc-bars__stack-seg--dim {
  opacity: 0.45;
}

/* ============ LIST ============ */
.alloc-bars__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.alloc-bars__row {
  display: grid;
  grid-template-columns: 10px 1fr 70px 90px;
  align-items: center;
  gap: 10px;
  padding: 6px 7px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 180ms, opacity 180ms;
}

.alloc-bars__row:hover,
.alloc-bars__row--active {
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
}

.alloc-bars__row--dim {
  opacity: 0.5;
}

.alloc-bars__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  transition: box-shadow 220ms;
}

.alloc-bars__name {
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.alloc-bars__bar {
  display: block;
  height: 4px;
  width: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
  position: relative;
}

.alloc-bars__bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.alloc-bars__pnl {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: right;
}

/* Em mobile: stack continua, mas escondemos o mini-bar no row pra
   não quebrar (apertado em <480px). Mantemos dot/name/pnl. */
@media (max-width: 480px) {
  .alloc-bars__row {
    grid-template-columns: 10px 1fr 90px;
  }
  .alloc-bars__bar { display: none; }
}
</style>

<!--
  MoleculesResultadoDayTradeByTicker — donut + leaderboard de tickers.

  Quem dominou seu P&L na sessao? Esse grafico responde em segundos.

  Visualmente: donut compacto a esquerda com o ticker dominante
  destacado no center text + leaderboard a direita com bars miniatura
  por ticker (mesmo padrao do Por instrumento da carteira).

  Diferente do Por instrumento, aqui cada barra e colorida por
  SINAL: contribuicao positiva = verde, negativa = vermelho. Permite
  scan rapido pra "qual ticker me sustentou" vs "qual me drenou".
-->
<template>
  <article class="dt-byticker" :style="cardStyle">
    <header class="dt-byticker__head">
      <div class="dt-byticker__head-left">
        <span class="dt-byticker__eyebrow">Por ticker</span>
        <span class="dt-byticker__sub">{{ subtitle }}</span>
      </div>
    </header>

    <div v-if="!hasData" class="dt-byticker__empty">
      <UIcon name="i-lucide-pie-chart" class="size-6 opacity-40" :style="{ color: brand.colors.text }" />
      <span>Sem operações no período.</span>
    </div>

    <div v-else class="dt-byticker__body">
      <!-- Donut compacto -->
      <div class="dt-byticker__donut-wrap">
        <svg viewBox="0 0 100 100" class="dt-byticker__donut">
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`"
            stroke-width="14"
          />
          <g transform="rotate(-90 50 50)">
            <circle
              v-for="(slice, i) in donutSlices"
              :key="`slice-${i}`"
              cx="50" cy="50" r="40"
              fill="none"
              stroke-width="14"
              stroke-linecap="butt"
              :stroke="slice.color"
              :stroke-dasharray="slice.dasharray"
              :stroke-dashoffset="slice.offset"
              class="dt-byticker__slice"
              :class="{
                'dt-byticker__slice--active': hoveredIdx === i,
                'dt-byticker__slice--dim': hoveredIdx !== null && hoveredIdx !== i,
              }"
              @mouseenter="hoveredIdx = i"
              @mouseleave="hoveredIdx = null"
            />
          </g>
        </svg>

        <div class="dt-byticker__donut-center">
          <span class="dt-byticker__center-label">{{ centerLabel }}</span>
          <span
            class="dt-byticker__center-value tabular-nums"
            :style="{ color: centerValueColor }"
          >{{ centerValue }}</span>
          <span class="dt-byticker__center-sub">{{ centerSub }}</span>
        </div>
      </div>

      <!-- Leaderboard -->
      <ul class="dt-byticker__list">
        <li
          v-for="(row, i) in stats.byTicker"
          :key="row.ticker"
          class="dt-byticker__row"
          :class="{
            'dt-byticker__row--active': hoveredIdx === i,
            'dt-byticker__row--dim': hoveredIdx !== null && hoveredIdx !== i,
          }"
          @mouseenter="hoveredIdx = i"
          @mouseleave="hoveredIdx = null"
        >
          <span
            class="dt-byticker__row-rank tabular-nums"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 35%, transparent)` }"
          >{{ String(i + 1).padStart(2, '0') }}</span>
          <span
            class="dt-byticker__row-dot"
            :style="{
              backgroundColor: rowColor(row),
              boxShadow: hoveredIdx === i ? `0 0 0 2px color-mix(in srgb, ${rowColor(row)} 22%, transparent)` : 'none',
            }"
            aria-hidden="true"
          />
          <span class="dt-byticker__row-name tabular-nums" :style="{ color: brand.colors.text }">
            {{ row.ticker }}
          </span>
          <span class="dt-byticker__row-bar"
            :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 6%, transparent)` }"
          >
            <span
              class="dt-byticker__row-bar-fill"
              :style="{
                width: `${Math.min(100, row.weightPct * 1.5)}%`,
                backgroundColor: rowColor(row),
              }"
            />
          </span>
          <span
            class="dt-byticker__row-count tabular-nums"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
          >{{ row.count }}</span>
          <span
            class="dt-byticker__row-pnl tabular-nums"
            :style="{ color: rowColor(row) }"
          >{{ formatSigned(row.pnl) }}</span>
        </li>
      </ul>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { DayTradeStats, ByTickerBucket } from '~/composables/useDayTradeStats'

const props = defineProps<{
  stats: DayTradeStats
}>()

const brand = useBrand()
const { brl } = useFormat()

const hoveredIdx = ref<number | null>(null)

const hasData = computed(() => props.stats.byTicker.length > 0)

const subtitle = computed(() => {
  if (!hasData.value) return 'Quem dominou o resultado'
  return `Top ${props.stats.byTicker.length} no período`
})

function rowColor(row: ByTickerBucket): string {
  if (row.pnl > 0) return brand.colors.positive
  if (row.pnl < 0) return brand.colors.negative
  return `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`
}

function formatSigned(v: number): string {
  if (v === 0) return '—'
  const sign = v > 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(v))}`
}

// ============ Donut slices ============
// Pesos so dos POSITIVOS pra construir o donut (negativos viram
// "drenos" e ja aparecem no leaderboard com sua propria cor). Isso
// porque um donut misto com pedacos vermelhos e verdes confunde a
// leitura — quem ganhou e quem perdeu sao categorias semanticas
// diferentes.
//
// Atualizacao: pra nao perder informacao no donut quando todo mundo
// foi positivo OU todo mundo foi negativo, tratamos os dois casos:
// se ha negative dominante, usamos a magnitude absoluta com cor
// vermelha; se ha mistura, mostramos so positivos. Final result:
// o donut cobre 100% se ha todos do mesmo sinal.
const donutMode = computed<'positive' | 'negative' | 'mixed'>(() => {
  const hasPositive = props.stats.byTicker.some((r) => r.pnl > 0)
  const hasNegative = props.stats.byTicker.some((r) => r.pnl < 0)
  if (hasPositive && hasNegative) return 'mixed'
  if (hasPositive) return 'positive'
  return 'negative'
})

interface DonutSlice {
  color: string
  dasharray: string
  offset: string
  ticker: string
  weightInDonut: number
}

const donutSlices = computed<DonutSlice[]>(() => {
  if (!hasData.value) return []

  // Filtra a partir do donut mode
  const eligible = props.stats.byTicker.filter((r) => {
    if (donutMode.value === 'positive') return r.pnl > 0
    if (donutMode.value === 'negative') return r.pnl < 0
    // mixed: mostra so positivos no donut (negative ja aparece no
    // leaderboard, e ja deixa claro pelo dot vermelho)
    return r.pnl > 0
  })

  if (!eligible.length) return []

  const totalAbs = eligible.reduce((s, r) => s + Math.abs(r.pnl), 0) || 1

  // Paleta semantica: ainda usamos a sequencia positive (verde) ou
  // negative (vermelho), mas variando saturacao pra distinguir
  // tickers entre si dentro do mesmo lado.
  const baseColor = donutMode.value === 'negative' ? brand.colors.negative : brand.colors.positive
  const SATURATIONS = [100, 78, 60, 46, 36, 28, 22, 18]

  const C = 2 * Math.PI * 40 // circumference do raio 40
  const SLICE_GAP = 1.5

  let acc = 0
  return eligible.slice(0, 8).map((r, i) => {
    const weight = (Math.abs(r.pnl) / totalAbs) * 100
    const len = (weight / 100) * C
    const visible = Math.max(0, len - SLICE_GAP)
    const offset = -acc
    acc += len
    return {
      color: `color-mix(in srgb, ${baseColor} ${SATURATIONS[i] || 18}%, ${brand.colors.surface})`,
      dasharray: `${visible} ${C - visible}`,
      offset: String(offset),
      ticker: r.ticker,
      weightInDonut: weight,
    }
  })
})

// Center text adapta ao slice ativo ou ao top contributor
const focused = computed<ByTickerBucket | null>(() => {
  if (!props.stats.byTicker.length) return null
  if (hoveredIdx.value !== null) {
    return props.stats.byTicker[hoveredIdx.value] ?? null
  }
  return props.stats.byTicker[0]
})

const centerLabel = computed(() => {
  if (hoveredIdx.value !== null) return 'Selecionado'
  return 'Top contribuidor'
})

const centerValue = computed(() => {
  if (!focused.value) return '—'
  return focused.value.ticker
})

const centerValueColor = computed(() => {
  if (!focused.value) return brand.colors.text
  if (focused.value.pnl > 0) return brand.colors.positive
  if (focused.value.pnl < 0) return brand.colors.negative
  return brand.colors.text
})

const centerSub = computed(() => {
  if (!focused.value) return ''
  return formatSigned(focused.value.pnl)
})

const cardStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  boxShadow: `0 8px 22px -16px color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
}))
</script>

<style scoped>
.dt-byticker {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid;
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  /* Estica pra altura do vizinho na row 8/4. */
  height: 100%;
}


.dt-byticker__head-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dt-byticker__eyebrow {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.dt-byticker__sub {
  font-size: 11px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dt-byticker__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 200px;
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.dt-byticker__body {
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: 14px;
  align-items: center;
  /* Estica pra ocupar a altura disponivel quando o card e
     vizinho de uma section maior (Hot zones na row 8/4). */
  flex: 1 1 auto;
}

@media (max-width: 580px) {
  .dt-byticker__body {
    grid-template-columns: 100px 1fr;
    gap: 10px;
  }
}

/* ============ DONUT ============ */
.dt-byticker__donut-wrap {
  position: relative;
  width: 132px;
  height: 132px;
}

.dt-byticker__donut {
  width: 100%;
  height: 100%;
}

.dt-byticker__slice {
  transition: stroke-width 220ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 220ms;
  cursor: pointer;
  transform-origin: center;
}

.dt-byticker__slice--active {
  stroke-width: 16;
}

.dt-byticker__slice--dim {
  opacity: 0.45;
}

.dt-byticker__donut-center {
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

.dt-byticker__center-label {
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

.dt-byticker__center-value {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-weight: 700;
  font-size: 18px;
  line-height: 1;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  margin-top: 2px;
}

.dt-byticker__center-sub {
  font-size: 10.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

/* ============ LIST ============ */
.dt-byticker__list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  list-style: none;
  padding: 0;
  margin: 0;
  min-width: 0;
}

.dt-byticker__row {
  display: grid;
  grid-template-columns: 18px 8px minmax(60px, 90px) minmax(0, 1fr) 24px 80px;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 180ms, opacity 180ms;
  font-size: 11.5px;
}

.dt-byticker__row:hover,
.dt-byticker__row--active {
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
}

.dt-byticker__row--dim {
  opacity: 0.5;
}

.dt-byticker__row-rank {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-align: right;
}

.dt-byticker__row-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  transition: box-shadow 220ms;
}

.dt-byticker__row-name {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dt-byticker__row-bar {
  display: block;
  height: 4px;
  border-radius: 999px;
  overflow: hidden;
}

.dt-byticker__row-bar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dt-byticker__row-count {
  font-size: 10px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.dt-byticker__row-pnl {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: -0.005em;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 580px) {
  .dt-byticker__row {
    grid-template-columns: 14px 8px 1fr 70px;
  }
  .dt-byticker__row-bar,
  .dt-byticker__row-count { display: none; }
}
</style>

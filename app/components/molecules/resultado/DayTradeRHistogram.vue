<!--
  MoleculesResultadoDayTradeRHistogram — distribuicao em R-multiples.

  Grafico classico de journaling de day-trade. Cada barra e uma faixa
  de R-multiple (-3R a +3R, com bins extremos pra <-3R e >+3R). A
  altura da barra e o count de trades naquela faixa. Eixo X simetrico
  passando pelo zero — onde ha vidro divisor entre perdas e ganhos.

  Visualmente, um histograma "saudavel" tem:
    - Pouco peso em <-1R (stops apertados)
    - Cluster forte em +1R a +2R (ganhos consistentes)
    - Cauda direita > cauda esquerda (assimetria positiva)

  Pra mostrar isso, coloramos vermelho de saturacao alta nas barras
  esquerdas e verde nas direitas, ZERO em neutro. Linha vertical
  central marca o zero pra leitura instantanea.
-->
<template>
  <article class="dt-rhist" :style="cardStyle">
    <header class="dt-rhist__head">
      <div class="dt-rhist__head-left">
        <span class="dt-rhist__eyebrow">Distribuição R-multiples</span>
        <span class="dt-rhist__sub">{{ subtitle }}</span>
      </div>
      <div v-if="hasData" class="dt-rhist__totals">
        <span class="dt-rhist__total">
          <span class="dt-rhist__total-label">Cauda esq</span>
          <span
            class="dt-rhist__total-value tabular-nums"
            :style="{ color: brand.colors.negative }"
          >{{ leftTailCount }}</span>
        </span>
        <span class="dt-rhist__total">
          <span class="dt-rhist__total-label">Cauda dir</span>
          <span
            class="dt-rhist__total-value tabular-nums"
            :style="{ color: brand.colors.positive }"
          >{{ rightTailCount }}</span>
        </span>
        <span class="dt-rhist__total">
          <span class="dt-rhist__total-label">Skew</span>
          <span
            class="dt-rhist__total-value tabular-nums"
            :style="{ color: skewColor }"
          >{{ skewLabel }}</span>
        </span>
      </div>
    </header>

    <div v-if="!hasData" class="dt-rhist__empty">
      <UIcon name="i-lucide-bar-chart" class="size-6 opacity-40" :style="{ color: brand.colors.text }" />
      <span>Sem operações no período.</span>
    </div>

    <div v-else class="dt-rhist__chart">
      <!-- Linha do zero (vertical) — eixo de simetria do histograma. -->
      <span
        class="dt-rhist__zero-line"
        :style="{ borderColor: `color-mix(in srgb, ${brand.colors.text} 18%, transparent)` }"
        aria-hidden="true"
      />

      <div class="dt-rhist__bars">
        <div
          v-for="bucket in stats.rMultipleBuckets"
          :key="bucket.label"
          class="dt-rhist__bar-col"
          :title="`${bucket.label} · ${bucket.count} ${bucket.count === 1 ? 'trade' : 'trades'}`"
        >
          <span
            class="dt-rhist__count tabular-nums"
            :style="{ color: bucket.count > 0 ? brand.colors.text : `color-mix(in srgb, ${brand.colors.text} 30%, transparent)` }"
          >{{ bucket.count > 0 ? bucket.count : '' }}</span>
          <span
            class="dt-rhist__bar"
            :style="{
              height: `${barHeight(bucket.count)}%`,
              backgroundColor: barColor(bucket),
              boxShadow: bucket.count > 0
                ? `0 -2px 12px -4px color-mix(in srgb, ${barColor(bucket)} 50%, transparent)`
                : 'none',
            }"
          />
          <span
            class="dt-rhist__bar-label tabular-nums"
            :class="{ 'dt-rhist__bar-label--zero': bucket.bucket === 0 }"
            :style="{ color: bucket.bucket === 0 ? brand.colors.text : `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
          >{{ bucket.label }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { DayTradeStats, RMultipleBucket } from '~/composables/useDayTradeStats'

const props = defineProps<{
  stats: DayTradeStats
}>()

const brand = useBrand()

const hasData = computed(() => props.stats.count > 0)

const maxCount = computed(() =>
  Math.max(1, ...props.stats.rMultipleBuckets.map((b) => b.count)),
)

function barHeight(count: number): number {
  if (count === 0) return 4 // sliver minimo pra mostrar o slot vazio
  return 8 + (count / maxCount.value) * 92
}

function barColor(bucket: RMultipleBucket): string {
  if (bucket.count === 0) {
    return `color-mix(in srgb, ${brand.colors.text} 8%, transparent)`
  }
  if (bucket.side === 'neutral') {
    return `color-mix(in srgb, ${brand.colors.text} 30%, transparent)`
  }
  // Saturacao aumenta quanto mais distante do zero
  const distance = Math.abs(bucket.bucket)
  const saturation = 50 + distance * 12 // 62%, 74%, 86%, 100%
  const base = bucket.side === 'positive' ? brand.colors.positive : brand.colors.negative
  return `color-mix(in srgb, ${base} ${Math.min(100, saturation)}%, ${brand.colors.surface})`
}

const leftTailCount = computed(() =>
  props.stats.rMultipleBuckets
    .filter((b) => b.bucket < 0)
    .reduce((s, b) => s + b.count, 0),
)
const rightTailCount = computed(() =>
  props.stats.rMultipleBuckets
    .filter((b) => b.bucket > 0)
    .reduce((s, b) => s + b.count, 0),
)

const skewLabel = computed(() => {
  if (!hasData.value) return '—'
  const left = leftTailCount.value
  const right = rightTailCount.value
  if (left + right === 0) return '0R'
  const diff = right - left
  const sign = diff > 0 ? '+' : diff < 0 ? '−' : ''
  return `${sign}${Math.abs(diff)}`
})

const skewColor = computed(() => {
  const diff = rightTailCount.value - leftTailCount.value
  if (diff > 0) return brand.colors.positive
  if (diff < 0) return brand.colors.negative
  return brand.colors.text
})

const subtitle = computed(() => {
  if (!hasData.value) return 'Distribuição por unidade de risco'
  return `${props.stats.count} trades · 1R = ${rUnitLabel.value}`
})

const rUnitLabel = computed(() => {
  // 1R aqui e a perda media (em magnitude). So mostra o numero
  // em pt-BR pra dar contexto da escala.
  if (props.stats.losses === 0) return '—'
  const avg = Math.abs(props.stats.avgLoss)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(avg)
})

const cardStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  boxShadow: `0 8px 22px -16px color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
}))
</script>

<style scoped>
.dt-rhist {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid;
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  /* Estica pra altura do vizinho na row 8/4 do grid Bloomberg-style. */
  height: 100%;
}

.dt-rhist__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.dt-rhist__head-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dt-rhist__eyebrow {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.dt-rhist__sub {
  font-size: 11px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dt-rhist__totals {
  display: flex;
  align-items: center;
  gap: 14px;
}

.dt-rhist__total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.dt-rhist__total-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dt-rhist__total-value {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
}

.dt-rhist__chart {
  position: relative;
  flex: 1 1 auto;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.dt-rhist__zero-line {
  position: absolute;
  /* No grid de 9 buckets [-4..-1, 0, +1..+4], o zero esta no indice
     4 (5o bucket). Center de cada bucket: (4 + 0.5) / 9 = 50%. */
  left: calc(50% - 1px);
  top: 0;
  bottom: 28px;
  width: 0;
  border-left: 1px dashed;
  pointer-events: none;
}

.dt-rhist__bars {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 4px;
  height: 100%;
  align-items: end;
}

.dt-rhist__bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  position: relative;
}

.dt-rhist__count {
  font-size: 10.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin-bottom: 2px;
  /* Ocupa altura mesmo vazio pra alinhar barras. */
  min-height: 14px;
}

.dt-rhist__bar {
  width: 100%;
  border-radius: 3px 3px 0 0;
  transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dt-rhist__bar-col:hover .dt-rhist__bar {
  transform: scaleY(1.04);
  transform-origin: bottom;
}

.dt-rhist__bar-label {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}

.dt-rhist__bar-label--zero {
  font-weight: 700;
}

.dt-rhist__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 200px;
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .dt-rhist__bar-col:hover .dt-rhist__bar {
    transform: none;
  }
}
</style>

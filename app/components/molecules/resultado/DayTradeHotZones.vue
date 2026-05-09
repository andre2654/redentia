<!--
  MoleculesResultadoDayTradeHotZones — heatmap por hora do pregao.

  Visualiza onde o trader e MELHOR e PIOR ao longo do dia. Cada hora
  do pregao (10h-17h) vira uma "bucket" com count de trades, win rate
  e P&L total. A altura da barra reflete o numero de trades; a cor
  reflete win rate (verde = bom, vermelho = ruim, neutro = sem dados).
  Tooltip nativo com detalhe.

  Insight chave: traders tipicamente tem horarios "ouro" (10-11h
  abertura, 16-17h fechamento) e horarios "drenos" (13h pos-almoco,
  15h tedio). Esse heatmap revela isso de forma visual em segundos.

  Renderiza so com >=3 trades total (abaixo disso a amostra e
  estatisticamente irrelevante). Empty state explica.
-->
<template>
  <article class="dt-zones" :style="cardStyle">
    <header class="dt-zones__head">
      <div class="dt-zones__head-left">
        <span class="dt-zones__eyebrow">Hot zones</span>
        <span class="dt-zones__sub">Win rate por hora do pregão</span>
      </div>
      <div v-if="hasData" class="dt-zones__legend">
        <span
          class="dt-zones__legend-item"
          :style="{ color: brand.colors.positive }"
        >
          <span class="dt-zones__legend-dot" :style="{ backgroundColor: brand.colors.positive }" />
          Hot
        </span>
        <span
          class="dt-zones__legend-item"
          :style="{ color: brand.colors.primary }"
        >
          <span class="dt-zones__legend-dot" :style="{ backgroundColor: brand.colors.primary }" />
          Morno
        </span>
        <span
          class="dt-zones__legend-item"
          :style="{ color: brand.colors.negative }"
        >
          <span class="dt-zones__legend-dot" :style="{ backgroundColor: brand.colors.negative }" />
          Frio
        </span>
      </div>
    </header>

    <div v-if="!hasData" class="dt-zones__empty">
      <UIcon name="i-lucide-flame" class="size-6 opacity-40" :style="{ color: brand.colors.text }" />
      <span>{{ stats.count > 0 ? 'Poucas operações pra montar mapa estatístico (mínimo 3).' : 'Sem operações no período.' }}</span>
    </div>

    <div v-else class="dt-zones__chart">
      <!-- Cada coluna e uma hora, do tamanho proporcional ao count
           e cor pelo win rate. Eixo X: horas (10-17). Eixo Y: implicit
           pela altura. Hover mostra detalhe. -->
      <div class="dt-zones__bars">
        <div
          v-for="bucket in stats.hourBuckets"
          :key="bucket.hour"
          class="dt-zones__bar-col"
          :title="tooltipFor(bucket)"
        >
          <span
            class="dt-zones__bar"
            :style="{
              height: `${barHeight(bucket)}%`,
              backgroundColor: bucket.count === 0
                ? `color-mix(in srgb, ${brand.colors.text} 8%, transparent)`
                : barColor(bucket),
              borderColor: bucket.count === 0
                ? `color-mix(in srgb, ${brand.colors.text} 14%, transparent)`
                : `color-mix(in srgb, ${barColor(bucket)} 60%, transparent)`,
            }"
          >
            <span
              v-if="bucket.count > 0"
              class="dt-zones__bar-value tabular-nums"
              :style="{ color: bucket.count >= 2 ? '#ffffff' : brand.colors.text }"
            >{{ Math.round(bucket.winRate * 100) }}%</span>
          </span>
          <span class="dt-zones__hour-label tabular-nums">{{ bucket.hour }}h</span>
        </div>
      </div>

      <!-- Footer stats: hora ouro / hora dreno -->
      <div class="dt-zones__footer">
        <span v-if="hottest" class="dt-zones__footer-item">
          <UIcon
            name="i-lucide-flame"
            class="size-3.5"
            :style="{ color: brand.colors.positive }"
            aria-hidden="true"
          />
          <span class="dt-zones__footer-label">Hora ouro</span>
          <span
            class="dt-zones__footer-value tabular-nums"
            :style="{ color: brand.colors.text }"
          >{{ hottest.hour }}h · {{ Math.round(hottest.winRate * 100) }}% WR · {{ pnlSigned(hottest.pnl) }}</span>
        </span>
        <span v-if="coldest" class="dt-zones__footer-item">
          <UIcon
            name="i-lucide-snowflake"
            class="size-3.5"
            :style="{ color: brand.colors.negative }"
            aria-hidden="true"
          />
          <span class="dt-zones__footer-label">Hora dreno</span>
          <span
            class="dt-zones__footer-value tabular-nums"
            :style="{ color: brand.colors.text }"
          >{{ coldest.hour }}h · {{ Math.round(coldest.winRate * 100) }}% WR · {{ pnlSigned(coldest.pnl) }}</span>
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { DayTradeStats, HourBucket } from '~/composables/useDayTradeStats'

const props = defineProps<{
  stats: DayTradeStats
}>()

const brand = useBrand()
const { brl } = useFormat()

const hasData = computed(() => props.stats.count >= 3)

// Maximo count entre todas as horas — pra escalar altura das barras
// proporcionalmente. min 1 pra evitar div por zero.
const maxCount = computed(() =>
  Math.max(1, ...props.stats.hourBuckets.map((b) => b.count)),
)

function barHeight(bucket: HourBucket): number {
  // Hora sem trade vira sliver minimo (8%) pra ainda mostrar a coluna.
  if (bucket.count === 0) return 8
  // Range: 25% (1 trade) ate 100% (max count). Compressao logaritimica
  // pra evitar barra-anã quando max e muito grande.
  const ratio = bucket.count / maxCount.value
  return 25 + ratio * 75
}

function barColor(bucket: HourBucket): string {
  // Sem trade ja foi tratado. Aqui colorimos por win rate:
  // - >=60% verde (positive)
  // - 50-60% amber (primary)
  // - 33-50% laranja (mistura amber+negative)
  // - <33% vermelho (negative)
  if (bucket.winRate >= 0.6) return brand.colors.positive
  if (bucket.winRate >= 0.5) return brand.colors.primary
  if (bucket.winRate >= 0.33) {
    return `color-mix(in srgb, ${brand.colors.primary} 60%, ${brand.colors.negative})`
  }
  return brand.colors.negative
}

function tooltipFor(bucket: HourBucket): string {
  if (bucket.count === 0) return `${bucket.hour}h · sem operações`
  const sign = bucket.pnl >= 0 ? '+' : '−'
  return `${bucket.hour}h · ${bucket.count} ${bucket.count === 1 ? 'op' : 'ops'} · ${Math.round(bucket.winRate * 100)}% WR · ${sign}${brl(Math.abs(bucket.pnl))}`
}

// Hora ouro: bucket com win rate maximo entre os com >=2 trades
// (filtrar 1-trade evita acaso). Hora dreno: win rate minimo idem.
const hottest = computed(() => {
  const eligible = props.stats.hourBuckets.filter((b) => b.count >= 2)
  if (!eligible.length) return null
  return eligible.reduce((best, b) => (b.winRate > best.winRate ? b : best))
})

const coldest = computed(() => {
  const eligible = props.stats.hourBuckets.filter((b) => b.count >= 2)
  if (!eligible.length) return null
  return eligible.reduce((worst, b) => (b.winRate < worst.winRate ? b : worst))
})

function pnlSigned(pnl: number): string {
  const sign = pnl >= 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(pnl))}`
}

const cardStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  boxShadow: `0 8px 22px -16px color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
}))
</script>

<style scoped>
.dt-zones {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid;
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
}

.dt-zones::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary) 8%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.dt-zones__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  position: relative;
}

.dt-zones__head-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dt-zones__eyebrow {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.dt-zones__sub {
  font-size: 11.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dt-zones__legend {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dt-zones__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dt-zones__legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.dt-zones__chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.dt-zones__bars {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  height: 160px;
  align-items: end;
  position: relative;
}

.dt-zones__bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
  cursor: default;
}

.dt-zones__bar {
  width: 100%;
  border-radius: 4px;
  border: 1px solid;
  transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 220ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.dt-zones__bar-col:hover .dt-zones__bar {
  transform: scaleY(1.05);
  transform-origin: bottom;
  box-shadow: 0 4px 14px -6px color-mix(in srgb, var(--brand-text) 28%, transparent);
}

.dt-zones__bar-value {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
  user-select: none;
}

.dt-zones__hour-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.dt-zones__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  padding-top: 10px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}

.dt-zones__footer-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
}

.dt-zones__footer-label {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dt-zones__footer-value {
  font-weight: 600;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
}

.dt-zones__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 160px;
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  text-align: center;
  padding: 0 16px;
}

@media (prefers-reduced-motion: reduce) {
  .dt-zones__bar-col:hover .dt-zones__bar {
    transform: none;
  }
}
</style>

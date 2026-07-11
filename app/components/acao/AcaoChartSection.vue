<script setup lang="ts">
// Seção dark do gráfico (design Acoes Nu): H2 + NuRangeTabs funcionais,
// legenda comparativa (ativo vs IBOV — a linha do setor foi OMITIDA: não
// existe série setorial histórica no backend, só o change do DIA nos
// aggregates de /sectors), stats à esquerda (NuStatList dark) e NuPriceChart
// full-bleed sangrando à direita/embaixo via margens negativas casadas com o
// padding da seção.
import type { AcaoRange, AcaoSeriesPair, AcaoStatRow } from '~/types/acao'

const props = defineProps<{
  ticker: string
  series: AcaoSeriesPair | null
  stats: AcaoStatRow[]
  range: AcaoRange
  rangeLoading: boolean
  currentLabel: string
}>()

const emit = defineEmits<{ 'update:range': [AcaoRange] }>()

const RANGE_LABEL: Record<AcaoRange, string> = { '1mo': '1 mês', '6mo': '6 meses', '12mo': '12 meses' }
const heading = computed(() => RANGE_LABEL[props.range])

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
function periodPct(points: { v: number }[] | undefined): number | null {
  if (!points || points.length < 2) return null
  const first = points[0]!.v
  const last = points[points.length - 1]!.v
  if (!first) return null
  return ((last - first) / first) * 100
}
const legend = computed(() => {
  const out: { label: string; pct: string; accent: 'up' | 'down' | null }[] = []
  const asset = periodPct(props.series?.asset)
  if (asset != null) out.push({ label: props.ticker, pct: `${asset > 0 ? '+' : ''}${nf2.format(asset)}%`, accent: asset < 0 ? 'down' : 'up' })
  const ibov = periodPct(props.series?.ibov)
  if (ibov != null) out.push({ label: 'IBOV', pct: `${ibov > 0 ? '+' : ''}${nf2.format(ibov)}%`, accent: null })
  return out
})
</script>

<template>
  <section v-if="series" class="acs">
    <div class="acs__head">
      <h2 class="acs__title">{{ ticker }}<br>em {{ heading }}.</h2>
      <NuRangeTabs :model-value="range" :disabled="rangeLoading" @update:model-value="emit('update:range', $event)" />
    </div>
    <div class="acs__legend">
      <span v-for="l in legend" :key="l.label" class="acs__legend-item">
        <span class="acs__legend-label">{{ l.label }}</span>
        <span class="acs__legend-pct" :class="{ 'acs__legend-pct--down': l.accent === 'down', 'acs__legend-pct--up': l.accent === 'up' }">{{ l.pct }}</span>
      </span>
    </div>
    <div class="acs__cols">
      <div v-if="stats.length" class="acs__stats">
        <NuStatList :rows="stats" dark />
      </div>
      <div class="acs__chart">
        <NuPriceChart :points="series.asset" :ticker="ticker" :current-label="currentLabel" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.acs {
  background: var(--nu-navy);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 76px);
  animation: nu-fade .5s ease both;
}
.acs__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.acs__title {
  margin: 0; color: var(--nu-cream-text); font-size: clamp(36px, 5vw, 64px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.acs__legend { display: flex; align-items: center; gap: 26px; flex-wrap: wrap; margin-top: 20px; }
.acs__legend-item { display: inline-flex; align-items: baseline; gap: 9px; }
.acs__legend-label { color: var(--nu-cream-text-50); font-size: 15px; font-weight: 700; }
.acs__legend-pct {
  color: var(--nu-cream-text-85); font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.acs__legend-pct--down { color: var(--nu-red-soft); }
.acs__legend-pct--up { color: var(--nu-green-soft); }
.acs__cols { display: flex; gap: clamp(28px, 4vw, 60px); align-items: stretch; margin-top: 36px; flex-wrap: wrap; }
.acs__stats { flex: 0 1 300px; min-width: min(260px, 100%); }
.acs__chart {
  flex: 1 1 420px; min-width: min(320px, 100%); position: relative;
  height: clamp(280px, 32vw, 420px);
  /* full-bleed: sangra até a borda direita/inferior espelhando o padding da seção */
  margin: 0 calc(clamp(22px, 5.5vw, 80px) * -1) calc(clamp(48px, 6vw, 76px) * -1) 0;
}
</style>

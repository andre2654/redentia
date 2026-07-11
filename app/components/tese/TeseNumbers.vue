<script setup lang="ts">
// "A tese em números" (design): seção navy com h2 + legenda (barra azul =
// Tese, traço dashed = IBOV), NuStatList dark à esquerda e NuPerformanceChart
// full-bleed sangrando à direita/embaixo via margens negativas casadas com o
// padding da seção (mesmo padrão do AcaoChartSection).
import type { TeseNumbersVM } from '~/types/tese'

const props = defineProps<{ numbers: TeseNumbersVM }>()

const hasBenchmark = computed(() => !!props.numbers.chart.benchmark)
</script>

<template>
  <section class="tnu">
    <div class="tnu__head">
      <h2 class="tnu__title">A tese<br>em números.</h2>
      <div class="tnu__legend">
        <span class="tnu__legend-item"><span class="tnu__swatch-line" /><span class="tnu__legend-lbl">Tese</span></span>
        <span v-if="hasBenchmark" class="tnu__legend-item"><span class="tnu__swatch-dash" /><span class="tnu__legend-lbl">IBOV</span></span>
      </div>
    </div>
    <div class="tnu__cols">
      <div class="tnu__stats">
        <NuStatList :rows="numbers.stats" dark />
      </div>
      <div class="tnu__chart">
        <NuPerformanceChart
          :series="numbers.chart.series"
          :benchmark="numbers.chart.benchmark"
          :labels="numbers.chart.labels"
          :pill-value="numbers.chart.pillValue"
          benchmark-name="IBOV"
          pill-label="Tese hoje"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.tnu {
  background: var(--nu-navy);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 76px);
  animation: nu-fade .5s ease both;
}
.tnu__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.tnu__title {
  margin: 0; color: var(--nu-cream-text); font-size: clamp(36px, 5vw, 64px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.tnu__legend { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; }
.tnu__legend-item { display: inline-flex; align-items: center; gap: 8px; }
.tnu__swatch-line { width: 22px; height: 4px; border-radius: 3px; background: var(--nu-blue); }
.tnu__swatch-dash { width: 22px; height: 0; border-top: 2.5px dashed var(--nu-cream-text-60); }
.tnu__legend-lbl { color: var(--nu-cream-text-70); font-size: 14px; font-weight: 700; }
.tnu__cols { display: flex; gap: clamp(28px, 4vw, 60px); align-items: stretch; margin-top: 36px; flex-wrap: wrap; }
.tnu__stats { flex: 0 1 300px; min-width: min(260px, 100%); }
.tnu__chart {
  flex: 1 1 420px; min-width: min(320px, 100%); position: relative;
  height: clamp(260px, 30vw, 400px);
  /* full-bleed: sangra até a borda direita/inferior espelhando o padding da seção */
  margin: 0 calc(clamp(22px, 5.5vw, 80px) * -1) calc(clamp(48px, 6vw, 76px) * -1) 0;
}
</style>

<script setup lang="ts">
// Seção dark do histórico (mesma anatomia da AcaoChartSection): H2 + toggle
// preço↔taxa + TesouroRangeTabs, stats à esquerda (NuStatList dark) e
// TesouroChart full-bleed sangrando à direita/embaixo via margens negativas
// casadas com o padding da seção. A série chega do useTesouroTitle (client,
// cacheada por range); estados de carga/indisponível são honestos.
import type { TesouroChartMode, TesouroRange, TesouroSeriesPoint } from '~/types/tesouro'

const props = defineProps<{
  name: string
  points: TesouroSeriesPoint[]
  stats: { l: string; v: string }[]
  range: TesouroRange
  mode: TesouroChartMode
  rangeLoading: boolean
  currentLabel: string
  unavailable: boolean
}>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()

const emit = defineEmits<{ 'update:range': [TesouroRange]; 'update:mode': [TesouroChartMode] }>()

const RANGE_LABEL: Record<TesouroRange, string> = {
  '30d': '30 dias',
  '6m': '6 meses',
  '1y': '12 meses',
  '5y': '5 anos',
  full: 'todo o histórico',
}
const heading = computed(() => RANGE_LABEL[props.range])

const MODES: { value: TesouroChartMode; label: string }[] = [
  { value: 'price', label: 'Preço' },
  { value: 'rate', label: 'Taxa' },
]
</script>

<template>
  <section v-contexto-chat="{ id: `tesouro-grafico:${sobre}`, tipo: 'grafico', rotulo: rotuloComSobre('Gráfico', sobre.replace(/^Tesouro\s+/i, '')) }" class="tcs">
    <div class="tcs__head">
      <div>
        <NuEyebrow como="div" sobre="escuro">Histórico</NuEyebrow>
        <h2 class="tcs__title">{{ name }}<br>em {{ heading }}.</h2>
      </div>
      <div class="tcs__controls">
        <div class="tcs__modes" role="group" aria-label="Eixo do gráfico">
          <button
            v-for="m in MODES" :key="m.value" type="button"
            class="tcs__mode" :class="{ 'tcs__mode--active': m.value === mode }"
            :aria-pressed="m.value === mode"
            @click="emit('update:mode', m.value)"
          >{{ m.label }}</button>
        </div>
        <TesouroRangeTabs :model-value="range" :disabled="rangeLoading" @update:model-value="emit('update:range', $event)" />
      </div>
    </div>
    <p class="tcs__legend">
      {{ mode === 'rate' ? 'Taxa de venda (% a.a.)' : 'Preço de venda (R$)' }} · valores diários do Tesouro Nacional
    </p>
    <div class="tcs__cols">
      <div v-if="stats.length" class="tcs__stats">
        <NuStatList :rows="stats" dark />
      </div>
      <div class="tcs__chart">
        <TesouroChart
          v-if="points.length >= 2"
          :points="points" :mode="mode" pill-label="Venda hoje" :current-label="currentLabel"
        />
        <!-- loading é sempre esqueleto (contrato da Aportou) -->
        <div v-else-if="rangeLoading || (!unavailable && points.length < 2)" class="tcs__sk" aria-busy="true" aria-label="Carregando o histórico">
          <NuSkeleton variant="block" tone="navy" width="100%" height="100%" radius="card" />
        </div>
        <p v-else class="tcs__state">Histórico indisponível agora. Os dados do título acima continuam valendo.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tcs {
  background: var(--nu-ink);
  padding: clamp(64px, 7vw, 100px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(48px, 6vw, 76px);
  animation: nu-fade .5s ease both;
}
.tcs__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.tcs__title {
  margin: 18px 0 0; color: var(--nu-white); font-size: var(--nu-fs-h2);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.02;
}
.tcs__controls { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
.tcs__modes { display: flex; gap: 4px; background: var(--nu-dark-chip); box-shadow: inset 0 0 0 1px var(--nu-dark-chip-line); border-radius: var(--nu-r-pill); padding: 4px; }
.tcs__mode {
  min-height: 36px; padding: 0 16px; border-radius: var(--nu-r-pill); border: none; background: transparent;
  color: var(--nu-on-dark); font: inherit; font-size: 14.5px; font-weight: 700; cursor: pointer;
  transition: color .2s, background .2s;
}
.tcs__mode:hover { color: var(--nu-white); }
.tcs__mode--active, .tcs__mode--active:hover { background: var(--nu-creme); color: var(--nu-ink); }
.tcs__legend { margin: 18px 0 0; color: var(--nu-on-dark-2); font-size: 14.5px; font-weight: 500; }
.tcs__cols { display: flex; gap: clamp(28px, 4vw, 60px); align-items: stretch; margin-top: 32px; flex-wrap: wrap; }
.tcs__stats { flex: 0 1 300px; min-width: min(260px, 100%); }
.tcs__chart {
  flex: 1 1 420px; min-width: min(320px, 100%); position: relative;
  height: clamp(280px, 32vw, 420px);
  /* full-bleed: sangra até a borda direita/inferior espelhando o padding da seção */
  margin: 0 calc(clamp(22px, 5.5vw, 80px) * -1) calc(clamp(48px, 6vw, 76px) * -1) 0;
}
/* em tela larga a seção centra a coluna de 1240px e a margem lateral passa de 80px:
   o gráfico para de vazar para a borda e fica na coluna */
@media (min-width: 1401px) { .tcs__chart { margin-left: 0; margin-right: 0; } }
.tcs__sk { position: absolute; inset: 0 clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 76px) 0; }
.tcs__state {
  margin: 0; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: var(--nu-on-dark-2); font-size: var(--nu-fs-md); font-weight: 500; text-align: center;
  padding: 0 max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2));
}
</style>

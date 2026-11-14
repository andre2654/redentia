<script setup lang="ts">
// Seção dark do histórico (mesma anatomia da AcaoChartSection): H2 + toggle
// preço↔taxa + TesouroRangeTabs, stats à esquerda (NuStatList dark) e
// TesouroChart full-bleed sangrando à direita/embaixo via margens negativas
// casadas com o padding da seção. A série chega do useTesouroTitle (client,
// cacheada por range); estados de carga/indisponível são honestos.
// Robustez (11/11/2026): o eixo (Preço/Taxa) e o período são o trilho da base
// (NuTrilho, tom escuro) no lugar das pílulas feitas à mão; a seção entra ao
// rolar (v-revelar) e o estado sem histórico tem o desenho dos estados de lista.
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

const MODES: { valor: TesouroChartMode; rotulo: string }[] = [
  { valor: 'price', rotulo: 'Preço' },
  { valor: 'rate', rotulo: 'Taxa' },
]
</script>

<template>
  <section v-contexto-chat="{ id: `tesouro-grafico:${sobre}`, tipo: 'grafico', rotulo: rotuloComSobre('Gráfico', sobre.replace(/^Tesouro\s+/i, '')) }" v-revelar class="tcs">
    <div class="tcs__head">
      <div>
        <NuEyebrow como="div" sobre="escuro">Histórico</NuEyebrow>
        <h2 class="tcs__title">{{ name }}<br>em {{ heading }}.</h2>
      </div>
      <div class="tcs__controls">
        <NuTrilho :opcoes="MODES" :model-value="mode" tom="escuro" tamanho="p" rotulo="Eixo do gráfico" @update:model-value="emit('update:mode', $event)" />
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
        <div v-else class="tcs__state" role="status">
          <span class="tcs__state-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M4 19h16" /><path d="M5 15.5 9.5 11l3 3L19 7.5" /></svg></span>
          <p class="tcs__state-txt">Histórico indisponível agora. Os dados do título acima continuam valendo.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tcs {
  background: var(--nu-ink);
  padding: clamp(72px, 8vw, 104px) var(--nu-coluna) clamp(48px, 6vw, 72px);
}
.tcs__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.tcs__title {
  margin: 16px 0 0; color: var(--nu-white); font-size: var(--nu-fs-h2);
  font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02;
}
.tcs__controls { display: flex; align-items: center; gap: 12px 16px; flex-wrap: wrap; }
.tcs__legend { margin: 16px 0 0; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: var(--nu-w-texto); }
.tcs__cols { display: flex; gap: clamp(32px, 4vw, 56px); align-items: stretch; margin-top: 32px; flex-wrap: wrap; }
.tcs__stats { flex: 0 1 300px; min-width: min(260px, 100%); }
.tcs__chart {
  flex: 1 1 420px; min-width: min(320px, 100%); position: relative;
  height: clamp(280px, 32vw, 420px);
  /* full-bleed: sangra até a borda direita/inferior espelhando o padding da seção */
  margin: 0 calc(clamp(22px, 5.5vw, 80px) * -1) calc(clamp(48px, 6vw, 72px) * -1) 0;
}
/* em tela larga a seção centra a coluna de 1240px e a margem lateral passa de 80px:
   o gráfico para de vazar para a borda e fica na coluna */
@media (min-width: 1401px) { .tcs__chart { margin-left: 0; margin-right: 0; } }
.tcs__sk { position: absolute; inset: 0 clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 72px) 0; }
@media (min-width: 1401px) { .tcs__sk { inset: 0 0 clamp(48px, 6vw, 72px) 0; } }
/* sem histórico: o desenho dos estados de lista, sobre o carvão */
.tcs__state {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  padding: 0 var(--nu-coluna) clamp(48px, 6vw, 72px); text-align: center;
}
.tcs__state-ic {
  display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%;
  background: var(--nu-dark-chip); box-shadow: inset 0 0 0 1px var(--nu-dark-chip-line); color: var(--nu-on-dark);
}
.tcs__state-ic svg { width: 20px; height: 20px; }
.tcs__state-txt { margin: 0; max-width: 40ch; color: var(--nu-on-dark-2); font-size: 15px; font-weight: var(--nu-w-texto); line-height: 1.5; }
</style>

<script setup lang="ts">
import {
  GRAFICOS_DESCRICAO,
  GRAFICOS_PATH,
  GRAFICOS_TITULO,
  AVISO,
  datasetsJsonLd,
  type Grafico,
} from '~/utils/graficos'

const { data } = await useAsyncData('graficos', () => $fetch<{ graficos: Grafico[], dateModified: string | null }>('/api/graficos'))
const graficos = computed(() => data.value?.graficos ?? [])
const origin = useSiteOrigin()

usePageSeo({
  title: GRAFICOS_TITULO,
  description: GRAFICOS_DESCRICAO,
  path: GRAFICOS_PATH,
  dateModified: computed(() => data.value?.dateModified ?? null),
  structuredData: datasetsJsonLd(origin, graficos.value),
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Gráficos', path: GRAFICOS_PATH },
  ],
})
</script>

<template>
  <div class="gr">
    <NuPageHero
      eyebrow="Gráficos"
      subtitle="CDI líquido, proventos com pagamento nesta semana e FIIs ordenados por dividend yield. Atualizam todo dia. Uso livre com crédito."
    >
      <template #title>Números para citar.</template>
    </NuPageHero>
    <p class="gr-aviso">{{ AVISO }}</p>
    <div
      v-for="(grafico, i) in graficos"
      :key="grafico.id"
      class="gr-banda"
      :class="{ 'gr-banda--branca': i % 2 === 0 }"
    >
      <GraficoPainel :grafico="grafico" />
    </div>
    <p v-if="!graficos.length" class="gr-vazio">Os dados destas séries não estão disponíveis agora.</p>
  </div>
</template>

<style scoped>
.gr {
  background: #f5f1ea;
  color: #0c1524;
  font-family: var(--nu-font);
  overflow-wrap: break-word;
}
.gr-aviso, .gr-vazio {
  width: min(920px, calc(100% - 32px));
  margin: 8px auto 0;
  color: #0c1524;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.4;
}
.gr-vazio {
  padding: 28px 0 72px;
  font-weight: 500;
}
.gr-banda--branca { background: #fff; }
</style>

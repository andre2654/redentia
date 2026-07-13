<script setup lang="ts">
// Cards de stat do hero de /dividendos/[ticker]: cards brancos sobre o creme
// do NuPageHero (label gray + valor grande tabular-nums; accent verde pro
// próximo pagamento anunciado). Linguagem Nu: radius tile, sombra só no hover.
import type { AcaoStatRow } from '~/types/acao'

defineProps<{ items: AcaoStatRow[] }>()
</script>

<template>
  <div class="dvs">
    <div v-for="s in items" :key="s.l" class="dvs__card">
      <span class="dvs__label">{{ s.l }}</span>
      <span class="dvs__value" :class="{ 'dvs__value--green': s.accent === 'green' }">{{ s.v }}</span>
    </div>
  </div>
</template>

<style scoped>
.dvs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: 12px;
  max-width: 980px;
}
.dvs__card {
  background: var(--nu-white);
  border-radius: var(--nu-r-tile);
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: nu-fade .5s ease both;
}
.dvs__label { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }
.dvs__value {
  color: var(--nu-ink); font-size: clamp(20px, 2.2vw, 26px); font-weight: 800;
  letter-spacing: -.3px; font-variant-numeric: tabular-nums; white-space: nowrap;
}
.dvs__value--green { color: var(--nu-green-2); }

@media (max-width: 760px) {
  .dvs { grid-template-columns: repeat(2, 1fr); }
  .dvs__card { padding: 15px 17px; }
}
</style>

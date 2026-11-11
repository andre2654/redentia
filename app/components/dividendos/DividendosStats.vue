<script setup lang="ts">
// Cards de stat do hero de /dividendos/[ticker]: cards brancos sobre o creme
// do NuPageHero (label gray + valor grande tabular-nums; accent verde pro
// próximo pagamento anunciado). Linguagem Nu: radius tile, sombra só no hover.
import type { AcaoStatRow } from '~/types/acao'

defineProps<{ items: AcaoStatRow[] }>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()
</script>

<template>
  <div class="dvs">
    <div v-for="s in items" :key="s.l" v-contexto-chat="{ id: `dividendos:${sobre}:${s.l}`, tipo: 'proventos', rotulo: rotuloComSobre(s.l, sobre), texto: `${s.l}${sobre ? ` (${sobre})` : ''}: ${s.v}${s.fonte ? ` · ${s.fonte}` : ''}` }" class="dvs__card">
      <span class="dvs__label">{{ s.l }}</span>
      <span class="dvs__value" :class="{ 'dvs__value--green': s.accent === 'green' }">{{ s.v }}</span>
      <span v-if="s.fonte" class="dvs__fonte">{{ s.fonte }}</span>
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
  box-shadow: var(--nu-shadow-quente);
  border-radius: var(--nu-r-tile);
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: nu-fade .5s ease both;
}
.dvs__label { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; }
.dvs__value {
  color: var(--nu-ink); font-size: clamp(22px, 2.4vw, 30px); font-weight: 800;
  letter-spacing: -0.03em; font-variant-numeric: tabular-nums; line-height: 1.2;
  overflow-wrap: anywhere;
}
.dvs__value--green { color: var(--nu-green-text); }
.dvs__fonte { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.4; }

@media (max-width: 760px) {
  .dvs { grid-template-columns: repeat(2, 1fr); }
  .dvs__card { padding: 15px 17px; }
}
</style>

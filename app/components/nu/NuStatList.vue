<script setup lang="ts">
// Lista label/valor com hairlines (design Acoes Nu): variante dark (stats do
// chart, hairline rgba(creme,.10)) e light sobre creme (dividendos, hairline
// #E7E0D2). A 1ª linha da variante dark não tem hairline (design).
import type { AcaoStatRow } from '~/types/acao'

defineProps<{ rows: AcaoStatRow[]; dark?: boolean }>()
</script>

<template>
  <div>
    <div v-for="(r, i) in rows" :key="r.l" class="nsl__row" :class="[dark ? 'nsl__row--dark' : 'nsl__row--light', { 'nsl__row--first': dark && i === 0 }]">
      <span class="nsl__label" :class="dark ? 'nsl__label--dark' : 'nsl__label--light'">{{ r.l }}</span>
      <span class="nsl__value" :class="[dark ? 'nsl__value--dark' : 'nsl__value--light', { 'nsl__value--green': r.accent === 'green' }]">{{ r.v }}</span>
    </div>
  </div>
</template>

<style scoped>
.nsl__row {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 14px; padding: 13px 0;
}
.nsl__row--dark { border-top: 1px solid var(--nu-cream-text-10); }
.nsl__row--first { border-top: none; }
.nsl__row--light { border-top: 1px solid var(--nu-cream-line); }
.nsl__label { font-weight: 600; }
.nsl__label--dark { color: var(--nu-cream-text-50); font-size: 13.5px; }
.nsl__label--light { color: var(--nu-gray); font-size: 14.5px; }
.nsl__value { font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; }
.nsl__value--dark { color: var(--nu-cream-text); font-size: 16.5px; }
.nsl__value--light { color: var(--nu-ink); font-size: 17px; }
/* PR5: valor com destaque (ex.: 'Desde o lançamento' na tese) */
.nsl__value--dark.nsl__value--green { color: var(--nu-green-soft); }
.nsl__value--light.nsl__value--green { color: var(--nu-green-2); }
</style>

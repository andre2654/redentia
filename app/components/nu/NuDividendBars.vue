<script setup lang="ts">
// Bar chart CSS de proventos por ano (design Acoes Nu): barras radius 16 com
// altura % do máximo (min-height 22px, max-width 86px), ano corrente em azul
// com label azul, demais em rgba(12,21,36,0.13); valores acima, anos abaixo,
// footnote explicativa.
import type { AcaoDividendBar } from '~/types/acao'

defineProps<{ bars: AcaoDividendBar[]; footnote: string }>()
</script>

<template>
  <div>
    <div class="ndb__bars">
      <div v-for="b in bars" :key="b.year" class="ndb__col">
        <span class="ndb__val" :class="{ 'ndb__val--current': b.current }">{{ b.valFmt }}</span>
        <div class="ndb__bar" :class="{ 'ndb__bar--current': b.current }" :style="{ height: `${b.hPct}%` }" />
      </div>
    </div>
    <div class="ndb__years">
      <span v-for="b in bars" :key="b.year" class="ndb__year" :class="{ 'ndb__year--current': b.current }">{{ b.year }}</span>
    </div>
    <div class="ndb__footnote">{{ footnote }}</div>
  </div>
</template>

<style scoped>
.ndb__bars {
  display: flex; align-items: flex-end; gap: clamp(10px, 1.6vw, 22px);
  height: clamp(240px, 26vw, 320px);
}
.ndb__col {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: flex-end; height: 100%; min-width: 0;
}
.ndb__val {
  color: var(--nu-ink); font-size: clamp(12px, 1.3vw, 15px); font-weight: 800;
  white-space: nowrap; font-variant-numeric: tabular-nums; margin-bottom: 10px;
}
.ndb__val--current { color: var(--nu-blue); }
.ndb__bar {
  width: 100%; max-width: 86px; min-height: 22px; border-radius: var(--nu-r-tile);
  background: var(--nu-bar-inactive); transition: transform .18s;
}
.ndb__bar--current { background: var(--nu-blue); }
.ndb__years { display: flex; gap: clamp(10px, 1.6vw, 22px); margin-top: 12px; }
.ndb__year { flex: 1; text-align: center; color: var(--nu-gray); font-size: 14px; font-weight: 600; }
.ndb__year--current { color: var(--nu-ink); font-weight: 800; }
.ndb__footnote { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-top: 22px; }
</style>

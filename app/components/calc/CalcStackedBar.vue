<script setup lang="ts">
// PR10 — barra de proporção empilhada (aportado vs juros). Valores exatos do
// design: 12px de altura, radius 999 no container, gap 3px entre segmentos.
defineProps<{ segments: { pct: number; color: string }[] }>()
</script>

<template>
  <div class="csb">
    <span
      v-for="(s, i) in segments"
      :key="i"
      :style="{ width: s.pct.toFixed(1) + '%', background: s.color }"
    />
  </div>
</template>

<style scoped>
.csb {
  display: flex;
  height: 12px;
  border-radius: var(--nu-r-pill);
  overflow: hidden;
  gap: 3px;
  max-width: 560px;
}
</style>

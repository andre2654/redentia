<script setup lang="ts">
// Card de estatística: número hero 800 tabular-nums + label muted, sobre
// creme radius 20. Valores exatos do design (Redentia Guia Open Finance).
// O grid (auto-fit minmax(170px,1fr)) vive no consumidor.
import type { GuideStat } from '~/types/guias'

defineProps<{ stat: GuideStat }>()
</script>

<template>
  <div class="nsc">
    <div class="nsc__value">{{ stat.value }}</div>
    <div class="nsc__label">{{ stat.label }}</div>
  </div>
</template>

<style scoped>
.nsc { background: var(--nu-cream); border-radius: 20px; padding: 22px; }
.nsc__value {
  color: var(--nu-ink); font-size: clamp(26px, 2.4vw, 34px); font-weight: 800;
  letter-spacing: -1px; font-variant-numeric: tabular-nums;
}
.nsc__label { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-top: 6px; }
</style>

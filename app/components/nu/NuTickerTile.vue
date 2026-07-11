<script setup lang="ts">
// Tile colorido de letra de ticker — o padrão aparece em 2 tamanhos nos
// designs: sm (22px, radius 7 — chips dos cards de tese do /mercado) e
// lg (48px, radius 14 — avaliação por ativo da tese). Extraído do
// NuThesisCard no PR5 (1 implementação por responsabilidade).
// Cores SEMPRE via var(--nu-*) passadas por prop.
defineProps<{
  letter: string
  bg: string
  /** default: letra navy (tiles sólidos dos chips) */
  fg?: string
  size?: 'sm' | 'lg'
}>()
</script>

<template>
  <span class="ntt" :class="`ntt--${size ?? 'sm'}`" :style="{ background: bg, color: fg ?? 'var(--nu-navy)' }">{{ letter }}</span>
</template>

<style scoped>
.ntt {
  flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
  font-weight: 800;
}
.ntt--sm { width: 22px; height: 22px; border-radius: 7px; font-size: 11px; }
.ntt--lg { width: 48px; height: 48px; border-radius: 14px; font-size: 17px; }
</style>

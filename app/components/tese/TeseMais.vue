<script setup lang="ts">
// O "+" no círculo carvão dos acordeões da Aportou (o do FAQ): gira 45 graus
// quando o <details> de quem ele é filho abre. Quem gira é o pai, pela classe
// `.tma` (ver o CSS de cada acordeão): aqui só mora o desenho.
withDefaults(defineProps<{ tamanho?: number; sobre?: 'claro' | 'escuro' }>(), { tamanho: 36, sobre: 'claro' })
</script>

<template>
  <span class="tma" :class="{ 'tma--escuro': sobre === 'escuro' }" :style="{ width: `${tamanho}px`, height: `${tamanho}px` }" aria-hidden="true">
    <svg viewBox="0 0 24 24" :width.attr="Math.round(tamanho * 0.44)" :height.attr="Math.round(tamanho * 0.44)"><path d="M12 5v14M5 12h14" /></svg>
  </span>
</template>

<style scoped>
.tma {
  flex: none; display: inline-grid; place-items: center; border-radius: 50%; background: var(--nu-ink);
  transition: transform .3s cubic-bezier(.2, .8, .2, 1), background .2s ease;
}
.tma svg { display: block; fill: none; stroke: var(--nu-white); stroke-width: 2.6; stroke-linecap: round; }
.tma--escuro { background: var(--nu-creme); }
.tma--escuro svg { stroke: var(--nu-ink); }
@media (prefers-reduced-motion: reduce) { .tma { transition: none; } }
</style>

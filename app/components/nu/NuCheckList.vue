<script setup lang="ts">
// Lista de garantias com check verde (stroke 2.8) alinhado ao topo e texto
// com título em <strong> 800. Valores exatos do design (Guia Open Finance).
// HTML dos itens é conteúdo local confiável.
defineProps<{ items: string[] }>()
</script>

<template>
  <div class="ncl">
    <div v-for="(it, i) in items" :key="i" class="ncl__row">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" class="ncl__check"><path d="M20 6L9 17l-5-5" /></svg>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span class="ncl__text" v-html="it" />
    </div>
  </div>
</template>

<style scoped>
.ncl__row { display: flex; align-items: flex-start; gap: 13px; padding: 12px 0; }
.ncl__check { flex-shrink: 0; margin-top: 3px; color: var(--nu-green-2); }
.ncl__text { color: var(--nu-gray-3); font-size: 16.5px; font-weight: 500; line-height: 1.6; }
.ncl__text :deep(strong) { font-weight: 800; }
</style>

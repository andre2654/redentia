<script setup lang="ts">
// Botão-linha estilo Nubank (ícone à esquerda, label flex:1, chevron '>'):
// transparente, padding 11px 4px, radius 12px, hover creme --nu-row-hover.
// Genérico pra listas de ação — no login carrega o toggle de método e o
// Google.
defineProps<{ label: string }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button type="button" class="nlab" @click="$emit('click')">
    <span class="nlab__icon"><slot name="icon" /></span>
    <span class="nlab__label">{{ label }}</span>
    <svg class="nlab__chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  </button>
</template>

<style scoped>
.nlab {
  display: flex; align-items: center; gap: 12px; width: 100%;
  background: transparent; border: none; padding: 11px 4px;
  cursor: pointer; border-radius: var(--nu-r-chip);
  transition: background .2s; text-align: left;
}
.nlab:hover { background: var(--nu-row-hover); }
.nlab__icon { display: inline-flex; color: var(--nu-gray-2); }
.nlab__label { flex: 1; color: var(--nu-ink); font-size: 15px; font-weight: 700; }
.nlab__chevron { color: var(--nu-gray); flex: none; }
</style>

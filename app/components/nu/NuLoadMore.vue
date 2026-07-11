<script setup lang="ts">
// Pill neutra de paginação (bg areia, hover mais escuro) — valores exatos do
// design (Redentia Noticias Nu.dc.html). Compartilhado: feeds paginados.
defineProps<{ label: string; busy?: boolean }>()
defineEmits<{ (e: 'more'): void }>()
</script>

<template>
  <button type="button" class="nlm" :disabled="busy" @click="$emit('more')">
    {{ busy ? 'Carregando…' : label }}
  </button>
</template>

<style scoped>
.nlm {
  display: inline-flex; align-items: center; background: var(--nu-sand-2); color: var(--nu-gray-2);
  font-size: 14px; font-weight: 800; padding: 12px 24px; border-radius: var(--nu-r-pill);
  border: none; cursor: pointer; transition: background .2s;
}
.nlm:hover { background: var(--nu-sand-hover); }
.nlm:disabled { cursor: default; opacity: .7; }
</style>

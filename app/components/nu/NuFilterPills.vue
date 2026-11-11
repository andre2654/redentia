<script setup lang="ts">
// Tabs-pill de filtro (ativa preto/branco, inativa branca com borda areia) —
// valores exatos do design (Redentia Noticias Nu.dc.html). Compartilhado:
// Notícias hoje; Guias reusa.
defineProps<{ items: readonly string[]; modelValue: string }>()
defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <div class="nfp">
    <button
      v-for="it in items" :key="it" type="button" class="nfp__pill"
      :class="{ 'nfp__pill--active': it === modelValue }"
      @click="$emit('update:modelValue', it)"
    >{{ it }}</button>
  </div>
</template>

<style scoped>
.nfp { display: flex; gap: 8px; flex-wrap: wrap; }
.nfp__pill {
  min-height: 44px; padding: 0 18px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio);
  cursor: pointer; border: 1px solid var(--nu-line); background: var(--nu-white);
  color: var(--nu-gray-3); transition: background .2s, color .2s, border-color .2s, transform .15s var(--nu-ease-saida); white-space: nowrap;
}
.nfp__pill:hover { border-color: var(--nu-ink); color: var(--nu-ink); }
.nfp__pill:active { transform: scale(.98); }
.nfp__pill--active, .nfp__pill--active:hover {
  border-color: var(--nu-ink); background: var(--nu-ink); color: var(--nu-white);
}
</style>

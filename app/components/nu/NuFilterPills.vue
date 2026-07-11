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
  padding: 10px 18px; border-radius: var(--nu-r-pill); font-size: 14.5px; font-weight: 700;
  cursor: pointer; border: 2px solid var(--nu-sand-border); background: var(--nu-white);
  color: var(--nu-gray-2); transition: all .2s; white-space: nowrap;
}
.nfp__pill--active {
  border-color: var(--nu-ink); background: var(--nu-ink);
  color: var(--nu-white); font-weight: 800;
}
</style>

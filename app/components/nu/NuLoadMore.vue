<script setup lang="ts">
// Pílula de paginação ("Carregar mais") — compartilhada pelos feeds paginados.
// APORTOU (11/11/2026): pílula de contorno carvão (segunda chamada), que enche
// de carvão ao passar o ponteiro. Enquanto busca, o rótulo fica e entram os
// três pontos da marca (nu-ponto): sem "Carregando…" e sem spinner.
defineProps<{ label: string; busy?: boolean }>()
defineEmits<{ (e: 'more'): void }>()
</script>

<template>
  <button type="button" class="nlm" :disabled="busy" :aria-busy="busy || undefined" @click="$emit('more')">
    {{ label }}
    <span v-if="busy" class="nlm__pontos" aria-hidden="true"><i /><i /><i /></span>
  </button>
</template>

<style scoped>
.nlm {
  display: inline-flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 26px;
  background: transparent; color: var(--nu-ink); box-shadow: inset 0 0 0 1.5px var(--nu-ink);
  font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); border-radius: var(--nu-r-pill);
  border: none; cursor: pointer; transition: background .2s, color .2s, transform .15s var(--nu-ease-saida);
}
.nlm:hover { background: var(--nu-ink); color: var(--nu-white); }
.nlm:active { transform: scale(.98); }
.nlm:disabled { cursor: default; background: transparent; color: var(--nu-gray); box-shadow: inset 0 0 0 1px var(--nu-line); }
.nlm__pontos { display: inline-flex; gap: 3px; }
.nlm__pontos i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: nu-ponto 1.2s infinite; }
.nlm__pontos i:nth-child(2) { animation-delay: .2s; }
.nlm__pontos i:nth-child(3) { animation-delay: .4s; }
</style>

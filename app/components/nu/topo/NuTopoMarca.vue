<script setup lang="ts">
// A marca do header: o wordmark da Aportou (MarcaAportou, 11/11/2026), que
// volta à home. A marca da Redentia (o losango azul, da variante do produto
// de escritório) saiu com o B2B em 12/11/2026.
defineProps<{ tamanho?: number }>()
</script>

<template>
  <NuxtLink to="/" class="ntm ntm--aportou" aria-label="Aportou, início">
    <MarcaAportou :altura="tamanho ?? 30" />
  </NuxtLink>
</template>

<style scoped>
.ntm {
  display: inline-flex; align-items: center; gap: 9px; flex-shrink: 0;
  color: var(--nu-ink); border-radius: var(--nu-r-chip); padding: 4px 6px 4px 2px; margin-left: -2px;
}
.ntm--aportou { padding: 6px 6px 6px 2px; min-height: 44px; }
.ntm:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
/* na Aportou, o anel de foco do site (3px) */
.ntm--aportou:focus-visible { outline-width: 3px; }
</style>

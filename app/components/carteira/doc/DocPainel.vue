<script setup lang="ts">
// O painel calmo do documento: fundo quente, sem sombra, com o nome do painel
// num rótulo pequeno em caixa alta e, à direita, o nome das colunas.
defineProps<{ rotulo: string }>()
</script>

<template>
  <div class="dpn">
    <div class="dpn__cab"><span>{{ rotulo }}</span><span v-if="$slots.colunas" class="dpn__cols"><slot name="colunas" /></span></div>
    <slot />
  </div>
</template>

<style scoped>
.dpn { padding: 24px clamp(18px, 4cqi, 30px) 20px; border-radius: 14px; background: var(--nu-band); min-width: 0; }
.dpn__cab { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 12px; color: var(--nu-gray); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
.dpn__cols { display: flex; flex: none; }
</style>

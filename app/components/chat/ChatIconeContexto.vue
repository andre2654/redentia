<script setup lang="ts">
// O ícone de 14px do chip de contexto, pelo tipo do pedaço da página. Traço 2,
// currentColor, o mesmo desenho dos ícones do header.
defineProps<{ tipo?: string }>()
</script>

<template>
  <svg class="cic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="tipo === 'grafico' || tipo === 'bolsa'"><path d="M4 18l5-6 4 3 7-9" /></template>
    <template v-else-if="tipo === 'proventos'"><path d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 2.6 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3" /></template>
    <template v-else-if="tipo === 'carteira' || tipo === 'posicao'"><rect x="3.5" y="6.5" width="17" height="12" rx="3" /><path d="M16 12.5h.01M3.5 10h17" /></template>
    <template v-else-if="tipo === 'tese'"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" /></template>
    <template v-else-if="tipo === 'noticia'"><rect x="4" y="4.5" width="16" height="15" rx="2.5" /><path d="M8 9h8M8 12.5h8M8 16h5" /></template>
    <template v-else-if="tipo === 'ativo'"><path d="M8 3.5v17M16 3.5v17" /><rect x="5.5" y="8" width="5" height="7" rx="1.2" /><rect x="13.5" y="6" width="5" height="8" rx="1.2" /></template>
    <template v-else><circle cx="12" cy="12" r="7.5" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></template>
  </svg>
</template>

<style scoped>
.cic { flex-shrink: 0; display: block; color: var(--nu-blue); }
</style>

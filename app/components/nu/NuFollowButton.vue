<script setup lang="ts">
// Botão toggle de seguir (PR5, hero da tese): off = pill creme + bookmark +
// 'Acompanhar tese' · on = verde-accent + check + 'Acompanhando'.
// Reusável pra seguir teses/ativos — quem decide o que o clique faz é o pai
// (V1: anônimo → /login com redirect; logado → toggle local; a persistência
// em thesis_favorites entra com o fluxo logado do PR6+).
defineProps<{
  following: boolean
  labelOff?: string
  labelOn?: string
}>()

defineEmits<{ toggle: [] }>()
</script>

<template>
  <button type="button" class="nfb" :class="{ 'nfb--on': following }" @click="$emit('toggle')">
    <svg v-if="!following" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-4.5L5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
    {{ following ? (labelOn ?? 'Acompanhando') : (labelOff ?? 'Acompanhar tese') }}
  </button>
</template>

<style scoped>
.nfb {
  pointer-events: auto; display: inline-flex; align-items: center; gap: 10px;
  border: none; border-radius: var(--nu-r-pill); padding: 15px 28px;
  font-size: 15.5px; font-weight: 800; cursor: pointer;
  background: var(--nu-cream); color: var(--nu-navy);
  transition: background .2s, color .2s, transform .15s;
}
.nfb--on { background: var(--nu-green-soft); }
</style>

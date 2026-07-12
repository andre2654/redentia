<script setup lang="ts">
// Botão-olho circular do toggle de privacidade (NuPrivacyToggle do spec) —
// extraído do HomeHero no PR8 (o hero da /carteira usa o mesmo botão).
// Valores do design: 46-48px, borda 2px rgba(ink,.16), hover branco.
// O ESTADO vive no useHiddenValues (global); aqui só o botão.
const { hidden, toggle } = useHiddenValues()
</script>

<template>
  <button
    type="button" class="neb"
    :aria-label="hidden ? 'Mostrar valores' : 'Esconder valores'"
    :aria-pressed="hidden"
    @click="toggle"
  >
    <svg v-if="!hidden" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
    <svg v-else width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></svg>
  </button>
</template>

<style scoped>
.neb {
  width: 48px; height: 48px; border-radius: 50%; color: var(--nu-ink);
  background: transparent; border: 2px solid var(--nu-ink-16);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  flex-shrink: 0; transition: background .2s, border-color .2s;
}
.neb:hover { background: var(--nu-white); border-color: var(--nu-ink-30); }
</style>

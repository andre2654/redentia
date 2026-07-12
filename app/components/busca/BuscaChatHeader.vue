<script setup lang="ts">
// Header sticky do chat — identidade "Redentia AI" (label NUNCA vaza modelo)
// + Histórico (só se há conversas) / Nova conversa / X.
// Gruda logo abaixo do NuHeader global (top: var(--nuh-h)).
// Contrato de UX: Redentia Busca Nu.dc.html (linhas 97-117).
const props = defineProps<{
  temHist: boolean
  histOpen: boolean
}>()
const emit = defineEmits<{
  (e: 'hist'): void
  (e: 'nova'): void
  (e: 'sair'): void
}>()
</script>

<template>
  <div class="bch">
    <div class="bch__id">
      <span class="bch__tile" aria-hidden="true">
        <img src="/logo-branca.svg" alt="" class="bch__tile-img">
      </span>
      <span>
        <span class="bch__name">Redentia AI</span>
        <span class="bch__sub">com base nos seus dados e no mercado de hoje</span>
      </span>
    </div>
    <div class="bch__actions">
      <button
        v-if="props.temHist" type="button" class="bch__pill"
        :aria-expanded="props.histOpen" aria-controls="busca-hist-drawer"
        @click="emit('hist')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
        Histórico
      </button>
      <button type="button" class="bch__pill" @click="emit('nova')">Nova conversa</button>
      <button type="button" class="bch__close" aria-label="Fechar o chat" @click="emit('sair')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.bch {
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  padding: 16px clamp(22px, 5.5vw, 80px);
  border-bottom: 1px solid var(--nu-cream-text-08);
  position: sticky; top: var(--nuh-h, 76px); background: var(--nu-navy); z-index: 45;
  transition: top .28s ease;
}
.bch__id { display: flex; align-items: center; gap: 12px; min-width: 0; }
.bch__tile {
  width: 40px; height: 40px; border-radius: 13px; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.bch__tile-img { width: 21px; height: 21px; display: block; object-fit: contain; }
.bch__name { display: block; color: var(--nu-cream-text); font-size: 15.5px; font-weight: 800; }
.bch__sub { display: block; color: var(--nu-cream-text-50); font-size: 12.5px; font-weight: 600; margin-top: 1px; }
.bch__actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.bch__pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: var(--nu-cream-text);
  border: 1.5px solid var(--nu-cream-text-35); border-radius: var(--nu-r-pill);
  padding: 9px 18px; font-size: 13.5px; font-weight: 800; cursor: pointer;
  white-space: nowrap; transition: background .2s, border-color .2s;
}
.bch__pill:hover { background: var(--nu-cream-text-10); border-color: var(--nu-cream-text-70); }
.bch__pill:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
.bch__close {
  width: 38px; height: 38px; border-radius: 50%;
  background: var(--nu-cream-text-10); border: none; color: var(--nu-cream-text);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: background .2s;
}
.bch__close:hover { background: var(--nu-cream-text-22); }
.bch__close:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }

</style>

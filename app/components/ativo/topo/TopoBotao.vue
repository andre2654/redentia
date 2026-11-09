<script setup lang="ts">
// Um botão-ícone redondo do topo escuro, com o rótulo embaixo (03/11/2026,
// "A bolsa no bolso"). Saiu do TopoAcoes do /asset em 05/11/2026 para o topo
// da /carteira usar o MESMO botão (Esconder valores, Adicionar conta,
// Perguntar): o ícone vem no slot, o rótulo e o estado por prop. Com `to`,
// vira link; sem, botão. Mola só no toque.
const props = withDefaults(defineProps<{ rotulo: string; to?: string; on?: boolean }>(), { to: undefined, on: false })
const Link = resolveComponent('NuxtLink')
</script>

<template>
  <component :is="to ? Link : 'button'" :to="to" :type="to ? undefined : 'button'" class="tac__b" :class="{ 'tac__b--on': props.on }">
    <span class="tac__c" aria-hidden="true"><slot /></span>
    <span class="tac__r">{{ rotulo }}</span>
  </component>
</template>

<style scoped>
.tac__b {
  --mola: cubic-bezier(.34, 1.56, .64, 1);
  display: flex; flex-direction: column; align-items: center; gap: 6px; width: 64px; padding: 0; border: 0; background: none;
  font: inherit; color: inherit; cursor: pointer; text-align: center;
}
.tac__b:focus-visible { outline: none; }
.tac__b:focus-visible .tac__c { box-shadow: 0 0 0 2px var(--nu-blue-soft); }
.tac__c {
  display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%;
  transition: background .2s ease, color .2s ease, transform .45s var(--mola), box-shadow .2s ease;
}
.tac__b:hover .tac__c { transform: translateY(-2px); }
.tac__b:active .tac__c { transform: scale(.92); }
.tac__r { font-size: var(--nu-fs-xs); font-weight: 600; line-height: 1.25; }
.tac__c { background: var(--nu-agora-pilula); color: var(--nu-agora-texto); box-shadow: inset 0 0 0 1px var(--nu-agora-linha); }
.tac__b:hover .tac__c { background: var(--nu-white-18); }
.tac__r { color: var(--nu-agora-sub); }
.tac__b--on .tac__c { background: var(--nu-green-soft); color: var(--nu-navy); box-shadow: none; }
.tac__b:disabled { cursor: progress; }
@media (prefers-reduced-motion: reduce) {
  .tac__c { transition: none; }
  .tac__b:hover .tac__c, .tac__b:active .tac__c { transform: none; }
}
</style>

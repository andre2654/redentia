<script setup lang="ts">
// Um botão-ícone redondo do topo escuro, com o rótulo embaixo (03/11/2026,
// "A bolsa no bolso"). Saiu do TopoAcoes do /asset em 05/11/2026 para o topo
// da /carteira usar o MESMO botão (Esconder valores, Adicionar conta,
// Perguntar): o ícone vem no slot, o rótulo e o estado por prop. Com `to`,
// vira link; sem, botão. Mola só no toque.
// `tom="claro"` (Aportou, 11/11/2026) é o mesmo botão sobre o creme da página
// do ativo: círculo creme, ícone carvão; ligado, carvão com o ícone branco.
// Robustez (11/11/2026): os tempos e as curvas dos tokens (hover 280ms, apertar
// 160ms, cor na curva de cor), o anel de foco de 3px nos dois tons e o rótulo
// que acende junto com o círculo.
const props = withDefaults(defineProps<{ rotulo: string; to?: string; on?: boolean; tom?: 'escuro' | 'claro' }>(), { to: undefined, on: false, tom: 'escuro' })
const Link = resolveComponent('NuxtLink')
</script>

<template>
  <component :is="to ? Link : 'button'" :to="to" :type="to ? undefined : 'button'" class="tac__b" :class="{ 'tac__b--on': props.on, 'tac__b--claro': props.tom === 'claro' }">
    <span class="tac__c" aria-hidden="true"><slot /></span>
    <span class="tac__r">{{ rotulo }}</span>
  </component>
</template>

<style scoped>
.tac__b {
  --mola: var(--nu-ease-saida);
  display: flex; flex-direction: column; align-items: center; gap: 6px; width: 64px; padding: 0; border: 0; background: none;
  font: inherit; color: inherit; cursor: pointer; text-align: center;
}
.tac__b:focus-visible { outline: none; }
.tac__b:focus-visible .tac__c { box-shadow: 0 0 0 3px var(--nu-blue-on-dark); }
.tac__c {
  display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--mola), box-shadow var(--nu-dur-media) var(--nu-ease-cor);
}
.tac__b:hover .tac__c { transform: translateY(-2px); }
.tac__b:active .tac__c { transform: scale(.92); transition-duration: var(--nu-dur-rapida); }
.tac__r { font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); line-height: 1.25; transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.tac__c { background: var(--nu-agora-pilula); color: var(--nu-agora-texto); box-shadow: inset 0 0 0 1px var(--nu-agora-linha); }
.tac__b:hover .tac__c { background: var(--nu-white-18); }
.tac__r { color: var(--nu-agora-sub); }
.tac__b--on .tac__c { background: var(--nu-green-soft); color: var(--nu-navy); box-shadow: none; }
.tac__b:disabled { cursor: progress; }
/* sobre o creme (o topo do /asset) */
.tac__b--claro:focus-visible .tac__c { box-shadow: 0 0 0 3px var(--nu-blue); }
.tac__b--claro .tac__c { background: var(--nu-cream-2); color: var(--nu-ink); box-shadow: none; }
.tac__b--claro:hover .tac__c { background: var(--nu-line-2); }
.tac__b--claro .tac__r { color: var(--nu-gray-3); }
.tac__b--claro:hover .tac__r { color: var(--nu-ink); }
.tac__b--claro.tac__b--on .tac__c { background: var(--nu-ink); color: var(--nu-white); }
@media (prefers-reduced-motion: reduce) {
  .tac__c, .tac__r { transition: none; }
  .tac__b:hover .tac__c, .tac__b:active .tac__c { transform: none; }
}
</style>

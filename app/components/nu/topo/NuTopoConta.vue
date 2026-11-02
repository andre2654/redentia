<script setup lang="ts">
// O menu da conta (avatar logado) nos topos novos: Minha carteira,
// Configurações e Sair. Vai para o <body>, ancorado à direita do avatar.
defineProps<{ right: number; top: number; vidro?: boolean }>()
const emit = defineEmits<{ fechar: []; sair: [] }>()
</script>

<template>
  <Teleport to="body">
    <div class="ntk" :class="{ 'ntk--vidro': vidro }" role="menu" data-topo-painel :style="{ right: `${right}px`, top: `${top}px` }">
      <NuxtLink to="/carteira" role="menuitem" class="ntk__item" @click="emit('fechar')">Minha carteira</NuxtLink>
      <NuxtLink to="/conta" role="menuitem" class="ntk__item" @click="emit('fechar')">Configurações</NuxtLink>
      <div class="ntk__div" role="separator" />
      <button type="button" role="menuitem" class="ntk__item ntk__item--sair" @click="emit('sair')">Sair</button>
    </div>
  </Teleport>
</template>

<style scoped>
.ntk {
  position: fixed; z-index: 60; min-width: 220px; padding: 6px;
  display: flex; flex-direction: column; gap: 2px;
  background: var(--nu-white); border: 1px solid var(--nu-navy-06); border-radius: var(--nu-r-tile);
  box-shadow: 0 24px 54px -22px rgba(12, 21, 36, 0.32), 0 2px 8px rgba(12, 21, 36, 0.06);
  animation: ntk-entra .18s cubic-bezier(.2, .8, .2, 1) both; transform-origin: top right;
}
.ntk--vidro { background: var(--nu-white-88); backdrop-filter: blur(24px) saturate(1.8); -webkit-backdrop-filter: blur(24px) saturate(1.8); }
@keyframes ntk-entra { from { opacity: 0; transform: translateY(-4px) scale(.98); } to { opacity: 1; transform: none; } }
.ntk__item {
  display: block; width: 100%; padding: 10px 12px; border: 0; border-radius: 10px; background: transparent;
  color: var(--nu-ink); font-family: inherit; font-size: var(--nu-fs-sm); font-weight: 700; text-align: left; cursor: pointer;
  transition: background .15s;
}
.ntk__item:hover { background: var(--nu-ink-04); }
.ntk__item:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: -2px; }
.ntk__item--sair { color: var(--nu-red-text); }
.ntk__item--sair:hover { background: var(--nu-red-tint); }
.ntk__div { height: 1px; margin: 4px 8px; background: var(--nu-cream-line); }
@media (prefers-reduced-motion: reduce) { .ntk { animation: none; } }
</style>

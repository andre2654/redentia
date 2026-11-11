<script setup lang="ts">
// O menu da conta (avatar logado) do header: Minha carteira,
// Configurações e Sair. Vai para o <body>, ancorado à direita do avatar.
// APORTOU (11/11/2026): cartão creme com fio de 1,5px, itens em 600 e a mesma
// entrada dos painéis do topo (a caixa surge, os itens sobem).
defineProps<{ right: number; top: number }>()
const emit = defineEmits<{ fechar: []; sair: []; tecla: [KeyboardEvent] }>()
</script>

<template>
  <Teleport to="body">
    <div class="ntk" role="menu" data-topo-painel @keydown="emit('tecla', $event)" :style="{ right: `${right}px`, top: `${top}px` }">
      <div class="ntk__dentro">
        <NuxtLink to="/carteira" role="menuitem" class="ntk__item" @click="emit('fechar')">Minha carteira</NuxtLink>
        <NuxtLink to="/conta" role="menuitem" class="ntk__item" @click="emit('fechar')">Configurações</NuxtLink>
        <div class="ntk__div" role="separator" />
        <button type="button" role="menuitem" class="ntk__item ntk__item--sair" @click="emit('sair')">Sair</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ntk {
  position: fixed; z-index: 60; min-width: 232px; padding: 8px;
  background: var(--nu-page); border-radius: var(--nu-r-panel);
  box-shadow: 0 0 0 1.5px var(--nu-line-2), var(--nu-shadow-card);
  animation: nu-surgir .2s ease both;
}
.ntk__dentro { display: flex; flex-direction: column; gap: 2px; animation: nu-subir .32s cubic-bezier(.2, .8, .2, 1) both; }
.ntk__item {
  display: flex; align-items: center; width: 100%; min-height: 44px; padding: 0 14px; border: 0; border-radius: var(--nu-r-chip); background: transparent;
  color: var(--nu-ink); font-family: inherit; font-size: var(--nu-fs-md); font-weight: 600; text-align: left; cursor: pointer;
  transition: background .15s, color .15s;
}
.ntk__item:hover { background: var(--nu-band); }
.ntk__item:focus-visible { outline-offset: -3px; }
.ntk__item--sair { color: var(--nu-red-text); }
.ntk__item--sair:hover { background: var(--nu-red-bg); color: var(--nu-red-text); }
.ntk__div { height: 1.5px; margin: 6px 8px; background: var(--nu-line-2); }
@media (prefers-reduced-motion: reduce) { .ntk, .ntk__dentro { animation: none; } }
</style>

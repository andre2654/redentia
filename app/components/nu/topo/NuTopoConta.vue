<script setup lang="ts">
// O menu da conta (avatar logado) do header: Minha carteira,
// Configurações e Sair. Vai para o <body>, ancorado à direita do avatar.
// APORTOU (11/11/2026): cartão creme com fio de 1,5px, itens em 600 e a mesma
// entrada dos painéis do topo (a caixa surge, os itens sobem).
// ROBUSTEZ (11/11/2026): fica montado e abre por `aberto`, com a transição do
// painel da nav: entra na curva de saída e sai mais rápido. Sombra de painel,
// fio de 1px no separador e o raio de dentro concêntrico (22 − 10 = 12).
defineProps<{ aberto: boolean; right: number; top: number }>()
const emit = defineEmits<{ fechar: []; sair: []; tecla: [KeyboardEvent] }>()
/** o painel que está saindo deixa de contar como painel (teclado e clique fora só veem o que está aberto) */
function soltar(el: Element) { el.removeAttribute('data-topo-painel') }
</script>

<template>
  <Teleport to="body">
    <Transition name="ntk" @before-leave="soltar">
      <div v-if="aberto" class="ntk" role="menu" data-topo-painel :style="{ right: `${right}px`, top: `${top}px` }" @keydown="emit('tecla', $event)">
        <div class="ntk__dentro">
          <NuxtLink to="/carteira" role="menuitem" class="ntk__item" @click="emit('fechar')">Minha carteira</NuxtLink>
          <NuxtLink to="/conta" role="menuitem" class="ntk__item" @click="emit('fechar')">Configurações</NuxtLink>
          <div class="ntk__div" role="separator" />
          <button type="button" role="menuitem" class="ntk__item ntk__item--sair" @click="emit('sair')">Sair</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ntk {
  position: fixed; z-index: 60; min-width: 232px; padding: 10px;
  background: var(--nu-page); border-radius: var(--nu-r-panel);
  box-shadow: var(--nu-shadow-float);
  transform-origin: calc(100% - 20px) 0;
}
.ntk__dentro { display: flex; flex-direction: column; gap: 2px; }
.ntk__item {
  display: flex; align-items: center; width: 100%; min-height: 44px; padding: 0 14px; border: 0; border-radius: var(--nu-r-chip); background: transparent;
  color: var(--nu-ink); font-family: inherit; font-size: 15px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); text-align: left; cursor: pointer;
  transition: background-color var(--nu-dur-rapida) var(--nu-ease-cor), color var(--nu-dur-rapida) var(--nu-ease-cor);
}
.ntk__item:hover { background: var(--nu-band); }
.ntk__item:active { background: var(--nu-cream-2); }
.ntk__item:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: -3px; }
.ntk__item--sair { color: var(--nu-red-text); }
.ntk__item--sair:hover { background: var(--nu-red-bg); color: var(--nu-red-text); }
.ntk__div { height: 1px; margin: 6px 8px; background: var(--nu-line-2); }

.ntk-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-lenta) var(--nu-ease-saida); }
.ntk-enter-from { opacity: 0; transform: translateY(8px) scale(.985); }
.ntk-leave-active { pointer-events: none; transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor); }
.ntk-leave-to { opacity: 0; transform: translateY(4px); }
@media (prefers-reduced-motion: reduce) { .ntk-enter-active, .ntk-leave-active { transition: none; } }
</style>

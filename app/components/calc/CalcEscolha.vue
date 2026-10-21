<script setup lang="ts" generic="T extends string | number">
// Uma escolha entre poucas opções, junto da frase da conta (21/10/2026): a
// carteira do planejamento, a pergunta do dividend yield, swing ou day trade
// no imposto de renda. A ativa fica preta, como os chips do kit.
defineProps<{
  /** o que se escolhe ("Carteira"); vai para o leitor de tela e, com `mostrarRotulo`, para a tela */
  rotulo: string
  opcoes: { value: T; label: string }[]
  mostrarRotulo?: boolean
}>()
const escolhida = defineModel<T>({ required: true })
</script>

<template>
  <div class="ces" role="group" :aria-label="rotulo">
    <span v-if="mostrarRotulo" class="ces__rotulo" aria-hidden="true">{{ rotulo }}</span>
    <button
      v-for="o in opcoes"
      :key="String(o.value)"
      type="button"
      class="ces__opcao"
      :class="{ 'ces__opcao--on': escolhida === o.value }"
      :aria-pressed="escolhida === o.value"
      @click="escolhida = o.value"
    >
      {{ o.label }}
    </button>
  </div>
</template>

<style scoped>
.ces { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.ces__rotulo { margin-right: 4px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }
.ces__opcao {
  padding: 9px 16px; border-radius: var(--nu-r-pill); border: 1.5px solid var(--nu-cream-2);
  background: var(--nu-white); color: var(--nu-gray-2); font-family: inherit; font-size: var(--nu-fs-sm); font-weight: 700;
  white-space: nowrap; cursor: pointer; transition: background .2s, border-color .2s, color .2s;
}
.ces__opcao:hover { border-color: var(--nu-ink); color: var(--nu-ink); }
.ces__opcao--on, .ces__opcao--on:hover { border-color: var(--nu-ink); background: var(--nu-ink); color: var(--nu-white); }
.ces__opcao:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
/* no celular o rótulo fica numa linha só dele, e as opções juntas embaixo */
@media (max-width: 640px) {
  .ces__rotulo { width: 100%; margin-right: 0; }
}
</style>

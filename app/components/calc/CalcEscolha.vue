<script setup lang="ts" generic="T extends string | number">
// Uma escolha entre poucas opções, junto da frase da conta (21/10/2026): a
// carteira do planejamento, a pergunta do dividend yield, swing ou day trade
// no imposto de renda. A ativa fica preta, como os chips do kit.
// Robustez (11/11/2026): é o NuTrilho da base (a peça de "escolher uma entre
// poucas"): a pílula carvão DESLIZA até a nova escolha (--nu-dur-lenta
// --nu-ease-troca), as setas do teclado andam e escolhem, e no celular o
// trilho rola de lado por dentro quando não cabe. A API é a de antes.
const props = defineProps<{
  /** o que se escolhe ("Carteira"); vai para o leitor de tela e, com `mostrarRotulo`, para a tela */
  rotulo: string
  opcoes: { value: T; label: string }[]
  mostrarRotulo?: boolean
}>()
const escolhida = defineModel<T>({ required: true })
const opcoesDoTrilho = computed(() => props.opcoes.map((o) => ({ valor: o.value, rotulo: o.label })))
</script>

<template>
  <div class="ces">
    <span v-if="mostrarRotulo" class="ces__rotulo" aria-hidden="true">{{ rotulo }}</span>
    <NuTrilho v-model="escolhida" class="ces__trilho" :opcoes="opcoesDoTrilho" :rotulo="rotulo" />
  </div>
</template>

<style scoped>
/* contain: a largura vem de fora (as opções em fila não alargam a frase nem o cartão; o trilho rola por dentro) */
.ces { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; min-width: 0; contain: inline-size; }
.ces__rotulo { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
/* o trilho encolhe até a largura da frase e rola de lado por dentro quando não cabe (sem alargar o cartão) */
.ces__trilho { flex: 0 1 auto; min-width: 0; max-width: 100%; }
/* no celular o rótulo fica numa linha só dele, e as opções juntas embaixo */
@media (max-width: 640px) {
  .ces__rotulo { width: 100%; }
}
</style>

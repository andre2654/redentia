<script setup lang="ts">
// "E se…" embaixo do cartão da conta, no slot "depois" do CalcConta (dono,
// 21/10/2026: "da pra deixar isso em cápsulas menores?"): a situação concreta e
// o resultado curto, em azul. O aviso fecha a conta.
// Robustez (11/11/2026): as cápsulas não são clicáveis, então não parecem
// botão: viram o NuSelo neutro (raio 8, 28px), com a situação em cinza e o
// resultado em carvão. Azul, na calculadora, é o que se mexe (o selo da frase).
defineProps<{
  itens: { texto: string; valor: string }[]
  aviso?: string
}>()
</script>

<template>
  <div class="cese">
    <ul v-if="itens.length" class="cese__lista" aria-label="E se você mudar a conta">
      <li class="cese__rotulo" aria-hidden="true">E se…</li>
      <NuSelo v-for="i in itens" :key="i.texto" como="li" class="cese__capsula">{{ i.texto }} <b>{{ i.valor }}</b></NuSelo>
    </ul>
    <!-- o que a calculadora mostra a mais, entre as cápsulas e o aviso (a carteira do planejamento) -->
    <slot />
    <p v-if="aviso" class="cese__aviso">{{ aviso }}</p>
  </div>
</template>

<style scoped>
.cese__lista {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px;
  margin: 0; padding: 0; list-style: none;
}
.cese__rotulo { margin-right: 4px; color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; }
/* o selo neutro: a situação em cinza, o resultado em carvão (tabular) */
.cese__capsula { --nsl-tinta: var(--nu-gray-3); gap: 6px; font-weight: var(--nu-w-texto); }
.cese__capsula b { color: var(--nu-ink); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
.cese__aviso { margin: 16px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-texto); text-align: center; }
@media (max-width: 640px) {
  .cese__lista { justify-content: flex-start; gap: 8px; }
  .cese__rotulo { width: 100%; }
}
</style>

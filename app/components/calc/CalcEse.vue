<script setup lang="ts">
// "E se…" embaixo do cartão da conta, no slot "depois" do CalcConta (dono,
// 21/10/2026: "da pra deixar isso em cápsulas menores?"): a situação concreta e
// o resultado curto, em azul. O aviso fecha a conta.
defineProps<{
  itens: { texto: string; valor: string }[]
  aviso?: string
}>()
</script>

<template>
  <div class="cese">
    <ul v-if="itens.length" class="cese__lista" aria-label="E se você mudar a conta">
      <li class="cese__rotulo" aria-hidden="true">E se…</li>
      <li v-for="i in itens" :key="i.texto" class="cese__capsula">{{ i.texto }} <b>{{ i.valor }}</b></li>
    </ul>
    <!-- o que a calculadora mostra a mais, entre as cápsulas e o aviso (a carteira do planejamento) -->
    <slot />
    <p v-if="aviso" class="cese__aviso">{{ aviso }}</p>
  </div>
</template>

<style scoped>
.cese__lista {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px;
  margin: 0; padding: 0; list-style: none;
}
.cese__rotulo { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }
.cese__capsula {
  display: inline-flex; align-items: baseline; gap: 8px; padding: 9px 16px; border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; white-space: nowrap;
}
.cese__capsula b { color: var(--nu-blue); font-weight: 800; font-variant-numeric: tabular-nums; }
.cese__aviso { margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; text-align: center; }
@media (max-width: 640px) {
  .cese__lista { justify-content: flex-start; gap: 8px; }
  .cese__rotulo { width: 100%; }
}
</style>

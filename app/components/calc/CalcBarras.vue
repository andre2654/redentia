<script setup lang="ts">
// O desenho da preço-teto, no lugar do gráfico das outras calculadoras (slot
// "grafico" do CalcConta), 11/11/2026: cada método contra o preço atual, em
// barras. O preço vai em carvão e os métodos em cobalto, as cores da marca
// (antes Graham era verde e o valor patrimonial vermelho, fixos por método:
// parecia leitura de "bom" e "ruim" e não era). As barras crescem da esquerda
// na entrada. A página-mãe e as páginas de método usam a mesma peça.
defineProps<{
  itens: {
    rotulo: string
    /** o valor já formatado ("R$ 37,65", "Indisponível") */
    valor: string
    /** a largura da barra em CSS ("84.3%"); sem ela, a linha fica sem barra */
    largura?: string | null
    /** preco: a barra de referência, em carvão; sem tom, cobalto */
    tom?: 'preco'
  }[]
}>()
</script>

<template>
  <div class="cbr">
    <template v-for="i in itens" :key="i.rotulo">
      <div class="cbr__linha">
        <span class="cbr__rotulo">{{ i.rotulo }}</span>
        <span class="cbr__valor">{{ i.valor }}</span>
      </div>
      <div v-if="i.largura" class="cbr__trilho"><span class="cbr__barra" :class="{ 'cbr__barra--preco': i.tom === 'preco' }" :style="{ width: i.largura }" /></div>
    </template>
  </div>
</template>

<style scoped>
.cbr__linha { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-top: 14px; }
.cbr__linha:first-child { margin-top: 0; }
/* a letra do eixo do CalcCurva (.ccv__eixo, .ccv__fim) */
.cbr__rotulo { color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-medio); }
.cbr__valor { color: var(--nu-ink); font-size: 14px; font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
.cbr__trilho { height: 12px; margin-top: 6px; border-radius: var(--nu-r-pill); background: var(--nu-cream-2); overflow: hidden; }
.cbr__barra {
  display: block; height: 100%; border-radius: var(--nu-r-pill); background: var(--nu-blue);
  transition: width .25s ease; transform-origin: left center; animation: cbr-cresce .6s var(--nu-ease-saida) both;
}
.cbr__barra--preco { background: var(--nu-ink); }
@keyframes cbr-cresce { from { transform: scaleX(0); } }
@media (prefers-reduced-motion: reduce) { .cbr__barra { animation: none; } }
</style>

<script setup lang="ts">
// O desenho da preço-teto, no lugar do gráfico das outras calculadoras (slot
// "grafico" do CalcConta), 11/11/2026: cada método contra o preço atual, em
// barras. O preço vai em carvão e os métodos em cobalto, as cores da marca
// (antes Graham era verde e o valor patrimonial vermelho, fixos por método:
// parecia leitura de "bom" e "ruim" e não era). As barras crescem da esquerda
// na entrada. A página-mãe e as páginas de método usam a mesma peça.
// Robustez (11/11/2026): a barra é o preenchimento inteiro do trilho, deslocado
// por transform (não anima a largura, que mexe no layout): mexendo na conta ela
// desliza até o valor novo em --nu-dur-lenta --nu-ease-troca, com a ponta
// sempre redonda; na entrada cresce da esquerda em --nu-dur-entrada.
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
      <div v-if="i.largura" class="cbr__trilho"><span class="cbr__barra" :class="{ 'cbr__barra--preco': i.tom === 'preco' }" :style="{ '--cbr-l': i.largura }" /></div>
    </template>
  </div>
</template>

<style scoped>
.cbr__linha { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-top: 16px; }
.cbr__linha:first-child { margin-top: 0; }
/* a letra do eixo do CalcCurva (.ccv__eixo, .ccv__fim) */
.cbr__rotulo { color: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.cbr__valor { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
/* o trilho recorta o preenchimento nas pontas redondas (isolation: o recorte vale também para a camada do transform) */
.cbr__trilho { position: relative; isolation: isolate; height: 12px; margin-top: 8px; border-radius: var(--nu-r-pill); background: var(--nu-cream-2); overflow: hidden; }
.cbr__barra {
  position: absolute; inset: 0; border-radius: var(--nu-r-pill); background: var(--nu-blue);
  transform: translateX(calc(var(--cbr-l, 0%) - 100%));
  transition: transform var(--nu-dur-lenta) var(--nu-ease-troca);
  animation: cbr-cresce var(--nu-dur-entrada) var(--nu-ease-saida) backwards;
}
.cbr__barra--preco { background: var(--nu-ink); }
@keyframes cbr-cresce { from { transform: translateX(-100%); } }
</style>

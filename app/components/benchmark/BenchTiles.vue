<script setup lang="ts">
// Leão: mapa de blocos modelo × tema. Cada bloco é um tile de cantos
// arredondados (--nu-r-chip), tingido de azul na proporção do acerto
// (color-mix entre --nu-blue e --nu-cream, sem hex novo); o número vai escrito
// no bloco, em ink nos claros e branco nos escuros, então a cor nunca carrega
// o dado sozinha. Coluna "Nota" separada por um respiro: é a nota oficial do
// índice (questão a questão), não a média dos temas, que contam questões repetidas
// ("Regras novas" cruza os outros blocos).
// Movimento: os blocos aparecem em onda diagonal quando entram na tela; no
// hover o bloco cresce, a linha e a coluna dele ficam em foco e o resto recua.
// Sem parada de Tab por bloco: o número já está escrito em cada um.
const props = defineProps<{
  topics: string[]
  shortTopics?: string[]
  rows: { id: string; name: string; rank: number; cells: number[]; value?: number }[]
  footnote?: string
}>()

const { el, revealClass } = useReveal(0.15)
const hover = ref<{ r: number; c: number } | null>(null)
const nota = (row: { cells: number[]; value?: number }) =>
  Math.round(row.value ?? row.cells.reduce((a, c) => a + c, 0) / (row.cells.length || 1))
// 30% de acerto = quase creme; 100% = azul cheio
const tint = (v: number) => `${Math.round(Math.min(100, Math.max(0, (v - 30) / 70 * 100)))}%`
// branco só no azul quase cheio: no tom médio o ink tem mais contraste (6,6:1 contra 3:1)
const dark = (v: number) => v >= 93
</script>

<template>
  <div ref="el" class="btl" :class="revealClass">
    <div class="btl__grid" :style="{ '--cols': topics.length }" @mouseleave="hover = null">
      <span class="btl__corner" />
      <span
        v-for="(t, c) in topics" :key="t" class="btl__th" :class="{ 'btl__th--on': hover?.c === c }"
      ><span class="btl__long">{{ t }}</span><span class="btl__short">{{ shortTopics?.[c] ?? t }}</span></span>
      <span class="btl__th btl__th--avg">Nota</span>

      <template v-for="(row, r) in rows" :key="row.id">
        <span class="btl__name" :class="{ 'btl__name--on': hover?.r === r }">{{ row.rank }}º {{ row.name }}</span>
        <span
          v-for="(v, c) in row.cells" :key="c" class="btl__cell" role="img"
          :class="{ 'btl__cell--dark': dark(v), 'btl__cell--dim': hover && hover.r !== r && hover.c !== c, 'btl__cell--on': hover?.r === r && hover?.c === c }"
          :style="{ '--t': tint(v), '--d': r + c }"
          :aria-label="`${row.name} em ${topics[c]}: ${v}% de acerto`"
          @mouseenter="hover = { r, c }"
        >{{ v }}</span>
        <span
          class="btl__cell btl__cell--avg" :class="{ 'btl__cell--dark': dark(nota(row)), 'btl__cell--dim': hover && hover.r !== r }"
          :style="{ '--t': tint(nota(row)), '--d': r + topics.length }"
        >{{ nota(row) }}</span>
      </template>
    </div>
    <p class="btl__foot">{{ footnote ?? 'Percentual de acerto por tema. Quanto mais azul, mais acerto.' }}</p>
  </div>
</template>

<style scoped>
.btl { container-type: inline-size; }
.btl__grid {
  display: grid; gap: 4px; align-items: center;
  grid-template-columns: minmax(110px, 170px) repeat(var(--cols), minmax(0, 1fr)) minmax(0, 1fr);
}
.btl__th {
  padding: 0 2px 8px; text-align: center; align-self: end;
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; line-height: 1.25; transition: color .2s;
}
.btl__th--on { color: var(--nu-ink); }
.btl__th--avg { margin-left: 8px; }
.btl__short { display: none; }
.btl__name {
  padding-right: 8px; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color .2s;
}
.btl__name--on { color: var(--nu-blue); }
.btl__cell {
  display: grid; place-items: center; height: 42px; border-radius: var(--nu-r-chip); outline: none; cursor: default;
  background: color-mix(in srgb, var(--nu-blue) var(--t), var(--b-surface, var(--nu-cream)));
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
  transition: transform .18s, opacity .2s, box-shadow .2s;
}
.btl__cell--dark { color: var(--nu-white); }
.btl__cell--avg { margin-left: 8px; font-weight: 800; }
.btl__cell--dim { opacity: .45; }
.btl__cell--on { transform: scale(1.08); box-shadow: var(--nu-shadow-card); position: relative; z-index: 2; }
.btl__cell:focus-visible { outline: 2px solid var(--nu-ink); outline-offset: 2px; }
.btl__foot { margin: 16px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

/* ——— entrada: onda diagonal (animation, não transition: o hover não herda o atraso) ——— */
.is-pending .btl__cell { opacity: 0; }
.is-in .btl__cell { animation: btl-in .45s cubic-bezier(.2, .8, .2, 1) backwards; animation-delay: calc(var(--d) * 35ms); }
@keyframes btl-in { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: scale(1); } }

@container (max-width: 640px) {
  .btl__grid { gap: 3px; grid-template-columns: 74px repeat(var(--cols), minmax(0, 1fr)) minmax(0, 1fr); }
  .btl__long { display: none; }
  .btl__short { display: inline; }
  .btl__name { font-size: var(--nu-fs-xs); white-space: normal; line-height: 1.15; }
  .btl__cell { height: 34px; border-radius: 8px; font-size: var(--nu-fs-xs); }
  .btl__cell--avg, .btl__th--avg { margin-left: 3px; }
}
</style>

<script setup lang="ts">
// Leão: mapa de calor modelo × tema (dono, 16/10: "gráficos mais imponentes",
// no estilo do mapa verde → amarelo → vermelho). Cada bloco ganha a cor da faixa
// de acerto (95+ verde, 85 verde-claro, 70 amarelo, 50 laranja, abaixo disso
// vermelho, só tokens da casa); o número vai escrito no bloco, em branco nos
// fortes e em tinta nos claros, então a cor nunca carrega o dado sozinha.
// Coluna "Nota" separada por um respiro: é a nota oficial do
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
// faixa de acerto do bloco: 5 = 95+, 4 = 85+, 3 = 70+, 2 = 50+, 1 = abaixo
const nivel = (v: number) => (v >= 95 ? 5 : v >= 85 ? 4 : v >= 70 ? 3 : v >= 50 ? 2 : 1)
const FAIXAS = [{ n: 5, t: '95+' }, { n: 4, t: '85' }, { n: 3, t: '70' }, { n: 2, t: '50' }, { n: 1, t: 'abaixo' }]
</script>

<template>
  <div ref="el" class="btl" :class="revealClass">
    <div class="btl__legend" aria-hidden="true">
      <span>acerto</span>
      <span v-for="f in FAIXAS" :key="f.n" class="btl__chip" :class="`btl__h${f.n}`">{{ f.t }}</span>
    </div>
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
          :class="[`btl__h${nivel(v)}`, { 'btl__cell--dim': hover && hover.r !== r && hover.c !== c, 'btl__cell--on': hover?.r === r && hover?.c === c }]"
          :style="{ '--d': r + c }"
          :aria-label="`${row.name} em ${topics[c]}: ${v}% de acerto`"
          @mouseenter="hover = { r, c }"
        >{{ v }}</span>
        <span
          class="btl__cell btl__cell--avg" :class="[`btl__h${nivel(nota(row))}`, { 'btl__cell--dim': hover && hover.r !== r }]"
          :style="{ '--d': r + topics.length }"
        >{{ nota(row) }}</span>
      </template>
    </div>
    <p v-if="footnote" class="btl__foot">{{ footnote }}</p>
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
.btl__name--on { color: var(--nu-blue-text); }
.btl__cell {
  display: grid; place-items: center; height: 42px; border-radius: var(--nu-r-chip); outline: none; cursor: default;
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
  transition: transform .18s, opacity .2s, box-shadow .2s;
}
/* faixas: verde forte, verde-claro, amarelo, laranja, vermelho (tokens da casa) */
.btl__h5 { background: var(--nu-green); color: var(--nu-white); box-shadow: 0 4px 14px var(--nu-green-tint); }
.btl__h4 { background: color-mix(in srgb, var(--nu-green) 45%, var(--nu-green-soft)); color: var(--nu-ink); }
.btl__h3 { background: var(--nu-amber); color: var(--nu-ink); }
.btl__h2 { background: var(--nu-amber-fill); color: var(--nu-ink); }
.btl__h1 { background: var(--nu-red); color: var(--nu-white); box-shadow: 0 4px 14px var(--nu-red-tint); }
.btl__legend { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 16px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.btl__legend > span:first-child { margin-right: 6px; }
.btl__chip { padding: 3px 10px; border-radius: var(--nu-r-pill); font-size: var(--nu-fs-xs); font-weight: 700; box-shadow: none; }
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

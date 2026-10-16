<script setup lang="ts">
// Antigolpe em "borboleta": uma linha por modelo, eixo no meio. À direita, os
// golpes pegos (pílula azul); à esquerda, as ofertas legítimas acusadas de
// golpe (pílula vermelha). As duas taxas lado a lado impedem que "chamar tudo
// de golpe" pareça competência. Pílulas com cantos de --nu-r-pill, como a barra
// da carteira; trilha creme dos dois lados. Cada linha traz nome e nota.
// Movimento: as pílulas saem do eixo para os dois lados quando entram na tela;
// no hover a linha ganha fundo creme e as outras recuam.
const props = defineProps<{
  rows: { id: string; name: string; rank: number; value: number; caught: number; falseAlarm: number }[]
  footnote?: string
}>()

const { el, revealClass } = useReveal()
</script>

<template>
  <div ref="el" class="bbf" :class="revealClass">
    <div class="bbf__head" aria-hidden="true">
      <span class="bbf__head-l"><i class="bbf__dot bbf__dot--bad" />Legítimas acusadas de golpe</span>
      <span />
      <span class="bbf__head-r"><i class="bbf__dot bbf__dot--good" />Golpes pegos</span>
    </div>
    <ol class="bbf__rows">
      <li
        v-for="(r, i) in props.rows" :key="r.id" class="bbf__row" tabindex="0" :style="{ '--i': i }"
        :aria-label="`${r.rank}º ${r.name}: pegou ${fmtBench.pct(r.caught)} dos golpes e acusou ${fmtBench.pct(r.falseAlarm)} das ofertas legítimas, nota ${fmtBench.one(r.value)}`"
      >
        <span class="bbf__side bbf__side--l">
          <span class="bbf__num">{{ fmtBench.pct(r.falseAlarm) }}</span>
          <span class="bbf__track bbf__track--l"><span class="bbf__bar bbf__bar--bad" :style="{ width: `${r.falseAlarm}%` }" /></span>
        </span>
        <span class="bbf__mid">
          <span class="bbf__name">{{ r.rank }}º {{ r.name }}</span>
          <span class="bbf__score">nota {{ fmtBench.one(r.value) }}</span>
        </span>
        <span class="bbf__side">
          <span class="bbf__track"><span class="bbf__bar bbf__bar--good" :style="{ width: `${r.caught}%` }" /></span>
          <span class="bbf__num">{{ fmtBench.pct(r.caught) }}</span>
        </span>
      </li>
    </ol>
    <p class="bbf__foot">{{ footnote ?? 'A nota é a média das duas taxas de acerto: golpe pego e oferta legítima não acusada.' }}</p>
  </div>
</template>

<style scoped>
.bbf { container-type: inline-size; }
.bbf__head, .bbf__row { display: grid; grid-template-columns: 1fr minmax(120px, 180px) 1fr; align-items: center; gap: 14px; }
.bbf__head { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; padding-bottom: 8px; }
.bbf__head-l { text-align: right; }
.bbf__dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin: 0 8px -1px; }
.bbf__dot--bad { background: var(--nu-red); }
.bbf__dot--good { background: var(--nu-blue); }

.bbf__rows { list-style: none; margin: 0; padding: 0; }
.bbf__row { padding: 9px 12px; margin: 0 -12px; border-radius: var(--nu-r-tile); outline: none; transition: background .2s, opacity .2s; }
.bbf__row:hover, .bbf__row:focus-visible { background: var(--b-surface, var(--nu-cream)); }
.bbf__rows:hover .bbf__row:not(:hover) { opacity: .5; }
.bbf__side { display: flex; align-items: center; gap: 10px; min-width: 0; }
.bbf__track { flex: 1; display: flex; height: 12px; border-radius: var(--nu-r-pill); background: var(--b-surface, var(--nu-cream)); overflow: hidden; }
.bbf__row:hover .bbf__track, .bbf__row:focus-visible .bbf__track { background: var(--b-surface-hi, var(--nu-white)); }
.bbf__track--l { justify-content: flex-end; }
.bbf__bar { display: block; height: 100%; border-radius: var(--nu-r-pill); }
.bbf__bar--bad { background: var(--nu-red); transform-origin: right; }
.bbf__bar--good { background: var(--nu-blue); transform-origin: left; }
.bbf__num { flex: 0 0 46px; color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 800; font-variant-numeric: tabular-nums; }
.bbf__side--l .bbf__num { text-align: right; }
.bbf__mid { display: flex; flex-direction: column; align-items: center; min-width: 0; }
.bbf__name { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.bbf__score { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; }
.bbf__foot { margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

/* ——— entrada: as pílulas saem do eixo para os dois lados ——— */
.is-pending .bbf__bar { transform: scaleX(0); }
.is-in .bbf__bar { transform: scaleX(1); transition: transform .7s cubic-bezier(.2, .8, .2, 1) calc(var(--i) * 45ms); }

@container (max-width: 640px) {
  .bbf__head, .bbf__row { grid-template-columns: 1fr 92px 1fr; gap: 8px; }
  .bbf__head { font-size: var(--nu-fs-xs); }
  .bbf__dot { display: none; }
  .bbf__num { flex-basis: 38px; }
  /* no estreito o nome quebra em duas linhas em vez de cortar: com dados reais,
     "Gemini 3.8 …" e "Gemini 4 …" ficavam iguais */
  .bbf__name { font-size: var(--nu-fs-xs); white-space: normal; overflow: visible; text-overflow: clip; line-height: 1.25; text-align: center; }
}
.bbf__row:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
</style>

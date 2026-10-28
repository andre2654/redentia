<script setup lang="ts">
// Placar geral em barras (dono, 16/10: "gráficos mais imponentes e criativos").
// Cada modelo é uma barra cheia do começo da escala até a nota, com um ponto
// brilhante na ponta e a margem de erro como barra de erro escura por cima: o
// empate técnico aparece sozinho, porque as margens dos primeiros se cruzam. Quem divide o 1º lugar fica no degradê azul da casa,
// o resto em azul-claro. A escala começa no menor lo, arredondado para baixo de 10
// em 10, para a diferença aparecer; o eixo embaixo diz onde começa.
// Movimento: as faixas crescem da esquerda, uma depois da outra, ao entrar na tela.
// Hover (dono, 16/10): a linha em foco acende e as outras esmaecem; o ponto cresce
// e uma etiqueta junto dele diz a margem de erro em número. Só em quem tem mouse,
// para o toque não deixar a lista presa esmaecida.
import type { BenchRankingRow } from '~/types/benchmark'

const props = defineProps<{ rows: BenchRankingRow[] }>()
const { el, revealClass } = useReveal(0.15)

const min = computed(() => Math.max(0, Math.floor(Math.min(...props.rows.map((r) => r.lo)) / 10) * 10))
const pos = (v: number) => ((v - min.value) / (100 - min.value)) * 100
const ticks = computed(() => {
  const out: number[] = []
  for (let t = min.value; t <= 100; t += 10) out.push(t)
  return out
})
const lideres = computed(() => props.rows.filter((r) => r.rank === 1).length)
</script>

<template>
  <div ref="el" class="bra" :class="revealClass">
    <div class="bra__legend" aria-hidden="true">
      <span><i class="bra__sw bra__sw--top" />{{ lideres > 1 ? `${lideres} empatados em 1º` : '1º lugar' }}</span>
      <span><i class="bra__sw bra__sw--fill" />nota</span>
      <span><i class="bra__sw bra__sw--err" />margem de erro</span>
    </div>
    <ol class="bra__list">
      <li
        v-for="(r, i) in rows" :key="r.id" class="bra__row" :class="{ 'bra__row--top': r.rank === 1 }" :style="{ '--i': i }"
        :aria-label="`${r.rank}º ${r.name}: nota ${fmtBench.one(r.value)}, margem de ${fmtBench.one(r.lo)} a ${fmtBench.one(r.hi)}`"
      >
        <span class="bra__pos" aria-hidden="true">{{ r.rank }}º</span>
        <span class="bra__who" aria-hidden="true">
          <span class="bra__tile"><img v-if="benchLogo(r.id)" :src="benchLogo(r.id)!" alt="" width="18" height="18" loading="lazy" decoding="async"></span>
          <span class="bra__name">{{ r.name }}</span>
        </span>
        <span class="bra__track" aria-hidden="true">
          <span class="bra__fill" :style="{ width: `${pos(r.value)}%` }" />
          <span class="bra__err" :style="{ left: `${pos(r.lo)}%`, width: `${Math.max(0.6, pos(r.hi) - pos(r.lo))}%` }" />
          <span class="bra__dot" :style="{ left: `${pos(r.value)}%` }" />
          <span class="bra__tip" :class="{ 'bra__tip--end': pos(r.value) > 55 }" :style="{ left: `${pos(r.value)}%` }">margem de <b>{{ fmtBench.one(r.lo) }}</b> a <b>{{ fmtBench.one(r.hi) }}</b></span>
        </span>
        <span class="bra__val" aria-hidden="true">{{ fmtBench.one(r.value) }}</span>
      </li>
    </ol>
    <div class="bra__axis" aria-hidden="true">
      <span class="bra__axis-in">
        <span v-for="t in ticks" :key="t" class="bra__tick" :style="{ left: `${pos(t)}%` }">{{ t }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.bra { container-type: inline-size; --cols: 34px minmax(140px, 220px) minmax(0, 1fr) 56px; }
.bra__legend { display: flex; flex-wrap: wrap; gap: 6px 20px; margin-bottom: 18px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.bra__legend span { display: inline-flex; align-items: center; gap: 8px; }
.bra__sw { display: inline-block; width: 22px; height: 8px; border-radius: 99px; }
.bra__sw--top { background: linear-gradient(90deg, var(--nu-blue-soft), var(--nu-blue)); box-shadow: 0 0 10px var(--nu-blue-28); }
.bra__sw--fill { background: linear-gradient(90deg, var(--nu-blue-tint-2), var(--nu-blue-legend)); }
.bra__sw--err { height: 4px; background: var(--nu-navy); }

.bra__list { list-style: none; margin: 0; padding: 0; }
.bra__row { display: grid; grid-template-columns: var(--cols); align-items: center; gap: 14px; padding: 11px 0; }
.bra__row + .bra__row { border-top: 1px solid var(--nu-navy-06); }
.bra__pos { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.bra__who { display: flex; align-items: center; gap: 10px; min-width: 0; }
.bra__tile {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%; display: grid; place-items: center;
  background: var(--b-surface-hi, var(--nu-white)); box-shadow: inset 0 0 0 1px var(--nu-cream-2);
}
.bra__tile img { width: 18px; height: 18px; display: block; object-fit: contain; }
.bra__name { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.bra__track { position: relative; height: 16px; border-radius: 99px; background: var(--nu-navy-06); }
.bra__fill {
  position: absolute; left: 0; top: 0; bottom: 0; border-radius: 99px;
  background: linear-gradient(90deg, var(--nu-blue-tint-2), var(--nu-blue-legend));
  transform-origin: left center;
}
.bra__row--top .bra__fill { background: linear-gradient(90deg, var(--nu-blue-soft-35), var(--nu-blue-soft) 45%, var(--nu-blue)); box-shadow: 0 6px 22px var(--nu-blue-28); }
/* margem de erro: barra fina e escura com pontas, por cima da barra */
.bra__err {
  position: absolute; top: 50%; height: 4px; transform: translateY(-50%); border-radius: 2px; background: var(--nu-navy-55);
}
.bra__err::before, .bra__err::after { content: ''; position: absolute; top: -5px; width: 2px; height: 14px; border-radius: 1px; background: var(--nu-navy-55); }
.bra__err::before { left: 0; }
.bra__err::after { right: 0; }
.bra__dot {
  position: absolute; top: 50%; width: 18px; height: 18px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-white); box-shadow: inset 0 0 0 4px var(--nu-blue-legend), 0 2px 6px var(--nu-navy-14);
}
.bra__row--top .bra__dot { box-shadow: inset 0 0 0 4px var(--nu-blue), 0 0 0 6px var(--nu-blue-16), 0 2px 10px var(--nu-blue-28); }
.bra__val { text-align: right; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; font-variant-numeric: tabular-nums; }
.bra__row--top .bra__val { color: var(--nu-blue-text); }

.bra__axis { display: grid; grid-template-columns: var(--cols); gap: 14px; margin-top: 6px; }
.bra__axis-in { grid-column: 3; position: relative; height: 18px; }
.bra__tick { position: absolute; transform: translateX(-50%); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; }

/* entrada: as barras crescem da esquerda em sequência; ponto e margem aparecem depois */
.is-pending .bra__fill { transform: scaleX(0); }
.is-pending .bra__dot, .is-pending .bra__err { opacity: 0; }
.is-in .bra__fill { transform: scaleX(1); transition: transform .9s cubic-bezier(.2, .8, .2, 1) calc(var(--i) * 70ms), box-shadow .2s ease, filter .2s ease; }
.is-in .bra__dot, .is-in .bra__err { opacity: 1; transition: opacity .4s ease calc(var(--i) * 70ms + .6s), transform .2s ease; }

/* hover: a linha em foco acende, as outras esmaecem, a margem aparece em número */
.bra__tip { display: none; }
@media (hover: hover) {
  .bra__row { position: relative; isolation: isolate; transition: opacity .2s ease; }
  .bra__row::before {
    content: ''; position: absolute; inset: 0 -12px; z-index: -1; border-radius: 14px;
    background: var(--nu-blue-tint); opacity: 0; transition: opacity .2s ease;
  }
  .bra__list:hover .bra__row:not(:hover) { opacity: .4; }
  .bra__row:hover::before { opacity: 1; }
  .bra__tile, .bra__val { transition: transform .2s ease; }
  .bra__row:hover .bra__tile { transform: scale(1.12); }
  .bra__row:hover .bra__val { transform: scale(1.12); transform-origin: right center; color: var(--nu-blue-text); }
  .bra__row:hover .bra__fill { box-shadow: 0 6px 22px var(--nu-blue-28); filter: saturate(1.35); }
  .bra__row:hover .bra__dot { transform: translate(-50%, -50%) scale(1.3); }
  .bra__tip {
    display: block; position: absolute; bottom: calc(100% + 12px); z-index: 2; white-space: nowrap; pointer-events: none;
    padding: 6px 10px; border-radius: var(--nu-r-pill); background: var(--nu-navy); color: var(--nu-white);
    font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums;
    box-shadow: 0 8px 20px var(--nu-navy-14);
    opacity: 0; transform: translate(-14px, 4px); transition: opacity .18s ease, transform .18s ease;
  }
  .bra__tip b { font-weight: 800; }
  .bra__tip--end { transform: translate(calc(-100% + 14px), 4px); }
  .bra__row:hover .bra__tip { opacity: 1; transform: translate(-14px, 0); }
  .bra__row:hover .bra__tip--end { transform: translate(calc(-100% + 14px), 0); }
}

@container (max-width: 560px) {
  .bra { --cols: 26px minmax(0, 118px) minmax(0, 1fr) 44px; }
  .bra__row { gap: 10px; }
  .bra__name { font-size: var(--nu-fs-sm); }
  .bra__tile { width: 26px; height: 26px; }
  .bra__val { font-size: var(--nu-fs-md); }
}
</style>

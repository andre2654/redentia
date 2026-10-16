<script setup lang="ts">
// Pregão a pregão: ponto + intervalo de 95% por modelo em torno do zero. A
// régua é a trilha creme das pílulas da carteira; o intervalo é uma pílula
// azul-clara e o ponto, azul cheio (cinza quando o intervalo cruza o zero, ou
// seja, sem evidência de habilidade). Valor escrito no fim da linha.
// Movimento: ao entrar na tela os pontos deslizam do zero até o valor; no
// hover a linha ganha fundo creme, o ponto cresce e as outras recuam.
const props = defineProps<{
  rows: { id: string; name: string; rank: number; value: number; lo: number; hi: number }[]
  format: (v: number) => string
  zeroLabel?: string
  footnote?: string
}>()

const { el, revealClass } = useReveal()
const domain = computed(() => {
  const lo = Math.min(0, ...props.rows.map((r) => r.lo))
  const hi = Math.max(0, ...props.rows.map((r) => r.hi))
  const pad = (hi - lo) * 0.08 || 0.01
  return { lo: lo - pad, hi: hi + pad }
})
const pos = (v: number) => ((v - domain.value.lo) / (domain.value.hi - domain.value.lo)) * 100
const clears = (r: { lo: number; hi: number }) => r.lo > 0 || r.hi < 0
</script>

<template>
  <div ref="el" class="bdt" :class="revealClass" :style="{ '--z': `${pos(0)}%` }">
    <ol class="bdt__rows">
      <li
        v-for="(r, i) in rows" :key="r.id" class="bdt__row" tabindex="0" :style="{ '--i': i }"
        :aria-label="`${r.rank}º ${r.name}: ${format(r.value)}, intervalo de ${format(r.lo)} a ${format(r.hi)}`"
      >
        <span class="bdt__name"><b>{{ r.rank }}º</b> {{ r.name }}</span>
        <span class="bdt__track">
          <span class="bdt__zero" />
          <span class="bdt__ci" :class="{ 'bdt__ci--weak': !clears(r) }" :style="{ left: `${pos(r.lo)}%`, width: `${pos(r.hi) - pos(r.lo)}%` }" />
          <span class="bdt__dot" :class="{ 'bdt__dot--weak': !clears(r) }" :style="{ '--x': `${pos(r.value)}%` }" />
        </span>
        <span class="bdt__val">{{ format(r.value) }}</span>
      </li>
    </ol>
    <div class="bdt__axis" aria-hidden="true"><span /><span class="bdt__axis-track"><span class="bdt__axis-zero">{{ zeroLabel ?? '0 = acaso' }}</span></span><span /></div>
    <p v-if="footnote" class="bdt__foot">{{ footnote }}</p>
  </div>
</template>

<style scoped>
.bdt { container-type: inline-size; }
.bdt__rows { list-style: none; margin: 0; padding: 0; }
.bdt__row, .bdt__axis { display: grid; grid-template-columns: minmax(110px, 190px) 1fr 70px; align-items: center; gap: 16px; }
.bdt__row { padding: 9px 12px; margin: 0 -12px; border-radius: var(--nu-r-tile); outline: none; transition: background .2s, opacity .2s; }
.bdt__row:hover, .bdt__row:focus-visible { background: var(--b-surface, var(--nu-cream)); }
.bdt__rows:hover .bdt__row:not(:hover) { opacity: .5; }
.bdt__name { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bdt__name b { color: var(--nu-gray); font-weight: 700; margin-right: 4px; }
.bdt__track { position: relative; height: 12px; border-radius: var(--nu-r-pill); background: var(--b-surface, var(--nu-cream)); }
.bdt__row:hover .bdt__track, .bdt__row:focus-visible .bdt__track { background: var(--b-surface-hi, var(--nu-white)); }
.bdt__zero { position: absolute; left: var(--z); top: -6px; bottom: -6px; width: 1px; background: var(--nu-ink-30); }
.bdt__ci { position: absolute; top: 0; bottom: 0; border-radius: var(--nu-r-pill); background: var(--nu-blue-soft); transition: opacity .3s; }
.bdt__ci--weak { background: var(--nu-bar-inactive); }
.bdt__dot {
  position: absolute; top: 50%; left: var(--x); width: 14px; height: 14px; border-radius: 50%;
  background: var(--nu-blue); box-shadow: 0 0 0 3px var(--b-surface-hi, var(--nu-white)); transform: translate(-50%, -50%);
  transition: width .2s, height .2s;
}
.bdt__dot--weak { background: var(--nu-sand); }
.bdt__row:hover .bdt__dot, .bdt__row:focus-visible .bdt__dot { width: 18px; height: 18px; }
.bdt__val { text-align: right; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums; }
.bdt__axis { padding: 6px 0 0; }
.bdt__axis-track { position: relative; height: 16px; }
.bdt__axis-zero { position: absolute; left: var(--z); transform: translateX(-50%); white-space: nowrap; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; }
.bdt__foot { margin: 12px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

/* ——— entrada: os pontos deslizam do zero até o valor ——— */
.is-pending .bdt__dot { left: var(--z); }
.is-pending .bdt__ci { opacity: 0; }
.is-in .bdt__dot { transition: left .8s cubic-bezier(.2, .8, .2, 1) calc(var(--i) * 45ms), width .2s, height .2s; }
.is-in .bdt__ci { transition: opacity .5s ease calc(.4s + var(--i) * 45ms); }

@container (max-width: 640px) {
  .bdt__row, .bdt__axis { grid-template-columns: 1fr 56px; gap: 6px 10px; }
  .bdt__row { grid-template-areas: 'name val' 'track track'; }
  .bdt__name { grid-area: name; }
  .bdt__val { grid-area: val; }
  .bdt__track { grid-area: track; }
  .bdt__axis { grid-template-columns: 1fr; }
  .bdt__axis > span:first-child, .bdt__axis > span:last-child { display: none; }
}
.bdt__row:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
</style>

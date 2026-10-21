<script setup lang="ts">
// A curva das calculadoras na frase (21/10/2026): a série da conta ano a ano,
// com a área embaixo, a bolinha no último ponto com o valor e, quando há, a
// linha tracejada da meta ("você precisa de R$ 2,71 mi") ou a série tracejada
// do que a pessoa aportou. A linha se desenha na chegada; mexendo na conta,
// ela muda na hora. As contas do desenho estão em utils/calculadora-frase.ts.
const props = defineProps<{
  valores: number[]
  /** linha horizontal tracejada (a meta) */
  meta?: number | null
  rotuloMeta?: string
  /** série tracejada embaixo da principal (o que foi aportado) */
  secundaria?: number[]
  /** o valor ao lado da bolinha do fim */
  rotuloFim?: string
  /** os rótulos do eixo: início e fim */
  rotulos?: [string, string]
  /** a legenda da série tracejada, embaixo do gráfico ("o que você guardou") */
  legendaSecundaria?: string
}>()

const W = 520
const H = 170
const M = 8
const curva = computed(() => curvaDaConta(props.valores, { W, H, M, meta: props.meta ?? null }))
const yMeta = computed(() => (curva.value && props.meta != null ? curva.value.y(props.meta) : null))
const linhaSecundaria = computed(() => {
  const c = curva.value
  const s = props.secundaria
  if (!c || !s || s.length < 2) return ''
  return s.map((v, i) => `${i ? 'L' : 'M'}${(M + ((W - 2 * M) * i) / (s.length - 1)).toFixed(1)} ${c.y(v).toFixed(1)}`).join(' ')
})
const id = useId()
</script>

<template>
  <svg v-if="curva" class="ccv" viewBox="0 -22 520 216" aria-hidden="true">
    <defs>
      <linearGradient :id="`${id}-area`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" class="ccv__stop-alto" />
        <stop offset="1" class="ccv__stop-baixo" />
      </linearGradient>
    </defs>
    <template v-if="yMeta != null">
      <line class="ccv__meta" x1="8" :y1.attr="yMeta" x2="512" :y2.attr="yMeta" />
      <text v-if="rotuloMeta" class="ccv__rotulo" x="10" :y.attr="Math.max(-6, yMeta - 8)">{{ rotuloMeta }}</text>
    </template>
    <path class="ccv__area" :d="curva.area" :fill="`url(#${id}-area)`" />
    <path v-if="linhaSecundaria" class="ccv__secundaria" :d="linhaSecundaria" />
    <path class="ccv__linha" :d="curva.linha" pathLength="100" />
    <circle class="ccv__halo" :cx.attr="curva.fim[0]" :cy.attr="curva.fim[1]" r="11" />
    <circle class="ccv__ponto" :cx.attr="curva.fim[0]" :cy.attr="curva.fim[1]" r="5.5" />
    <text v-if="rotuloFim" class="ccv__fim" :x.attr="curva.fim[0] - 12" :y.attr="Math.max(-8, curva.fim[1] - 14)" text-anchor="end">{{ rotuloFim }}</text>
    <template v-if="rotulos">
      <text class="ccv__eixo" x="8" y="190">{{ rotulos[0] }}</text>
      <text class="ccv__eixo" x="512" y="190" text-anchor="end">{{ rotulos[1] }}</text>
    </template>
  </svg>
  <p v-if="curva && legendaSecundaria && linhaSecundaria" class="ccv__legenda">
    <span class="ccv__traco" aria-hidden="true" /> {{ legendaSecundaria }}
  </p>
</template>

<style scoped>
.ccv { display: block; width: 100%; height: auto; overflow: visible; }
.ccv__stop-alto { stop-color: var(--nu-blue); stop-opacity: 0.22; }
.ccv__stop-baixo { stop-color: var(--nu-blue); stop-opacity: 0; }
.ccv__meta { stroke: var(--nu-ink); stroke-opacity: 0.45; stroke-width: 1.5; stroke-dasharray: 5 6; }
.ccv__secundaria { fill: none; stroke: var(--nu-ink); stroke-opacity: 0.55; stroke-width: 2; stroke-dasharray: 6 6; }
.ccv__linha {
  fill: none; stroke: var(--nu-blue); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 100; stroke-dashoffset: 0; animation: ccv-desenha 1.1s cubic-bezier(.5, 0, .2, 1) both;
}
.ccv__area { animation: ccv-surge 1.1s ease both; }
.ccv__halo { fill: var(--nu-blue); fill-opacity: 0.15; }
.ccv__ponto { fill: var(--nu-blue); }
.ccv__rotulo, .ccv__eixo { fill: var(--nu-gray); font-size: 13px; font-weight: 700; }
.ccv__fim { fill: var(--nu-ink); font-size: 14px; font-weight: 800; }
.ccv__legenda {
  display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin: 6px 0 0;
  color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500;
}
.ccv__traco { width: 22px; height: 0; border-top: 2px dashed color-mix(in srgb, var(--nu-ink) 55%, transparent); }
@keyframes ccv-desenha { from { stroke-dashoffset: 100; } }
@keyframes ccv-surge { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .ccv__linha, .ccv__area { animation: none; }
}
</style>

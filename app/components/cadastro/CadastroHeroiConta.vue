<script setup lang="ts">
// Herói da folha das outras calculadoras (21/10/2026, gesto 'conta'): o número
// da conta da pessoa no alto ("R$ 2.457/mês"), o rótulo do que ele é ("Meta de
// R$ 500 mil em 10 anos"), o selo e, quando a calculadora tem uma série, a
// curva dela com a linha tracejada da meta. É o mesmo desenho do herói da
// aposentadoria (CadastroHeroiAposentadoria), com os textos vindos da conta.
// Depois do cadastro, "Conta guardada" fixo.
const props = withDefaults(defineProps<{
  conta: {
    rotulo: string
    valor: string
    selo?: string
    seloFalta?: boolean
    serie?: readonly number[]
    meta?: number | null
    rotuloMeta?: string
    rotulos?: readonly [string, string]
  }
  guardada?: boolean
}>(), { guardada: false })

const curva = computed(() => (props.conta.serie ? curvaDaConta(props.conta.serie, { W: 520, H: 170, M: 8, meta: props.conta.meta ?? null }) : null))
const yMeta = computed(() => (curva.value && props.conta.meta != null ? curva.value.y(props.conta.meta) : null))
const id = useId()
</script>

<template>
  <div class="chc" :class="{ 'chc--guardada': guardada, 'chc--sem-curva': !curva }" aria-hidden="true">
    <div class="chc__topo">
      <div>
        <div class="chc__sub">{{ conta.rotulo }}</div>
        <div class="chc__valor">{{ conta.valor }}</div>
        <span v-if="conta.selo" class="chc__meta-selo" :class="{ 'chc__meta-selo--falta': conta.seloFalta }">{{ conta.selo }}</span>
      </div>
      <span v-if="guardada" class="chc__selo"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>Conta guardada</span>
    </div>
    <svg v-if="curva" class="chc__grafico" viewBox="0 -14 520 208">
      <defs>
        <linearGradient :id="`${id}-area`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="chc__stop-alto" />
          <stop offset="1" class="chc__stop-baixo" />
        </linearGradient>
      </defs>
      <template v-if="yMeta != null">
        <line class="chc__meta" x1="8" :y1.attr="yMeta" x2="512" :y2.attr="yMeta" />
        <text v-if="conta.rotuloMeta" class="chc__rotulo" x="10" :y.attr="Math.max(-4, yMeta - 8)">{{ conta.rotuloMeta }}</text>
      </template>
      <path class="chc__area" :d="curva.area" :fill="`url(#${id}-area)`" />
      <path class="chc__linha" :d="curva.linha" pathLength="100" />
      <circle class="chc__onda" :cx.attr="curva.fim[0]" :cy.attr="curva.fim[1]" r="6" />
      <circle class="chc__ponto" :cx.attr="curva.fim[0]" :cy.attr="curva.fim[1]" r="6" />
      <template v-if="conta.rotulos">
        <text class="chc__rotulo" x="8" y="190">{{ conta.rotulos[0] }}</text>
        <text class="chc__rotulo" x="512" y="190" text-anchor="end">{{ conta.rotulos[1] }}</text>
      </template>
    </svg>
  </div>
</template>

<style scoped>
.chc { display: flex; flex-direction: column; padding: 22px 28px 12px; color: var(--nu-cream-text); }
.chc--sem-curva { padding-bottom: 26px; }
.chc__topo { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding-right: 44px; }
.chc__sub { color: var(--nu-cream-text-60); font-size: var(--nu-fs-sm); font-weight: 700; }
.chc__valor { margin-top: 2px; font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; font-variant-numeric: tabular-nums; }
.chc__meta-selo {
  display: inline-flex; margin-top: 10px; padding: 6px 12px; border-radius: var(--nu-r-pill);
  background: rgba(143, 240, 181, 0.16); color: var(--nu-green-soft); font-size: var(--nu-fs-dense); font-weight: 700;
}
.chc__meta-selo--falta { background: rgba(255, 181, 71, 0.16); color: var(--nu-serie-2); }
.chc__selo {
  flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: var(--nu-r-pill);
  background: rgba(143, 240, 181, 0.16); color: var(--nu-green-soft); font-size: var(--nu-fs-dense); font-weight: 700;
}
.chc__grafico { display: block; width: 100%; height: auto; margin-top: 6px; overflow: visible; }
.chc__stop-alto { stop-color: var(--nu-blue-soft); stop-opacity: 0.28; }
.chc__stop-baixo { stop-color: var(--nu-blue-soft); stop-opacity: 0; }
.chc__meta { stroke: var(--nu-cream-text); stroke-opacity: 0.4; stroke-width: 1.5; stroke-dasharray: 5 6; }
.chc__rotulo { fill: var(--nu-cream-text); fill-opacity: 0.6; font-size: 14px; font-weight: 700; }
.chc__linha {
  fill: none; stroke: var(--nu-blue-soft); stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round;
  filter: drop-shadow(0 0 6px rgba(158, 200, 255, 0.6));
  stroke-dasharray: 100; stroke-dashoffset: 0; animation: chc-desenha 1.4s cubic-bezier(.5, 0, .2, 1) both;
}
.chc__area { animation: chc-surge 1.4s ease both; }
.chc__ponto { fill: var(--nu-blue-soft); }
.chc__onda {
  fill: none; stroke: var(--nu-blue-soft); stroke-width: 2;
  transform-box: fill-box; transform-origin: center; animation: chc-onda 1.8s ease-out infinite;
}
.chc--guardada .chc__onda { animation: none; opacity: 0; }
@keyframes chc-desenha { from { stroke-dashoffset: 100; } }
@keyframes chc-surge { from { opacity: 0; } }
@keyframes chc-onda { from { transform: scale(1); opacity: .7; } to { transform: scale(3); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .chc__linha, .chc__area, .chc__onda { animation: none; }
}
</style>

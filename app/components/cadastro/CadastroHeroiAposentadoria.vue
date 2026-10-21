<script setup lang="ts">
// Herói da folha da calculadora de aposentadoria (21/10/2026, quadro "Depois
// de mexer na conta"): a curva da própria conta da pessoa até a idade de se
// aposentar, a linha tracejada do que ela precisa ter e o total no alto. O selo
// diz se a conta passa da meta ou quanto falta. Depois do cadastro, "Conta
// guardada" fixo e a linha parada no fim.
const props = withDefaults(defineProps<{
  /** a conta como a folha recebe (o contexto dela chega só para leitura) */
  conta: { idade: number; aposentaAos: number; total: number; necessario: number; serie: readonly number[] }
  guardada?: boolean
}>(), { guardada: false })

const curva = computed(() => curvaDaConta(props.conta.serie, { W: 520, H: 170, M: 8, meta: props.conta.necessario }))
const yMeta = computed(() => curva.value?.y(props.conta.necessario) ?? null)
const sobra = computed(() => props.conta.total - props.conta.necessario)
const selo = computed(() => (sobra.value >= 0 ? `✓ ${brlInteiro(sobra.value)} acima da meta` : `Faltam ${brlInteiro(-sobra.value)} para a meta`))
const id = useId()
</script>

<template>
  <div class="cha2" :class="{ 'cha2--guardada': guardada }" aria-hidden="true">
    <div class="cha2__topo">
      <div>
        <div class="cha2__sub">Aposentadoria aos {{ conta.aposentaAos }}</div>
        <div class="cha2__valor">{{ brlInteiro(conta.total) }}</div>
        <span class="cha2__meta-selo" :class="{ 'cha2__meta-selo--falta': sobra < 0 }">{{ selo }}</span>
      </div>
      <span v-if="guardada" class="cha2__selo"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>Conta guardada</span>
    </div>
    <svg v-if="curva" class="cha2__grafico" viewBox="0 -14 520 208">
      <defs>
        <linearGradient :id="`${id}-area`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="cha2__stop-alto" />
          <stop offset="1" class="cha2__stop-baixo" />
        </linearGradient>
      </defs>
      <template v-if="yMeta != null">
        <line class="cha2__meta" x1="8" :y1.attr="yMeta" x2="512" :y2.attr="yMeta" />
        <text class="cha2__rotulo" x="10" :y.attr="Math.max(-4, yMeta - 8)">você precisa de {{ brlCurto(conta.necessario) }}</text>
      </template>
      <path class="cha2__area" :d="curva.area" :fill="`url(#${id}-area)`" />
      <path class="cha2__linha" :d="curva.linha" pathLength="100" />
      <circle class="cha2__onda" :cx.attr="curva.fim[0]" :cy.attr="curva.fim[1]" r="6" />
      <circle class="cha2__ponto" :cx.attr="curva.fim[0]" :cy.attr="curva.fim[1]" r="6" />
      <text class="cha2__rotulo" x="8" y="190">{{ conta.idade }} anos</text>
      <text class="cha2__rotulo" x="512" y="190" text-anchor="end">{{ conta.aposentaAos }} anos</text>
    </svg>
  </div>
</template>

<style scoped>
.cha2 { display: flex; flex-direction: column; padding: 22px 28px 12px; color: var(--nu-cream-text); }
.cha2__topo { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding-right: 44px; }
.cha2__sub { color: var(--nu-cream-text-60); font-size: var(--nu-fs-sm); font-weight: 700; }
.cha2__valor { margin-top: 2px; font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; font-variant-numeric: tabular-nums; }
.cha2__meta-selo {
  display: inline-flex; margin-top: 10px; padding: 6px 12px; border-radius: var(--nu-r-pill);
  background: rgba(143, 240, 181, 0.16); color: var(--nu-green-soft); font-size: var(--nu-fs-dense); font-weight: 700;
}
.cha2__meta-selo--falta { background: rgba(255, 181, 71, 0.16); color: var(--nu-serie-2); }
.cha2__selo {
  flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: var(--nu-r-pill);
  background: rgba(143, 240, 181, 0.16); color: var(--nu-green-soft); font-size: var(--nu-fs-dense); font-weight: 700;
}
.cha2__grafico { display: block; width: 100%; height: auto; margin-top: 6px; overflow: visible; }
.cha2__stop-alto { stop-color: var(--nu-blue-soft); stop-opacity: 0.28; }
.cha2__stop-baixo { stop-color: var(--nu-blue-soft); stop-opacity: 0; }
.cha2__meta { stroke: var(--nu-cream-text); stroke-opacity: 0.4; stroke-width: 1.5; stroke-dasharray: 5 6; }
.cha2__rotulo { fill: var(--nu-cream-text); fill-opacity: 0.6; font-size: 14px; font-weight: 700; }
.cha2__linha {
  fill: none; stroke: var(--nu-blue-soft); stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round;
  filter: drop-shadow(0 0 6px rgba(158, 200, 255, 0.6));
  stroke-dasharray: 100; stroke-dashoffset: 0; animation: cha2-desenha 1.4s cubic-bezier(.5, 0, .2, 1) both;
}
.cha2__area { animation: cha2-surge 1.4s ease both; }
.cha2__ponto { fill: var(--nu-blue-soft); }
.cha2__onda {
  fill: none; stroke: var(--nu-blue-soft); stroke-width: 2;
  transform-box: fill-box; transform-origin: center; animation: cha2-onda 1.8s ease-out infinite;
}
.cha2--guardada .cha2__onda { animation: none; opacity: 0; }
@keyframes cha2-desenha { from { stroke-dashoffset: 100; } }
@keyframes cha2-surge { from { opacity: 0; } }
@keyframes cha2-onda { from { transform: scale(1); opacity: .7; } to { transform: scale(3); opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .cha2__linha, .cha2__area, .cha2__onda { animation: none; }
}
</style>

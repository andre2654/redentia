<script setup lang="ts">
// O cartão carvão com a FAIXA DA MARCA: uma aba cobalto no canto de cima, com
// o rótulo em caixa alta, que termina no mesmo corte curvo do "t" do logo. É a
// peça de destaque da Aportou ("PERGUNTE À IA", "SEUS DADOS", o topo do chat,
// o cartão do gráfico). O conteúdo vai no slot; `acoes` senta à direita da aba.
//   altura: da aba, em px (60 nos cartões grandes, 52 no chat, 48 nos pequenos).
//   plano: sem raio nem sombra próprios (quando ele é o topo de um painel, como no chat).
// A geometria vem do quadro Home: as duas curvas são o corte do "t" escalado
// pela altura da aba (23 unidades do desenho = a altura).
const props = withDefaults(defineProps<{ rotulo: string; altura?: number; como?: string; raio?: number; plano?: boolean }>(), { altura: 60, como: 'h2', raio: 28 })
const e = computed(() => props.altura / 23)
// A curva é desenhada em PIXELS, não em unidades do desenho: o topo dela (y = 0)
// cai num pixel inteiro, o mesmo do topo da aba. Antes o SVG era escalado e o
// topo caía em fração de pixel (−20,35px na altura 52): sobrava um degrau de
// 1px entre a aba e a curva, que o dono viu em 11/11/2026.
const curva = computed(() => {
  const k = e.value
  const n = (v: number) => Math.round(v * k * 100) / 100
  const sobe = Math.ceil(9 * k) // quanto a ponta da curva passa acima da aba
  const larg = Math.ceil(30 * k)
  return {
    sobe, larg,
    alt: sobe + props.altura,
    d: `M0 0 C${n(12)} 0 ${n(22)} ${n(-2)} ${n(28)} ${n(-8)} C${n(30)} ${n(8)} ${n(22)} ${props.altura} ${n(4)} ${props.altura} H0 Z`,
  }
})
</script>

<template>
  <div class="nfm" :class="{ 'nfm--plano': plano }" :style="{ borderRadius: plano ? undefined : `${raio}px` }">
    <div class="nfm__topo">
      <div class="nfm__aba" :style="{ height: `${altura}px`, borderRadius: `${raio}px 0 0 0` }">
        <component :is="como" class="nfm__rotulo">{{ rotulo }}</component>
        <svg class="nfm__curva" :viewBox.attr="`0 ${-curva.sobe} ${curva.larg} ${curva.alt}`" aria-hidden="true" :style="{ top: `${-curva.sobe}px`, width: `${curva.larg}px`, height: `${curva.alt}px` }"><path :d="curva.d" /></svg>
        <svg class="nfm__pe" viewBox="0 0 25 21" aria-hidden="true" :style="{ width: `${25 * e}px`, height: `${21 * e}px` }"><path d="M0 0 H25 C11 0 2 8 0 21 Z" /></svg>
      </div>
      <div v-if="$slots.acoes" class="nfm__acoes"><slot name="acoes" /></div>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.nfm { background: var(--nu-ink); color: var(--nu-white); box-shadow: var(--nu-shadow-escuro); }
.nfm--plano { box-shadow: none; border-radius: 0; }
.nfm__topo { display: flex; justify-content: space-between; align-items: flex-start; }
.nfm__aba { position: relative; flex: none; padding: 0 26px 0 28px; display: flex; align-items: center; background: var(--nu-blue); }
.nfm__rotulo { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--nu-white); white-space: nowrap; }
.nfm__curva, .nfm__pe { position: absolute; display: block; fill: var(--nu-blue); pointer-events: none; }
.nfm__curva { left: calc(100% - 1px); }
.nfm__pe { left: 0; top: calc(100% - 1px); }
.nfm__acoes { display: flex; gap: 2px; padding: 4px 8px 0 0; }
@media (max-width: 420px) { .nfm__aba { padding: 0 18px 0 20px; } .nfm__rotulo { font-size: 13px; letter-spacing: 0.12em; } }
</style>

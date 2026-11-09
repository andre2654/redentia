<script setup lang="ts">
// Custo × nota (03/11/2026, /benchmark-ia "A noite"): cada modelo é
// um ponto, o custo por mil respostas na horizontal (escala logarítmica, vai
// de menos de um dólar a mais de dez) e a nota geral na vertical. A linha liga
// a fronteira: os modelos que nenhum outro bate com nota maior pagando menos
// (é o que o "i" do custo já descrevia e a página de hoje não desenhava). Só
// os da fronteira e o modelo em foco levam o nome escrito; os outros, no hover.
// Altura fixa (sem salto de layout) e pontos em HTML, para a logo sair nítida.
import { fronteiraDeCusto } from '~/utils/benchPagina'

const props = withDefaults(defineProps<{
  points: { id: string; name: string; cost: number; nota: number; rank: number }[]
  foco?: string | null
  tom?: 'claro' | 'escuro'
}>(), { foco: null, tom: 'claro' })
const emit = defineEmits<{ (e: 'hover', id: string | null): void; (e: 'pick', id: string): void }>()

const TICKS_X = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50]
const dom = computed(() => {
  const cs = props.points.map((p) => p.cost).filter((c) => c > 0)
  const ns = props.points.map((p) => p.nota)
  const lo = Math.log10(Math.min(...cs, 1) * 0.8)
  const hi = Math.log10(Math.max(...cs, 1) * 1.25)
  const yLo = Math.max(0, Math.floor((Math.min(...ns, 100) - 4) / 10) * 10)
  return { lo, hi, yLo, yHi: 100 }
})
const x = (c: number) => ((Math.log10(Math.max(c, 0.0001)) - dom.value.lo) / (dom.value.hi - dom.value.lo)) * 100
const y = (n: number) => 100 - ((n - dom.value.yLo) / (dom.value.yHi - dom.value.yLo)) * 100
const ticksX = computed(() => TICKS_X.filter((t) => { const p = x(t); return p >= 2 && p <= 98 }))
const ticksY = computed(() => {
  const out: number[] = []
  for (let t = dom.value.yLo; t <= 100; t += 10) out.push(t)
  return out
})
const fronteira = computed(() => fronteiraDeCusto(props.points.map((p) => ({ id: p.id, cost: p.cost, nota: p.nota }))))
const linha = computed(() => fronteira.value
  .map((id) => props.points.find((p) => p.id === id)!)
  .map((p, i) => `${i ? 'L' : 'M'}${(x(p.cost) * 10).toFixed(1)},${(y(p.nota) * 3).toFixed(1)}`).join(''))
const usd = (v: number) => fmtBench.usd(v)
// o nome vai à esquerda do ponto quando ele está na metade da direita
const lado = (p: { cost: number }) => (x(p.cost) > 62 ? 'esq' : 'dir')
</script>

<template>
  <figure class="bdd" :class="`bdd--${tom}`">
    <div class="bdd__area" @mouseleave="emit('hover', null)">
      <span v-for="t in ticksY" :key="`y${t}`" class="bdd__gy" :style="{ top: `${y(t)}%` }" aria-hidden="true"><span>{{ t }}</span></span>
      <span v-for="t in ticksX" :key="`x${t}`" class="bdd__gx" :style="{ left: `${x(t)}%` }" aria-hidden="true"><span>{{ t < 1 ? `US$ ${String(t).replace('.', ',')}` : `US$ ${t}` }}</span></span>
      <svg class="bdd__svg" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
        <path :d="linha" class="bdd__fronteira" />
      </svg>
      <button
        v-for="p in points" :key="p.id" type="button" class="bdd__p"
        :class="{ 'bdd__p--on': p.id === foco, 'bdd__p--fr': fronteira.includes(p.id), 'bdd__p--recua': foco && p.id !== foco }"
        :style="{ left: `${x(p.cost)}%`, top: `${y(p.nota)}%` }"
        :aria-pressed="p.id === foco"
        :aria-label="`${p.name}: ${usd(p.cost)} por mil respostas, nota geral ${fmtBench.one(p.nota)}${fronteira.includes(p.id) ? ', na fronteira' : ''}`"
        @mouseenter="emit('hover', p.id)" @focus="emit('hover', p.id)" @blur="emit('hover', null)" @click="emit('pick', p.id)"
      >
        <span class="bdd__tile" aria-hidden="true">
          <img v-if="benchLogo(p.id)" :src="benchLogo(p.id)!" alt="" width="14" height="14" loading="lazy" decoding="async">
          <template v-else>{{ p.name.charAt(0) }}</template>
        </span>
        <span class="bdd__nome" :class="`bdd__nome--${lado(p)}`" aria-hidden="true">{{ p.name }}<b>{{ usd(p.cost) }} · {{ fmtBench.one(p.nota) }}</b></span>
      </button>
    </div>
    <figcaption class="bdd__leg">
      <span class="bdd__leg-x">Custo por mil respostas, em escala logarítmica</span>
      <span class="bdd__leg-f"><i aria-hidden="true" />Fronteira: ninguém tem nota maior pagando menos</span>
      <span>Na vertical, a nota geral</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.bdd {
  margin: 0; container-type: inline-size;
  --tinta: var(--nu-ink); --apoio: var(--nu-gray); --grade: var(--nu-cream-line);
}
.bdd--escuro { --tinta: var(--nu-agora-texto); --apoio: var(--nu-agora-sub); --grade: var(--nu-agora-linha); }
/* margem à esquerda para os números da nota e embaixo para os do custo */
.bdd__area { position: relative; height: clamp(280px, 34vw, 380px); margin: 8px 8px 30px 34px; }
.bdd__gy { position: absolute; left: 0; right: 0; height: 0; border-top: 1px solid var(--grade); }
.bdd__gy span { position: absolute; right: calc(100% + 10px); top: -8px; color: var(--apoio); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; }
.bdd__gx { position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px dashed var(--grade); }
.bdd__gx span { position: absolute; top: calc(100% + 10px); transform: translateX(-50%); white-space: nowrap; color: var(--apoio); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; }
.bdd__svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.bdd__fronteira { fill: none; stroke: var(--nu-blue); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; opacity: .55; }
.bdd--escuro .bdd__fronteira { stroke: var(--nu-blue-soft); }

.bdd__p {
  position: absolute; width: 0; height: 0; padding: 0; border: 0; background: none; cursor: pointer; color: inherit; font: inherit;
}
.bdd__p:focus-visible { outline: none; }
.bdd__p:focus-visible .bdd__tile { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bdd__tile {
  position: absolute; left: 0; top: 0; width: 28px; height: 28px; transform: translate(-50%, -50%); border-radius: 50%;
  display: grid; place-items: center; background: var(--nu-white); color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 700;
  box-shadow: inset 0 0 0 1px var(--nu-cream-line), 0 6px 16px -6px var(--nu-navy-14);
  transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
}
.bdd__tile img { width: 14px; height: 14px; display: block; object-fit: contain; }
.bdd__p--fr .bdd__tile { box-shadow: inset 0 0 0 2px var(--nu-blue), 0 6px 16px -6px var(--nu-navy-14); }
.bdd__p:hover .bdd__tile, .bdd__p--on .bdd__tile { transform: translate(-50%, -50%) scale(1.15); z-index: 2; }
.bdd__p--on .bdd__tile { box-shadow: inset 0 0 0 2px var(--nu-blue), 0 0 0 5px var(--nu-blue-16), 0 8px 18px -6px var(--nu-navy-14); }
.bdd__p--recua .bdd__tile { opacity: .45; }
.bdd__nome {
  position: absolute; top: 0; transform: translateY(-50%); white-space: nowrap; pointer-events: none;
  display: none; flex-direction: column; line-height: 1.25;
  color: var(--tinta); font-size: var(--nu-fs-xs); font-weight: 600;
}
.bdd__nome b { color: var(--apoio); font-weight: 500; font-variant-numeric: tabular-nums; }
.bdd__nome--dir { left: 20px; text-align: left; }
.bdd__nome--esq { right: 20px; text-align: right; }
.bdd__p--fr .bdd__nome, .bdd__p:hover .bdd__nome, .bdd__p--on .bdd__nome { display: flex; }
/* com um modelo em foco, só o nome dele fica escrito */
.bdd__area:has(.bdd__p--on) .bdd__p--fr:not(.bdd__p--on):not(:hover) .bdd__nome { display: none; }
.bdd__p:hover, .bdd__p--on { z-index: 3; }

.bdd__leg { display: flex; flex-wrap: wrap; gap: 6px 20px; color: var(--apoio); font-size: var(--nu-fs-xs); font-weight: 500; }
.bdd__leg-f { display: inline-flex; align-items: center; gap: 8px; }
.bdd__leg-f i { width: 18px; height: 2px; border-radius: 1px; background: var(--nu-blue); opacity: .55; }
@container (max-width: 520px) {
  .bdd__area { height: 300px; margin-left: 28px; }
  .bdd__gx:nth-child(even) span { display: none; }
}
@media (prefers-reduced-motion: reduce) { .bdd__tile { transition: none; } }
</style>

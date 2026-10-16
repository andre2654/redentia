<script setup lang="ts">
// Custo × nota geral, num cartão creme. Eixo X em escala log (custo por mil
// respostas vai de menos de US$ 1 a quase US$ 30: em escala linear os baratos
// virariam um borrão no canto). A fronteira de eficiência liga os modelos para
// os quais nenhum outro é, ao mesmo tempo, mais barato E melhor: esses ganham
// ponto azul e rótulo; os demais, ponto cinza das barras inativas e tooltip.
// Movimento: ao entrar na tela os pontos surgem em cadeia e a linha da
// fronteira se desenha da esquerda (clipPath que cresce); no hover o ponto
// cresce, ganha anel e um cartão branco mostra nome, nota e custo.
// `highlight` faz o mesmo de fora: a lista ao lado acende o ponto do modelo
// sob o mouse (dono, 16/10), e o hover no ponto avisa a lista por `hover`.
const props = defineProps<{
  points: { id: string; name: string; cost: number; score: number }[]
  footnote?: string
  highlight?: string | null
}>()
const emit = defineEmits<{ (e: 'hover', id: string | null): void }>()

const { el, revealClass } = useReveal()
const W = 1000
const H = 420
const PAD = { l: 48, r: 24, t: 24, b: 44 }
const xDomain = computed(() => {
  const cs = props.points.map((p) => p.cost)
  return { lo: Math.log10(Math.min(...cs) * 0.7), hi: Math.log10(Math.max(...cs) * 1.4) }
})
const yDomain = computed(() => {
  const ss = props.points.map((p) => p.score)
  const lo = Math.min(...ss)
  const hi = Math.max(...ss)
  const pad = (hi - lo) * 0.2 || 2
  return { lo: Math.floor(lo - pad), hi: Math.ceil(hi + pad) }
})
const X = (c: number) => PAD.l + ((Math.log10(c) - xDomain.value.lo) / (xDomain.value.hi - xDomain.value.lo)) * (W - PAD.l - PAD.r)
const Y = (s: number) => PAD.t + ((yDomain.value.hi - s) / (yDomain.value.hi - yDomain.value.lo)) * (H - PAD.t - PAD.b)

const frontier = computed(() => {
  const byCost = [...props.points].sort((a, b) => a.cost - b.cost || b.score - a.score)
  const out: typeof byCost = []
  let best = -Infinity
  for (const p of byCost) if (p.score > best) { out.push(p); best = p.score }
  return out
})
const fIndex = (id: string) => frontier.value.findIndex((p) => p.id === id)
const frontierPath = computed(() => frontier.value.map((p, i) => `${i ? 'L' : 'M'}${X(p.cost).toFixed(1)},${Y(p.score).toFixed(1)}`).join(''))
const xTicks = computed(() => [0.5, 1, 2, 5, 10, 20, 50].filter((t) => {
  const l = Math.log10(t)
  return l >= xDomain.value.lo && l <= xDomain.value.hi
}))
const yTicks = computed(() => {
  const { lo, hi } = yDomain.value
  const step = [1, 2, 5, 10].find((s) => (hi - lo) / s <= 4) ?? 10
  const out: number[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(v)
  return out
})
const gridPath = computed(() => yTicks.value.map((t) => `M${PAD.l},${Y(t).toFixed(1)}H${W - PAD.r}`).join(''))
const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(2)}%`
const order = computed(() => [...props.points].sort((a, b) => a.cost - b.cost).map((p) => p.id))
</script>

<template>
  <div ref="el" class="bcs" :class="revealClass">
    <div class="bcs__legend" aria-hidden="true">
      <span><i class="bcs__key bcs__key--on" />Na fronteira: ninguém é mais barato e melhor ao mesmo tempo</span>
      <span><i class="bcs__key" />Fora da fronteira</span>
    </div>
    <div class="bcs__plot">
      <svg viewBox="0 0 1000 420" preserveAspectRatio="none" class="bcs__svg" aria-hidden="true">
        <defs><clipPath id="bcs-clip"><rect class="bcs__clip" x="0" y="0" width="1000" height="420" /></clipPath></defs>
        <path :d="gridPath" class="bcs__grid" fill="none" vector-effect="non-scaling-stroke" />
        <path :d="frontierPath" clip-path="url(#bcs-clip)" fill="none" class="bcs__frontier" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
      </svg>
      <span v-for="t in yTicks" :key="`y${t}`" class="bcs__ytick" :style="{ top: pct(Y(t), H), left: pct(PAD.l - 10, W) }">{{ t }}</span>
      <span v-for="t in xTicks" :key="`x${t}`" class="bcs__xtick" :style="{ left: pct(X(t), W), top: pct(H - PAD.b + 12, H) }"><span class="bcs__cur">US$ </span>{{ t < 1 ? fmtBench.one(t) : t }}</span>
      <button
        v-for="p in points" :key="p.id" type="button" class="bcs__pt"
        :class="{ 'bcs__pt--on': fIndex(p.id) >= 0, 'bcs__pt--hl': p.id === highlight }"
        @mouseenter="emit('hover', p.id)" @mouseleave="emit('hover', null)" @focus="emit('hover', p.id)" @blur="emit('hover', null)"
        :style="{ left: pct(X(p.cost), W), top: pct(Y(p.score), H), '--i': order.indexOf(p.id) }"
        :aria-label="`${p.name}: nota ${fmtBench.one(p.score)}, ${fmtBench.usd(p.cost)} por mil respostas${fIndex(p.id) >= 0 ? ', na fronteira' : ''}`"
      >
        <span class="bcs__mark" />
        <span v-if="fIndex(p.id) >= 0" class="bcs__lbl" :class="{ 'bcs__lbl--below': fIndex(p.id) % 2 === 1 }">{{ p.name }}</span>
        <span class="bcs__tip" role="tooltip">
          <span class="bcs__tip-name">{{ p.name }}</span>
          <span class="bcs__tip-val">{{ fmtBench.one(p.score) }}</span>
          <span class="bcs__tip-row">{{ fmtBench.usd(p.cost) }} por mil respostas</span>
        </span>
      </button>
    </div>
    <div class="bcs__titles" aria-hidden="true"><span>Nota geral</span><span>Custo por mil respostas (escala log)</span></div>
    <p v-if="footnote" class="bcs__foot">{{ footnote }}</p>
  </div>
</template>

<style scoped>
.bcs { background: var(--b-surface, var(--nu-cream)); border-radius: var(--nu-r-panel); padding: clamp(18px, 2.4vw, 28px); container-type: inline-size; }
.bcs__legend { display: flex; gap: 6px 20px; flex-wrap: wrap; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.bcs__legend span { display: inline-flex; align-items: center; gap: 8px; }
.bcs__key { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: var(--b-surface, var(--nu-cream)); box-shadow: inset 0 0 0 2px var(--nu-gray); }
.bcs__key--on { background: var(--nu-blue); box-shadow: none; }
.bcs__plot { position: relative; height: clamp(260px, 32vw, 380px); margin-top: 14px; }
.bcs__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.bcs__grid { stroke: var(--nu-cream-2); stroke-width: 1; }
.bcs__frontier { stroke: var(--nu-blue); }
.bcs__ytick, .bcs__xtick {
  position: absolute; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums;
  white-space: nowrap; pointer-events: none;
}
.bcs__ytick { transform: translate(-100%, -50%); }
.bcs__xtick { transform: translateX(-50%); }

.bcs__pt {
  position: absolute; width: 30px; height: 30px; transform: translate(-50%, -50%);
  padding: 0; border: 0; background: transparent; cursor: pointer; border-radius: 50%; font-family: inherit;
}
.bcs__pt:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }
.bcs__mark {
  position: absolute; left: 50%; top: 50%; width: 12px; height: 12px; border-radius: 50%;
  translate: -50% -50%; background: var(--b-surface, var(--nu-cream)); box-shadow: inset 0 0 0 2px var(--nu-gray), 0 0 0 3px var(--b-surface, var(--nu-cream));
  transition: scale .2s, box-shadow .2s, background .2s;
}
.bcs__pt--on .bcs__mark { background: var(--nu-blue); box-shadow: 0 0 0 3px var(--b-surface, var(--nu-cream)); width: 14px; height: 14px; }
.bcs__pt:hover .bcs__mark, .bcs__pt:focus-visible .bcs__mark, .bcs__pt--hl .bcs__mark { scale: 1.35; box-shadow: 0 0 0 3px var(--b-surface, var(--nu-cream)), 0 0 0 7px var(--nu-blue-tint); background: var(--nu-blue); }
.bcs__lbl {
  position: absolute; left: 50%; bottom: calc(100% - 4px); transform: translateX(-50%);
  color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 800; white-space: nowrap; pointer-events: none;
}
.bcs__lbl--below { bottom: auto; top: calc(100% - 4px); }
.bcs__tip {
  position: absolute; left: 50%; bottom: calc(100% + 6px); z-index: 3; display: flex; flex-direction: column; align-items: flex-start;
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 10px 14px; white-space: nowrap; text-align: left;
  box-shadow: var(--nu-shadow-card), 0 0 0 1px var(--nu-cream-2);
  opacity: 0; transform: translate(-50%, 6px); pointer-events: none; transition: opacity .18s, transform .18s;
}
.bcs__pt:hover .bcs__tip, .bcs__pt:focus-visible .bcs__tip, .bcs__pt--hl .bcs__tip { opacity: 1; transform: translate(-50%, 0); }
.bcs__pt:hover .bcs__lbl, .bcs__pt:focus-visible .bcs__lbl, .bcs__pt--hl .bcs__lbl { opacity: 0; }
/* ponto aceso fica por cima dos vizinhos, com o cartão inteiro à vista */
.bcs__pt--hl, .bcs__pt:hover { z-index: 4; }
.bcs__tip-name { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
.bcs__tip-val { color: var(--nu-blue); font-size: var(--nu-fs-xl); font-weight: 800; font-variant-numeric: tabular-nums; }
.bcs__tip-row { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; }
.bcs__titles {
  display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 10px;
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
}
.bcs__foot { margin: 12px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

/* ——— entrada: pontos surgem do mais barato ao mais caro, fronteira se desenha ——— */
.bcs__clip { transform-box: fill-box; transform-origin: left; }
.is-pending .bcs__clip { transform: scaleX(0); }
.is-in .bcs__clip { transform: scaleX(1); transition: transform 1.1s cubic-bezier(.45, .05, .2, 1) .35s; }
.is-pending .bcs__mark, .is-pending .bcs__lbl { opacity: 0; }
.is-in .bcs__mark { animation: bcs-pop .45s cubic-bezier(.2, .8, .2, 1.4) backwards; animation-delay: calc(var(--i) * 70ms); }
.is-in .bcs__lbl { animation: bcs-fade .4s ease backwards; animation-delay: calc(.6s + var(--i) * 70ms); }
@keyframes bcs-pop { from { opacity: 0; scale: 0; } to { opacity: 1; scale: 1; } }
@keyframes bcs-fade { from { opacity: 0; } to { opacity: 1; } }

/* estreito: o eixo de custo perde o "US$" (já está no título) para não colar */
@container (max-width: 480px) { .bcs__cur { display: none; } }
</style>

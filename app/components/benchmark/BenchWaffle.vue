<script setup lang="ts">
// Inventa número? em 100 pontos por modelo (dono, 16/10: "gráficos mais
// imponentes e criativos"). Cada ponto é 1% das respostas: azul acertou, cinza
// disse "não sei" quando dava para saber, vermelho inventou. Os vermelhos ficam
// no fim da grade, com brilho, para o "1 em 29" se ver sem texto: no pior modelo
// são 21 de 100. A nota e a posição ficam no cabeçalho de cada cartão.
// Movimento: os pontos acendem em onda quando o cartão entra na tela.
// Hover (dono, 16/10): o ponto sob o mouse mostra uma etiqueta com o que ele é
// e quanto aquilo pesa no modelo ("Inventou em 3% das respostas"); os pontos da
// mesma cor acendem e os outros esmaecem. Só com mouse: no toque não há hover.
const props = defineProps<{
  segments: { label: string }[]
  rows: { id: string; name: string; rank: number; value: number; parts: number[] }[]
}>()
const { el, revealClass } = useReveal(0.12)

const COR = ['ok', 'nao', 'inv'] as const
/** 100 pontos: azul, cinza, vermelho, nessa ordem (a sobra de arredondamento vai pro azul) */
function pontos(parts: number[]) {
  const nao = Math.round(parts[1] ?? 0)
  const inv = Math.round(parts[2] ?? 0)
  const ok = Math.max(0, 100 - nao - inv)
  return [...Array(ok).fill(0), ...Array(nao).fill(1), ...Array(inv).fill(2)].slice(0, 100) as number[]
}
const media = computed(() => [0, 1, 2].map((i) => props.rows.reduce((a, r) => a + (r.parts[i] ?? 0), 0) / (props.rows.length || 1)))

// etiqueta do hover: uma por vez, presa ao ponto sob o mouse
const foco = ref<{ id: string; c: number; x: number; y: number; lado: 'ini' | 'meio' | 'fim' } | null>(null)
function focar(e: PointerEvent, id: string) {
  if (e.pointerType === 'touch') return
  const dot = e.target as HTMLElement
  if (!dot.classList?.contains('bwf__dot')) return
  const k = Number(dot.dataset.k)
  const col = k % 10
  foco.value = {
    id, c: Number(dot.dataset.c), x: dot.offsetLeft + dot.offsetWidth / 2, y: dot.offsetTop,
    lado: col < 3 ? 'ini' : col > 6 ? 'fim' : 'meio',
  }
}
const pctTxt = (v: number) => (Number.isInteger(v) ? `${v}%` : fmtBench.pct(v))
</script>

<template>
  <div ref="el" class="bwf" :class="revealClass">
    <div class="bwf__legend" aria-hidden="true">
      <span v-for="(s, i) in segments" :key="s.label"><i class="bwf__sw" :class="`bwf__sw--${COR[i]}`" />{{ s.label }} <b>{{ fmtBench.pct(media[i] ?? 0) }}</b></span>
      <span class="bwf__note">média; cada ponto é 1% das respostas</span>
    </div>
    <ul class="bwf__grid">
      <li
        v-for="r in rows" :key="r.id" class="bwf__card" :data-foco="foco?.id === r.id ? COR[foco.c] : undefined"
        :aria-label="`${r.rank}º ${r.name}: acertou ${r.parts[0]}%, não sei ${r.parts[1]}%, inventou ${r.parts[2]}%. Nota ${fmtBench.one(r.value)}.`"
      >
        <div class="bwf__head" aria-hidden="true">
          <span class="bwf__tile"><img v-if="benchLogo(r.id)" :src="benchLogo(r.id)!" alt="" width="16" height="16" loading="lazy" decoding="async"></span>
          <span class="bwf__name">{{ r.name }}</span>
          <span class="bwf__val">{{ fmtBench.one(r.value) }}</span>
        </div>
        <div class="bwf__dots" aria-hidden="true" @pointerover="focar($event, r.id)" @pointerleave="foco = null">
          <i v-for="(p, k) in pontos(r.parts)" :key="k" class="bwf__dot" :class="`bwf__dot--${COR[p]}`" :style="{ '--k': k }" :data-k="k" :data-c="p" />
        </div>
        <span
          v-if="foco?.id === r.id" class="bwf__tip" :class="`bwf__tip--${foco.lado}`" :style="{ left: `${foco.x}px`, top: `${foco.y}px` }" aria-hidden="true"
        ><i class="bwf__sw" :class="`bwf__sw--${COR[foco.c]}`" /><span><b>{{ segments[foco.c]?.label }}</b> em {{ pctTxt(r.parts[foco.c] ?? 0) }} das respostas</span></span>
        <div class="bwf__foot" aria-hidden="true">
          <template v-if="(r.parts[2] ?? 0) > 0">inventou <b>{{ r.parts[2] }}%</b> · {{ r.rank }}º</template>
          <template v-else>não inventou · {{ r.rank }}º</template>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.bwf { container-type: inline-size; }
.bwf__legend { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 18px; margin-bottom: 18px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.bwf__legend span { display: inline-flex; align-items: center; gap: 7px; }
.bwf__legend b { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
.bwf__note { color: var(--nu-gray); font-size: var(--nu-fs-xs); }
.bwf__sw { width: 10px; height: 10px; border-radius: 50%; }
.bwf__sw--ok { background: var(--nu-blue); }
.bwf__sw--nao { background: var(--nu-navy-14); }
.bwf__sw--inv { background: var(--nu-red); box-shadow: 0 0 8px var(--nu-red-soft); }

.bwf__grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(212px, 1fr)); gap: 12px; }
.bwf__card {
  position: relative; border-radius: var(--nu-r-tile); padding: 14px 14px 12px;
  background: var(--b-surface, var(--nu-cream));
}
.bwf__head { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 34px; }
.bwf__tile {
  width: 26px; height: 26px; flex-shrink: 0; border-radius: 50%; display: grid; place-items: center;
  background: var(--b-surface-hi, var(--nu-white)); box-shadow: inset 0 0 0 1px var(--nu-cream-2);
}
.bwf__tile img { width: 16px; height: 16px; display: block; object-fit: contain; }
.bwf__name { flex: 1; min-width: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.2; overflow-wrap: anywhere; }
.bwf__val { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }

.bwf__dots { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; margin: 14px 0 12px; }
.bwf__dot { aspect-ratio: 1; border-radius: 50%; }
.bwf__dot--ok { background: var(--nu-blue); }
.bwf__dot--nao { background: var(--nu-navy-14); }
.bwf__dot--inv { background: var(--nu-red); box-shadow: 0 0 6px var(--nu-red-soft); }
.bwf__foot { color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 500; }
.bwf__foot b { color: var(--nu-red-2); font-weight: 800; }

/* entrada: os pontos acendem em onda (animação, para o hover não herdar o atraso) */
.is-pending .bwf__dot { opacity: 0; transform: scale(.4); }
.is-in .bwf__dot { animation: bwf-in .35s ease backwards; animation-delay: calc(var(--k) * 6ms); }
@keyframes bwf-in { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: none; } }

/* hover: a cor em foco acende, as outras esmaecem, o ponto sob o mouse cresce */
.bwf__dot { transition: opacity .15s ease, transform .15s ease; }
.bwf__card[data-foco] .bwf__dot { opacity: .22; }
.bwf__card[data-foco="ok"] .bwf__dot--ok,
.bwf__card[data-foco="nao"] .bwf__dot--nao,
.bwf__card[data-foco="inv"] .bwf__dot--inv { opacity: 1; }
.bwf__dot:hover { transform: scale(1.45); }
.bwf__tip {
  position: absolute; z-index: 3; pointer-events: none; display: inline-flex; align-items: center; gap: 8px;
  width: max-content; max-width: 240px; padding: 7px 11px; border-radius: 12px;
  background: var(--nu-navy); color: var(--nu-white); box-shadow: 0 8px 20px var(--nu-navy-14);
  font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.35;
  transform: translate(-50%, calc(-100% - 10px));
}
.bwf__tip b { font-weight: 800; }
.bwf__tip .bwf__sw { flex-shrink: 0; }
.bwf__tip .bwf__sw--nao { background: var(--nu-gray); }
.bwf__tip--ini { transform: translate(-18px, calc(-100% - 10px)); }
.bwf__tip--fim { transform: translate(calc(-100% + 18px), calc(-100% - 10px)); }

@container (max-width: 420px) {
  .bwf__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .bwf__card { padding: 12px 11px 10px; }
  .bwf__dots { gap: 3px; }
}
</style>

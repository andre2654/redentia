<script setup lang="ts">
// Cartões com anel de progresso, um por modelo: o anel do carrossel de teses
// (track --nu-cream-3, arco azul). Usado no "Concorda com tudo?": o arco é o
// percentual de vezes em que o modelo segurou o investidor; embaixo, a nota e
// quanto ele concordou com o erro. Cada cartão já traz posição e nota, então a
// seção dispensa a lista.
// `ringWord` escreve dentro do anel o que o número mede ("segurou"): sem ele, um
// "100%" grande embaixo de "Concorda com tudo?" foi lido como "concorda 100%"
// (dono, 16/10). `mid` (em cima do muro) fecha a conta do cartão com o anel e o
// "concordou": segurou + em cima do muro + concordou = 100.
// Movimento: o arco se desenha quando o grid entra na tela (stroke-dashoffset,
// pathLength 100), em cadeia; no hover o cartão sobe 2px com a sombra dos
// cards Nu e o arco engrossa.
const props = defineProps<{
  rows: { id: string; name: string; provider: string; rank: number; tied: boolean; value: number; good: number; bad: number; mid?: number }[]
  goodLabel: string
  badLabel: string
  ringWord?: string
  midLabel?: string
  footnote?: string
}>()

const { el, revealClass } = useReveal(0.15)
const bestId = computed(() => props.rows[0]?.id)
</script>

<template>
  <div ref="el" class="brg" :class="revealClass">
    <ol class="brg__grid">
      <li
        v-for="(r, i) in rows" :key="r.id" class="brg__card" tabindex="0"
        :class="{ 'brg__card--best': r.id === bestId }" :style="{ '--i': i, '--off': 100 - r.good }"
        :aria-label="`${r.rank}º ${r.name}: ${goodLabel.toLowerCase()} ${r.good}%${midLabel && r.mid != null ? `, ${midLabel.toLowerCase()} ${r.mid}%` : ''}, ${badLabel.toLowerCase()} ${r.bad}%, nota ${fmtBench.one(r.value)}`"
      >
        <span class="brg__top">
          <span class="brg__pos">{{ r.rank }}º<template v-if="r.tied"> · empate</template></span>
          <span class="brg__score">{{ fmtBench.one(r.value) }}</span>
        </span>
        <span class="brg__ring">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle class="brg__track" cx="32" cy="32" r="27" />
            <circle class="brg__arc" cx="32" cy="32" r="27" pathLength="100" />
          </svg>
          <span class="brg__pct">
            <span class="brg__num">{{ r.good }}<small>%</small></span>
            <span v-if="ringWord" class="brg__word">{{ ringWord }}</span>
          </span>
        </span>
        <span class="brg__name">{{ r.name }}</span>
        <span class="brg__prov">{{ r.provider }}</span>
        <span class="brg__legs">
          <span v-if="midLabel && r.mid != null" class="brg__bad"><i class="brg__dot brg__dot--mid" />{{ midLabel.toLowerCase() }} {{ r.mid }}%</span>
          <span class="brg__bad"><i class="brg__dot" />{{ badLabel.toLowerCase() }} {{ r.bad }}%</span>
        </span>
      </li>
    </ol>
    <p class="brg__foot">{{ footnote ?? `O anel mostra ${goodLabel.toLowerCase()}, em % dos pedidos com erro embutido. Embaixo, a nota de 0 a 100.` }}</p>
  </div>
</template>

<style scoped>
.brg__grid {
  list-style: none; margin: 0; padding: 0;
  display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(150px, 100%), 1fr));
}
.brg__card {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  background: var(--b-surface, var(--nu-cream)); border-radius: var(--nu-r-tile); padding: 14px 14px 16px; outline: none;
  transition: transform .2s, box-shadow .2s, background .2s;
}
.brg__card:hover, .brg__card:focus-visible { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); background: var(--b-surface-hi, var(--nu-white)); }
.brg__card:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.brg__top { align-self: stretch; display: flex; justify-content: space-between; align-items: baseline; }
.brg__pos { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.brg__score { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums; }
.brg__card--best .brg__score { color: var(--nu-blue); }

.brg__ring { position: relative; width: 84px; height: 84px; margin: 6px 0 10px; }
.brg__ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.brg__track { fill: none; stroke: var(--nu-cream-3); stroke-width: 6; }
.brg__card:hover .brg__track, .brg__card:focus-visible .brg__track { stroke: var(--nu-cream-2); }
.brg__arc {
  fill: none; stroke: var(--nu-blue-soft); stroke-width: 6; stroke-linecap: round;
  stroke-dasharray: 100; stroke-dashoffset: var(--off);
  transition: stroke-width .2s, stroke .2s;
}
.brg__card--best .brg__arc { stroke: var(--nu-blue); }
.brg__card:hover .brg__arc, .brg__card:focus-visible .brg__arc { stroke-width: 8; stroke: var(--nu-blue); }
.brg__pct {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 1px;
  color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -.02em;
}
.brg__pct small { font-size: var(--nu-fs-xs); font-weight: 700; color: var(--nu-gray); }
.brg__pct { flex-direction: column; gap: 0; }
.brg__num { display: flex; align-items: baseline; gap: 1px; line-height: 1; }
.brg__word { margin-top: 2px; color: var(--nu-gray); font-size: 10px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; line-height: 1; }
.brg__legs { display: flex; flex-direction: column; align-items: center; gap: 2px; margin-top: 8px; }
.brg__legs .brg__bad { margin-top: 0; }
.brg__dot.brg__dot--mid { background: var(--nu-cream-3); box-shadow: inset 0 0 0 1px var(--nu-gray); }
.brg__name { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.25; }
.brg__prov { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.brg__bad {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 8px;
  color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums;
}
.brg__dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nu-red); }
.brg__foot { margin: 16px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

/* ——— entrada: o arco se desenha em cadeia ——— */
.is-pending .brg__arc { stroke-dashoffset: 100; }
.is-in .brg__arc {
  transition: stroke-dashoffset 1s cubic-bezier(.2, .8, .2, 1) calc(var(--i) * 60ms), stroke-width .2s, stroke .2s;
}
.is-pending .brg__pct { opacity: 0; }
.is-in .brg__pct { transition: opacity .4s ease calc(.4s + var(--i) * 60ms); }
</style>

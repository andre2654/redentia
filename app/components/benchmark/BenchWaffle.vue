<script setup lang="ts">
// Inventa número? em 100 pontos por modelo (dono, 16/10: "gráficos mais
// imponentes e criativos"). Cada ponto é 1% das respostas: azul acertou, cinza
// disse "não sei" quando dava para saber, vermelho inventou. Os vermelhos ficam
// no fim da grade, com brilho, para o "1 em 29" se ver sem texto: no pior modelo
// são 21 de 100. A nota e a posição ficam no cabeçalho de cada cartão.
// Movimento: os pontos acendem em onda quando o cartão entra na tela.
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
</script>

<template>
  <div ref="el" class="bwf" :class="revealClass">
    <div class="bwf__legend" aria-hidden="true">
      <span v-for="(s, i) in segments" :key="s.label"><i class="bwf__sw" :class="`bwf__sw--${COR[i]}`" />{{ s.label }} <b>{{ fmtBench.pct(media[i] ?? 0) }}</b></span>
      <span class="bwf__note">média; cada ponto é 1% das respostas</span>
    </div>
    <ul class="bwf__grid">
      <li
        v-for="r in rows" :key="r.id" class="bwf__card"
        :aria-label="`${r.rank}º ${r.name}: acertou ${r.parts[0]}%, não sei ${r.parts[1]}%, inventou ${r.parts[2]}%. Nota ${fmtBench.one(r.value)}.`"
      >
        <div class="bwf__head" aria-hidden="true">
          <span class="bwf__tile"><img v-if="benchLogo(r.id)" :src="benchLogo(r.id)!" alt="" width="16" height="16" loading="lazy" decoding="async"></span>
          <span class="bwf__name">{{ r.name }}</span>
          <span class="bwf__val">{{ fmtBench.one(r.value) }}</span>
        </div>
        <div class="bwf__dots" aria-hidden="true">
          <i v-for="(p, k) in pontos(r.parts)" :key="k" class="bwf__dot" :class="`bwf__dot--${COR[p]}`" :style="{ '--k': k }" />
        </div>
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
  border-radius: var(--nu-r-tile); padding: 14px 14px 12px;
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

/* entrada: os pontos acendem em onda */
.is-pending .bwf__dot { opacity: 0; transform: scale(.4); }
.is-in .bwf__dot { opacity: 1; transform: none; transition: opacity .35s ease calc(var(--k) * 6ms), transform .35s ease calc(var(--k) * 6ms); }

@container (max-width: 420px) {
  .bwf__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .bwf__card { padding: 12px 11px 10px; }
  .bwf__dots { gap: 3px; }
}
</style>

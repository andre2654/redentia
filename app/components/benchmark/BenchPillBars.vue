<script setup lang="ts">
// Barras em pílula, uma linha por modelo: o gesto da barra de alocação da
// carteira (CarteiraHero: pílula de 14px, segmentos com 3px de respiro). Usada
// no "Inventa número?" (acertou / não sabe / inventou). Cada linha já traz
// posição, nome, nota e a métrica de apoio, então a seção dispensa a lista.
// Movimento: as pílulas se estendem da esquerda em cadeia quando entram na tela;
// no hover a linha ganha fundo creme, as outras recuam e os percentuais das três
// faixas aparecem embaixo da pílula (espaço já reservado, nada pula).
import type { BenchStack } from '~/types/benchmark'

const props = defineProps<{
  segments: BenchStack['segments']
  rows: { id: string; name: string; provider: string; rank: number; tied: boolean; value: number; parts: number[]; extra?: string }[]
  footnote?: string
  /** dica de mouse: só aparece em tela larga com ponteiro que passa por cima */
  hint?: string
}>()

const { el, revealClass } = useReveal()
const avg = computed(() => props.segments.map((_, i) =>
  props.rows.reduce((a, r) => a + (r.parts[i] ?? 0), 0) / (props.rows.length || 1)))
</script>

<template>
  <div ref="el" class="bpb" :class="revealClass">
    <div class="bpb__legend">
      <span v-for="(s, k) in segments" :key="s.label" class="bpb__key">
        <i class="bpb__dot" :class="`bpb__t--${s.tone}`" />{{ s.label }} <b>{{ fmtBench.pct(avg[k] ?? 0) }}</b>
      </span>
      <span class="bpb__avg">média dos modelos</span>
    </div>
    <ol class="bpb__rows">
      <li v-for="(r, i) in rows" :key="r.id" class="bpb__row" tabindex="0" :style="{ '--i': i }">
        <span class="bpb__pos">{{ r.rank }}º</span>
        <span class="bpb__who">
          <span class="bpb__name">{{ r.name }}</span>
          <span class="bpb__prov">{{ r.provider }}</span>
        </span>
        <span class="bpb__track">
          <span class="bpb__bar">
            <span
              v-for="(s, k) in segments" :key="s.label" class="bpb__seg" :class="`bpb__t--${s.tone}`"
              :style="{ flexGrow: r.parts[k] ?? 0 }"
            />
          </span>
          <span class="bpb__detail">
            <span v-for="(s, k) in segments" :key="s.label"><i class="bpb__dot" :class="`bpb__t--${s.tone}`" />{{ r.parts[k] ?? 0 }}%</span>
          </span>
        </span>
        <span class="bpb__num">
          <span class="bpb__val">{{ fmtBench.one(r.value) }}</span>
          <span class="bpb__sub">{{ r.extra ?? (r.tied ? 'empate técnico' : '') }}</span>
        </span>
      </li>
    </ol>
    <p v-if="footnote || hint" class="bpb__foot">{{ footnote }}<span v-if="hint" class="bpb__hint"> {{ hint }}</span></p>
  </div>
</template>

<style scoped>
.bpb { container-type: inline-size; }
.bpb__legend { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 22px; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; }
.bpb__key { display: inline-flex; align-items: center; gap: 8px; }
.bpb__key b { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
.bpb__avg { color: var(--nu-gray); font-size: var(--nu-fs-xs); }
.bpb__dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }

.bpb__rows { list-style: none; margin: 18px 0 0; padding: 0; }
.bpb__row {
  display: grid; grid-template-columns: 34px minmax(120px, 190px) 1fr 84px; align-items: center; gap: 16px;
  padding: 12px 14px; margin: 0 -14px; border-radius: var(--nu-r-tile); outline: none;
  transition: background .2s, opacity .2s;
}
.bpb__row:hover, .bpb__row:focus-visible { background: var(--b-surface, var(--nu-cream)); }
.bpb__rows:hover .bpb__row:not(:hover) { opacity: .5; }
.bpb__pos { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.bpb__who { display: flex; flex-direction: column; min-width: 0; }
.bpb__name { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
.bpb__prov { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }

.bpb__track { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.bpb__bar { display: flex; gap: 3px; height: 14px; transform-origin: left; }
.bpb__seg { flex-basis: 0; min-width: 0; border-radius: var(--nu-r-pill); }
.bpb__t--good { background: var(--nu-blue); }
.bpb__t--neutral { background: var(--nu-bar-inactive); }
.bpb__t--bad { background: var(--nu-red); }
.bpb__detail {
  display: flex; gap: 14px; color: var(--nu-gray-2); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums;
  opacity: 0; transform: translateY(-3px); transition: opacity .2s, transform .2s;
}
.bpb__detail span { display: inline-flex; align-items: center; gap: 5px; }
.bpb__detail .bpb__dot { width: 7px; height: 7px; }
.bpb__row:hover .bpb__detail, .bpb__row:focus-visible .bpb__detail { opacity: 1; transform: none; }

.bpb__num { display: flex; flex-direction: column; align-items: flex-end; }
.bpb__val { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
.bpb__sub { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; }
.bpb__foot { margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
@media (hover: none) { .bpb__hint { display: none; } }
.bpb__row:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

/* ——— entrada: a pílula se estende da esquerda, linha a linha ——— */
.is-pending .bpb__bar { transform: scaleX(0); }
.is-in .bpb__bar { transform: scaleX(1); transition: transform .8s cubic-bezier(.2, .8, .2, 1) calc(var(--i) * 45ms); }

@container (max-width: 640px) {
  .bpb__row { grid-template-columns: 28px 1fr auto; grid-template-areas: 'pos who num' 'pos bar bar'; gap: 6px 10px; padding: 10px 12px; margin: 0 -12px; }
  .bpb__pos { grid-area: pos; align-self: start; padding-top: 2px; }
  .bpb__who { grid-area: who; }
  .bpb__num { grid-area: num; }
  .bpb__track { grid-area: bar; }
  .bpb__detail { opacity: 1; transform: none; }
  .bpb__hint { display: none; }
}
</style>

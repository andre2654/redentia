<script setup lang="ts">
// 'P&L mês a mês.' (design Carteira Nu): legenda -3%→+3% com 5 swatches
// 22x16 radius 5; matriz overflow-x com min-width 920px, grid 56px + 12×1fr
// + 96px; células 46px radius 10 com alpha por magnitude (função hmCell
// EXATA do design: α = 0.12 + 0.88·min(1,|v|/3.5), ink branco quando α>0.5)
// e coluna 'Ano' com pill sólida verde/vermelha. Cores via var(--nu-hm-*):
// o componente só monta rgba(var(--nu-hm-*-rgb), α).
// A AGREGAÇÃO mensal (com proventos) é portada do produto atual — ver
// buildHeatmap no useCarteira. Percentuais não são mascarados pelo olho
// (a máscara do design cobre valores em R$).
import type { CarteiraHeatmapVM } from '~/types/carteira'

defineProps<{ heatmap: CarteiraHeatmapVM }>()

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function cellStyle(c: { alpha: number; neg: boolean; inkWhite: boolean } | null) {
  if (!c) return { background: 'var(--nu-hm-empty)' }
  const rgb = c.neg ? 'var(--nu-hm-red-rgb)' : 'var(--nu-hm-green-rgb)'
  const ink = c.inkWhite ? 'var(--nu-white)' : (c.neg ? 'var(--nu-hm-red-ink)' : 'var(--nu-hm-green-ink)')
  return { background: `rgba(${rgb}, ${c.alpha})`, color: ink }
}
</script>

<template>
  <section class="chm">
    <div class="chm__head">
      <div>
        <h2 class="chm__title">P&amp;L mês a mês.</h2>
        <div class="chm__sub">{{ heatmap.sub }}</div>
      </div>
      <div class="chm__legend">
        <span class="chm__legend-lbl">-3%</span>
        <span class="chm__swatches">
          <span class="chm__swatch chm__swatch--r85" />
          <span class="chm__swatch chm__swatch--r40" />
          <span class="chm__swatch chm__swatch--empty" />
          <span class="chm__swatch chm__swatch--g40" />
          <span class="chm__swatch chm__swatch--g85" />
        </span>
        <span class="chm__legend-lbl">+3%</span>
      </div>
    </div>
    <div class="chm__scroll">
      <div class="chm__matrix">
        <div class="chm__grid">
          <span />
          <span v-for="m in MESES" :key="m" class="chm__month">{{ m }}</span>
          <span class="chm__month chm__month--ano">Ano</span>
        </div>
        <div v-for="y in heatmap.years" :key="y.y" class="chm__grid chm__grid--row">
          <span class="chm__year">{{ y.y }}</span>
          <span v-for="(c, i) in y.cells" :key="i" class="chm__cell" :style="cellStyle(c)">{{ c?.txt ?? '' }}</span>
          <span class="chm__cell chm__cell--ano" :class="y.anoNeg ? 'chm__cell--ano-neg' : 'chm__cell--ano-pos'">{{ y.ano }}</span>
        </div>
      </div>
    </div>
    <div class="chm__note">{{ heatmap.note }}</div>
  </section>
</template>

<style scoped>
.chm {
  background: var(--nu-cream);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.chm__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.chm__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.chm__sub { color: var(--nu-gray); font-size: 17px; font-weight: 600; margin-top: 14px; }
.chm__legend { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.chm__legend-lbl { color: var(--nu-gray); font-size: 12.5px; font-weight: 700; }
.chm__swatches { display: flex; gap: 4px; }
.chm__swatch { width: 22px; height: 16px; border-radius: 5px; }
.chm__swatch--r85 { background: rgba(var(--nu-hm-red-rgb), 0.85); }
.chm__swatch--r40 { background: rgba(var(--nu-hm-red-rgb), 0.4); }
.chm__swatch--empty { background: var(--nu-hm-empty); }
.chm__swatch--g40 { background: rgba(var(--nu-hm-green-rgb), 0.4); }
.chm__swatch--g85 { background: rgba(var(--nu-hm-green-rgb), 0.85); }
.chm__scroll { overflow-x: auto; margin-top: 36px; }
.chm__matrix { min-width: 920px; }
.chm__grid { display: grid; grid-template-columns: 56px repeat(12, 1fr) 96px; gap: 6px; }
.chm__grid--row { margin-top: 6px; align-items: stretch; }
.chm__month { text-align: center; color: var(--nu-gray); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; }
.chm__month--ano { color: var(--nu-ink); }
.chm__year { display: flex; align-items: center; color: var(--nu-ink); font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums; }
.chm__cell {
  display: flex; align-items: center; justify-content: center; height: 46px;
  border-radius: 10px; font-size: 12.5px; font-weight: 800;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.chm__cell--ano { color: var(--nu-white); font-size: 13px; }
.chm__cell--ano-pos { background: var(--nu-hm-green); }
.chm__cell--ano-neg { background: var(--nu-red); }
.chm__note { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-top: 22px; }
</style>

<script setup lang="ts">
// PROTÓTIPO /simulacao — "Por que sangra junto" (dono 25/08): o grau de
// parentesco da carteira como número-herói, o heatmap triangular de
// correlação (derivado dos MESMOS loadings do motor) e o see-through dos
// ETFs — a exposição REAL por empresa, direta + escondida dentro do ETF.
// No real: matriz de correlação da plataforma + cda_fie da CVM.
import type { SimCorrelationOut, SimSeeThroughItem } from './simMock'

const props = defineProps<{ corr: SimCorrelationOut; seeThrough: SimSeeThroughItem[]; active: boolean }>()

const n = computed(() => props.corr.tickers.length)

/** verde (baixa) → branco → vermelho (alta), com o número sempre legível */
function cellStyle(c: number): Record<string, string> {
  if (c >= 50) return { background: `color-mix(in srgb, var(--nu-red) ${Math.round((c - 50) * 1.1)}%, var(--nu-white))`, color: c > 78 ? 'var(--nu-white)' : 'var(--nu-ink)' }
  return { background: `color-mix(in srgb, var(--nu-green) ${Math.round((50 - c) * 0.65)}%, var(--nu-white))`, color: 'var(--nu-ink)' }
}
const heroTone = computed(() => (props.corr.avgPct >= 65 ? 'down' : props.corr.avgPct >= 45 ? 'mid' : 'up'))
const heroLine = computed(() =>
  props.corr.avgPct >= 65
    ? 'em queda, isso se move como um ativo só'
    : props.corr.avgPct >= 45
      ? 'diversificação moderada — parte da carteira cai junta'
      : 'as posições se defendem em momentos diferentes',
)
const fmt1 = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
</script>

<template>
  <div class="sco">
    <!-- o número-herói: grau de parentesco -->
    <div class="sco__hero" :class="{ 'sco__hero--in': active }">
      <span class="sco__hero-label">As posições se movem</span>
      <span class="sco__hero-value" :class="`sco__hero--${heroTone}`">{{ corr.avgPct }}% juntas</span>
      <span class="sco__hero-line">{{ heroLine }}</span>
    </div>

    <div class="sco__grid">
      <!-- heatmap triangular -->
      <div class="sco__map" :style="{ gridTemplateColumns: `56px repeat(${n - 1}, minmax(40px, 1fr))` }">
        <template v-for="(t, i) in corr.tickers" :key="t">
          <template v-if="i > 0">
            <span class="sco__tick">{{ t }}</span>
            <template v-for="(u, j) in corr.tickers.slice(0, n - 1)" :key="t + u">
              <span
                v-if="j < i" class="sco__cell" :style="cellStyle(corr.matrix[i]![j]!)"
                :title="`${t} × ${u}: ${corr.matrix[i]![j]}%`"
              >{{ corr.matrix[i]![j] }}</span>
              <span v-else class="sco__cell sco__cell--void" />
            </template>
          </template>
        </template>
        <span class="sco__tick" />
        <span v-for="u in corr.tickers.slice(0, n - 1)" :key="'b' + u" class="sco__tick sco__tick--col">{{ u }}</span>
      </div>

      <!-- see-through: a exposição REAL, direta + dentro do ETF -->
      <div v-if="seeThrough.length" class="sco__through">
        <span class="sco__through-label">Exposição real, somando o que está dentro dos ETFs</span>
        <div v-for="it in seeThrough" :key="it.code" class="sco__th-item">
          <div class="sco__th-head">
            <b class="sco__th-name">{{ it.name }}</b>
            <b class="sco__th-total">{{ fmt1(it.totalPct) }}%</b>
          </div>
          <div class="sco__th-bar" aria-hidden="true">
            <i v-if="it.directPct" class="sco__th-fill sco__th-fill--direct" :style="{ width: `${Math.min(100, it.directPct * 6)}%` }" />
            <i v-for="v in it.viaEtf" :key="v.etf" class="sco__th-fill sco__th-fill--etf" :style="{ width: `${Math.min(100, v.pct * 6)}%` }" />
          </div>
          <span class="sco__th-sub">
            <template v-if="it.directPct">{{ fmt1(it.directPct) }}% direto ({{ it.directVia }})</template>
            <template v-for="v in it.viaEtf" :key="v.etf">{{ it.directPct || v !== it.viaEtf[0] ? ' + ' : '' }}{{ fmt1(v.pct) }}% dentro do {{ v.etf }}</template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sco__hero {
  display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;
  margin-bottom: 26px;
  opacity: 0; transform: translateY(10px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.sco__hero--in { opacity: 1; transform: none; }
.sco__hero-label { color: var(--nu-gray); font-size: 13px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; }
.sco__hero-value { font-size: clamp(30px, 3.6vw, 46px); font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.sco__hero--down { color: var(--nu-red); }
.sco__hero--mid { color: var(--nu-amber); }
.sco__hero--up { color: var(--nu-green); }
.sco__hero-line { color: var(--nu-gray-2); font-size: 14.5px; font-weight: 600; }

.sco__grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280px, 1fr); gap: 28px; align-items: start; }
@media (max-width: 900px) { .sco__grid { grid-template-columns: 1fr; } }

/* heatmap triangular */
.sco__map { display: grid; gap: 4px; }
.sco__tick {
  display: flex; align-items: center;
  color: var(--nu-gray-2); font-size: 11px; font-weight: 800;
}
.sco__tick--col { justify-content: center; padding-top: 2px; }
.sco__cell {
  display: flex; align-items: center; justify-content: center;
  aspect-ratio: 1.9; border-radius: 8px;
  font-size: 11.5px; font-weight: 800; font-variant-numeric: tabular-nums;
  cursor: default;
}
.sco__cell--void { background: transparent; }

/* see-through */
.sco__through { display: flex; flex-direction: column; gap: 16px; background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 20px 22px; }
.sco__through-label { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; }
.sco__th-item { display: flex; flex-direction: column; gap: 5px; }
.sco__th-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.sco__th-name { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; }
.sco__th-total { color: var(--nu-ink); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.sco__th-bar { display: flex; gap: 2px; height: 9px; border-radius: 999px; overflow: hidden; background: var(--nu-cream-3); }
.sco__th-fill { display: block; height: 100%; }
.sco__th-fill--direct { background: var(--nu-blue); }
.sco__th-fill--etf { background: var(--nu-blue-soft); }
.sco__th-sub { color: var(--nu-gray); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
</style>

<script setup lang="ts">
// Raio-X de ETF (banda branca, no slot onde AcaoFundamentals some pra ETF).
// Quatro blocos a partir da carteira MENSAL da CVM, todos com degradação
// independente (payload ausente → bloco some, nunca placeholder):
//   1. Do que o fundo é feito — barra por tipo + top posições com peso.
//   2. No fim, onde seu dinheiro está — exposição look-through: atravessa os
//      ETFs aninhados até o ativo final e agrega por setor (badge "via X").
//   3. Quanto custa de verdade — taxa de administração + custo efetivo total
//      com as taxas dos fundos investidos ("taxa sobre taxa").
//   4. Com o que ele se move — correlação vs benchmarks (barras divergentes)
//      + matriz N×N dos top holdings (90d/12m).
// Rodapé: ficha cadastral (absorve o antigo AcaoFundInfo, que vira fallback).
// O as_of é SEMPRE visível: carteira CVM é mensal, nunca "posição de hoje".
import type { AcaoEtfXrayVM, EtfXrayMatrix } from '~/types/acao'

const props = defineProps<{ ticker: string; xray: AcaoEtfXrayVM }>()

const HOLDINGS_VISIBLE = 10
const expanded = ref(false)
const visibleHoldings = computed(() =>
  expanded.value ? props.xray.holdings : props.xray.holdings.slice(0, HOLDINGS_VISIBLE),
)
const hiddenCount = computed(() => props.xray.holdings.length - HOLDINGS_VISIBLE)

const period = ref<'12m' | '90d'>('12m')
const corrRows = computed(() => (period.value === '12m' ? props.xray.corr?.rows12 : props.xray.corr?.rows90) ?? [])
const matrix = computed<EtfXrayMatrix | null>(() =>
  (period.value === '12m' ? props.xray.corr?.matrix12 : props.xray.corr?.matrix90) ?? null,
)
const hasCorr = computed(() => !!props.xray.corr)

// Barra de participação relativa ao maior peso (leitura comparativa).
const maxHoldingPct = computed(() => Math.max(1e-6, ...props.xray.holdings.map((h) => h.pct)))
const maxAssetPct = computed(() => Math.max(1e-6, ...props.xray.topAssets.map((h) => h.pct)))

/** Célula da matriz: fundo verde/vermelho com alpha pela magnitude. */
function cellStyle(v: number | null): Record<string, string> {
  if (v == null) return { background: 'var(--nu-hm-empty)', color: 'var(--nu-gray)' }
  const alpha = 0.1 + 0.85 * Math.min(1, Math.abs(v))
  const rgb = v >= 0 ? 'var(--nu-hm-green-rgb)' : 'var(--nu-hm-red-rgb)'
  const ink = Math.abs(v) > 0.55 ? 'var(--nu-white)' : v >= 0 ? 'var(--nu-hm-green-ink)' : 'var(--nu-hm-red-ink)'
  return { background: `rgba(${rgb}, ${alpha})`, color: ink }
}

const nfCell = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <section class="axr">
    <div class="axr__head">
      <div>
        <h2 class="axr__title">Dentro<br>do ETF.</h2>
        <div class="axr__sub">
          Carteira oficial, taxas em cascata e correlações.
        </div>
      </div>
      <div class="axr__meta">
        <NuBadge variant="black" size="card">{{ xray.asOfLabel }}</NuBadge>
        <NuBadge v-if="xray.stale" variant="neutral" size="card">Carteira com mais de 3 meses</NuBadge>
        <span class="axr__count">{{ xray.totalPositions }} posições reportadas à CVM</span>
      </div>
    </div>

    <div v-if="xray.warnings.length" class="axr__warnings">
      <div v-for="w in xray.warnings" :key="w" class="axr__warning">{{ w }}</div>
    </div>

    <!-- 1. Composição direta -->
    <div v-if="xray.compBar.length" class="axr__block">
      <h3 class="axr__block-title">Do que o fundo é feito.</h3>
      <div class="axr__bar">
        <span v-for="s in xray.compBar" :key="s.label" class="axr__bar-seg" :style="{ width: `${s.pct}%`, background: s.color }" />
      </div>
      <div class="axr__legend">
        <span v-for="s in xray.compBar" :key="s.label" class="axr__legend-item">
          <span class="axr__legend-dot" :style="{ background: s.color }" />{{ s.label }} <b>{{ s.pctLabel }}</b>
        </span>
      </div>

      <div class="axr__rows">
        <component
          :is="h.ticker ? 'a' : 'div'"
          v-for="h in visibleHoldings"
          :key="h.rank"
          v-bind="h.ticker ? { href: `/asset/${h.ticker}` } : {}"
          class="axr__row"
          :class="{ 'axr__row--link': h.ticker }"
        >
          <span class="axr__row-rank">{{ h.rank }}</span>
          <span class="axr__row-name">
            <b v-if="h.ticker">{{ h.ticker }}</b>
            <span class="axr__row-sub">{{ h.ticker && h.name !== h.ticker ? h.name : h.name }}</span>
          </span>
          <span class="axr__row-type">{{ h.typeLabel }}</span>
          <span class="axr__row-bar"><span class="axr__row-fill" :style="{ width: `${(h.pct / maxHoldingPct) * 100}%` }" /></span>
          <span class="axr__row-pct">{{ h.pctLabel }}</span>
        </component>
      </div>
      <button v-if="!expanded && hiddenCount > 0" type="button" class="axr__more" @click="expanded = true">
        Ver todas as {{ xray.holdings.length }} posições
      </button>
    </div>

    <!-- 2. Exposição look-through -->
    <div v-if="xray.sectorBar.length || xray.topAssets.length" class="axr__block">
      <h3 class="axr__block-title">No fim, onde seu dinheiro está.</h3>
      <p class="axr__block-sub">
        Atravessando os fundos dentro do fundo até o ativo final — é aqui que concentração escondida aparece.
      </p>
      <template v-if="xray.sectorBar.length">
        <div class="axr__bar">
          <span v-for="s in xray.sectorBar" :key="s.label" class="axr__bar-seg" :style="{ width: `${s.pct}%`, background: s.color }" />
        </div>
        <div class="axr__legend">
          <span v-for="s in xray.sectorBar" :key="s.label" class="axr__legend-item">
            <span class="axr__legend-dot" :style="{ background: s.color }" />{{ s.label }} <b>{{ s.pctLabel }}</b>
          </span>
        </div>
      </template>
      <div v-if="xray.topAssets.length" class="axr__rows">
        <div v-for="a in xray.topAssets" :key="a.rank" class="axr__row">
          <span class="axr__row-rank">{{ a.rank }}</span>
          <span class="axr__row-name">
            <b v-if="a.ticker">{{ a.ticker }}</b>
            <span class="axr__row-sub">{{ a.name }}</span>
            <span v-for="v in a.via" :key="v" class="axr__via">via {{ v }}</span>
          </span>
          <span class="axr__row-type">{{ a.typeLabel }}</span>
          <span class="axr__row-bar"><span class="axr__row-fill axr__row-fill--exp" :style="{ width: `${(a.pct / maxAssetPct) * 100}%` }" /></span>
          <span class="axr__row-pct">{{ a.pctLabel }}</span>
        </div>
      </div>
    </div>

    <!-- 3. Custos em cascata -->
    <div v-if="xray.feeCards.length" class="axr__block">
      <h3 class="axr__block-title">Quanto custa de verdade.</h3>
      <div class="axr__cards">
        <NuMetricCard v-for="c in xray.feeCards" :key="c.label" :card="c" />
      </div>
      <template v-if="xray.feeNested.length">
        <div class="axr__nested-lbl">Taxa sobre taxa: os fundos investidos</div>
        <NuStatList :rows="xray.feeNested" />
      </template>
      <p v-if="xray.feeNote" class="axr__note">{{ xray.feeNote }}</p>
    </div>

    <!-- 4. Correlação -->
    <div v-if="hasCorr" class="axr__block">
      <div class="axr__corr-head">
        <h3 class="axr__block-title">Com o que ele se move.</h3>
        <div class="axr__toggle">
          <button type="button" class="axr__toggle-btn" :class="{ 'axr__toggle-btn--on': period === '12m' }" @click="period = '12m'">12 meses</button>
          <button type="button" class="axr__toggle-btn" :class="{ 'axr__toggle-btn--on': period === '90d' }" @click="period = '90d'">90 dias</button>
        </div>
      </div>

      <div v-if="corrRows.length" class="axr__corr">
        <div v-for="r in corrRows" :key="r.symbol" class="axr__corr-row">
          <span class="axr__corr-sym">{{ r.symbol }}</span>
          <span class="axr__corr-track">
            <span class="axr__corr-mid" />
            <span class="axr__corr-fill" :class="{ 'axr__corr-fill--neg': r.neg }" :style="r.neg ? { right: '50%', width: `${r.magPct / 2}%` } : { left: '50%', width: `${r.magPct / 2}%` }" />
          </span>
          <span class="axr__corr-val" :class="{ 'axr__corr-val--neg': r.neg }">{{ r.corrLabel }}</span>
          <NuTagPill :tag="r.tag" />
        </div>
      </div>

      <div v-if="matrix" class="axr__matrix-wrap">
        <div class="axr__nested-lbl">Correlação entre os maiores ativos do fundo</div>
        <div class="axr__matrix-scroll">
          <table class="axr__matrix">
            <thead>
              <tr>
                <th />
                <th v-for="s in matrix.symbols" :key="s">{{ s }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in matrix.matrix" :key="matrix.symbols[i]">
                <th>{{ matrix.symbols[i] }}</th>
                <td v-for="(v, j) in row" :key="j" :style="cellStyle(v)">
                  {{ v == null ? '—' : nfCell.format(v) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Ficha cadastral (absorve o antigo AcaoFundInfo) -->
    <div v-if="xray.fundInfoRows.length" class="axr__block axr__block--ficha">
      <h3 class="axr__block-title">Ficha do fundo.</h3>
      <NuStatList :rows="xray.fundInfoRows" />
    </div>
  </section>
</template>

<style scoped>
.axr {
  background: var(--nu-white);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.axr__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 26px; flex-wrap: wrap; }
.axr__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.axr__sub { color: var(--nu-gray); font-size: 17px; font-weight: 600; line-height: 1.5; margin-top: 18px; max-width: 460px; }
.axr__meta { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
.axr__count { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }

.axr__warnings { margin-top: 26px; display: flex; flex-direction: column; gap: 8px; }
.axr__warning {
  background: var(--nu-amber-bg); color: var(--nu-amber-text);
  font-size: 14px; font-weight: 700; line-height: 1.5;
  padding: 12px 18px; border-radius: 14px;
}

.axr__block { margin-top: clamp(44px, 5vw, 64px); }
.axr__block--ficha { max-width: 720px; }
.axr__block-title {
  margin: 0; color: var(--nu-ink); font-size: clamp(21px, 2.2vw, 27px);
  font-weight: 800; letter-spacing: -0.02em;
}
.axr__block-sub { color: var(--nu-gray); font-size: 15px; font-weight: 600; line-height: 1.55; margin: 10px 0 0; max-width: 640px; }

.axr__bar { display: flex; height: 14px; border-radius: var(--nu-r-pill); overflow: hidden; gap: 3px; margin-top: 22px; }
.axr__bar-seg { height: 100%; }
.axr__legend { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 14px; }
.axr__legend-item { display: inline-flex; align-items: center; gap: 8px; color: var(--nu-gray-2); font-size: 14px; font-weight: 600; }
.axr__legend-item b { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
.axr__legend-dot { width: 11px; height: 11px; border-radius: 4px; flex-shrink: 0; }

.axr__rows { margin-top: 22px; }
.axr__row {
  display: flex; align-items: center; gap: 14px; padding: 12px 0;
  border-top: 1px solid var(--nu-cream-line); text-decoration: none;
}
.axr__row--link { cursor: pointer; }
.axr__row--link:hover .axr__row-name b { color: var(--nu-blue); }
.axr__row-rank { color: var(--nu-gray); font-size: 13px; font-weight: 800; width: 26px; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.axr__row-name { flex: 1.4; min-width: 0; display: flex; align-items: baseline; gap: 9px; flex-wrap: wrap; }
.axr__row-name b { color: var(--nu-ink); font-size: 15px; font-weight: 800; transition: color .15s; }
.axr__row-sub { color: var(--nu-gray-2); font-size: 13.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.axr__via {
  background: var(--nu-sand-2); color: var(--nu-gray-tag); font-size: 11.5px; font-weight: 800;
  padding: 2px 9px; border-radius: var(--nu-r-pill); white-space: nowrap;
}
.axr__row-type { color: var(--nu-gray); font-size: 12.5px; font-weight: 700; width: 118px; flex-shrink: 0; }
.axr__row-bar { flex: 1; height: 6px; background: var(--nu-cream-2); border-radius: var(--nu-r-pill); overflow: hidden; min-width: 70px; }
.axr__row-fill { display: block; height: 100%; background: var(--nu-blue); border-radius: var(--nu-r-pill); }
.axr__row-fill--exp { background: var(--nu-alloc-fixed); }
.axr__row-pct { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; min-width: 62px; text-align: right; font-variant-numeric: tabular-nums; }

.axr__more {
  margin-top: 18px; display: inline-flex; align-items: center; border: none; font-family: inherit;
  background: var(--nu-sand-2); color: var(--nu-gray-2); font-size: 14px; font-weight: 800;
  padding: 11px 22px; border-radius: var(--nu-r-pill); cursor: pointer; transition: background .2s;
}
.axr__more:hover { background: var(--nu-sand-hover); }

.axr__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); gap: 14px; margin-top: 22px; max-width: 640px; }
.axr__nested-lbl { color: var(--nu-gray); font-size: 12.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; margin-top: 26px; }
.axr__note { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.55; margin: 14px 0 0; max-width: 640px; }

.axr__corr-head { display: flex; align-items: center; justify-content: space-between; gap: 18px; flex-wrap: wrap; }
.axr__toggle { display: inline-flex; background: var(--nu-cream); border-radius: var(--nu-r-pill); padding: 4px; }
.axr__toggle-btn {
  border: none; font-family: inherit; background: transparent; color: var(--nu-gray);
  font-size: 13.5px; font-weight: 800; padding: 8px 16px; border-radius: var(--nu-r-pill); cursor: pointer;
}
.axr__toggle-btn--on { background: var(--nu-ink); color: var(--nu-white); }

.axr__corr { margin-top: 22px; max-width: 760px; }
.axr__corr-row { display: flex; align-items: center; gap: 14px; padding: 10px 0; border-top: 1px solid var(--nu-cream-line); }
.axr__corr-sym { color: var(--nu-ink); font-size: 14px; font-weight: 800; width: 72px; flex-shrink: 0; }
.axr__corr-track { position: relative; flex: 1; height: 10px; background: var(--nu-cream-2); border-radius: var(--nu-r-pill); }
.axr__corr-mid { position: absolute; left: 50%; top: -3px; bottom: -3px; width: 2px; background: var(--nu-sand); border-radius: 1px; }
.axr__corr-fill { position: absolute; top: 0; bottom: 0; background: var(--nu-hm-green); border-radius: var(--nu-r-pill); }
.axr__corr-fill--neg { background: var(--nu-red); }
.axr__corr-val { color: var(--nu-ink); font-size: 14px; font-weight: 800; min-width: 52px; text-align: right; font-variant-numeric: tabular-nums; }
.axr__corr-val--neg { color: var(--nu-red); }

.axr__matrix-wrap { margin-top: 8px; }
.axr__matrix-scroll { overflow-x: auto; margin-top: 14px; }
.axr__matrix { border-collapse: separate; border-spacing: 3px; min-width: 640px; }
.axr__matrix th {
  color: var(--nu-gray); font-size: 11.5px; font-weight: 800; text-align: center;
  padding: 6px 8px; white-space: nowrap;
}
.axr__matrix tbody th { text-align: right; }
.axr__matrix td {
  font-size: 12px; font-weight: 800; text-align: center; padding: 9px 8px;
  border-radius: 8px; font-variant-numeric: tabular-nums; min-width: 56px;
}

@media (max-width: 720px) {
  .axr__row-type { display: none; }
  .axr__row-bar { min-width: 50px; }
  .axr__meta { align-items: flex-start; }
}
</style>

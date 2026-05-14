<!--
  RankingUiList: lista editorial full-width pra posições #2 a #N.
  Mais leve que a tabela completa (MoleculesRankingTable). Bom pra previews ou
  páginas onde o usuário já viu a tabela acima e só precisa de uma referência rápida.
  Slots: eyebrow (label), title (H2 com em). Props: rows, valueLabel, valueUnit, valueDecimals.
-->
<template>
  <section class="rk-list-section">
    <header v-if="$slots.eyebrow || $slots.title" class="rk-list-head">
      <p v-if="$slots.eyebrow" class="rk-list-eyebrow">
        <slot name="eyebrow" />
      </p>
      <h2 v-if="$slots.title" class="rk-list-title">
        <slot name="title" />
      </h2>
    </header>

    <ol class="rk-list">
      <li v-for="row in rows" :key="row.ticker" class="rk-row">
        <div class="rk-row-rank">{{ String(row.rank).padStart(2, '0') }}</div>
        <div class="rk-row-main">
          <p class="rk-row-ticker">{{ row.ticker }}</p>
          <p v-if="row.name || row.sector" class="rk-row-name">
            <span v-if="row.name">{{ row.name }}</span>
            <span v-if="row.name && row.sector"> · </span>
            <span v-if="row.sector">{{ row.sector }}</span>
          </p>
        </div>
        <div class="rk-row-value">
          <p class="rk-row-value-val">{{ formatValue(row.value) }}{{ valueUnit }}</p>
          <p v-if="valueLabel" class="rk-row-value-label">{{ valueLabel }}</p>
        </div>
        <div v-if="row.price !== undefined || row.change12m !== undefined" class="rk-row-aux">
          <p v-if="row.price !== undefined" class="rk-row-price">{{ formatBRL(row.price) }}</p>
          <p v-if="row.change12m !== undefined" :class="['rk-row-change', row.change12m >= 0 ? 'positive' : 'negative']">
            {{ row.change12m >= 0 ? '+' : '' }}{{ row.change12m.toFixed(1) }}% / 12m
          </p>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
export type RankingListRow = {
  rank: number
  ticker: string
  name?: string
  sector?: string
  value: number
  price?: number
  change12m?: number
}

const props = withDefaults(
  defineProps<{
    rows: RankingListRow[]
    valueLabel?: string
    valueUnit?: string
    valueDecimals?: number
  }>(),
  {
    valueLabel: 'DY 12m',
    valueUnit: '%',
    valueDecimals: 1,
  }
)

function formatValue(v: number) {
  return v.toFixed(props.valueDecimals)
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>

<style scoped>
.rk-list-section {
  position: relative;
  z-index: 1;
  padding: 64px 24px 96px;
  border-top: 1px solid var(--border-subtle);
  max-width: 1200px;
  margin: 0 auto;
}
@media (min-width: 768px) { .rk-list-section { padding: 80px 32px 120px; } }
@media (min-width: 1024px) { .rk-list-section { padding: 96px 56px 120px; } }

.rk-list-head { margin-bottom: 32px; max-width: 720px; }
.rk-list-eyebrow {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
  margin: 0 0 12px;
}
.rk-list-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 300;
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  margin: 0;
}
.rk-list-title :deep(em) {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}

.rk-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.rk-row {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 22px 0;
  border-bottom: 1px solid var(--border-subtle);
  transition: background 150ms;
}
@media (min-width: 768px) {
  .rk-row {
    grid-template-columns: 64px 1fr 140px 160px;
    gap: 28px;
    padding: 24px 8px;
    border-radius: 6px;
  }
  .rk-row:hover { background: color-mix(in srgb, var(--brand-primary) 4%, transparent); }
}
.rk-row:last-child { border-bottom: none; }

.rk-row-rank {
  font-size: clamp(22px, 2vw, 30px);
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
  letter-spacing: -0.02em;
  line-height: 1;
}
.rk-row-ticker {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-heading);
  margin: 0;
  letter-spacing: -0.012em;
}
.rk-row-name { font-size: 12px; color: var(--text-muted); margin: 2px 0 0; }

.rk-row-value { text-align: right; }
.rk-row-value-val {
  font-size: 24px;
  font-weight: 300;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--brand-primary);
  margin: 0;
  line-height: 1;
}
.rk-row-value-label {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 4px 0 0;
}

.rk-row-aux { display: none; }
@media (min-width: 768px) { .rk-row-aux { display: block; text-align: right; } }
.rk-row-price {
  font-size: 14px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--text-heading);
  margin: 0;
}
.rk-row-change {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  margin: 2px 0 0;
}
.rk-row-change.positive { color: var(--brand-positive); }
.rk-row-change.negative { color: var(--brand-negative); }
</style>

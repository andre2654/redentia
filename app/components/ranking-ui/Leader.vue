<!--
  RankingUiLeader: spotlight do #1 (lado direito do split V5).
  Badge + asset + valor mega (DY/ROE/etc) + chart + strip de métricas (preço, 30d, 12m).
  Props: ticker, name, sector, value, valueLabel, valueUnit, valueDecimals, price, change30d, change12m, sparkline, rankLabel, trophyIcon, showTrophy.
-->
<template>
  <div class="rk-leader">
    <div class="rk-leader-meta">
      <span class="rk-leader-rank">
        <UIcon v-if="showTrophy" :name="trophyIcon" class="size-3.5" />
        {{ rankLabel }}
      </span>
      <span v-if="sector" class="rk-leader-sector">{{ sector }}</span>
    </div>

    <div class="rk-leader-asset">
      <div class="rk-leader-logo">
        <NuxtImg v-if="logo" :src="logo" :alt="`${ticker} logo`" class="rk-leader-logo-img" />
        <span v-else>{{ ticker.slice(0, 2) }}</span>
      </div>
      <div>
        <p class="rk-leader-ticker">{{ ticker }}</p>
        <p v-if="name" class="rk-leader-name">{{ name }}</p>
      </div>
    </div>

    <p v-if="valueLabel" class="rk-leader-value-label">{{ valueLabel }}</p>
    <p class="rk-leader-value">
      {{ formatValue(value) }}<span>{{ valueUnit }}</span>
    </p>

    <div v-if="sparkline && sparkline.length > 1" class="rk-leader-chart">
      <RankingUiSparkline
        :data="sparkline"
        :width="600"
        :height="140"
        :direction="chartDirection"
        with-gradient
      />
    </div>

    <div v-if="stripItems && stripItems.length" :class="['rk-leader-strip', `rk-leader-strip--${stripItems.length}`]">
      <div v-for="item in stripItems" :key="item.label">
        <p class="rk-strip-label">{{ item.label }}</p>
        <p :class="['rk-strip-val', item.tone || 'heading']">{{ item.value }}</p>
      </div>
    </div>
    <div v-else-if="hasStrip" class="rk-leader-strip">
      <div v-if="price !== undefined">
        <p class="rk-strip-label">Preço</p>
        <p class="rk-strip-val heading">{{ formatBRL(price) }}</p>
      </div>
      <div v-if="change30d !== undefined">
        <p class="rk-strip-label">30D</p>
        <p :class="['rk-strip-val', change30d >= 0 ? 'positive' : 'negative']">
          {{ change30d >= 0 ? '+' : '' }}{{ change30d.toFixed(1) }}%
        </p>
      </div>
      <div v-if="change12m !== undefined">
        <p class="rk-strip-label">12M</p>
        <p :class="['rk-strip-val', change12m >= 0 ? 'positive' : 'negative']">
          {{ change12m >= 0 ? '+' : '' }}{{ change12m.toFixed(1) }}%
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    rankLabel?: string
    trophyIcon?: string
    showTrophy?: boolean
    sector?: string
    ticker: string
    name?: string
    logo?: string
    value: number
    valueLabel?: string
    valueUnit?: string
    valueDecimals?: number
    /**
     * 'number' (padrão): aplica toFixed(decimals). Bom pra %, P/L, score.
     * 'compactNumber': aplica sufixo K/M/B/T (igual tabela). Use pra
     * market cap, receita, lucro, caixa.
     * 'compactBrl': mesmo que compactNumber mas com prefixo "R$".
     */
    valueFormat?: 'number' | 'compactNumber' | 'compactBrl'
    price?: number
    change30d?: number
    change12m?: number
    sparkline?: number[]
    /**
     * Strip customizado: array de items {label, value, tone?}. Sobrescreve
     * o strip default (Preço/30D/12M). Tones aceitos: heading | positive |
     * negative. Suporta 2 ou 3 items.
     */
    stripItems?: Array<{ label: string; value: string; tone?: 'heading' | 'positive' | 'negative' }>
  }>(),
  {
    rankLabel: '#1 da bolsa',
    trophyIcon: 'i-lucide-trophy',
    showTrophy: true,
    valueUnit: '%',
    valueDecimals: 1,
    valueFormat: 'number',
  }
)

const chartDirection = computed<'positive' | 'negative'>(() =>
  (props.change12m ?? 0) >= 0 ? 'positive' : 'negative'
)

const hasStrip = computed(
  () => props.price !== undefined || props.change30d !== undefined || props.change12m !== undefined
)

function formatValue(v: number) {
  if (props.valueFormat === 'compactNumber' || props.valueFormat === 'compactBrl') {
    const prefix = props.valueFormat === 'compactBrl' ? 'R$ ' : ''
    const abs = Math.abs(v)
    const sign = v < 0 ? '-' : ''
    if (abs >= 1e12) return `${sign}${prefix}${(abs / 1e12).toFixed(1)}T`
    if (abs >= 1e9) return `${sign}${prefix}${(abs / 1e9).toFixed(1)}B`
    if (abs >= 1e6) return `${sign}${prefix}${(abs / 1e6).toFixed(1)}M`
    if (abs >= 1e3) return `${sign}${prefix}${(abs / 1e3).toFixed(1)}K`
    return `${sign}${prefix}${abs.toLocaleString('pt-BR')}`
  }
  return v.toFixed(props.valueDecimals)
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>

<style scoped>
.rk-leader-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.rk-leader-rank {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 15%, transparent);
  color: var(--brand-primary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.rk-leader-sector {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.rk-leader-asset {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}
.rk-leader-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 10px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  font-size: 15px;
  font-weight: 700;
  color: var(--brand-primary);
  font-family: ui-monospace, monospace;
  overflow: hidden;
  flex-shrink: 0;
}
.rk-leader-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rk-leader-ticker {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
  letter-spacing: -0.018em;
}
.rk-leader-name {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.rk-leader-value-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0 0 8px;
}
.rk-leader-value {
  font-size: clamp(56px, 9vw, 120px);
  font-weight: 300;
  line-height: 0.95;
  letter-spacing: -0.05em;
  font-variant-numeric: tabular-nums;
  color: var(--brand-primary);
  margin: 0;
  text-shadow: 0 14px 60px color-mix(in srgb, var(--brand-primary) 22%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rk-leader-value span {
  font-size: 0.4em;
  font-weight: 400;
  letter-spacing: -0.02em;
}

.rk-leader-chart {
  height: 120px;
  margin: 28px 0 24px;
}

.rk-leader-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding-top: 20px;
  border-top: 1px solid var(--border-subtle);
}
.rk-leader-strip--2 { grid-template-columns: repeat(2, 1fr); }
.rk-leader-strip--3 { grid-template-columns: repeat(3, 1fr); }
.rk-leader-strip > div { padding: 0 10px; }
.rk-leader-strip > div:first-child { padding-left: 0; }
.rk-leader-strip > div + div { border-left: 1px solid var(--border-subtle); }
.rk-strip-label {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0 0 4px;
}
.rk-strip-val {
  font-size: 16px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--text-heading);
  margin: 0;
}
.rk-strip-val.heading { color: var(--text-heading); }
.rk-strip-val.positive { color: var(--brand-positive); }
.rk-strip-val.negative { color: var(--brand-negative); }
</style>

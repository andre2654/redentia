<!--
  MoleculesResultadoDayTradeIntradayCurve — equity curve por trade.

  Diferente da curva da Carteira (dia a dia), aqui cada PONTO da curva
  e um TRADE fechado, no horario exato em que fechou. Em "Hoje", isso
  vira uma curva intraday natural (10h-17h). Em "Semana"/"Mês", vira
  uma curva equity por trade ordenada cronologicamente.

  Usa o mesmo `<AtomsGraphLine>` (Chart.js) com `showPrevClose=false`
  pra reaproveitar todo o stack visual. Eixo X mostra timestamps
  HH:MM no formato curto.

  Markers: trades de magnitude excepcional (top 5 por |resultAmount|).
  Highlights: best/worst trade icons.
-->
<template>
  <article class="dt-curve" :style="cardStyle">
    <header class="dt-curve__head">
      <div class="dt-curve__head-left">
        <span class="dt-curve__eyebrow">Curva intraday</span>
        <span class="dt-curve__sub">{{ subtitle }}</span>
      </div>
      <div class="dt-curve__head-right">
        <span
          v-if="stats.count > 0"
          class="dt-curve__end-value tabular-nums"
          :style="{ color: endValueColor }"
        >{{ endValueLabel }}</span>
        <span class="dt-curve__count tabular-nums">
          {{ stats.count }} {{ stats.count === 1 ? 'trade' : 'trades' }}
        </span>
      </div>
    </header>

    <div v-if="!chartData.length" class="dt-curve__empty">
      <UIcon name="i-lucide-activity" class="size-6 opacity-40" :style="{ color: brand.colors.text }" />
      <span>Sem operações no período.</span>
    </div>

    <AtomsGraphLine
      v-else
      :data="chartData"
      :legend="chartLegend"
      :colors="[lineColor]"
      :height="280"
      :show-prev-close="false"
      :markers="markers"
    />
  </article>
</template>

<script setup lang="ts">
import type { DayTradeStats, DayTradePeriod } from '~/composables/useDayTradeStats'

const props = defineProps<{
  stats: DayTradeStats
  period: DayTradePeriod
}>()

const brand = useBrand()
const { brl } = useFormat()

// ============ Adapter pro AtomsGraphLine ============
// Cada ponto da equity curve tem `iso` (timestamp do close) e
// `cumulativePnl`. AtomsGraphLine espera { date, value, timestamp }.
// O `date` aqui deve ser unico por ponto pra que o Chart.js plote
// cada trade num ponto distinto. Em "Hoje" varios trades podem ter
// mesma data ISO (so HH:MM diferentes). Pra evitar collision, usamos
// o ISO completo como `date`.
const chartData = computed(() =>
  props.stats.equityCurve.map((p) => ({
    date: p.iso,
    value: p.cumulativePnl,
    timestamp: new Date(p.iso).getTime(),
  })),
)

const lastValue = computed(() =>
  props.stats.equityCurve.length
    ? props.stats.equityCurve[props.stats.equityCurve.length - 1].cumulativePnl
    : 0,
)

const lineColor = computed(() => {
  if (lastValue.value > 0) return brand.colors.positive
  if (lastValue.value < 0) return brand.colors.negative
  return brand.colors.text
})

const endValueColor = computed(() => lineColor.value)

const endValueLabel = computed(() => {
  if (props.stats.count === 0) return '—'
  const sign = lastValue.value >= 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(lastValue.value))}`
})

const subtitle = computed(() => {
  if (props.period === 'hoje') return 'P&L acumulado por trade'
  if (props.period === 'semana') return '7 dias · cada ponto = 1 trade'
  return '30 dias · cada ponto = 1 trade'
})

const chartLegend = computed(() => [
  {
    label: 'P&L acumulado',
    color: lineColor.value,
    value: endValueLabel.value,
  },
])

// ============ Markers: trades excepcionais ============
// Top 5 por magnitude absoluta. Cada um vira um pin clicavel com
// titulo descritivo (ticker + sinal + qty/preco). User passa mouse,
// abre popover, sabe exatamente qual trade puxou a sessao pra cima
// ou pra baixo.
interface ChartMarker {
  date: string
  title: string
  changePercent: number
}

const markers = computed<ChartMarker[]>(() => {
  if (!props.stats.equityCurve.length) return []
  const sorted = [...props.stats.equityCurve].sort(
    (a, b) => Math.abs(b.tradePnl) - Math.abs(a.tradePnl),
  )
  const top = sorted.slice(0, 5).filter((p) => Math.abs(p.tradePnl) > 0)

  return top.map((p) => ({
    date: p.iso,
    title: titleForTrade(p.ticker, p.tradePnl),
    // % aproximado: trade isolado / |total| da sessao. Cai pra 100/-100
    // se o total for zero (caso degenerado, raro).
    changePercent:
      props.stats.totalPnL !== 0
        ? (p.tradePnl / Math.abs(props.stats.totalPnL)) * 100
        : (p.tradePnl > 0 ? 100 : -100),
  }))
})

function titleForTrade(ticker: string, pnl: number): string {
  const isWin = pnl > 0
  const verb = isWin ? 'Ganho' : 'Perda'
  const value = brl(Math.abs(pnl))
  return `${verb} de ${value} em ${ticker}`
}

const cardStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  boxShadow: `0 8px 22px -16px color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
}))
</script>

<style scoped>
.dt-curve {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid;
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
}

.dt-curve::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary) 8%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.dt-curve__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  position: relative;
  flex-wrap: wrap;
}

.dt-curve__head-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dt-curve__eyebrow {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.dt-curve__sub {
  font-size: 11.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dt-curve__head-right {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.dt-curve__end-value {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
}

.dt-curve__count {
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dt-curve__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 200px;
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
</style>

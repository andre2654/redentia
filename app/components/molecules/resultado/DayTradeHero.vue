<!--
  MoleculesResultadoDayTradeHero — foto do P&L da janela operacional.

  Voca­bulario visual day-trade:
    - Surface mais escurecida (mix surface + text 18%)
    - Monospace dominante, weight 500
    - Numero gigante em font-mono-tab pra alinhamento vertical em
      colunas de digitos
    - Live indicator pulsante quando mercado aberto (10h-17h weekday)
    - Sparkline intraday a direita mostrando equity curve por trade

  Filosofia: dois modos coexistindo no resultado precisam transmitir
  registros diferentes. Carteira e editorial; Day-trade e terminal.
  Aqui aplicamos isso via cor, tipografia e densidade.
-->
<template>
  <header class="dt-hero" :style="containerStyle">
    <div class="dt-hero__main">
      <!-- Eyebrow + period + live indicator -->
      <div class="dt-hero__top">
        <span
          class="dt-hero__eyebrow"
          :style="{ color: brand.colors.primary }"
        >Sessão · {{ periodLabel }}</span>

        <span
          v-if="marketOpen"
          class="dt-hero__live"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 14%, transparent)`,
            color: brand.colors.positive,
            borderColor: `color-mix(in srgb, ${brand.colors.positive} 40%, transparent)`,
          }"
        >
          <span
            class="dt-hero__live-dot"
            :style="{ backgroundColor: brand.colors.positive }"
          />
          PREGÃO ABERTO
        </span>
        <span
          v-else
          class="dt-hero__live"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.text} 8%, transparent)`,
            color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)`,
            borderColor: `color-mix(in srgb, ${brand.colors.text} 18%, transparent)`,
          }"
        >
          <span
            class="dt-hero__live-dot"
            :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
          />
          PREGÃO FECHADO
        </span>
      </div>

      <!-- Numero hero -->
      <div class="dt-hero__amount-row">
        <span
          class="dt-hero__amount tabular-nums"
          :style="{ color: amountColor }"
        >{{ amountLabel }}</span>
        <span
          v-if="stats.count > 0"
          class="dt-hero__delta-pill tabular-nums"
          :style="{
            backgroundColor: `color-mix(in srgb, ${amountColor} 16%, transparent)`,
            color: amountColor,
          }"
        >{{ pctLabel }}</span>
      </div>

      <!-- Breakdown bar inline. Tipo "Bloomberg ticker tape" — labels
           mono uppercase + valores tabulares, separados por bullet. -->
      <div class="dt-hero__breakdown">
        <span class="dt-hero__chip">
          <span class="dt-hero__chip-label">Trades</span>
          <span class="dt-hero__chip-value tabular-nums" :style="{ color: brand.colors.text }">
            {{ stats.count }}
          </span>
        </span>
        <span class="dt-hero__sep" aria-hidden="true">·</span>
        <span class="dt-hero__chip">
          <span class="dt-hero__chip-label">WR</span>
          <span class="dt-hero__chip-value tabular-nums" :style="{ color: winRateColor }">
            {{ winRateLabel }}
          </span>
        </span>
        <span class="dt-hero__sep" aria-hidden="true">·</span>
        <span class="dt-hero__chip">
          <span class="dt-hero__chip-label">R$/trade</span>
          <span class="dt-hero__chip-value tabular-nums" :style="{ color: amountColor }">
            {{ avgPerTradeLabel }}
          </span>
        </span>
        <span class="dt-hero__sep" aria-hidden="true">·</span>
        <span class="dt-hero__chip">
          <span class="dt-hero__chip-label">DD máx</span>
          <span class="dt-hero__chip-value tabular-nums" :style="{ color: brand.colors.negative }">
            {{ drawdownLabel }}
          </span>
        </span>
      </div>
    </div>

    <!-- Sparkline intraday/equity curve em SVG simples. Renderiza so
         se ha pelo menos 2 trades pra desenhar uma linha (1 ponto =
         linha de zero pixels). -->
    <div v-if="sparkPoints.length >= 2" class="dt-hero__spark">
      <svg
        :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`"
        preserveAspectRatio="none"
        class="dt-hero__spark-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient :id="sparkGradId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="amountColor" stop-opacity="0.32" />
            <stop offset="100%" :stop-color="amountColor" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path :d="sparkAreaPath" :fill="`url(#${sparkGradId})`" />
        <path
          :d="sparkLinePath"
          fill="none"
          :stroke="amountColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!-- End-marker pulsing pra reforcar "vivo" -->
        <circle
          :cx="sparkLastPoint.x"
          :cy="sparkLastPoint.y"
          r="3.2"
          :fill="amountColor"
        />
      </svg>
      <span class="dt-hero__spark-label">{{ sparkSubtitle }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { DayTradeStats, DayTradePeriod } from '~/composables/useDayTradeStats'
import { isMarketOpen } from '~/composables/useDayTradeStats'

const props = defineProps<{
  stats: DayTradeStats
  period: DayTradePeriod
}>()

const brand = useBrand()
const { brl } = useFormat()

// Mercado aberto e estado reativo: se o user deixar a pagina aberta
// passando das 17h, o badge fica de "fechado" no proximo render.
// Reactividade triggered pelo refresh manual do user (toggle de
// period etc) — tick automatico fica pra quando rodarmos polling.
const marketOpen = computed(() => isMarketOpen())

const periodLabel = computed(() => {
  const labels: Record<DayTradePeriod, string> = {
    hoje: 'Hoje',
    semana: 'Últimos 7 dias',
    mes: 'Últimos 30 dias',
  }
  return labels[props.period]
})

const amountColor = computed(() => {
  if (props.stats.totalPnL > 0) return brand.colors.positive
  if (props.stats.totalPnL < 0) return brand.colors.negative
  return `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`
})

const amountLabel = computed(() => {
  if (props.stats.count === 0) return '—'
  const sign = props.stats.totalPnL >= 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(props.stats.totalPnL))}`
})

const pctLabel = computed(() => {
  if (props.stats.totalVolume === 0) return ''
  const pct = (props.stats.totalPnL / props.stats.totalVolume) * 100
  if (!Number.isFinite(pct)) return ''
  const sign = pct >= 0 ? '+' : '−'
  return `${sign}${Math.abs(pct).toFixed(2).replace('.', ',')}% sobre volume`
})

const winRateLabel = computed(() => {
  if (props.stats.wins + props.stats.losses === 0) return '—'
  return `${(props.stats.winRate * 100).toFixed(1).replace('.', ',')}%`
})

const winRateColor = computed(() => {
  if (props.stats.wins + props.stats.losses === 0) return brand.colors.text
  if (props.stats.winRate >= 0.6) return brand.colors.positive
  if (props.stats.winRate >= 0.5) return brand.colors.primary
  return brand.colors.negative
})

const avgPerTradeLabel = computed(() => {
  if (props.stats.count === 0) return '—'
  const sign = props.stats.avgPerTrade >= 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(props.stats.avgPerTrade))}`
})

const drawdownLabel = computed(() => {
  if (props.stats.maxDrawdown === 0) return '—'
  return `−${brl(props.stats.maxDrawdown)}`
})

// ============ Sparkline ============
const SPARK_W = 240
const SPARK_H = 80
const SPARK_PAD = 6
const sparkGradId = `dt-hero-spark-${Math.random().toString(36).slice(2, 8)}`

const sparkPoints = computed(() => {
  const series = props.stats.equityCurve
  if (series.length < 2) return []
  const min = Math.min(0, ...series.map((p) => p.cumulativePnl))
  const max = Math.max(0, ...series.map((p) => p.cumulativePnl))
  const range = max - min || 1
  const usableH = SPARK_H - SPARK_PAD * 2
  return series.map((p, i) => ({
    x: (i / (series.length - 1)) * SPARK_W,
    y: SPARK_PAD + (1 - (p.cumulativePnl - min) / range) * usableH,
  }))
})

const sparkLinePath = computed(() => {
  if (!sparkPoints.value.length) return ''
  return sparkPoints.value
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
})

const sparkAreaPath = computed(() => {
  if (!sparkPoints.value.length) return ''
  const path = sparkPoints.value
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
  const last = sparkPoints.value[sparkPoints.value.length - 1]
  const first = sparkPoints.value[0]
  return `${path} L ${last.x.toFixed(2)} ${SPARK_H} L ${first.x.toFixed(2)} ${SPARK_H} Z`
})

const sparkLastPoint = computed(() =>
  sparkPoints.value[sparkPoints.value.length - 1] || { x: 0, y: 0 },
)

const sparkSubtitle = computed(() => {
  if (props.stats.count === 0) return 'Sem operações'
  if (props.period === 'hoje') return 'Curva do dia'
  return 'Equity por trade'
})

const containerStyle = computed(() => ({
  // Mesma receita visual da Carteira: brand surface, border padrao,
  // box-shadow leve em primary (amber). A "agressividade" sutil do
  // modo Day Trade vem de monospace + pulsing dots, nao de
  // background fill ou edge bar.
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  boxShadow: `0 8px 22px -16px color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`,
}))
</script>

<style scoped>
.dt-hero {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid;
  padding: 20px 24px;
  display: flex;
  align-items: stretch;
  gap: 24px;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
}

.dt-hero::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary) 7%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.dt-hero__main {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  min-width: 0;
}

.dt-hero__top {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.dt-hero__eyebrow {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.dt-hero__live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.dt-hero__live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: dt-hero-pulse 1.6s ease-in-out infinite;
}

@keyframes dt-hero-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

.dt-hero__amount-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
}

.dt-hero__amount {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: clamp(40px, 6vw, 56px);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -1.5px;
  font-variant-numeric: tabular-nums;
}

.dt-hero__delta-pill {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: -0.005em;
}

.dt-hero__breakdown {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.dt-hero__chip {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
}

.dt-hero__chip-label {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dt-hero__chip-value {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
}

.dt-hero__sep {
  color: color-mix(in srgb, var(--brand-text) 25%, transparent);
  font-size: 13px;
  user-select: none;
}

.dt-hero__spark {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  flex: 0 0 240px;
  align-self: center;
}

.dt-hero__spark-svg {
  width: 240px;
  height: 80px;
  display: block;
}

.dt-hero__spark-label {
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  text-align: right;
}

@media (max-width: 720px) {
  .dt-hero {
    flex-direction: column;
    gap: 16px;
  }
  .dt-hero__spark {
    flex: 0 0 auto;
    width: 100%;
  }
  .dt-hero__spark-svg {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dt-hero__live-dot {
    animation: none;
    opacity: 1;
  }
}
</style>

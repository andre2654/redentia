<!--
  MoleculesResultadoCarteiraMetrics — KPIs operacionais com hierarquia.

  Refatorado pra ter HIERARQUIA visual em vez de 6 cards iguais:
    Top row: 2 cards "hero" (Win rate + Profit factor) — maiores,
             com mini-gauge visual e contexto rico
    Bottom row: 4 cards mini (Avg W/L · Best · Worst · vs Benchmarks)

  Win rate ganhou um arco SVG pra visualizar a porcentagem (igual
  Snowflake mas em arco unico). Profit factor ganhou uma barra
  horizontal mostrando "ganhos vs perdas" pra contextualizar o numero.
  Cards mini seguem o mesmo radial gradient ambiente.

  Volume operado + margem media ficam em footer textual NO TOPO da
  proxima section — mantida a UX de leverage (notional como contexto).
-->
<template>
  <div class="flex flex-col gap-4">
    <!-- ============ HERO ROW: Win rate + Profit factor ============ -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Win rate card -->
      <article class="metric-hero" :style="cardStyle">
        <header class="metric-hero__head">
          <span class="metric-hero__eyebrow">Taxa de acerto</span>
          <span class="metric-hero__count">
            {{ stats.wins + stats.losses }} {{ stats.wins + stats.losses === 1 ? 'op' : 'ops' }}
          </span>
        </header>

        <div class="metric-hero__body">
          <!-- Arco SVG visualizando o win rate. Stroke colorido por
               magnitude (>60 verde claro, 50-60 amber, <50 vermelho). -->
          <svg viewBox="0 0 120 80" class="metric-hero__gauge">
            <!-- Background arc -->
            <path
              d="M 12 70 A 48 48 0 0 1 108 70"
              fill="none"
              :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`"
              stroke-width="8"
              stroke-linecap="round"
            />
            <!-- Active arc (stroke-dasharray drives progress) -->
            <path
              d="M 12 70 A 48 48 0 0 1 108 70"
              fill="none"
              :stroke="winRateColor"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="`${winRateArcLen} 200`"
              class="metric-hero__gauge-fill"
            />
            <!-- Center value -->
            <text
              x="60" y="60"
              text-anchor="middle"
              class="metric-hero__gauge-text"
              :fill="brand.colors.text"
            >{{ winRateValueText }}</text>
          </svg>

          <div class="metric-hero__details">
            <div class="metric-hero__detail-row">
              <span
                class="metric-hero__detail-dot"
                :style="{ backgroundColor: brand.colors.positive }"
              />
              <span class="metric-hero__detail-label">Ganhos</span>
              <span
                class="metric-hero__detail-value tabular-nums"
                :style="{ color: brand.colors.text }"
              >{{ stats.wins }}</span>
            </div>
            <div class="metric-hero__detail-row">
              <span
                class="metric-hero__detail-dot"
                :style="{ backgroundColor: brand.colors.negative }"
              />
              <span class="metric-hero__detail-label">Perdas</span>
              <span
                class="metric-hero__detail-value tabular-nums"
                :style="{ color: brand.colors.text }"
              >{{ stats.losses }}</span>
            </div>
            <p class="metric-hero__hint">{{ winRateHint }}</p>
          </div>
        </div>
      </article>

      <!-- Profit factor card -->
      <article class="metric-hero" :style="cardStyle">
        <header class="metric-hero__head">
          <span class="metric-hero__eyebrow">Profit factor</span>
          <span class="metric-hero__count">{{ pfQualifier }}</span>
        </header>

        <div class="metric-hero__body">
          <div class="metric-hero__pf">
            <span
              class="metric-hero__pf-value tabular-nums"
              :style="{ color: pfColor }"
            >{{ pfValueText }}</span>
            <span class="metric-hero__pf-suffix">×</span>
          </div>

          <div class="metric-hero__details">
            <!-- Mini-bar mostrando "ganhos brutos vs perdas brutas" -->
            <div class="metric-hero__pf-bar-wrap">
              <span class="metric-hero__pf-bar-label">
                <span :style="{ color: brand.colors.positive }">{{ formatBRL(grossProfit) }}</span>
                <span :style="{ color: `color-mix(in srgb, ${brand.colors.text} 35%, transparent)` }">vs</span>
                <span :style="{ color: brand.colors.negative }">{{ formatBRL(grossLoss) }}</span>
              </span>
              <div
                class="metric-hero__pf-bar"
                :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 6%, transparent)` }"
              >
                <span
                  class="metric-hero__pf-bar-fill"
                  :style="{
                    width: `${pfBarPositiveWidth}%`,
                    backgroundColor: brand.colors.positive,
                  }"
                />
                <span
                  class="metric-hero__pf-bar-fill"
                  :style="{
                    width: `${pfBarNegativeWidth}%`,
                    backgroundColor: brand.colors.negative,
                  }"
                />
              </div>
            </div>
            <p class="metric-hero__hint">{{ pfHint }}</p>
          </div>
        </div>
      </article>
    </div>

    <!-- ============ MINI ROW: Avg W/L · Best · Worst · vs Benchmarks ============ -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Avg ganho/perda + R:R -->
      <article class="metric-mini" :style="cardStyle">
        <span class="metric-mini__eyebrow">Média ganho · perda</span>
        <div class="metric-mini__inline">
          <span
            class="metric-mini__value tabular-nums"
            :style="{ color: brand.colors.positive }"
          >{{ avgWinLabel }}</span>
          <span
            class="metric-mini__sep"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 35%, transparent)` }"
            aria-hidden="true"
          >/</span>
          <span
            class="metric-mini__value tabular-nums"
            :style="{ color: brand.colors.negative }"
          >{{ avgLossLabel }}</span>
        </div>
        <span class="metric-mini__hint">{{ rrHint }}</span>
      </article>

      <!-- Maior ganho -->
      <article class="metric-mini" :style="cardStyle">
        <span class="metric-mini__eyebrow">Maior ganho</span>
        <span
          class="metric-mini__value tabular-nums"
          :style="{ color: brand.colors.positive }"
        >{{ bestLabel }}</span>
        <span class="metric-mini__hint">{{ bestHint }}</span>
      </article>

      <!-- Maior perda -->
      <article class="metric-mini" :style="cardStyle">
        <span class="metric-mini__eyebrow">Maior perda</span>
        <span
          class="metric-mini__value tabular-nums"
          :style="{ color: brand.colors.negative }"
        >{{ worstLabel }}</span>
        <span class="metric-mini__hint">{{ worstHint }}</span>
      </article>

      <!-- vs IBOV — comparacao com Ibovespa real (indice_prices) -->
      <article class="metric-mini" :style="cardStyle">
        <span class="metric-mini__eyebrow">vs IBOV</span>
        <span
          class="metric-mini__value tabular-nums"
          :style="{ color: ibovColor }"
        >{{ ibovDelta }}</span>
        <span class="metric-mini__hint">{{ ibovHint }}</span>
      </article>
    </div>

    <!-- ============ FOOTER: contexto operacional ============
         Volume + margem aparecem como CONTEXTO, nao como hero.
         Reforca a UX decision de leverage. -->
    <p
      class="metrics-footer"
      :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
    >
      <UIcon name="i-lucide-info" class="size-3 shrink-0" aria-hidden="true" />
      Volume operado de
      <span
        class="font-mono-tab tabular-nums"
        :style="{ color: brand.colors.text }"
      >{{ volumeLabel }}</span>
      (exposição, não patrimônio)<template v-if="stats.avgMargin != null">.
      Margem média:
      <span
        class="font-mono-tab tabular-nums"
        :style="{ color: brand.colors.text }"
      >{{ marginLabel }}</span></template>.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ResultadoStats, ResultPeriod } from '~/composables/useResultadoStats'

const props = defineProps<{
  stats: ResultadoStats
  period: ResultPeriod
}>()

const brand = useBrand()
const { brl } = useFormat()

// ============ Win rate ============
const winRatePct = computed(() => {
  if (props.stats.wins + props.stats.losses === 0) return 0
  return props.stats.winRate * 100
})

const winRateValueText = computed(() => {
  if (props.stats.wins + props.stats.losses === 0) return '—'
  return `${winRatePct.value.toFixed(1).replace('.', ',')}%`
})

// Arc length: arco vai de 0 a ~150 unidades (semi-circulo r=48 → ~150).
const winRateArcLen = computed(() => (winRatePct.value / 100) * 150)

const winRateColor = computed(() => {
  if (props.stats.wins + props.stats.losses === 0) return `color-mix(in srgb, ${brand.colors.text} 30%, transparent)`
  if (winRatePct.value >= 60) return brand.colors.positive
  if (winRatePct.value >= 50) return brand.colors.primary
  return brand.colors.negative
})

const winRateHint = computed(() => {
  if (props.stats.wins + props.stats.losses === 0) return 'Sem operações fechadas'
  if (winRatePct.value >= 60) return 'Acima da média de mercado'
  if (winRatePct.value >= 50) return 'Mais ganhos que perdas'
  if (winRatePct.value >= 40) return 'Importa o tamanho dos ganhos'
  return 'Revise tamanho dos stops'
})

// ============ Profit factor ============
const grossProfit = computed(() => {
  return props.stats.trades
    .filter((t) => t.closedAt && t.side !== 'DIVIDEND' && t.side !== 'JCP' && (t.resultAmount ?? 0) > 0)
    .reduce((s, t) => s + (t.resultAmount ?? 0), 0)
})
const grossLoss = computed(() => {
  return Math.abs(
    props.stats.trades
      .filter((t) => t.closedAt && t.side !== 'DIVIDEND' && t.side !== 'JCP' && (t.resultAmount ?? 0) < 0)
      .reduce((s, t) => s + (t.resultAmount ?? 0), 0),
  )
})

const pfValueText = computed(() => {
  const pf = props.stats.profitFactor
  if (!Number.isFinite(pf)) return pf > 0 ? '∞' : '—'
  if (pf === 0) return '—'
  return pf.toFixed(2).replace('.', ',')
})

const pfColor = computed(() => {
  const pf = props.stats.profitFactor
  if (!Number.isFinite(pf) || pf === 0) return brand.colors.text
  if (pf >= 1.5) return brand.colors.positive
  if (pf >= 1) return brand.colors.text
  return brand.colors.negative
})

const pfQualifier = computed(() => {
  const pf = props.stats.profitFactor
  if (!Number.isFinite(pf)) return 'sem perdas'
  if (pf === 0) return 'sem dados'
  if (pf >= 2) return 'excelente'
  if (pf >= 1.5) return 'bom'
  if (pf >= 1) return 'positivo'
  return 'negativo'
})

const pfHint = computed(() => {
  const pf = props.stats.profitFactor
  if (!Number.isFinite(pf)) return 'Sem perdas registradas no período'
  if (pf >= 1.5) return 'Lucrativo com folga, dentro da faixa saudável'
  if (pf >= 1) return 'No azul, mas margem apertada'
  if (pf > 0) return 'Você perde mais do que ganha em média'
  return 'Sem dados suficientes'
})

// Mini-bar: distribui 100% entre ganhos e perdas brutos
const pfBarPositiveWidth = computed(() => {
  const total = grossProfit.value + grossLoss.value
  if (!total) return 0
  return (grossProfit.value / total) * 100
})
const pfBarNegativeWidth = computed(() => {
  const total = grossProfit.value + grossLoss.value
  if (!total) return 0
  return (grossLoss.value / total) * 100
})

function formatBRL(v: number): string {
  return brl(v)
}

// ============ Mini cards ============
const avgWinLabel = computed(() => {
  if (props.stats.wins === 0) return '—'
  return `+${brl(props.stats.avgWin)}`
})

const avgLossLabel = computed(() => {
  if (props.stats.losses === 0) return '—'
  return brl(props.stats.avgLoss).replace('-', '−')
})

const rrHint = computed(() => {
  if (props.stats.losses === 0 || props.stats.wins === 0) return 'R:R indisponível'
  const rr = Math.abs(props.stats.avgWin / props.stats.avgLoss)
  return `R:R médio ${rr.toFixed(2).replace('.', ',')}:1`
})

const bestLabel = computed(() => {
  if (!props.stats.bestTrade) return '—'
  return `+${brl(props.stats.bestTrade.resultAmount ?? 0)}`
})
const bestHint = computed(() =>
  props.stats.bestTrade
    ? `${props.stats.bestTrade.ticker} · ${kindLabel(props.stats.bestTrade.kind)}`
    : '—',
)

const worstLabel = computed(() => {
  if (!props.stats.worstTrade) return '—'
  return brl(props.stats.worstTrade.resultAmount ?? 0).replace('-', '−')
})
const worstHint = computed(() =>
  props.stats.worstTrade
    ? `${props.stats.worstTrade.ticker} · ${kindLabel(props.stats.worstTrade.kind)}`
    : '—',
)

function kindLabel(k: string): string {
  return ({ day: 'Day', swing: 'Swing', hold: 'Hold' } as Record<string, string>)[k] ?? k
}

// ============ Benchmark IBOV (real, via /api/benchmarks/ibov) ============
const periodRef = computed(() => props.period)
const { pct: ibovPct, available: ibovAvailable } = useIbovBenchmark(periodRef)

const userPctApprox = computed(() => {
  if (props.stats.totalVolume === 0) return 0
  return (props.stats.totalPnL / Math.max(props.stats.totalVolume, 1)) * 100
})

const ibovDelta = computed(() => {
  if (!ibovAvailable.value) return '—'
  const d = userPctApprox.value - ibovPct.value
  const sign = d >= 0 ? '+' : '−'
  return `${sign}${Math.abs(d).toFixed(2).replace('.', ',')}%`
})

const ibovColor = computed(() => {
  if (!ibovAvailable.value) return `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`
  return userPctApprox.value - ibovPct.value >= 0 ? brand.colors.positive : brand.colors.negative
})

const ibovHint = computed(() => {
  if (!ibovAvailable.value) return 'Sem dados do IBOV no período'
  const ibovStr = `${ibovPct.value >= 0 ? '+' : '−'}${Math.abs(ibovPct.value).toFixed(2).replace('.', ',')}%`
  return `IBOV ${ibovStr} no período`
})

const volumeLabel = computed(() => brl(props.stats.totalVolume))
const marginLabel = computed(() =>
  props.stats.avgMargin != null ? brl(props.stats.avgMargin) : '—',
)

const cardStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  boxShadow: `0 8px 22px -16px color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
}))
</script>

<style scoped>
/* ============ HERO METRIC CARDS ============ */
.metric-hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid;
  position: relative;
  overflow: hidden;
}

.metric-hero::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary) 7%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.metric-hero__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  position: relative;
}

.metric-hero__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.metric-hero__count {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.metric-hero__body {
  display: flex;
  align-items: center;
  gap: 18px;
  position: relative;
}

.metric-hero__gauge {
  width: 140px;
  height: 90px;
  flex-shrink: 0;
}

.metric-hero__gauge-fill {
  transition: stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-hero__gauge-text {
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 200;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.metric-hero__pf {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}

.metric-hero__pf-value {
  font-family: var(--brand-font);
  font-size: clamp(36px, 4.5vw, 48px);
  font-weight: 200;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.metric-hero__pf-suffix {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 16px;
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}

.metric-hero__details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.metric-hero__detail-row {
  display: grid;
  grid-template-columns: 6px 1fr auto;
  align-items: center;
  gap: 8px;
}

.metric-hero__detail-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.metric-hero__detail-label {
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.metric-hero__detail-value {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
}

.metric-hero__pf-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.metric-hero__pf-bar-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11px;
  font-weight: 500;
}

.metric-hero__pf-bar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}

.metric-hero__pf-bar-fill {
  height: 100%;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-hero__hint {
  font-size: 11.5px;
  line-height: 1.45;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  margin-top: 2px;
}

/* ============ MINI METRIC CARDS ============ */
.metric-mini {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid;
  position: relative;
  overflow: hidden;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.metric-mini::before {
  content: '';
  position: absolute;
  top: -30px;
  right: -30px;
  width: 100px;
  height: 100px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary) 5%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.metric-mini:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 24%, transparent) !important;
  box-shadow: 0 6px 16px -10px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.metric-mini__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.metric-mini__inline {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.metric-mini__value {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.metric-mini__sep {
  font-size: 14px;
}

.metric-mini__hint {
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* ============ FOOTER ============ */
.metrics-footer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  line-height: 1.5;
  margin-top: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .metric-hero__gauge-fill,
  .metric-hero__pf-bar-fill {
    transition: none;
  }
}
</style>

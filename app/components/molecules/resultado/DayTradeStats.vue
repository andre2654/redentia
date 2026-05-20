<!--
  MoleculesResultadoDayTradeStats — KPIs operacionais do trader.

  Grid de 6 cards densos: Win rate, Profit factor, Avg W/L, R-trade,
  Drawdown intraday, Tempo medio em operacao. Cada card e quadrado
  (radius 12px), com eyebrow mono uppercase + valor monospaced
  grande + hint discreto.

  Densidade alta — modo day-trade quer informacao por inch quadrada,
  nao breathing room. Em wide screens vira 6 cards 1-row;
  em medium 3+3; em mobile 2+2+2.
-->
<template>
  <div class="dt-stats">
    <!-- Win rate -->
    <article class="dt-stat" :style="cardStyle">
      <span class="dt-stat__label">Win rate</span>
      <span
        class="dt-stat__value tabular-nums"
        :style="{ color: winRateColor }"
      >{{ winRateLabel }}</span>
      <div class="dt-stat__bar"
        :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 8%, transparent)` }"
      >
        <span
          class="dt-stat__bar-fill"
          :style="{
            width: `${Math.max(2, stats.winRate * 100)}%`,
            backgroundColor: winRateColor,
          }"
        />
      </div>
      <span class="dt-stat__hint">
        {{ stats.wins }}W · {{ stats.losses }}L
      </span>
    </article>

    <!-- Profit factor -->
    <article class="dt-stat" :style="cardStyle">
      <span class="dt-stat__label">Profit factor</span>
      <span
        class="dt-stat__value tabular-nums"
        :style="{ color: pfColor }"
      >{{ pfLabel }}</span>
      <div class="dt-stat__bar"
        :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 8%, transparent)` }"
      >
        <span
          class="dt-stat__bar-fill"
          :style="{
            width: `${pfBarWidth}%`,
            backgroundColor: pfColor,
          }"
        />
      </div>
      <span class="dt-stat__hint">{{ pfHint }}</span>
    </article>

    <!-- Avg W / L -->
    <article class="dt-stat" :style="cardStyle">
      <span class="dt-stat__label">Avg W · L</span>
      <div class="dt-stat__row">
        <span
          class="dt-stat__value-sm tabular-nums"
          :style="{ color: 'var(--brand-positive)' }"
        >{{ avgWinLabel }}</span>
        <span class="dt-stat__sep" aria-hidden="true">/</span>
        <span
          class="dt-stat__value-sm tabular-nums"
          :style="{ color: 'var(--brand-negative)' }"
        >{{ avgLossLabel }}</span>
      </div>
      <span class="dt-stat__hint">{{ rrHint }}</span>
    </article>

    <!-- Drawdown intraday -->
    <article class="dt-stat" :style="cardStyle">
      <span class="dt-stat__label">Drawdown máx</span>
      <span
        class="dt-stat__value tabular-nums"
        :style="{ color: 'var(--brand-negative)' }"
      >{{ drawdownLabel }}</span>
      <span class="dt-stat__hint">Pico → vale do período</span>
    </article>

    <!-- Streak -->
    <article class="dt-stat" :style="cardStyle">
      <span class="dt-stat__label">Sequência atual</span>
      <span
        class="dt-stat__value tabular-nums"
        :style="{ color: streakColor }"
      >{{ streakLabel }}</span>
      <span class="dt-stat__hint">{{ streakHint }}</span>
    </article>

    <!-- Tempo medio -->
    <article class="dt-stat" :style="cardStyle">
      <span class="dt-stat__label">Tempo médio</span>
      <span
        class="dt-stat__value tabular-nums"
        :style="{ color: 'var(--brand-text)' }"
      >{{ holdingLabel }}</span>
      <span class="dt-stat__hint">Por operação</span>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { DayTradeStats } from '~/composables/useDayTradeStats'

const props = defineProps<{
  stats: DayTradeStats
}>()

const brand = useBrand()
const { brl } = useFormat()

// ============ Win rate ============
const winRateLabel = computed(() => {
  if (props.stats.wins + props.stats.losses === 0) return '—'
  return `${(props.stats.winRate * 100).toFixed(1).replace('.', ',')}%`
})

const winRateColor = computed(() => {
  if (props.stats.wins + props.stats.losses === 0) {
    return `color-mix(in srgb, var(--brand-text) 60%, transparent)`
  }
  if (props.stats.winRate >= 0.6) return 'var(--brand-positive)'
  if (props.stats.winRate >= 0.5) return 'var(--brand-primary)'
  return 'var(--brand-negative)'
})

// ============ Profit factor ============
const pfLabel = computed(() => {
  const pf = props.stats.profitFactor
  if (!Number.isFinite(pf)) return pf > 0 ? '∞' : '—'
  if (pf === 0) return '—'
  return `${pf.toFixed(2).replace('.', ',')}×`
})

const pfColor = computed(() => {
  const pf = props.stats.profitFactor
  if (!Number.isFinite(pf)) return 'var(--brand-positive)'
  if (pf === 0) return `color-mix(in srgb, var(--brand-text) 60%, transparent)`
  if (pf >= 1.5) return 'var(--brand-positive)'
  if (pf >= 1) return 'var(--brand-text)'
  return 'var(--brand-negative)'
})

// PF acima de 3.0 cai numa categoria "excelente" e o bar fica cheio.
// Abaixo de 1.0 mostra parcialmente pra dar contexto.
const pfBarWidth = computed(() => {
  const pf = props.stats.profitFactor
  if (!Number.isFinite(pf) || pf >= 3) return 100
  if (pf <= 0) return 0
  return Math.min(100, (pf / 3) * 100)
})

const pfHint = computed(() => {
  const pf = props.stats.profitFactor
  if (!Number.isFinite(pf)) return 'Sem perdas'
  if (pf === 0) return 'Sem dados'
  if (pf >= 2) return 'Excelente'
  if (pf >= 1.5) return 'Saudável'
  if (pf >= 1) return 'Positivo, apertado'
  return 'Perdas > Ganhos'
})

// ============ Avg W/L ============
const avgWinLabel = computed(() => {
  if (props.stats.wins === 0) return '—'
  return `+${brl(props.stats.avgWin)}`
})

const avgLossLabel = computed(() => {
  if (props.stats.losses === 0) return '—'
  return brl(props.stats.avgLoss).replace('-', '−')
})

const rrHint = computed(() => {
  if (props.stats.wins === 0 || props.stats.losses === 0) return 'R:R indisponível'
  const rr = Math.abs(props.stats.avgWin / props.stats.avgLoss)
  return `R:R ${rr.toFixed(2).replace('.', ',')}:1`
})

// ============ Drawdown ============
const drawdownLabel = computed(() => {
  if (props.stats.maxDrawdown === 0) return '—'
  return `−${brl(props.stats.maxDrawdown)}`
})

// ============ Streak ============
const streakLabel = computed(() => {
  const s = props.stats.currentStreak
  if (s === 0) return '—'
  const sign = s > 0 ? '+' : ''
  return `${sign}${s}`
})

const streakColor = computed(() => {
  const s = props.stats.currentStreak
  if (s > 0) return 'var(--brand-positive)'
  if (s < 0) return 'var(--brand-negative)'
  return `color-mix(in srgb, var(--brand-text) 60%, transparent)`
})

const streakHint = computed(() => {
  const s = props.stats.currentStreak
  if (s === 0) return 'Sem operações'
  if (s > 0) {
    return s === 1
      ? 'Última no azul'
      : `${s} vencedoras seguidas`
  }
  const abs = Math.abs(s)
  return abs === 1
    ? 'Última no vermelho'
    : `${abs} stops seguidos`
})

// ============ Holding ============
const holdingLabel = computed(() => {
  if (props.stats.count === 0) return '—'
  const sec = props.stats.avgHoldingSeconds
  if (sec < 60) return `${Math.round(sec)}s`
  if (sec < 3600) return `${Math.round(sec / 60)}min`
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  return m ? `${h}h${m}` : `${h}h`
})

// Receita unificada: bg surface + border padrao + box-shadow leve em
// primary. Mesma da Carteira metric-mini, sem edge accent ou inset
// shadow. Cor de cada KPI vive no proprio numero (winRateColor,
// pfColor, streakColor) — nao na borda do card.
const cardStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
  boxShadow: `0 8px 22px -16px color-mix(in srgb, var(--brand-primary) 14%, transparent)`,
}))
</script>

<style scoped>
.dt-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
}

.dt-stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid;
  position: relative;
  overflow: hidden;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

/* Radial gradient ambient amber no canto — mesma receita da
   metric-mini da Carteira. Mantem o registro visual unificado
   entre os dois modos. */
.dt-stat::before {
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

.dt-stat:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 24%, transparent) !important;
  box-shadow: 0 6px 16px -10px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.dt-stat__label {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.dt-stat__value {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  line-height: 1.05;
}

.dt-stat__row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.dt-stat__value-sm {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
}

.dt-stat__sep {
  color: color-mix(in srgb, var(--brand-text) 30%, transparent);
  font-size: 13px;
}

.dt-stat__bar {
  display: block;
  height: 3px;
  border-radius: 2px;
  overflow: hidden;
}

.dt-stat__bar-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dt-stat__hint {
  font-size: 10px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .dt-stat__bar-fill {
    transition: none;
  }
}
</style>

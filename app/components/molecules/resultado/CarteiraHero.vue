<!--
  MoleculesResultadoCarteiraHero — receita HeroPatrimony aplicada
  ao P&L. SEM container box, SEM grid de cells: apenas eyebrow +
  H1 leve + linha de meta inline com badge colorido. O peso visual
  vem da tipografia, nao do container.

  Diferenca chave vs versao anterior:
    - Sem border/box ao redor (era pesado, virava "card de stat")
    - H1 weight 300, tabular-nums, letter-spacing -1.5px
    - Linha de meta inline com bullet separators
    - Mini-sparkline a direita em md+ pra dar contexto temporal
      sem precisar duplicar o equity curve abaixo
-->
<template>
  <header class="hero flex flex-col gap-3">
    <span
      class="font-mono-tab text-[11px] font-medium uppercase"
      :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
    >Resultado · {{ periodLabel }}</span>

    <div class="flex flex-wrap items-end justify-between gap-6">
      <div class="flex min-w-0 flex-col gap-2">
        <h1
          class="hero__amount font-light tabular-nums"
          :style="{
            color: amountColor,
            fontSize: 'clamp(40px, 5.5vw, 56px)',
            lineHeight: 1.0,
            letterSpacing: '-1.5px',
          }"
        >{{ amountLabel }}</h1>

        <!-- Linha de meta: P&L abs + badge % + breakdown -->
        <div class="mt-1 flex flex-wrap items-baseline gap-3">
          <span
            v-if="hasPnl"
            class="font-mono-tab text-[15px] tabular-nums"
            :style="{ color: amountColor }"
          >{{ pnlAbsLabel }}</span>

          <span
            v-if="pctLabel"
            class="rounded-md px-2 py-0.5 font-mono-tab text-[12px] font-medium tabular-nums"
            :style="{
              backgroundColor: `color-mix(in srgb, ${amountColor} 16%, transparent)`,
              color: amountColor,
            }"
          >{{ pctLabel }}</span>

          <span
            class="font-mono-tab text-[12.5px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
          >
            {{ stats.closedTradesCount }} {{ stats.closedTradesCount === 1 ? 'fechada' : 'fechadas' }}
            <template v-if="stats.openTradesCount > 0">
              · {{ stats.openTradesCount }} {{ stats.openTradesCount === 1 ? 'aberta' : 'abertas' }}
            </template>
            <template v-if="stats.incomePnL !== 0">
              · {{ incomePctLabel }} de renda
            </template>
          </span>
        </div>

        <!-- Breakdown inline em texto (sem cells em grid). Fica como
             "second line of meta" pro user que quer detalhe sem precisar
             ver um box separado. -->
        <div
          class="mt-1.5 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[12.5px]"
          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
        >
          <span class="hero__breakdown">
            <span class="hero__breakdown-label">Realizado</span>
            <span
              class="hero__breakdown-value tabular-nums"
              :style="{ color: cellColor(stats.realizedPnL) }"
            >{{ formatSigned(stats.realizedPnL) }}</span>
          </span>
          <span
            class="hero__sep"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 25%, transparent)` }"
            aria-hidden="true"
          >·</span>
          <span class="hero__breakdown">
            <span class="hero__breakdown-label">Não realizado</span>
            <span
              class="hero__breakdown-value tabular-nums"
              :style="{ color: cellColor(stats.unrealizedPnL) }"
            >{{ formatSigned(stats.unrealizedPnL) }}</span>
          </span>
          <span
            class="hero__sep"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 25%, transparent)` }"
            aria-hidden="true"
          >·</span>
          <span class="hero__breakdown">
            <span class="hero__breakdown-label">Renda passiva</span>
            <span
              class="hero__breakdown-value tabular-nums"
              :style="{ color: cellColor(stats.incomePnL) }"
            >{{ formatSigned(stats.incomePnL) }}</span>
          </span>
        </div>
      </div>

      <!-- Mini-sparkline a direita: 7 dias finais do periodo, sem
           texto, so a forma. Da contexto temporal sem competir com o
           hero number. Some em mobile (<md) — espaco e precioso la. -->
      <div
        v-if="sparkPoints.length >= 2"
        class="hero__spark hidden md:flex"
        aria-hidden="true"
      >
        <svg :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`" preserveAspectRatio="none" class="hero__spark-svg">
          <defs>
            <linearGradient :id="sparkGradId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" :stop-color="amountColor" stop-opacity="0.28" />
              <stop offset="100%" :stop-color="amountColor" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path :d="sparkAreaPath" :fill="`url(#${sparkGradId})`" />
          <path
            :d="sparkLinePath"
            fill="none"
            :stroke="amountColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle
            :cx="sparkLastPoint.x"
            :cy="sparkLastPoint.y"
            r="2.5"
            :fill="amountColor"
          />
        </svg>
        <span
          class="hero__spark-label font-mono-tab"
          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
        >Últimas 2 semanas</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { ResultadoStats, ResultPeriod } from '~/composables/useResultadoStats'

const props = defineProps<{
  stats: ResultadoStats
  period: ResultPeriod
  /**
   * Override do texto do periodo no eyebrow ("Resultado · X").
   * Default: derivado do dicionario por `period`. Use quando o
   * contexto tem janelas customizadas (ex: DayTrade com "Hoje" /
   * "Últimos 7 dias" / "Últimos 30 dias").
   */
  labelOverride?: string
}>()

const brand = useBrand()
const { brl } = useFormat()
const interfaceStore = useInterfaceStore()

const periodLabel = computed(() => {
  if (props.labelOverride) return props.labelOverride
  const labels: Record<ResultPeriod, string> = {
    '7d': '7 dias',
    '30d': '30 dias',
    '90d': '90 dias',
    ytd: 'Ano até hoje',
    '12m': '12 meses',
    all: 'Tudo',
  }
  return labels[props.period]
})

const hasPnl = computed(() => props.stats.totalPnL !== 0)

const amountColor = computed(() =>
  props.stats.totalPnL >= 0 ? brand.colors.positive : brand.colors.negative,
)

const amountLabel = computed(() => {
  if (!interfaceStore.revealAmount) return 'R$ ••••••'
  const sign = props.stats.totalPnL >= 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(props.stats.totalPnL))}`
})

const pnlAbsLabel = computed(() => {
  if (!interfaceStore.revealAmount) return ''
  const sign = props.stats.totalPnL >= 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(props.stats.totalPnL))}`
})

// % aproximado: P&L / volume. Vira (P&L / patrimônio) quando o backend
// trouxer historico de aportes. Só mostra se houver volume operado.
const pctLabel = computed(() => {
  if (props.stats.totalVolume === 0) return null
  const pct = (props.stats.totalPnL / props.stats.totalVolume) * 100
  if (!Number.isFinite(pct)) return null
  const sign = pct >= 0 ? '+' : '−'
  return `${sign}${Math.abs(pct).toFixed(2).replace('.', ',')}%`
})

const incomePctLabel = computed(() => {
  if (props.stats.totalPnL === 0) return ''
  const pct = (props.stats.incomePnL / Math.abs(props.stats.totalPnL)) * 100
  if (!Number.isFinite(pct) || Math.abs(pct) < 0.5) return ''
  return `${Math.abs(pct).toFixed(0)}%`
})

function cellColor(v: number): string {
  if (v === 0) return `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`
  return v > 0 ? brand.colors.positive : brand.colors.negative
}

function formatSigned(v: number): string {
  if (!interfaceStore.revealAmount) return '••••••'
  if (v === 0) return brl(0)
  const sign = v > 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(v))}`
}

// ============ Sparkline (ultimos 14 pontos cumulativos) ============
const SPARK_W = 220
const SPARK_H = 56
const SPARK_PAD = 4
const sparkGradId = `hero-spark-${Math.random().toString(36).slice(2, 8)}`

const sparkPoints = computed(() => {
  const series = props.stats.cumulativeSeries.slice(-14)
  if (series.length < 2) return []
  const min = Math.min(...series.map((p) => p.pnl))
  const max = Math.max(...series.map((p) => p.pnl))
  const range = max - min || 1
  const usableH = SPARK_H - SPARK_PAD * 2
  return series.map((p, i) => ({
    x: (i / (series.length - 1)) * SPARK_W,
    y: SPARK_PAD + (1 - (p.pnl - min) / range) * usableH,
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
</script>

<style scoped>
.hero__breakdown {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.hero__breakdown-label {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.hero__breakdown-value {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 13.5px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.005em;
}

.hero__sep {
  font-size: 13px;
  user-select: none;
}

.hero__spark {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
  width: 220px;
}

.hero__spark-svg {
  width: 100%;
  height: 56px;
  display: block;
}

.hero__spark-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
</style>

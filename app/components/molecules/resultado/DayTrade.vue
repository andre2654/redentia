<!--
  MoleculesResultadoDayTrade — orquestrador do MODO DAY TRADE.

  Vocabulario visual diferente do Modo Carteira:
    - Cards SEM darkening hardcoded (o brand surface manda; o
      registro "terminal" vem de outros elementos)
    - Backdrop dotted no Hero (sensacao de pixel-screen)
    - Edge accents (border-left coloridas por categoria de KPI)
    - Ticker tape em loop no topo (scroll horizontal)
    - Monospace dominante em todos os filhos
    - Densidade alta (gap 14-16px entre sections)

  Layout assimetrico 8/4 estilo Bloomberg-terminal:
    1. Hero (full)
    2. Period selector (full)
    3. Ticker tape (full thin strip)
    4. Stats grid 6-cards (full, denso)
    5. Curva intraday (8 cols) | R-multiple histogram (4 cols)
    6. Hot zones (8 cols) | By ticker donut (4 cols)
    7. Tabela de operacoes (full)
    8. Insights operacionais (full)

  Insights so aparecem com >=5 trades. Empty states explicam.
-->
<template>
  <div class="day-trade flex flex-col gap-5">
    <!-- ============ 1. HERO ============
         Reutiliza o CarteiraHero pra manter coesao visual entre os
         dois modos. Adaptamos `dayTradeStats` pro shape esperado pelo
         hero (`ResultadoStats`-like) — todos os trades day-trade sao
         realizados (closed), entao realizedPnL = totalPnL e
         unrealized/income ficam zerados. -->
    <MoleculesResultadoCarteiraHero
      :stats="adaptedHeroStats"
      period="30d"
      :label-override="heroLabelOverride"
    />

    <!-- ============ 2. PERIOD SELECTOR ============ -->
    <div class="day-trade__period-row">
      <span class="day-trade__period-label">Janela operacional</span>
      <AtomsSegmented
        v-model="period"
        :options="periodOptions"
        size="sm"
        aria-label="Janela operacional"
      />
    </div>

    <!-- ============ 3. TICKER TAPE ============
         Scroll continuo horizontal com os ultimos trades. Da o
         registro "pregão vivo" desde o primeiro frame, antes mesmo
         do user processar os numeros. -->
    <MoleculesResultadoDayTradeTickerTape :trades="stats.trades" />

    <!-- ============ 4. STATS ============ -->
    <MoleculesResultadoDayTradeStats :stats="stats" />

    <!-- ============ 5. CURVA + R-HISTOGRAM (8/4) ============ -->
    <div class="day-trade__split">
      <div class="day-trade__split-main">
        <MoleculesResultadoDayTradeIntradayCurve :stats="stats" :period="period" />
      </div>
      <div class="day-trade__split-side">
        <MoleculesResultadoDayTradeRHistogram :stats="stats" />
      </div>
    </div>

    <!-- ============ 6. HOT ZONES + BY-TICKER (8/4) ============ -->
    <div class="day-trade__split">
      <div class="day-trade__split-main">
        <MoleculesResultadoDayTradeHotZones :stats="stats" />
      </div>
      <div class="day-trade__split-side">
        <MoleculesResultadoDayTradeByTicker :stats="stats" />
      </div>
    </div>

    <!-- ============ 7. TABELA DENSA ============ -->
    <MoleculesResultadoDayTradeTrades :trades="stats.trades" :period="period" />

    <!-- ============ 8. INSIGHTS ============ -->
    <section v-if="stats.count >= 5" class="flex flex-col gap-3">
      <header class="day-trade__section-head">
        <span class="day-trade__section-eyebrow">Leituras operacionais</span>
        <span class="day-trade__section-sub">Tilt, hora dreno, R:R e overtrading</span>
      </header>
      <MoleculesResultadoDayTradeInsights :stats="stats" />
    </section>

    <!-- ============ 9. WEEK HEATMAP (UAU, fim da pagina) ============
         Heatmap 2D dias × horas — equivalente em peso visual ao
         Calendar Heatmap ENORME da Carteira. Fechamento da pagina:
         depois de stats, curva, hot zones, historico, insights, o
         user desce ate aqui e ve um mapa semanal denso revelando
         padroes ("quinta as 11h e meu pico"). Click numa celula
         abre drill-down. -->
    <MoleculesResultadoDayTradeWeekHeatmap :trades="props.trades" />
  </div>
</template>

<script setup lang="ts">
import type { MockTrade } from '~/composables/useMockTrades'
import type { DayTradePeriod } from '~/composables/useDayTradeStats'
import type { ResultadoStats } from '~/composables/useResultadoStats'

const props = defineProps<{
  trades: MockTrade[]
}>()

// Default 'mes' (30d) pra evitar tela vazia em "Hoje" quando nao
// houver day-trades hoje. User pode trocar pra 'hoje' ou 'semana'
// e ver as mesmas metricas em janela mais curta.
const period = ref<DayTradePeriod>('mes')

const tradesRef = computed(() => props.trades)
const { stats: statsComputed } = useDayTradeStats(tradesRef, period)
const stats = computed(() => statsComputed.value)

const periodOptions = [
  { value: 'hoje' as const, label: 'Hoje' },
  { value: 'semana' as const, label: '7d' },
  { value: 'mes' as const, label: '30d' },
]

// ============ Adapter pro CarteiraHero ============
// Mapeia DayTradeStats (que so trata day-trades fechados) pra um
// `ResultadoStats`-like esperado pelo CarteiraHero. Conversao:
//   - realizedPnL  = totalPnL (todo day-trade fechado e realizado)
//   - unrealizedPnL = 0
//   - incomePnL     = 0
//   - cumulativeSeries = equityCurve transformada {date, pnl}
//
// Quando o backend real entrar (Fase 3), o ideal e o `useResultadoStats`
// e `useDayTradeStats` compartilharem uma mesma base de stats — eliminando
// esse adapter.
const adaptedHeroStats = computed<ResultadoStats>(() => {
  const s = stats.value
  return {
    totalPnL: s.totalPnL,
    realizedPnL: s.totalPnL,
    unrealizedPnL: 0,
    incomePnL: 0,
    closedTradesCount: s.count,
    openTradesCount: 0,
    wins: s.wins,
    losses: s.losses,
    winRate: s.winRate,
    profitFactor: s.profitFactor,
    avgWin: s.avgWin,
    avgLoss: s.avgLoss,
    bestTrade: s.bestTrade,
    worstTrade: s.worstTrade,
    totalVolume: s.totalVolume,
    avgMargin: s.avgMargin,
    dailySeries: [],
    cumulativeSeries: s.equityCurve.map((p) => ({
      date: p.iso.slice(0, 10),
      pnl: p.cumulativePnl,
      trades: 1,
    })),
    byKind: { day: { count: s.count, pnl: s.totalPnL }, swing: { count: 0, pnl: 0 }, hold: { count: 0, pnl: 0 } },
    byInstrument: {},
    trades: s.trades,
  }
})

const heroLabelOverride = computed(() => {
  const labels: Record<DayTradePeriod, string> = {
    hoje: 'Hoje',
    semana: 'Últimos 7 dias',
    mes: 'Últimos 30 dias',
  }
  return labels[period.value]
})
</script>

<style scoped>
.day-trade {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
}

.day-trade__period-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.day-trade__period-label {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* Layout split 8/4 (Bloomberg-style): main 2/3, side 1/3 em desktop;
   stack em mobile. Gap consistente com o resto da page. */
.day-trade__split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 1024px) {
  .day-trade__split {
    grid-template-columns: 2fr 1fr;
  }
}

/* Wrappers do grid 8/4 — esticam pra altura igual da row. O article
   filho de cada um tem `height: 100%` (no .dt-rhist e .dt-byticker)
   pra match a altura do card maior ao lado. */
.day-trade__split-main,
.day-trade__split-side {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.day-trade__split-main > *,
.day-trade__split-side > * {
  flex: 1 1 auto;
}

.day-trade__section-head {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.day-trade__section-eyebrow {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-primary) 90%, transparent);
}

.day-trade__section-sub {
  font-size: 11.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
</style>

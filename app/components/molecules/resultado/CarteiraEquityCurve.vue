<!--
  MoleculesResultadoCarteiraEquityCurve — curva cumulativa de P&L.

  Usa o mesmo grafico oficial da plataforma (`<AtomsGraphLine>`,
  Chart.js + vue-chartjs) que `/asset/[ticker]` usa pra preco
  historico. Mesma identidade visual, mesma interatividade
  (hover tooltip, period range, drag, etc), e ja respeita
  brand.colors automaticamente.

  Adaptamos `series` (formato { date, pnl, trades }) pro shape
  esperado pelo grafico (`IChartDataPoint`: { date, value, timestamp }).
  A `value` e o P&L acumulado em R$.

  MARKERS DE DIAS NOTAVEIS:
  Computados a partir de `dailySeries` (P&L diario, nao cumulativo).
  Um dia entra como marker quando seu |pnl| supera 1.2x a media diaria
  do mesmo lado (ganho vs perda). Titulo e gerado a partir do trade
  dominante do dia (ticker + estilo + sinal). Cap de 12 markers pra
  evitar poluicao visual em periodos longos.

  Container segue receita visual da /wallet: rounded-2xl + radial
  gradient ambient + eyebrow/end-value/count em head com baseline.
-->
<template>
  <article class="equity" :style="cardStyle">
    <header class="equity__head">
      <span class="equity__eyebrow">Curva de resultado</span>
      <div class="equity__head-right">
        <span
          v-if="markers.length"
          class="equity__markers-pill tabular-nums"
          :style="markersPillStyle"
        >
          <UIcon name="i-lucide-sparkles" class="size-3" aria-hidden="true" />
          {{ markers.length }} {{ markers.length === 1 ? 'dia notável' : 'dias notáveis' }}
        </span>
        <span
          v-if="series.length"
          class="equity__end-value tabular-nums"
          :style="{ color: endValueColor }"
        >{{ endValueLabel }}</span>
        <span class="equity__count">{{ series.length }} {{ series.length === 1 ? 'dia' : 'dias' }}</span>
      </div>
    </header>

    <div v-if="!series.length" class="equity__empty">
      <UIcon name="i-lucide-line-chart" class="size-6 opacity-40" :style="{ color: 'var(--brand-text)' }" />
      <span>Sem operações neste período.</span>
    </div>

    <!-- Grafico oficial. Mesma identidade do /asset/[ticker]:
         altura 320px desktop / 250px mobile (default do componente),
         locale pt-BR, currency R$, com legenda mostrando o P&L
         atual no topo.

         show-prev-close="true": linha tracejada de referencia no
         valor da vespera (ultimo dia util anterior ao final da serie).
         Da contexto temporal pro user — "estou X% acima do que estava
         ontem".

         Markers: pinos clicaveis nos dias notaveis. Popover mostra
         titulo (motivo do dia) + variacao do dia em %. -->
    <AtomsGraphLine
      v-else
      :data="chartData"
      :legend="chartLegend"
      :colors="[lineColor]"
      :height="320"
      :show-prev-close="true"
      :markers="markers"
    />
  </article>
</template>

<script setup lang="ts">
import type { DailyPnLPoint } from '~/composables/useResultadoStats'
import type { MockTrade } from '~/composables/useMockTrades'

const props = withDefaults(
  defineProps<{
    /** P&L acumulado dia a dia (cumulativeSeries do stats). */
    series: DailyPnLPoint[]
    /** P&L diario nao-cumulativo (pra detectar dias notaveis). */
    dailySeries?: DailyPnLPoint[]
    /** Trades do periodo (pra deduzir motivo de cada dia notavel). */
    trades?: MockTrade[]
  }>(),
  {
    dailySeries: () => [],
    trades: () => [],
  },
)

const brand = useBrand()
const { brl } = useFormat()

// ============ Adapter: cumulativeSeries → IChartDataPoint ============
// AtomsGraphLine espera { date, value, timestamp }. Nossa
// cumulativeSeries traz { date (YYYY-MM-DD), pnl, trades }. Conversao
// trivial: value = pnl, timestamp = epoch ms da data.
const chartData = computed(() =>
  props.series.map((p) => ({
    date: p.date,
    value: p.pnl,
    timestamp: new Date(p.date + 'T00:00:00').getTime(),
  })),
)

// ============ Estado derivado ============
const lastValue = computed(() =>
  props.series.length ? props.series[props.series.length - 1].pnl : 0,
)

const lineColor = computed(() =>
  lastValue.value >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
)

const endValueColor = computed(() => lineColor.value)

const endValueLabel = computed(() => {
  const sign = lastValue.value >= 0 ? '+' : '−'
  return `${sign}${brl(Math.abs(lastValue.value))}`
})

// Legenda: 1 linha (P&L acumulado) com valor no header. AtomsGraphLine
// renderiza essa legenda dentro do canvas via plugin proprio.
const chartLegend = computed(() => [
  {
    label: 'P&L acumulado',
    color: lineColor.value,
    value: endValueLabel.value,
  },
])

// ============ Markers de dias notaveis ============
// Threshold: 1.2x a media absoluta dos dias do MESMO sinal. Ou seja,
// um dia de ganho so vira marker se ele excede em 20% a media de
// ganhos diarios; um dia de perda so vira marker se excede em 20% a
// media de perdas. Tratamos cada lado separadamente porque a
// distribuicao de P&L de um trader tipicamente e assimetrica (com
// disciplina, ganhos sao maiores que perdas).
const dailyAvgGain = computed(() => {
  const positives = props.dailySeries.filter((d) => d.pnl > 0)
  if (!positives.length) return 0
  return positives.reduce((s, d) => s + d.pnl, 0) / positives.length
})

const dailyAvgLoss = computed(() => {
  const negatives = props.dailySeries.filter((d) => d.pnl < 0)
  if (!negatives.length) return 0
  return negatives.reduce((s, d) => s + Math.abs(d.pnl), 0) / negatives.length
})

const THRESHOLD_MULTIPLIER = 1.2
// Dias SEM trade fechado (so MTM) so viram marker se a variacao foi
// realmente notavel — >= 1.5% do equity da vespera. Evita poluir a
// curva com flutuacoes pequenas de holds em carteiras estaveis.
const MTM_PCT_THRESHOLD = 1.5
const MAX_MARKERS = 12

interface ChartMarker {
  date: string
  title: string
  changePercent: number
}

function dayHasTrade(date: string): boolean {
  for (const t of props.trades) {
    if (t.openedAt.slice(0, 10) === date) return true
    if (t.closedAt && t.closedAt.slice(0, 10) === date) return true
  }
  return false
}

const markers = computed<ChartMarker[]>(() => {
  if (!props.dailySeries.length) return []

  const candidates: Array<DailyPnLPoint & { magnitude: number }> = []

  for (const day of props.dailySeries) {
    if (day.pnl === 0) continue
    const magnitude = Math.abs(day.pnl)
    const hasTrade = dayHasTrade(day.date)

    if (hasTrade) {
      // Dia com operacao: threshold relativo (1.2x media) — eventos
      // de fato sao quase sempre notaveis no contexto operacional.
      const ref = day.pnl > 0 ? dailyAvgGain.value : dailyAvgLoss.value
      if (ref === 0) continue
      if (magnitude < ref * THRESHOLD_MULTIPLIER) continue
    } else {
      // Dia so-MTM: threshold ABSOLUTO em % do equity da vespera.
      // Sem essa barreira, holds que oscilam 0.3% poluiriam a curva.
      const pct = Math.abs(percentForDay(day.date, day.pnl))
      if (pct < MTM_PCT_THRESHOLD) continue
    }
    candidates.push({ ...day, magnitude })
  }

  // Ordena por magnitude desc e cap em MAX_MARKERS pra evitar poluicao
  // visual em periodos longos onde muitos dias podem passar do limiar.
  candidates.sort((a, b) => b.magnitude - a.magnitude)
  const top = candidates.slice(0, MAX_MARKERS)

  return top
    .map((day) => ({
      date: day.date,
      title: reasonForDay(day.date, day.pnl),
      // changePercent: variacao do dia relativa ao patrimonio acumulado
      // ate a vespera. Aproximacao: usa o cumulativo do dia anterior
      // como base. Cai pra 0 quando nao tem base (primeiro dia).
      changePercent: percentForDay(day.date, day.pnl),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
})

const markersPillStyle = computed(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '3px 8px',
  borderRadius: '999px',
  border: `1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent)`,
  backgroundColor: `color-mix(in srgb, var(--brand-primary) 10%, transparent)`,
  color: 'var(--brand-primary)',
  fontFamily: 'var(--font-mono, "JetBrains Mono", ui-monospace, monospace)',
  fontSize: '10.5px',
  fontWeight: 500,
  letterSpacing: '0.04em',
}))

// ============ Helpers ============

/**
 * Variacao % do dia em relacao ao patrimonio acumulado da vespera.
 * Quando o cumulativo da vespera e zero ou indefinido, cai num
 * fallback que normaliza pelo |pnl| do proprio dia (entao a pill
 * ainda mostra um numero util). Pode ser substituido por algo mais
 * sofisticado quando o backend trouxer o saldo cumulativo do dia.
 */
function percentForDay(date: string, dayPnl: number): number {
  const idx = props.series.findIndex((p) => p.date === date)
  if (idx <= 0) {
    // Primeiro ponto: nao temos base anterior, usa o magnitude / dailyAvg
    // pra ainda dar contexto (ex: 250% acima da media)
    const ref = dayPnl > 0 ? dailyAvgGain.value : dailyAvgLoss.value
    if (ref === 0) return 0
    const sign = dayPnl > 0 ? 1 : -1
    return sign * ((Math.abs(dayPnl) / ref) - 1) * 100
  }
  const previousCumulative = Math.abs(props.series[idx - 1]?.pnl ?? 0)
  if (previousCumulative === 0) {
    return dayPnl > 0 ? 100 : -100
  }
  return (dayPnl / previousCumulative) * 100
}

/**
 * Gera titulo descritivo do dia notavel a partir do trade dominante
 * (maior |resultAmount|) entre os trades fechados ou abertos naquele
 * dia. Quando ha multiplos trades do mesmo ticker no mesmo dia,
 * agrupa: "3 day-trades vencedoras em WIN".
 */
function reasonForDay(date: string, dayPnl: number): string {
  if (!props.trades.length) {
    return dayPnl > 0 ? 'Dia de ganho atípico' : 'Dia de perda atípica'
  }

  // Trades cujo openedAt OU closedAt cai nesse dia
  const dayTrades = props.trades.filter((t) => {
    const open = t.openedAt.slice(0, 10) === date
    const close = t.closedAt && t.closedAt.slice(0, 10) === date
    return open || close
  })

  if (!dayTrades.length) {
    return dayPnl > 0 ? 'Ativos valorizaram' : 'Ativos desvalorizaram'
  }

  // Trade dominante: maior |resultAmount| entre os trades do dia
  const dominant = dayTrades.reduce((best, t) => {
    const tAbs = Math.abs(t.resultAmount ?? 0)
    const bestAbs = Math.abs(best.resultAmount ?? 0)
    return tAbs > bestAbs ? t : best
  })

  // Conta trades do mesmo ticker no dia
  const sameTicker = dayTrades.filter((t) => t.ticker === dominant.ticker)
  const sameTickerWinners = sameTicker.filter((t) => (t.resultAmount ?? 0) > 0)
  const sameTickerLosers = sameTicker.filter((t) => (t.resultAmount ?? 0) < 0)

  const isWin = (dominant.resultAmount ?? 0) > 0
  const ticker = dominant.ticker
  const kind = dominant.kind

  // Casos especiais primeiro
  if (dominant.side === 'DIVIDEND') return `Provento de ${ticker}`
  if (dominant.side === 'JCP') return `JCP de ${ticker}`

  // Sequencias do mesmo ticker
  if (kind === 'day' && sameTicker.length >= 2) {
    if (sameTickerWinners.length >= 2 && sameTickerLosers.length === 0) {
      return `${sameTickerWinners.length} day-trades vencedoras em ${ticker}`
    }
    if (sameTickerLosers.length >= 2 && sameTickerWinners.length === 0) {
      return `${sameTickerLosers.length} stops em sequência em ${ticker}`
    }
    return `Sequência mista de day-trades em ${ticker}`
  }

  // Trade unico dominante por estilo
  if (kind === 'day') {
    return isWin
      ? `Day-trade vencedor em ${ticker}`
      : `Stop em day-trade de ${ticker}`
  }
  if (kind === 'swing') {
    return isWin
      ? `Saída em alta de ${ticker} (swing)`
      : `Stop de swing em ${ticker}`
  }
  // hold: posicao aberta ou fechada apos >30d
  if (!dominant.closedAt) {
    return isWin
      ? `${ticker} valorizou`
      : `${ticker} desvalorizou`
  }
  return isWin
    ? `Realização de hold em ${ticker}`
    : `Saída no vermelho de ${ticker}`
}

const cardStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
  boxShadow: `0 8px 22px -16px color-mix(in srgb, var(--brand-primary) 18%, transparent)`,
}))
</script>

<style scoped>
.equity {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid;
  position: relative;
  overflow: hidden;
}

.equity::before {
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

.equity__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  position: relative;
  flex-wrap: wrap;
}

.equity__eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.equity__head-right {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.equity__end-value {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
}

.equity__count {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.equity__markers-pill {
  cursor: default;
}

.equity__empty {
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

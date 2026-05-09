<!--
  MoleculesResultadoCarteira — orquestrador do MODO CARTEIRA.

  Estrutura editorial inspirada na /wallet (Visao geral): hero "respirando"
  sem box, SectionHeading entre blocos, cards com radial gradient ambient,
  radius 16px, hierarquia clara.

  Ordem de leitura:
    1. Hero P&L (eyebrow + h1 leve + meta line + sparkline)
    2. Period selector inline
    3. Distribuição (donut por estilo + bars por instrumento, pareados)
    4. Curva de resultado (full-width, gradient)
    5. Calendário heatmap
    6. Métricas operacionais (2 hero + 4 mini)
    7. Histórico de operações
    8. Leituras automatizadas
-->
<template>
  <div class="flex flex-col gap-10">
    <!-- ============ 1. HERO ============ -->
    <MoleculesResultadoCarteiraHero :stats="stats" :period="period" />

    <!-- ============ 2. PERIOD SELECTOR ============
         Inline a direita, com label sutil a esquerda. Mais discreto que
         a versao antiga (que tinha eyebrow grande + segmented). Aqui
         e ferramenta, nao section. -->
    <div class="flex flex-wrap items-center justify-between gap-3 -mt-2">
      <span
        class="font-mono-tab text-[10.5px] font-medium uppercase"
        :style="{ letterSpacing: '0.16em', color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
      >Janela de análise</span>
      <AtomsSegmented
        v-model="period"
        :options="periodOptions"
        size="sm"
        aria-label="Período do resultado"
      />
    </div>

    <!-- ============ 3. DISTRIBUIÇÃO ============ -->
    <section class="flex flex-col gap-4">
      <SectionHeading
        :brand="brand"
        eyebrow="Distribuição"
        title="Onde o seu resultado nasceu"
        lead="Estilo operacional vs classe de instrumento. Day-trade pode produzir muitas operações sem mover o ponteiro; um único hold de longo prazo pode definir o ano inteiro."
      />
      <MoleculesResultadoCarteiraDistribution :stats="stats" />
    </section>

    <!-- ============ 4. CURVA DE RESULTADO ============ -->
    <section class="flex flex-col gap-4">
      <SectionHeading
        :brand="brand"
        eyebrow="Curva"
        title="Como o P&L se acumulou"
      />
      <MoleculesResultadoCarteiraEquityCurve
        :series="stats.cumulativeSeries"
        :daily-series="stats.dailySeries"
        :trades="stats.trades"
      />
    </section>

    <!-- ============ 5. MÉTRICAS OPERACIONAIS ============ -->
    <section class="flex flex-col gap-4">
      <SectionHeading
        :brand="brand"
        eyebrow="Métricas"
        title="Como você performou"
        lead="Win rate e profit factor sao as metricas que melhor revelam consistencia. Tudo abaixo dimensiona o tamanho dos ganhos vs perdas e como voce se compara aos benchmarks brasileiros."
      />
      <MoleculesResultadoCarteiraMetrics :stats="stats" :period="period" />
    </section>

    <!-- ============ 6. HISTÓRICO ============ -->
    <section class="flex flex-col gap-4">
      <SectionHeading
        :brand="brand"
        eyebrow="Histórico"
        title="Operações no período"
      />
      <MoleculesResultadoCarteiraTradesTable :trades="stats.trades" />
    </section>

    <!-- ============ 7. LEITURAS ============ -->
    <section class="flex flex-col gap-4">
      <SectionHeading
        :brand="brand"
        eyebrow="Leituras"
        title="O que os números estão dizendo"
        lead="Padrões matematicos do periodo, sem palpite. Aqui voce ve sinais como 'win rate alto + profit factor baixo' (R:R ruim) ou 'concentracao excessiva em um ticker'."
      />
      <MoleculesResultadoCarteiraInsights :stats="stats" />
    </section>

    <!-- ============ 8. CALENDÁRIO HEATMAP (ENORME, FECHAMENTO DA PAGE) ============
         Vive no final pra dar fechamento visual a pagina. Em modo
         "huge" o heatmap toma a tela toda — celulas grandes com
         numero do dia visivel, eixo de dias da semana a esquerda,
         meses generosos. Funciona como overview agregado depois de
         o user ja ter contemplado curva, metricas, historico.

         IMPORTANTE: o calendario NAO usa stats.dailySeries (que filtra
         pelo period selector). Ele tem janela FIXA de 6 meses,
         independente do period selecionado, porque o objetivo aqui
         e dar uma visao macro do regime do trader recente. Filtros
         de janela curta (7d/30d) tornariam o heatmap inutilmente
         vazio. Computamos a serie diretamente de `props.trades`. -->
    <section class="flex flex-col gap-4">
      <SectionHeading
        :brand="brand"
        eyebrow="Calendário"
        title="Resultado dia a dia"
        lead="Janela fixa dos últimos 6 meses. Cada celula e um dia. Quanto mais saturada, maior o impacto. Verde = lucro, vermelho = perda, neutro = sem operacao."
      />
      <MoleculesResultadoCarteiraHeatmap
        :series="last6MonthsSeries"
        :period="period"
        :trades="props.trades"
        size="huge"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { MockTrade } from '~/composables/useMockTrades'
import type { DailyPnLPoint, ResultPeriod } from '~/composables/useResultadoStats'

const props = defineProps<{
  trades: MockTrade[]
}>()

const brand = useBrand()
const period = ref<ResultPeriod>('30d')
const tradesRef = computed(() => props.trades)
const { stats: statsComputed } = useResultadoStats(tradesRef, period)
const stats = computed(() => statsComputed.value)

// ============ 6-month daily series (calendario heatmap) ============
// Janela fixa, sem depender do period selector. Agregamos `props.trades`
// diretamente em P&L diario nos ultimos 180 dias (~6 meses corridos).
// Esta logica espelha o que `useResultadoStats.dailySeries` faz, mas
// num escopo independente. Quando o backend real entrar (Fase 3),
// movemos isso pra um helper compartilhado.
const last6MonthsSeries = computed<DailyPnLPoint[]>(() => {
  const now = Date.now()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const startMs = sixMonthsAgo.getTime()

  const dailyMap = new Map<string, { pnl: number; trades: number }>()
  for (const t of props.trades) {
    const ref = t.closedAt ?? t.openedAt
    const dateMs = new Date(ref).getTime()
    if (!Number.isFinite(dateMs) || dateMs < startMs || dateMs > now) continue
    const date = ref.slice(0, 10)
    const cur = dailyMap.get(date) || { pnl: 0, trades: 0 }
    cur.pnl += t.resultAmount ?? 0
    cur.trades += 1
    dailyMap.set(date, cur)
  }

  return Array.from(dailyMap.entries())
    .map(([date, v]) => ({ date, pnl: v.pnl, trades: v.trades }))
    .sort((a, b) => a.date.localeCompare(b.date))
})

const periodOptions = [
  { value: '7d' as const, label: '7d' },
  { value: '30d' as const, label: '30d' },
  { value: '90d' as const, label: '90d' },
  { value: 'ytd' as const, label: 'YTD' },
  { value: '12m' as const, label: '12m' },
  { value: 'all' as const, label: 'Tudo' },
]
</script>

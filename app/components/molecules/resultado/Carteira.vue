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
    <!-- ============ 1. HERO ============
         Usa stats ALL-TIME (nao period-filtrado) — pra carteira, P&L
         e o estado total HOJE: realizado historico + unrealized
         atual + renda passiva total. Period selector afeta apenas
         os blocos abaixo (curva, distribuicao, metricas). -->
    <MoleculesResultadoCarteiraHero
      :stats="allTimeStats"
      :period="period"
      label-override="Total da carteira"
    />

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
        :series="equityCurveSlice.length ? equityCurveSlice : stats.cumulativeSeries"
        :daily-series="equityDailySlice.length ? equityDailySlice : stats.dailySeries"
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

    <!-- ============ 6. POSIÇÕES EM ABERTO ============
         Mostra o que esta carregando na carteira AGORA, com P&L
         unrealized (mark-to-market). Substitui a tabela antiga de
         operacoes fechadas — o user quer ver "o que tenho hoje e
         quanto estou ganhando/perdendo nelas", nao "o que fechei
         no periodo". Operacoes fechadas viraram dado de
         backend (drill-down do heatmap, equity curve). -->
    <MoleculesResultadoCarteiraOpenPositions :trades="allTimeStats.trades" />

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
      <div class="flex flex-wrap items-end justify-between gap-3">
        <SectionHeading
          :brand="brand"
          eyebrow="Calendário"
          :title="heatmapMode === 'sells' ? 'Resultado dia a dia' : 'Proventos dia a dia'"
          :lead="heatmapMode === 'sells'
            ? 'Janela fixa dos últimos 6 meses. Verde = vendas com lucro, vermelho = vendas com prejuízo.'
            : 'Janela fixa dos últimos 6 meses. Verde = dias com dividendos, JCP ou rendimentos de FII creditados.'"
        />
        <AtomsSegmented
          v-model="heatmapMode"
          :options="heatmapModeOptions"
          size="sm"
          aria-label="Tipo de evento no calendário"
        />
      </div>
      <MoleculesResultadoCarteiraHeatmap
        :series="heatmapSeries"
        :period="period"
        :trades="props.trades"
        :mode="heatmapMode"
        size="huge"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { MockTrade } from '~/composables/useMockTrades'
import type { DailyPnLPoint, ResultPeriod } from '~/composables/useResultadoStats'
import type { EquityCurvePoint } from '~/services/portfolioTrades'

const props = defineProps<{
  trades: MockTrade[]
}>()

const brand = useBrand()
const period = ref<ResultPeriod>('30d')
const tradesRef = computed(() => props.trades)
const { stats: statsComputed } = useResultadoStats(tradesRef, period)
const stats = computed(() => statsComputed.value)

// Stats all-time pro Hero — P&L da carteira nao tem janela; mark-to-market
// agregado e historico realizado sempre presentes. So gerou no Hero pra
// nao reprocessar nas demais sections (que sao period-filtered).
const allTimePeriod = ref<ResultPeriod>('all')
const { stats: allTimeStatsComputed } = useResultadoStats(tradesRef, allTimePeriod)
const allTimeStats = computed(() => allTimeStatsComputed.value)

// ============ Equity curve REAL (mark-to-market diario) ============
// Carrega do backend a evolucao do P&L da carteira dia a dia, com
// preco historico de cada ativo. Diferente do cumulativeSeries
// client-side (que so soma resultAmount em datas de close), essa
// curva reflete a variacao real dos ativos ponderada pelo peso.
const tradesService = usePortfolioTradesService()
const equityCurveAll = ref<EquityCurvePoint[]>([])

onMounted(async () => {
  try {
    const resp = await tradesService.getEquityCurve()
    equityCurveAll.value = resp.data
  } catch (err) {
    console.warn('[carteira] equity-curve fetch failed', err)
  }
})

// Recorta a curva pelo period selector: filtra pontos cuja data caia
// na janela. Mantem o equity ABSOLUTO (nao re-baseia), pra que o
// ultimo ponto sempre bata com o numero do Hero — independente do
// period selecionado, o usuario sempre ve "onde a carteira esta hoje".
const equityCurveSlice = computed<DailyPnLPoint[]>(() => {
  const all = equityCurveAll.value
  if (!all.length) return []

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const startMs = (() => {
    switch (period.value) {
      case '7d': return now - 7 * day
      case '30d': return now - 30 * day
      case '90d': return now - 90 * day
      case 'ytd': return new Date(new Date().getFullYear(), 0, 1).getTime()
      case '12m': return now - 365 * day
      case 'all': return 0
    }
  })()

  const inWindow = all.filter((p) => new Date(p.date).getTime() >= startMs)
  if (!inWindow.length) return []

  return inWindow.map((p) => ({
    date: p.date,
    pnl: p.equity,
    trades: 0,
  }))
})

const equityDailySlice = computed<DailyPnLPoint[]>(() => {
  // Variacao diaria (delta entre dias consecutivos) pra detectar dias notaveis
  const slice = equityCurveSlice.value
  if (slice.length < 2) return slice
  const out: DailyPnLPoint[] = []
  for (let i = 1; i < slice.length; i++) {
    out.push({
      date: slice[i]!.date,
      pnl: slice[i]!.pnl - slice[i - 1]!.pnl,
      trades: 0,
    })
  }
  return out
})

// ============ Heatmap mode toggle ============
// User pode alternar o calendario entre:
//   - 'sells'    → so vendas/operacoes fechadas (P&L de fato realizado)
//   - 'dividends' → so dividendos / JCP / income (recebimentos passivos)
// Isso permite responder duas perguntas distintas:
//   "em que dias eu ganhei dinheiro VENDENDO?"
//   "em que dias caiu provento na conta?"
type HeatmapMode = 'sells' | 'dividends'
const heatmapMode = ref<HeatmapMode>('sells')
const heatmapModeOptions = [
  { value: 'sells' as const, label: 'Resultado' },
  { value: 'dividends' as const, label: 'Proventos' },
]

// ============ 6-month daily series (calendario heatmap) ============
// Helper: agrega trades em P&L diario nos ultimos 6 meses, com filtro
// de side opcional. Janela fixa — independe do period selector.
function build6mSeries(filter: (t: MockTrade) => boolean): DailyPnLPoint[] {
  const now = Date.now()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const startMs = sixMonthsAgo.getTime()

  const dailyMap = new Map<string, { pnl: number; trades: number }>()
  for (const t of props.trades) {
    if (!t.closedAt) continue
    if (!filter(t)) continue
    const dateMs = new Date(t.closedAt).getTime()
    if (!Number.isFinite(dateMs) || dateMs < startMs || dateMs > now) continue
    const date = t.closedAt.slice(0, 10)
    const cur = dailyMap.get(date) || { pnl: 0, trades: 0 }
    cur.pnl += t.resultAmount ?? 0
    cur.trades += 1
    dailyMap.set(date, cur)
  }
  return Array.from(dailyMap.entries())
    .map(([date, v]) => ({ date, pnl: v.pnl, trades: v.trades }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// Vendas / operacoes fechadas: tudo que NAO e provento
const sellsSeries = computed<DailyPnLPoint[]>(() =>
  build6mSeries((t) => !isIncomeTrade(t)),
)
// Proventos: DIVIDEND + JCP + INCOME (rendimento de FII)
const dividendsSeries = computed<DailyPnLPoint[]>(() =>
  build6mSeries(isIncomeTrade),
)

function isIncomeTrade(t: MockTrade): boolean {
  return t.side === 'DIVIDEND' || t.side === 'JCP' || t.side === 'INCOME'
}

const heatmapSeries = computed<DailyPnLPoint[]>(() =>
  heatmapMode.value === 'sells' ? sellsSeries.value : dividendsSeries.value,
)

const periodOptions = [
  { value: '7d' as const, label: '7d' },
  { value: '30d' as const, label: '30d' },
  { value: '90d' as const, label: '90d' },
  { value: 'ytd' as const, label: 'YTD' },
  { value: '12m' as const, label: '12m' },
  { value: 'all' as const, label: 'Tudo' },
]
</script>

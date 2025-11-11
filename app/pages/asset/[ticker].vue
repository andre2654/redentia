<template>
  <NuxtLayout>
    <template #header>
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center gap-3">
          <USkeleton v-if="isLoadingAsset" class="h-6 w-6 rounded-full" />
          <img
            v-else-if="asset?.logo"
            :src="asset.logo"
            alt="Asset Logo"
            class="h-6 w-6 rounded-full"
          />
          <h1 class="min-w-max font-medium max-md:text-[20px]">
            <span>{{ ticker }}</span>
          </h1>
          <div class="flex items-center gap-2 text-sm">
            <USkeleton v-if="isLoadingAsset" class="h-4 w-[80px]" />
            <template v-else>
              <span>R$ {{ asset?.market_price }}</span>
              <span
                :class="[
                  asset?.change_percent > 0 ? 'text-green-400' : 'text-red-400',
                ]"
                >({{ asset?.change_percent }}% hoje)</span
              >
            </template>
          </div>
        </div>
        <!-- <UButton
          color="neutral"
          variant="link"
          icon="i-lucide-plus"
          :ui="{
            leadingIcon: 'size-5',
            base: 'text-[13px] gap-2',
          }"
        >
          <span class="max-md:hidden">Adicione à carteira</span>
        </UButton> -->
      </div>
    </template>

    <div class="flex flex-col gap-8 pt-6 md:px-6">
      <!-- Graph -->
      <section>
        <header
          class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between max-md:px-4"
        >
          <h2 class="text-lg font-semibold text-white">
            Cotação <span class="hidden sm:inline">({{ ticker }})</span>
          </h2>
          <UButtonGroup orientation="horizontal" variant="soft">
            <UButton
              color="neutral"
              :variant="selectedTimeRange === 'month' ? 'soft' : 'link'"
              label="Mês"
              :disabled="isLoadingChart"
              @click="selectedTimeRange = 'month'"
            />
            <UButton
              color="neutral"
              :variant="selectedTimeRange === 'year' ? 'soft' : 'link'"
              label="Ano"
              :disabled="isLoadingChart"
              @click="selectedTimeRange = 'year'"
            />
            <UButton
              color="neutral"
              :variant="selectedTimeRange === 'ytd' ? 'soft' : 'link'"
              label="Ano até hoje"
              :disabled="isLoadingChart"
              @click="selectedTimeRange = 'ytd'"
            />
          </UButtonGroup>
        </header>
        <AtomsGraphLine
          :data="chartData"
          :legend="chartLabel"
          :height="320"
          :loading="isLoadingChart"
        />
      </section>

      <!-- Asset Indicators -->
      <section
        class="rounded-3xl md:border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm"
      >
        <header class="mb-4 flex flex-col gap-2">
          <h2 class="text-lg font-semibold text-white">Indicadores</h2>
          <p class="text-sm text-white/60">
            Principais métricas fundamentalistas e inteligência automatizada
            para {{ ticker }}.
          </p>
        </header>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <template v-if="isLoadingFundamentus">
            <USkeleton
              v-for="i in 6"
              :key="`basic-loading-${i}`"
              class="h-20 w-full rounded-xl"
            />
          </template>
          <template v-else-if="fundamentusData">
            <MoleculesTickerIndicator
              name="P/L"
              :value="
                parseFloat(fundamentusData.key_statistics.forward_pe).toFixed(1)
              "
              help-text="Preço sobre Lucro - indica quantos anos seriam necessários para recuperar o investimento."
            />
            <MoleculesTickerIndicator
              name="P/VPA"
              :value="
                parseFloat(
                  fundamentusData.key_statistics.price_to_book
                ).toFixed(2)
              "
              help-text="Preço sobre Valor Patrimonial por Ação - compara o preço da ação com seu valor contábil."
            />
            <MoleculesTickerIndicator
              name="Dividend Yield"
              :value="
                parseFloat(
                  fundamentusData.key_statistics.dividend_yield
                ).toFixed(1) + '%'
              "
              help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
            />
            <MoleculesTickerIndicator
              name="ROE"
              :value="
                (
                  parseFloat(fundamentusData.financial_data.return_on_equity) *
                  100
                ).toFixed(1) + '%'
              "
              help-text="Return on Equity - rentabilidade sobre o patrimônio líquido."
            />
            <MoleculesTickerIndicator
              name="ROA"
              :value="
                (
                  parseFloat(fundamentusData.financial_data.return_on_assets) *
                  100
                ).toFixed(1) + '%'
              "
              help-text="Return on Assets - rentabilidade sobre os ativos totais."
            />
            <MoleculesTickerIndicator
              name="Margem Líquida"
              :value="
                (
                  parseFloat(fundamentusData.financial_data.profit_margins) *
                  100
                ).toFixed(1) + '%'
              "
              help-text="Percentual do lucro líquido em relação à receita total."
            />
          </template>
          <template v-else>
            <div
              class="col-span-full rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/50"
            >
              Dados fundamentalistas indisponíveis no momento.
            </div>
          </template>
        </div>

        <h2 class="mt-8 text-lg font-semibold text-white">
          Indicadores inteligentes
        </h2>

        <div
          class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <template v-if="isLoadingFundamentus">
            <USkeleton
              v-for="i in 4"
              :key="`smart-loading-${i}`"
              class="h-20 w-full rounded-xl"
            />
          </template>
          <template v-else-if="intelligentIndicators">
            <MoleculesTickerIndicator
              name="Endividamento (D/E)"
              :value="intelligentIndicators.debtToEquity.value + '%'"
              help-text="Relação entre dívida total e patrimônio líquido. Valores baixos são melhores."
              is-intelligent
              :help-text-with-tooltip="false"
            />
            <MoleculesTickerIndicator
              name="Liquidez Corrente"
              :value="intelligentIndicators.currentRatio.value"
              help-text="Capacidade de pagamento das obrigações de curto prazo."
              is-intelligent
              :help-text-with-tooltip="false"
            />
            <MoleculesTickerIndicator
              name="Rentabilidade (ROE)"
              :value="intelligentIndicators.roe.value"
              help-text="Retorno sobre o patrimônio líquido dos acionistas."
              is-intelligent
              :help-text-with-tooltip="false"
            />
            <MoleculesTickerIndicator
              name="Eficiência (ROA)"
              :value="intelligentIndicators.roa.value"
              help-text="Retorno sobre os ativos totais da empresa."
              is-intelligent
              :help-text-with-tooltip="false"
            />
            <MoleculesTickerIndicator
              name="Margem de Lucro"
              :value="intelligentIndicators.profitMargin.value"
              help-text="Percentual de lucro líquido sobre a receita total."
              is-intelligent
              :help-text-with-tooltip="false"
            />
            <MoleculesTickerIndicator
              name="Valuation P/VPA"
              :value="intelligentIndicators.priceToBook.value"
              help-text="Preço da ação dividido pelo valor patrimonial por ação."
              is-intelligent
              :help-text-with-tooltip="false"
            />
            <MoleculesTickerIndicator
              name="Preço/Lucro Projetado"
              :value="intelligentIndicators.forwardPE.value"
              help-text="Projeção de P/L baseada nos lucros futuros estimados."
              is-intelligent
              :help-text-with-tooltip="false"
            />
            <MoleculesTickerIndicator
              name="Dividend Yield"
              :value="intelligentIndicators.dividendYield.value"
              help-text="Relação entre dividendos pagos e preço atual da ação."
              is-intelligent
              :help-text-with-tooltip="false"
            />
          </template>
          <template v-else>
            <div
              class="col-span-full rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/50"
            >
              Indicadores inteligentes indisponíveis.
            </div>
          </template>
        </div>
      </section>

      <!-- Dividends Chart -->
      <section class="max-md:px-4">
        <AtomsGraphDividends
          :data="dividendsData"
          :loading="isLoadingDividends"
        />
      </section>

      <!-- Financial Statements -->
      <section class="max-md:px-4">
        <header class="mb-5 flex flex-col gap-2">
          <h2 class="text-lg font-semibold text-white">
            Demonstrações Financeiras
          </h2>
          <p class="text-sm text-white/60">
            Visão rápida dos resultados, caixa e balanço mais recentes.
          </p>
        </header>

        <div
          v-if="
            cashFlowItems.length ||
            balanceItems.length ||
            incomeItems.length ||
            isLoadingFundamentus
          "
          class="grid gap-4 lg:grid-cols-3"
        >
          <AtomsGraphFinancialSummary
            title="Fluxo de Caixa"
            :items="cashFlowItems"
            :is-loading="isLoadingFundamentus"
          />
          <AtomsGraphFinancialSummary
            title="Balanço Patrimonial"
            :items="balanceItems"
            :is-loading="isLoadingFundamentus"
          />
          <AtomsGraphFinancialSummary
            title="Demonstração de Resultados"
            :items="incomeItems"
            :is-loading="isLoadingFundamentus"
          />
        </div>
        <div
          v-else
          class="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/50"
        >
          Demonstrações financeiras indisponíveis para este ativo.
        </div>
      </section>

      <!-- Asset Info -->
      <section class="max-md:px-4">
        <header class="mb-4 flex items-center gap-4">
          <USkeleton v-if="isLoadingAsset" class="h-16 w-16 rounded-2xl" />
          <img
            v-else-if="asset?.logo"
            :src="asset.logo"
            alt="Asset Logo"
            class="h-16 w-16 rounded-2xl object-cover"
          />
          <div class="flex flex-col gap-1">
            <USkeleton v-if="isLoadingAsset" class="h-4 w-32" />
            <template v-else>
              <span class="text-sm text-white/60">Resumo do ativo</span>
              <h3 class="text-lg font-semibold text-white">
                {{ asset?.ticker }} • {{ asset?.name }}
              </h3>
            </template>
          </div>
        </header>
        <div class="grid gap-2 text-sm text-white/70">
          <USkeleton v-if="isLoadingAsset" class="h-4 w-40" />
          <template v-else>
            <p v-if="asset?.sector">
              Setor: <span class="text-white/90">{{ asset.sector }}</span>
            </p>
            <p v-if="asset?.industry">
              Indústria: <span class="text-white/90">{{ asset.industry }}</span>
            </p>
            <p v-if="asset?.website">
              Site oficial:
              <a
                :href="asset.website"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary underline"
              >
                {{ asset.website }}
              </a>
            </p>
            <p v-if="asset?.long_business_summary" class="text-white/60">
              {{ asset.long_business_summary }}
            </p>
          </template>
        </div>
      </section>

      <MoleculesChat
        class="w-full bg-black/10 dark:bg-white/10"
        routePath="/ticker"
        :ticker="ticker"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ChartTimeRange } from '~/types/chart'
import type { FundamentusApiResponse, FundamentusData } from '~/types/asset'
import { generateChartConfig } from '~/helpers/utils'

const route = useRoute()
const {
  assetHistoricPrices,
  getTickerDetails,
  getTickerDividends,
  getTickerFundamentus,
} = useAssetsService()

interface DividendData {
  ticker: string
  payment_date: string
  rate: string
  label: string
}

const ticker = route.params.ticker as string
const asset = ref()
const isLoadingAsset = ref(true)
const dividendsData = ref<DividendData[]>([])
const isLoadingDividends = ref(false)
const fundamentusData = ref<FundamentusApiResponse | null>(null)
const isLoadingFundamentus = ref(false)
const selectedTimeRange = ref<ChartTimeRange>('month')
const isLoadingChart = ref(true)

interface ChartPoint {
  date: string
  value: number
  timestamp: number
}
const chartData = ref<ChartPoint[]>([])

// Mantém apenas o label do chartConfig
const chartLabel = computed(
  () =>
    generateChartConfig({
      timeRange: selectedTimeRange.value,
      label: ticker.toUpperCase(),
      basePrice: asset.value?.close || 100,
    }).legend
)

async function fetchChartData() {
  isLoadingChart.value = true
  let period: '1mo' | 'ytd' | '12mo' = '1mo'
  if (selectedTimeRange.value === 'month') period = '1mo'
  else if (selectedTimeRange.value === 'year') period = '12mo'
  else if (selectedTimeRange.value === 'ytd') period = 'ytd'
  const data = await assetHistoricPrices(ticker, period)
  // Transforma para o formato aceito pelo gráfico
  chartData.value = Array.isArray(data)
    ? data.map((item) => ({
        date: item.price_at,
        value: item.market_price,
        timestamp: new Date(item.price_at).getTime(),
      }))
    : []
  isLoadingChart.value = false
}

async function fetchDividendsData() {
  isLoadingDividends.value = true
  try {
    const data = await getTickerDividends(ticker)
    dividendsData.value = Array.isArray(data) ? data : []
  } catch {
    dividendsData.value = []
  }
  isLoadingDividends.value = false
}

async function fetchFundamentusData() {
  isLoadingFundamentus.value = true
  try {
    const data = await getTickerFundamentus(ticker)
    fundamentusData.value = data || null
  } catch {
    fundamentusData.value = null
  }
  isLoadingFundamentus.value = false
}

// Computed para transformar dados da API para formato dos gráficos
const transformedFundamentusData = computed((): FundamentusData | undefined => {
  if (!fundamentusData.value) return undefined

  const data = fundamentusData.value

  // Pega o período mais recente (primeiro item do array)
  const latestCashFlow =
    data.cash_flow?.quarterly?.[0] || data.cash_flow?.annual?.[0]
  const latestBalance =
    data.balance?.quarterly?.[0] || data.balance?.annual?.[0]
  const latestIncome = data.income?.quarterly?.[0] || data.income?.annual?.[0]

  return {
    // Indicadores básicos
    priceToEarnings: parseFloat(data.key_statistics?.forward_pe) || undefined,
    priceToBook: parseFloat(data.key_statistics?.price_to_book) || undefined,
    dividendYield: parseFloat(data.key_statistics?.dividend_yield) || undefined,
    roe: parseFloat(data.financial_data?.return_on_equity) || undefined,
    roa: parseFloat(data.financial_data?.return_on_assets) || undefined,
    netMargin: parseFloat(data.financial_data?.profit_margins) || undefined,

    // Demonstrações financeiras - usando dados mais recentes
    cashFlow: latestCashFlow
      ? {
          operatingCashFlow:
            parseFloat(latestCashFlow.operating_cash_flow) || undefined,
          investingCashFlow:
            parseFloat(latestCashFlow.investment_cash_flow) || undefined,
          financingCashFlow:
            parseFloat(latestCashFlow.financing_cash_flow) || undefined,
          freeCashFlow:
            parseFloat(data.financial_data?.free_cashflow) || undefined,
        }
      : undefined,

    balanceSheet: latestBalance
      ? {
          totalAssets: parseFloat(latestBalance.total_assets) || undefined,
          totalLiabilities: parseFloat(latestBalance.total_liab) || undefined,
          totalEquity: parseFloat(latestBalance.equity) || undefined,
          currentAssets: undefined, // Não disponível na estrutura atual
          currentLiabilities: undefined, // Não disponível na estrutura atual
          longTermDebt: latestBalance.long_term_debt
            ? parseFloat(latestBalance.long_term_debt)
            : undefined,
          cash: parseFloat(latestBalance.cash) || undefined,
        }
      : undefined,

    incomeStatement: latestIncome
      ? {
          totalRevenue: parseFloat(latestIncome.total_revenue) || undefined,
          grossProfit: parseFloat(latestIncome.gross_profit) || undefined,
          operatingIncome:
            parseFloat(latestIncome.operating_income) || undefined,
          netIncome: parseFloat(latestIncome.net_income) || undefined,
          ebitda: data.financial_data?.ebitda
            ? parseFloat(data.financial_data.ebitda)
            : undefined,
          operatingExpenses: undefined, // Não disponível diretamente, pode ser calculado
        }
      : undefined,
  }
})

const cashFlowItems = computed(() => {
  const cashFlow = transformedFundamentusData.value?.cashFlow
  if (!cashFlow) return []
  return [
    { label: 'Operacional', value: cashFlow.operatingCashFlow },
    { label: 'Investimento', value: cashFlow.investingCashFlow },
    { label: 'Financiamento', value: cashFlow.financingCashFlow },
    { label: 'Livre', value: cashFlow.freeCashFlow },
  ].flatMap((item) => {
    if (item.value === undefined || item.value === null) return []
    const numeric = Number(item.value)
    return Number.isFinite(numeric)
      ? [{ label: item.label, value: numeric }]
      : []
  })
})

const balanceItems = computed(() => {
  const balance = transformedFundamentusData.value?.balanceSheet
  if (!balance) return []
  return [
    { label: 'Ativos', value: balance.totalAssets },
    { label: 'Passivos', value: balance.totalLiabilities },
    { label: 'Patrimônio', value: balance.totalEquity },
    { label: 'Caixa', value: balance.cash },
    { label: 'Dívida LP', value: balance.longTermDebt },
  ].flatMap((item) => {
    if (item.value === undefined || item.value === null) return []
    const numeric = Number(item.value)
    return Number.isFinite(numeric)
      ? [{ label: item.label, value: numeric }]
      : []
  })
})

const incomeItems = computed(() => {
  const income = transformedFundamentusData.value?.incomeStatement
  if (!income) return []
  const derivedOperatingExpenses =
    income.operatingExpenses !== undefined && income.operatingExpenses !== null
      ? Number(income.operatingExpenses)
      : income.grossProfit !== undefined && income.operatingIncome !== undefined
        ? Number(income.grossProfit) - Number(income.operatingIncome)
        : undefined

  return [
    { label: 'Receita', value: income.totalRevenue },
    { label: 'Lucro Bruto', value: income.grossProfit },
    { label: 'Operacional', value: income.operatingIncome },
    { label: 'Lucro Líquido', value: income.netIncome },
    { label: 'EBITDA', value: income.ebitda },
    {
      label: 'Despesas',
      value:
        derivedOperatingExpenses !== undefined &&
        Number.isFinite(derivedOperatingExpenses)
          ? -Math.abs(derivedOperatingExpenses)
          : undefined,
    },
  ].flatMap((item) => {
    if (item.value === undefined || item.value === null) return []
    const numeric = Number(item.value)
    return Number.isFinite(numeric)
      ? [{ label: item.label, value: numeric }]
      : []
  })
})

// Computeds para indicadores inteligentes
const intelligentIndicators = computed(() => {
  if (!fundamentusData.value) return null

  const data = fundamentusData.value
  const stats = data.key_statistics
  const financial = data.financial_data

  // Cálculos de indicadores inteligentes
  const debtToEquityRatio = parseFloat(financial.debt_to_equity) || 0
  const currentRatio =
    parseFloat(financial.total_cash) /
      (financial.total_debt ? parseFloat(financial.total_debt) : 1) || 0
  const roe = parseFloat(financial.return_on_equity) * 100 || 0
  const roa = parseFloat(financial.return_on_assets) * 100 || 0
  const profitMargin = parseFloat(financial.profit_margins) * 100 || 0
  const priceToBook = parseFloat(stats.price_to_book) || 0
  const forwardPE = parseFloat(stats.forward_pe) || 0
  const dividendYield = parseFloat(stats.dividend_yield) || 0

  // Classificações baseadas em benchmarks do mercado
  const getDebtRating = (ratio: number) => {
    if (ratio < 30) return { label: 'Baixo', color: 'text-green-400' }
    if (ratio < 60) return { label: 'Moderado', color: 'text-yellow-400' }
    return { label: 'Alto', color: 'text-red-400' }
  }

  const getROERating = (roe: number) => {
    if (roe > 15) return { label: 'Excelente', color: 'text-green-400' }
    if (roe > 10) return { label: 'Bom', color: 'text-yellow-400' }
    return { label: 'Baixo', color: 'text-red-400' }
  }

  const getPERating = (pe: number) => {
    if (pe < 10) return { label: 'Barato', color: 'text-green-400' }
    if (pe < 20) return { label: 'Justo', color: 'text-yellow-400' }
    return { label: 'Caro', color: 'text-red-400' }
  }

  return {
    debtToEquity: {
      value: debtToEquityRatio.toFixed(1),
      rating: getDebtRating(debtToEquityRatio),
    },
    currentRatio: {
      value: currentRatio.toFixed(2),
      rating:
        currentRatio > 1
          ? { label: 'Saudável', color: 'text-green-400' }
          : { label: 'Preocupante', color: 'text-red-400' },
    },
    roe: { value: roe.toFixed(1) + '%', rating: getROERating(roe) },
    roa: {
      value: roa.toFixed(1) + '%',
      rating:
        roa > 5
          ? { label: 'Bom', color: 'text-green-400' }
          : { label: 'Baixo', color: 'text-red-400' },
    },
    profitMargin: {
      value: profitMargin.toFixed(1) + '%',
      rating:
        profitMargin > 10
          ? { label: 'Alta', color: 'text-green-400' }
          : { label: 'Baixa', color: 'text-red-400' },
    },
    priceToBook: {
      value: priceToBook.toFixed(2),
      rating:
        priceToBook < 1.5
          ? { label: 'Barato', color: 'text-green-400' }
          : { label: 'Caro', color: 'text-red-400' },
    },
    forwardPE: { value: forwardPE.toFixed(1), rating: getPERating(forwardPE) },
    dividendYield: {
      value: dividendYield.toFixed(2) + '%',
      rating:
        dividendYield > 5
          ? { label: 'Alto', color: 'text-green-400' }
          : { label: 'Baixo', color: 'text-red-400' },
    },
  }
})

// Busca inicial
onMounted(async () => {
  isLoadingAsset.value = true
  asset.value = await getTickerDetails(ticker)
  isLoadingAsset.value = false
  fetchChartData()
  fetchDividendsData()
  fetchFundamentusData()
})

// Atualiza ao trocar o período
watch(selectedTimeRange, () => {
  fetchChartData()
})
</script>

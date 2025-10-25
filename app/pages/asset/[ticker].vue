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
        <UButton
          color="neutral"
          variant="link"
          icon="i-lucide-plus"
          :ui="{
            leadingIcon: 'size-5',
            base: 'text-[13px] gap-2',
          }"
        >
          <span class="max-md:hidden">Adicione à carteira</span>
        </UButton>
      </div>
    </template>

    <!-- Graph -->
    <div class="w-full py-6">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="mb-4 text-lg font-semibold">
            Cotação <span class="max-md:hidden">da {{ ticker }}</span>
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
        </div>
        <AtomsGraphLine
          :data="chartData"
          :legend="chartLabel"
          :height="350"
          :loading="isLoadingChart"
        />
      </div>
    </div>

    <!-- Details in wallet -->
    <div
      class="dark:bg-tertiary/40 bg-tertiary flex w-full flex-col gap-3 rounded-[30px] px-6 py-4 text-white"
    >
      <button
        class="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-white/10"
        @click="seeMyInsights = !seeMyInsights"
      >
        <UIcon
          name="ic-round-arrow-forward-ios"
          class="transition-transform"
          :class="{
            'rotate-90': seeMyInsights,
          }"
        />
        <h2 class="text-lg font-semibold">Sua carteira</h2>
      </button>
      <div
        v-if="seeMyInsights"
        class="flex w-full gap-6 px-6 max-md:flex-col md:flex-wrap"
      >
        <MoleculesTickerIndicator
          name="Score de viabilidade"
          value="Alta"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          is-intelligent
          :help-text-with-tooltip="false"
        />
        <MoleculesTickerIndicator
          name="Grau de Endividamento Inteligente"
          value="Baixo"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          is-intelligent
          :help-text-with-tooltip="false"
        /><MoleculesTickerIndicator
          name="Proteção do Minoritário"
          value="Alto"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          is-intelligent
          :help-text-with-tooltip="false"
        />
      </div>
    </div>

    <!-- Asset Details -->
    <div class="flex flex-col gap-4 p-4">
      <h2 class="mb-4 px-6 text-lg font-bold">Indicadores básicos</h2>
      <div
        class="grid w-full grid-cols-3 gap-6 px-6 lg:grid-cols-6 xl:grid-cols-10"
      >
        <template v-if="isLoadingFundamentus">
          <USkeleton v-for="i in 6" :key="i" class="h-16 w-full rounded-lg" />
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
              parseFloat(fundamentusData.key_statistics.price_to_book).toFixed(
                2
              )
            "
            help-text="Preço sobre Valor Patrimonial por Ação - compara o preço da ação com seu valor contábil."
          />
          <MoleculesTickerIndicator
            name="D.Y."
            :value="
              parseFloat(fundamentusData.key_statistics.dividend_yield).toFixed(
                1
              ) + '%'
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
                parseFloat(fundamentusData.financial_data.profit_margins) * 100
              ).toFixed(1) + '%'
            "
            help-text="Percentual do lucro líquido em relação à receita total."
          />
        </template>
        <template v-else>
          <div class="col-span-full text-center text-gray-500">
            Dados fundamentalistas indisponíveis
          </div>
        </template>
      </div>
      <button
        class="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-black/10 hover:dark:bg-white/10"
        @click="seeSmartIndicators = !seeSmartIndicators"
      >
        <UIcon
          name="ic-round-arrow-forward-ios"
          class="transition-transform"
          :class="{
            'rotate-90': seeSmartIndicators,
          }"
        />
        <h2 class="text-lg font-semibold">Indicadores inteligentes</h2>
      </button>
      <div
        v-if="seeSmartIndicators"
        class="flex w-full gap-6 px-6 max-md:flex-col md:flex-wrap"
      >
        <template v-if="isLoadingFundamentus">
          <USkeleton v-for="i in 4" :key="i" class="h-20 w-48 rounded-lg" />
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
        </template>
        <template v-else>
          <div class="col-span-full text-center text-gray-500">
            Indicadores inteligentes indisponíveis
          </div>
        </template>
      </div>

      <!-- Financial Statements -->
      <div class="mt-6 space-y-6">
        <h2 class="px-6 text-lg font-bold">Demonstrações Financeiras</h2>

        <!-- Cash Flow Section -->
        <div class="px-6">
          <h3
            class="text-md mb-4 font-semibold text-gray-700 dark:text-gray-300"
          >
            Fluxo de Caixa
          </h3>
          <AtomsGraphCashFlowPro
            :data="transformedFundamentusData"
            :is-loading="isLoadingFundamentus"
          />
        </div>

        <!-- Balance Sheet Section -->
        <div class="px-6">
          <h3
            class="text-md mb-4 font-semibold text-gray-700 dark:text-gray-300"
          >
            Balanço Patrimonial
          </h3>
          <AtomsGraphBalancePro
            :data="transformedFundamentusData"
            :is-loading="isLoadingFundamentus"
          />
        </div>

        <!-- Income Statement Section -->
        <div class="px-6">
          <h3
            class="text-md mb-4 font-semibold text-gray-700 dark:text-gray-300"
          >
            Demonstração de Resultados (DRE)
          </h3>
          <AtomsGraphIncomePro
            :data="transformedFundamentusData"
            :is-loading="isLoadingFundamentus"
          />
        </div>
      </div>
    </div>

    <!-- Dividends Chart -->
    <div class="flex flex-col gap-4 p-6">
      <AtomsGraphDividends
        :data="dividendsData"
        :loading="isLoadingDividends"
      />
    </div>

    <!-- Asset docs -->
    <div class="flex flex-col gap-4 p-4">
      <h2 class="text-lg font-bold">Documentos</h2>
      <label
        for="map-toggle"
        class="hover:bg-secondary/10 mt-3 flex max-w-fit items-center justify-between gap-4 rounded-full border px-3 py-2"
        :class="{
          'bg-secondary/15 dark:bg-tertiary/60 !border-tertiary':
            showRelevantDocs,
        }"
      >
        <IconAi class="fill-secondary h-5" />
        <h2 class="text-secondary select-none">Mostrar somente relevantes</h2>
        <USwitch
          id="map-toggle"
          v-model="showRelevantDocs"
          color="secondary"
          checked-icon="lucide-check"
          :ui="{
            base: 'data-[state=checked]:border-secondary',
          }"
        />
      </label>
      <div
        class="flex flex-col gap-2 rounded-[30px] border p-6"
        :class="{
          'bg-tertiary dark:bg-tertiary/40 !border-tertiary text-secondary':
            showRelevantDocs,
        }"
      >
        <div v-for="i in 10" :key="i" class="flex items-center justify-between">
          <div class="flex flex-col">
            <b class="text-[14px]"
              >- Esclarecimentos sobre questionamentos da CVM/B3 - Comunicado ao
              Mercado</b
            >
            <p class="text-[11px]">
              Negociações atípicas de valores mobiliários
            </p>
          </div>
          <AtomsButton> Ver </AtomsButton>
        </div>
      </div>
    </div>

    <!-- Asset Info -->
    <div class="flex flex-col gap-4 p-4">
      <USkeleton v-if="isLoadingAsset" class="h-[200px] w-[200px] rounded-lg" />
      <img
        v-else-if="asset?.logo"
        :src="asset.logo"
        alt="Asset Logo"
        class="h-[200px] w-[200px] rounded-lg"
      />
      <div class="grid gap-2">
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[250px]" />
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[200px]" />
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[180px]" />
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[160px]" />
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[120px]" />
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[100px]" />
        <template v-else>
          <b class="text-lg"
            >{{ asset?.ticker }} - {{ asset?.industry_category }}</b
          >
          <b class="text-lg"
            >{{ asset?.city }}, {{ asset?.state }} - {{ asset?.country }}</b
          >
          <b class="text-lg">Setor: {{ asset?.sector }}</b>
          <b class="text-lg">Funcionários: {{ asset?.employees }}</b>
          <a
            v-if="asset?.website"
            :href="asset.website"
            target="_blank"
            class="text-primary underline"
            >Site oficial</a
          >
          <p class="text-sm opacity-70">
            {{ asset?.long_business_summary }}
          </p>
        </template>
      </div>
    </div>

    <MoleculesChat class="w-full bg-black/10 dark:bg-white/10" routePath="/ticker" />
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
const showRelevantDocs = ref(true)
const seeMyInsights = ref(true)
const seeSmartIndicators = ref(true)
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

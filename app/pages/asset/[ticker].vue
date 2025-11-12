<template>
  <NuxtLayout container-class="md:px-0">
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

    <div class="flex flex-col gap-8 pt-6">
      <!-- Graph -->
      <section>
        <header
          class="mb-4 flex max-md:px-4 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
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
        <div class="relative max-md:px-4">
          <label
            class="absolute right-4 top-4 z-10 flex cursor-pointer items-center gap-2 text-xs text-white/70"
          >
            <input
              v-model="showBazinPrice"
              type="checkbox"
              class="h-4 w-4 rounded border-white/30 bg-transparent text-secondary focus:ring-secondary"
            />
            <span>Mostrar preço teto Bazin</span>
          </label>
          <AtomsGraphLine
            :data="chartData"
            :legend="chartLabel"
            :height="320"
            :loading="isLoadingChart"
            :markers="chartMarkers"
          />
        </div>
      </section>

      <!-- Asset Indicators -->
      <section
        class="rounded-3xl bg-white/5 p-6 backdrop-blur-sm"
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
              :value="dividendYieldDisplay"
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
              :value="dividendYieldDisplay"
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
        <div class="mb-6 rounded-3xl bg-white/5 p-4 backdrop-blur-sm">
          <div class="mb-3 flex items-center gap-2">
            <h3 class="text-sm font-semibold text-white">
              MDI
            </h3>
            <span v-if="isLoadingDividends" class="text-xs text-white/40">
              Carregando...
            </span>
            <span
              v-else-if="monthlyDividendProbability.referenceLabel"
              class="text-xs text-white/50"
            >
              {{ monthlyDividendProbability.referenceLabel }}
            </span>
            <span v-else class="text-xs text-white/40">
              (Sem histórico recente)
            </span>
          </div>
          <div
            v-if="isLoadingDividends"
            class="flex gap-2 overflow-x-auto pb-1"
          >
            <USkeleton
              v-for="month in 12"
              :key="`dividend-month-skeleton-${month}`"
              class="h-16 min-w-[72px] rounded-2xl"
            />
          </div>
          <div
            v-else
            class="flex flex-wrap gap-1 overflow-x-auto"
          >
            <div
              v-for="item in monthlyDividendProbability.months"
              :key="item.label"
              :class="[
                'flex min-w-[72px] flex-col items-center gap-1 rounded-2xl border px-2 py-1 text-center backdrop-blur-sm transition-colors',
                item.highlight
                  ? 'border-secondary bg-secondary/10'
                  : 'border-white/10 bg-white/5',
              ]"
            >
              <div
                :class="[
                  'flex items-center gap-1 text-xs font-medium uppercase tracking-wide',
                  item.highlight ? 'text-secondary' : 'text-white/70',
                ]"
              >
                <span>{{ item.label }}</span>
                <IconAi v-if="item.highlight" class="fill-secondary h-5" />
              </div>
              <span
                :class="[
                  'text-base font-semibold',
                  item.highlight ? 'text-secondary' : 'text-white',
                ]"
              >
                {{ item.formattedPercentage }}
              </span>
              <span class="text-[10px] text-white/40">prob.</span>
            </div>
          </div>
        </div>
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
          class="grid gap-2 lg:grid-cols-3"
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

      <!-- Buy & Hold Checklist -->
      <section class="max-md:px-4">
        <div class="rounded-3xl bg-white/5 p-6 backdrop-blur-sm">
          <header
            class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-center gap-2">
              <IconAi class="fill-secondary h-6 w-6" />
              <h2 class="text-lg font-semibold text-white">
                Checklist Buy & Hold
              </h2>
            </div>
            <span class="text-xs text-white/50">
              Dados analisados via Fundamentus e volume recente
            </span>
          </header>

          <div v-if="isLoadingFundamentus" class="grid gap-3 md:grid-cols-2">
            <USkeleton
              v-for="index in 6"
              :key="`checklist-skeleton-${index}`"
              class="h-24 rounded-2xl"
            />
          </div>
          <template v-else>
            <div
              v-if="buyAndHoldChecklist.length"
              class="grid gap-3 md:grid-cols-2"
            >
              <div
                v-for="item in buyAndHoldChecklist"
                :key="item.id"
                :class="[
                  'flex items-start gap-3 rounded-2xl border px-4 py-3 backdrop-blur-sm transition-colors',
                  item.status === 'pass'
                    ? 'border-secondary/60 bg-secondary/10'
                    : item.status === 'fail'
                      ? 'border-red-500/40 bg-red-500/5'
                      : 'border-white/10 bg-white/5',
                ]"
              >
                <div
                  :class="[
                    'flex h-9 w-9 items-center justify-center rounded-xl border',
                    item.status === 'pass'
                      ? 'border-secondary/60 bg-secondary/10 text-secondary'
                      : item.status === 'fail'
                        ? 'border-red-500/40 bg-red-500/10 text-red-300'
                        : 'border-white/10 bg-white/10 text-white/60',
                  ]"
                >
                  <UIcon
                    :name="
                      item.status === 'pass'
                        ? 'i-lucide-check'
                        : item.status === 'fail'
                          ? 'i-lucide-x'
                          : 'i-lucide-help-circle'
                    "
                    class="size-4"
                  />
                </div>
                <div class="flex flex-1 flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-white">
                      {{ item.label }}
                    </span>
                    <UTooltip
                      v-if="item.tooltip"
                      :text="item.tooltip"
                      :delay-duration="0"
                    >
                      <button
                        type="button"
                        class="text-white/40 transition-colors hover:text-white/80"
                      >
                        <UIcon name="i-lucide-info" class="size-4" />
                      </button>
                    </UTooltip>
                  </div>
                  <p
                    v-if="item.detail"
                    class="text-xs text-white/60"
                  >
                    {{ item.detail }}
                  </p>
                  <p
                    v-else-if="item.status === 'unknown'"
                    class="text-xs text-white/40"
                  >
                    Dados insuficientes para avaliar
                  </p>
                </div>
              </div>
            </div>
            <div
              v-else
              class="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/50"
            >
              Checklist indisponível no momento.
            </div>
          </template>
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
import type {
  AssetMdiEntry,
  FundamentusApiResponse,
  FundamentusData,
} from '~/types/asset'
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
  label?: string
  mdi?: AssetMdiEntry[]
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
const showBazinPrice = ref(true)

interface ChartPoint {
  date: string
  value: number
  timestamp: number
}
const chartData = ref<ChartPoint[]>([])

const monthLabels = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

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
  const dividendYield =
    dividendYieldPercent.value ??
    (Number.isFinite(parseFloat(stats.dividend_yield))
      ? parseFloat(stats.dividend_yield)
      : 0)

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

function extractMonthIndex(dateString: string | undefined) {
  if (!dateString) return null

  const parsedDate = new Date(dateString)
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.getUTCMonth()
  }

  const normalized = dateString.trim()
  const parts = normalized.includes('-')
    ? normalized.split('-')
    : normalized.split('/')

  if (parts.length >= 2) {
    const monthPart = parts[1]
    const monthIndex = Number.parseInt(monthPart, 10) - 1
    if (Number.isInteger(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      return monthIndex
    }
  }

  return null
}

const highlightedMonthsCount = 3

function selectLatestRecord<T extends { period_end_date?: string }>(
  ...sources: Array<T[] | null | undefined>
): T | null {
  const withDates = sources
    .flatMap((items) => items ?? [])
    .map((item) => {
      const date = item?.period_end_date ? new Date(item.period_end_date) : null
      if (!date || Number.isNaN(date.getTime())) return null
      return { item, timestamp: date.getTime() }
    })
    .filter(
      (entry): entry is { item: T; timestamp: number } => entry !== null
    )

  if (!withDates.length) return null

  withDates.sort((a, b) => b.timestamp - a.timestamp)
  return withDates[0].item
}

const aggregatedMdiEntries = computed<AssetMdiEntry[]>(() => {
  const fromDividends = dividendsData.value.find(
    (entry) => Array.isArray(entry.mdi) && entry.mdi.length
  )

  if (fromDividends?.mdi?.length) {
    return fromDividends.mdi
  }

  if (Array.isArray(asset.value?.mdi) && asset.value?.mdi.length) {
    return asset.value.mdi
  }

  return []
})

const dividendSumLastTwelveMonths = computed<number | null>(() => {
  if (!Array.isArray(dividendsData.value) || dividendsData.value.length === 0) {
    return null
  }

  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setFullYear(cutoff.getFullYear() - 1)

  let total = 0

  for (const record of dividendsData.value) {
    const rate = safeNumber(record?.rate)
    if (!Number.isFinite(rate) || rate === null || rate <= 0) continue

    const paymentDate = record?.payment_date ? new Date(record.payment_date) : null
    if (!paymentDate || Number.isNaN(paymentDate.getTime())) continue

    if (paymentDate < cutoff || paymentDate > now) continue

    total += rate
  }

  return total > 0 ? total : null
})

const dividendYieldLastTwelveMonths = computed<number | null>(() => {
  const totalDividends = dividendSumLastTwelveMonths.value
  if (!Number.isFinite(totalDividends) || totalDividends === null) return null

  const marketPrice =
    safeNumber((asset.value as { market_price?: unknown } | undefined)?.market_price) ??
    safeNumber((asset.value as { close?: unknown } | undefined)?.close)

  if (!Number.isFinite(marketPrice) || marketPrice === null || marketPrice <= 0) {
    return null
  }

  return totalDividends / marketPrice
})

const dividendYieldPercent = computed<number | null>(() => {
  const ratio = dividendYieldLastTwelveMonths.value
  if (!Number.isFinite(ratio) || ratio === null) return null
  return ratio * 100
})

const dividendYieldDisplay = computed(() => {
  const percentage = dividendYieldPercent.value
  if (percentage === null || Number.isNaN(percentage)) return '0.00%'
  return `${percentage.toFixed(2)}%`
})

const bazinPrice = computed<number | null>(() => {
  const dividendsTtm = dividendSumLastTwelveMonths.value
  if (!Number.isFinite(dividendsTtm) || dividendsTtm === null || dividendsTtm <= 0) {
    return null
  }

  const ceilingPrice = dividendsTtm * 16
  return Number.isFinite(ceilingPrice) ? ceilingPrice : null
})

const chartMarkers = computed(() =>
  showBazinPrice.value && bazinPrice.value !== null
    ? [
        {
          name: 'Preço teto Bazin',
          value: bazinPrice.value,
          color: '#a7d6ff',
        },
      ]
    : []
)

const monthlyDividendProbability = computed(() => {
  const baseMonths = monthLabels.map((label) => ({
    label,
    percentage: 0,
    formattedPercentage: '0%',
    highlight: false,
  }))

  const aggregated = aggregatedMdiEntries.value
  if (aggregated.length) {
    const totalYears = safeNumber(aggregated[0]?.total_years) ?? null
    const monthsWithPercentages = baseMonths.map((month, index) => {
      const stats = aggregated.find((item) => item.month === index + 1)
      const occurrences = stats ? Number(stats.occurrences ?? 0) : 0
      const divisor =
        safeNumber(stats?.total_years) ??
        totalYears ??
        (occurrences > 0 ? occurrences : 0)
      const percentage =
        divisor && divisor > 0 ? (occurrences / divisor) * 100 : 0
      const formattedPercentage =
        percentage === 0
          ? '0%'
          : percentage < 10
            ? `${percentage.toFixed(1)}%`
            : `${Math.round(percentage)}%`

      return {
        ...month,
        percentage,
        formattedPercentage,
      }
    })

    const topMonths = monthsWithPercentages
      .filter((item) => item.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, highlightedMonthsCount)
      .map((item) => item.label)

    const highlightSet = new Set(topMonths)

    const finalMonths = monthsWithPercentages.map((item) => ({
      ...item,
      highlight: highlightSet.has(item.label),
    }))

    const totalOccurrences = aggregated.reduce(
      (acc, item) => acc + Number(item.occurrences ?? 0),
      0
    )

    return {
      months: finalMonths,
      totalCount: totalYears ?? totalOccurrences,
      totalYears: totalYears ?? null,
      referenceLabel: totalYears
        ? `(Histórico de ${totalYears} anos)`
        : totalOccurrences
          ? `(Baseado em ${totalOccurrences} pagamentos)`
          : null,
    }
  }

  const records = dividendsData.value ?? []
  if (!records.length) {
    return {
      months: baseMonths,
      totalCount: 0,
      totalYears: null,
      referenceLabel: null,
    }
  }

  const counts = Array.from({ length: 12 }, () => 0)

  records.forEach((item) => {
    const monthIndex = extractMonthIndex(item.payment_date)
    if (monthIndex !== null) {
      counts[monthIndex] += 1
    }
  })

  const totalCount = counts.reduce((acc, value) => acc + value, 0)

  if (!totalCount) {
    return {
      months: baseMonths,
      totalCount,
      totalYears: null,
      referenceLabel: null,
    }
  }

  const monthsWithPercentages = baseMonths.map((month, index) => {
    const count = counts[index]
    const percentage = totalCount ? (count / totalCount) * 100 : 0
    const formattedPercentage =
      percentage === 0
        ? '0%'
        : percentage < 10
          ? `${percentage.toFixed(1)}%`
          : `${Math.round(percentage)}%`

    return {
      ...month,
      percentage,
      formattedPercentage,
    }
  })

  const topMonths = monthsWithPercentages
    .filter((item) => item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, highlightedMonthsCount)
    .map((item) => item.label)

  const highlightSet = new Set(topMonths)

  const finalMonths = monthsWithPercentages.map((item) => ({
    ...item,
    highlight: highlightSet.has(item.label),
  }))

  return {
    months: finalMonths,
    totalCount,
    totalYears: null,
    referenceLabel:
      totalCount > 0 ? `(Baseado em ${totalCount} pagamentos)` : null,
  }
})

function safeNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const trimmed = String(value).trim()
  if (!trimmed) return null

  const lastComma = trimmed.lastIndexOf(',')
  const lastDot = trimmed.lastIndexOf('.')
  const hasComma = lastComma !== -1
  const hasDot = lastDot !== -1

  let decimalSeparator: ',' | '.' | null = null
  if (hasComma && hasDot) {
    decimalSeparator = lastComma > lastDot ? ',' : '.'
  } else if (hasComma) {
    decimalSeparator = ','
  } else if (hasDot) {
    decimalSeparator = '.'
  }

  let standardized = trimmed
  if (decimalSeparator) {
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ','
    const parts = standardized.split(thousandsSeparator)
    standardized = parts.join('')
    if (decimalSeparator === ',') {
      standardized = standardized.replace(',', '.')
    }
  }

  const parsed = Number.parseFloat(standardized)
  return Number.isFinite(parsed) ? parsed : null
}

interface AnnualRecord {
  date: Date
  revenue: number | null
  netIncome: number | null
}

const annualIncomeRecords = computed<AnnualRecord[]>(() => {
  const annual = fundamentusData.value?.income?.annual ?? []

  return annual
    .map((item) => {
      const date = item.period_end_date ? new Date(item.period_end_date) : null
      if (!date || Number.isNaN(date.getTime())) return null

      return {
        date,
        revenue: safeNumber(item.total_revenue),
        netIncome: safeNumber(item.net_income),
      }
    })
    .filter((item): item is AnnualRecord => item !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
})

const latestBalanceSnapshot = computed(() =>
  selectLatestRecord(
    fundamentusData.value?.balance?.quarterly,
    fundamentusData.value?.balance?.annual
  )
)

type ChecklistStatus = 'pass' | 'fail' | 'unknown'

interface ChecklistItem {
  id: string
  label: string
  status: ChecklistStatus
  detail?: string | null
  tooltip?: string
}

const buyAndHoldChecklist = computed<ChecklistItem[]>(() => {
  const items: ChecklistItem[] = []

  if (!fundamentusData.value) return items

  const annual = annualIncomeRecords.value
  const today = new Date()
  const mdiEntries = aggregatedMdiEntries.value
  const totalYearsHistory = mdiEntries.length
    ? safeNumber(mdiEntries[0]?.total_years) ?? null
    : null

  const oldestAnnual = annual.at(-1)
  const firstAnnualDate = oldestAnnual?.date ?? null
  const availableYearsFromAnnual =
    firstAnnualDate !== null
      ? today.getFullYear() - firstAnnualDate.getFullYear() + 1
      : null
  const hasFiveYearsHistory =
    totalYearsHistory !== null
      ? totalYearsHistory >= 5
      : availableYearsFromAnnual !== null
        ? availableYearsFromAnnual >= 5
        : null
  const historyDetail =
    totalYearsHistory !== null
      ? `Histórico de ${totalYearsHistory} anos`
      : firstAnnualDate
        ? `Dados desde ${firstAnnualDate.getFullYear()}`
        : null

  let annualNeverNegative: boolean | null = null
  if (annual.length > 0) {
    if (annual.some((item) => item.netIncome === null)) {
      annualNeverNegative = null
    } else {
      annualNeverNegative = annual.every(
        (item) => (item.netIncome ?? 0) >= 0
      )
    }
  }

  const dividendYieldValue = dividendYieldPercent.value
  const dividendYieldAboveFive =
    dividendYieldValue !== null ? dividendYieldValue >= 5 : null

  const roeRaw = safeNumber(fundamentusData.value.financial_data?.return_on_equity)
  const roeValue = roeRaw !== null ? roeRaw * 100 : null
  const roeAboveTen = roeValue !== null ? roeValue >= 10 : null

  const roaRaw = safeNumber(
    fundamentusData.value.financial_data?.return_on_assets
  )
  const roaValue = roaRaw !== null ? roaRaw * 100 : null
  const roaAboveFive = roaValue !== null ? roaValue >= 5 : null

  const balanceSnapshot = latestBalanceSnapshot.value
  const totalEquity = safeNumber(balanceSnapshot?.equity)
  const totalDebt = safeNumber(
    fundamentusData.value?.financial_data?.total_debt
  )
  const totalLiabilities = safeNumber(balanceSnapshot?.total_liab)
  const debtComparisonSource =
    totalDebt !== null ? totalDebt : totalLiabilities
  const debtBelowEquity =
    debtComparisonSource !== null && totalEquity !== null
      ? debtComparisonSource <= totalEquity
      : null

  const netMarginRaw = safeNumber(
    fundamentusData.value.financial_data?.profit_margins
  )
  const netMarginValue = netMarginRaw !== null ? netMarginRaw * 100 : null
  const netMarginPositive =
    netMarginValue !== null ? netMarginValue > 0 : null

  const freeCashFlowRaw = safeNumber(
    fundamentusData.value.financial_data?.free_cashflow
  )
  const freeCashFlowPositive =
    freeCashFlowRaw !== null ? freeCashFlowRaw > 0 : null

  const marketCapValue = safeNumber(
    (asset.value as { market_cap?: unknown } | undefined)?.market_cap
  )
  const marketCapAboveOneB =
    marketCapValue !== null ? marketCapValue >= 1_000_000_000 : null

  const recentDividendYears = new Set<number>()
  const dividendDataAvailable = dividendsData.value.length > 0
  const currentYear = today.getFullYear()
  const targetYears = Array.from({ length: 5 }, (_, index) => currentYear - index)

  dividendsData.value.forEach((record) => {
    const date = record.payment_date ? new Date(record.payment_date) : null
    if (!date || Number.isNaN(date.getTime())) return
    const year = date.getFullYear()
    if (targetYears.includes(year)) {
      recentDividendYears.add(year)
    }
  })

  const paidDividendsLastFiveYears =
    targetYears.length > 0
      ? targetYears.every((year) => recentDividendYears.has(year))
      : null
  const sortedRecentDividendYears = Array.from(recentDividendYears).sort(
    (a, b) => a - b
  )

  const toStatus = (value: boolean | null | undefined): ChecklistStatus => {
    if (value === true) return 'pass'
    if (value === false) return 'fail'
    return 'unknown'
  }

  items.push({
    id: 'history',
    label: 'Mais de 5 anos de histórico',
    status: toStatus(hasFiveYearsHistory),
    detail: historyDetail,
    tooltip: 'Verifica se há demonstrações anuais disponíveis há pelo menos 5 anos.',
  })

  items.push({
    id: 'dividends-five-years',
    label: 'Pagou dividendos nos últimos 5 anos',
    status: toStatus(
      dividendDataAvailable ? paidDividendsLastFiveYears : null
    ),
    detail:
      dividendDataAvailable && sortedRecentDividendYears.length > 0
        ? `Pagamentos em: ${sortedRecentDividendYears.join(', ')} (${sortedRecentDividendYears.length}/5)`
        : dividendDataAvailable
          ? 'Sem pagamentos registrados no intervalo'
          : 'Histórico de dividendos indisponível',
    tooltip:
      'Verifica se houve pelo menos um pagamento de dividendos em cada um dos últimos 5 anos.',
  })

  items.push({
    id: 'annual-loss',
    label: 'Sem prejuízo em exercícios anuais recentes',
    status: toStatus(annualNeverNegative),
    detail:
      annualNeverNegative === false
        ? 'Há registros de prejuízo anual'
        : null,
    tooltip: 'Analisa os resultados fiscais anuais disponíveis.',
  })

  items.push({
    id: 'dividend-yield',
    label: 'Dividend Yield acima de 5%',
    status: toStatus(dividendYieldAboveFive),
    detail:
      dividendYieldValue !== null
        ? `Yield atual: ${dividendYieldValue.toFixed(2)}%`
        : null,
    tooltip: 'Usa o Dividend Yield informado pelo Fundamentus.',
  })

  items.push({
    id: 'roe',
    label: 'ROE acima de 10%',
    status: toStatus(roeAboveTen),
    detail:
      roeValue !== null ? `ROE atual: ${roeValue.toFixed(1)}%` : null,
    tooltip: 'Retorno sobre o patrimônio líquido da empresa.',
  })

  items.push({
    id: 'debt-equity',
    label: 'Dívida menor ou igual ao patrimônio',
    status: toStatus(debtBelowEquity),
    detail:
      debtComparisonSource !== null && totalEquity !== null
        ? `Dívida: R$ ${formatNumberToShort(debtComparisonSource)} • Patrimônio: R$ ${formatNumberToShort(totalEquity)}`
        : null,
    tooltip: 'Compara dívida total e patrimônio líquido mais recentes.',
  })

  items.push({
    id: 'market-cap',
    label: 'Market Cap maior que R$ 1B',
    status: toStatus(marketCapAboveOneB),
    detail:
      marketCapValue !== null
        ? `Market Cap: R$ ${formatNumberToShort(marketCapValue)}`
        : 'Market Cap indisponível',
    tooltip: 'Compara o valor de mercado atual com o patamar mínimo desejado.',
  })

  items.push({
    id: 'roa',
    label: 'ROA acima de 5%',
    status: toStatus(roaAboveFive),
    detail:
      roaValue !== null ? `ROA atual: ${roaValue.toFixed(1)}%` : null,
    tooltip: 'Retorno sobre os ativos totais da empresa.',
  })

  items.push({
    id: 'net-margin',
    label: 'Margem líquida positiva',
    status: toStatus(netMarginPositive),
    detail:
      netMarginValue !== null
        ? `Margem: ${netMarginValue.toFixed(1)}%`
        : null,
    tooltip: 'Verifica se a margem líquida consolidada está positiva.',
  })

  items.push({
    id: 'free-cashflow',
    label: 'Fluxo de caixa livre positivo',
    status: toStatus(freeCashFlowPositive),
    detail:
      freeCashFlowRaw !== null
        ? `FCF: R$ ${formatNumberToShort(freeCashFlowRaw)}`
        : 'Fluxo de caixa livre indisponível',
    tooltip: 'Verifica se a empresa gera caixa excedente após investimentos.',
  })

  return items
})

function formatNumberToShort(value: number): string {
  const absValue = Math.abs(value)
  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

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

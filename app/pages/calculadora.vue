<template>
  <div>
    <NuxtLayout title="Calculadora Inteligente">
      <div class="flex h-full flex-col gap-6 px-6 pb-8 pt-6">
        <!-- Descrição -->
        <div class="flex flex-col">
          <h2 class="text-[18px] font-bold">Planejamento financeiro</h2>
          <p class="text-[13px] font-extralight">
            Simule investimentos com juros compostos ou analise o histórico real
            de ações e FIIs.
          </p>
        </div>

        <!-- Selector de calculadora -->
        <div class="flex items-center justify-between gap-5 max-md:flex-col">
          <h2 class="text-lg font-semibold">Selecione a calculadora</h2>
          <UButtonGroup orientation="horizontal" variant="soft">
            <UButton
              color="neutral"
              :variant="selectedCalculator === 'compound' ? 'soft' : 'link'"
              label="Juros Compostos"
              @click="selectedCalculator = 'compound'"
            />
            <UButton
              color="neutral"
              :variant="selectedCalculator === 'stock' ? 'soft' : 'link'"
              label="Histórico de Ações"
              @click="selectedCalculator = 'stock'"
            />
          </UButtonGroup>
        </div>

        <!-- Calculadora de Juros Compostos -->
        <div v-if="selectedCalculator === 'compound'" class="space-y-6">
          <div
            class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide-trending-up"
                class="text-secondary size-6"
              />
              <h2 class="text-xl font-bold text-white">
                Simulação de Investimento
              </h2>
            </div>

            <!-- Formulário -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <UFormField label="Valor Inicial (R$)" name="initialValue">
                <UInputNumber
                  v-model="compoundForm.initialValue"
                  placeholder="10000"
                  size="lg"
                  variant="soft"
                  class="w-full"
                  :format-options="{
                    style: 'currency',
                    currency: 'BRL',
                  }"
                />
              </UFormField>

              <UFormField label="Aporte Mensal (R$)" name="monthlyValue">
                <UInputNumber
                  v-model="compoundForm.monthlyValue"
                  placeholder="500"
                  size="lg"
                  variant="soft"
                  class="w-full"
                  :format-options="{
                    style: 'currency',
                    currency: 'BRL',
                  }"
                />
              </UFormField>

              <UFormField label="Taxa de Juros (%)" name="interestRate">
                <div class="flex gap-2">
                  <UInput
                    v-model="compoundForm.interestRate"
                    type="number"
                    step="0.01"
                    variant="soft"
                    placeholder="10.5"
                    size="lg"
                    class="flex-1"
                  />
                  <USelectMenu
                    v-model="compoundForm.interestPeriod"
                    :items="[
                      { label: 'Ao ano', value: 'year' },
                      { label: 'Ao mês', value: 'month' },
                    ]"
                    size="lg"
                    :ui="{ base: 'min-w-[120px]' }"
                    variant="soft"
                  />
                </div>
              </UFormField>

              <UFormField label="Período" name="period">
                <div class="flex gap-2">
                  <UInput
                    v-model="compoundForm.period"
                    type="number"
                    placeholder="12"
                    size="lg"
                    variant="soft"
                    class="flex-1"
                  />
                  <USelectMenu
                    v-model="compoundForm.periodType"
                    :items="[
                      { label: 'Meses', value: 'months' },
                      { label: 'Anos', value: 'years' },
                    ]"
                    size="lg"
                    :ui="{ base: 'min-w-[120px]' }"
                    variant="soft"
                  />
                </div>
              </UFormField>
            </div>

            <UButton
              color="secondary"
              size="xl"
              block
              icon="i-lucide-calculator"
              @click="calculateCompoundInterest"
            >
              Calcular Simulação
            </UButton>
          </div>

          <!-- Resultados -->
          <div
            v-if="compoundResult"
            class="flex flex-col gap-6 rounded-[30px] p-6"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide-bar-chart-3"
                class="text-secondary size-6"
              />
              <h3 class="text-xl font-bold text-white">
                Resultados da Simulação
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total Investido
                </p>
                <p class="text-2xl font-bold text-white">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(compoundResult.totalInvested)
                  }}
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total de Juros
                </p>
                <p class="text-2xl font-bold text-green-400">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(compoundResult.totalInterest)
                  }}
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Valor Final
                </p>
                <p class="text-secondary text-2xl font-bold">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(compoundResult.finalValue)
                  }}
                </p>
              </div>
            </div>

            <!-- Gráfico -->
            <div class="flex flex-col gap-2">
              <h4 class="text-[16px] font-semibold">Evolução do Patrimônio</h4>
              <div class="h-[350px]">
                <AtomsGraphLine
                  :data="compoundResult.chartData"
                  :height="350"
                  :legend="[{ label: 'Patrimônio', color: '#00D9A5' }]"
                  :colors="['#00D9A5']"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Calculadora de Histórico de Ações -->
        <div v-if="selectedCalculator === 'stock'" class="space-y-6">
          <div
            class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-chart-line" class="text-secondary size-6" />
              <h2 class="text-xl font-bold text-white">
                Análise de Histórico Real
              </h2>
            </div>

            <!-- Formulário -->
            <div class="space-y-4">
              <!-- Seletor de Ação -->
              <UFormField label="Selecione a Ação ou FII" name="ticker">
                <USelectMenu
                  v-model="selectedAsset"
                  :items="assetitems"
                  searchable
                  searchable-placeholder="Buscar ação ou FII..."
                  placeholder="Selecione um ativo"
                  size="lg"
                  class="w-full"
                  variant="soft"
                  :loading="assetsLoading"
                />
              </UFormField>

              <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                <UFormField
                  label="Valor Inicial de Aporte (R$)"
                  name="initialInvestment"
                >
                  <UInputNumber
                    v-model="stockForm.initialInvestment"
                    placeholder="10000"
                    size="lg"
                    :format-options="{
                      style: 'currency',
                      currency: 'BRL',
                    }"
                    class="w-full"
                    variant="soft"
                  />
                </UFormField>

                <UFormField label="Data Inicial" name="startDate">
                  <UInput
                    v-model="stockForm.startDate"
                    type="date"
                    size="lg"
                    :max="today"
                    class="w-full"
                    variant="soft"
                  />
                </UFormField>

                <UFormField label="Aporte Mensal (R$)" name="monthlyInvestment">
                  <UInputNumber
                    v-model="stockForm.monthlyInvestment"
                    placeholder="500"
                    size="lg"
                    :format-options="{
                      style: 'currency',
                      currency: 'BRL',
                    }"
                    variant="soft"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Data Final" name="endDate">
                  <UInput
                    v-model="stockForm.endDate"
                    type="date"
                    size="lg"
                    :max="today"
                    variant="soft"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField name="reinvestDividends">
                <UCheckbox
                  v-model="stockForm.reinvestDividends"
                  label="Reinvestir proventos automaticamente"
                />
              </UFormField>
            </div>

            <UButton
              color="secondary"
              size="xl"
              block
              icon="i-lucide-calculator"
              :loading="calculatingStock"
              :disabled="!selectedAsset"
              @click="calculateStockHistory"
            >
              Calcular Histórico
            </UButton>

            <!-- Aviso de erro -->
            <UAlert
              v-if="stockError"
              color="red"
              variant="subtle"
              icon="i-lucide-alert-circle"
              :title="stockError"
            />
          </div>

          <!-- Resultados -->
          <div
            v-if="stockResult"
            class="flex flex-col gap-6 rounded-[30px] p-6"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide-bar-chart-3"
                class="text-secondary size-6"
              />
              <h3 class="text-xl font-bold text-white">
                Resultados do Investimento
              </h3>
            </div>

            <!-- Resumo Principal -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total Investido
                </p>
                <p class="text-xl font-bold text-white">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(stockResult.totalInvested)
                  }}
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Valor Final
                </p>
                <p class="text-secondary text-xl font-bold">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(stockResult.finalValue)
                  }}
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Rentabilidade
                </p>
                <p
                  class="text-xl font-bold"
                  :class="
                    stockResult.return >= 0 ? 'text-green-400' : 'text-red-400'
                  "
                >
                  {{ stockResult.return >= 0 ? '+' : ''
                  }}{{ stockResult.return.toFixed(2) }}%
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total de Proventos
                </p>
                <p class="text-xl font-bold text-green-400">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(stockResult.totalDividends)
                  }}
                </p>
              </div>
            </div>

            <!-- Detalhes Adicionais -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Preço Médio de Compra
                </p>
                <p class="text-lg font-semibold text-white">
                  {{
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(stockResult.averagePrice)
                  }}
                </p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Quantidade de Ações
                </p>
                <p class="text-lg font-semibold text-white">
                  {{ stockResult.totalShares.toFixed(2) }}
                </p>
              </div>
            </div>

            <!-- Gráfico -->
            <div class="flex flex-col gap-2">
              <h4 class="text-[16px] font-semibold">
                Evolução do Investimento
              </h4>
              <div class="h-[350px]">
                <AtomsGraphLine
                  :data="stockResult.chartData"
                  :height="350"
                  :legend="[{ label: 'Investimento', color: '#00D9A5' }]"
                  :colors="['#00D9A5']"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'
import type { IChartDataPoint } from '~/types/chart'

const { getAssets, assetHistoricPrices, getTickerDividends } =
  useAssetsService()

// Estado da UI
const selectedCalculator = ref<'compound' | 'stock'>('compound')

// Data de hoje para limitar seleção de datas
const today = new Date().toISOString().split('T')[0]

// ===== CALCULADORA DE JUROS COMPOSTOS =====
const compoundForm = ref({
  initialValue: 10000,
  monthlyValue: 500,
  interestRate: '10.5',
  interestPeriod: { label: 'Ao ano', value: 'year' },
  period: '10',
  periodType: { label: 'Anos', value: 'years' },
})

const compoundResult = ref<{
  totalInvested: number
  totalInterest: number
  finalValue: number
  chartData: IChartDataPoint[]
} | null>(null)

function calculateCompoundInterest() {
  const initial = Number(compoundForm.value.initialValue) || 0
  const monthly = Number(compoundForm.value.monthlyValue) || 0
  let rate = parseFloat(compoundForm.value.interestRate) || 0
  let months =
    compoundForm.value.periodType.value === 'years'
      ? parseInt(compoundForm.value.period) * 12
      : parseInt(compoundForm.value.period)

  // Converter taxa para mensal se for anual
  if (compoundForm.value.interestPeriod.value === 'year') {
    rate = Math.pow(1 + rate / 100, 1 / 12) - 1
  } else {
    rate = rate / 100
  }

  let balance = initial
  const chartData: IChartDataPoint[] = []
  let totalInvested = initial

  // Adicionar ponto inicial
  const startDate = new Date()
  chartData.push({
    date: startDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    value: balance,
    timestamp: startDate.getTime(),
  })

  // Calcular mês a mês
  for (let i = 1; i <= months; i++) {
    balance = balance * (1 + rate) + monthly
    totalInvested += monthly

    // Adicionar ponto no gráfico a cada mês
    const date = new Date()
    date.setMonth(date.getMonth() + i)
    chartData.push({
      date: date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      value: balance,
      timestamp: date.getTime(),
    })
  }

  const finalValue = balance
  const totalInterest = finalValue - totalInvested

  compoundResult.value = {
    totalInvested,
    totalInterest,
    finalValue,
    chartData,
  }
}

// ===== CALCULADORA DE HISTÓRICO DE AÇÕES =====
const stockForm = ref({
  initialInvestment: 10000,
  startDate: '',
  monthlyInvestment: 500,
  endDate: '',
  reinvestDividends: true,
})

const selectedAsset = ref<IAsset | null>(null)
const calculatingStock = ref(false)
const stockError = ref('')
const assetsLoading = ref(false)

const stockResult = ref<{
  totalInvested: number
  finalValue: number
  return: number
  totalDividends: number
  totalShares: number
  averagePrice: number
  chartData: IChartDataPoint[]
} | null>(null)

// Carregar lista de ativos
const { data: allAssets } = await useAsyncData('assets-calculator', () =>
  getAssets()
)

const assetitems = computed(() => {
  if (!allAssets.value) return []
  return (
    allAssets.value
      .filter((asset) => asset.type === 'STOCK' || asset.type === 'FUND')
      .sort((a, b) => a.ticker.localeCompare(b.ticker))
      .map((item) => ({
        id: item.ticker,
        label: item.ticker,
        suffix: item.name,
        avatar: { src: item.logo },
      })) || []
  )
})

async function calculateStockHistory() {
  if (!selectedAsset.value) return

  calculatingStock.value = true
  stockError.value = ''
  stockResult.value = null

  try {
    const ticker = selectedAsset.value.id
    const initialInvestment = Number(stockForm.value.initialInvestment) || 0
    const monthlyInvestment = Number(stockForm.value.monthlyInvestment) || 0
    const startDate = new Date(stockForm.value.startDate)
    const endDate = new Date(stockForm.value.endDate)

    if (!startDate || !endDate || startDate >= endDate) {
      stockError.value = 'Por favor, selecione datas válidas'
      return
    }

    // Buscar histórico de preços completo (12 meses)
    const priceHistory = await assetHistoricPrices(ticker, '5y')

    console.log('Histórico de preços:', priceHistory?.slice(0, 3)) // Debug: primeiros 3 itens

    if (!priceHistory || priceHistory.length === 0) {
      stockError.value =
        'Não foi possível obter o histórico de preços para este ativo'
      return
    }

    // Buscar dividendos se opção estiver marcada
    let dividends: any[] = []
    if (stockForm.value.reinvestDividends) {
      try {
        const dividendsData = await getTickerDividends(ticker)
        dividends = dividendsData || []
        console.log('Dividendos encontrados:', dividends?.slice(0, 3)) // Debug: primeiros 3 itens
      } catch (error) {
        console.warn('Não foi possível obter dividendos:', error)
      }
    }

    // Calcular investimento
    let totalShares = 0
    let totalInvested = 0
    let totalDividends = 0
    const chartData: IChartDataPoint[] = []

    // Filtrar histórico de preços dentro do período
    const relevantPrices = priceHistory.filter((price: any) => {
      const priceDate = new Date(price.price_at)
      return priceDate >= startDate && priceDate <= endDate
    })

    if (relevantPrices.length === 0) {
      stockError.value =
        'Não há dados de preço disponíveis para o período selecionado'
      return
    }

    // Preço inicial - compra inicial
    const firstPrice = relevantPrices[0]
    const initialPrice = firstPrice.market_price
    const initialShares = initialInvestment / initialPrice
    totalShares = initialShares
    totalInvested = initialInvestment

    // Adicionar ponto inicial
    const firstDate = new Date(firstPrice.price_at)
    chartData.push({
      date: firstDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      value: initialInvestment,
      timestamp: firstDate.getTime(),
    })

    // Processar dados ao longo do tempo
    let lastMonthProcessed = new Date(startDate).getMonth()
    let lastYearProcessed = new Date(startDate).getFullYear()

    for (let priceIndex = 1; priceIndex < relevantPrices.length; priceIndex++) {
      const currentPrice = relevantPrices[priceIndex]
      const priceDate = new Date(currentPrice.price_at)
      const priceValue = currentPrice.market_price
      const currentMonth = priceDate.getMonth()
      const currentYear = priceDate.getFullYear()

      // Verificar se mudou de mês para adicionar aporte mensal
      if (
        monthlyInvestment > 0 &&
        (currentMonth !== lastMonthProcessed ||
          currentYear !== lastYearProcessed)
      ) {
        const newShares = monthlyInvestment / priceValue
        totalShares += newShares
        totalInvested += monthlyInvestment
        lastMonthProcessed = currentMonth
        lastYearProcessed = currentYear
      }

      // Processar dividendos até esta data
      if (stockForm.value.reinvestDividends && dividends.length > 0) {
        const previousDate = new Date(relevantPrices[priceIndex - 1].price_at)
        const relevantDividends = dividends.filter((div: any) => {
          const divDate = new Date(div.payment_date)
          return divDate > previousDate && divDate <= priceDate
        })

        for (const dividend of relevantDividends) {
          const dividendRate = parseFloat(dividend.rate) || 0
          const dividendValue = totalShares * dividendRate
          totalDividends += dividendValue

          // Reinvestir dividendos
          if (stockForm.value.reinvestDividends) {
            const newShares = dividendValue / priceValue
            totalShares += newShares
          }
        }
      }

      // Calcular valor atual da carteira
      const portfolioValue = totalShares * priceValue

      // Adicionar ponto no gráfico (apenas alguns pontos para não sobrecarregar)
      // Adiciona um ponto a cada ~7 dias ou no último dia
      if (priceIndex % 7 === 0 || priceIndex === relevantPrices.length - 1) {
        const currentDate = new Date(currentPrice.price_at)
        chartData.push({
          date: currentDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          }),
          value: portfolioValue,
          timestamp: currentDate.getTime(),
        })
      }
    }

    // Calcular resultados finais
    const lastPrice = relevantPrices[relevantPrices.length - 1]
    const finalPrice = lastPrice.market_price
    const finalValue = totalShares * finalPrice
    const returnPercentage =
      totalInvested > 0
        ? ((finalValue - totalInvested) / totalInvested) * 100
        : 0
    const averagePrice = totalShares > 0 ? totalInvested / totalShares : 0

    console.log('Resultados finais:', {
      totalShares,
      totalInvested,
      finalValue,
      finalPrice,
      returnPercentage,
      totalDividends,
    })

    stockResult.value = {
      totalInvested,
      finalValue,
      return: returnPercentage,
      totalDividends,
      totalShares,
      averagePrice,
      chartData,
    }
  } catch (error: any) {
    console.error('Erro ao calcular histórico:', error)
    stockError.value = error.message || 'Erro ao calcular. Tente novamente.'
  } finally {
    calculatingStock.value = false
  }
}

// Definir datas padrão (últimos 2 anos)
onMounted(() => {
  const end = new Date()
  const start = new Date()
  start.setFullYear(start.getFullYear() - 2)

  stockForm.value.endDate = end.toISOString().split('T')[0]
  stockForm.value.startDate = start.toISOString().split('T')[0]
})
</script>

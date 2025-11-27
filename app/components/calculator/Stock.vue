<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-chart-line" class="text-secondary size-6" />
        <h2 class="text-xl font-bold text-white">Análise de Histórico Real</h2>
      </div>

      <div class="space-y-4">
        <UFormField label="Selecione os ativos" name="tickers">
          <div class="flex flex-col gap-3">
            <UInput
              v-model="searchTerm"
              icon="i-lucide-search"
              placeholder="Buscar ação ou FII..."
              size="lg"
              variant="soft"
              :loading="assetsLoading"
            />

            <ClientOnly>
              <div
                ref="listContainer"
                class="relative max-h-[320px] overflow-y-auto rounded-2xl border border-white/5 bg-white/5"
                @scroll="onScroll"
              >
                <div
                  v-if="filteredAssets.length"
                  class="relative w-full"
                  :style="{ height: `${totalHeight}px` }"
                >
                  <div
                    v-for="item in virtualItems"
                    :key="item.asset.id"
                    class="absolute inset-x-0 px-3"
                    :style="{
                      transform: `translateY(${item.top}px)`,
                      height: `${rowHeight}px`,
                    }"
                  >
                    <button
                      type="button"
                      class="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/10 focus-visible:bg-white/10"
                      @click="addAsset(item.asset)"
                    >
                      <UAvatar
                        size="md"
                        :src="item.asset.avatar?.src"
                        :alt="item.asset.label"
                        :class="[
                          'group-hover:ring-secondary/70 shrink-0 ring-1 ring-white/10 transition',
                          !item.asset.avatar?.src &&
                            'bg-secondary/20 text-secondary',
                        ]"
                      >
                        {{ item.asset.label.slice(0, 2) }}
                      </UAvatar>

                      <div class="flex flex-1 flex-col">
                        <span class="text-sm font-semibold text-white">
                          {{ item.asset.label }}
                        </span>
                        <span
                          v-if="item.asset.suffix"
                          class="line-clamp-1 text-xs text-gray-400"
                        >
                          {{ item.asset.suffix }}
                        </span>
                      </div>

                      <UIcon
                        name="i-lucide-plus"
                        class="text-secondary/80 group-hover:text-secondary transition"
                      />
                    </button>
                  </div>
                </div>

                <div v-else class="px-4 py-6 text-sm text-gray-400">
                  Nenhum ativo encontrado.
                </div>

                <div
                  v-if="assetsLoading"
                  class="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                >
                  <UIcon
                    name="i-lucide-loader-2"
                    class="size-5 animate-spin text-white"
                  />
                </div>
              </div>
            </ClientOnly>
          </div>
        </UFormField>

        <div v-if="portfolioAssets.length" class="flex flex-wrap gap-2">
          <div
            v-for="asset in portfolioAssets"
            :key="asset.id"
            class="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm"
          >
            <span class="font-medium text-white">{{ asset.label }}</span>
            <span v-if="asset.suffix" class="text-xs text-gray-300">
              {{ asset.suffix }}
            </span>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="link"
              size="xs"
              aria-label="Remover ativo"
              @click="removeAsset(asset.id)"
            />
          </div>
        </div>
        <p v-else class="text-xs text-gray-400">
          Adicione pelo menos um ativo para realizar o cálculo.
        </p>

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

          <UFormField label="Período (anos)" name="periodYears">
            <UInput
              v-model="stockForm.periodYears"
              type="number"
              size="lg"
              min="1"
              step="1"
              placeholder="2"
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
        :disabled="!portfolioAssets.length"
        @click="calculateStockHistory"
      >
        Calcular Histórico
      </UButton>

      <UAlert
        v-if="stockError"
        color="red"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :title="stockError"
      />

      <UAlert
        v-if="resultsStale"
        color="yellow"
        variant="subtle"
        icon="i-lucide-refresh-cw"
        title="Resultados desatualizados"
      >
        Clique em "Calcular Histórico" para atualizar as projeções após as
        alterações.
      </UAlert>
    </div>

    <div
      v-if="aggregatedSummary && !resultsStale"
      class="flex flex-col gap-6 rounded-[30px] p-6"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-bar-chart-3" class="text-secondary size-6" />
        <h3 class="text-xl font-bold text-white">Resumo do Portfólio</h3>
      </div>

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
              }).format(aggregatedSummary.totalInvested)
            }}
          </p>
        </div>
        <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
          <p class="text-[13px] font-extralight text-gray-400">Valor Final</p>
          <p class="text-secondary text-xl font-bold">
            {{
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(aggregatedSummary.finalValue)
            }}
          </p>
        </div>
        <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
          <p class="text-[13px] font-extralight text-gray-400">Rentabilidade</p>
          <p
            class="text-xl font-bold"
            :class="
              aggregatedSummary.return >= 0 ? 'text-green-400' : 'text-red-400'
            "
          >
            {{ aggregatedSummary.return >= 0 ? '+' : ''
            }}{{ aggregatedSummary.return.toFixed(2) }}%
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
              }).format(aggregatedSummary.totalDividends)
            }}
          </p>
        </div>
      </div>

      <p v-if="aggregatedSummary.assetCount > 1" class="text-xs text-gray-400">
        Aportes iniciais e mensais foram distribuídos igualmente entre os ativos
        selecionados.
      </p>
    </div>

    <template v-if="!resultsStale">
      <div
        v-for="result in stockResults"
        :key="result.ticker"
        class="flex flex-col gap-6 rounded-[30px] p-6"
      >
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-bar-chart-3" class="text-secondary size-6" />
          <div>
            <h3 class="text-xl font-bold text-white">
              Resultados – {{ result.ticker }}
            </h3>
            <p v-if="result.name" class="text-xs text-gray-400">
              {{ result.name }}
            </p>
          </div>
        </div>

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
                }).format(result.totalInvested)
              }}
            </p>
          </div>
          <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
            <p class="text-[13px] font-extralight text-gray-400">Valor Final</p>
            <p class="text-secondary text-xl font-bold">
              {{
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(result.finalValue)
              }}
            </p>
          </div>
          <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
            <p class="text-[13px] font-extralight text-gray-400">
              Rentabilidade
            </p>
            <p
              class="text-xl font-bold"
              :class="result.return >= 0 ? 'text-green-400' : 'text-red-400'"
            >
              {{ result.return >= 0 ? '+' : '' }}{{ result.return.toFixed(2) }}%
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
                }).format(result.totalDividends)
              }}
            </p>
          </div>
        </div>

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
                }).format(result.averagePrice)
              }}
            </p>
          </div>
          <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
            <p class="text-[13px] font-extralight text-gray-400">
              Quantidade de Ações
            </p>
            <p class="text-lg font-semibold text-white">
              {{ result.totalShares.toFixed(2) }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <h4 class="text-[16px] font-semibold">Evolução do Investimento</h4>
          <div class="h-[350px]">
            <AtomsGraphLine
              :data="result.chartData"
              :height="350"
              :legend="[{ label: 'Investimento', color: '#00D9A5' }]"
              :colors="['#00D9A5']"
            />
          </div>
        </div>

        <div
          v-if="
            stockForm.reinvestDividends &&
            result.dividendsHistory &&
            result.dividendsHistory.length > 0
          "
          class="flex flex-col gap-4"
        >
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-table" class="text-secondary size-6" />
            <h3 class="text-xl font-bold text-white">Histórico de Proventos</h3>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
              <p class="text-[13px] font-extralight text-gray-400">
                Total de Pagamentos
              </p>
              <p class="text-xl font-bold text-white">
                {{ result.dividendsHistory.length }}
              </p>
            </div>
            <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
              <p class="text-[13px] font-extralight text-gray-400">
                Total Recebido
              </p>
              <p class="text-xl font-bold text-green-400">
                {{
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(result.totalDividends)
                }}
              </p>
            </div>
            <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
              <p class="text-[13px] font-extralight text-gray-400">
                Média por Pagamento
              </p>
              <p class="text-xl font-bold text-white">
                {{
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(
                    result.totalDividends / result.dividendsHistory.length
                  )
                }}
              </p>
            </div>
          </div>

          <div
            class="max-h-[500px] overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/30"
          >
            <table class="w-full">
              <thead class="sticky top-0 z-10 bg-gray-800">
                <tr class="border-b border-gray-700">
                  <th class="px-4 py-3 text-left text-sm font-semibold">
                    Data de Pagamento
                  </th>
                  <th class="px-4 py-3 text-left text-sm font-semibold">
                    Valor por Ação
                  </th>
                  <th class="px-4 py-3 text-left text-sm font-semibold">
                    Qtd. Ações
                  </th>
                  <th class="px-4 py-3 text-left text-sm font-semibold">
                    Total Recebido
                  </th>
                  <th class="px-4 py-3 text-left text-sm font-semibold">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(dividend, index) in result.dividendsHistory"
                  :key="`${result.ticker}-${index}`"
                  class="border-b border-gray-700/50 hover:bg-white/5"
                >
                  <td class="px-4 py-3 text-sm">
                    {{
                      new Date(dividend.payment_date).toLocaleDateString(
                        'pt-BR'
                      )
                    }}
                  </td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-300">
                    {{
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      }).format(parseFloat(dividend.rate))
                    }}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-400">
                    {{ (dividend.sharesAtTime || 0).toFixed(2) }}
                  </td>
                  <td class="px-4 py-3 text-sm font-bold text-green-400">
                    {{
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(dividend.totalReceived || 0)
                    }}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="rounded-full px-2 py-1 text-xs font-medium"
                      :class="
                        dividend.label === 'JCP'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      "
                    >
                      {{ dividend.label }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  withDefaults,
} from 'vue'
import type { IAsset } from '~/types/asset'
import type { IChartDataPoint } from '~/types/chart'

const { assetHistoricPrices, getTickerDividends } = useAssetsService()

const props = withDefaults(
  defineProps<{
    assets?: IAsset[]
    assetsLoading?: boolean
  }>(),
  {
    assets: () => [],
    assetsLoading: false,
  }
)

interface AssetSelectItem {
  id: string
  label: string
  suffix?: string
  avatar?: { src?: string | null }
}

interface DividendHistoryItem {
  ticker: string
  payment_date: string
  rate: string
  label: string
  totalReceived: number
  sharesAtTime: number
}

interface StockSimulationResult {
  ticker: string
  name?: string
  totalInvested: number
  finalValue: number
  return: number
  totalDividends: number
  totalShares: number
  averagePrice: number
  chartData: IChartDataPoint[]
  dividendsHistory: DividendHistoryItem[]
}

const stockForm = ref({
  initialInvestment: 10000,
  monthlyInvestment: 500,
  periodYears: 2,
  reinvestDividends: true,
})

const portfolioAssets = ref<AssetSelectItem[]>([])
const calculatingStock = ref(false)
const stockError = ref('')
const stockResults = ref<StockSimulationResult[]>([])
const resultsStale = ref(false)
const searchTerm = ref('')

const assetsLoading = computed(() => props.assetsLoading ?? false)

const normalizedAssets = computed<AssetSelectItem[]>(() => {
  const assets = props.assets ?? []
  return assets
    .filter((asset) => {
      const type = (asset.type || '').toString().toUpperCase()
      return type === 'STOCK' || type === 'FUND'
    })
    .map((item) => {
      const ticker = item.ticker || item.stock
      if (!ticker) return null

      return {
        id: ticker,
        label: ticker,
        suffix: item.name,
        avatar: { src: item.logo },
      } as AssetSelectItem
    })
    .filter((item): item is AssetSelectItem => Boolean(item))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const filteredAssets = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const selectedTickers = new Set(
    portfolioAssets.value.map((asset) => asset.id)
  )
  if (!term) {
    return normalizedAssets.value.filter(
      (asset) => !selectedTickers.has(asset.id)
    )
  }

  return normalizedAssets.value.filter((asset) => {
    if (selectedTickers.has(asset.id)) return false
    const label = asset.label.toLowerCase()
    const suffix = (asset.suffix || '').toLowerCase()
    return label.includes(term) || suffix.includes(term)
  })
})

const listContainer = ref<HTMLDivElement | null>(null)
const scrollTop = ref(0)
const containerHeight = ref(240)
const ROW_HEIGHT = 48
const OVERSCAN = 6
const rowHeight = ROW_HEIGHT

const totalHeight = computed(() => filteredAssets.value.length * ROW_HEIGHT)

const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / ROW_HEIGHT) - OVERSCAN
  return index > 0 ? index : 0
})

const visibleCount = computed(() => {
  const base = Math.ceil(containerHeight.value / ROW_HEIGHT)
  return (base > 0 ? base : 1) + OVERSCAN * 2
})

const endIndex = computed(() => {
  return Math.min(
    filteredAssets.value.length,
    startIndex.value + visibleCount.value
  )
})

const virtualItems = computed(() => {
  return filteredAssets.value
    .slice(startIndex.value, endIndex.value)
    .map((asset, idx) => ({
      asset,
      top: (startIndex.value + idx) * ROW_HEIGHT,
    }))
})

function markResultsStale() {
  if (stockResults.value.length) {
    resultsStale.value = true
  }
}

function addAsset(item: AssetSelectItem) {
  if (portfolioAssets.value.some((asset) => asset.id === item.id)) return
  portfolioAssets.value.push(item)
  stockError.value = ''
  markResultsStale()
  searchTerm.value = ''
  nextTick(() => {
    if (listContainer.value) {
      listContainer.value.scrollTop = 0
      scrollTop.value = 0
    }
  })
}

function removeAsset(ticker: string) {
  const index = portfolioAssets.value.findIndex((asset) => asset.id === ticker)
  if (index !== -1) {
    portfolioAssets.value.splice(index, 1)
    stockResults.value = stockResults.value.filter(
      (result) => result.ticker !== ticker
    )
    markResultsStale()
  }
}

const aggregatedSummary = computed(() => {
  if (!stockResults.value.length) return null

  const totals = stockResults.value.reduce(
    (acc, result) => {
      acc.totalInvested += result.totalInvested
      acc.finalValue += result.finalValue
      acc.totalDividends += result.totalDividends
      return acc
    },
    {
      totalInvested: 0,
      finalValue: 0,
      totalDividends: 0,
    }
  )

  const totalReturn =
    totals.totalInvested > 0
      ? ((totals.finalValue - totals.totalInvested) / totals.totalInvested) *
        100
      : 0

  return {
    ...totals,
    return: totalReturn,
    assetCount: stockResults.value.length,
  }
})

watch(
  () => [
    stockForm.value.initialInvestment,
    stockForm.value.monthlyInvestment,
    stockForm.value.periodYears,
    stockForm.value.reinvestDividends,
  ],
  () => {
    markResultsStale()
  }
)

watch(
  () => portfolioAssets.value.map((asset) => asset.id).join(','),
  () => {
    markResultsStale()
  }
)

watch(searchTerm, () => {
  nextTick(() => {
    if (listContainer.value) {
      listContainer.value.scrollTop = 0
      scrollTop.value = 0
    }
  })
})

watch(filteredAssets, () => {
  nextTick(() => {
    if (listContainer.value) {
      containerHeight.value =
        listContainer.value.clientHeight || containerHeight.value
    }
  })
})

function onScroll() {
  if (!listContainer.value) return
  scrollTop.value = listContainer.value.scrollTop
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!process.client) return

  nextTick(() => {
    if (listContainer.value) {
      containerHeight.value =
        listContainer.value.clientHeight || containerHeight.value
      scrollTop.value = listContainer.value.scrollTop || 0

      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          containerHeight.value = entry.contentRect.height
        }
      })
      resizeObserver.observe(listContainer.value)
    }
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

async function calculateStockHistory() {
  if (!portfolioAssets.value.length) {
    stockError.value = 'Adicione pelo menos um ativo para calcular.'
    return
  }

  calculatingStock.value = true
  stockError.value = ''
  stockResults.value = []

  try {
    const tickerCount = portfolioAssets.value.length
    const totalInitialInvestment =
      Number(stockForm.value.initialInvestment) || 0
    const totalMonthlyInvestment =
      Number(stockForm.value.monthlyInvestment) || 0
    const periodYears = Number(stockForm.value.periodYears) || 0

    if (!Number.isFinite(periodYears) || periodYears <= 0) {
      stockError.value = 'Informe um período em anos válido'
      return
    }

    const perInitialInvestment =
      tickerCount > 0 ? totalInitialInvestment / tickerCount : 0
    const perMonthlyInvestment =
      tickerCount > 0 ? totalMonthlyInvestment / tickerCount : 0
    const reinvestDividends = Boolean(stockForm.value.reinvestDividends)

    const failed: string[] = []

    const simulations = await Promise.all(
      portfolioAssets.value.map(async (asset) => {
        const result = await simulateAsset(
          asset,
          perInitialInvestment,
          perMonthlyInvestment,
          periodYears,
          reinvestDividends
        )

        if (!result) {
          failed.push(asset.label)
        }

        return result
      })
    )

    const validSimulations = simulations.filter(
      (result): result is StockSimulationResult => Boolean(result)
    )

    if (!validSimulations.length) {
      stockError.value = 'Não foi possível calcular com os ativos selecionados.'
      return
    }

    stockResults.value = validSimulations
    resultsStale.value = false

    if (failed.length) {
      stockError.value = `Alguns ativos foram ignorados por falta de dados: ${failed.join(', ')}`
    } else {
      stockError.value = ''
    }
  } catch (error: any) {
    console.error('Erro ao calcular histórico:', error)
    stockError.value = error?.message || 'Erro ao calcular. Tente novamente.'
  } finally {
    calculatingStock.value = false
  }
}

async function simulateAsset(
  asset: AssetSelectItem,
  initialInvestment: number,
  monthlyInvestment: number,
  periodYears: number,
  reinvestDividends: boolean
): Promise<StockSimulationResult | null> {
  try {
    const result = await $fetch('/api/calculate', {
      method: 'POST',
      body: {
        type: 'stock',
        params: {
          ticker: asset.id,
          initialInvestment,
          monthlyInvestment,
          periodYears,
          reinvestDividends,
        },
      },
    })

    if (!result) return null

    const data = result as any

    return {
      ticker: data.ticker,
      name: asset.suffix,
      totalInvested: data.totalInvested,
      finalValue: data.finalValue,
      return: data.returnPercentage,
      totalDividends: data.totalDividends,
      totalShares: data.totalShares,
      averagePrice:
        data.totalShares > 0 ? data.totalInvested / data.totalShares : 0,
      chartData: data.chartData,
      dividendsHistory: data.dividendsHistory || [],
    }
  } catch (error) {
    console.warn('Falha ao simular ativo:', asset.id, error)
    return null
  }
}
</script>

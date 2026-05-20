<template>
  <CalcUiShell
    :back-to="backTo"
    :back-label="backLabel"
    :last-updated="lastUpdated"
  >
    <template #hero>
      <slot name="hero">
        <p class="calc-eyebrow">Simulador · Investimento em Ações</p>
        <h1 class="calc-title">Análise de histórico real da B3</h1>
        <p class="calc-lead">Simule múltiplos ativos com preços históricos reais + dividendos reinvestidos.</p>
      </slot>
    </template>

    <template #form>
      <p class="cui-section-label">{{ aggregatedSummary && !resultsStale ? 'Ajustar análise' : 'Configure a simulação' }}</p>
      <CalcUiAssetSearch
        v-model="searchTerm"
        :results="filteredAssets.map(a => ({ ticker: a.label, id: a.id, name: a.suffix, logo: a.avatar?.src }))"
        :loading="assetsLoading"
        label="Selecione os ativos"
        placeholder="Buscar ação ou FII..."
        @select="(picked) => { const original = filteredAssets.find(a => a.id === picked.id); if (original) addAsset(original); }"
      />

      <div v-if="portfolioAssets.length" class="cui-pill-list">
        <div
          v-for="asset in portfolioAssets"
          :key="asset.id"
          class="cui-pill"
        >
          <span class="cui-pill-label">{{ asset.label }}</span>
          <span v-if="asset.suffix" class="cui-pill-sub">{{ asset.suffix }}</span>
          <button class="cui-pill-remove" type="button" aria-label="Remover ativo" @click="removeAsset(asset.id)">
            <UIcon name="i-lucide-x" class="size-3.5" />
          </button>
        </div>
      </div>
      <p v-else class="cui-hint">
        Adicione pelo menos um ativo para realizar o cálculo.
      </p>

      <div class="grid w-full grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2">
        <CalcUiField label="Valor Inicial de Aporte (R$)" type="currency" v-model="stockForm.initialInvestment" placeholder="10.000,00" />
        <CalcUiField label="Aporte Mensal (R$)" type="currency" v-model="stockForm.monthlyInvestment" placeholder="500,00" />
        <CalcUiField label="Período (anos)" type="number" v-model="stockForm.periodYears" :min="1" placeholder="2" />
      </div>

      <UCheckbox
        v-model="stockForm.reinvestDividends"
        label="Reinvestir proventos automaticamente"
      />

      <CalcUiButton
        label="Calcular Histórico"
        icon="i-lucide-sparkles"
        :loading="calculatingStock"
        :disabled="!portfolioAssets.length"
        @click="calculateStockHistory"
      />

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
    </template>

    <template #result>
      <CalcUiResultMega
        v-if="aggregatedSummary && !resultsStale"
        eyebrow="Valor final consolidado"
        :value="new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aggregatedSummary.finalValue)"
        :kpis="[
          { label: 'Total investido', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aggregatedSummary.totalInvested), color: 'heading' },
          { label: 'Rentabilidade', value: `${aggregatedSummary.return >= 0 ? '+' : ''}${aggregatedSummary.return.toFixed(2)}%`, color: aggregatedSummary.return >= 0 ? 'positive' : 'negative' },
          { label: 'Total de proventos', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aggregatedSummary.totalDividends), color: 'positive' },
        ]"
      >
        <template v-if="aggregatedSummary.assetCount > 1" #caption>
          Aportes distribuídos igualmente entre {{ aggregatedSummary.assetCount }} ativos
        </template>
      </CalcUiResultMega>
      <div v-else class="cui-result-empty">
        <p class="cui-result-eyebrow">Resultado consolidado</p>
        <p class="cui-empty-text">Adicione ativos e clique em "Calcular Histórico" pra simular.</p>
      </div>
    </template>

    <template #chart>
      <div v-if="!resultsStale && stockResults.length" class="flex flex-col gap-4">
      <CalcUiCard
        v-for="result in stockResults"
        :key="result.ticker"
        :title="`Resultado, ${result.ticker}`"
        icon="i-lucide-bar-chart-3"
        heading-tag="h3"
      >
        <p v-if="result.name" class="cui-hint -mt-3">{{ result.name }}</p>

        <CalcUiResultMega
          eyebrow="Valor final"
          :value="new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.finalValue)"
          :kpis="[
            { label: 'Total investido', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.totalInvested), color: 'heading' },
            { label: 'Rentabilidade', value: `${result.return >= 0 ? '+' : ''}${result.return.toFixed(2)}%`, color: result.return >= 0 ? 'positive' : 'negative' },
            { label: 'Total de proventos', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.totalDividends), color: 'positive' },
          ]"
        />

        <div class="cui-subcard">
          <h4 class="cui-subcard-title">Composição da carteira</h4>
          <div class="cui-subcard-grid cui-subcard-grid--2">
            <CalcUiKpiBox label="Preço médio de compra" :value="new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.averagePrice)" color="heading" />
            <CalcUiKpiBox label="Quantidade de ações" :value="result.totalShares.toFixed(2)" color="heading" />
          </div>
        </div>

        <CalcUiChart label="Evolução do investimento">
          <AtomsGraphLine
            :data="result.chartData"
            :height="350"
            :legend="[{ label: 'Investimento', color: cc.positive }]"
            :colors="[cc.positive]"
          />
        </CalcUiChart>

        <div
          v-if="
            stockForm.reinvestDividends &&
            result.dividendsHistory &&
            result.dividendsHistory.length > 0
          "
          class="cui-subcard"
        >
          <h4 class="cui-subcard-title">
            <UIcon name="i-lucide-table" class="inline-block size-4 mr-1" style="color: var(--brand-primary)" />
            Histórico de Proventos
          </h4>

          <div class="cui-subcard-grid cui-subcard-grid--3">
            <CalcUiKpiBox label="Total de pagamentos" :value="String(result.dividendsHistory.length)" color="heading" />
            <CalcUiKpiBox label="Total recebido" :value="new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.totalDividends)" color="positive" />
            <CalcUiKpiBox label="Média por pagamento" :value="new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.totalDividends / result.dividendsHistory.length)" color="heading" />
          </div>

          <div class="cui-table-wrap" style="max-height: 500px; overflow-y: auto">
            <table class="cui-table">
              <thead>
                <tr>
                  <th>Data de pagamento</th>
                  <th>Valor por ação</th>
                  <th>Qtd. ações</th>
                  <th>Total recebido</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(dividend, index) in result.dividendsHistory" :key="`${result.ticker}-${index}`">
                  <td>{{ new Date(dividend.payment_date).toLocaleDateString('pt-BR') }}</td>
                  <td class="cui-table-muted">{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(parseFloat(dividend.rate)) }}</td>
                  <td class="cui-table-muted">{{ (dividend.sharesAtTime || 0).toFixed(2) }}</td>
                  <td style="color: var(--brand-positive)">{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dividend.totalReceived || 0) }}</td>
                  <td>
                    <span class="quiet-badge" :class="dividend.label === 'JCP' ? 'quiet-badge--brand' : 'quiet-badge--success'">
                      {{ dividend.label }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CalcUiCard>
      </div>
      <div v-else class="cui-result-empty">
        <p class="cui-chart-label">Detalhamento por ativo</p>
        <p class="cui-empty-text">Chart e tabela de proventos aparecem após o cálculo.</p>
      </div>
    </template>
  </CalcUiShell>
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
import { showErrorNotification } from '~/composables/useNotify'
import type { IAsset } from '~/types/asset'
import type { IChartDataPoint } from '~/types/chart'
import { useChartColors } from '~/design/chartColors'

const brand = useBrand()
// Reativo via useChartColors() — evita congelamento de hex em F5 com
// prefers-color-scheme: system. ChartColors estático lê de seedBrand
// e não reflete troca de tema.
const cc = useChartColors()

const props = withDefaults(
  defineProps<{
    assets?: IAsset[]
    assetsLoading?: boolean
    backTo?: string
    backLabel?: string
    lastUpdated?: string
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

interface StockSimulationApiResponse {
  ticker: string
  totalInvested: number
  finalValue: number
  returnPercentage: number
  totalDividends: number
  totalShares: number
  chartData: IChartDataPoint[]
  dividendsHistory?: DividendHistoryItem[]
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

const calcRoot = ref<HTMLElement | null>(null)

function scrollToCalc() {
  if (typeof window === 'undefined') return
  // nextTick garante que o DOM atualizou (form re-renderizou) antes de scrollar
  nextTick(() => {
    calcRoot.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

// ====================================================================
// Deep-link via query params, abilita URLs canonicas pra cenarios
// populares (ex: /calculadora/acoes?initial=10000&monthly=500&years=10
// &reinvest=1&tickers=ITUB4,VALE3,PETR4). Cada combinacao vira uma
// "landing page" virtual indexavel pelo Google sem precisar duplicar
// a pagina.
//
// Params suportados:
//   ?initial=10000                  aporte inicial total em R$
//   ?monthly=500                    aporte mensal total em R$
//   ?years=10                       periodo em anos
//   ?reinvest=1|0|true|false        reinvestir dividendos
//   ?tickers=ITUB4,VALE3,PETR4      tickers separados por virgula
//   ?auto=1                         dispara o calculo automaticamente
// ====================================================================
const route = useRoute()

function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  // Aceita "10.5" e "10,5" (Brasil), Number() so entende ponto.
  const normalized = raw.replace(',', '.')
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

function parseBoolParam(value: unknown): boolean | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return null
  const normalized = raw.trim().toLowerCase()
  if (normalized === '1' || normalized === 'true' || normalized === 'sim') return true
  if (normalized === '0' || normalized === 'false' || normalized === 'nao') return false
  return null
}

function parseTickersParam(value: unknown): string[] {
  if (value === undefined || value === null) return []
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return []
  return raw
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t.length > 0)
}

const deepLinkApplied = ref(false)
const pendingTickers = ref<string[]>([])
const pendingAutoFire = ref(false)

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

function applyQueryParams() {
  if (!import.meta.client) return

  // Deep-link: le query params e popula o form. Tickers aguardam o
  // `props.assets` chegar (watcher abaixo) porque dependem do lookup
  // pela lista carregada via API. Auto-fire so dispara apos os
  // tickers entrarem em portfolioAssets.
  const q = route.query
  const initial = parseNumberParam(q.initial)
  const monthly = parseNumberParam(q.monthly)
  const years = parseNumberParam(q.years)
  const reinvest = parseBoolParam(q.reinvest)
  const tickers = parseTickersParam(q.tickers)

  if (initial !== null) stockForm.value.initialInvestment = initial
  if (monthly !== null) stockForm.value.monthlyInvestment = monthly
  if (years !== null && years > 0) stockForm.value.periodYears = years
  if (reinvest !== null) stockForm.value.reinvestDividends = reinvest

  pendingTickers.value = tickers
  const hasAnyInput =
    initial !== null ||
    monthly !== null ||
    years !== null ||
    reinvest !== null ||
    tickers.length > 0
  pendingAutoFire.value =
    hasAnyInput || q.auto === '1' || q.auto === 'true'

  // Reset deepLinkApplied so a fresh query change (user clicking a new
  // scenario chip on the same page) can re-fire the resolution.
  deepLinkApplied.value = false

  // Tenta resolver tickers imediatamente caso `props.assets` ja tenha
  // sido populado (assets = computed prop, costuma chegar antes do
  // mount completar).
  tryResolvePendingTickers()
}

onMounted(() => {
  if (!import.meta.client) return

  applyQueryParams()

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

// Re-apply when query changes (user clicked a scenario chip on the same page)
// In this path, ALSO scroll to the calculator so the user sees the result.
// {immediate: false} (default) garante que o scroll do mount inicial não dispare.
watch(
  () => route.query,
  () => {
    applyQueryParams()
    scrollToCalc()
  },
  { deep: true },
)

// Watcher que escuta a chegada de `props.assets` para resolver os
// tickers pendentes (vindos do query param `?tickers=ITUB4,VALE3`)
// e fazer push em portfolioAssets. Necessario porque assets carrega
// async via useAsyncData e raramente esta pronto no onMounted.
watch(
  () => props.assets,
  () => {
    tryResolvePendingTickers()
  },
  { immediate: true, deep: false }
)

function tryResolvePendingTickers() {
  if (deepLinkApplied.value) return
  if (!pendingTickers.value.length && !pendingAutoFire.value) return
  // Se ha tickers pendentes mas a lista ainda nao carregou, espera o
  // proximo tick do watcher.
  if (pendingTickers.value.length && !normalizedAssets.value.length) return

  const tickerSet = new Set(pendingTickers.value)
  if (tickerSet.size > 0) {
    const matches = normalizedAssets.value.filter((asset) =>
      tickerSet.has(asset.id.toUpperCase())
    )
    if (matches.length > 0) {
      portfolioAssets.value = matches
    }
  }

  deepLinkApplied.value = true

  if (pendingAutoFire.value && portfolioAssets.value.length) {
    nextTick(() => {
      calculateStockHistory()
    })
  }
}

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
  } catch (error) {
    const fallbackMessage = 'Erro ao calcular. Tente novamente.'
    const message =
      error instanceof Error && error.message ? error.message : fallbackMessage
    stockError.value = message
    showErrorNotification('Erro ao calcular histórico', message)
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
    const result = await $fetch<StockSimulationApiResponse>('/api/calculate', {
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

    return {
      ticker: result.ticker,
      name: asset.suffix,
      totalInvested: result.totalInvested,
      finalValue: result.finalValue,
      return: result.returnPercentage,
      totalDividends: result.totalDividends,
      totalShares: result.totalShares,
      averagePrice:
        result.totalShares > 0 ? result.totalInvested / result.totalShares : 0,
      chartData: result.chartData,
      dividendsHistory: result.dividendsHistory ?? [],
    }
  } catch {
    return null
  }
}
</script>

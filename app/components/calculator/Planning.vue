<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-target" class="text-secondary size-6" />
        <h2 class="text-xl font-bold text-white">Planejamento de Patrimônio</h2>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Meta financeira (R$)" name="goalValue">
          <UInputNumber
            v-model="planningForm.goalValue"
            placeholder="500000"
            size="lg"
            variant="soft"
            class="w-full"
            :format-options="{
              style: 'currency',
              currency: 'BRL',
            }"
          />
        </UFormField>

        <UFormField label="Aporte mensal (R$)" name="monthlyContribution">
          <UInputNumber
            v-model="planningForm.monthlyContribution"
            placeholder="1500"
            size="lg"
            variant="soft"
            class="w-full"
            :format-options="{
              style: 'currency',
              currency: 'BRL',
            }"
          />
        </UFormField>
      </div>

      <div class="flex flex-col gap-3">
        <p class="text-sm font-semibold text-white">Estratégia</p>
        <div class="flex gap-3 max-sm:flex-col">
          <UButton
            color="secondary"
            :variant="
              planningForm.strategy === 'rentabilidade' ? 'soft' : 'link'
            "
            class="flex-1 justify-start"
            icon="i-lucide-rocket"
            @click="planningForm.strategy = 'rentabilidade'"
          >
            Maior rentabilidade
          </UButton>
          <UButton
            color="secondary"
            :variant="planningForm.strategy === 'seguranca' ? 'soft' : 'link'"
            class="flex-1 justify-start"
            icon="i-lucide-shield"
            @click="planningForm.strategy = 'seguranca'"
          >
            Maior segurança
          </UButton>
        </div>
        <p class="text-xs text-gray-400">
          Escolha entre maximizar ganhos com ativos de alta performance ou
          priorizar estabilidade com setores defensivos, FIIs consolidados e 10%
          de renda fixa.
        </p>
      </div>

      <UButton
        color="secondary"
        size="xl"
        block
        icon="i-lucide-calendar-clock"
        :loading="planningLoading"
        @click="calculatePlanningStrategy"
      >
        Calcular Planejamento
      </UButton>

      <UAlert
        v-if="planningError"
        color="red"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :title="planningError"
      />
    </div>

    <div v-if="planningResult" class="flex flex-col gap-6 rounded-[30px] p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-timer" class="text-secondary size-6" />
        <h3 class="text-xl font-bold text-white">Plano recomendado</h3>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
          <p class="text-[13px] font-extralight text-gray-400">
            Tempo estimado para alcançar a meta
          </p>
          <p class="text-xl font-bold text-white">
            {{ planningResult.timeToGoalLabel }}
          </p>
          <p class="text-xs text-gray-400">
            Aproximadamente até {{ planningResult.targetDateLabel }}
          </p>
        </div>
        <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
          <p class="text-[13px] font-extralight text-gray-400">
            Aportes totais até a meta
          </p>
          <p class="text-xl font-bold text-white">
            {{
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(planningResult.totalInvestedUntilGoal)
            }}
          </p>
        </div>
        <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
          <p class="text-[13px] font-extralight text-gray-400">
            Resultado projetado
          </p>
          <p class="text-secondary text-xl font-bold">
            {{
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(planningResult.estimatedFinalValue)
            }}
          </p>
          <p class="text-xs text-green-400">
            Ganho estimado de
            {{
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(planningResult.estimatedProfit)
            }}
          </p>
        </div>
        <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
          <p class="text-[13px] font-extralight text-gray-400">
            Rentabilidade média mensal esperada
          </p>
          <p class="text-xl font-bold text-white">
            {{ (planningResult.monthlyReturnRate * 100).toFixed(2) }}%
          </p>
        </div>
      </div>

      <div
        class="grid grid-cols-1 gap-4 rounded-2xl bg-white/5 p-4 md:grid-cols-2"
      >
        <div class="flex flex-col gap-2">
          <p class="text-sm font-semibold text-white">
            Se tivesse investido nos últimos
            {{ planningResult.historicalYears.toFixed(1) }} anos
          </p>
          <p class="text-xs text-gray-400">
            Considerando o mesmo aporte mensal e a carteira recomendada.
          </p>
          <div class="mt-2 flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">Total investido</span>
              <span class="text-sm font-semibold text-white">
                {{
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(planningResult.historicalInvested)
                }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">Valor final</span>
              <span class="text-secondary text-sm font-semibold">
                {{
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(planningResult.historicalFinalValue)
                }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">Lucro histórico</span>
              <span class="text-sm font-semibold text-green-400">
                {{
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(planningResult.historicalProfit)
                }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-sm font-semibold text-white">Projeção de patrimônio</p>
          <div class="h-[240px]">
            <AtomsGraphLine
              :data="planningResult.chartData"
              :height="240"
              :legend="[{ label: 'Patrimônio projetado', color: '#00D9A5' }]"
              :colors="['#00D9A5']"
            />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-layers" class="text-secondary size-5" />
          <h4 class="text-lg font-semibold text-white">Carteira sugerida</h4>
        </div>
        <p class="text-xs text-gray-400">
          Distribuição baseada no desempenho histórico e nos critérios da
          estratégia escolhida.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="asset in planningResult.recommendedAssets"
          :key="`${asset.ticker}-${asset.category}`"
          class="flex flex-col gap-4 rounded-2xl bg-white/5 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[11px] uppercase tracking-wide text-gray-400">
                {{ asset.category }}
              </p>
              <h5 class="text-lg font-semibold text-white">
                {{ asset.ticker }}
              </h5>
              <p class="text-xs text-gray-400">
                {{ asset.name }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-400">Peso</p>
              <p class="text-secondary text-2xl font-bold">
                {{ (asset.weight * 100).toFixed(0) }}%
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-gray-400">
                Retorno {{ planningResult.historicalYears.toFixed(0) }} anos
              </p>
              <p
                class="font-semibold"
                :class="
                  asset.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
                "
              >
                {{ (asset.totalReturn * 100).toFixed(1) }}%
              </p>
            </div>
            <div>
              <p class="text-gray-400">CAGR anual</p>
              <p class="font-semibold text-white">
                {{ (asset.cagr * 100).toFixed(1) }}%
              </p>
            </div>
            <div>
              <p class="text-gray-400">Retorno mensal</p>
              <p class="font-semibold text-white">
                {{ (asset.monthlyRate * 100).toFixed(2) }}%
              </p>
            </div>
            <div>
              <p class="text-gray-400">Dividendos reinvestidos</p>
              <p class="font-semibold text-green-400">
                {{
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(asset.totalDividends)
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-200">
        Recomendação baseada em dados históricos. Rentabilidades passadas não
        garantem resultados futuros. Ajuste sempre sua carteira conforme o seu
        perfil de risco.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { IAsset } from '~/types/asset'
import type { IChartDataPoint } from '~/types/chart'

const { assetHistoricPrices, getTickerDividends, getTopStocks, getTopReits } =
  useAssetsService()

const props = withDefaults(
  defineProps<{
    assets?: IAsset[]
  }>(),
  {
    assets: () => [],
  }
)

type PlanningStrategy = 'rentabilidade' | 'seguranca'

interface PlanningAssetPerformance {
  ticker: string
  name: string
  category: string
  type: string
  totalReturn: number
  cagr: number
  monthlyRate: number
  growthFactor: number
  totalDividends: number
  periodYears: number
}

interface PlanningRecommendedAsset extends PlanningAssetPerformance {
  weight: number
}

interface PlanningResult {
  strategy: PlanningStrategy
  goalValue: number
  monthlyContribution: number
  monthsToGoal: number
  timeToGoalLabel: string
  targetDateLabel: string
  totalInvestedUntilGoal: number
  estimatedFinalValue: number
  estimatedProfit: number
  monthlyReturnRate: number
  historicalFinalValue: number
  historicalInvested: number
  historicalProfit: number
  historicalYears: number
  recommendedAssets: PlanningRecommendedAsset[]
  chartData: IChartDataPoint[]
}

const planningForm = ref({
  goalValue: 500000,
  monthlyContribution: 1500,
  strategy: 'rentabilidade' as PlanningStrategy,
})

const planningLoading = ref(false)
const planningError = ref('')
const planningResult = ref<PlanningResult | null>(null)

const normalizeTicker = (ticker: string) => (ticker || '').toUpperCase().trim()

const priceHistoryCache = new Map<string, any[]>()
const dividendsCache = new Map<string, any[] | null>()

const planningUniverse = {
  rentabilidade: {
    fallbackStocks: ['PETR4', 'VALE3', 'PRIO3', 'WEGE3', 'LREN3', 'ITUB4'],
    fallbackFiis: ['HGLG11', 'KNRI11', 'XPML11', 'VISC11', 'BCFF11'],
    minimumAssets: 3,
    priorityTickers: [
      'PETR4',
      'VALE3',
      'PRIO3',
      'WEGE3',
      'ITUB4',
      'BBAS3',
      'ABEV3',
      'SUZB3',
    ],
  },
  seguranca: {
    categories: {
      energy: ['TAEE11', 'EQTL3', 'ENBR3', 'NEOE3'],
      sanitation: ['SBSP3', 'CSMG3', 'SAPR11'],
      banks: ['ITUB4', 'BBAS3', 'BBDC4', 'SANB11'],
      fiis: ['HGLG11', 'KNRI11', 'BCFF11', 'VISC11'],
    },
    categoryLabels: {
      energy: 'Energia',
      sanitation: 'Saneamento',
      banks: 'Bancos',
      fiis: 'FII consolidado',
    },
    fixedIncomeWeight: 0.1,
    fixedIncomeAnnualRate: 0.1,
  },
}

const fallbackPerformanceMetrics: Record<
  string,
  {
    cagr: number
    dividendYield?: number
    periodYears?: number
  }
> = {
  PETR4: { cagr: 0.18, dividendYield: 0.08, periodYears: 5 },
  VALE3: { cagr: 0.15, dividendYield: 0.07, periodYears: 5 },
  PRIO3: { cagr: 0.28, dividendYield: 0.03, periodYears: 5 },
  WEGE3: { cagr: 0.2, dividendYield: 0.015, periodYears: 5 },
  LREN3: { cagr: 0.11, dividendYield: 0.022, periodYears: 5 },
  ITUB4: { cagr: 0.09, dividendYield: 0.05, periodYears: 5 },
  BBAS3: { cagr: 0.1, dividendYield: 0.06, periodYears: 5 },
  ABEV3: { cagr: 0.07, dividendYield: 0.025, periodYears: 5 },
  SUZB3: { cagr: 0.13, dividendYield: 0.015, periodYears: 5 },
  HGLG11: { cagr: 0.095, dividendYield: 0.1, periodYears: 5 },
  KNRI11: { cagr: 0.085, dividendYield: 0.095, periodYears: 5 },
  XPML11: { cagr: 0.088, dividendYield: 0.09, periodYears: 5 },
  VISC11: { cagr: 0.082, dividendYield: 0.092, periodYears: 5 },
  BCFF11: { cagr: 0.078, dividendYield: 0.1, periodYears: 5 },
  TAEE11: { cagr: 0.12, dividendYield: 0.09, periodYears: 5 },
  EQTL3: { cagr: 0.13, dividendYield: 0.035, periodYears: 5 },
  ENBR3: { cagr: 0.1, dividendYield: 0.045, periodYears: 5 },
  NEOE3: { cagr: 0.095, dividendYield: 0.05, periodYears: 5 },
  SBSP3: { cagr: 0.085, dividendYield: 0.03, periodYears: 5 },
  CSMG3: { cagr: 0.08, dividendYield: 0.035, periodYears: 5 },
  SAPR11: { cagr: 0.075, dividendYield: 0.04, periodYears: 5 },
  BBDC4: { cagr: 0.082, dividendYield: 0.057, periodYears: 5 },
  SANB11: { cagr: 0.078, dividendYield: 0.05, periodYears: 5 },
}

const assetsByTicker = computed(() => {
  const map = new Map<string, IAsset>()
  const assets = props.assets ?? []
  if (!assets.length) return map

  for (const asset of assets) {
    const key = normalizeTicker(asset.ticker || asset.stock || '')
    if (!key) continue
    if (!map.has(key)) {
      map.set(key, asset)
    }
  }

  return map
})

function resolveAssetCategory(asset?: IAsset | null) {
  if (!asset) return 'Ativo'
  const type = (asset.type || '').toString().toUpperCase()
  if (type.includes('REIT') || type === 'FUND') return 'FII'
  if (type.includes('STOCK')) return 'Ação'
  if (type.includes('ETF')) return 'ETF'
  if (type.includes('BDR')) return 'BDR'
  return 'Ativo'
}

function getAssetInfo(ticker: string) {
  const normalized = normalizeTicker(ticker)
  const asset = assetsByTicker.value.get(normalized)
  const displayName = asset?.name || asset?.stock || asset?.ticker || normalized
  const category = resolveAssetCategory(asset)
  return {
    name: displayName,
    category,
    type: category,
  }
}

function formatTimeLabel(months: number) {
  if (months <= 0) return 'menos de 1 mês'
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  const parts: string[] = []
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`)
  }
  if (remainingMonths > 0) {
    parts.push(`${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`)
  }
  return parts.join(' e ')
}

function buildFallbackPerformance(
  ticker: string,
  categoryLabel?: string
): PlanningAssetPerformance | null {
  const normalized = normalizeTicker(ticker)
  const fallback = fallbackPerformanceMetrics[normalized]
  if (!fallback || !Number.isFinite(fallback.cagr)) {
    return null
  }

  const periodYears =
    fallback.periodYears && fallback.periodYears > 0 ? fallback.periodYears : 5
  const cagr = fallback.cagr

  if (!Number.isFinite(cagr) || cagr <= -1) {
    return null
  }

  const growthFactor = Math.pow(1 + cagr, periodYears)
  if (!Number.isFinite(growthFactor) || growthFactor <= 0) {
    return null
  }

  const monthlyRate = Math.pow(1 + cagr, 1 / 12) - 1
  const totalReturn = growthFactor - 1
  const estimatedDividends =
    fallback.dividendYield && fallback.dividendYield > 0
      ? fallback.dividendYield * periodYears * 100
      : 0

  const assetInfo = getAssetInfo(normalized)

  return {
    ticker: normalized,
    name: assetInfo.name,
    category: categoryLabel || assetInfo.category,
    type: assetInfo.type,
    totalReturn,
    cagr,
    monthlyRate,
    growthFactor,
    totalDividends: estimatedDividends,
    periodYears,
  }
}

function buildProjectionChart(
  months: number,
  monthlyContribution: number,
  monthlyRate: number
) {
  const points: IChartDataPoint[] = []
  const startDate = new Date()
  let balance = 0
  const step = Math.max(1, Math.ceil(months / 120))

  for (let month = 0; month <= months; month++) {
    if (month > 0) {
      if (monthlyRate > 0) {
        balance = balance * (1 + monthlyRate) + monthlyContribution
      } else {
        balance += monthlyContribution
      }
    }

    if (month === 0 || month === months || month % step === 0) {
      const currentDate = new Date(startDate)
      currentDate.setMonth(currentDate.getMonth() + month)
      points.push({
        date: currentDate.toLocaleDateString('pt-BR', {
          month: '2-digit',
          year: 'numeric',
        }),
        value: balance,
        timestamp: currentDate.getTime(),
      })
    }
  }

  return points
}

function computeProjectionTotals(
  monthlyContribution: number,
  months: number,
  monthlyRate: number
) {
  const totalInvested = monthlyContribution * months
  let finalValue = totalInvested
  if (monthlyRate > 0) {
    finalValue =
      (monthlyContribution * ((1 + monthlyRate) ** months - 1)) / monthlyRate
  }

  return {
    totalInvested,
    finalValue,
  }
}

function computeMonthsToGoal(
  goalValue: number,
  monthlyContribution: number,
  monthlyRate: number
) {
  if (goalValue <= 0 || monthlyContribution <= 0) return 0
  if (monthlyRate <= 0) {
    return Math.ceil(goalValue / monthlyContribution)
  }

  const ratio = (goalValue * monthlyRate) / monthlyContribution + 1
  if (ratio <= 1) {
    return Math.ceil(goalValue / monthlyContribution)
  }

  const months = Math.log(ratio) / Math.log(1 + monthlyRate)
  if (!Number.isFinite(months) || months <= 0) {
    return Math.ceil(goalValue / monthlyContribution)
  }

  return Math.ceil(months)
}

async function getPriceHistory(ticker: string) {
  const normalized = normalizeTicker(ticker)
  if (priceHistoryCache.has(normalized)) {
    return priceHistoryCache.get(normalized) || []
  }

  try {
    const history = await assetHistoricPrices(normalized, '5y')
    priceHistoryCache.set(normalized, history || [])
    return history || []
  } catch (error) {
    console.warn(
      `Falha ao obter histórico de preços para ${normalized}:`,
      error
    )
    priceHistoryCache.set(normalized, [])
    return []
  }
}

async function getDividends(ticker: string) {
  const normalized = normalizeTicker(ticker)
  if (dividendsCache.has(normalized)) {
    return dividendsCache.get(normalized) || []
  }

  try {
    const data = await getTickerDividends(normalized)
    dividendsCache.set(normalized, data || [])
    return data || []
  } catch (error) {
    console.warn(`Falha ao obter dividendos para ${normalized}:`, error)
    dividendsCache.set(normalized, null)
    return []
  }
}

async function simulateAssetPerformance(
  ticker: string,
  {
    reinvestDividends = true,
    categoryLabel,
  }: {
    reinvestDividends?: boolean
    categoryLabel?: string
  } = {}
): Promise<PlanningAssetPerformance | null> {
  const normalizedTicker = normalizeTicker(ticker)
  if (!normalizedTicker) return null

  const priceHistoryRaw = await getPriceHistory(normalizedTicker)
  if (!priceHistoryRaw || priceHistoryRaw.length < 2) {
    return buildFallbackPerformance(normalizedTicker, categoryLabel)
  }

  const priceHistory = priceHistoryRaw
    .map((item: any) => ({
      date: new Date(item.price_at),
      price: Number(item.market_price),
    }))
    .filter((entry) => Number.isFinite(entry.price) && entry.price > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  if (priceHistory.length < 2) {
    const fallback = buildFallbackPerformance(normalizedTicker, categoryLabel)
    if (fallback) return fallback
    return null
  }

  const dividendsRaw = reinvestDividends
    ? await getDividends(normalizedTicker)
    : []
  const dividends = (dividendsRaw || [])
    .map((dividend: any) => ({
      date: new Date(dividend.payment_date),
      rate: parseFloat(dividend.rate) || 0,
    }))
    .filter((dividend) => Number.isFinite(dividend.rate) && dividend.rate > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const initialEntry = priceHistory[0]
  const finalEntry = priceHistory[priceHistory.length - 1]
  const initialPrice = initialEntry.price
  const finalPrice = finalEntry.price

  let shares = 1
  let totalDividends = 0

  if (dividends.length) {
    for (const dividend of dividends) {
      if (dividend.date < initialEntry.date || dividend.date > finalEntry.date)
        continue
      const matchingPrice =
        priceHistory.find((price) => price.date >= dividend.date) ?? finalEntry
      if (!matchingPrice || matchingPrice.price <= 0) continue
      const dividendValue = shares * dividend.rate
      totalDividends += dividendValue
      if (reinvestDividends) {
        const newShares = dividendValue / matchingPrice.price
        shares += newShares
      }
    }
  }

  const finalValue = shares * finalPrice
  if (!Number.isFinite(finalValue) || finalValue <= 0 || initialPrice <= 0) {
    const fallback = buildFallbackPerformance(normalizedTicker, categoryLabel)
    if (fallback) return fallback
    return null
  }

  const growthFactor = finalValue / initialPrice
  const periodYears =
    (finalEntry.date.getTime() - initialEntry.date.getTime()) /
    (365.25 * 24 * 60 * 60 * 1000)

  const safePeriodYears =
    Number.isFinite(periodYears) && periodYears > 0 ? periodYears : 5
  const cagr = Math.pow(growthFactor, 1 / safePeriodYears) - 1
  const monthlyRate = Math.pow(1 + cagr, 1 / 12) - 1

  const assetInfo = getAssetInfo(normalizedTicker)

  return {
    ticker: normalizedTicker,
    name: assetInfo.name,
    category: categoryLabel || assetInfo.category,
    type: assetInfo.type,
    totalReturn: growthFactor - 1,
    cagr,
    monthlyRate,
    growthFactor,
    totalDividends,
    periodYears: safePeriodYears,
  }
}

async function calculatePlanningStrategy() {
  const goalValue = Number(planningForm.value.goalValue) || 0
  const monthlyContribution =
    Number(planningForm.value.monthlyContribution) || 0

  if (goalValue <= 0) {
    planningError.value = 'Informe uma meta financeira válida.'
    return
  }

  if (monthlyContribution <= 0) {
    planningError.value = 'Informe um aporte mensal válido.'
    return
  }

  planningLoading.value = true
  planningError.value = ''
  planningResult.value = null

  try {
    let recommendedAssets: PlanningRecommendedAsset[] = []
    let monthlyReturnRate = 0
    let analysisYears = 5

    if (planningForm.value.strategy === 'rentabilidade') {
      let topStocks: IAsset[] = []
      let topReits: IAsset[] = []

      try {
        topStocks = await getTopStocks('top', 12)
      } catch (error) {
        console.warn(
          'Não foi possível carregar top stocks, usando fallback.',
          error
        )
      }

      try {
        topReits = await getTopReits('top', 10)
      } catch (error) {
        console.warn(
          'Não foi possível carregar top FIIs, usando fallback.',
          error
        )
      }

      const candidateMap = new Map<
        string,
        {
          ticker: string
          categoryLabel: string
        }
      >()

      const addCandidate = (
        rawTicker: string | undefined | null,
        categoryLabel: string
      ) => {
        const normalized = normalizeTicker(rawTicker || '')
        if (!normalized) return
        if (!candidateMap.has(normalized)) {
          candidateMap.set(normalized, {
            ticker: normalized,
            categoryLabel,
          })
        }
      }

      planningUniverse.rentabilidade.priorityTickers.forEach((ticker) =>
        addCandidate(ticker, 'Ação')
      )

      topStocks.forEach((asset) =>
        addCandidate(asset.ticker || asset.stock, 'Ação')
      )

      planningUniverse.rentabilidade.fallbackStocks.forEach((ticker) =>
        addCandidate(ticker, 'Ação')
      )

      topReits.forEach((asset) =>
        addCandidate(asset.ticker || asset.stock, 'FII')
      )

      planningUniverse.rentabilidade.fallbackFiis.forEach((ticker) =>
        addCandidate(ticker, 'FII')
      )

      const candidates = Array.from(candidateMap.values())

      const performances = (
        await Promise.all(
          candidates.map((candidate) =>
            simulateAssetPerformance(candidate.ticker, {
              reinvestDividends: true,
              categoryLabel: candidate.categoryLabel,
            })
          )
        )
      ).filter((asset): asset is PlanningAssetPerformance => Boolean(asset))

      if (performances.length < planningUniverse.rentabilidade.minimumAssets) {
        throw new Error(
          'Não encontramos dados históricos suficientes para montar a carteira de maior rentabilidade.'
        )
      }

      performances.sort((a, b) => b.totalReturn - a.totalReturn)
      const selectedAssets = performances.slice(
        0,
        Math.max(
          planningUniverse.rentabilidade.minimumAssets,
          Math.min(5, performances.length)
        )
      )

      const positiveReturnSum = selectedAssets.reduce(
        (sum, asset) => sum + Math.max(asset.totalReturn, 0),
        0
      )

      if (positiveReturnSum > 0) {
        recommendedAssets = selectedAssets.map((asset) => ({
          ...asset,
          weight: Math.max(asset.totalReturn, 0) / positiveReturnSum,
        }))
      } else {
        const equalWeight =
          selectedAssets.length > 0 ? 1 / selectedAssets.length : 0
        recommendedAssets = selectedAssets.map((asset) => ({
          ...asset,
          weight: equalWeight,
        }))
      }

      analysisYears = selectedAssets.reduce(
        (min, asset) => Math.min(min, asset.periodYears),
        selectedAssets[0]?.periodYears ?? analysisYears
      )

      monthlyReturnRate = recommendedAssets.reduce(
        (sum, asset) => sum + asset.weight * asset.monthlyRate,
        0
      )
    } else {
      const selectedCategoryAssets: PlanningAssetPerformance[] = []
      const {
        categories,
        categoryLabels,
        fixedIncomeAnnualRate,
        fixedIncomeWeight,
      } = planningUniverse.seguranca

      for (const [categoryKey, tickers] of Object.entries(categories)) {
        const performances = (
          await Promise.all(
            tickers.map((ticker) =>
              simulateAssetPerformance(ticker, {
                reinvestDividends: true,
                categoryLabel:
                  categoryLabels[categoryKey as keyof typeof categoryLabels] ||
                  categoryKey,
              })
            )
          )
        ).filter((asset): asset is PlanningAssetPerformance => Boolean(asset))

        if (performances.length === 0) continue
        performances.sort((a, b) => b.cagr - a.cagr)
        selectedCategoryAssets.push(performances[0])
      }

      if (selectedCategoryAssets.length === 0) {
        throw new Error(
          'Não encontramos dados históricos suficientes para montar a carteira defensiva.'
        )
      }

      analysisYears = selectedCategoryAssets.reduce(
        (min, asset) => Math.min(min, asset.periodYears),
        selectedCategoryAssets[0]?.periodYears ?? analysisYears
      )

      const variableWeight = 1 - fixedIncomeWeight
      const weightPerAsset =
        selectedCategoryAssets.length > 0
          ? variableWeight / selectedCategoryAssets.length
          : 0

      recommendedAssets = selectedCategoryAssets.map((asset) => ({
        ...asset,
        weight: weightPerAsset,
      }))

      const fixedIncomeMonthlyRate =
        Math.pow(1 + fixedIncomeAnnualRate, 1 / 12) - 1
      const fixedIncomeGrowthFactor = Math.pow(
        1 + fixedIncomeMonthlyRate,
        Math.max(Math.round(analysisYears * 12), 1)
      )

      const fixedIncomeAsset: PlanningRecommendedAsset = {
        ticker: 'RF-10%',
        name: 'Renda Fixa (estimativa 10% a.a.)',
        category: 'Renda Fixa',
        type: 'Renda Fixa',
        totalReturn: fixedIncomeGrowthFactor - 1,
        cagr: fixedIncomeAnnualRate,
        monthlyRate: fixedIncomeMonthlyRate,
        growthFactor: fixedIncomeGrowthFactor,
        totalDividends: 0,
        periodYears: analysisYears,
        weight: fixedIncomeWeight,
      }

      recommendedAssets.push(fixedIncomeAsset)

      monthlyReturnRate = recommendedAssets.reduce(
        (sum, asset) => sum + asset.weight * asset.monthlyRate,
        0
      )
    }

    if (!Number.isFinite(analysisYears) || analysisYears <= 0) {
      analysisYears = 5
    }

    const totalWeight = recommendedAssets.reduce(
      (sum, asset) => sum + asset.weight,
      0
    )
    if (totalWeight > 0 && Math.abs(totalWeight - 1) > 0.001) {
      recommendedAssets = recommendedAssets.map((asset) => ({
        ...asset,
        weight: asset.weight / totalWeight,
      }))
    }

    const periodMonths = Math.max(Math.round(analysisYears * 12), 1)
    const monthsToGoal = computeMonthsToGoal(
      goalValue,
      monthlyContribution,
      monthlyReturnRate
    )
    const totals = computeProjectionTotals(
      monthlyContribution,
      monthsToGoal,
      monthlyReturnRate
    )
    const historicalTotals = computeProjectionTotals(
      monthlyContribution,
      periodMonths,
      monthlyReturnRate
    )

    const targetDate = new Date()
    targetDate.setMonth(targetDate.getMonth() + monthsToGoal)

    planningResult.value = {
      strategy: planningForm.value.strategy,
      goalValue,
      monthlyContribution,
      monthsToGoal,
      timeToGoalLabel: formatTimeLabel(monthsToGoal),
      targetDateLabel: targetDate.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      }),
      totalInvestedUntilGoal: totals.totalInvested,
      estimatedFinalValue: totals.finalValue,
      estimatedProfit: totals.finalValue - totals.totalInvested,
      monthlyReturnRate,
      historicalFinalValue: historicalTotals.finalValue,
      historicalInvested: historicalTotals.totalInvested,
      historicalProfit:
        historicalTotals.finalValue - historicalTotals.totalInvested,
      historicalYears: analysisYears,
      recommendedAssets,
      chartData: buildProjectionChart(
        monthsToGoal,
        monthlyContribution,
        monthlyReturnRate
      ),
    }
  } catch (error: any) {
    console.error('Erro ao calcular planejamento:', error)
    planningError.value =
      error?.message ||
      'Não foi possível calcular o planejamento. Tente novamente.'
  } finally {
    planningLoading.value = false
  }
}
</script>

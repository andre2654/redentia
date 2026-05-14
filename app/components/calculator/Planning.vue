<template>
  <CalcUiShell
    :back-to="backTo"
    :back-label="backLabel"
    :last-updated="lastUpdated"
  >
    <template #hero>
      <slot name="hero">
        <p class="calc-eyebrow">Calculadora · Planejamento Patrimonial</p>
        <h1 class="calc-title">Planejamento de Patrimônio</h1>
        <p class="calc-lead">Carteira sugerida baseada em dados históricos pra atingir sua meta.</p>
      </slot>
    </template>

    <template #form>
      <p class="cui-section-label">{{ planningResult ? 'Ajustar simulação' : 'Configure sua simulação' }}</p>
      <div class="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2">
        <CalcUiField label="Meta financeira (R$)" type="currency" v-model="planningForm.goalValue" placeholder="500.000,00" />
        <CalcUiField label="Aporte mensal (R$)" type="currency" v-model="planningForm.monthlyContribution" placeholder="1.500,00" />
      </div>

      <CalcUiField label="Estratégia">
        <CalcUiSegmented
          v-model="planningForm.strategy"
          :options="[
            { value: 'rentabilidade', label: 'Maior rentabilidade', icon: 'i-lucide-rocket' },
            { value: 'seguranca', label: 'Maior segurança', icon: 'i-lucide-shield' },
          ]"
          aria-label="Estratégia de planejamento"
        />
        <template #help>
          Escolha entre maximizar ganhos com ativos de alta performance ou priorizar estabilidade com setores defensivos, FIIs consolidados e 10% de renda fixa.
        </template>
      </CalcUiField>

      <CalcUiButton label="Calcular Planejamento" icon="i-lucide-sparkles" :loading="planningLoading" @click="calculatePlanningStrategy" />

      <UAlert
        v-if="planningError"
        color="red"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :title="planningError"
      />
    </template>

    <template #result>
      <CalcUiResultMega
        v-if="planningResult"
        eyebrow="Tempo estimado para alcançar a meta"
        :value="planningResult.timeToGoalLabel"
        mega-color="primary"
        :kpis="[
          { label: 'Aportes até a meta', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(planningResult.totalInvestedUntilGoal), color: 'heading' },
          { label: 'Resultado projetado', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(planningResult.estimatedFinalValue), color: 'primary' },
          { label: 'Retorno mensal médio', value: `${(planningResult.monthlyReturnRate * 100).toFixed(2)}%`, color: 'positive' },
        ]"
      >
        <template #caption>
          até <span class="hl">{{ planningResult.targetDateLabel }}</span>
          · <span class="positive">+{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(planningResult.estimatedProfit) }}</span> de ganho
        </template>
      </CalcUiResultMega>
      <div v-else class="cui-result-empty">
        <p class="cui-result-eyebrow">Tempo estimado</p>
        <p class="cui-empty-text">Preencha os dados ao lado e clique em "Calcular Planejamento".</p>
      </div>
    </template>

    <template #chart>
      <div v-if="planningResult" class="flex flex-col gap-4">
      <CalcUiChart label="Projeção de patrimônio">
        <AtomsGraphLine
          :data="planningResult.chartData"
          :height="240"
          :legend="[{ label: 'Patrimônio projetado', color: ChartColors.positive }]"
          :colors="[ChartColors.positive]"
        />
      </CalcUiChart>

      <div class="cui-subcard">
        <h4 class="cui-subcard-title">Se tivesse investido nos últimos {{ planningResult.historicalYears.toFixed(1) }} anos</h4>
        <p class="cui-subcard-desc">Considerando o mesmo aporte mensal e a carteira recomendada.</p>
        <div class="cui-subcard-grid cui-subcard-grid--3">
          <CalcUiKpiBox label="Total investido" :value="new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(planningResult.historicalInvested)" color="heading" />
          <CalcUiKpiBox label="Valor final" :value="new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(planningResult.historicalFinalValue)" color="primary" />
          <CalcUiKpiBox label="Lucro histórico" :value="new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(planningResult.historicalProfit)" color="positive" />
        </div>
      </div>

      <div class="cui-subcard">
        <h4 class="cui-subcard-title">Carteira sugerida</h4>
        <p class="cui-subcard-desc">Distribuição baseada no desempenho histórico e nos critérios da estratégia escolhida.</p>
        <div class="cui-asset-grid">
          <div
            v-for="asset in planningResult.recommendedAssets"
            :key="`${asset.ticker}-${asset.category}`"
            class="cui-asset-card"
          >
            <div class="cui-asset-head">
              <div>
                <p class="cui-asset-cat">{{ asset.category }}</p>
                <h5 class="cui-asset-ticker">{{ asset.ticker }}</h5>
                <p class="cui-asset-name">{{ asset.name }}</p>
              </div>
              <div class="cui-asset-weight">
                <p class="cui-asset-weight-label">Peso</p>
                <p class="cui-asset-weight-value">{{ (asset.weight * 100).toFixed(0) }}%</p>
              </div>
            </div>
            <div class="cui-asset-metrics">
              <div>
                <p class="cui-asset-metric-label">Retorno {{ planningResult.historicalYears.toFixed(0) }} anos</p>
                <p :class="['cui-asset-metric-value', asset.totalReturn >= 0 ? 'cui-asset-metric-value--positive' : 'cui-asset-metric-value--negative']">{{ (asset.totalReturn * 100).toFixed(1) }}%</p>
              </div>
              <div>
                <p class="cui-asset-metric-label">CAGR anual</p>
                <p class="cui-asset-metric-value">{{ (asset.cagr * 100).toFixed(1) }}%</p>
              </div>
              <div>
                <p class="cui-asset-metric-label">Retorno mensal</p>
                <p class="cui-asset-metric-value">{{ (asset.monthlyRate * 100).toFixed(2) }}%</p>
              </div>
              <div>
                <p class="cui-asset-metric-label">Dividendos reinvestidos</p>
                <p class="cui-asset-metric-value cui-asset-metric-value--positive">{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.totalDividends) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="cui-callout">
        Recomendação baseada em dados históricos. Rentabilidades passadas não garantem resultados futuros. Ajuste sempre sua carteira conforme o seu perfil de risco.
      </div>
      </div>
      <div v-else class="cui-result-empty">
        <p class="cui-chart-label">Análise complementar</p>
        <p class="cui-empty-text">Carteira sugerida e projeção aparecem após o cálculo.</p>
      </div>
    </template>
  </CalcUiShell>
</template>

<script setup lang="ts">
import { showErrorNotification } from '~/composables/useNotify'
import type { IChartDataPoint } from '~/types/chart'
import { ChartColors } from '~/design/chartColors'

defineProps<{
  backTo?: string
  backLabel?: string
  lastUpdated?: string
  assets?: unknown[]
}>()

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
// populares (ex: /calculadora/planejamento?goal=500000&monthly=1500).
// Cada combinacao vira uma "landing page" virtual indexavel pelo
// Google sem precisar duplicar a pagina. O usePageSeo da rota mae
// cobre todas as variacoes via canonical.
//
// Params suportados:
//   ?goal=500000          meta financeira em R$ (numero)
//   ?monthly=1500         aporte mensal em R$
//   ?strategy=rentabilidade|seguranca   estrategia
//   ?auto=1               dispara o calculo automaticamente apos hidratar
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

function parseStrategyParam(value: unknown): PlanningStrategy | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return null
  const normalized = raw.trim().toLowerCase()
  if (normalized === 'rentabilidade' || normalized === 'seguranca') {
    return normalized
  }
  return null
}

function applyQueryParams() {
  const q = route.query
  const goal = parseNumberParam(q.goal)
  const monthly = parseNumberParam(q.monthly)
  const strategy = parseStrategyParam(q.strategy)

  if (goal !== null && goal > 0) planningForm.value.goalValue = goal
  if (monthly !== null && monthly > 0) planningForm.value.monthlyContribution = monthly
  if (strategy !== null) planningForm.value.strategy = strategy

  // Auto-fire o calculo se algum param de input foi passado, usuario
  // chegou aqui via deep-link (compartilhamento, snippet do Google,
  // landing interna), entao a expectativa e ver o resultado direto.
  const hasAnyInput = goal !== null || monthly !== null || strategy !== null
  if (hasAnyInput || q.auto === '1' || q.auto === 'true') {
    nextTick(() => calculatePlanningStrategy())
  }
}

onMounted(() => {
  applyQueryParams()
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
    const result = await $fetch<PlanningResult>('/api/calculate', {
      method: 'POST',
      body: {
        type: 'planning',
        params: {
          goalValue,
          monthlyContribution,
          strategy: planningForm.value.strategy,
        },
      },
    })

    planningResult.value = {
      ...result,
      timeToGoalLabel: formatTimeLabel(result.monthsToGoal),
    }
  } catch (error) {
    const fallbackMessage =
      'Não foi possível calcular o planejamento. Tente novamente.'
    const message =
      error instanceof Error && error.message ? error.message : fallbackMessage
    planningError.value = message
    showErrorNotification('Erro ao calcular planejamento', message)
  } finally {
    planningLoading.value = false
  }
}
</script>

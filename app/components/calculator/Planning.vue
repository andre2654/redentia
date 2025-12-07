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
          <AtomsFormCurrencyInput
            v-model="planningForm.goalValue"
            placeholder="500000"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Aporte mensal (R$)" name="monthlyContribution">
          <AtomsFormCurrencyInput
            v-model="planningForm.monthlyContribution"
            placeholder="1500"
            size="lg"
            variant="soft"
            class="w-full"
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
import { showErrorNotification } from '~/composables/useNotify'
import type { IChartDataPoint } from '~/types/chart'

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

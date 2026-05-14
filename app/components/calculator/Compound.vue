<template>
  <CalcUiShell
    ref="calcRoot"
    :back-to="backTo"
    :back-label="backLabel"
    :last-updated="lastUpdated"
  >
    <template #hero>
      <slot name="hero">
        <p class="calc-eyebrow">Calculadora · Juros Compostos</p>
        <h1 class="calc-title">
          Calculadora de Juros Compostos
        </h1>
        <p class="calc-lead">
          Simule rendimento com juros compostos e aportes mensais.
        </p>
      </slot>
    </template>

    <template #form>
      <p class="cui-section-label">{{ compoundResult ? 'Ajustar simulação' : 'Configure sua simulação' }}</p>
      <div class="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2">
        <CalcUiField
          label="Valor Inicial (R$)"
          type="currency"
          v-model="compoundForm.initialValue"
          placeholder="10.000,00"
        />
        <CalcUiField
          label="Aporte Mensal (R$)"
          type="currency"
          v-model="compoundForm.monthlyValue"
          placeholder="500,00"
        />
        <CalcUiField
          label="Taxa de Juros (%)"
          type="percentage"
          v-model="compoundForm.interestRate"
          :min="0"
          :max="100"
          placeholder="10,50"
        >
          <template #help>
            <CalcUiSegmented
              v-model="compoundForm.interestPeriod"
              :options="[
                { value: 'year', label: 'Ao ano' },
                { value: 'month', label: 'Ao mês' },
              ]"
              aria-label="Período da taxa"
            />
          </template>
        </CalcUiField>
        <CalcUiField
          label="Período"
          type="number"
          v-model="compoundForm.period"
          placeholder="10"
        >
          <template #help>
            <CalcUiSegmented
              v-model="compoundForm.periodType"
              :options="[
                { value: 'years', label: 'Anos' },
                { value: 'months', label: 'Meses' },
              ]"
              aria-label="Unidade do período"
            />
          </template>
        </CalcUiField>
      </div>

      <CalcUiButton
        :label="compoundResult ? 'Atualizar simulação' : 'Calcular simulação'"
        :icon="loading ? 'i-lucide-loader-2' : 'i-lucide-sparkles'"
        :loading="loading"
        @click="calculateCompoundInterest"
      />
    </template>

    <template #result>
      <CalcUiResultMega
        v-if="compoundResult"
        eyebrow="Valor projetado"
        :value="formatBRL(compoundResult.finalValue)"
        :kpis="[
          { label: 'Total investido', value: formatBRL(compoundResult.totalInvested), color: 'heading' },
          { label: 'Juros ganhos', value: `+${formatBRL(compoundResult.totalInterest)}`, color: 'positive' },
          { label: 'Multiplicador', value: `${(compoundResult.finalValue / Math.max(compoundResult.totalInvested, 1)).toFixed(2)}×`, color: 'heading' },
        ]"
      >
        <template #caption>
          em <span class="hl">{{ compoundForm.period }} {{ compoundForm.periodType === 'years' ? 'anos' : 'meses' }}</span>
          · <span class="positive">+{{ ((compoundResult.totalInterest / Math.max(compoundResult.totalInvested, 1)) * 100).toFixed(0) }}%</span> de rendimento
        </template>
      </CalcUiResultMega>
      <div v-else class="cui-result-empty">
        <p class="cui-result-eyebrow">Valor projetado</p>
        <p class="cui-empty-text">Preencha os dados ao lado e clique em "Calcular simulação".</p>
      </div>
    </template>

    <template #chart>
      <CalcUiChart v-if="compoundResult" label="Evolução do patrimônio">
        <AtomsGraphLine
          :data="compoundResult.chartData"
          :height="350"
          :legend="[{ label: 'Patrimônio', color: ChartColors.positive }]"
          :colors="[ChartColors.positive]"
        />
      </CalcUiChart>
      <div v-else class="cui-result-empty">
        <p class="cui-chart-label">Evolução do patrimônio</p>
        <p class="cui-empty-text">O gráfico aparece após o cálculo.</p>
      </div>
    </template>
  </CalcUiShell>
</template>

<script setup lang="ts">
import type { IChartDataPoint } from '~/types/chart'
import { showErrorNotification } from '~/composables/useNotify'
import { ChartColors } from '~/design/chartColors'

defineProps<{
  backTo?: string
  backLabel?: string
  lastUpdated?: string
}>()

type CompoundResult = {
  totalInvested: number
  totalInterest: number
  finalValue: number
  chartData: IChartDataPoint[]
}

type CompoundForm = {
  initialValue: number
  monthlyValue: number
  interestRate: number | null
  interestPeriod: 'year' | 'month'
  period: number | null
  periodType: 'years' | 'months'
}

const compoundForm = ref<CompoundForm>({
  initialValue: 10000,
  monthlyValue: 500,
  interestRate: 10.5,
  interestPeriod: 'year',
  period: 10,
  periodType: 'years',
})

const compoundResult = ref<CompoundResult | null>(null)
const loading = ref(false)
const calcRoot = ref<HTMLElement | null>(null)

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function scrollToCalc() {
  if (typeof window === 'undefined') return
  nextTick(() => {
    (calcRoot.value as any)?.$el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  })
}

const route = useRoute()

function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const normalized = raw.replace(',', '.')
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

function applyQueryParams() {
  const q = route.query
  const initial = parseNumberParam(q.initial)
  const monthly = parseNumberParam(q.monthly)
  const rate = parseNumberParam(q.rate)
  const years = parseNumberParam(q.years)
  const months = parseNumberParam(q.months)

  if (initial !== null) compoundForm.value.initialValue = initial
  if (monthly !== null) compoundForm.value.monthlyValue = monthly
  if (rate !== null) compoundForm.value.interestRate = rate
  if (years !== null) {
    compoundForm.value.period = years
    compoundForm.value.periodType = 'years'
  } else if (months !== null) {
    compoundForm.value.period = months
    compoundForm.value.periodType = 'months'
  }

  const hasAnyInput =
    initial !== null || monthly !== null || rate !== null || years !== null || months !== null
  if (hasAnyInput || q.auto === '1' || q.auto === 'true') {
    nextTick(() => calculateCompoundInterest())
  }
}

onMounted(() => {
  applyQueryParams()
  if (!route.query.initial && !route.query.monthly && !route.query.rate && !route.query.years && !route.query.months) {
    calculateCompoundInterest()
  }
})

watch(
  () => route.query,
  () => {
    applyQueryParams()
    scrollToCalc()
  },
  { deep: true },
)

async function calculateCompoundInterest() {
  const initial = compoundForm.value.initialValue || 0
  const monthly = compoundForm.value.monthlyValue || 0
  const rate = compoundForm.value.interestRate ?? 0
  const period = compoundForm.value.period ?? 0

  loading.value = true
  try {
    const result = await $fetch<CompoundResult>('/api/calculate', {
      method: 'POST',
      body: {
        type: 'compound',
        params: {
          initialValue: initial,
          monthlyValue: monthly,
          interestRate: rate,
          period: period,
          periodType: compoundForm.value.periodType,
          interestPeriod: compoundForm.value.interestPeriod,
        },
      },
    })
    compoundResult.value = result
  } catch {
    compoundResult.value = null
    showErrorNotification(
      'Erro ao calcular',
      'Não foi possível simular o investimento. Tente novamente.'
    )
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cui-section-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  margin: 0 0 28px;
}
.cui-result-empty {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

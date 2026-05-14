<template>
  <CalcUiShell
    :back-to="backTo"
    :back-label="backLabel"
    :last-updated="lastUpdated"
  >
    <template #hero>
      <slot name="hero">
        <p class="calc-eyebrow">Calculadora · Aposentadoria</p>
        <h1 class="calc-title">Calculadora de Aposentadoria</h1>
        <p class="calc-lead">Estime quanto investir hoje pra aposentar com a renda mensal desejada.</p>
      </slot>
    </template>

    <template #form>
      <p class="cui-section-label">{{ results ? 'Ajustar simulação' : 'Configure sua simulação' }}</p>
      <div class="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2">
        <CalcUiField label="Idade Atual" type="number" v-model="form.currentAge" :min="18" :max="100" placeholder="35" />
        <CalcUiField label="Idade Desejada de Aposentadoria" type="number" v-model="form.retirementAge" :min="30" :max="100" placeholder="60" />
        <CalcUiField label="Expectativa de Vida (anos)" type="number" v-model="form.lifeExpectancy" :min="50" :max="120" placeholder="85" />
        <CalcUiField label="Renda Mensal Desejada (R$)" type="currency" v-model="form.monthlyIncome" placeholder="5.000,00" />
        <CalcUiField label="Patrimônio Atual (R$)" type="currency" v-model="form.currentWealth" placeholder="50.000,00" />
        <CalcUiField label="Aporte Mensal (R$)" type="currency" v-model="form.monthlyContribution" placeholder="2.000,00" />
        <CalcUiField label="Retorno na Acumulação (% a.a.)" type="percentage" v-model="form.returnRate" :min="0" :max="30" placeholder="10" />
        <CalcUiField label="Retorno na Fruição (% a.a.)" type="percentage" v-model="form.withdrawalRate" :min="0" :max="20" placeholder="6" />
        <CalcUiField label="Inflação Anual (%)" type="percentage" v-model="form.inflation" :min="0" :max="20" placeholder="4" />
        <CalcUiField label="INSS Mensal (R$)" type="currency" v-model="form.inss" placeholder="0,00" />
      </div>
      <CalcUiButton label="Calcular Aposentadoria" icon="i-lucide-sparkles" @click="calculate" />
    </template>

    <template #result>
      <CalcUiResultMega
        v-if="results"
        eyebrow="Patrimônio projetado"
        :value="formatCurrency(results.projectedWealth)"
        :kpis="[
          { label: 'Anos até aposentar', value: `${results.yearsToRetirement} anos`, color: 'heading' },
          { label: 'Patrimônio necessário', value: formatCurrency(results.requiredWealth), color: 'heading' },
          { label: 'Total investido', value: formatCurrency(results.totalInvested), color: 'heading' },
        ]"
      >
        <template #caption>
          aos <span class="hl">{{ form.retirementAge }} anos</span>
          <span v-if="results.viable" class="positive"> · plano viável</span>
          <span v-else class="negative"> · ajustes necessários</span>
        </template>
      </CalcUiResultMega>
      <div v-else class="cui-result-empty">
        <p class="cui-result-eyebrow">Patrimônio projetado</p>
        <p class="cui-empty-text">Preencha os dados ao lado e clique em "Calcular Aposentadoria".</p>
      </div>
    </template>

    <template #chart>
      <div v-if="results" class="flex flex-col gap-4">
        <div
          class="cui-result-status"
          :class="results.viable ? 'cui-result-status--positive' : 'cui-result-status--negative'"
        >
          <UIcon
            :name="results.viable ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'"
            class="cui-result-status-icon"
          />
          <div>
            <h4 class="cui-result-status-title">
              {{ results.viable ? 'Plano Viável!' : 'Ajustes Necessários' }}
            </h4>
            <p class="cui-result-status-msg">{{ results.message }}</p>
          </div>
        </div>

        <div class="cui-subcard">
          <h4 class="cui-subcard-title">Renda na Aposentadoria</h4>
          <div class="cui-subcard-grid cui-subcard-grid--3">
            <CalcUiKpiBox label="Renda Desejada (hoje)" :value="`${formatCurrency(form.monthlyIncome)}/mês`" color="heading" />
            <CalcUiKpiBox label="Renda Ajustada (futuro)" :value="`${formatCurrency(results.adjustedIncome)}/mês`" color="primary" caption="Corrigida pela inflação" />
            <CalcUiKpiBox label="INSS Estimado" :value="`${formatCurrency(form.inss)}/mês`" color="heading" />
          </div>
        </div>

        <div class="cui-subcard">
          <h4 class="cui-subcard-title">Regra dos 4%</h4>
          <p class="cui-subcard-desc">
            Você pode sacar 4% do patrimônio por ano mantendo o capital com ajuste pela inflação.
          </p>
          <div class="cui-subcard-grid cui-subcard-grid--2">
            <CalcUiKpiBox label="Com seu patrimônio projetado" :value="`${formatCurrency(results.projectedWealth * 0.04 / 12)}/mês`" color="heading" />
            <CalcUiKpiBox label="Duração estimada" :value="`${results.wealthDuration} anos`" color="primary" />
          </div>
        </div>

        <div class="cui-subcard">
          <h4 class="cui-subcard-title">Cenários Alternativos</h4>
          <div class="cui-scenario-list">
            <div class="cui-scenario">
              <div>
                <p class="cui-scenario-title">Trabalhar mais 3 anos</p>
                <p class="cui-scenario-sub">Aposentar aos {{ form.retirementAge + 3 }}</p>
              </div>
              <p class="cui-scenario-value">{{ formatCurrency(results.scenarios.work3More) }}</p>
            </div>
            <div class="cui-scenario">
              <div>
                <p class="cui-scenario-title">Aumentar aporte em 20%</p>
                <p class="cui-scenario-sub">Investir {{ formatCurrency(form.monthlyContribution * 1.2) }}/mês</p>
              </div>
              <p class="cui-scenario-value">{{ formatCurrency(results.scenarios.increase20Percent) }}</p>
            </div>
            <div class="cui-scenario">
              <div>
                <p class="cui-scenario-title">Reduzir renda em 20%</p>
                <p class="cui-scenario-sub">Viver com {{ formatCurrency(form.monthlyIncome * 0.8) }}/mês</p>
              </div>
              <p class="cui-scenario-value">{{ formatCurrency(results.scenarios.reduce20Percent) }}</p>
            </div>
          </div>
        </div>

        <div class="cui-callout">
          <strong>Lembre-se:</strong> Esta é uma projeção. Revise anualmente e ajuste conforme necessário.
        </div>
      </div>
      <div v-else class="cui-result-empty">
        <p class="cui-chart-label">Análise complementar</p>
        <p class="cui-empty-text">Detalhes adicionais aparecem após o cálculo.</p>
      </div>
    </template>
  </CalcUiShell>
</template>

<script setup lang="ts">
defineProps<{
  backTo?: string
  backLabel?: string
  lastUpdated?: string
}>()

const form = ref({
  currentAge: 35,
  retirementAge: 60,
  lifeExpectancy: 85,
  monthlyIncome: 5000,
  currentWealth: 50000,
  monthlyContribution: 2000,
  returnRate: 10,
  withdrawalRate: 6,
  inflation: 4,
  inss: 0,
})

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
  const age = parseNumberParam(q.age)
  const retire = parseNumberParam(q.retire)
  const life = parseNumberParam(q.life)
  const income = parseNumberParam(q.income)
  const wealth = parseNumberParam(q.wealth ?? q.atual)
  const monthly = parseNumberParam(q.monthly)
  const rate = parseNumberParam(q.rate)
  const withdrawal = parseNumberParam(q.withdrawal)
  const inflation = parseNumberParam(q.inflation)
  const inss = parseNumberParam(q.inss)

  if (age !== null) form.value.currentAge = age
  if (retire !== null) form.value.retirementAge = retire
  if (life !== null) form.value.lifeExpectancy = life
  if (income !== null) form.value.monthlyIncome = income
  if (wealth !== null) form.value.currentWealth = wealth
  if (monthly !== null) form.value.monthlyContribution = monthly
  if (rate !== null) form.value.returnRate = rate
  if (withdrawal !== null) form.value.withdrawalRate = withdrawal
  if (inflation !== null) form.value.inflation = inflation
  if (inss !== null) form.value.inss = inss

  const hasAnyInput =
    age !== null || retire !== null || life !== null || income !== null ||
    wealth !== null || monthly !== null || rate !== null || withdrawal !== null ||
    inflation !== null || inss !== null
  if (hasAnyInput || q.auto === '1' || q.auto === 'true') {
    nextTick(() => calculate())
  }
}

onMounted(() => {
  applyQueryParams()
})

watch(
  () => route.query,
  () => applyQueryParams(),
  { deep: true },
)

interface Results {
  viable: boolean
  message: string
  yearsToRetirement: number
  projectedWealth: number
  requiredWealth: number
  totalInvested: number
  adjustedIncome: number
  wealthDuration: number
  scenarios: {
    work3More: number
    increase20Percent: number
    reduce20Percent: number
  }
}

const results = ref<Results | null>(null)

function calculate() {
  const {
    currentAge, retirementAge, lifeExpectancy, monthlyIncome,
    currentWealth, monthlyContribution, returnRate, withdrawalRate,
    inflation, inss,
  } = form.value

  if (retirementAge <= currentAge) {
    alert('A idade de aposentadoria deve ser maior que a idade atual')
    return
  }

  const yearsToRetirement = retirementAge - currentAge
  const monthsToRetirement = yearsToRetirement * 12
  const monthlyReturn = returnRate / 100 / 12
  const monthlyInflation = inflation / 100 / 12

  let wealth = currentWealth
  let totalInvested = currentWealth

  for (let month = 0; month < monthsToRetirement; month++) {
    wealth = wealth * (1 + monthlyReturn) + monthlyContribution
    totalInvested += monthlyContribution
  }

  const adjustedIncome = monthlyIncome * Math.pow(1 + monthlyInflation, monthsToRetirement)
  const netIncome = adjustedIncome - inss
  const requiredWealth = (netIncome * 12) / (withdrawalRate / 100)

  const viable = wealth >= requiredWealth
  const gap = requiredWealth - wealth
  const gapPercent = (gap / requiredWealth) * 100

  let message = ''
  if (viable) {
    message = `Seu patrimônio projetado supera o necessário em ${formatCurrency(wealth - requiredWealth)}`
  } else if (gapPercent <= 20) {
    message = `Falta ${formatCurrency(gap)} (${gapPercent.toFixed(1)}%). Pequenos ajustes podem viabilizar.`
  } else {
    message = `Gap significativo de ${formatCurrency(gap)} (${gapPercent.toFixed(1)}%). Considere aumentar aportes ou estender prazo.`
  }

  // Duração: meses que o patrimônio dura na fase de fruição
  const monthlyWithdrawal = adjustedIncome - inss
  const fruitionMonths = wealth > 0 && monthlyWithdrawal > 0
    ? Math.floor(Math.log(1 - (wealth * (withdrawalRate / 100 / 12)) / -monthlyWithdrawal) / Math.log(1 + withdrawalRate / 100 / 12))
    : 0
  const wealthDuration = Math.min(Math.floor(fruitionMonths / 12), lifeExpectancy - retirementAge)

  results.value = {
    viable,
    message,
    yearsToRetirement,
    projectedWealth: wealth,
    requiredWealth,
    totalInvested,
    adjustedIncome,
    wealthDuration,
    scenarios: {
      work3More: calculateScenario(retirementAge + 3 - currentAge, monthlyContribution),
      increase20Percent: calculateScenario(yearsToRetirement, monthlyContribution * 1.2),
      reduce20Percent: (monthlyIncome * 0.8 * 12) / (withdrawalRate / 100),
    },
  }
}

function calculateScenario(years: number, contribution: number): number {
  const monthlyReturn = form.value.returnRate / 100 / 12
  const months = years * 12
  const pmt = contribution || form.value.monthlyContribution

  let wealth = form.value.currentWealth

  for (let month = 0; month < months; month++) {
    wealth = wealth * (1 + monthlyReturn) + pmt
  }

  return wealth
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
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

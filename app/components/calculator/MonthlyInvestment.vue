<template>
  <CalcUiShell
    :back-to="backTo"
    :back-label="backLabel"
    :last-updated="lastUpdated"
  >
    <template #hero>
      <slot name="hero">
        <p class="calc-eyebrow">Calculadora · Quanto Investir</p>
        <h1 class="calc-title">Calculadora de Aporte Mensal</h1>
        <p class="calc-lead">Descubra quanto investir por mês pra atingir sua meta financeira.</p>
      </slot>
    </template>

    <template #form>
      <p class="cui-section-label">{{ results ? 'Ajustar simulação' : 'Configure sua simulação' }}</p>
      <div class="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2">
        <CalcUiField label="Meta Financeira (R$)" type="currency" v-model="form.goal" placeholder="500.000,00" />
        <CalcUiField label="Prazo (anos)" type="number" v-model="form.years" :min="1" :max="50" placeholder="10" />
        <CalcUiField label="Patrimônio Atual (R$)" type="currency" v-model="form.currentWealth" placeholder="50.000,00" />
        <CalcUiField label="Taxa de Retorno (% a.a.)" type="percentage" v-model="form.returnRate" :min="0" :max="30" placeholder="10" />
      </div>

      <UCheckbox
        v-model="form.inflationAdjust"
        label="Ajustar aportes pela inflação anualmente"
      />

      <CalcUiField
        v-if="form.inflationAdjust"
        label="Inflação Anual (%)"
        type="percentage"
        v-model="form.inflation"
        :min="0"
        :max="20"
        placeholder="4"
      />

      <CalcUiButton label="Calcular Aporte Necessário" icon="i-lucide-sparkles" @click="calculate" />
    </template>

    <template #result>
      <CalcUiResultMega
        v-if="results"
        eyebrow="Você precisa investir"
        :value="formatCurrency(results.monthlyContribution)"
        :kpis="[
          { label: 'Total que será investido', value: formatCurrency(results.totalInvested), color: 'heading' },
          { label: 'Total de juros', value: formatCurrency(results.totalInterest), color: 'positive' },
          { label: 'Meta final', value: formatCurrency(form.goal), color: 'primary' },
        ]"
      >
        <template #caption>
          por mês durante <span class="hl">{{ form.years }} anos</span>
        </template>
      </CalcUiResultMega>
      <div v-else class="cui-result-empty">
        <p class="cui-result-eyebrow">Aporte necessário</p>
        <p class="cui-empty-text">Preencha os dados ao lado e clique em "Calcular Aporte Necessário".</p>
      </div>
    </template>

    <template #chart>
      <div v-if="results" class="flex flex-col gap-4">

      <!-- Composição -->
      <div class="cui-subcard">
        <h4 class="cui-subcard-title">De onde vem o dinheiro?</h4>
        <div class="cui-bar-group">
          <div class="cui-bar-row">
            <span class="cui-bar-label">Seus aportes</span>
            <span class="cui-bar-value">{{ results.contributionPercent.toFixed(1) }}%</span>
          </div>
          <div class="cui-bar-track">
            <div class="cui-bar-fill cui-bar-fill--primary" :style="{ width: `${results.contributionPercent}%` }" />
          </div>
          <div class="cui-bar-row">
            <span class="cui-bar-label">Juros compostos</span>
            <span class="cui-bar-value cui-bar-value--positive">{{ results.interestPercent.toFixed(1) }}%</span>
          </div>
          <div class="cui-bar-track">
            <div class="cui-bar-fill cui-bar-fill--positive" :style="{ width: `${results.interestPercent}%` }" />
          </div>
        </div>
      </div>

      <!-- Cenários -->
      <div class="cui-subcard">
        <h4 class="cui-subcard-title">E se...?</h4>
        <div class="cui-scenario-list">
          <div class="cui-scenario">
            <div>
              <p class="cui-scenario-title">Aumentar aporte em 20%</p>
              <p class="cui-scenario-sub">Investir {{ formatCurrency(results.monthlyContribution * 1.2) }}/mês</p>
            </div>
            <div>
              <p class="cui-scenario-value">{{ formatCurrency(results.scenarios.increase20) }}</p>
              <p class="cui-scenario-delta cui-scenario-delta--positive">+{{ formatCurrency(results.scenarios.increase20 - form.goal) }}</p>
            </div>
          </div>
          <div class="cui-scenario">
            <div>
              <p class="cui-scenario-title">Reduzir aporte em 20%</p>
              <p class="cui-scenario-sub">Investir {{ formatCurrency(results.monthlyContribution * 0.8) }}/mês</p>
            </div>
            <div>
              <p class="cui-scenario-value cui-scenario-value--neutral">{{ formatCurrency(results.scenarios.reduce20) }}</p>
              <p class="cui-scenario-delta cui-scenario-delta--negative">{{ formatCurrency(results.scenarios.reduce20 - form.goal) }}</p>
            </div>
          </div>
          <div class="cui-scenario">
            <div>
              <p class="cui-scenario-title">Estender prazo em 2 anos</p>
              <p class="cui-scenario-sub">Investir por {{ form.years + 2 }} anos</p>
            </div>
            <div>
              <p class="cui-scenario-value">{{ formatCurrency(results.scenarios.extend2Years) }}</p>
              <p class="cui-scenario-delta cui-scenario-delta--positive">-{{ ((1 - results.scenarios.extend2Years / results.monthlyContribution) * 100).toFixed(0) }}% aporte</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Sensibilidade -->
      <div class="cui-subcard">
        <h4 class="cui-subcard-title">Aporte necessário por taxa de retorno</h4>
        <div class="cui-table-wrap">
          <table class="cui-table">
            <thead>
              <tr>
                <th>Taxa a.a.</th>
                <th>Aporte mensal</th>
                <th>Total investido</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rate in [6, 8, 10, 12, 15]" :key="rate">
                <td>{{ rate }}%</td>
                <td class="cui-table-strong">{{ formatCurrency(calculateForRate(rate)) }}</td>
                <td class="cui-table-muted">{{ formatCurrency(calculateForRate(rate) * form.years * 12) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="cui-callout">
        <strong>Importante:</strong> Este cálculo assume aportes mensais fixos. Se você ajustar os aportes pela inflação ou aumentar conforme sua renda cresce, alcançará a meta mais rapidamente.
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
  goal: 500000,
  years: 10,
  currentWealth: 50000,
  returnRate: 10,
  inflationAdjust: false,
  inflation: 4,
})

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
// Deep-link via query params — abilita URLs canonicas pra cenarios
// populares (ex: /calculadora/quanto-investir?goal=1000000&years=20).
// Cada combinacao vira uma "landing page" virtual indexavel pelo
// Google sem precisar duplicar a pagina.
//
// Params suportados:
//   ?goal=500000         meta financeira em R$ (numero)
//   ?years=10            prazo em anos
//   ?wealth=50000        patrimonio atual em R$ (alias: ?atual=)
//   ?rate=10             taxa em % a.a.
//   ?inflation=4         inflacao em % a.a. (ativa o ajuste)
//   ?auto=1              dispara o calculo automaticamente apos hidratar
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

function applyQueryParams() {
  const q = route.query
  const goal = parseNumberParam(q.goal)
  const years = parseNumberParam(q.years)
  const wealth = parseNumberParam(q.wealth ?? q.atual)
  const rate = parseNumberParam(q.rate)
  const inflation = parseNumberParam(q.inflation)

  if (goal !== null) form.value.goal = goal
  if (years !== null) form.value.years = years
  if (wealth !== null) form.value.currentWealth = wealth
  if (rate !== null) form.value.returnRate = rate
  if (inflation !== null) {
    form.value.inflation = inflation
    form.value.inflationAdjust = true
  }

  const hasAnyInput =
    goal !== null || years !== null || wealth !== null || rate !== null || inflation !== null
  if (hasAnyInput || q.auto === '1' || q.auto === 'true') {
    nextTick(() => calculate())
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

interface Results {
  monthlyContribution: number
  totalInvested: number
  totalInterest: number
  contributionPercent: number
  interestPercent: number
  scenarios: {
    increase20: number
    reduce20: number
    extend2Years: number
  }
}

const results = ref<Results | null>(null)

function calculate() {
  const { goal, years, currentWealth, returnRate } = form.value

  if (!goal || !years || goal <= currentWealth) {
    alert('Verifique os valores. A meta deve ser maior que o patrimônio atual.')
    return
  }

  const months = years * 12
  const monthlyRate = returnRate / 100 / 12

  // Valor futuro do patrimônio atual
  const futureValueCurrent = currentWealth * Math.pow(1 + monthlyRate, months)

  // Quanto falta para a meta
  const remaining = goal - futureValueCurrent

  // Calcular PMT (aporte mensal) usando fórmula de anuidade
  // FV = PMT × [((1+i)^n - 1) / i]
  // PMT = FV ÷ [((1+i)^n - 1) / i]
  const monthlyContribution =
    remaining / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate))

  const totalInvested = currentWealth + monthlyContribution * months
  const totalInterest = goal - totalInvested

  const contributionPercent = (totalInvested / goal) * 100
  const interestPercent = (totalInterest / goal) * 100

  // Cenários
  const increase20 = simulateWithContribution(monthlyContribution * 1.2)
  const reduce20 = simulateWithContribution(monthlyContribution * 0.8)
  const extend2Years = calculateForYears(years + 2)

  results.value = {
    monthlyContribution,
    totalInvested,
    totalInterest,
    contributionPercent,
    interestPercent,
    scenarios: {
      increase20,
      reduce20,
      extend2Years,
    },
  }
}

function simulateWithContribution(pmt: number): number {
  const months = form.value.years * 12
  const monthlyRate = form.value.returnRate / 100 / 12
  const futureValueCurrent = form.value.currentWealth * Math.pow(1 + monthlyRate, months)
  const futureValueContributions =
    pmt * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate))
  return futureValueCurrent + futureValueContributions
}

function calculateForYears(years: number): number {
  const months = years * 12
  const monthlyRate = form.value.returnRate / 100 / 12
  const futureValueCurrent = form.value.currentWealth * Math.pow(1 + monthlyRate, months)
  const remaining = form.value.goal - futureValueCurrent
  return remaining / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate))
}

function calculateForRate(rate: number): number {
  const months = form.value.years * 12
  const monthlyRate = rate / 100 / 12
  const futureValueCurrent = form.value.currentWealth * Math.pow(1 + monthlyRate, months)
  const remaining = form.value.goal - futureValueCurrent
  if (remaining <= 0) return 0
  return remaining / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate))
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

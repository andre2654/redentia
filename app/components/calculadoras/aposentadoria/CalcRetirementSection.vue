<script setup lang="ts">
// PR10 — seção interativa da calculadora de aposentadoria, montada com o kit
// da fase 1 (CalcShell + CalcSliderField + CalcResultPanel + CalcAreaChart).
// A MATEMÁTICA é porte EXATO de Frontend/app/components/calculator/
// Retirement.vue (acumulação mês a mês com returnRate/12, renda ajustada pela
// inflação mensal, patrimônio necessário = renda líquida anual ÷ taxa de
// fruição, duração do patrimônio via log e 3 cenários alternativos). Aqui a
// simulação é reativa (sem botão), no padrão do design Nu; `seed` pré-preenche
// (deep-links ?age=&retire=&income=… e cenários long-tail).
import { brl } from '~/components/calc/compound-math'

export interface RetirementSeed {
  age?: number
  retire?: number
  life?: number
  income?: number
  wealth?: number
  monthly?: number
  rate?: number
  withdrawal?: number
  inflation?: number
  inss?: number
}

const props = defineProps<{
  seed?: RetirementSeed
  eyebrow?: string
  bg?: 'white' | 'cream'
  sectionId?: string
}>()

// defaults exatos do Retirement.vue antigo
const currentAge = ref(35)
const retirementAge = ref(60)
const lifeExpectancy = ref(85)
const monthlyIncome = ref(5000)
const currentWealth = ref(50000)
const monthlyContribution = ref(2000)
const returnRate = ref(10)
const withdrawalRate = ref(6)
const inflation = ref(4)
const inss = ref(0)

watch(
  () => props.seed,
  (s) => {
    if (!s) return
    if (Number.isFinite(s.age)) currentAge.value = s.age as number
    if (Number.isFinite(s.retire)) retirementAge.value = s.retire as number
    if (Number.isFinite(s.life)) lifeExpectancy.value = s.life as number
    if (Number.isFinite(s.income)) monthlyIncome.value = s.income as number
    if (Number.isFinite(s.wealth)) currentWealth.value = s.wealth as number
    if (Number.isFinite(s.monthly)) monthlyContribution.value = s.monthly as number
    if (Number.isFinite(s.rate)) returnRate.value = s.rate as number
    if (Number.isFinite(s.withdrawal)) withdrawalRate.value = s.withdrawal as number
    if (Number.isFinite(s.inflation)) inflation.value = s.inflation as number
    if (Number.isFinite(s.inss)) inss.value = s.inss as number
  },
  { immediate: true, deep: true },
)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

// presets do design (mesmos do kit de juros compostos)
const ratePresets = [
  { label: 'Poupança 6,17%', value: 6.17 },
  { label: 'CDI 10,75%', value: 10.75 },
  { label: 'IPCA+ 11,48%', value: 11.48 },
  { label: 'Ações 14%', value: 14 },
]

interface Results {
  viable: boolean
  message: string
  yearsToRetirement: number
  projectedWealth: number
  requiredWealth: number
  totalInvested: number
  adjustedIncome: number
  wealthDuration: number
  series: number[]
  investedSeries: number[]
  scenarios: {
    work3More: number
    increase20Percent: number
    reduce20Percent: number
  }
}

// porte exato de calculateScenario() do Retirement.vue antigo
function calculateScenario(years: number, contribution: number): number {
  const monthlyReturn = returnRate.value / 100 / 12
  const months = years * 12
  const pmt = contribution || monthlyContribution.value
  let wealth = currentWealth.value
  for (let month = 0; month < months; month++) {
    wealth = wealth * (1 + monthlyReturn) + pmt
  }
  return wealth
}

// porte exato de calculate() do Retirement.vue antigo (reativo, sem botão)
const results = computed<Results | null>(() => {
  if (retirementAge.value <= currentAge.value) return null

  const yearsToRetirement = retirementAge.value - currentAge.value
  const monthsToRetirement = yearsToRetirement * 12
  const monthlyReturn = returnRate.value / 100 / 12
  const monthlyInflation = inflation.value / 100 / 12

  let wealth = currentWealth.value
  let totalInvested = currentWealth.value
  const series: number[] = [wealth]
  const investedSeries: number[] = [totalInvested]

  for (let month = 0; month < monthsToRetirement; month++) {
    wealth = wealth * (1 + monthlyReturn) + monthlyContribution.value
    totalInvested += monthlyContribution.value
    if ((month + 1) % 12 === 0) {
      series.push(wealth)
      investedSeries.push(totalInvested)
    }
  }

  const adjustedIncome = monthlyIncome.value * Math.pow(1 + monthlyInflation, monthsToRetirement)
  const netIncome = adjustedIncome - inss.value
  const requiredWealth = (netIncome * 12) / (withdrawalRate.value / 100)

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
  const monthlyWithdrawal = adjustedIncome - inss.value
  const fruitionMonths = wealth > 0 && monthlyWithdrawal > 0
    ? Math.floor(Math.log(1 - (wealth * (withdrawalRate.value / 100 / 12)) / -monthlyWithdrawal) / Math.log(1 + withdrawalRate.value / 100 / 12))
    : 0
  const wealthDuration = Math.min(Math.floor(fruitionMonths / 12), lifeExpectancy.value - retirementAge.value)

  return {
    viable,
    message,
    yearsToRetirement,
    projectedWealth: wealth,
    requiredWealth,
    totalInvested,
    adjustedIncome,
    wealthDuration,
    series,
    investedSeries,
    scenarios: {
      work3More: calculateScenario(retirementAge.value + 3 - currentAge.value, monthlyContribution.value),
      increase20Percent: calculateScenario(yearsToRetirement, monthlyContribution.value * 1.2),
      reduce20Percent: (monthlyIncome.value * 0.8 * 12) / (withdrawalRate.value / 100),
    },
  }
})

const caption = computed(
  () => `Aos ${retirementAge.value} anos, aportando ${brl(monthlyContribution.value)} por mês, você terá`,
)
const xLabels = computed<[string, string, string]>(() => {
  const y = results.value?.yearsToRetirement ?? 0
  return ['hoje', `+${Math.round(y / 2)} anos`, `+${y} anos`]
})
const legendItems = computed(() => {
  const r = results.value
  if (!r) return []
  return [
    { label: 'Anos até aposentar', value: `${r.yearsToRetirement} anos` },
    { dot: 'var(--nu-navy)', label: 'Total investido', value: formatCurrency(r.totalInvested) },
    { dot: 'var(--nu-blue)', label: 'Patrimônio necessário', value: formatCurrency(r.requiredWealth), accent: true },
  ]
})

// textos dos sliders
const ageTxt = computed(() => `${currentAge.value} anos`)
const retireTxt = computed(() => `${retirementAge.value} anos`)
const lifeTxt = computed(() => `${lifeExpectancy.value} anos`)
const incomeTxt = computed(() => brl(monthlyIncome.value) + '/mês')
const wealthTxt = computed(() => brl(currentWealth.value))
const monthlyTxt = computed(() => brl(monthlyContribution.value) + '/mês')
const rateTxt = computed(() => String(returnRate.value).replace('.', ',') + '% a.a.')
const withdrawalTxt = computed(() => String(withdrawalRate.value).replace('.', ',') + '% a.a.')
const inflationTxt = computed(() => String(inflation.value).replace('.', ',') + '% a.a.')
const inssTxt = computed(() => brl(inss.value) + '/mês')
</script>

<template>
  <CalcShell :eyebrow="eyebrow ?? 'Calculadora'" :bg="bg" :section-id="sectionId ?? 'aposentadoria'">
    <template #title><slot name="title">Aposentadoria.</slot></template>
    <template #controls>
      <CalcSliderField v-model="currentAge" label="Idade Atual" :min="18" :max="100" :step="1" :value-text="ageTxt" />
      <div class="crs__gap">
        <CalcSliderField v-model="retirementAge" label="Idade Desejada de Aposentadoria" :min="30" :max="100" :step="1" :value-text="retireTxt" />
      </div>
      <div class="crs__gap">
        <CalcSliderField v-model="lifeExpectancy" label="Expectativa de Vida (anos)" :min="50" :max="120" :step="1" :value-text="lifeTxt" />
      </div>
      <div class="crs__gap">
        <CalcSliderField v-model="monthlyIncome" label="Renda Mensal Desejada (R$)" :min="0" :max="30000" :step="250" :value-text="incomeTxt" />
      </div>
      <div class="crs__gap">
        <CalcSliderField v-model="currentWealth" label="Patrimônio Atual (R$)" :min="0" :max="1000000" :step="5000" :value-text="wealthTxt" />
      </div>
      <div class="crs__gap">
        <CalcSliderField v-model="monthlyContribution" label="Aporte Mensal (R$)" :min="0" :max="20000" :step="100" :value-text="monthlyTxt" />
      </div>
      <div class="crs__gap">
        <CalcSliderField v-model="returnRate" label="Retorno na Acumulação (% a.a.)" :min="0" :max="30" :step="0.25" :value-text="rateTxt" :presets="ratePresets" />
      </div>
      <div class="crs__gap">
        <CalcSliderField v-model="withdrawalRate" label="Retorno na Fruição (% a.a.)" :min="1" :max="20" :step="0.25" :value-text="withdrawalTxt" />
      </div>
      <div class="crs__gap">
        <CalcSliderField v-model="inflation" label="Inflação Anual (%)" :min="0" :max="20" :step="0.25" :value-text="inflationTxt" />
      </div>
      <div class="crs__gap">
        <CalcSliderField v-model="inss" label="INSS Mensal (R$)" :min="0" :max="8000" :step="100" :value-text="inssTxt" />
      </div>
    </template>
    <template #result>
      <CalcResultPanel
        v-if="results"
        :caption="caption"
        :value="formatCurrency(results.projectedWealth)"
        :items="legendItems"
      >
        <div class="crs__chart">
          <CalcAreaChart :values="results.series" :secondary="results.investedSeries" :x-labels="xLabels" :format-y="brl" />
        </div>

        <div class="crs__status" :class="results.viable ? 'crs__status--positive' : 'crs__status--negative'">
          <span class="crs__status-title">{{ results.viable ? 'Plano Viável!' : 'Ajustes Necessários' }}</span>
          <span class="crs__status-msg">{{ results.message }}</span>
        </div>

        <div class="crs__subcard">
          <h4 class="crs__subcard-title">Renda na Aposentadoria</h4>
          <div class="crs__kpis crs__kpis--3">
            <div class="crs__kpi">
              <span class="crs__kpi-label">Renda Desejada (hoje)</span>
              <span class="crs__kpi-value">{{ formatCurrency(monthlyIncome) }}/mês</span>
            </div>
            <div class="crs__kpi">
              <span class="crs__kpi-label">Renda Ajustada (futuro)</span>
              <span class="crs__kpi-value crs__kpi-value--accent">{{ formatCurrency(results.adjustedIncome) }}/mês</span>
              <span class="crs__kpi-caption">Corrigida pela inflação</span>
            </div>
            <div class="crs__kpi">
              <span class="crs__kpi-label">INSS Estimado</span>
              <span class="crs__kpi-value">{{ formatCurrency(inss) }}/mês</span>
            </div>
          </div>
        </div>

        <div class="crs__subcard">
          <h4 class="crs__subcard-title">Regra dos 4%</h4>
          <p class="crs__subcard-desc">
            Você pode sacar 4% do patrimônio por ano mantendo o capital com ajuste pela inflação.
          </p>
          <div class="crs__kpis crs__kpis--2">
            <div class="crs__kpi">
              <span class="crs__kpi-label">Com seu patrimônio projetado</span>
              <span class="crs__kpi-value">{{ formatCurrency(results.projectedWealth * 0.04 / 12) }}/mês</span>
            </div>
            <div class="crs__kpi">
              <span class="crs__kpi-label">Duração estimada</span>
              <span class="crs__kpi-value crs__kpi-value--accent">{{ results.wealthDuration }} anos</span>
            </div>
          </div>
        </div>

        <div class="crs__subcard">
          <h4 class="crs__subcard-title">Cenários Alternativos</h4>
          <div class="crs__scenarios">
            <div class="crs__scenario">
              <div>
                <p class="crs__scenario-title">Trabalhar mais 3 anos</p>
                <p class="crs__scenario-sub">Aposentar aos {{ retirementAge + 3 }}</p>
              </div>
              <p class="crs__scenario-value">{{ formatCurrency(results.scenarios.work3More) }}</p>
            </div>
            <div class="crs__scenario">
              <div>
                <p class="crs__scenario-title">Aumentar aporte em 20%</p>
                <p class="crs__scenario-sub">Investir {{ formatCurrency(monthlyContribution * 1.2) }}/mês</p>
              </div>
              <p class="crs__scenario-value">{{ formatCurrency(results.scenarios.increase20Percent) }}</p>
            </div>
            <div class="crs__scenario">
              <div>
                <p class="crs__scenario-title">Reduzir renda em 20%</p>
                <p class="crs__scenario-sub">Viver com {{ formatCurrency(monthlyIncome * 0.8) }}/mês</p>
              </div>
              <p class="crs__scenario-value">{{ formatCurrency(results.scenarios.reduce20Percent) }}</p>
            </div>
          </div>
        </div>

        <div class="crs__callout">
          <strong>Lembre-se:</strong> Esta é uma projeção. Revise anualmente e ajuste conforme necessário.
        </div>
      </CalcResultPanel>
      <div v-else class="crs__invalid">
        A idade de aposentadoria deve ser maior que a idade atual
      </div>
    </template>
  </CalcShell>
</template>

<style scoped>
.crs__gap { margin-top: 36px; }
.crs__chart { margin-top: 30px; }

.crs__status {
  display: flex; flex-direction: column; gap: 4px;
  border-radius: 18px; padding: 18px 22px; margin-top: 26px;
}
.crs__status--positive { background: var(--nu-green-tint); }
.crs__status--negative { background: var(--nu-red-tint); }
.crs__status-title { color: var(--nu-ink); font-size: 15.5px; font-weight: 800; letter-spacing: -.2px; }
.crs__status-msg { color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.55; }

.crs__subcard {
  background: var(--nu-cream);
  border-radius: 18px; padding: 18px 22px; margin-top: 16px;
}
.crs__subcard-title { margin: 0; color: var(--nu-ink); font-size: 15px; font-weight: 800; letter-spacing: -.2px; }
.crs__subcard-desc { margin: 6px 0 0; color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; line-height: 1.55; }

.crs__kpis { display: grid; gap: 12px; margin-top: 14px; }
.crs__kpis--3 { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
.crs__kpis--2 { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
.crs__kpi { display: flex; flex-direction: column; gap: 2px; }
.crs__kpi-label { color: var(--nu-gray); font-size: 12px; font-weight: 700; }
.crs__kpi-value { color: var(--nu-ink); font-size: 16.5px; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -.2px; }
.crs__kpi-value--accent { color: var(--nu-blue); }
.crs__kpi-caption { color: var(--nu-gray); font-size: 11.5px; font-weight: 600; }

.crs__scenarios { display: flex; flex-direction: column; margin-top: 6px; }
.crs__scenario {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 12px 0; border-bottom: 1.5px solid var(--nu-cream-line-2);
}
.crs__scenario:last-child { border-bottom: none; padding-bottom: 2px; }
.crs__scenario-title { margin: 0; color: var(--nu-ink); font-size: 14px; font-weight: 700; }
.crs__scenario-sub { margin: 2px 0 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }
.crs__scenario-value { margin: 0; color: var(--nu-blue); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; }

.crs__callout {
  background: var(--nu-blue-tint); border-radius: 18px;
  padding: 16px 22px; margin-top: 16px;
  color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.6;
}
.crs__callout strong { color: var(--nu-ink); font-weight: 800; }

.crs__invalid {
  background: var(--nu-red-tint); border-radius: 18px; padding: 18px 22px;
  color: var(--nu-ink); font-size: 15px; font-weight: 600;
}
</style>

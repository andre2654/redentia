<script setup lang="ts">
// PR10 — calculadora de aporte mensal (quanto-investir): cálculo REVERSO por
// meta. Matemática EXATA do app antigo (Frontend/app/components/calculator/
// MonthlyInvestment.vue): PMT = (FV − PV(1+i)ⁿ) ÷ [((1+i)ⁿ − 1) ÷ i] com
// i = taxa anual/12 (mesma convenção do antigo — NÃO taxa equivalente).
// Visual = kit da fase 1 (CalcShell + sliders + número-herói + gráfico).
// Reativa, sem botão. `seed` pré-preenche (deep-links ?goal=&years=&wealth=
// &rate=&inflation= e cenários [scenario]). O toggle de inflação existia no
// form antigo mas NUNCA entrou no cálculo — portado igual (paridade exata).
const props = defineProps<{
  seed?: { goal?: number; years?: number; wealth?: number; rate?: number; inflation?: number }
  eyebrow?: string
  bg?: 'white' | 'cream'
  sectionId?: string
}>()

// defaults exatos do form antigo
const goal = ref(500000)
const years = ref(10)
const wealth = ref(50000)
const rate = ref(10)
const inflationAdjust = ref(false)
const inflation = ref(4)

watch(
  () => props.seed,
  (s) => {
    if (!s) return
    if (Number.isFinite(s.goal)) goal.value = s.goal as number
    if (Number.isFinite(s.years)) years.value = Math.max(1, Math.min(50, Math.round(s.years as number)))
    if (Number.isFinite(s.wealth)) wealth.value = s.wealth as number
    if (Number.isFinite(s.rate)) rate.value = s.rate as number
    if (Number.isFinite(s.inflation)) {
      inflation.value = s.inflation as number
      inflationAdjust.value = true
    }
  },
  { immediate: true, deep: true },
)

// —— matemática (porte exato do MonthlyInvestment.vue antigo) ——
function pmtFor(goalV: number, yearsV: number, wealthV: number, rateV: number): number {
  const months = yearsV * 12
  const monthlyRate = rateV / 100 / 12
  const futureValueCurrent = wealthV * Math.pow(1 + monthlyRate, months)
  const remaining = goalV - futureValueCurrent
  return remaining / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
}

function simulateWithContribution(pmt: number): number {
  const months = years.value * 12
  const monthlyRate = rate.value / 100 / 12
  const futureValueCurrent = wealth.value * Math.pow(1 + monthlyRate, months)
  const futureValueContributions = pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
  return futureValueCurrent + futureValueContributions
}

function calculateForRate(r: number): number {
  const months = years.value * 12
  const monthlyRate = r / 100 / 12
  const futureValueCurrent = wealth.value * Math.pow(1 + monthlyRate, months)
  const remaining = goal.value - futureValueCurrent
  if (remaining <= 0) return 0
  return remaining / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
}

// mesma validação do calculate() antigo (era um alert; aqui vira estado)
const invalid = computed(() => !goal.value || !years.value || goal.value <= wealth.value)

const res = computed(() => {
  const monthlyContribution = pmtFor(goal.value, years.value, wealth.value, rate.value)
  const months = years.value * 12
  const totalInvested = wealth.value + monthlyContribution * months
  const totalInterest = goal.value - totalInvested
  const contributionPercent = (totalInvested / goal.value) * 100
  const interestPercent = (totalInterest / goal.value) * 100

  // projeção ano a ano com o PMT calculado (mesma capitalização do cálculo)
  const monthlyRate = rate.value / 100 / 12
  const series: number[] = []
  const investedSeries: number[] = []
  for (let k = 0; k <= years.value; k++) {
    const m = k * 12
    const f = Math.pow(1 + monthlyRate, m)
    series.push(wealth.value * f + monthlyContribution * ((f - 1) / monthlyRate))
    investedSeries.push(wealth.value + monthlyContribution * m)
  }

  return {
    monthlyContribution,
    totalInvested,
    totalInterest,
    contributionPercent,
    interestPercent,
    scenarios: {
      increase20: simulateWithContribution(monthlyContribution * 1.2),
      reduce20: simulateWithContribution(monthlyContribution * 0.8),
      extend2Years: pmtFor(goal.value, years.value + 2, wealth.value, rate.value),
    },
    series,
    investedSeries,
  }
})

// formatação exata do antigo (BRL inteiro)
function fc(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
}

const goalTxt = computed(() => fc(goal.value))
const yearsTxt = computed(() => years.value + (years.value === 1 ? ' ano' : ' anos'))
const wealthTxt = computed(() => fc(wealth.value))
const rateTxt = computed(() => String(rate.value).replace('.', ',') + '% a.a.')
const inflationTxt = computed(() => String(inflation.value).replace('.', ',') + '% a.a.')

const goalPresets = [
  { label: 'R$ 100 mil', value: 100000 },
  { label: 'R$ 500 mil', value: 500000 },
  { label: 'R$ 1 milhão', value: 1000000 },
  { label: 'R$ 2 milhões', value: 2000000 },
]
// mesmas taxas da tabela de sensibilidade antiga
const ratePresets = [
  { label: '6%', value: 6 },
  { label: '8%', value: 8 },
  { label: '10%', value: 10 },
  { label: '12%', value: 12 },
  { label: '15%', value: 15 },
]
const sensitivityRates = [6, 8, 10, 12, 15]

const xLabels = computed<[string, string, string]>(() => ['hoje', `+${Math.round(years.value / 2)} anos`, `+${years.value} anos`])
const barSegments = computed(() => [
  { pct: Math.max(0, Math.min(100, res.value.contributionPercent)), color: 'var(--nu-navy)' },
  { pct: Math.max(0, Math.min(100, res.value.interestPercent)), color: 'var(--nu-blue)' },
])
</script>

<template>
  <CalcShell :eyebrow="eyebrow ?? 'Calculadora'" :bg="bg" :section-id="sectionId ?? 'aporte'">
    <template #title><slot name="title">Aporte mensal.</slot></template>
    <template #controls>
      <CalcSliderField v-model="goal" label="Meta financeira" :min="30000" :max="10000000" :step="10000" :value-text="goalTxt" :presets="goalPresets" />
      <div class="qic__gap">
        <CalcSliderField v-model="years" label="Prazo" :min="1" :max="50" :step="1" :value-text="yearsTxt" />
      </div>
      <div class="qic__gap">
        <CalcSliderField v-model="wealth" label="Patrimônio atual" :min="0" :max="1000000" :step="5000" :value-text="wealthTxt" />
      </div>
      <div class="qic__gap">
        <CalcSliderField v-model="rate" label="Taxa de retorno" :min="1" :max="30" :step="0.25" :value-text="rateTxt" :presets="ratePresets" />
      </div>
      <div class="qic__gap">
        <button
          type="button"
          class="qic__toggle"
          :class="{ 'qic__toggle--active': inflationAdjust }"
          :aria-pressed="inflationAdjust"
          @click="inflationAdjust = !inflationAdjust"
        >
          <span class="qic__toggle-dot" />
          Ajustar aportes pela inflação anualmente
        </button>
      </div>
      <div v-if="inflationAdjust" class="qic__gap">
        <CalcSliderField v-model="inflation" label="Inflação anual" :min="0" :max="20" :step="0.5" :value-text="inflationTxt" />
      </div>
    </template>

    <template #result>
      <div v-if="invalid" class="qic__invalid">
        Verifique os valores. A meta deve ser maior que o patrimônio atual.
      </div>
      <CalcResultPanel
        v-else
        caption="Você precisa investir"
        :value="fc(res.monthlyContribution)"
      >
        <p class="qic__sub">por mês durante <span class="qic__hl">{{ years }} {{ years === 1 ? 'ano' : 'anos' }}</span></p>

        <div class="qic__legend">
          <span class="qic__item">
            <span class="qic__label">Total que será investido</span>
            <span class="qic__num">{{ fc(res.totalInvested) }}</span>
          </span>
          <span class="qic__item">
            <span class="qic__label">Total de juros</span>
            <span class="qic__num qic__num--accent">{{ fc(res.totalInterest) }}</span>
          </span>
          <span class="qic__item">
            <span class="qic__label">Meta final</span>
            <span class="qic__num">{{ fc(goal) }}</span>
          </span>
        </div>

        <!-- Composição (De onde vem o dinheiro? — porte do antigo) -->
        <div class="qic__comp">
          <h4 class="qic__subtitle">De onde vem o dinheiro?</h4>
          <div class="qic__comp-rows">
            <span class="qic__item">
              <span class="qic__dot" style="background: var(--nu-navy)" />
              <span class="qic__label">Seus aportes</span>
              <span class="qic__num">{{ res.contributionPercent.toFixed(1) }}%</span>
            </span>
            <span class="qic__item">
              <span class="qic__dot" style="background: var(--nu-blue)" />
              <span class="qic__label">Juros compostos</span>
              <span class="qic__num qic__num--accent">{{ res.interestPercent.toFixed(1) }}%</span>
            </span>
          </div>
          <div class="qic__bar"><CalcStackedBar :segments="barSegments" /></div>
        </div>

        <div class="qic__chart">
          <CalcAreaChart :values="res.series" :secondary="res.investedSeries" :x-labels="xLabels" :format-y="fc" />
        </div>

        <!-- Cenários (E se...? — texto do antigo) -->
        <div class="qic__card">
          <h4 class="qic__subtitle">E se...?</h4>
          <div class="qic__scenarios">
            <div class="qic__scenario">
              <div>
                <p class="qic__sc-title">Aumentar aporte em 20%</p>
                <p class="qic__sc-sub">Investir {{ fc(res.monthlyContribution * 1.2) }}/mês</p>
              </div>
              <div class="qic__sc-right">
                <p class="qic__sc-value">{{ fc(res.scenarios.increase20) }}</p>
                <p class="qic__sc-delta qic__sc-delta--positive">+{{ fc(res.scenarios.increase20 - goal) }}</p>
              </div>
            </div>
            <div class="qic__scenario">
              <div>
                <p class="qic__sc-title">Reduzir aporte em 20%</p>
                <p class="qic__sc-sub">Investir {{ fc(res.monthlyContribution * 0.8) }}/mês</p>
              </div>
              <div class="qic__sc-right">
                <p class="qic__sc-value qic__sc-value--neutral">{{ fc(res.scenarios.reduce20) }}</p>
                <p class="qic__sc-delta qic__sc-delta--negative">{{ fc(res.scenarios.reduce20 - goal) }}</p>
              </div>
            </div>
            <div class="qic__scenario">
              <div>
                <p class="qic__sc-title">Estender prazo em 2 anos</p>
                <p class="qic__sc-sub">Investir por {{ years + 2 }} anos</p>
              </div>
              <div class="qic__sc-right">
                <p class="qic__sc-value">{{ fc(res.scenarios.extend2Years) }}</p>
                <p class="qic__sc-delta qic__sc-delta--positive">-{{ ((1 - res.scenarios.extend2Years / res.monthlyContribution) * 100).toFixed(0) }}% aporte</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sensibilidade por taxa (porte do antigo) -->
        <div class="qic__card">
          <h4 class="qic__subtitle">Aporte necessário por taxa de retorno</h4>
          <div class="qic__table-wrap">
            <table class="qic__table">
              <thead>
                <tr><th>Taxa a.a.</th><th>Aporte mensal</th><th>Total investido</th></tr>
              </thead>
              <tbody>
                <tr v-for="r in sensitivityRates" :key="r">
                  <td>{{ r }}%</td>
                  <td class="qic__td--strong">{{ fc(calculateForRate(r)) }}</td>
                  <td class="qic__td--muted">{{ fc(calculateForRate(r) * years * 12) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="qic__callout">
          <strong>Importante:</strong> Este cálculo assume aportes mensais fixos. Se você ajustar os aportes pela inflação ou aumentar conforme sua renda cresce, alcançará a meta mais rapidamente.
        </div>
      </CalcResultPanel>
    </template>
  </CalcShell>
</template>

<style scoped>
.qic__gap { margin-top: 36px; }

/* toggle no estilo dos preset chips do kit */
.qic__toggle {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 10px 16px; border-radius: var(--nu-r-pill);
  font-size: 13px; font-weight: 800; cursor: pointer; text-align: left;
  border: 2px solid var(--nu-sand-border); background: var(--nu-white);
  color: var(--nu-gray-2); transition: all .2s;
}
.qic__toggle--active { border-color: var(--nu-ink); background: var(--nu-ink); color: var(--nu-white); }
.qic__toggle-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-sand-2); flex-shrink: 0; transition: background .2s; }
.qic__toggle--active .qic__toggle-dot { background: var(--nu-green); }

.qic__invalid {
  background: var(--nu-red-tint); border-radius: var(--nu-r-panel);
  padding: 22px 26px; color: var(--nu-ink); font-size: 15.5px; font-weight: 700; line-height: 1.6;
  max-width: 560px;
}

.qic__sub { margin: 10px 0 0; color: var(--nu-gray); font-size: 16px; font-weight: 600; }
.qic__hl { color: var(--nu-blue); font-weight: 800; }

.qic__legend { display: flex; gap: 26px; flex-wrap: wrap; margin-top: 22px; }
.qic__item { display: inline-flex; align-items: center; gap: 9px; }
.qic__dot { width: 11px; height: 11px; border-radius: 4px; flex-shrink: 0; }
.qic__label { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; }
.qic__num { color: var(--nu-ink); font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums; }
.qic__num--accent { color: var(--nu-blue); }

.qic__comp { margin-top: 22px; }
.qic__comp-rows { display: flex; gap: 26px; flex-wrap: wrap; margin-top: 12px; }
.qic__bar { margin-top: 12px; }
.qic__chart { margin-top: 30px; }

.qic__subtitle { margin: 0; color: var(--nu-ink); font-size: 15.5px; font-weight: 800; letter-spacing: -.2px; }

.qic__card {
  background: var(--nu-cream); border-radius: 18px;
  padding: 20px 22px; margin-top: 22px; max-width: 640px;
}
.qic__scenarios { margin-top: 14px; display: flex; flex-direction: column; }
.qic__scenario {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 12px 0; border-top: 1.5px solid var(--nu-cream-line-2);
}
.qic__scenario:first-child { border-top: none; padding-top: 0; }
.qic__sc-title { margin: 0; color: var(--nu-ink); font-size: 14.5px; font-weight: 800; }
.qic__sc-sub { margin: 3px 0 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }
.qic__sc-right { text-align: right; }
.qic__sc-value { margin: 0; color: var(--nu-ink); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.qic__sc-value--neutral { color: var(--nu-gray-2); }
.qic__sc-delta { margin: 3px 0 0; font-size: 12.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
.qic__sc-delta--positive { color: var(--nu-green); }
.qic__sc-delta--negative { color: var(--nu-red); }

.qic__table-wrap { overflow-x: auto; margin-top: 12px; }
.qic__table { width: 100%; border-collapse: collapse; min-width: 380px; }
.qic__table th {
  text-align: left; padding: 10px 12px 10px 0;
  color: var(--nu-gray); font-size: 11.5px; font-weight: 800;
  letter-spacing: .8px; text-transform: uppercase;
  border-bottom: 1.5px solid var(--nu-cream-line-2); white-space: nowrap;
}
.qic__table td {
  padding: 10px 12px 10px 0; color: var(--nu-gray-3); font-size: 14px; font-weight: 600;
  border-bottom: 1.5px solid var(--nu-cream-line-2); font-variant-numeric: tabular-nums;
}
.qic__table tbody tr:last-child td { border-bottom: none; }
.qic__td--strong { color: var(--nu-ink); font-weight: 800; }
.qic__td--muted { color: var(--nu-gray); }

.qic__callout {
  background: var(--nu-blue-tint); border-radius: 18px;
  padding: 18px 22px; margin-top: 22px; max-width: 640px;
  color: var(--nu-gray-2); font-size: 15px; font-weight: 500; line-height: 1.6;
}
.qic__callout strong { color: var(--nu-ink); font-weight: 800; }
</style>

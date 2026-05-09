<template>
  <div ref="calcRoot" class="space-y-6">
    <div class="quiet-card flex flex-col gap-6 p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-wallet" class="text-secondary size-6" />
        <h2 class="text-xl">Calcular Aporte Mensal Necessário</h2>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Meta Financeira (R$)" name="goal">
          <AtomsFormCurrencyInput
            v-model="form.goal"
            placeholder="500000"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Prazo (anos)" name="years">
          <UInput
            v-model.number="form.years"
            type="number"
            min="1"
            max="50"
            placeholder="10"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Patrimônio Atual (R$)" name="currentWealth">
          <AtomsFormCurrencyInput
            v-model="form.currentWealth"
            placeholder="50000"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Taxa de Retorno (%a.a.)" name="returnRate">
          <AtomsFormPercentageInput
            v-model="form.returnRate"
            :min="0"
            :max="30"
            placeholder="10"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField name="inflationAdjust" class="md:col-span-2">
          <UCheckbox
            v-model="form.inflationAdjust"
            label="Ajustar aportes pela inflação anualmente"
          />
        </UFormField>

        <UFormField v-if="form.inflationAdjust" label="Inflação Anual (%)" name="inflation">
          <AtomsFormPercentageInput
            v-model="form.inflation"
            :min="0"
            :max="20"
            placeholder="4"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>
      </div>

      <UButton
        color="primary"
        size="xl"
        block
        icon="i-lucide-calculator"
        @click="calculate"
      >
        Calcular Aporte Necessário
      </UButton>
    </div>

    <div v-if="results" class="quiet-card flex flex-col gap-6 p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-target" class="text-secondary size-6" />
        <h3 class="text-xl">Plano de Aportes</h3>
      </div>

      <!-- Aporte Necessário -->
      <div
        class="rounded-lg border p-6"
        :style="{ borderColor: 'color-mix(in srgb, var(--brand-secondary) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 10%, transparent)' }"
      >
        <p class="mb-2 text-sm" :style="{ color: 'var(--text-muted)' }">Você precisa investir:</p>
        <p class="text-5xl font-light tabular-nums text-secondary">
          {{ formatCurrency(results.monthlyContribution) }}
        </p>
        <p class="text-sm" :style="{ color: 'var(--text-heading)' }">por mês durante {{ form.years }} anos</p>
      </div>

      <!-- Resumo -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          class="rounded-lg border p-4"
          :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
        >
          <p class="mb-1 text-sm" :style="{ color: 'var(--text-muted)' }">Total que será Investido</p>
          <p class="text-2xl tabular-nums" :style="{ color: 'var(--text-heading)' }">
            {{ formatCurrency(results.totalInvested) }}
          </p>
        </div>
        <div
          class="rounded-lg border p-4"
          :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
        >
          <p class="mb-1 text-sm" :style="{ color: 'var(--text-muted)' }">Total de Juros</p>
          <p class="text-2xl tabular-nums" :style="{ color: 'var(--brand-positive)' }">
            {{ formatCurrency(results.totalInterest) }}
          </p>
        </div>
        <div
          class="rounded-lg border p-4"
          :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
        >
          <p class="mb-1 text-sm" :style="{ color: 'var(--text-muted)' }">Meta Final</p>
          <p class="text-2xl tabular-nums text-secondary">
            {{ formatCurrency(form.goal) }}
          </p>
        </div>
      </div>

      <!-- Composição -->
      <div
        class="rounded-lg border p-5"
        :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
      >
        <h4 class="mb-3 font-medium" :style="{ color: 'var(--text-heading)' }">De Onde Vem o Dinheiro?</h4>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span :style="{ color: 'var(--text-body)' }">Seus aportes</span>
            <span class="font-medium tabular-nums" :style="{ color: 'var(--text-heading)' }">
              {{ results.contributionPercent.toFixed(1) }}%
            </span>
          </div>
          <div
            class="h-2 w-full rounded-full"
            :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-text) 10%, transparent)' }"
          >
            <div
              class="h-2 rounded-full"
              :style="{ width: `${results.contributionPercent}%`, backgroundColor: 'var(--brand-primary)' }"
            />
          </div>

          <div class="flex items-center justify-between">
            <span :style="{ color: 'var(--text-body)' }">Juros compostos</span>
            <span class="font-medium tabular-nums" :style="{ color: 'var(--brand-positive)' }">
              {{ results.interestPercent.toFixed(1) }}%
            </span>
          </div>
          <div
            class="h-2 w-full rounded-full"
            :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-text) 10%, transparent)' }"
          >
            <div
              class="h-2 rounded-full"
              :style="{ width: `${results.interestPercent}%`, backgroundColor: 'var(--brand-positive)' }"
            />
          </div>
        </div>
      </div>

      <!-- Cenários -->
      <div
        class="rounded-lg border p-5"
        :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
      >
        <h4 class="mb-4 font-medium" :style="{ color: 'var(--text-heading)' }">E Se...?</h4>
        <div class="space-y-3">
          <div
            class="rounded-md border p-3"
            :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium" :style="{ color: 'var(--text-heading)' }">Aumentar aporte em 20%</p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Investir {{ formatCurrency(results.monthlyContribution * 1.2) }}/mês</p>
              </div>
              <div class="text-right">
                <p class="text-secondary tabular-nums">
                  {{ formatCurrency(results.scenarios.increase20) }}
                </p>
                <p class="text-xs tabular-nums" :style="{ color: 'var(--brand-positive)' }">
                  +{{ formatCurrency(results.scenarios.increase20 - form.goal) }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="rounded-md border p-3"
            :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium" :style="{ color: 'var(--text-heading)' }">Reduzir aporte em 20%</p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Investir {{ formatCurrency(results.monthlyContribution * 0.8) }}/mês</p>
              </div>
              <div class="text-right">
                <p class="tabular-nums" :style="{ color: 'var(--text-heading)' }">
                  {{ formatCurrency(results.scenarios.reduce20) }}
                </p>
                <p class="text-xs tabular-nums" :style="{ color: 'var(--brand-negative)' }">
                  {{ formatCurrency(results.scenarios.reduce20 - form.goal) }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="rounded-md border p-3"
            :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium" :style="{ color: 'var(--text-heading)' }">Estender prazo em 2 anos</p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Investir por {{ form.years + 2 }} anos</p>
              </div>
              <div class="text-right">
                <p class="text-secondary tabular-nums">
                  {{ formatCurrency(results.scenarios.extend2Years) }}
                </p>
                <p class="text-xs tabular-nums" :style="{ color: 'var(--brand-positive)' }">
                  -{{ ((1 - results.scenarios.extend2Years / results.monthlyContribution) * 100).toFixed(0) }}% aporte
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Sensibilidade -->
      <div
        class="rounded-lg border p-5"
        :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
      >
        <h4 class="mb-4 font-medium" :style="{ color: 'var(--text-heading)' }">Aporte Necessário por Taxa de Retorno</h4>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead :style="{ backgroundColor: 'var(--bg-elevated)' }">
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'var(--border-subtle)' }">Taxa a.a.</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'var(--border-subtle)' }">Aporte Mensal</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'var(--border-subtle)' }">Total Investido</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="rate in [6, 8, 10, 12, 15]"
                :key="rate"
                class="hover:bg-[var(--bg-overlay)]"
              >
                <td class="border px-4 py-2 tabular-nums" :style="{ borderColor: 'var(--border-subtle)' }">{{ rate }}%</td>
                <td class="border px-4 py-2 font-medium tabular-nums" :style="{ borderColor: 'var(--border-subtle)' }">
                  {{ formatCurrency(calculateForRate(rate)) }}
                </td>
                <td
                  class="border px-4 py-2 tabular-nums"
                  :style="{ borderColor: 'var(--border-subtle)', color: 'var(--text-body)' }"
                >
                  {{ formatCurrency(calculateForRate(rate) * form.years * 12) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Dica -->
      <div
        class="rounded-lg border p-4 text-sm"
        :style="{ borderColor: 'color-mix(in srgb, var(--brand-primary) 25%, transparent)', backgroundColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--text-body)' }"
      >
        <strong :style="{ color: 'var(--brand-primary)' }">Importante:</strong> Este cálculo assume aportes mensais fixos. Se você ajustar os aportes pela inflação ou aumentar conforme sua renda cresce, alcançará a meta mais rapidamente.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

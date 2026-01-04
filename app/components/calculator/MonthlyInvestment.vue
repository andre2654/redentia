<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-wallet" class="text-secondary size-6" />
        <h2 class="text-xl font-bold text-white">Calcular Aporte Mensal Necessário</h2>
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
        color="secondary"
        size="xl"
        block
        icon="i-lucide-calculator"
        @click="calculate"
      >
        Calcular Aporte Necessário
      </UButton>
    </div>

    <div v-if="results" class="flex flex-col gap-6 rounded-[30px] p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-target" class="text-secondary size-6" />
        <h3 class="text-xl font-bold text-white">Plano de Aportes</h3>
      </div>

      <!-- Aporte Necessário -->
      <div class="rounded-xl border border-secondary/30 bg-secondary/10 p-6">
        <p class="mb-2 text-sm text-gray-400">Você precisa investir:</p>
        <p class="text-5xl font-bold text-secondary">
          {{ formatCurrency(results.monthlyContribution) }}
        </p>
        <p class="text-sm text-white">por mês durante {{ form.years }} anos</p>
      </div>

      <!-- Resumo -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Total que será Investido</p>
          <p class="text-2xl font-bold text-white">
            {{ formatCurrency(results.totalInvested) }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Total de Juros</p>
          <p class="text-2xl font-bold text-green-400">
            {{ formatCurrency(results.totalInterest) }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Meta Final</p>
          <p class="text-2xl font-bold text-secondary">
            {{ formatCurrency(form.goal) }}
          </p>
        </div>
      </div>

      <!-- Composição -->
      <div class="rounded-xl border border-white/10 bg-white/5 p-5">
        <h4 class="mb-3 font-semibold text-white">De Onde Vem o Dinheiro?</h4>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-gray-300">Seus aportes</span>
            <span class="font-semibold text-white">
              {{ results.contributionPercent.toFixed(1) }}%
            </span>
          </div>
          <div class="h-2 w-full rounded-full bg-white/10">
            <div
              class="h-2 rounded-full bg-blue-400"
              :style="{ width: `${results.contributionPercent}%` }"
            />
          </div>

          <div class="flex items-center justify-between">
            <span class="text-gray-300">Juros compostos</span>
            <span class="font-semibold text-green-400">
              {{ results.interestPercent.toFixed(1) }}%
            </span>
          </div>
          <div class="h-2 w-full rounded-full bg-white/10">
            <div
              class="h-2 rounded-full bg-green-400"
              :style="{ width: `${results.interestPercent}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Cenários -->
      <div class="rounded-xl border border-white/10 bg-white/5 p-5">
        <h4 class="mb-4 font-semibold text-white">E Se...?</h4>
        <div class="space-y-3">
          <div class="rounded-lg border border-white/10 bg-white/5 p-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-white">Aumentar aporte em 20%</p>
                <p class="text-xs text-gray-400">Investir {{ formatCurrency(results.monthlyContribution * 1.2) }}/mês</p>
              </div>
              <div class="text-right">
                <p class="text-secondary font-bold">
                  {{ formatCurrency(results.scenarios.increase20) }}
                </p>
                <p class="text-xs text-green-400">
                  +{{ formatCurrency(results.scenarios.increase20 - form.goal) }}
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-white/10 bg-white/5 p-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-white">Reduzir aporte em 20%</p>
                <p class="text-xs text-gray-400">Investir {{ formatCurrency(results.monthlyContribution * 0.8) }}/mês</p>
              </div>
              <div class="text-right">
                <p class="text-white font-bold">
                  {{ formatCurrency(results.scenarios.reduce20) }}
                </p>
                <p class="text-xs text-red-400">
                  {{ formatCurrency(results.scenarios.reduce20 - form.goal) }}
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-white/10 bg-white/5 p-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-white">Estender prazo em 2 anos</p>
                <p class="text-xs text-gray-400">Investir por {{ form.years + 2 }} anos</p>
              </div>
              <div class="text-right">
                <p class="text-secondary font-bold">
                  {{ formatCurrency(results.scenarios.extend2Years) }}
                </p>
                <p class="text-xs text-green-400">
                  -{{ ((1 - results.scenarios.extend2Years / results.monthlyContribution) * 100).toFixed(0) }}% aporte
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Sensibilidade -->
      <div class="rounded-xl border border-white/10 bg-white/5 p-5">
        <h4 class="mb-4 font-semibold text-white">Aporte Necessário por Taxa de Retorno</h4>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-white/10">
              <tr>
                <th class="border border-white/20 px-4 py-2 text-left">Taxa a.a.</th>
                <th class="border border-white/20 px-4 py-2 text-left">Aporte Mensal</th>
                <th class="border border-white/20 px-4 py-2 text-left">Total Investido</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rate in [6, 8, 10, 12, 15]" :key="rate" class="hover:bg-white/5">
                <td class="border border-white/20 px-4 py-2">{{ rate }}%</td>
                <td class="border border-white/20 px-4 py-2 font-semibold">
                  {{ formatCurrency(calculateForRate(rate)) }}
                </td>
                <td class="border border-white/20 px-4 py-2 text-gray-300">
                  {{ formatCurrency(calculateForRate(rate) * form.years * 12) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Dica -->
      <div class="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
        <strong>Importante:</strong> Este cálculo assume aportes mensais fixos. Se você ajustar os aportes pela inflação ou aumentar conforme sua renda cresce, alcançará a meta mais rapidamente.
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

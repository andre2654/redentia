<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-piggy-bank" class="text-secondary size-6" />
        <h2 class="text-xl font-bold text-white">Planejar Aposentadoria</h2>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Idade Atual" name="currentAge">
          <UInput
            v-model.number="form.currentAge"
            type="number"
            min="18"
            max="100"
            placeholder="35"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Idade Desejada de Aposentadoria" name="retirementAge">
          <UInput
            v-model.number="form.retirementAge"
            type="number"
            min="30"
            max="100"
            placeholder="60"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Expectativa de Vida (anos)" name="lifeExpectancy">
          <UInput
            v-model.number="form.lifeExpectancy"
            type="number"
            min="50"
            max="120"
            placeholder="85"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Renda Mensal Desejada (R$)" name="monthlyIncome">
          <AtomsFormCurrencyInput
            v-model="form.monthlyIncome"
            placeholder="5000"
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

        <UFormField label="Aporte Mensal (R$)" name="monthlyContribution">
          <AtomsFormCurrencyInput
            v-model="form.monthlyContribution"
            placeholder="2000"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Retorno na Acumulação (%a.a.)" name="returnRate">
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

        <UFormField label="Retorno na Fruição (%a.a.)" name="withdrawalRate">
          <AtomsFormPercentageInput
            v-model="form.withdrawalRate"
            :min="0"
            :max="20"
            placeholder="6"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Inflação Anual (%)" name="inflation">
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

        <UFormField label="INSS Mensal (R$)" name="inss">
          <AtomsFormCurrencyInput
            v-model="form.inss"
            placeholder="0"
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
        Calcular Aposentadoria
      </UButton>
    </div>

    <div v-if="results" class="flex flex-col gap-6 rounded-[30px] p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-trending-up" class="text-secondary size-6" />
        <h3 class="text-xl font-bold text-white">Resultados do Planejamento</h3>
      </div>

      <!-- Viabilidade -->
      <div
        class="rounded-xl border p-6"
        :class="{
          'border-green-500/50 bg-green-500/10': results.viable,
          'border-red-500/50 bg-red-500/10': !results.viable,
        }"
      >
        <div class="flex items-center gap-3">
          <UIcon
            :name="results.viable ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'"
            :class="results.viable ? 'text-green-400' : 'text-red-400'"
            class="size-8"
          />
          <div>
            <h4 class="text-xl font-bold text-white">
              {{ results.viable ? 'Plano Viável!' : 'Ajustes Necessários' }}
            </h4>
            <p class="text-sm text-gray-300">
              {{ results.message }}
            </p>
          </div>
        </div>
      </div>

      <!-- Métricas Principais -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Anos até Aposentar</p>
          <p class="text-2xl font-bold text-white">
            {{ results.yearsToRetirement }} anos
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Patrimônio Projetado</p>
          <p class="text-2xl font-bold text-secondary">
            {{ formatCurrency(results.projectedWealth) }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Patrimônio Necessário</p>
          <p class="text-2xl font-bold text-white">
            {{ formatCurrency(results.requiredWealth) }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Total Investido</p>
          <p class="text-2xl font-bold text-white">
            {{ formatCurrency(results.totalInvested) }}
          </p>
        </div>
      </div>

      <!-- Renda na Aposentadoria -->
      <div class="rounded-xl border border-secondary/30 bg-secondary/10 p-6">
        <h4 class="mb-4 text-lg font-bold text-white">Renda na Aposentadoria</h4>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p class="mb-1 text-sm text-gray-400">Renda Desejada (hoje)</p>
            <p class="text-xl font-bold text-white">
              {{ formatCurrency(form.monthlyIncome) }}/mês
            </p>
          </div>
          <div>
            <p class="mb-1 text-sm text-gray-400">Renda Ajustada (futuro)</p>
            <p class="text-xl font-bold text-secondary">
              {{ formatCurrency(results.adjustedIncome) }}/mês
            </p>
            <p class="text-xs text-gray-400">Corrigida pela inflação</p>
          </div>
          <div>
            <p class="mb-1 text-sm text-gray-400">INSS Estimado</p>
            <p class="text-xl font-bold text-white">
              {{ formatCurrency(form.inss) }}/mês
            </p>
          </div>
        </div>
      </div>

      <!-- Regra dos 4% -->
      <div class="rounded-xl border border-white/10 bg-white/5 p-5">
        <h4 class="mb-3 font-semibold text-white">Regra dos 4% (Saque Seguro Anual)</h4>
        <p class="mb-3 text-sm text-gray-300">
          Segundo a regra dos 4%, você pode sacar 4% do patrimônio por ano (0.33% ao mês) mantendo o capital principal indefinidamente com ajuste pela inflação.
        </p>
        <div class="grid gap-3 md:grid-cols-2">
          <div class="rounded-lg bg-white/10 p-3">
            <p class="text-xs text-gray-400">Com seu patrimônio projetado</p>
            <p class="text-lg font-semibold text-white">
              {{ formatCurrency(results.projectedWealth * 0.04 / 12) }}/mês
            </p>
          </div>
          <div class="rounded-lg bg-white/10 p-3">
            <p class="text-xs text-gray-400">Duração estimada do patrimônio</p>
            <p class="text-lg font-semibold text-secondary">
              {{ results.wealthDuration }} anos
            </p>
          </div>
        </div>
      </div>

      <!-- Cenários -->
      <div class="rounded-xl border border-white/10 bg-white/5 p-5">
        <h4 class="mb-4 font-semibold text-white">Cenários Alternativos</h4>
        <div class="space-y-3">
          <div class="rounded-lg border border-white/10 bg-white/5 p-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-white">Trabalhar mais 3 anos</p>
                <p class="text-xs text-gray-400">Aposentar aos {{ form.retirementAge + 3 }}</p>
              </div>
              <p class="text-secondary font-bold">
                {{ formatCurrency(results.scenarios.work3More) }}
              </p>
            </div>
          </div>
          <div class="rounded-lg border border-white/10 bg-white/5 p-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-white">Aumentar aporte em 20%</p>
                <p class="text-xs text-gray-400">Investir {{ formatCurrency(form.monthlyContribution * 1.2) }}/mês</p>
              </div>
              <p class="text-secondary font-bold">
                {{ formatCurrency(results.scenarios.increase20Percent) }}
              </p>
            </div>
          </div>
          <div class="rounded-lg border border-white/10 bg-white/5 p-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-white">Reduzir renda em 20%</p>
                <p class="text-xs text-gray-400">Viver com {{ formatCurrency(form.monthlyIncome * 0.8) }}/mês</p>
              </div>
              <p class="text-secondary font-bold">
                {{ formatCurrency(results.scenarios.reduce20Percent) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Aviso -->
      <div class="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
        <strong>Lembre-se:</strong> Esta é uma projeção baseada nos parâmetros fornecidos. Retornos reais podem variar. Revise seu planejamento anualmente e ajuste conforme necessário.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const form = ref({
  currentAge: 35,
  retirementAge: 60,
  lifeExpectancy: 85,
  monthlyIncome: 5000,
  currentWealth: 50000,
  monthlyContribution: 2000,
  returnRate: 10, // % ao ano
  withdrawalRate: 6, // % ao ano na aposentadoria
  inflation: 4, // % ao ano
  inss: 0,
})

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
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyIncome,
    currentWealth,
    monthlyContribution,
    returnRate,
    withdrawalRate,
    inflation,
    inss,
  } = form.value

  if (retirementAge <= currentAge) {
    alert('A idade de aposentadoria deve ser maior que a idade atual')
    return
  }

  const yearsToRetirement = retirementAge - currentAge
  const monthsToRetirement = yearsToRetirement * 12
  const monthlyReturn = returnRate / 100 / 12
  const monthlyInflation = inflation / 100 / 12

  // Fase de acumulação: calcular patrimônio projetado
  let wealth = currentWealth
  let totalInvested = currentWealth

  for (let month = 0; month < monthsToRetirement; month++) {
    wealth = wealth * (1 + monthlyReturn) + monthlyContribution
    totalInvested += monthlyContribution
  }

  // Ajustar renda pela inflação até a aposentadoria
  const adjustedIncome = monthlyIncome * Math.pow(1 + monthlyInflation, monthsToRetirement)
  const netIncome = adjustedIncome - inss // Renda que precisa vir dos investimentos

  // Patrimônio necessário (regra dos 4%)
  // Para sacar X/mês com 4% a.a., preciso de X × 12 ÷ 0.04
  const requiredWealth = (netIncome * 12) / (withdrawalRate / 100)

  // Verificar viabilidade
  const viable = wealth >= requiredWealth
  const gap = requiredWealth - wealth
  const gapPercent = (gap / requiredWealth) * 100

  let message = ''
  if (viable) {
    message = `Parabéns! Você terá ${formatCurrency(wealth - requiredWealth)} a mais do que o necessário.`
  } else {
    message = `Faltam ${formatCurrency(gap)} (${gapPercent.toFixed(1)}%) para atingir seu objetivo. Veja os cenários alternativos abaixo.`
  }

  // Calcular duração do patrimônio
  const yearsInRetirement = lifeExpectancy - retirementAge
  const monthlyWithdrawalRate = withdrawalRate / 100 / 12
  let remainingWealth = wealth
  let duration = 0

  for (let month = 0; month < yearsInRetirement * 12; month++) {
    remainingWealth = remainingWealth * (1 + monthlyWithdrawalRate) - netIncome
    if (remainingWealth <= 0) {
      duration = month / 12
      break
    }
  }

  if (remainingWealth > 0) {
    duration = yearsInRetirement
  }

  // Cenários
  const work3More = calculateScenario(yearsToRetirement + 3)
  const increase20Percent = calculateScenario(yearsToRetirement, monthlyContribution * 1.2)
  const reduce20Percent = (netIncome * 0.8 * 12) / (withdrawalRate / 100)

  results.value = {
    viable,
    message,
    yearsToRetirement,
    projectedWealth: wealth,
    requiredWealth,
    totalInvested,
    adjustedIncome,
    wealthDuration: duration,
    scenarios: {
      work3More,
      increase20Percent,
      reduce20Percent,
    },
  }
}

function calculateScenario(years: number, contribution?: number): number {
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

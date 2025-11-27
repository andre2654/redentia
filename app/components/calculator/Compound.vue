<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-trending-up" class="text-secondary size-6" />
        <h2 class="text-xl font-bold text-white">Simulação de Investimento</h2>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Valor Inicial (R$)" name="initialValue">
          <UInputNumber
            v-model="compoundForm.initialValue"
            placeholder="10000"
            size="lg"
            variant="soft"
            class="w-full"
            :format-options="{
              style: 'currency',
              currency: 'BRL',
            }"
          />
        </UFormField>

        <UFormField label="Aporte Mensal (R$)" name="monthlyValue">
          <UInputNumber
            v-model="compoundForm.monthlyValue"
            placeholder="500"
            size="lg"
            variant="soft"
            class="w-full"
            :format-options="{
              style: 'currency',
              currency: 'BRL',
            }"
          />
        </UFormField>

        <UFormField label="Taxa de Juros (%)" name="interestRate">
          <div class="flex gap-2">
            <UInput
              v-model="compoundForm.interestRate"
              type="number"
              step="0.01"
              variant="soft"
              placeholder="10.5"
              size="lg"
              class="flex-1"
            />
            <USelectMenu
              v-model="compoundForm.interestPeriod"
              :items="[
                { label: 'Ao ano', value: 'year' },
                { label: 'Ao mês', value: 'month' },
              ]"
              size="lg"
              :ui="{ base: 'min-w-[120px]' }"
              variant="soft"
            />
          </div>
        </UFormField>

        <UFormField label="Período" name="period">
          <div class="flex gap-2">
            <UInput
              v-model="compoundForm.period"
              type="number"
              placeholder="12"
              size="lg"
              variant="soft"
              class="flex-1"
            />
            <USelectMenu
              v-model="compoundForm.periodType"
              :items="[
                { label: 'Meses', value: 'months' },
                { label: 'Anos', value: 'years' },
              ]"
              size="lg"
              :ui="{ base: 'min-w-[120px]' }"
              variant="soft"
            />
          </div>
        </UFormField>
      </div>

      <UButton
        color="secondary"
        size="xl"
        block
        icon="i-lucide-calculator"
        @click="calculateCompoundInterest"
      >
        Calcular Simulação
      </UButton>
    </div>

    <div v-if="compoundResult" class="flex flex-col gap-6 rounded-[30px] p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-bar-chart-3" class="text-secondary size-6" />
        <h3 class="text-xl font-bold text-white">Resultados da Simulação</h3>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
          <p class="text-[13px] font-extralight text-gray-400">
            Total Investido
          </p>
          <p class="text-2xl font-bold text-white">
            {{
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(compoundResult.totalInvested)
            }}
          </p>
        </div>
        <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
          <p class="text-[13px] font-extralight text-gray-400">
            Total de Juros
          </p>
          <p class="text-2xl font-bold text-green-400">
            {{
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(compoundResult.totalInterest)
            }}
          </p>
        </div>
        <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
          <p class="text-[13px] font-extralight text-gray-400">Valor Final</p>
          <p class="text-secondary text-2xl font-bold">
            {{
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(compoundResult.finalValue)
            }}
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <h4 class="text-[16px] font-semibold">Evolução do Patrimônio</h4>
        <div class="h-[350px]">
          <AtomsGraphLine
            :data="compoundResult.chartData"
            :height="350"
            :legend="[{ label: 'Patrimônio', color: '#00D9A5' }]"
            :colors="['#00D9A5']"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IChartDataPoint } from '~/types/chart'

const compoundForm = ref({
  initialValue: 10000,
  monthlyValue: 500,
  interestRate: '10.5',
  interestPeriod: { label: 'Ao ano', value: 'year' },
  period: '10',
  periodType: { label: 'Anos', value: 'years' },
})

const compoundResult = ref<{
  totalInvested: number
  totalInterest: number
  finalValue: number
  chartData: IChartDataPoint[]
} | null>(null)

async function calculateCompoundInterest() {
  const initial = Number(compoundForm.value.initialValue) || 0
  const monthly = Number(compoundForm.value.monthlyValue) || 0
  const rate = parseFloat(compoundForm.value.interestRate) || 0
  const period = parseInt(compoundForm.value.period) || 0

  try {
    const result = await $fetch('/api/calculate', {
      method: 'POST',
      body: {
        type: 'compound',
        params: {
          initialValue: initial,
          monthlyValue: monthly,
          interestRate: rate,
          period: period,
          periodType: compoundForm.value.periodType.value,
          interestPeriod: compoundForm.value.interestPeriod.value,
        },
      },
    })
    compoundResult.value = result as any
  } catch (e) {
    console.error(e)
  }
}
</script>

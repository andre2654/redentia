import type { IChartDataPoint } from '~/types/chart'

export type CompoundResult = {
  totalInvested: number
  totalInterest: number
  finalValue: number
  chartData: IChartDataPoint[]
}

export type CompoundForm = {
  initialValue: number
  monthlyValue: number
  interestRate: number | null
  interestPeriod: { label: string; value: 'year' | 'month' }
  period: number | null
  periodType: { label: string; value: 'years' | 'months' }
}

export function useCompoundCalc(initial?: Partial<CompoundForm>) {
  const form = ref<CompoundForm>({
    initialValue: 10000,
    monthlyValue: 500,
    interestRate: 10.5,
    interestPeriod: { label: 'Ao ano', value: 'year' },
    period: 10,
    periodType: { label: 'Anos', value: 'years' },
    ...initial,
  })

  const result = ref<CompoundResult | null>(null)
  const loading = ref(false)

  async function calculate() {
    loading.value = true
    try {
      const data = await $fetch<CompoundResult>('/api/calculate', {
        method: 'POST',
        body: {
          type: 'compound',
          params: {
            initialValue: form.value.initialValue || 0,
            monthlyValue: form.value.monthlyValue || 0,
            interestRate: form.value.interestRate ?? 0,
            period: form.value.period ?? 0,
            periodType: form.value.periodType.value,
            interestPeriod: form.value.interestPeriod.value,
          },
        },
      })
      result.value = data
    } catch {
      result.value = null
    } finally {
      loading.value = false
    }
  }

  function formatBRL(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return { form, result, loading, calculate, formatBRL }
}

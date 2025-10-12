<template>
  <div class="relative">
    <div v-if="isLoading" class="h-64 w-full">
      <USkeleton class="h-full w-full" />
    </div>
    <canvas
      v-else-if="chartData"
      ref="chartCanvas"
      class="h-64 w-full"
    />
    <div v-else class="flex h-64 items-center justify-center text-gray-500">
      Dados de demonstração de resultados indisponíveis
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import type { FundamentusData } from '~/types/asset'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  data?: FundamentusData
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  isLoading: false
})

const chartCanvas = ref<HTMLCanvasElement>()
let chart: ChartJS | null = null

const chartData = computed((): ChartData<'bar'> | null => {
  if (!props.data?.incomeStatement) return null

  const { 
    totalRevenue, 
    grossProfit, 
    operatingIncome, 
    netIncome,
    ebitda,
    operatingExpenses
  } = props.data.incomeStatement

  return {
    labels: ['Receita Total', 'Lucro Bruto', 'Resultado Operacional', 'Lucro Líquido', 'EBITDA', 'Despesas Operacionais'],
    datasets: [
      {
        label: 'DRE (em milhões)',
        data: [
          totalRevenue || 0,
          grossProfit || 0,
          operatingIncome || 0,
          netIncome || 0,
          ebitda || 0,
          -(operatingExpenses || 0) // Negativo para despesas
        ],
        backgroundColor: [
          '#3b82f6', // azul para receita
          '#10b981', // verde para lucro bruto
          '#06d6a0', // verde claro para resultado operacional
          '#22c55e', // verde forte para lucro líquido
          '#8b5cf6', // roxo para EBITDA
          '#ef4444'  // vermelho para despesas
        ],
        borderColor: [
          '#2563eb',
          '#059669',
          '#049a73',
          '#16a34a',
          '#7c3aed',
          '#dc2626'
        ],
        borderWidth: 2,
        borderRadius: 4,
      }
    ]
  }
})

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value = context.parsed.y
          const isExpense = context.label === 'Despesas Operacionais'
          const displayValue = isExpense ? Math.abs(value) : value
          return `${context.dataset.label}: R$ ${(displayValue / 1000000).toFixed(2)}M`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxRotation: 45,
        minRotation: 0
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        callback: (value) => {
          const numValue = Number(value)
          const isNegative = numValue < 0
          const displayValue = Math.abs(numValue)
          return `${isNegative ? '-' : ''}R$ ${(displayValue / 1000000).toFixed(0)}M`
        }
      }
    }
  }
}

const createChart = () => {
  if (!chartCanvas.value || !chartData.value) return

  if (chart) {
    chart.destroy()
  }

  chart = new ChartJS(chartCanvas.value, {
    type: 'bar',
    data: chartData.value,
    options: chartOptions
  })
}

watch([() => props.data, () => props.isLoading], () => {
  nextTick(() => {
    if (!props.isLoading && chartData.value) {
      createChart()
    }
  })
}, { immediate: true })

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>
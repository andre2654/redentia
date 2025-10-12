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
      Dados de fluxo de caixa indisponíveis
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
  if (!props.data?.cashFlow) return null

  const { operatingCashFlow, investingCashFlow, financingCashFlow, freeCashFlow } = props.data.cashFlow

  return {
    labels: ['Atividades Operacionais', 'Atividades de Investimento', 'Atividades de Financiamento', 'Fluxo de Caixa Livre'],
    datasets: [
      {
        label: 'Fluxo de Caixa (em milhões)',
        data: [
          operatingCashFlow || 0,
          investingCashFlow || 0,
          financingCashFlow || 0,
          freeCashFlow || 0
        ],
        backgroundColor: [
          '#22c55e', // verde para operacional
          '#3b82f6', // azul para investimento
          '#f59e0b', // amarelo para financiamento
          '#8b5cf6'  // roxo para FCL
        ],
        borderColor: [
          '#16a34a',
          '#2563eb',
          '#d97706',
          '#7c3aed'
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
          return `${context.dataset.label}: R$ ${(value / 1000000).toFixed(2)}M`
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
          return `R$ ${(Number(value) / 1000000).toFixed(0)}M`
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
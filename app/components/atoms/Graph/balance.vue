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
      Dados de balanço patrimonial indisponíveis
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
  if (!props.data?.balanceSheet) return null

  const { 
    totalAssets, 
    totalLiabilities, 
    totalEquity,
    currentAssets,
    currentLiabilities,
    longTermDebt,
    cash
  } = props.data.balanceSheet

  return {
    labels: ['Ativo Total', 'Passivo Total', 'Patrimônio Líquido', 'Ativo Circulante', 'Passivo Circulante', 'Dívida LP', 'Caixa'],
    datasets: [
      {
        label: 'Balanço Patrimonial (em milhões)',
        data: [
          totalAssets || 0,
          totalLiabilities || 0,
          totalEquity || 0,
          currentAssets || 0,
          currentLiabilities || 0,
          longTermDebt || 0,
          cash || 0
        ],
        backgroundColor: [
          '#10b981', // verde para ativo total
          '#ef4444', // vermelho para passivo total
          '#3b82f6', // azul para PL
          '#06d6a0', // verde claro para ativo circulante
          '#f97316', // laranja para passivo circulante
          '#dc2626', // vermelho escuro para dívida LP
          '#22c55e'  // verde para caixa
        ],
        borderColor: [
          '#059669',
          '#dc2626',
          '#2563eb',
          '#049a73',
          '#ea580c',
          '#b91c1c',
          '#16a34a'
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
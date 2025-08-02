<template>
  <div class="flex w-full flex-col gap-4">
    <!-- Controles de período -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white">Dividendos</h2>
      <UButtonGroup orientation="horizontal" variant="soft">
        <UButton
          color="neutral"
          :variant="selectedTimeRange === 'year' ? 'soft' : 'link'"
          label="1A"
          @click="selectedTimeRange = 'year'"
        />
        <UButton
          color="neutral"
          :variant="selectedTimeRange === '3years' ? 'soft' : 'link'"
          label="3A"
          @click="selectedTimeRange = '3years'"
        />
        <UButton
          color="neutral"
          :variant="selectedTimeRange === '5years' ? 'soft' : 'link'"
          label="5A"
          @click="selectedTimeRange = '5years'"
        />
        <UButton
          color="neutral"
          :variant="selectedTimeRange === 'max' ? 'soft' : 'link'"
          label="Máx"
          @click="selectedTimeRange = 'max'"
        />
      </UButtonGroup>
    </div>

    <!-- Gráfico de barras para dividendos -->
    <div
      class="relative rounded-lg bg-gray-900/50 p-4"
      @mouseleave="hoveredIndex = null"
    >
      <div class="h-80 w-full">
        <Bar ref="chartRef" :data="chartData" :options="chartOptions" />
      </div>

      <!-- Tooltip dinâmico -->
      <div
        v-if="hoveredIndex !== null && tooltipData"
        class="pointer-events-none fixed z-50 rounded-lg border border-white/10 bg-black/90 px-3 py-2 backdrop-blur-md transition-all duration-150"
        :style="{
          left: `${tooltipPosition.x + 10}px`,
          top: `${tooltipPosition.y - 100}px`,
        }"
      >
        <div class="flex gap-3">
          <div class="flex flex-col gap-2">
            <!-- Indicador de dividendo -->
            <div class="flex items-center gap-2">
              <div class="h-3 w-3 rounded-full bg-emerald-500" />
              <div class="flex flex-col">
                <span class="text-[13px] font-medium text-white">
                  {{ tooltipData.label }}
                </span>
                <span class="text-[13px] text-emerald-400">
                  R$
                  {{
                    tooltipData.value.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })
                  }}
                </span>
              </div>
            </div>
            <!-- Indicador de yield -->
            <div class="flex items-center gap-2">
              <div class="h-3 w-3 rounded-full bg-amber-500" />
              <div class="flex flex-col">
                <span class="text-[11px] text-amber-400"> Dividend Yield </span>
                <span class="text-[13px] font-medium text-amber-400">
                  {{ tooltipData.dividendYield.toFixed(2) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkbox para agrupar por ano -->
      <div class="mt-4 flex items-center gap-2">
        <input
          id="group-by-year"
          v-model="groupByYear"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
        />
        <label for="group-by-year" class="text-sm text-white/70">
          Agrupar dividendos por ano
        </label>
      </div>
    </div>

    <!-- Resumo dos dividendos -->
    <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
      <div class="flex flex-col gap-1 rounded-lg bg-gray-800/50 p-3">
        <span class="text-xs text-white/60">Total no período</span>
        <span class="text-lg font-semibold text-emerald-400">
          R$
          {{
            totalDividends.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
          }}
        </span>
      </div>
      <div class="flex flex-col gap-1 rounded-lg bg-gray-800/50 p-3">
        <span class="text-xs text-white/60">Maior pagamento</span>
        <span class="text-lg font-semibold text-white">
          R$
          {{
            maxDividend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
          }}
        </span>
      </div>
      <div class="flex flex-col gap-1 rounded-lg bg-gray-800/50 p-3">
        <span class="text-xs text-white/60"
          >Média {{ groupByYear ? 'anual' : 'por pagamento' }}</span
        >
        <span class="text-lg font-semibold text-white">
          R$
          {{
            averageDividend.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })
          }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  type ChartEvent,
  type ActiveElement,
} from 'chart.js'
import { Bar } from 'vue-chartjs'

interface DividendData {
  date: string
  value: number
  year: number
}

interface Props {
  data?: DividendData[]
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
})

const selectedTimeRange = ref<'year' | '3years' | '5years' | 'max'>('5years')
const groupByYear = ref(false)
const hoveredIndex = ref<number | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const chartRef = ref<InstanceType<typeof Bar> | null>(null)
const chartInstance = ref<ChartJS | null>(null)
let cleanupEvents: (() => void) | null = null

// Gerador de dados de dividendos mock
const generateMockDividendData = (): DividendData[] => {
  const data: DividendData[] = []
  const currentYear = new Date().getFullYear()
  const startYear = 2020

  // Padrão de pagamento: trimestral (março, junho, setembro, dezembro)
  const months = [3, 6, 9, 12]

  for (let year = startYear; year <= currentYear; year++) {
    // Define um padrão base para cada ano
    const yearMultiplier = year >= 2023 ? 1.5 : year >= 2022 ? 0.8 : 0.5
    const baseValue = 0.15 * yearMultiplier

    months.forEach((month, _index) => {
      // Adiciona variação realística aos dividendos
      const seasonalMultiplier = month === 3 || month === 12 ? 1.8 : 1.0 // Março e dezembro têm dividendos maiores
      const randomVariation = 0.7 + Math.random() * 0.6 // Entre 70% e 130% do valor base
      const value = baseValue * seasonalMultiplier * randomVariation

      // Para 2025, só gera dados até o mês atual
      if (year === currentYear && month > new Date().getMonth() + 1) {
        return
      }

      // Formata a data no padrão brasileiro
      const day = Math.floor(Math.random() * 28) + 1 // Entre 1 e 28
      const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`

      data.push({
        date: formattedDate,
        value: Math.round(value * 100) / 100, // Arredonda para 2 casas decimais
        year: year,
      })
    })
  }

  return data.sort((a, b) => {
    // Ordena por ano e depois por mês
    if (a.year !== b.year) return a.year - b.year
    const monthA = parseInt(a.date.split('/')[1])
    const monthB = parseInt(b.date.split('/')[1])
    return monthA - monthB
  })
}

// Gerador de preços de ações mock
const generateMockStockPrices = (): Record<number, number> => {
  const prices: Record<number, number> = {}
  const currentYear = new Date().getFullYear()
  const startYear = 2020

  let basePrice = 20.0 // Preço inicial

  for (let year = startYear; year <= currentYear; year++) {
    // Simula crescimento anual com alguma volatilidade
    const growth = 0.08 + (Math.random() - 0.5) * 0.15 // Entre -7.5% e +22.5%
    basePrice = basePrice * (1 + growth)
    prices[year] = Math.round(basePrice * 100) / 100
  }

  return prices
}

// Dados gerados dinamicamente
const mockDividendData = generateMockDividendData()
const _mockStockPrices = generateMockStockPrices()

// Simula preço da ação para calcular dividend yield (usando dados gerados)
const _getStockPrice = (year: number): number => {
  return _mockStockPrices[year] || 35.0
}

// Filtra dados baseado no período selecionado
const filteredData = computed(() => {
  const currentYear = new Date().getFullYear()
  const dataToUse = props.data.length > 0 ? props.data : mockDividendData

  switch (selectedTimeRange.value) {
    case 'year':
      return dataToUse.filter((item) => item.year >= currentYear - 1)
    case '3years':
      return dataToUse.filter((item) => item.year >= currentYear - 3)
    case '5years':
      return dataToUse.filter((item) => item.year >= currentYear - 5)
    case 'max':
    default:
      return dataToUse
  }
})

// Agrupa dados por ano se necessário
const displayData = computed(() => {
  if (!groupByYear.value) {
    return filteredData.value.map((item) => ({
      label: item.date,
      value: item.value,
      year: item.year,
    }))
  }

  // Agrupa por ano
  const groupedByYear = filteredData.value.reduce(
    (acc, item) => {
      if (!acc[item.year]) {
        acc[item.year] = { total: 0, count: 0 }
      }
      acc[item.year].total += item.value
      acc[item.year].count++
      return acc
    },
    {} as Record<number, { total: number; count: number }>
  )

  return Object.entries(groupedByYear)
    .map(([year, data]) => ({
      label: year,
      value: data.total,
      year: parseInt(year),
    }))
    .sort((a, b) => a.year - b.year)
})

// Tooltip data para hover
const tooltipData = computed(() => {
  if (hoveredIndex.value === null || !displayData.value[hoveredIndex.value]) {
    return null
  }

  const item = displayData.value[hoveredIndex.value]
  const stockPrice = _getStockPrice(item.year)
  const dividendYield = (item.value / stockPrice) * 100

  return {
    label: groupByYear.value ? `Ano ${item.label}` : item.label,
    value: item.value,
    dividendYield,
  }
})

// Setup de eventos do canvas para interação
const setupCanvasEvents = (chart: ChartJS) => {
  const canvas = chart.canvas

  const handleMouseMove = (event: MouseEvent) => {
    tooltipPosition.value = { x: event.clientX, y: event.clientY }

    const points = chart.getElementsAtEventForMode(
      event,
      'nearest',
      { intersect: true },
      true
    )

    if (points.length) {
      hoveredIndex.value = points[0].index
    } else {
      hoveredIndex.value = null
    }
  }

  const handleMouseLeave = () => {
    hoveredIndex.value = null
  }

  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mouseleave', handleMouseLeave)

  return () => {
    canvas.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mouseleave', handleMouseLeave)
  }
}

// Registra os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

// Configuração dos dados do gráfico
const chartData = computed(() => {
  // Calcula o dividend yield para cada ponto
  const yieldData = displayData.value.map((item) => {
    const stockPrice = _getStockPrice(item.year)
    return (item.value / stockPrice) * 100
  })

  return {
    labels: displayData.value.map((item) => item.label),
    datasets: [
      {
        label: 'Dividendos',
        data: displayData.value.map((item) => item.value),
        backgroundColor: '#10B981', // emerald-500
        hoverBackgroundColor: '#059669', // emerald-600
        borderRadius: 4,
        borderSkipped: false,
        type: 'bar' as const,
        yAxisID: 'y',
      },
      {
        label: 'Dividend Yield (%)',
        data: yieldData,
        borderColor: '#F59E0B', // amber-500
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        type: 'line' as const,
        yAxisID: 'y1',
        tension: 0.4, // Suaviza a linha
      },
    ],
  }
})

// Configuração das opções do gráfico
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12,
        },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
      },
    },
    tooltip: {
      enabled: false, // Usamos tooltip customizado
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12,
        },
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12,
        },
        callback: function (value: number) {
          return `R$ ${Number(value).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
          })}`
        },
      },
      title: {
        display: true,
        text: 'Dividendos (R$)',
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 11,
        },
      },
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        color: 'rgba(245, 158, 11, 0.7)', // amber-500 com opacidade
        font: {
          size: 12,
        },
        callback: function (value: number) {
          return `${Number(value).toFixed(1)}%`
        },
      },
      title: {
        display: true,
        text: 'Dividend Yield (%)',
        color: 'rgba(245, 158, 11, 0.7)',
        font: {
          size: 11,
        },
      },
    },
  },
  onHover: (_event: ChartEvent, elements: ActiveElement[]) => {
    if (elements.length > 0) {
      hoveredIndex.value = elements[0].index
    } else {
      hoveredIndex.value = null
    }
  },
}))

// Lifecycle hooks
onMounted(() => {
  setTimeout(() => {
    if (chartRef.value?.chart) {
      chartInstance.value = chartRef.value.chart
      cleanupEvents = setupCanvasEvents(chartRef.value.chart)
    }
  }, 100)
})

onUnmounted(() => {
  if (cleanupEvents) {
    cleanupEvents()
    cleanupEvents = null
  }
})

// Calcula valores das estatísticas
const totalDividends = computed(() => {
  return displayData.value.reduce((sum, item) => sum + item.value, 0)
})

const maxDividend = computed(() => {
  return Math.max(...displayData.value.map((item) => item.value), 0)
})

const averageDividend = computed(() => {
  if (displayData.value.length === 0) return 0
  return totalDividends.value / displayData.value.length
})
</script>

<style scoped>
/* Animação suave para as barras */
.transition-all {
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

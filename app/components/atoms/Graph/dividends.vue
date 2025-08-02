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
      <div class="relative h-80 w-full">
        <Bar
          ref="chartRef"
          :data="chartData"
          :options="chartOptions"
          :plugins="[predictionLabelPlugin]"
        />
      </div>

      <!-- Tooltip dinâmico -->
      <div
        v-if="hoveredIndex !== null && tooltipData"
        class="pointer-events-none fixed z-10 rounded-lg bg-black/30 px-3 py-2 backdrop-blur-md transition-all duration-150"
        :style="{
          left: `${tooltipPosition.x + 10}px`,
          top: `${tooltipPosition.y - 60}px`,
        }"
      >
        <div class="flex gap-3">
          <div class="flex flex-col gap-2">
            <!-- Indicador de dividendo -->
            <div class="flex items-center gap-2">
              <div
                class="h-3 w-3 rounded-full"
                :style="{
                  backgroundColor: tooltipData.isPrediction
                    ? '#a7d6ff'
                    : '#04CE00',
                }"
              />
              <div class="flex flex-col">
                <span class="text-[13px] font-medium text-white">
                  {{ tooltipData.label }}
                  <span
                    v-if="tooltipData.isPrediction"
                    class="ml-1 text-[11px] text-[#a7d6ff]"
                  >
                    (previsão)
                  </span>
                </span>
                <span
                  class="text-[13px]"
                  :style="{
                    color: tooltipData.isPrediction ? '#a7d6ff' : '#04CE00',
                  }"
                >
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
              <div
                class="h-3 w-3 rounded-full"
                :class="
                  tooltipData.isPrediction ? 'bg-amber-500/50' : 'bg-amber-500'
                "
              />
              <div class="flex flex-col">
                <span class="text-[11px] text-amber-400"> Dividend Yield </span>
                <span class="text-[13px] font-medium text-amber-400">
                  {{ tooltipData.dividendYield.toFixed(2) }}%
                  <span
                    v-if="tooltipData.isPrediction"
                    class="text-[10px] opacity-70"
                  >
                    (est.)
                  </span>
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
        <span class="text-lg font-semibold" style="color: #04ce00">
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
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import colorLib from '@kurkle/color'
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

function transparentize(value: string, opacity: number) {
  const alpha = opacity === undefined ? 0.5 : 1 - opacity
  return colorLib(value).alpha(alpha).rgbString()
}

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

// Calcula a previsão do próximo pagamento
const getNextPaymentPrediction = computed(() => {
  const dataToUse = props.data.length > 0 ? props.data : mockDividendData

  if (dataToUse.length === 0) return null

  if (groupByYear.value) {
    // Previsão anual: próximo ano com média dos últimos anos
    const currentYear = new Date().getFullYear()
    const recentYears = dataToUse.filter((item) => item.year >= currentYear - 3)

    if (recentYears.length === 0) return null

    // Calcula média anual dos últimos anos
    const yearlyTotals = recentYears.reduce(
      (acc, item) => {
        if (!acc[item.year]) acc[item.year] = 0
        acc[item.year] += item.value
        return acc
      },
      {} as Record<number, number>
    )

    const yearlyValues = Object.values(yearlyTotals)
    const averageAnnual =
      yearlyValues.reduce((sum, val) => sum + val, 0) / yearlyValues.length

    return {
      label: `${currentYear + 1}`,
      value: Math.round(averageAnnual * 100) / 100,
      year: currentYear + 1,
      isPrediction: true,
    }
  } else {
    // Previsão mensal: encontra o mês mais frequente e calcula próxima data
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    // Analisa frequência dos meses de pagamento
    const monthFrequency = dataToUse.reduce(
      (acc, item) => {
        const month = parseInt(item.date.split('/')[1])
        acc[month] = (acc[month] || 0) + 1
        return acc
      },
      {} as Record<number, number>
    )

    // Encontra o mês mais frequente
    const mostFrequentMonth = Object.entries(monthFrequency).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0]

    if (!mostFrequentMonth) return null

    const nextMonth = parseInt(mostFrequentMonth)

    // Determina próxima data de pagamento
    let nextYear = currentYear
    if (nextMonth <= currentMonth) {
      nextYear = currentYear + 1
    }

    // Calcula valor baseado na média dos últimos pagamentos do mesmo mês
    const sameMonthPayments = dataToUse.filter((item) => {
      const itemMonth = parseInt(item.date.split('/')[1])
      return itemMonth === nextMonth && item.year >= currentYear - 3
    })

    const averageValue =
      sameMonthPayments.length > 0
        ? sameMonthPayments.reduce((sum, payment) => sum + payment.value, 0) /
          sameMonthPayments.length
        : dataToUse.slice(-4).reduce((sum, payment) => sum + payment.value, 0) /
          Math.min(4, dataToUse.length)

    // Gera data estimada (dia 15 do mês)
    const nextDate = `15/${nextMonth.toString().padStart(2, '0')}/${nextYear.toString().slice(-2)}`

    return {
      label: nextDate,
      value: Math.round(averageValue * 100) / 100,
      year: nextYear,
      isPrediction: true,
    }
  }
})

// Agrupa dados por ano se necessário
const displayData = computed(() => {
  let baseData: Array<{
    label: string
    value: number
    year: number
    isPrediction?: boolean
  }>

  if (!groupByYear.value) {
    baseData = filteredData.value.map((item) => ({
      label: item.date,
      value: item.value,
      year: item.year,
    }))
  } else {
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

    baseData = Object.entries(groupedByYear)
      .map(([year, data]) => ({
        label: year,
        value: data.total,
        year: parseInt(year),
      }))
      .sort((a, b) => a.year - b.year)
  }

  // Adiciona previsão se disponível
  const prediction = getNextPaymentPrediction.value
  if (prediction) {
    baseData.push(prediction)
  }

  return baseData
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
    isPrediction: item.isPrediction || false,
  }
})

// Setup de eventos do canvas para interação
const setupCanvasEvents = (chart: ChartJS) => {
  if (!chart?.canvas) return () => {}

  const canvas = chart.canvas

  const handleMouseMove = (event: MouseEvent) => {
    try {
      tooltipPosition.value = { x: event.clientX, y: event.clientY }

      const points = chart.getElementsAtEventForMode(
        event,
        'nearest',
        { intersect: true },
        true
      )

      if (points && points.length > 0) {
        hoveredIndex.value = points[0].index
      } else {
        hoveredIndex.value = null
      }
    } catch {
      // Ignora erros silenciosamente
    }
  }

  const handleMouseLeave = () => {
    hoveredIndex.value = null
  }

  try {
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      try {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
      } catch {
        // Ignora erros silenciosamente
      }
    }
  } catch {
    return () => {}
  }
}

// Plugin personalizado para desenhar texto nas barras de previsão
const predictionLabelPlugin = {
  id: 'predictionLabel',
  afterDatasetsDraw(chart: ChartJS) {
    const { ctx } = chart
    const meta = chart.getDatasetMeta(0) // Dataset das barras

    if (!meta.data) return

    try {
      ctx.save()

      // Obter dados de forma segura
      const currentData = displayData.value || []

      meta.data.forEach(
        (
          bar: { getCenterPoint: () => { x: number; y: number } },
          index: number
        ) => {
          if (index >= currentData.length) return

          const dataPoint = currentData[index]
          if (dataPoint?.isPrediction) {
            try {
              const centerPoint = bar.getCenterPoint()

              ctx.save()
              ctx.translate(centerPoint.x, centerPoint.y)

              ctx.restore()

              // Desenha o texto "PREV" abaixo do ícone
              ctx.save()
              ctx.translate(centerPoint.x, centerPoint.y + 40) // Move para baixo da barra
              ctx.font = 'bold 10px Arial'
              ctx.fillStyle = '#a7d6ff'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.rotate(-Math.PI / 2)
              ctx.fillText('PREV', 0, 0)
              ctx.restore()
            } catch {
              // Ignora erros silenciosamente
            }
          }
        }
      )

      ctx.restore()
    } catch {
      // Ignora erros silenciosamente
    }
  },
}

// Registra os componentes do Chart.js (sem o plugin personalizado)
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

  // Define cores base
  const primaryColor = '#04CE00'
  const secondaryColor = '#a7d6ff'

  // Função para criar gradiente de barras
  const createBarGradient = (
    ctx: CanvasRenderingContext2D,
    chartArea: { top: number; bottom: number },
    color: string,
    opacity: number = 0.3
  ) => {
    const gradient = ctx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom
    )
    gradient.addColorStop(0, transparentize(color, opacity)) // Opacidade variável no topo
    gradient.addColorStop(1, transparentize(color, 1.0)) // 0% de opacidade na base
    return gradient
  }

  const borderColors = displayData.value.map((item) =>
    item.isPrediction ? secondaryColor : primaryColor
  )

  return {
    labels: displayData.value.map((item) =>
      item.isPrediction ? `${item.label} (prev.)` : item.label
    ),
    datasets: [
      {
        label: 'Dividendos',
        data: displayData.value.map((item) => item.value),
        backgroundColor: (context: {
          chart: {
            canvas: HTMLCanvasElement
            chartArea?: { top: number; bottom: number }
          }
          dataIndex?: number
        }) => {
          const chart = context.chart
          const { chartArea } = chart

          if (!chartArea || context.dataIndex === undefined) {
            return primaryColor
          }

          const item = displayData.value[context.dataIndex]
          if (!item) return primaryColor

          const color = item.isPrediction ? secondaryColor : primaryColor
          const canvasCtx = chart.canvas.getContext('2d')
          if (!canvasCtx) return color

          return createBarGradient(canvasCtx, chartArea, color, 0.3)
        },
        borderColor: borderColors,
        borderWidth: 1.5,
        hoverBackgroundColor: (context: {
          chart: {
            canvas: HTMLCanvasElement
            chartArea?: { top: number; bottom: number }
          }
          dataIndex?: number
        }) => {
          const chart = context.chart
          const { chartArea } = chart

          if (!chartArea || context.dataIndex === undefined) {
            return primaryColor
          }

          const item = displayData.value[context.dataIndex]
          if (!item) return primaryColor

          const color = item.isPrediction ? secondaryColor : primaryColor
          const canvasCtx = chart.canvas.getContext('2d')
          if (!canvasCtx) return color

          return createBarGradient(canvasCtx, chartArea, color, 0.1)
        },
        hoverBorderColor: borderColors,
        hoverBorderWidth: 3,
        borderRadius: 0,
        borderSkipped: 'bottom',
        type: 'bar' as const,
        yAxisID: 'y',
        order: 2, // Barras ficam atrás
      },
      {
        label: 'Dividend Yield (%)',
        data: yieldData,
        borderColor: displayData.value.map((item) =>
          item.isPrediction ? 'rgba(245, 158, 11, 0.7)' : '#F59E0B'
        ),
        borderWidth: 2,
        pointRadius: displayData.value.map((item) =>
          item.isPrediction ? 6 : 4
        ), // Pontos maiores para previsão
        pointHoverRadius: displayData.value.map((item) =>
          item.isPrediction ? 8 : 6
        ),
        pointBackgroundColor: displayData.value.map((item) =>
          item.isPrediction ? 'rgba(245, 158, 11, 0.7)' : '#F59E0B'
        ),
        type: 'line' as const,
        yAxisID: 'y1',
        tension: 0.4, // Suaviza a linha
        order: 1, // Linha fica na frente
        // Linha pontilhada para previsão
        segment: {
          borderDash: (ctx: { p1DataIndex: number }) => {
            const index = ctx.p1DataIndex
            return displayData.value[index]?.isPrediction ? [5, 5] : []
          },
        },
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
      position: 'bottom' as const,
      align: 'start' as const,
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12,
        },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        boxWidth: 12,
        boxHeight: 12,
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
    try {
      if (elements && elements.length > 0) {
        hoveredIndex.value = elements[0].index
      } else {
        hoveredIndex.value = null
      }
    } catch {
      hoveredIndex.value = null
    }
  },
}))

// Lifecycle hooks
onMounted(() => {
  nextTick(() => {
    if (chartRef.value?.chart) {
      chartInstance.value = chartRef.value.chart
      cleanupEvents = setupCanvasEvents(chartRef.value.chart)
    }
  })
})

onUnmounted(() => {
  try {
    if (cleanupEvents) {
      cleanupEvents()
      cleanupEvents = null
    }
    if (chartInstance.value) {
      chartInstance.value.destroy()
      chartInstance.value = null
    }
  } catch {
    // Ignora erros silenciosamente
  }
})

// Calcula valores das estatísticas
const totalDividends = computed(() => {
  try {
    const data = displayData.value
    if (!data || !Array.isArray(data)) return 0
    return data.reduce((sum, item) => sum + (item?.value || 0), 0)
  } catch {
    return 0
  }
})

const maxDividend = computed(() => {
  try {
    const data = displayData.value
    if (!data || !Array.isArray(data) || data.length === 0) return 0
    return Math.max(...data.map((item) => item?.value || 0))
  } catch {
    return 0
  }
})

const averageDividend = computed(() => {
  try {
    const data = displayData.value
    const total = totalDividends.value
    if (!data || !Array.isArray(data) || data.length === 0 || total === 0)
      return 0
    return total / data.length
  } catch {
    return 0
  }
})
</script>

<style scoped>
/* Animação suave para as barras */
.transition-all {
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

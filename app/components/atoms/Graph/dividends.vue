<template>
  <div class="graph flex w-full flex-col gap-6">
    <!-- Header com controles -->
    <div v-if="showControls" class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <UIcon name="i-lucide-bar-chart-2" class="h-5 w-5 text-white/60" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-white">Histórico de Dividendos</h2>
          <p class="text-xs text-white/40">Pagamentos e dividend yield</p>
        </div>
      </div>

      <!-- Period selector -->
      <div class="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        <button
          v-for="period in [
            { key: 'year', label: '1A' },
            { key: '3years', label: '3A' },
            { key: '5years', label: '5A' },
            { key: 'max', label: 'Máx' },
          ]"
          :key="period.key"
          class="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
          :class="selectedTimeRange === period.key
            ? 'bg-white/10 text-white'
            : 'text-white/50 hover:text-white/80'"
          @click="selectedTimeRange = period.key as any"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- Chart container -->
    <div class="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <!-- Chart area -->
      <div class="relative p-4" @mouseleave="hoveredIndex = null">
        <div class="relative h-[300px] w-full">
          <!-- Loading state -->
          <div
            v-if="props.loading"
            class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg bg-black/40"
          >
            <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-white/40" />
            <span class="text-sm text-white/40">Carregando...</span>
          </div>

          <Bar
            ref="chartRef"
            :data="chartData as any"
            :options="chartOptions as any"
            :plugins="[predictionLabelPlugin]"
          />
        </div>

        <!-- Tooltip -->
        <div
          v-if="hoveredIndex !== null && tooltipData"
          class="pointer-events-none fixed z-50 rounded-xl border border-white/10 bg-black/90 p-3 shadow-xl backdrop-blur-sm"
          :style="{
            left: `${tooltipPosition.x + 12}px`,
            top: `${tooltipPosition.y - 80}px`,
          }"
        >
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 border-b border-white/10 pb-2">
              <span class="text-xs font-medium text-white">
                {{ tooltipData.label }}
              </span>
              <span
                v-if="tooltipData.isPrediction"
                class="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-400"
              >
                Previsão
              </span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-1.5">
                <div class="h-2 w-2 rounded-full bg-emerald-400" />
                <span class="text-[10px] text-white/50">Dividendo</span>
              </div>
              <span class="text-sm font-semibold text-emerald-400">
                R$ {{ tooltipData.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-1.5">
                <div class="h-2 w-2 rounded-full bg-blue-400" />
                <span class="text-[10px] text-white/50">Yield</span>
              </div>
              <span class="text-sm font-semibold text-blue-400">
                {{ tooltipData.dividendYield.toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with toggle and legend -->
      <div v-if="showControls" class="flex items-center justify-between border-t border-white/5 px-4 py-3">
        <!-- Toggle -->
        <button
          type="button"
          class="flex items-center gap-2 text-xs transition-colors"
          :class="groupByYear ? 'text-white' : 'text-white/50'"
          @click="groupByYear = !groupByYear"
        >
          <div
            class="flex h-4 w-7 items-center rounded-full p-0.5 transition-colors"
            :class="groupByYear ? 'bg-emerald-500' : 'bg-white/20'"
          >
            <div
              class="h-3 w-3 rounded-full bg-white shadow transition-transform"
              :class="groupByYear ? 'translate-x-3' : 'translate-x-0'"
            />
          </div>
          <span>Agrupar por ano</span>
        </button>

        <!-- Legend -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1.5">
            <div class="h-2 w-2 rounded-full bg-emerald-400" />
            <span class="text-[10px] text-white/40">Dividendos</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="h-2 w-2 rounded-full bg-blue-400" />
            <span class="text-[10px] text-white/40">Yield</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats cards -->
    <div v-if="showControls" class="grid gap-3 sm:grid-cols-3">
      <div class="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
          <UIcon name="i-lucide-coins" class="h-5 w-5 text-white/40" />
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-white/40">Total no período</span>
          <span class="text-lg font-semibold tabular-nums text-white">
            R$ {{ totalDividends.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
          <UIcon name="i-lucide-trophy" class="h-5 w-5 text-white/40" />
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-white/40">Maior pagamento</span>
          <span class="text-lg font-semibold tabular-nums text-white">
            R$ {{ maxDividend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
          <UIcon name="i-lucide-calculator" class="h-5 w-5 text-white/40" />
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-white/40">Média por pagamento</span>
          <span class="text-lg font-semibold tabular-nums text-white">
            R$ {{ averageDividend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </span>
        </div>
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
import { ChartColors } from '~/design/chartColors'

function transparentize(value: string, opacity: number) {
  const alpha = opacity === undefined ? 0.5 : 1 - opacity
  return colorLib(value).alpha(alpha).rgbString()
}

interface DividendData {
  date: string
  value: number
  year: number
}

interface ApiDividendData {
  ticker: string
  payment_date: string
  rate: string
  label: string
}

interface Props {
  data?: ApiDividendData[]
  loading?: boolean
  showControls?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  showControls: true,
})

const selectedTimeRange = ref<'year' | '3years' | '5years' | 'max'>('5years')
const groupByYear = ref(false)
const hoveredIndex = ref<number | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const chartRef = ref<InstanceType<typeof Bar> | null>(null)
const chartInstance = ref<ChartJS | null>(null)
let cleanupEvents: (() => void) | null = null

// Função para transformar dados da API no formato esperado
const transformApiData = (apiData: ApiDividendData[]): DividendData[] => {
  return apiData
    .map((item) => {
      const date = new Date(item.payment_date)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const shortYear = year.toString().slice(-2)

      return {
        date: `${day}/${month}/${shortYear}`,
        value: parseFloat(item.rate),
        year: year,
      }
    })
    .sort((a, b) => {
      // Ordena por ano e depois por mês
      if (a.year !== b.year) return a.year - b.year
      const monthA = parseInt(a.date.split('/')[1] || '1')
      const monthB = parseInt(b.date.split('/')[1] || '1')
      return monthA - monthB
    })
}

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
    const monthA = parseInt(a.date.split('/')[1] || '1')
    const monthB = parseInt(b.date.split('/')[1] || '1')
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

// Dados transformados usando dados reais ou mock
const transformedData = computed(() => {
  return props.data.length > 0 ? transformApiData(props.data) : mockDividendData
})

// Filtra dados baseado no período selecionado
const filteredData = computed(() => {
  const currentYear = new Date().getFullYear()
  const dataToUse = transformedData.value

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
  const dataToUse = transformedData.value

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
        acc[item.year]! += item.value
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
        const month = parseInt(item.date.split('/')[1] || '1')
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
      const itemMonth = parseInt(item.date.split('/')[1] || '1')
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
        acc[item.year]!.total += item.value
        acc[item.year]!.count++
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
  if (!item) return null

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
        hoveredIndex.value = points[0]?.index ?? null
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

  const handleScroll = () => {
    // Oculta tooltip durante scroll
    hoveredIndex.value = null
  }

  try {
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      try {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
        window.removeEventListener('scroll', handleScroll)
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

      meta.data.forEach((bar: unknown, index: number) => {
        if (index >= currentData.length) return

        const dataPoint = currentData[index]
        if (
          dataPoint?.isPrediction &&
          bar &&
          typeof bar === 'object' &&
          'getCenterPoint' in bar
        ) {
          try {
            const centerPoint = (
              bar as { getCenterPoint: () => { x: number; y: number } }
            ).getCenterPoint()

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
      })

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
  const primaryColor = ChartColors.positive
  const secondaryColor = ChartColors.secondary

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
        borderRadius: 10,
        borderSkipped: false,
        type: 'bar' as const,
        yAxisID: 'y',
        order: 2, // Barras ficam atrás
      },
      {
        label: 'Dividend Yield (%)',
        data: yieldData,
        borderColor: '#a7d6ff',
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: '#a7d6ff',
        type: 'line' as const,
        yAxisID: 'y1',
        tension: 0.6, // Suaviza a linha
        order: 1, // Linha fica na frente
        // Linha pontilhada para previsão
        segment: {
          borderDash: (ctx: { p1DataIndex: number }) => {
            const index = ctx.p1DataIndex
            return displayData.value[index]?.isPrediction ? [6, 6] : []
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
  animation: { duration: 400, easing: 'easeOutQuart' },
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  layout: { padding: { top: 8, right: 8, bottom: 0, left: 0 } },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      grid: {
        color: 'rgba(255, 255, 255, 0.04)',
        drawTicks: false,
      },
      border: { display: false },
      ticks: {
        color: 'rgba(255, 255, 255, 0.3)',
        font: { size: 10 },
        padding: 8,
        maxTicksLimit: 5,
        callback: function (value: number) {
          return `R$ ${Number(value).toFixed(2)}`
        },
      },
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      grid: { drawOnChartArea: false },
      border: { display: false },
      ticks: {
        color: 'rgba(147, 197, 253, 0.5)',
        font: { size: 10 },
        padding: 8,
        maxTicksLimit: 5,
        callback: function (value: number) {
          return `${Number(value).toFixed(1)}%`
        },
      },
    },
  },
  onHover: (_event: ChartEvent, elements: ActiveElement[]) => {
    try {
      if (elements && elements.length > 0) {
        hoveredIndex.value = elements[0]?.index ?? null
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
.graph :deep(canvas) {
  width: 100% !important;
}
</style>

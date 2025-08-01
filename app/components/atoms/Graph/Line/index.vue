<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import colorLib from '@kurkle/color'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

interface IChartDataPoint {
  date: string
  value: number
  timestamp: number
}

interface IChartLegendItem {
  label: string
  color: string
  value?: string | number
}

interface Props {
  data: IChartDataPoint[]
  colors?: string[]
  legend?: IChartLegendItem[]
  height?: number
  showLegend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => ['#04CE00'],
  legend: () => [],
  height: 300,
  showLegend: true,
})

function transparentize(value: string, opacity: number) {
  const alpha = opacity === undefined ? 0.5 : 1 - opacity
  return colorLib(value).alpha(alpha).rgbString()
}

// Estados para funcionalidade de arrastar
const isDragging = ref(false)
const dragStartIndex = ref<number | null>(null)
const dragEndIndex = ref<number | null>(null)
const isHovering = ref(false)
const hoverIndex = ref<number | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

// Dados do tooltip
const tooltipData = computed(() => {
  if (
    isDragging.value &&
    dragStartIndex.value !== null &&
    dragEndIndex.value !== null
  ) {
    // Durante o drag, mostra informações da seleção
    const startIdx = Math.min(dragStartIndex.value, dragEndIndex.value)
    const endIdx = Math.max(dragStartIndex.value, dragEndIndex.value)

    if (startIdx === endIdx || !props.data[startIdx] || !props.data[endIdx]) {
      return null
    }

    const startData = props.data[startIdx]
    const endData = props.data[endIdx]
    const change = endData.value - startData.value
    const changePercent = (change / startData.value) * 100

    return {
      label: `${startData.date} → ${endData.date}`,
      value: `${change >= 0 ? '+' : ''}R$ ${change.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
      })} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`,
      color: change >= 0 ? '#04CE00' : '#FF4757',
    }
  }

  if (
    isHovering.value &&
    hoverIndex.value !== null &&
    props.data[hoverIndex.value]
  ) {
    // Durante o hover, mostra informações do ponto específico
    const dataPoint = props.data[hoverIndex.value]
    return {
      label: dataPoint.date,
      value: `R$ ${dataPoint.value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      color: props.colors[0],
    }
  }

  return null
})

// Referência para o chart
const chartRef = ref<InstanceType<typeof Line> | null>(null)
const chartInstance = ref<ChartJS | null>(null)
let cleanupEvents: (() => void) | null = null

// Função para configurar event listeners do canvas
const setupCanvasEvents = (chart: ChartJS) => {
  const canvas = chart.canvas

  const handleMouseDown = (event: MouseEvent) => {
    // Validações de segurança
    if (!chart || !chart.chartArea || !chart.scales || !chart.scales.x) {
      return
    }

    const canvasPosition = canvas.getBoundingClientRect()
    const x = event.clientX - canvasPosition.left

    if (x >= chart.chartArea.left && x <= chart.chartArea.right) {
      try {
        const dataIndex = chart.scales.x.getValueForPixel(x)
        if (typeof dataIndex === 'number' && !isNaN(dataIndex)) {
          const roundedIndex = Math.round(dataIndex)

          if (roundedIndex >= 0 && roundedIndex < props.data.length) {
            isDragging.value = true
            dragStartIndex.value = roundedIndex
            dragEndIndex.value = roundedIndex
            // Não chama chart.update() - deixa o plugin lidar com a renderização
            event.preventDefault()
          }
        }
      } catch {
        // Ignora erros silenciosamente
      }
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    // Verifica se o chart ainda existe e tem as propriedades necessárias
    if (!chart || !chart.chartArea || !chart.scales || !chart.scales.x) {
      return
    }

    const canvasPosition = canvas.getBoundingClientRect()
    const x = event.clientX - canvasPosition.left
    const y = event.clientY - canvasPosition.top

    // Atualiza posição do tooltip
    tooltipPosition.value = { x: event.clientX, y: event.clientY }

    // Verifica se está dentro da área do canvas
    const isInsideCanvas =
      x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height

    // Se não estiver no canvas e não estiver arrastando, limpa tudo
    if (!isInsideCanvas && !isDragging.value) {
      isHovering.value = false
      hoverIndex.value = null
      // NÃO chama chart.update() - apenas limpa estado
      return
    }

    // Verifica se está dentro da área do gráfico
    const isInsideChart =
      x >= chart.chartArea.left &&
      x <= chart.chartArea.right &&
      y >= chart.chartArea.top &&
      y <= chart.chartArea.bottom

    if (isDragging.value) {
      // Durante drag, permite movimento mesmo fora da área do gráfico (mas dentro do canvas)
      if (isInsideCanvas) {
        try {
          const dataIndex = chart.scales.x.getValueForPixel(x)
          if (typeof dataIndex === 'number' && !isNaN(dataIndex)) {
            const roundedIndex = Math.round(dataIndex)
            // Garante que o índice está dentro dos limites
            const clampedIndex = Math.max(
              0,
              Math.min(roundedIndex, props.data.length - 1)
            )
            dragEndIndex.value = clampedIndex
            // NÃO chama chart.update() - deixa o plugin renderizar
          }
        } catch {
          // Ignora erros silenciosamente
        }
      }
      event.preventDefault()
    } else if (isInsideChart) {
      // Modo hover normal - só ativa se estiver dentro da área do gráfico
      try {
        const dataIndex = chart.scales.x.getValueForPixel(x)
        if (typeof dataIndex === 'number' && !isNaN(dataIndex)) {
          const roundedIndex = Math.round(dataIndex)
          if (roundedIndex >= 0 && roundedIndex < props.data.length) {
            isHovering.value = true
            hoverIndex.value = roundedIndex
            // NÃO chama chart.update() - deixa o plugin renderizar
          } else {
            isHovering.value = false
            hoverIndex.value = null
            // NÃO chama chart.update() - deixa o plugin renderizar
          }
        }
      } catch {
        // Ignora erros silenciosamente
      }
    } else {
      // Fora da área do gráfico e não arrastando - limpa hover mas não atualiza chart
      isHovering.value = false
      hoverIndex.value = null
    }
  }

  const handleMouseLeave = () => {
    // Remove tooltip quando sair do canvas
    isHovering.value = false
    hoverIndex.value = null

    // Se não estiver arrastando, limpa o estado de drag também
    if (!isDragging.value) {
      dragStartIndex.value = null
      dragEndIndex.value = null
    }
    // NÃO chama chart.update() - deixa o plugin lidar com a limpeza visual
  }

  const handleMouseUp = () => {
    if (isDragging.value) {
      // Usa um delay para garantir estabilidade
      setTimeout(() => {
        isDragging.value = false
        dragStartIndex.value = null
        dragEndIndex.value = null
        // Limpa também o estado de hover para evitar que a linha volte
        isHovering.value = false
        hoverIndex.value = null
        // NÃO chama chart.update() - deixa o plugin lidar com a limpeza visual
      }, 150)
    }
  }

  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('mouseleave', handleMouseLeave)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  // Retorna função de limpeza
  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown)
    canvas.removeEventListener('mouseleave', handleMouseLeave)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
}

const hoverLinePlugin = {
  id: 'hover-line-plugin',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterDraw: (chart: any) => {
    // Validações de segurança
    if (
      !chart ||
      !chart.ctx ||
      !chart.chartArea ||
      !chart.scales ||
      !chart.scales.x
    ) {
      return
    }

    const {
      ctx,
      chartArea: { top, bottom },
      scales: { x },
    } = chart

    // Mais validações
    if (
      !ctx ||
      !top ||
      !bottom ||
      !x ||
      typeof x.getPixelForValue !== 'function'
    ) {
      return
    }

    try {
      // Desenha linha vertical durante hover (mas não durante drag)
      if (isHovering.value && hoverIndex.value !== null && !isDragging.value) {
        const xCoor = x.getPixelForValue(hoverIndex.value)
        if (typeof xCoor !== 'number' || isNaN(xCoor)) {
          return
        }

        const backgroundColor = props.colors[0]
        const gradientBg = ctx.createLinearGradient(0, bottom, 0, top)

        gradientBg.addColorStop(1, transparentize(backgroundColor, 1))
        gradientBg.addColorStop(0.5, transparentize(backgroundColor, 0))
        gradientBg.addColorStop(0, transparentize(backgroundColor, 1))

        ctx.save()
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = gradientBg
        ctx.moveTo(xCoor, top)
        ctx.lineTo(xCoor, bottom)
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
      }

      // Desenha overlay de opacidade durante drag
      if (
        isDragging.value &&
        dragStartIndex.value !== null &&
        dragEndIndex.value !== null
      ) {
        const startIdx = Math.min(dragStartIndex.value, dragEndIndex.value)
        const endIdx = Math.max(dragStartIndex.value, dragEndIndex.value)

        const startX = x.getPixelForValue(startIdx)
        const endX = x.getPixelForValue(endIdx)

        if (
          typeof startX !== 'number' ||
          typeof endX !== 'number' ||
          isNaN(startX) ||
          isNaN(endX)
        ) {
          return
        }

        ctx.save()

        // Aplica opacidade reduzida apenas nas áreas fora da seleção
        // Área esquerda
        if (startX > chart.chartArea.left) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
          ctx.fillRect(
            chart.chartArea.left,
            top,
            startX - chart.chartArea.left,
            bottom - top
          )
        }

        // Área direita
        if (endX < chart.chartArea.right) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
          ctx.fillRect(endX, top, chart.chartArea.right - endX, bottom - top)
        }

        // Adiciona uma borda sutil na área selecionada
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.strokeRect(startX, top, endX - startX, bottom - top)

        ctx.restore()
      }
    } catch {
      // Ignora erros silenciosamente para evitar crashes
    }
  },
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  hoverLinePlugin
)

// Computed para dados do gráfico
const chartData = computed(() => {
  return {
    labels: props.data.map((item) => item.date),
    datasets: [
      {
        data: props.data.map((item) => item.value),
        label: props.legend[0]?.label || 'Preço',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        backgroundColor: (context: any) => {
          const chart = context.chart
          const { ctx, chartArea } = chart

          if (!chartArea) return null

          const gradientBg = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          )

          gradientBg.addColorStop(1, transparentize(props.colors[0], 0.7))
          gradientBg.addColorStop(0.3, transparentize(props.colors[0], 1))

          return gradientBg
        },
        borderWidth: 1.5,
        fill: true,
        borderColor: props.colors[0],
        pointHitRadius: 10,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointBackgroundColor: props.colors[0],
        pointBorderWidth: 3,
        pointHoverBorderWidth: 10,
        pointHoverBorderColor: transparentize(props.colors[0], 0.9),
        tension: 0.1,
      },
    ],
  }
})

// Opções do gráfico
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        autoSkip: true,
        autoSkipPadding: 8,
        maxRotation: 0,
        minRotation: 0,
        font: {
          size: 13,
        },
        color: 'rgba(255, 255, 255, 0.7)',
        maxTicksLimit: 10,
      },
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        maxTicksLimit: 5,
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 13,
        },
        callback: function (value: number) {
          return `R$ ${Number(value).toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`
        },
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
}))

// Lifecycle hooks para configurar eventos
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
</script>

<template>
  <div
    class="relative flex h-full w-full flex-col gap-6"
    @mouseleave="
      () => {
        isHovering = false
        hoverIndex = null
      }
    "
  >
    <div :style="{ height: `${height}px` }" class="w-full">
      <Line ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>

    <!-- Tooltip dinâmico -->
    <div
      v-if="(isHovering || isDragging) && tooltipData"
      class="pointer-events-none fixed z-10 rounded-lg bg-black/30 px-3 py-2 backdrop-blur-md transition-all duration-150"
      :style="{
        left: `${tooltipPosition.x + 10}px`,
        top: `${tooltipPosition.y - 60}px`,
      }"
    >
      <div class="flex gap-3">
        <div
          class="mt-1 h-3 w-3 rounded-full"
          :style="{ backgroundColor: tooltipData.color }"
        />
        <div class="flex flex-col gap-1">
          <span class="text-[13px] text-white">
            {{ tooltipData.label }}
          </span>
          <span class="text-[13px] font-light text-white/70">
            {{ tooltipData.value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style module>
.chart {
  width: 100% !important;
}
</style>

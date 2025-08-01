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
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import Legend from './Legend.vue'

interface IChartDataPoint {
  date: string;
  value: number;
  timestamp: number;
}

interface IChartLegendItem {
  label: string;
  color: string;
  value?: string | number;
}

interface Props {
  data: IChartDataPoint[];
  colors?: string[];
  legend?: IChartLegendItem[];
  height?: number;
  showLegend?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => ['#04CE00'],
  legend: () => [],
  height: 300,
  showLegend: true
});

// Estados para funcionalidade de arrastar
const isDragging = ref(false)
const dragStartIndex = ref<number | null>(null)
const dragEndIndex = ref<number | null>(null)

// Referência para o chart
const chartRef = ref<InstanceType<typeof Line> | null>(null)
const chartInstance = ref<ChartJS | null>(null)
let cleanupEvents: (() => void) | null = null

// Função para configurar event listeners do canvas
const setupCanvasEvents = (chart: ChartJS) => {
  const canvas = chart.canvas
  
  const handleMouseDown = (event: MouseEvent) => {
    const canvasPosition = canvas.getBoundingClientRect()
    const x = event.clientX - canvasPosition.left
    
    if (x >= chart.chartArea.left && x <= chart.chartArea.right) {
      const dataIndex = chart.scales.x.getValueForPixel(x)
      if (typeof dataIndex === 'number') {
        const roundedIndex = Math.round(dataIndex)
        
        if (roundedIndex >= 0 && roundedIndex < props.data.length) {
          isDragging.value = true
          dragStartIndex.value = roundedIndex
          dragEndIndex.value = roundedIndex
          
          chart.update('none')
          event.preventDefault()
        }
      }
    }
  }
  
  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value) return
    
    const canvasPosition = canvas.getBoundingClientRect()
    const x = event.clientX - canvasPosition.left
    
    const dataIndex = chart.scales.x.getValueForPixel(x)
    if (typeof dataIndex === 'number') {
      const roundedIndex = Math.round(dataIndex)
      
      if (roundedIndex >= 0 && roundedIndex < props.data.length) {
        dragEndIndex.value = roundedIndex
        chart.update('none')
      }
    }
    event.preventDefault()
  }
  
  const handleMouseUp = () => {
    if (isDragging.value) {
      setTimeout(() => {
        isDragging.value = false
        dragStartIndex.value = null
        dragEndIndex.value = null
        chart.update('none')
      }, 100)
    }
  }
  
  canvas.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  
  // Retorna função de limpeza
  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
}

// Computed para dados da legenda - dinamico baseado no estado de drag
const legendData = computed(() => {
  if (!isDragging.value || dragStartIndex.value === null || dragEndIndex.value === null) {
    return props.legend
  }

  // Durante o drag, mostra informações da seleção
  const startIdx = Math.min(dragStartIndex.value, dragEndIndex.value)
  const endIdx = Math.max(dragStartIndex.value, dragEndIndex.value)
  
  if (startIdx === endIdx || !props.data[startIdx] || !props.data[endIdx]) {
    return props.legend
  }

  const startData = props.data[startIdx]
  const endData = props.data[endIdx]
  const change = endData.value - startData.value
  const changePercent = (change / startData.value) * 100

  return [{
    ...props.legend[0],
    label: `${startData.date} → ${endData.date}`,
    value: `${change >= 0 ? '+' : ''}R$ ${change.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2 
    })} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`,
    color: change >= 0 ? '#04CE00' : '#FF4757'
  }]
})

function transparentize(value: string, opacity: number) {
  const alpha = opacity === undefined ? 0.5 : 1 - opacity
  return colorLib(value).alpha(alpha).rgbString()
}

const hoverLinePlugin = {
  id: 'hover-line-plugin',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterDraw: (chart: any) => {
    const {
      ctx,
      tooltip,
      chartArea: { top, bottom },
      scales: { x },
    } = chart

    if (tooltip._active.length > 0) {
      const xCoor = x.getPixelForValue(tooltip.dataPoints[0].dataIndex)
      const backgroundColor = tooltip.labelColors[0].borderColor
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
    }

    // Desenha área de seleção durante drag
    if (isDragging.value && dragStartIndex.value !== null && dragEndIndex.value !== null) {
      const startIdx = Math.min(dragStartIndex.value, dragEndIndex.value)
      const endIdx = Math.max(dragStartIndex.value, dragEndIndex.value)
      
      const startX = x.getPixelForValue(startIdx)
      const endX = x.getPixelForValue(endIdx)
      
      ctx.save()
      ctx.fillStyle = 'rgba(4, 206, 0, 0.1)'
      ctx.fillRect(startX, top, endX - startX, bottom - top)
      
      ctx.strokeStyle = 'rgba(4, 206, 0, 0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.strokeRect(startX, top, endX - startX, bottom - top)
      ctx.restore()
    }
  },
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  hoverLinePlugin
)

// Computed para dados do gráfico
const chartData = computed(() => {
  return {
    labels: props.data.map(item => item.date),
    datasets: [{
      data: props.data.map(item => item.value),
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
      borderWidth: 3,
      fill: true,
      borderColor: props.colors[0],
      pointHitRadius: 20,
      pointRadius: 0,
      pointHoverRadius: 8,
      pointBackgroundColor: props.colors[0],
      pointBorderWidth: 0,
      pointHoverBorderWidth: 50,
      pointHoverBorderColor: transparentize(props.colors[0], 0.9),
      tension: 0.1,
    }],
  }
})

// Tooltip customizado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getOrCreateTooltip = (chart: any) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div')

  if (!tooltipEl) {
    tooltipEl = document.createElement('div')
    tooltipEl.style.opacity = '1'
    tooltipEl.style.pointerEvents = 'none'
    tooltipEl.style.position = 'absolute'
    tooltipEl.style.transform = 'translate(-50%, 0)'
    tooltipEl.style.transition = 'all .1s ease'

    const table = document.createElement('table')
    table.style.margin = '0px'

    tooltipEl.appendChild(table)
    chart.canvas.parentNode.appendChild(tooltipEl)
  }

  return tooltipEl
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const externalTooltipHandler = (context: any) => {
  const { chart, tooltip } = context
  const tooltipEl = getOrCreateTooltip(chart)

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0'
    return
  }

  if (tooltip.body) {
    const dataIndex = tooltip.dataPoints[0].dataIndex
    const dataPoint = props.data[dataIndex]
    
    const tooltipDiv = document.createElement('div')
    tooltipDiv.style.backgroundColor = '#1F2937'
    tooltipDiv.classList.add(
      'rounded-lg',
      'min-w-max',
      'flex',
      'flex-col',
      'gap-1',
      'px-3',
      'py-2',
      'border',
      'border-white/10'
    )

    const valueSpan = document.createElement('span')
    valueSpan.classList.add('text-sm', 'font-semibold', 'text-white')
    valueSpan.textContent = `R$ ${dataPoint.value.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`

    const dateSpan = document.createElement('span')
    dateSpan.classList.add('text-xs', 'text-white/70')
    dateSpan.textContent = dataPoint.date

    tooltipDiv.appendChild(valueSpan)
    tooltipDiv.appendChild(dateSpan)

    tooltipEl.innerHTML = ''
    tooltipEl.appendChild(tooltipDiv)
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas

  tooltipEl.style.opacity = '1'
  tooltipEl.style.left = positionX + tooltip.caretX + 'px'
  tooltipEl.style.top = positionY + tooltip.caretY - 80 + 'px'
}

// Referência para o chart
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
        color: 'white',
        autoSkip: true,
        autoSkipPadding: 8,
        maxRotation: 0,
        minRotation: 0,
        font: {
          size: 12,
        },
        maxTicksLimit: 8,
      },
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        maxTicksLimit: 6,
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 11,
        },
        callback: function(value: number) {
          return `R$ ${Number(value).toLocaleString('pt-BR', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
          })}`
        },
      },
    },
  },
  plugins: {
    tooltip: {
      enabled: !isDragging.value,
      external: externalTooltipHandler,
    },
    legend: {
      display: false,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onHover: (event: any, _elements: any) => {
    if (isDragging.value) return // Desabilita hover durante drag

    const points = event.chart.getElementsAtEventForMode(
      event,
      'nearest',
      { intersect: true },
      false
    )

    if (points.length) {
      const colorArray = []
      const datapoint = points[0].index
      const borderColor = event.chart.data.datasets[0].borderColor

      for (let i = 0; i < event.chart.data.datasets[0].data.length; i++) {
        if (datapoint === i) {
          colorArray.push(borderColor)
        } else {
          colorArray.push('white')
        }
      }

      event.chart.config.options.scales.x.ticks.color = colorArray
      event.chart.update('none')
    } else {
      event.chart.config.options.scales.x.ticks.color = 'white'
      event.chart.update('none')
    }
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
  <div class="flex h-full w-full flex-col gap-6">
    <div :style="{ height: `${height}px` }" class="w-full">
      <Line 
        ref="chartRef"
        :data="chartData" 
        :options="chartOptions"
      />
    </div>
    <div v-if="showLegend && legendData.length > 0" class="flex w-full justify-end">
      <Legend :legend-items="legendData" />
    </div>
  </div>
</template>

<style module>
.chart {
  width: 100% !important;
}
</style>

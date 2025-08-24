<template>
  <div
    class="graph relative flex h-full w-full flex-col gap-6"
    @mouseleave="onRootMouseLeave"
  >
    <div :style="{ height: `${height}px` }" class="w-full">
      <Line
        ref="chartRef"
        :data="chartData"
        :options="chartOptions"
        :plugins="localPlugins"
      />
    </div>

    <!-- Tooltip dinâmico -->
    <div
      v-if="(isHovering || isDragging) && tooltipData"
      class="pointer-events-none fixed z-10 rounded-lg px-3 py-2 backdrop-blur-md transition-all duration-150 dark:bg-black/30"
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
          <span class="text-[13px]">{{ tooltipData.label }}</span>
          <span class="text-[13px] font-light">{{ tooltipData.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import colorLib from '@kurkle/color'
import type { Chart as ChartJS, Plugin } from 'chart.js'
import {
  Chart as ChartCore,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { getRelativePosition } from 'chart.js/helpers'

/* ========== Tipos ========== */
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
  loading?: boolean
}

/* ========== Props/Defaults ========== */
const props = withDefaults(defineProps<Props>(), {
  colors: () => ['#04CE00'],
  legend: () => [],
  height: 300,
  showLegend: true,
  loading: false,
})

function getIndexFromEvt(chart: ChartJS, e: MouseEvent) {
  // posição relativa ao canvas, já corrigida por DPR/scroll
  const pos = getRelativePosition(e, chart)
  // @ts-expect-error: tipos internos do Chart.js
  const { chartArea, scales } = chart
  const xScale = scales?.x
  if (!xScale || !chartArea) return null

  // só considera dentro da área útil do gráfico
  const insideChart =
    pos.x >= chartArea.left &&
    pos.x <= chartArea.right &&
    pos.y >= chartArea.top &&
    pos.y <= chartArea.bottom
  if (!insideChart) return null

  const idx = xScale.getValueForPixel(pos.x)
  return typeof idx === 'number' && !Number.isNaN(idx)
    ? Math.max(0, Math.min(Math.round(idx), props.data.length - 1))
    : null
}

/* ========== Utils ========== */
const BLACK_60 = 'rgba(0, 0, 0, 0.6)'
function transparentize(hex: string, opacity: number) {
  const alpha = opacity === undefined ? 0.5 : 1 - opacity
  return colorLib(hex).alpha(alpha).rgbString()
}
const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(n, max))

/* ========== Estados de interação ========== */
const isDragging = ref(false)
const dragStartIndex = ref<number | null>(null)
const dragEndIndex = ref<number | null>(null)

const isHovering = ref(false)
const hoverIndex = ref<number | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

/* ========== Tooltip dinâmico (mesmo resultado) ========== */
const tooltipData = computed(() => {
  if (
    isDragging.value &&
    dragStartIndex.value !== null &&
    dragEndIndex.value !== null
  ) {
    const startIdx = Math.min(dragStartIndex.value, dragEndIndex.value)
    const endIdx = Math.max(dragStartIndex.value, dragEndIndex.value)
    if (startIdx === endIdx || !props.data[startIdx] || !props.data[endIdx])
      return null

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
    const p = props.data[hoverIndex.value]
    return {
      label: p.date,
      value: `R$ ${p.value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      color: props.colors[0],
    }
  }
  return null
})

/* ========== Cor dinâmica (mesmo resultado) ========== */
const dynamicColor = computed(() => {
  if (
    isDragging.value &&
    dragStartIndex.value !== null &&
    dragEndIndex.value !== null
  ) {
    const startIdx = Math.min(dragStartIndex.value, dragEndIndex.value)
    const endIdx = Math.max(dragStartIndex.value, dragEndIndex.value)
    if (props.data[startIdx] && props.data[endIdx]) {
      return props.data[endIdx].value >= props.data[startIdx].value
        ? '#04CE00'
        : '#FF4757'
    }
  }
  return props.colors[0]
})

/* ========== Chart refs/instância ========== */
const chartRef = ref<InstanceType<typeof Line> | null>(null)
const chartInstance = ref<ChartJS | null>(null)
let removeCanvasEvents: (() => void) | null = null

/* ========== Eventos do canvas (com cleanup) ========== */
function setupCanvasEvents(chart: ChartJS) {
  const canvas = chart.canvas

  const onMouseDown = (e: MouseEvent) => {
    const idx = getIndexFromEvt(chart, e)
    if (idx === null) return
    isDragging.value = true
    dragStartIndex.value = idx
    dragEndIndex.value = idx
    e.preventDefault()
  }

  const onMouseMove = (e: MouseEvent) => {
    tooltipPosition.value = { x: e.clientX, y: e.clientY }

    if (isDragging.value) {
      const idx = getIndexFromEvt(chart, e)
      if (idx !== null) dragEndIndex.value = idx
      e.preventDefault()
      return
    }

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const insideCanvas =
      x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height
    if (!insideCanvas) {
      isHovering.value = false
      hoverIndex.value = null
      return
    }

    const idx = getIndexFromEvt(chart, e)
    if (idx !== null) {
      isHovering.value = true
      hoverIndex.value = idx
    } else {
      isHovering.value = false
      hoverIndex.value = null
    }
  }

  const onMouseLeave = () => {
    isHovering.value = false
    hoverIndex.value = null
    if (!isDragging.value) {
      dragStartIndex.value = null
      dragEndIndex.value = null
    }
  }

  const onMouseUp = () => {
    if (!isDragging.value) return
    // Mesmo comportamento: pequeno delay para “concluir” seleção
    setTimeout(() => {
      isDragging.value = false
      dragStartIndex.value = null
      dragEndIndex.value = null
      isHovering.value = false
      hoverIndex.value = null
    }, 150)
  }

  const onScroll = () => {
    // Oculta tooltip durante scroll (mesmo resultado do seu código)
    isHovering.value = false
    hoverIndex.value = null
    isDragging.value = false
    dragStartIndex.value = null
    dragEndIndex.value = null
  }

  canvas.addEventListener('mousedown', onMouseDown)
  canvas.addEventListener('mouseleave', onMouseLeave)
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  window.addEventListener('scroll', onScroll, { passive: true })

  return () => {
    canvas.removeEventListener('mousedown', onMouseDown)
    canvas.removeEventListener('mouseleave', onMouseLeave)
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('scroll', onScroll)
  }
}

/* ========== Plugin da linha/seleção (tipado) ========== */
const hoverLinePlugin: Plugin<'line'> = {
  id: 'hover-line-plugin',
  afterDraw: (chart) => {
    // Garantias de segurança
    // @ts-expect-error tipos internos do Chart.js
    const { ctx, chartArea, scales } = chart || {}
    if (!ctx || !chartArea || !scales?.x) return

    const { top, bottom, left, right } = chartArea
    const xScale = scales.x

    try {
      // Linha de hover
      if (isHovering.value && hoverIndex.value !== null && !isDragging.value) {
        const xCoor = xScale.getPixelForValue(hoverIndex.value)
        if (typeof xCoor !== 'number' || Number.isNaN(xCoor)) return

        const bg = ctx.createLinearGradient(0, bottom, 0, top)
        bg.addColorStop(1, transparentize(dynamicColor.value, 1))
        bg.addColorStop(0.5, transparentize(dynamicColor.value, 0))
        bg.addColorStop(0, transparentize(dynamicColor.value, 1))

        ctx.save()
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = bg
        ctx.moveTo(xCoor, top)
        ctx.lineTo(xCoor, bottom)
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
      }

      // Seleção por drag
      if (
        isDragging.value &&
        dragStartIndex.value !== null &&
        dragEndIndex.value !== null
      ) {
        const startIdx = Math.min(dragStartIndex.value, dragEndIndex.value)
        const endIdx = Math.max(dragStartIndex.value, dragEndIndex.value)

        const startX = xScale.getPixelForValue(startIdx)
        const endX = xScale.getPixelForValue(endIdx)
        if (
          [startX, endX].some((v) => typeof v !== 'number' || Number.isNaN(v))
        )
          return

        const startData = props.data[startIdx]
        const endData = props.data[endIdx]
        const isPositive = endData.value >= startData.value
        const selectionColor = isPositive ? '#04CE00' : '#FF4757'

        ctx.save()
        // Áreas escurecidas
        if (startX > left) {
          ctx.fillStyle = BLACK_60
          ctx.fillRect(left, top, startX - left, bottom - top)
        }
        if (endX < right) {
          ctx.fillStyle = BLACK_60
          ctx.fillRect(endX, top, right - endX, bottom - top)
        }
        // Overlay sutil na área selecionada
        ctx.fillStyle = transparentize(selectionColor, 0.9)
        ctx.fillRect(startX, top, endX - startX, bottom - top)
        ctx.restore()
      }
    } catch {
      // evita crash silenciosamente (mantendo seu comportamento)
    }
  },
}

/* ========== Registro único do Chart.js (evita duplicatas em HMR/SSR) ========== */
const registered = (ChartCore as any)._adapters?._customRegisteredOnce
if (!registered) {
  ChartCore.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Filler
  )
  ;(ChartCore as any)._adapters = { _customRegisteredOnce: true }
}

/* ========== Data/Options (mesmo visual) ========== */
const chartData = computed(() => ({
  labels: props.data.map((d) => d.date),
  datasets: [
    {
      data: props.data.map((d) => d.value),
      label: props.legend[0]?.label || 'Preço',
      backgroundColor: (ctx: any) => {
        const { chart } = ctx
        const area = chart?.chartArea
        if (!area) return null
        const g = chart.ctx.createLinearGradient(0, area.bottom, 0, area.top)
        g.addColorStop(1, transparentize(dynamicColor.value, 0.7))
        g.addColorStop(0.3, transparentize(dynamicColor.value, 1))
        return g
      },
      borderWidth: 1.5,
      fill: true,
      borderColor: dynamicColor.value,
      pointHitRadius: 10,
      pointRadius: 0,
      pointHoverRadius: 8,
      pointBackgroundColor: dynamicColor.value,
      pointBorderWidth: 3,
      pointHoverBorderWidth: 10,
      pointHoverBorderColor: transparentize(dynamicColor.value, 0.9),
      tension: 0.1,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' as const },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        autoSkip: true,
        autoSkipPadding: 8,
        maxRotation: 45,
        minRotation: 0,
        font: { size: 13 },
        maxTicksLimit: 15,
        padding: 20,
      },
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      ticks: {
        maxTicksLimit: 5,
        font: { size: 13 },
        callback: (v: number) =>
          `R$ ${Number(v).toLocaleString('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`,
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
    colors: { forceOverride: true },
  },
}))

/* ========== Lifecycle ========== */
onMounted(async () => {
  await nextTick()
  const chart = chartRef.value?.chart
  if (!chart) return
  chartInstance.value = chart
  removeCanvasEvents = setupCanvasEvents(chart)
})

onUnmounted(() => {
  if (removeCanvasEvents) {
    removeCanvasEvents()
    removeCanvasEvents = null
  }
})

/* ========== Handlers do template ========== */
const onRootMouseLeave = () => {
  isHovering.value = false
  hoverIndex.value = null
}

const localPlugins = [hoverLinePlugin]
</script>

<style scoped>
.graph:deep(canvas) {
  width: 100% !important;
}
</style>

<template>
  <div
    class="graph relative flex h-full w-full flex-col gap-6"
    @mouseleave="onRootMouseLeave"
  >
    <!-- Container do gráfico -->
    <div
      :style="{ height: `${height}px` }"
      class="relative w-full overflow-hidden rounded-lg"
    >
      <!-- Estado de carregamento -->
      <Transition name="fade">
        <div
          v-if="loading"
          class="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-black/50"
        >
          <div class="flex flex-col items-center gap-3">
            <div
              class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-400"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400"
              >Carregando...</span
            >
          </div>
        </div>
      </Transition>

      <!-- Gráfico -->
      <Line
        ref="chartRef"
        :data="chartData"
        :options="chartOptions"
        :plugins="localPlugins"
      />
    </div>

    <!-- Tooltip dinâmico -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="showTooltip && tooltipData"
          class="pointer-events-none fixed z-50 rounded-lg px-3 py-2 backdrop-blur-md transition-all duration-100 will-change-transform"
          :class="tooltipClasses"
          :style="tooltipStyle"
          :aria-hidden="!showTooltip"
        >
          <div class="flex min-w-0 flex-col">
            <span class="truncate text-[15px] font-medium">{{
              tooltipData.value
            }}</span>
            <span class="truncate text-[13px] opacity-60">{{
              tooltipData.label
            }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  reactive,
  shallowRef,
  type Ref,
} from 'vue'
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

interface ITooltipData {
  label: string
  value: string
  color: string
}

interface IChartMarker {
  name: string
  value: number
  color: string
}

interface IDragState {
  startIndex: number | null
  endIndex: number | null
}

interface IHoverState {
  index: number | null
  position: { x: number; y: number }
}

type ChartPointLike = { x: number; y: number }
type ChartFillStyle = CanvasGradient | string

interface IClosingFillGradients {
  positive: ChartFillStyle
  negative: ChartFillStyle
}

interface Props {
  data: IChartDataPoint[]
  colors?: string[]
  legend?: IChartLegendItem[]
  height?: number
  showLegend?: boolean
  loading?: boolean
  locale?: string
  currency?: string
  markers?: IChartMarker[]
}

/* ========== Configurações padrão ========== */
const DEFAULTS = {
  COLORS: ['#22c55e'],
  HEIGHT: 300,
  LOCALE: 'pt-BR',
  CURRENCY: 'R$',
  LOADING_ANIMATION_INTERVAL: 800,
  DRAG_END_DELAY: 150,
  SCROLL_DEBOUNCE: 100,
  POSITIVE_COLOR: '#05df72',
  NEGATIVE_COLOR: '#df0505',
  GRAY_COLOR: '#6B7280',
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => ['#22c55e'],
  legend: () => [],
  height: 300,
  showLegend: true,
  loading: false,
  locale: 'pt-BR',
  currency: 'R$',
  markers: () => [],
})

/* ========== Validação de dados ========== */
const isDataValid = computed(() => {
  return (
    Array.isArray(props.data) &&
    props.data.length > 0 &&
    props.data.every(
      (d) =>
        d &&
        typeof d.value === 'number' &&
        !Number.isNaN(d.value) &&
        typeof d.date === 'string'
    )
  )
})

/* ========== Estados ========== */
const dragState = reactive<IDragState>({
  startIndex: null,
  endIndex: null,
})

const hoverState = reactive<IHoverState>({
  index: null,
  position: { x: 0, y: 0 },
})

const isDragging = computed({
  get: () => dragState.startIndex !== null,
  set: (value) => {
    if (!value) {
      dragState.startIndex = null
      dragState.endIndex = null
    }
  },
})

const isHovering = computed({
  get: () => hoverState.index !== null,
  set: (value) => {
    if (!value) {
      hoverState.index = null
    }
  },
})

/* ========== Dados de loading ========== */
const loadingData = ref<IChartDataPoint[]>([])
const loadingAnimationFrame: Ref<number | null> = ref(null)
const loadingTimeoutId: Ref<NodeJS.Timeout | null> = ref(null)

function generateLoadingData(): IChartDataPoint[] {
  const now = new Date()
  const data: IChartDataPoint[] = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const baseValue = 1000 + Math.sin(i * 0.1) * 200
    const randomVariation = (Math.random() - 0.5) * 100
    const value = Math.max(800, baseValue + randomVariation)

    data.push({
      date: date.toLocaleDateString(props.locale, {
        day: '2-digit',
        month: '2-digit',
      }),
      value: Math.round(value),
      timestamp: date.getTime(),
    })
  }

  return data
}

function animateLoadingData(): void {
  if (!props.loading) return

  loadingData.value = generateLoadingData()

  loadingAnimationFrame.value = requestAnimationFrame(() => {
    loadingTimeoutId.value = setTimeout(() => {
      animateLoadingData()
    }, DEFAULTS.LOADING_ANIMATION_INTERVAL)
  })
}

function stopLoadingAnimation(): void {
  if (loadingAnimationFrame.value !== null) {
    cancelAnimationFrame(loadingAnimationFrame.value)
    loadingAnimationFrame.value = null
  }
  if (loadingTimeoutId.value !== null) {
    clearTimeout(loadingTimeoutId.value)
    loadingTimeoutId.value = null
  }
}

/* ========== Utilitários ========== */
function transparentize(hex: string, opacity: number): string {
  try {
    const alpha = opacity === undefined ? 0.5 : 1 - opacity
    return colorLib(hex).alpha(alpha).rgbString()
  } catch {
    return `rgba(0, 0, 0, ${1 - opacity})`
  }
}

function formatCurrency(value: number): string {
  try {
    return `${props.currency} ${value.toLocaleString(props.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  } catch {
    return `${props.currency} ${value.toFixed(2)}`
  }
}

function formatPercentage(value: number): string {
  try {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  } catch {
    return `${value}%`
  }
}

function parseNumericValue(value?: number | string | null): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null

  const sanitized = value.replace(/\s/g, '').replace(/[^\d,.-]/g, '')
  if (!sanitized) return null

  const commaIndex = sanitized.lastIndexOf(',')
  const dotIndex = sanitized.lastIndexOf('.')

  let normalized = sanitized
  if (commaIndex > dotIndex) {
    normalized = sanitized.replace(/\./g, '').replace(',', '.')
  } else if (dotIndex > commaIndex) {
    normalized = sanitized.replace(/,/g, '')
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function formatAxisCurrency(value: number): string {
  try {
    return `${props.currency} ${Number(value).toLocaleString(props.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  } catch {
    return `${props.currency} ${value}`
  }
}

function formatXAxisLabel(rawLabel: string): string {
  if (!rawLabel) return rawLabel

  const parsed = Date.parse(rawLabel)
  if (!Number.isNaN(parsed)) {
    try {
      return new Date(parsed).toLocaleDateString(props.locale, {
        day: '2-digit',
        month: props.locale === 'en-US' ? 'short' : '2-digit',
      })
    } catch {
      // fall through to default return
    }
  }

  return rawLabel
}

function formatTooltipDate(rawDate: string): string {
  if (!rawDate) return rawDate

  const monthNames = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ]

  const tryParse = (value: string): Date | null => {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed

    const slashMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
    if (slashMatch) {
      const [, dayStr, monthStr, yearStr] = slashMatch
      const day = Number(dayStr)
      const month = Number(monthStr) - 1
      const year = Number(yearStr.length === 2 ? `20${yearStr}` : yearStr)
      if (
        Number.isFinite(day) &&
        Number.isFinite(month) &&
        Number.isFinite(year) &&
        month >= 0 &&
        month < 12
      ) {
        const candidate = new Date(year, month, day)
        if (!Number.isNaN(candidate.getTime())) return candidate
      }
    }

    return null
  }

  const date = tryParse(rawDate)
  if (!date) return rawDate

  const day = date.getDate()
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()

  return `${day} de ${month} de ${year}`
}

function evaluateVariation(
  reference: number,
  data: IChartDataPoint[] | undefined | null
): { hasAbove: boolean; hasBelow: boolean } {
  const result = { hasAbove: false, hasBelow: false }

  if (!Number.isFinite(reference) || !Array.isArray(data) || data.length === 0) {
    return result
  }

  for (const point of data) {
    if (!point || typeof point.value !== 'number' || Number.isNaN(point.value)) {
      continue
    }

    if (point.value > reference) {
      result.hasAbove = true
    } else if (point.value < reference) {
      result.hasBelow = true
    }

    if (result.hasAbove && result.hasBelow) break
  }

  return result
}

function getIndexFromEvt(chart: ChartJS, e: MouseEvent): number | null {
  try {
    const pos = getRelativePosition(e, chart)
    const { chartArea, scales } = chart
    const xScale = scales?.x

    if (!xScale || !chartArea) return null

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
  } catch {
    return null
  }
}

/* ========== Tooltip computado ========== */
const tooltipData = computed<ITooltipData | null>(() => {
  try {
    // Estado de drag
    if (
      isDragging.value &&
      dragState.startIndex !== null &&
      dragState.endIndex !== null
    ) {
      const startIdx = Math.min(dragState.startIndex, dragState.endIndex)
      const endIdx = Math.max(dragState.startIndex, dragState.endIndex)

      const startData = props.data[startIdx]
      const endData = props.data[endIdx]

      if (!startData || !endData || startIdx === endIdx) return null

      const change = endData.value - startData.value
      const changePercent = (change / startData.value) * 100
      const isPositive = change >= 0

      return {
        label: `${formatTooltipDate(startData.date)} → ${formatTooltipDate(endData.date)}`,
        value: `${isPositive ? '+' : ''}${formatCurrency(change)} (${formatPercentage(changePercent)})`,
        color: isPositive ? DEFAULTS.POSITIVE_COLOR : DEFAULTS.NEGATIVE_COLOR,
      }
    }

    // Estado de hover
    if (isHovering.value && hoverState.index !== null && isDataValid.value) {
      const dataPoint = props.data[hoverState.index]
      if (!dataPoint) return null

      return {
        label: formatTooltipDate(dataPoint.date),
        value: formatCurrency(dataPoint.value),
        color: props.colors[0] || DEFAULTS.COLORS[0],
      }
    }

    return null
  } catch {
    return null
  }
})

const showTooltip = computed(() => {
  return (isHovering.value || isDragging.value) && tooltipData.value !== null
})

const tooltipStyle = computed(() => {
  if (!showTooltip.value) return {}

  return {
    left: `${hoverState.position.x + 10}px`,
    top: `${hoverState.position.y - 60}px`,
  }
})

const tooltipClasses = computed(() => {
  if (isDragging.value) {
    return 'bg-white/20'
  }
  return 'bg-gray-500/20 border-white border'
})

/* ========== Cor dinâmica ========== */
const dynamicColor = computed(() => {
  if (props.loading) return DEFAULTS.GRAY_COLOR

  if (
    isDragging.value &&
    dragState.startIndex !== null &&
    dragState.endIndex !== null
  ) {
    const startIdx = Math.min(dragState.startIndex, dragState.endIndex)
    const endIdx = Math.max(dragState.startIndex, dragState.endIndex)

    const startData = props.data[startIdx]
    const endData = props.data[endIdx]

    if (startData && endData) {
      return endData.value >= startData.value
        ? DEFAULTS.POSITIVE_COLOR
        : DEFAULTS.NEGATIVE_COLOR
    }
  }

  return props.colors[0] || DEFAULTS.COLORS[0]
})

const datasetStats = computed<{
  min: number
  max: number
  first: number
  last: number
} | null>(() => {
  if (!isDataValid.value || !Array.isArray(props.data) || props.data.length === 0)
    return null

  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  let first: number | null = null
  let last: number | null = null

  for (const point of props.data) {
    if (!point || typeof point.value !== 'number' || Number.isNaN(point.value))
      continue

    if (first === null) first = point.value
    last = point.value

    if (point.value < min) min = point.value
    if (point.value > max) max = point.value
  }

  if (
    first === null ||
    last === null ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return null
  }

  return { min, max, first, last }
})

const closingLineValue = computed<number | null>(() => {
  try {
    if (!isDataValid.value) return null

    const stats = datasetStats.value
    if (!stats) return null

    const legendValue = props.legend?.find(
      (item) =>
        typeof item.label === 'string' &&
        item.label.toLowerCase().includes('fechamento')
    )?.value

    const parsedLegend = parseNumericValue(legendValue ?? null)
    if (parsedLegend !== null) return parsedLegend

    const referenceCandidate = stats.last
    if (!Number.isFinite(referenceCandidate)) return null

    const variation = evaluateVariation(referenceCandidate, props.data)
    if (variation.hasAbove && variation.hasBelow) {
      return referenceCandidate
    }

    if (stats.last >= stats.first) {
      return stats.min - 1
    }

    return stats.max + 1
  } catch {
    return null
  }
})

const hasReferenceVariation = computed<boolean>(() => {
  if (!isDataValid.value) return false

  const reference = closingLineValue.value
  if (reference === null) return false

  const variation = evaluateVariation(reference, props.data)
  return variation.hasAbove && variation.hasBelow
})

const displayedData = computed(() => {
  if (props.loading && !isDataValid.value) {
    return loadingData.value
  }
  return props.data
})

const normalizedMarkers = computed<IChartMarker[]>(() => {
  if (!Array.isArray(props.markers)) return []
  return props.markers
    .map((marker) => {
      if (!marker || typeof marker !== 'object') return null
      const { name, value, color } = marker
      const hasValidName = typeof name === 'string' && name.trim().length > 0
      const numericValue =
        typeof value === 'number' && Number.isFinite(value) ? value : null
      const colorValue =
        typeof color === 'string' && color.trim().length > 0 ? color : null

      if (!hasValidName || numericValue === null || colorValue === null) {
        return null
      }

      return {
        name: name.trim(),
        value: numericValue,
        color: colorValue.trim(),
      }
    })
    .filter((marker): marker is IChartMarker => marker !== null)
})

const yAxisExtents = computed<{
  min: number
  max: number
} | null>(() => {
  const dataSource = displayedData.value
  if (!Array.isArray(dataSource) || dataSource.length === 0) return null

  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (const point of dataSource) {
    if (!point || typeof point.value !== 'number' || Number.isNaN(point.value))
      continue

    if (point.value < min) min = point.value
    if (point.value > max) max = point.value
  }

  const referenceValue = closingLineValue.value
  if (Number.isFinite(referenceValue)) {
    min = Math.min(min, referenceValue!)
    max = Math.max(max, referenceValue!)
  }

  const markers = normalizedMarkers.value
  if (Array.isArray(markers) && markers.length > 0) {
    for (const marker of markers) {
      if (typeof marker?.value === 'number' && Number.isFinite(marker.value)) {
        min = Math.min(min, marker.value)
        max = Math.max(max, marker.value)
      }
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return null

  const range = max - min
  if (range === 0) {
    const padding = Math.max(1, Math.abs(min) * 0.01)
    return {
      min: min - padding,
      max: max + padding,
    }
  }

  const padding = Math.max(Math.abs(range) * 0.05, 0.5)

  return {
    min: min - padding,
    max: max + padding,
  }
})

function fillRegionBetween(
  ctx: CanvasRenderingContext2D,
  pointA: ChartPointLike,
  pointB: ChartPointLike,
  closingY: number,
  orientation: 'above' | 'below',
  fillStyle: ChartFillStyle
): void {
  if (
    !pointA ||
    !pointB ||
    !Number.isFinite(pointA.x) ||
    !Number.isFinite(pointA.y) ||
    !Number.isFinite(pointB.x) ||
    !Number.isFinite(pointB.y) ||
    !Number.isFinite(closingY)
  ) {
    return
  }

  if (pointA.x === pointB.x && pointA.y === pointB.y) return

  const relevantY =
    orientation === 'below'
      ? Math.max(pointA.y, pointB.y)
      : Math.min(pointA.y, pointB.y)
  if (relevantY === closingY) return

  ctx.beginPath()
  ctx.moveTo(pointA.x, pointA.y)
  ctx.lineTo(pointB.x, pointB.y)
  ctx.lineTo(pointB.x, closingY)
  ctx.lineTo(pointA.x, closingY)
  ctx.closePath()
  ctx.fillStyle = fillStyle
  ctx.fill()
}

function drawClosingFillSegment(
  ctx: CanvasRenderingContext2D,
  pointA: ChartPointLike,
  pointB: ChartPointLike,
  valueA: number,
  valueB: number,
  closingValue: number,
  closingY: number,
  gradients: IClosingFillGradients
): 'above' | 'below' | 'mixed' {
  if (
    !Number.isFinite(valueA) ||
    !Number.isFinite(valueB) ||
    !Number.isFinite(closingValue)
  ) {
    return 'mixed'
  }

  const deltaA = valueA - closingValue
  const deltaB = valueB - closingValue

  if (deltaA === 0 && deltaB === 0) return 'mixed'

  if ((deltaA <= 0 && deltaB <= 0) || (deltaA >= 0 && deltaB >= 0)) {
    const targetOrientation = deltaA < 0 ? 'below' : 'above'
    const targetGradient =
      targetOrientation === 'below' ? gradients.negative : gradients.positive

    fillRegionBetween(
      ctx,
      pointA,
      pointB,
      closingY,
      targetOrientation,
      targetGradient
    )
    return targetOrientation
  }

  const denominator = valueB - valueA
  if (denominator === 0) return 'mixed'

  const t = (closingValue - valueA) / denominator
  if (!Number.isFinite(t)) return 'mixed'

  const clampedT = Math.max(0, Math.min(1, t))
  if (clampedT <= 0 || clampedT >= 1) {
    fillRegionBetween(
      ctx,
      pointA,
      pointB,
      closingY,
      deltaA < 0 ? 'below' : 'above'
    )
    return deltaA < 0 ? 'below' : 'above'
  }

  const intersectionPoint: ChartPointLike = {
    x: pointA.x + (pointB.x - pointA.x) * clampedT,
    y: closingY,
  }

  if (deltaA < 0) {
    fillRegionBetween(
      ctx,
      pointA,
      intersectionPoint,
      closingY,
      'below',
      gradients.negative
    )
    fillRegionBetween(
      ctx,
      intersectionPoint,
      pointB,
      closingY,
      'above',
      gradients.positive
    )
    return 'mixed'
  } else {
    fillRegionBetween(
      ctx,
      pointA,
      intersectionPoint,
      closingY,
      'above',
      gradients.positive
    )
    fillRegionBetween(
      ctx,
      intersectionPoint,
      pointB,
      closingY,
      'below',
      gradients.negative
    )
    return 'mixed'
  }
}

/* ========== Chart setup ========== */
const chartRef = shallowRef<InstanceType<typeof Line> | null>(null)
const chartInstance: Ref<ChartJS | null> = ref(null)
let removeCanvasEvents: (() => void) | null = null
let scrollDebounceTimer: NodeJS.Timeout | null = null

function setupCanvasEvents(chart: ChartJS): () => void {
  const canvas = chart.canvas

  // ========== Handlers de Mouse (Desktop) ==========
  const handleMouseDown = (e: MouseEvent): void => {
    if (props.loading || !isDataValid.value) return

    const idx = getIndexFromEvt(chart, e)
    if (idx === null) return

    dragState.startIndex = idx
    dragState.endIndex = idx
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent): void => {
    if (props.loading || !isDataValid.value) return

    hoverState.position = { x: e.clientX, y: e.clientY }

    if (isDragging.value) {
      const idx = getIndexFromEvt(chart, e)
      if (idx !== null) dragState.endIndex = idx
      e.preventDefault()
      return
    }

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const insideCanvas = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height

    if (!insideCanvas) {
      isHovering.value = false
      hoverState.index = null
      return
    }

    const idx = getIndexFromEvt(chart, e)
    if (idx !== null) {
      hoverState.index = idx
    } else {
      isHovering.value = false
      hoverState.index = null
    }
  }

  const handleMouseLeave = (): void => {
    isHovering.value = false
    hoverState.index = null
    if (!isDragging.value) {
      dragState.startIndex = null
      dragState.endIndex = null
    }
  }

  const handleMouseUp = (): void => {
    if (!isDragging.value) return

    setTimeout(() => {
      isDragging.value = false
      isHovering.value = false
      hoverState.index = null
    }, DEFAULTS.DRAG_END_DELAY)
  }

  // ========== Handlers de Touch (Mobile) ==========
  const handleTouchStart = (e: TouchEvent): void => {
    if (props.loading || !isDataValid.value) return

    // Se há 2 dedos, preparar para drag
    if (e.touches.length === 2) {
      // Ordenar os dedos por posição X (esquerda para direita)
      const touches = Array.from(e.touches)
      touches.sort((a, b) => a.clientX - b.clientX)

      const leftTouch = touches[0]
      const rightTouch = touches[1]

      const leftIdx = getIndexFromEvt(chart, {
        clientX: leftTouch.clientX,
        clientY: leftTouch.clientY,
      } as any)

      const rightIdx = getIndexFromEvt(chart, {
        clientX: rightTouch.clientX,
        clientY: rightTouch.clientY,
      } as any)

      if (leftIdx === null || rightIdx === null) return

      dragState.startIndex = leftIdx
      dragState.endIndex = rightIdx
      hoverState.position = { x: leftTouch.clientX, y: leftTouch.clientY }
      e.preventDefault()
      return
    }

    // Se há apenas 1 dedo, mostrar tooltip simples
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      hoverState.position = { x: touch.clientX, y: touch.clientY }

      const idx = getIndexFromEvt(chart, {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as any)

      if (idx !== null) {
        hoverState.index = idx
      }

      // NÃO previne o scroll aqui
      return
    }
  }

  const handleTouchMove = (e: TouchEvent): void => {
    if (props.loading || !isDataValid.value) return

    // Drag com 2 dedos
    if (e.touches.length === 2) {
      // Ordenar os dedos por posição X (esquerda para direita)
      const touches = Array.from(e.touches)
      touches.sort((a, b) => a.clientX - b.clientX)

      const leftTouch = touches[0]
      const rightTouch = touches[1]

      hoverState.position = { x: leftTouch.clientX, y: leftTouch.clientY }

      const rect = canvas.getBoundingClientRect()
      const xLeft = leftTouch.clientX - rect.left
      const yLeft = leftTouch.clientY - rect.top
      const xRight = rightTouch.clientX - rect.left
      const yRight = rightTouch.clientY - rect.top

      const insideCanvas =
        xLeft >= 0 &&
        xLeft <= rect.width &&
        yLeft >= 0 &&
        yLeft <= rect.height &&
        xRight >= 0 &&
        xRight <= rect.width &&
        yRight >= 0 &&
        yRight <= rect.height

      if (!insideCanvas) {
        isDragging.value = false
        dragState.startIndex = null
        dragState.endIndex = null
        return
      }

      const leftIdx = getIndexFromEvt(chart, {
        clientX: leftTouch.clientX,
        clientY: leftTouch.clientY,
      } as any)

      const rightIdx = getIndexFromEvt(chart, {
        clientX: rightTouch.clientX,
        clientY: rightTouch.clientY,
      } as any)

      if (isDragging.value) {
        if (leftIdx !== null) dragState.startIndex = leftIdx
        if (rightIdx !== null) dragState.endIndex = rightIdx
      }

      e.preventDefault()
      return
    }

    // Tooltip simples com 1 dedo
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      hoverState.position = { x: touch.clientX, y: touch.clientY }

      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      const insideCanvas =
        x >= 0 && x <= rect.width && y >= 0 && y <= rect.height

      if (!insideCanvas) {
        isHovering.value = false
        hoverState.index = null
        return
      }

      const idx = getIndexFromEvt(chart, {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as any)

      if (idx !== null) {
        hoverState.index = idx
      } else {
        isHovering.value = false
        hoverState.index = null
      }

      // NÃO previne o scroll aqui
      return
    }

    // Se há mais de 2 dedos, cancelar tudo
    if (e.touches.length > 2) {
      isHovering.value = false
      hoverState.index = null
      isDragging.value = false
      dragState.startIndex = null
      dragState.endIndex = null
    }
  }

  const handleTouchEnd = (e: TouchEvent): void => {
    // Se ainda há dedos no canvas, continuar
    if (e.touches.length > 0) return

    if (!isDragging.value && hoverState.index !== null) {
      // Se era apenas tooltip, manter por um tempo
      setTimeout(() => {
        if (e.touches.length === 0) {
          isHovering.value = false
          hoverState.index = null
        }
      }, 300)
      return
    }

    if (isDragging.value) {
      setTimeout(() => {
        isDragging.value = false
        isHovering.value = false
        hoverState.index = null
      }, DEFAULTS.DRAG_END_DELAY)
    }
  }

  const handleTouchCancel = (): void => {
    isHovering.value = false
    hoverState.index = null
    isDragging.value = false
    dragState.startIndex = null
    dragState.endIndex = null
  }

  // ========== Scroll ==========
  const handleScroll = (): void => {
    if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)

    scrollDebounceTimer = setTimeout(() => {
      isHovering.value = false
      isDragging.value = false
      hoverState.index = null
      scrollDebounceTimer = null
    }, DEFAULTS.SCROLL_DEBOUNCE)
  }

  // ========== Registrar Eventos ==========
  // Mouse events (desktop)
  canvas.addEventListener('mousedown', handleMouseDown)
  canvas.addEventListener('mouseleave', handleMouseLeave)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  // Touch events (mobile)
  canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
  canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
  canvas.addEventListener('touchend', handleTouchEnd, { passive: true })
  canvas.addEventListener('touchcancel', handleTouchCancel, { passive: true })

  // Scroll
  window.addEventListener('scroll', handleScroll, { passive: true })

  // ========== Cleanup ==========
  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown)
    canvas.removeEventListener('mouseleave', handleMouseLeave)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    canvas.removeEventListener('touchstart', handleTouchStart)
    canvas.removeEventListener('touchmove', handleTouchMove)
    canvas.removeEventListener('touchend', handleTouchEnd)
    canvas.removeEventListener('touchcancel', handleTouchCancel)

    window.removeEventListener('scroll', handleScroll)
    if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
  }
}

/* ========== Plugin do hover line ========== */
function getSegmentOrientation(index: number): 'above' | 'below' | 'mixed' {
  const orientations: ('above' | 'below' | 'mixed')[] | undefined = (
    chartInstance.value as any
  )?._segmentOrientations
  if (!orientations || orientations.length === 0) return 'mixed'

  const segmentIndex = Math.min(Math.max(index - 1, 0), orientations.length - 1)
  return orientations[segmentIndex] ?? 'mixed'
}

function dynamicLineColor(index: number, fallback = true): string {
  const orientation = getSegmentOrientation(index)
  if (orientation === 'above') return DEFAULTS.POSITIVE_COLOR
  if (orientation === 'below') return DEFAULTS.NEGATIVE_COLOR
  return fallback ? dynamicColor.value : 'rgba(148, 163, 184, 0.6)'
}

const hoverLinePlugin: Plugin<'line'> = {
  id: 'hover-line-plugin',
  afterDraw: (chart) => {
    try {
      const { ctx, chartArea, scales } = chart

      if (
        !ctx ||
        !chartArea ||
        !scales?.x ||
        !scales?.y ||
        !isDataValid.value
      ) {
        return
      }

      const { top, bottom, left, right } = chartArea
      const xScale = scales.x
      const yScale = scales.y

      // Linha do fechamento anterior
      const segmentOrientations: ('above' | 'below' | 'mixed')[] =
        (chart as any)._segmentOrientations ?? []

      if (
        !props.loading &&
        props.data.length > 0 &&
        hasReferenceVariation.value

      ) {
        const currentValue = props.data[props.data.length - 1].value
        const yPosition = yScale.getPixelForValue(currentValue)

        if (typeof yPosition === 'number' && !Number.isNaN(yPosition)) {
          ctx.save()

          // Linha tracejada
          ctx.beginPath()
          ctx.setLineDash([5, 5])
          ctx.lineWidth = 1.5
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
          ctx.moveTo(left, yPosition)
          ctx.lineTo(right, yPosition)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.closePath()

          if (!isHovering.value) {
            const formattedValue = formatCurrency(currentValue)
            const text = `Atual: ${formattedValue}`

            ctx.font = '12px sans-serif'
            ctx.textAlign = 'right'
            ctx.textBaseline = 'middle'

            const textMetrics = ctx.measureText(text)
            const textWidth = textMetrics.width
            const textHeight = 20
            const horizontalPadding = 10
            const verticalPadding = 6
            const cornerRadius = 12
            const boxHeight = textHeight + verticalPadding * 2

            const boxRight = right - 12
            const boxLeft = boxRight - textWidth - horizontalPadding * 2
            const boxTop = yPosition - boxHeight / 2
            const boxBottom = boxTop + boxHeight

            ctx.fillStyle = 'rgba(17, 24, 39, 0.65)'
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'
            ctx.lineWidth = 1

            ctx.beginPath()
            ctx.moveTo(boxLeft + cornerRadius, boxTop)
            ctx.lineTo(boxRight - cornerRadius, boxTop)
            ctx.quadraticCurveTo(
              boxRight,
              boxTop,
              boxRight,
              boxTop + cornerRadius
            )
            ctx.lineTo(boxRight, boxBottom - cornerRadius)
            ctx.quadraticCurveTo(
              boxRight,
              boxBottom,
              boxRight - cornerRadius,
              boxBottom
            )
            ctx.lineTo(boxLeft + cornerRadius, boxBottom)
            ctx.quadraticCurveTo(
              boxLeft,
              boxBottom,
              boxLeft,
              boxBottom - cornerRadius
            )
            ctx.lineTo(boxLeft, boxTop + cornerRadius)
            ctx.quadraticCurveTo(
              boxLeft,
              boxTop,
              boxLeft + cornerRadius,
              boxTop
            )
            ctx.closePath()
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = 'rgba(148, 163, 184, 1)'
            ctx.fillText(text, boxRight - horizontalPadding, yPosition)
          }

          ctx.restore()
        }
      }

      // Linha de hover
      if (isHovering.value && hoverState.index !== null && !isDragging.value) {
        const xCoor = xScale.getPixelForValue(hoverState.index)

        if (typeof xCoor === 'number' && !Number.isNaN(xCoor)) {
          ctx.save()
          ctx.beginPath()
          ctx.lineWidth = 1.5
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)'
          ctx.setLineDash([4, 4])
          ctx.moveTo(xCoor, top)
          ctx.lineTo(xCoor, bottom)
          ctx.stroke()
          ctx.closePath()
          ctx.restore()
        }
      }

      // Seleção por drag
      if (
        isDragging.value &&
        dragState.startIndex !== null &&
        dragState.endIndex !== null
      ) {
        const startIdx = Math.min(dragState.startIndex, dragState.endIndex)
        const endIdx = Math.max(dragState.startIndex, dragState.endIndex)

        const startX = xScale.getPixelForValue(startIdx)
        const endX = xScale.getPixelForValue(endIdx)

        if (
          [startX, endX].some((v) => typeof v !== 'number' || Number.isNaN(v))
        ) {
          return
        }

        const startData = props.data[startIdx]
        const endData = props.data[endIdx]

        if (!startData || !endData) return

        ctx.save()

        // Áreas escurecidas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
        if (startX > left) {
          ctx.fillRect(left, top, startX - left, bottom - top)
        }
        if (endX < right) {
          ctx.fillRect(endX, top, right - endX, bottom - top)
        }

        // Overlay na seleção
        ctx.fillStyle = 'rgba(148, 163, 184, 0.1)'
        ctx.fillRect(startX, top, endX - startX, bottom - top)

        ctx.restore()
      }
    } catch (error) {
      console.error('[hoverLinePlugin] Error:', error)
    }
  },
}

const closingDeltaFillPlugin: Plugin<'line'> = {
  id: 'closing-delta-fill',
  beforeDatasetsDraw: (chart) => {
    const segmentColors: ('above' | 'below' | 'mixed')[] = []
    try {
      if (!isDataValid.value || props.loading) return

      const closeValue = closingLineValue.value
      if (closeValue === null) return

      const meta = chart.getDatasetMeta(0)
      if (!meta || !Array.isArray(meta.data) || meta.data.length < 2) return

      const yScale = chart.scales?.y
      const { chartArea } = chart

      if (!yScale || !chartArea) return

      const closingY = yScale.getPixelForValue(closeValue)
      if (!Number.isFinite(closingY)) return

      const dataSource = displayedData.value
      if (!Array.isArray(dataSource) || dataSource.length < 2) return

      const ctx = chart.ctx
      ctx.save()
      ctx.beginPath()
      ctx.rect(
        chartArea.left,
        chartArea.top,
        chartArea.right - chartArea.left,
        chartArea.bottom - chartArea.top
      )
      ctx.clip()

      const chartTop = chartArea.top
      const chartBottom = chartArea.bottom
      const chartHeight = Math.max(1, chartBottom - chartTop)
      const closingRatio = Math.min(
        1,
        Math.max(0, (closingY - chartTop) / chartHeight)
      )

      const positiveGradient = ctx.createLinearGradient(
        0,
        chartTop,
        0,
        chartBottom
      )
      positiveGradient.addColorStop(0, 'rgba(34, 197, 94, 0)')
      positiveGradient.addColorStop(
        Math.max(0, closingRatio - 0.25),
        'rgba(34, 197, 94, 0.06)'
      )
      positiveGradient.addColorStop(
        Math.max(0, closingRatio - 0.1),
        'rgba(34, 197, 94, 0.18)'
      )
      positiveGradient.addColorStop(
        Math.max(0, closingRatio),
        'rgba(34, 197, 94, 0.32)'
      )
      positiveGradient.addColorStop(1, 'rgba(34, 197, 94, 0)')

      const negativeGradient = ctx.createLinearGradient(
        0,
        chartTop,
        0,
        chartBottom
      )
      negativeGradient.addColorStop(0, 'rgba(239, 68, 68, 0.32)')
      negativeGradient.addColorStop(
        Math.min(1, closingRatio),
        'rgba(239, 68, 68, 0.32)'
      )
      negativeGradient.addColorStop(
        Math.min(1, closingRatio + 0.12),
        'rgba(239, 68, 68, 0.18)'
      )
      negativeGradient.addColorStop(
        Math.min(1, closingRatio + 0.3),
        'rgba(239, 68, 68, 0.06)'
      )
      negativeGradient.addColorStop(1, 'rgba(239, 68, 68, 0)')

      const gradients: IClosingFillGradients = {
        positive: positiveGradient,
        negative: negativeGradient,
      }

      for (let i = 1; i < meta.data.length; i++) {
        const previousPoint = meta.data[i - 1] as unknown as ChartPointLike
        const currentPoint = meta.data[i] as unknown as ChartPointLike

        const previousValue = dataSource[i - 1]?.value
        const currentValue = dataSource[i]?.value

        if (
          typeof previousValue !== 'number' ||
          typeof currentValue !== 'number'
        )
          continue

        const segmentOrientation = drawClosingFillSegment(
          ctx,
          previousPoint,
          currentPoint,
          previousValue,
          currentValue,
          closeValue,
          closingY,
          gradients
        )

        segmentColors.push(segmentOrientation)
      }

      ctx.restore()
    } catch (error) {
      console.error('[closingDeltaFillPlugin] Error:', error)
    } finally {
      ;(chart as any)._segmentOrientations = segmentColors
      chartInstance.value = chart
    }
  },
}

const overlayLabelsPlugin: Plugin<'line'> = {
  id: 'overlayLabels',
  afterDraw: (chart) => {
    try {
      const { ctx, chartArea } = chart
      const xScale = chart.scales?.x
      const yScale = chart.scales?.y

      if (!ctx || !chartArea || !xScale || !yScale) return

      const pluginOptions = (
        (chart.options.plugins ?? {}) as Record<string, unknown>
      ).overlayLabels as
        | {
            fontFamily?: string
            fontSize?: number
            xLabelColor?: string
            yLabelColor?: string
            xLabelOffset?: number
            yLabelOffset?: number
            drawYAxisLine?: boolean
            drawXAxisOverlay?: boolean
            xOverlayBackgroundColor?: string
            xOverlayTextColor?: string
            xOverlayBorderColor?: string
            xOverlayBorderWidth?: number
            xOverlayPaddingX?: number
            xOverlayPaddingY?: number
            xOverlayCornerRadius?: number
            xOverlayOffsetY?: number
            axisLineColor?: string
            axisLineWidth?: number
            maxXLabels?: number
            xLabelRotation?: number
          }
        | undefined

      const fontFamily =
        pluginOptions?.fontFamily ?? 'Inter, system-ui, sans-serif'
      const fontSize = pluginOptions?.fontSize ?? 11
      const xLabelColor =
        pluginOptions?.xLabelColor ?? 'rgba(127, 140, 175, 0.85)'
      const yLabelColor =
        pluginOptions?.yLabelColor ?? 'rgba(127, 140, 175, 0.8)'
      const xLabelOffset = pluginOptions?.xLabelOffset ?? 24
      const yLabelOffset = pluginOptions?.yLabelOffset ?? 0
      const axisLineColor =
        pluginOptions?.axisLineColor ?? 'rgba(127, 140, 175, 0.2)'
      const axisLineWidth = pluginOptions?.axisLineWidth ?? 1
      const drawYAxisLine = pluginOptions?.drawYAxisLine ?? true
      const drawXAxisOverlay = pluginOptions?.drawXAxisOverlay ?? true
      const xOverlayTextColor =
        pluginOptions?.xOverlayTextColor ?? 'rgba(226, 232, 240, 0.92)'
      const xOverlayBorderWidth = pluginOptions?.xOverlayBorderWidth ?? 0
      const xOverlayPaddingX = pluginOptions?.xOverlayPaddingX ?? 10
      const xOverlayPaddingY = pluginOptions?.xOverlayPaddingY ?? 4
      const xOverlayCornerRadius =
        pluginOptions?.xOverlayCornerRadius ?? 10
      const xOverlayOffsetY = pluginOptions?.xOverlayOffsetY ?? 16
      const maxXLabels = pluginOptions?.maxXLabels ?? 6
      const xLabelRotation = pluginOptions?.xLabelRotation ?? -32
      const rotationRadians = (xLabelRotation * Math.PI) / 180

      ctx.save()
      ctx.font = `${fontSize}px ${fontFamily}`
      ctx.textBaseline = 'middle'

      if (drawYAxisLine) {
        ctx.beginPath()
        ctx.lineWidth = axisLineWidth
        ctx.strokeStyle = axisLineColor
        ctx.moveTo(chartArea.left, chartArea.top)
        ctx.lineTo(chartArea.left, chartArea.bottom)
        ctx.stroke()
        ctx.closePath()
      }

      ctx.fillStyle = xLabelColor
      ctx.textAlign = 'center'
      ctx.textBaseline = rotationRadians < 0 ? 'bottom' : 'top'

      const labelsArray = Array.isArray(chart.data.labels)
        ? chart.data.labels
        : []
      const totalLabels = labelsArray.length
      const step =
        totalLabels > 0 && maxXLabels > 0
          ? Math.max(1, Math.ceil(totalLabels / maxXLabels))
          : 1

      const xTicks = xScale?.ticks ?? []

      xTicks.forEach((tick: any, tickIndex: number) => {
        if (tickIndex === 0 || tickIndex === xTicks.length - 1) return

        const rawValue = typeof tick.value === 'number' ? tick.value : tickIndex
        const dataIndex = Number.isFinite(rawValue)
          ? Math.round(rawValue)
          : tickIndex

        if (totalLabels > 0) {
          const isEdge = dataIndex === 0 || dataIndex === totalLabels - 1
          if (!isEdge && dataIndex % step !== 0) {
            return
          }
        }

        const rawLabel =
          typeof tick.label === 'string'
            ? tick.label
            : (labelsArray[dataIndex] ?? labelsArray[tickIndex] ?? '')

        const formattedLabel = formatXAxisLabel(String(rawLabel))
        if (!formattedLabel) return

        const pixelGetter =
          typeof xScale.getPixelForTick === 'function'
            ? xScale.getPixelForTick.bind(xScale, tickIndex)
            : xScale.getPixelForValue.bind(xScale, rawValue)

        const x = pixelGetter()
        if (typeof x !== 'number' || Number.isNaN(x)) return

        if (!drawXAxisOverlay) {
          const y = chartArea.bottom + xLabelOffset

          ctx.save()
          ctx.fillStyle = xLabelColor
          ctx.textAlign = 'center'
          ctx.textBaseline = rotationRadians < 0 ? 'bottom' : 'top'
          ctx.translate(x, y)
          if (rotationRadians !== 0) ctx.rotate(rotationRadians)
          ctx.fillText(formattedLabel, 0, 0)
          ctx.restore()
          return
        }

        const targetY = chartArea.bottom - xOverlayOffsetY

        ctx.save()
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const textMetrics = ctx.measureText(formattedLabel)
        const textWidth = textMetrics.width
        const textHeight =
          fontSize + (textMetrics.actualBoundingBoxDescent ?? 0)

        const minLeft = chartArea.left + 4
        const maxRight = chartArea.right - 4
        const halfBoxWidth = Math.max(0, textWidth / 2 + xOverlayPaddingX)
        const boxHeight = textHeight + xOverlayPaddingY * 2

        let centerX = x
        let boxLeft = centerX - halfBoxWidth
        let boxRight = centerX + halfBoxWidth

        if (boxLeft < minLeft) {
          const delta = minLeft - boxLeft
          centerX += delta
          boxLeft += delta
          boxRight += delta
        } else if (boxRight > maxRight) {
          const delta = boxRight - maxRight
          centerX -= delta
          boxLeft -= delta
          boxRight -= delta
        }

        const boxTop = targetY - boxHeight / 2
        const boxBottom = targetY + boxHeight / 2
        const radius = Math.max(0, Math.min(xOverlayCornerRadius, boxHeight / 2))

        ctx.fillStyle = xOverlayTextColor
        ctx.translate(centerX, targetY)
        if (rotationRadians !== 0) ctx.rotate(rotationRadians)
        ctx.fillText(formattedLabel, 0, 0)
        ctx.restore()
      })

      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'

      if (!isHovering.value) {
        ctx.fillStyle = yLabelColor

      const yTicks = yScale?.ticks ?? []

        yTicks.forEach((tick: any, tickIndex: number) => {
          if (tickIndex === 0 || tickIndex === yTicks.length - 1) return
          if (typeof tick.value !== 'number') return

        const y = yScale.getPixelForValue(tick.value) + yLabelOffset
        const label = formatAxisCurrency(tick.value)
        ctx.fillText(label, chartArea.left + 6, y)
      })
      }

      ctx.restore()
    } catch (error) {
      console.error('[overlayLabelsPlugin] Error:', error)
    }
  },
}

const markerLinesPlugin: Plugin<'line'> = {
  id: 'markerLinesPlugin',
  afterDraw: (chart) => {
    try {
      if (
        props.loading ||
        !isDataValid.value ||
        normalizedMarkers.value.length === 0
      ) {
        return
      }

      const { ctx, chartArea } = chart
      const yScale = chart.scales?.y

      if (!ctx || !chartArea || !yScale) return

      normalizedMarkers.value.forEach((marker) => {
        const y = yScale.getPixelForValue(marker.value)
        if (typeof y !== 'number' || Number.isNaN(y)) return

        ctx.save()

        // Horizontal line
        ctx.beginPath()
        ctx.setLineDash([6, 4])
        ctx.lineWidth = 1.5
        ctx.strokeStyle = marker.color
        ctx.moveTo(chartArea.left, y)
        ctx.lineTo(chartArea.right, y)
        ctx.stroke()
        ctx.closePath()
        ctx.setLineDash([])

        // Label
        const fontFamily = 'Inter, system-ui, sans-serif'
        const fontSize = 12
        const paddingX = 12
        const paddingY = 8
        const title = marker.name
        const valueText = formatCurrency(marker.value)
        const prefix = `${title}: `
        const lineSpacing = 10

        ctx.font = `${fontSize}px ${fontFamily}`
        const prefixMetrics = ctx.measureText(prefix)
        const valueMetrics = ctx.measureText(valueText)

        const contentWidth = prefixMetrics.width + valueMetrics.width
        const boxWidth = contentWidth + paddingX * 2
        const boxHeight = paddingY * 2 + fontSize

        const labelY = Math.max(chartArea.top + paddingY, y + lineSpacing)
        const boxLeft = chartArea.left + 50

        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'

        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.fillStyle = marker.color
        ctx.fillText(prefix, boxLeft + paddingX, labelY)

        const valueX = boxLeft + paddingX + prefixMetrics.width
        ctx.font = `600 ${fontSize}px ${fontFamily}`
        ctx.fillStyle = marker.color
        ctx.fillText(valueText, valueX, labelY)

        ctx.restore()
      })
    } catch (error) {
      console.error('[markerLinesPlugin] Error:', error)
    }
  },
}

/* ========== Registro do Chart.js ========== */
if (!(ChartCore as any)._adapters?._customRegisteredOnce) {
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

/* ========== Chart data/options ========== */
const chartData = computed(() => {
  const hasRealData = isDataValid.value
  const dataToUse =
    props.loading && !hasRealData ? loadingData.value : props.data

  return {
    labels: dataToUse.map((d) => d.date),
    datasets: [
      {
        data: dataToUse.map((d) => d.value),
        label: props.legend[0]?.label || 'Preço',
        segment: {
          borderColor: (ctx: any) => dynamicLineColor(ctx.p1DataIndex, true),
        },
        backgroundColor: () => 'rgba(34, 197, 94, 0.08)',
        borderWidth: 1.5,
        fill: false,
        clip: false,
        borderColor: (ctx: any) =>
          dynamicLineColor(ctx.p1DataIndex ?? ctx.p0DataIndex ?? 0, true),
        pointHitRadius: props.loading ? 0 : 10,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointBackgroundColor: 'transparent',
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        pointHoverBorderColor: 'transparent',
        tension: props.loading ? 0.5 : 0.1,
      },
    ],
  }
})

const chartOptions = computed(() => {
  const extents = yAxisExtents.value
  const yLimits =
    extents &&
    Number.isFinite(extents.min) &&
    Number.isFinite(extents.max)
      ? {
          min: extents.min,
          max: extents.max,
        }
      : {}

  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    interaction: { intersect: false, mode: 'index' as const },
    scales: {
      x: {
        offset: false,
        bounds: 'data',
        display: false,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.3)',
          drawBorder: false,
          drawTicks: false,
          lineWidth: 0.5,
          tickLength: 0,
          tickWidth: 0,
        },
        ticks: {
          display: false,
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
        display: true,
        reverse: false,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.2)',
          drawBorder: false,
          drawTicks: false,
          lineWidth: 0.5,
          tickLength: 0,
          tickWidth: 0,
        },
        ticks: {
          display: false,
          maxTicksLimit: 5,
          font: { size: 13 },
          callback: (v: string | number) =>
            `${props.currency} ${Number(v).toLocaleString(props.locale, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`,
        },
        ...yLimits,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      colors: { forceOverride: true },
      overlayLabels: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 13,
        xLabelColor: 'rgba(255, 255, 255, 0.7)',
        yLabelColor: 'rgba(255, 255, 255, 0.7)',
        xLabelOffset: 5,
        yLabelOffset: 0,
        drawYAxisLine: false,
        maxXLabels: 6,
        xLabelRotation: 0,
      },
    },
  }
})

const localPlugins = [
  closingDeltaFillPlugin,
  hoverLinePlugin,
  overlayLabelsPlugin,
  markerLinesPlugin,
]

/* ========== Lifecycle ========== */
onMounted(async () => {
  await nextTick()
  const chart = chartRef.value?.chart

  if (!chart) {
    console.warn('[Chart] Chart instance not available')
    return
  }

  chartInstance.value = chart
  removeCanvasEvents = setupCanvasEvents(chart)

  if (props.loading && !isDataValid.value) {
    loadingData.value = generateLoadingData()
    animateLoadingData()
  }
})

watch(
  () => props.loading,
  (newLoading) => {
    if (newLoading) {
      if (!isDataValid.value) {
        loadingData.value = generateLoadingData()
        animateLoadingData()
      }
      isDragging.value = false
      isHovering.value = false
      hoverState.index = null
    } else {
      stopLoadingAnimation()
    }
  }
)

watch(
  () => props.data,
  (newData) => {
    if (Array.isArray(newData) && newData.length > 0 && props.loading) {
      stopLoadingAnimation()
    }
  },
  { deep: false }
)

onUnmounted(() => {
  removeCanvasEvents?.()
  stopLoadingAnimation()
  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer)
})

const onRootMouseLeave = (): void => {
  isHovering.value = false
}
</script>

<style scoped>
.graph:deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes tooltipSlide {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>

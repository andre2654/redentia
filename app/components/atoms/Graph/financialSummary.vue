<template>
  <section
    class="financial-card flex h-full flex-col gap-3 border-white/5 bg-white/[0.03] transition hover:border-white/20"
  >
    <header class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-white/80">
        {{ props.title }}
      </h3>
      <slot name="meta" />
    </header>

    <div class="relative h-[220px]" @mouseleave="hoveredIndex = null">
      <div
        v-if="props.isLoading"
        class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/30 text-xs text-white/70"
      >
        Carregando dados...
      </div>

      <Bar
        ref="chartRef"
        :data="chartData as any"
        :options="chartOptions as any"
      />
    </div>

    <div
      v-if="hoveredIndex !== null && tooltipData"
      class="pointer-events-none fixed z-20 rounded-lg border border-white/10 bg-black/70 px-3 py-2 shadow-lg backdrop-blur-md transition-all duration-150"
      :style="{
        left: `${tooltipPosition.x + 12}px`,
        top: `${tooltipPosition.y - 56}px`,
      }"
    >
      <div class="flex items-start gap-2">
        <div
          class="mt-1 h-2.5 w-2.5 rounded-full"
          :style="{ backgroundColor: tooltipData.color }"
        />
        <div class="flex flex-col">
          <span class="text-[12px] font-medium text-white/80">
            {{ tooltipData.label }}
          </span>
          <span class="text-[12px] font-semibold text-white">
            {{ tooltipData.value }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  type Ref,
} from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ActiveElement,
  type ChartEvent,
} from 'chart.js'
import colorLib from '@kurkle/color'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface FinancialChartItem {
  label: string
  value: number
}

interface Props {
  title: string
  items: FinancialChartItem[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  isLoading: false,
})

const chartRef = ref<InstanceType<typeof Bar> | null>(null)
const hoveredIndex = ref<number | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const cleanupEvents: Ref<(() => void) | null> = ref(null)

const palette = [
  '#b9ecc1',
  '#a7d6ff',
  '#c4b5fd',
  '#fcd34d',
  '#f97316',
  '#38bdf8',
  '#f472b6',
]

const labels = computed(() => props.items.map((item) => item.label))
const values = computed(() =>
  props.items.map((item) =>
    Number.isFinite(item.value) ? Number(item.value) : 0
  )
)

function transparentize(color: string, opacity = 0.3) {
  const alpha = opacity === undefined ? 0.5 : 1 - opacity
  return colorLib(color).alpha(alpha).rgbString()
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: Math.abs(value) < 1 ? 2 : 0,
  })
}

const chartData = computed(() => {
  return {
    labels: labels.value,
    datasets: [
      {
        data: values.value,
        backgroundColor: (context: {
          chart: {
            canvas: HTMLCanvasElement
            chartArea?: { top: number; bottom: number }
          }
          dataIndex?: number
        }) => {
          const index = context.dataIndex ?? 0
          const color = palette[index % palette.length]
          const { chart } = context
          const chartArea = chart.chartArea
          if (!chartArea) return color
          const ctx = chart.canvas.getContext('2d')
          if (!ctx) return color
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          )
          gradient.addColorStop(0, transparentize(color, 0.2))
          gradient.addColorStop(1, transparentize(color, 0.85))
          return gradient
        },
        borderColor: values.value.map(
          (_, index) => palette[index % palette.length]
        ),
        borderWidth: 1.2,
        borderRadius: 12,
        borderSkipped: false,
        hoverBorderWidth: 2,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  layout: { padding: { top: 8, right: 12, bottom: 0, left: 4 } },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: 'rgba(255,255,255,0.65)',
        font: { size: 11, weight: '500' },
        maxRotation: 45,
        minRotation: 45,
      },
      border: { display: false },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.08)', drawTicks: false },
      ticks: {
        color: 'rgba(255,255,255,0.45)',
        font: { size: 11 },
        padding: 6,
        callback: (value: number) => formatCurrency(Number(value)),
      },
      border: { display: false },
    },
  },
  onHover: (event: ChartEvent, elements: ActiveElement[]) => {
    try {
      const native = (event as unknown as { native?: MouseEvent })?.native
      if (native)
        tooltipPosition.value = { x: native.clientX, y: native.clientY }
    } catch {
      // noop
    }
    hoveredIndex.value = elements?.[0]?.index ?? null
  },
}))

const tooltipData = computed(() => {
  if (hoveredIndex.value === null) return null
  const index = hoveredIndex.value
  const item = props.items[index]
  if (!item) return null
  const color = palette[index % palette.length]
  return {
    label: item.label,
    value: formatCurrency(item.value || 0),
    color,
  }
})

function setupCanvasEvents(chart: ChartJS) {
  if (!chart?.canvas) return () => {}
  const canvas = chart.canvas

  const handleMouseMove = (event: MouseEvent) => {
    tooltipPosition.value = { x: event.clientX, y: event.clientY }
  }
  const handleMouseLeave = () => {
    hoveredIndex.value = null
  }
  const handleScroll = () => {
    hoveredIndex.value = null
  }

  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mouseleave', handleMouseLeave)
  window.addEventListener('scroll', handleScroll, { passive: true })

  return () => {
    try {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
    } catch {
      // noop
    }
  }
}

onMounted(() => {
  nextTick(() => {
    if (chartRef.value?.chart) {
      cleanupEvents.value = setupCanvasEvents(chartRef.value.chart)
    }
  })
})

onUnmounted(() => {
  try {
    cleanupEvents.value?.()
  } catch {
    // noop
  }
  cleanupEvents.value = null
})

watch(
  () => props.items,
  () => {
    hoveredIndex.value = null
  },
  { deep: true }
)
</script>

<style scoped>
.financial-card {
  min-height: 280px;
}

.financial-card :deep(canvas) {
  width: 100% !important;
}
</style>

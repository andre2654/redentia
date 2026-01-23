<template>
  <section
    class="financial-card flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-all hover:border-white/20 hover:bg-white/[0.04]"
  >
    <!-- Header -->
    <header class="flex items-center justify-between border-b border-white/5 px-4 py-3">
      <div class="flex items-center gap-2">
        <UIcon v-if="props.icon" :name="props.icon" class="h-4 w-4 text-white/40" />
        <h3 class="text-sm font-medium text-white">
          {{ props.title }}
        </h3>
      </div>
      <slot name="meta" />
    </header>

    <!-- Chart Area -->
    <div class="relative flex-1 p-4" @mouseleave="hoveredIndex = null">
      <!-- Loading State -->
      <div
        v-if="props.isLoading"
        class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2"
      >
        <UIcon name="i-lucide-loader-2" class="h-5 w-5 animate-spin text-white/30" />
        <span class="text-xs text-white/30">Carregando...</span>
      </div>

      <!-- Chart -->
      <div class="h-[200px]">
        <Bar
          ref="chartRef"
          :data="chartData as any"
          :options="chartOptions as any"
        />
      </div>
    </div>

    <!-- Legend -->
    <div v-if="!props.isLoading && props.items.length" class="flex flex-wrap gap-3 border-t border-white/5 px-4 py-3">
      <div
        v-for="(item, index) in props.items"
        :key="item.label"
        class="flex items-center gap-1.5"
      >
        <div
          class="h-2 w-2 rounded-full"
          :style="{ backgroundColor: palette[index % palette.length] }"
        />
        <span class="text-[10px] text-white/50">{{ item.label }}</span>
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="hoveredIndex !== null && tooltipData"
      class="pointer-events-none fixed z-50 rounded-lg border border-white/10 bg-black/90 px-3 py-2 shadow-xl backdrop-blur-sm"
      :style="{
        left: `${tooltipPosition.x + 12}px`,
        top: `${tooltipPosition.y - 56}px`,
      }"
    >
      <div class="flex items-center gap-2">
        <div
          class="h-2 w-2 rounded-full"
          :style="{ backgroundColor: tooltipData.color }"
        />
        <div class="flex flex-col">
          <span class="text-[10px] text-white/50">
            {{ tooltipData.label }}
          </span>
          <span class="text-sm font-semibold text-white">
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
  icon?: string
  items: FinancialChartItem[]
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  items: () => [],
  isLoading: false,
})

const chartRef = ref<InstanceType<typeof Bar> | null>(null)
const hoveredIndex = ref<number | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
const cleanupEvents: Ref<(() => void) | null> = ref(null)

const palette = [
  '#6ee7b7', // green
  '#93c5fd', // blue
  '#a5b4fc', // indigo
  '#fcd34d', // yellow
  '#fdba74', // orange
  '#67e8f9', // cyan
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

function formatCompactCurrency(value: number) {
  const absValue = Math.abs(value)
  if (absValue >= 1e12) return `R$ ${(value / 1e12).toFixed(1)}T`
  if (absValue >= 1e9) return `R$ ${(value / 1e9).toFixed(1)}B`
  if (absValue >= 1e6) return `R$ ${(value / 1e6).toFixed(1)}M`
  if (absValue >= 1e3) return `R$ ${(value / 1e3).toFixed(0)}K`
  return `R$ ${value.toFixed(0)}`
}

const chartData = computed(() => {
  return {
    labels: labels.value,
    datasets: [
      {
        data: values.value,
        backgroundColor: values.value.map((_, index) => {
          const color = palette[index % palette.length]
          return transparentize(color, 0.6)
        }),
        borderColor: values.value.map(
          (_, index) => palette[index % palette.length]
        ),
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: values.value.map((_, index) => {
          const color = palette[index % palette.length]
          return transparentize(color, 0.4)
        }),
        hoverBorderWidth: 2,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 400, easing: 'easeOutQuart' },
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
      grid: { color: 'rgba(255,255,255,0.04)', drawTicks: false },
      ticks: {
        color: 'rgba(255,255,255,0.3)',
        font: { size: 10 },
        padding: 8,
        maxTicksLimit: 5,
        callback: (value: number) => formatCompactCurrency(Number(value)),
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
  min-height: 320px;
}

.financial-card :deep(canvas) {
  width: 100% !important;
}
</style>

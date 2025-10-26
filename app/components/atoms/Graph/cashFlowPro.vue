<template>
  <div class="graph flex w-full flex-col gap-4">
    <div class="relative" @mouseleave="hoveredIndex = null">
      <div class="relative h-[350px] w-full">
        <div
          v-if="props.isLoading"
          class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20"
        >
          <span class="text-white">Carregando...</span>
        </div>
        <Bar
          ref="chartRef"
          :data="chartData as any"
          :options="chartOptions as any"
        />
      </div>

      <div
        v-if="hoveredIndex !== null && tooltipData"
        class="pointer-events-none fixed z-10 rounded-lg px-3 py-2 backdrop-blur-md transition-all duration-150 dark:bg-black/30"
        :style="{
          left: `${tooltipPosition.x + 10}px`,
          top: `${tooltipPosition.y - 60}px`,
        }"
      >
        <div class="flex gap-3">
          <div class="flex flex-col">
            <span class="text-[13px] font-medium">{{ tooltipData.label }}</span>
            <span class="text-[13px]" :style="{ color: tooltipData.color }">
              R$
              {{
                tooltipData.value.toLocaleString('pt-BR', {
                  maximumFractionDigits: 0,
                })
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartEvent,
  type ActiveElement,
} from 'chart.js'
import type { FundamentusData } from '~/types/asset'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Props {
  data?: FundamentusData
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: undefined,
  isLoading: false,
})

const chartRef = ref<InstanceType<typeof Bar> | null>(null)
const hoveredIndex = ref<number | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })
let cleanupEvents: (() => void) | null = null

const labels = [
  'Operacional',
  'Investimento',
  'Financiamento',
  'Fluxo de Caixa Livre',
]

const rawValues = computed(() => {
  const cf = props.data?.cashFlow
  return [
    cf?.operatingCashFlow || 0,
    cf?.investingCashFlow || 0,
    cf?.financingCashFlow || 0,
    cf?.freeCashFlow || 0,
  ]
})

const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6']

const chartData = computed(() => ({
  labels,
  datasets: [
    {
      label: 'Fluxo de Caixa (R$)',
      data: rawValues.value,
      backgroundColor: colors,
      borderColor: colors.map((c) => c),
      borderWidth: 1.5,
      borderRadius: 10,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 12 } } },
    y: {
      grid: { color: 'rgba(255,255,255,0.1)' },
      ticks: {
        font: { size: 12 },
        callback: (value: number) =>
          `R$ ${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      },
    },
  },
  onHover: (event: ChartEvent, elements: ActiveElement[]) => {
    try {
      // Atualiza posição
      const anyEvt = event as unknown as { native?: MouseEvent }
      const native = anyEvt?.native
      if (native)
        tooltipPosition.value = { x: native.clientX, y: native.clientY }
    } catch {}
    if (elements && elements.length > 0)
      hoveredIndex.value = elements[0]?.index ?? null
    else hoveredIndex.value = null
  },
}))

const tooltipData = computed(() => {
  if (hoveredIndex.value === null) return null
  const idx = hoveredIndex.value
  return {
    label: labels[idx],
    value: rawValues.value[idx] || 0,
    color: colors[idx],
  }
})

const stats = computed(() => ({
  operating: rawValues.value[0] || 0,
  investing: rawValues.value[1] || 0,
  freeCashFlow: rawValues.value[3] || 0,
}))

function formatCurrency(n: number) {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

// Eventos extras no canvas para maior precisão do tooltip
function setupCanvasEvents(chart: any) {
  if (!chart?.canvas) return () => {}
  const canvas: HTMLCanvasElement = chart.canvas
  const handleMouseMove = (e: MouseEvent) => {
    tooltipPosition.value = { x: e.clientX, y: e.clientY }
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
    } catch {}
  }
}

onMounted(() => {
  nextTick(() => {
    if (chartRef.value?.chart) {
      cleanupEvents = setupCanvasEvents(chartRef.value.chart)
    }
  })
})

onUnmounted(() => {
  try {
    cleanupEvents?.()
  } catch {}
  cleanupEvents = null
})
</script>

<style scoped>
.graph:deep(canvas) {
  width: 100% !important;
}
</style>

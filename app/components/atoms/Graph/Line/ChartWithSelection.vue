<template>
  <div class="flex h-full w-full flex-col gap-6">
    <!-- Informações da seleção -->
    <div v-if="selectionInfo" class="rounded-lg bg-gray-800/50 p-4 border border-white/10">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-white">Período Selecionado</h3>
        <button
          class="text-xs text-white/70 hover:text-white transition-colors"
          @click="resetSelection"
        >
          ✕ Limpar
        </button>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-white/70">De:</span>
          <div class="text-white font-medium">{{ selectionInfo.startLabel }}</div>
          <div class="text-white">R$ {{ selectionInfo.startValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</div>
        </div>
        <div>
          <span class="text-white/70">Até:</span>
          <div class="text-white font-medium">{{ selectionInfo.endLabel }}</div>
          <div class="text-white">R$ {{ selectionInfo.endValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}</div>
        </div>
      </div>
      <div class="mt-3 pt-3 border-t border-white/10">
        <div class="flex items-center justify-between">
          <span class="text-white/70">Variação:</span>
          <div class="text-right">
            <div
              :class="[
                'font-semibold',
                selectionInfo.change >= 0 ? 'text-green-400' : 'text-red-400'
              ]"
            >
              {{ selectionInfo.change >= 0 ? '+' : '' }}R$ {{ selectionInfo.change.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
            </div>
            <div
              :class="[
                'text-sm',
                selectionInfo.change >= 0 ? 'text-green-400' : 'text-red-400'
              ]"
            >
              {{ selectionInfo.change >= 0 ? '+' : '' }}{{ selectionInfo.changePercent.toFixed(2) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Container do gráfico com overlay -->
    <div class="relative" :style="{ height: `${height}px` }">
      <Line ref="chartRef" :data="chartData" :options="chartOptions" />
      
      <!-- Overlay invisível para capturar eventos de mouse -->
      <div
        ref="overlayRef"
        class="absolute inset-0 cursor-crosshair"
        @mousedown="startSelection"
        @mousemove="updateSelection"
        @mouseup="endSelection"
        @mouseleave="cancelSelection"
      />
      
      <!-- Área de seleção visual -->
      <div
        v-if="isSelecting && selection.startX !== null && selection.endX !== null"
        class="absolute bg-green-500/20 border-l-2 border-r-2 border-green-500/50 pointer-events-none"
        :style="{
          left: Math.min(selection.startX, selection.endX) + 'px',
          width: Math.abs(selection.endX - selection.startX) + 'px',
          top: '0',
          bottom: '0'
        }"
      />
    </div>
    
    <!-- Legenda -->
    <div v-if="showLegend && legend.length > 0" class="flex w-full justify-end">
      <Legend :legend-items="legend" />
    </div>
    
    <!-- Instruções -->
    <div v-if="!selectionInfo" class="text-center text-xs text-white/50">
      Clique e arraste no gráfico para ver a variação em um período
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
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

// Refs
const chartRef = ref()
const overlayRef = ref()

// Estados de seleção
const isSelecting = ref(false)
const selection = ref({
  startX: null as number | null,
  endX: null as number | null,
  startIndex: null as number | null,
  endIndex: null as number | null
})

const selectionInfo = ref<{
  startLabel: string;
  endLabel: string;
  startValue: number;
  endValue: number;
  change: number;
  changePercent: number;
} | null>(null)

function transparentize(value: string, opacity: number) {
  const alpha = opacity === undefined ? 0.5 : 1 - opacity
  return colorLib(value).alpha(alpha).rgbString()
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
)

const chartData = computed(() => {
  return {
    labels: props.data.map(item => item.date),
    datasets: [{
      data: props.data.map(item => item.value),
      label: props.legend[0]?.label || 'Preço',
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
        callback: function(value: any) {
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
      enabled: false,
    },
    legend: {
      display: false,
    },
  },
  events: [],
}))

// Funções de seleção
const getDataIndexFromX = (x: number): number => {
  if (!chartRef.value?.chart) return 0
  
  // Usa as coordenadas do overlay
  const overlayRect = overlayRef.value?.getBoundingClientRect()
  if (!overlayRect) return 0
  
  const relativeX = x - overlayRect.left
  
  // Mapeia a posição X para um índice de dados
  const chartWidth = overlayRect.width
  const dataLength = props.data.length
  const progress = Math.max(0, Math.min(1, relativeX / chartWidth))
  
  return Math.round(progress * (dataLength - 1))
}

const startSelection = (event: MouseEvent) => {
  if (!overlayRef.value) return
  
  const rect = overlayRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  
  isSelecting.value = true
  selection.value.startX = x
  selection.value.endX = x
  selection.value.startIndex = getDataIndexFromX(event.clientX)
  
  // Previne seleção de texto
  event.preventDefault()
}

const updateSelection = (event: MouseEvent) => {
  if (!isSelecting.value || !overlayRef.value) return
  
  const rect = overlayRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  
  selection.value.endX = x
  selection.value.endIndex = getDataIndexFromX(event.clientX)
  
  event.preventDefault()
}

const endSelection = (event: MouseEvent) => {
  if (!isSelecting.value) return
  
  selection.value.endIndex = getDataIndexFromX(event.clientX)
  
  // Calcula as informações da seleção apenas se há diferença mínima
  if (selection.value.startIndex !== null && selection.value.endIndex !== null) {
    const startIdx = Math.min(selection.value.startIndex, selection.value.endIndex)
    const endIdx = Math.max(selection.value.startIndex, selection.value.endIndex)
    
    // Requer pelo menos 2 pontos de diferença para mostrar a seleção
    if (Math.abs(endIdx - startIdx) >= 1 && props.data[startIdx] && props.data[endIdx]) {
      const startData = props.data[startIdx]
      const endData = props.data[endIdx]
      
      const change = endData.value - startData.value
      const changePercent = (change / startData.value) * 100
      
      selectionInfo.value = {
        startLabel: startData.date,
        endLabel: endData.date,
        startValue: startData.value,
        endValue: endData.value,
        change,
        changePercent
      }
    }
  }
  
  isSelecting.value = false
  
  // Limpa a seleção visual
  selection.value.startX = null
  selection.value.endX = null
}

const cancelSelection = () => {
  isSelecting.value = false
}

const resetSelection = () => {
  selectionInfo.value = null
  selection.value = {
    startX: null,
    endX: null,
    startIndex: null,
    endIndex: null
  }
}
</script>

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
      <div class="flex h-80 items-end justify-center gap-2">
        <div
          v-for="(dividend, index) in displayData"
          :key="index"
          class="relative flex flex-col items-center gap-2"
          @mouseenter="hoveredIndex = index"
          @mousemove="updateTooltipPosition($event)"
        >
          <!-- Barra do dividendo -->
          <div class="relative flex h-64 w-8 flex-col justify-end">
            <div
              class="w-full cursor-pointer rounded-t-md bg-emerald-500 transition-all duration-700 ease-out hover:bg-emerald-400"
              :style="{
                height: `${(dividend.value / maxValue) * 100}%`,
                minHeight: dividend.value > 0 ? '4px' : '0px',
              }"
            />
          </div>

          <!-- Label da data -->
          <div class="flex h-12 w-8 items-center justify-center">
            <span
              class="origin-center -rotate-45 transform whitespace-nowrap text-xs text-white/70"
            >
              {{ dividend.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Linha de tendência de Dividend Yield -->
      <div
        v-if="displayData.length > 1"
        class="pointer-events-none absolute top-4 flex items-start justify-center"
        :style="{
          left: '16px',
          right: '16px',
          height: '256px',
        }"
      >
        <div class="relative flex h-full items-end justify-center gap-2">
          <svg
            class="absolute top-0"
            :style="{
              width: `${(displayData.length - 1) * 40 + 32}px`,
              height: '256px',
            }"
            :viewBox="`0 0 ${(displayData.length - 1) * 40 + 32} 256`"
            preserveAspectRatio="xMidYMid meet"
          >
            <polyline
              :points="trendLinePoints"
              fill="none"
              stroke="#F59E0B"
              stroke-width="2"
              stroke-dasharray="4,4"
              opacity="0.9"
            />
            <!-- Pontos da linha de tendência -->
            <circle
              v-for="(point, index) in trendPoints"
              :key="`trend-${index}`"
              :cx="point.x"
              :cy="point.y"
              r="3"
              fill="#F59E0B"
              opacity="1"
            />
          </svg>
        </div>
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
          <div class="mt-1 h-3 w-3 rounded-full bg-emerald-500" />
          <div class="flex flex-col gap-1">
            <span class="text-[13px] font-medium text-white">
              {{ tooltipData.label }}
            </span>
            <span class="text-[13px] text-emerald-400">
              R$
              {{
                tooltipData.value.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })
              }}
            </span>
            <span class="text-[11px] text-amber-400">
              DY: {{ tooltipData.dividendYield.toFixed(2) }}%
            </span>
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

      <!-- Legenda da linha de tendência -->
      <div class="mt-2 flex items-center gap-4 text-xs text-white/60">
        <div class="flex items-center gap-2">
          <div class="h-3 w-3 rounded bg-emerald-500" />
          <span>Dividendos</span>
        </div>
        <div class="flex items-center gap-2">
          <div
            class="h-0.5 w-4 bg-amber-500"
            style="border: 1px dashed #f59e0b; background: none"
          />
          <span>Tendência D.Y.</span>
        </div>
      </div>
    </div>

    <!-- Resumo dos dividendos -->
    <div class="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
      <div class="flex flex-col gap-1 rounded-lg bg-gray-800/50 p-3">
        <span class="text-xs text-white/60">Total no período</span>
        <span class="text-lg font-semibold text-emerald-400">
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
import { computed, ref } from 'vue'

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

const updateTooltipPosition = (event: MouseEvent) => {
  tooltipPosition.value = { x: event.clientX, y: event.clientY }
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

// Agrupa dados por ano se necessário
const displayData = computed(() => {
  if (!groupByYear.value) {
    return filteredData.value.map((item) => ({
      label: item.date,
      value: item.value,
      year: item.year,
    }))
  }

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

  return Object.entries(groupedByYear)
    .map(([year, data]) => ({
      label: year,
      value: data.total,
      year: parseInt(year),
    }))
    .sort((a, b) => a.year - b.year)
})

// Tooltip data
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
  }
})

// Pontos da linha de tendência para dividend yield
const trendPoints = computed(() => {
  if (displayData.value.length === 0) return []

  return displayData.value.map((item, index) => {
    const stockPrice = _getStockPrice(item.year)
    const dividendYield = (item.value / stockPrice) * 100
    const maxDY = 8 // Assumindo um DY máximo de 8% para escala

    // Calcula a posição X baseada no centro de cada barra
    // Gap de 8px entre barras (gap-2) + largura da barra 32px (w-8)
    const barWidth = 32
    const gapBetweenBars = 8
    const barCenterX = index * (barWidth + gapBetweenBars) + barWidth / 2

    // Converte o dividend yield para coordenada Y (invertida, pois SVG Y cresce para baixo)
    const yPosition = 256 - Math.min((dividendYield / maxDY) * 256, 256)

    return {
      x: barCenterX,
      y: Math.max(yPosition, 0), // Garante que nunca seja negativo
    }
  })
})

// String dos pontos para a polyline SVG
const trendLinePoints = computed(() => {
  return trendPoints.value.map((point) => `${point.x},${point.y}`).join(' ')
})

// Calcula valores máximos e estatísticas
const maxValue = computed(() => {
  return Math.max(...displayData.value.map((item) => item.value), 0.1)
})

const totalDividends = computed(() => {
  return displayData.value.reduce((sum, item) => sum + item.value, 0)
})

const maxDividend = computed(() => {
  return Math.max(...displayData.value.map((item) => item.value), 0)
})

const averageDividend = computed(() => {
  if (displayData.value.length === 0) return 0
  return totalDividends.value / displayData.value.length
})
</script>

<style scoped>
/* Animação suave para as barras */
.transition-all {
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

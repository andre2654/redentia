<template>
  <NuxtLayout>
    <template #header>
      <div class="flex items-center gap-3">
        <img
          v-if="asset.logo"
          :src="asset.logo"
          alt="Asset Logo"
          class="h-6 w-6 rounded-full"
        />
        <h1 class="min-w-max font-medium max-md:text-[20px]">
          {{ asset.name }}
        </h1>
        <span class="text-sm text-white/70">({{ asset.stock }})</span>
      </div>
    </template>

    <!-- Graph -->
    <div class="w-full border-b p-4">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="mb-4 text-lg font-semibold">
            Cotação da {{ asset.stock }}
          </h2>
          <UButtonGroup orientation="horizontal" variant="soft">
            <UButton
              :color="selectedTimeRange === 'month' ? 'primary' : 'neutral'"
              :variant="selectedTimeRange === 'month' ? 'solid' : 'subtle'"
              label="Mês"
              @click="selectedTimeRange = 'month'"
            />
            <UButton
              :color="selectedTimeRange === 'year' ? 'primary' : 'neutral'"
              :variant="selectedTimeRange === 'year' ? 'solid' : 'subtle'"
              label="Ano"
              @click="selectedTimeRange = 'year'"
            />
            <UDropdownMenu :items="timeRangeOptions" label="Outro">
              <UButton
                label="Outro"
                icon="i-lucide-menu"
                color="neutral"
                variant="outline"
              />
            </UDropdownMenu>
          </UButtonGroup>
        </div>
        <AtomsGraphLine
          :data="chartConfig.data"
          :colors="chartConfig.colors"
          :legend="chartConfig.legend"
          :height="350"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

type ChartTimeRange = 'month' | 'year' | 'ytd' | '3months' | '6months'

const route = useRoute()

const ticker = route.params.ticker as string

// Mock do asset - vou criar dados de exemplo já que o service está apresentando problemas
const asset = {
  stock: ticker,
  name: `Empresa ${ticker.toUpperCase()}`,
  close: 85.5,
  change: 2.15,
  volume: 1000000,
  market_cap: 15000000000,
  logo: null,
  sector: 'Financeiro',
  type: 'stock' as const,
}

const selectedTimeRange = ref<ChartTimeRange>('month')

const timeRangeOptions = [
  [
    {
      label: '3 Meses',
      click: () => (selectedTimeRange.value = '3months'),
    },
  ],
  [
    {
      label: '6 Meses',
      click: () => (selectedTimeRange.value = '6months'),
    },
  ],
  [
    {
      label: 'Ano até hoje',
      click: () => (selectedTimeRange.value = 'ytd'),
    },
  ],
]

// Mock data melhorado com dados realistas
const generateMockData = (timeRange: ChartTimeRange) => {
  const getDaysFromRange = (range: ChartTimeRange): number => {
    switch (range) {
      case 'month':
        return 30
      case '3months':
        return 90
      case '6months':
        return 180
      case 'year':
        return 365
      case 'ytd': {
        const now = new Date()
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        return Math.ceil(
          (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
        )
      }
      default:
        return 30
    }
  }

  const days = getDaysFromRange(timeRange)
  const data = []
  const basePrice = asset.close || 100
  let currentPrice = basePrice

  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Simulação de variação de preço mais realística
    const variation = (Math.random() - 0.5) * 0.08 // Variação de -4% a +4%
    currentPrice = Math.max(currentPrice * (1 + variation), 1)

    data.push({
      date: date.toLocaleDateString('pt-BR'),
      value: Math.round(currentPrice * 100) / 100,
      timestamp: date.getTime(),
    })
  }

  return data
}

// Configuração do gráfico baseada no período selecionado
const chartConfig = computed(() => {
  const data = generateMockData(selectedTimeRange.value)
  const currentPrice = data[data.length - 1]?.value || 0
  const previousPrice = data[data.length - 2]?.value || currentPrice
  const change = currentPrice - previousPrice

  const color = change >= 0 ? '#04CE00' : '#FF4757'

  return {
    data,
    colors: [color],
    legend: [
      {
        label: ticker.toUpperCase(),
        color,
        value: `R$ ${currentPrice.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      },
    ],
  }
})
</script>

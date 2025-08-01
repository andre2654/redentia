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
              color="neutral"
              :variant="selectedTimeRange === 'month' ? 'soft' : 'link'"
              label="Mês"
              @click="selectedTimeRange = 'month'"
            />
            <UButton
              color="neutral"
              :variant="selectedTimeRange === 'year' ? 'soft' : 'link'"
              label="Ano"
              @click="selectedTimeRange = 'year'"
            />
            <UButton
              color="neutral"
              :variant="selectedTimeRange === 'ytd' ? 'soft' : 'link'"
              label="Ano até hoje"
              @click="selectedTimeRange = 'ytd'"
            />
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

type ChartTimeRange = 'month' | 'year' | 'ytd'

const route = useRoute()
const { getAsset } = useAssetsService()

const ticker = route.params.ticker as string
const asset = await getAsset(ticker)
const selectedTimeRange = ref<ChartTimeRange>('month')

// Mock data melhorado com dados realistas
const generateMockData = (timeRange: ChartTimeRange) => {
  const getDaysFromRange = (range: ChartTimeRange): number => {
    switch (range) {
      case 'month':
        return 30
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

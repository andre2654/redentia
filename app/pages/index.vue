<template>
  <NuxtLayout title="Visão geral">
    <div class="flex h-full flex-col gap-4 pt-6">
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Ações e fundos imobiliarios</h2>
        <p class="text-[13px] font-extralight">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          vulputate erat non massa tristique.
        </p>
      </div>
      <MoleculesSearchAssets class="rounded-none border-y py-4" />
      <div class="flex items-center gap-6 px-6">
        <MoleculesTickerIndicator
          name="IBOVESPA"
          value="+21,01%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
        />
        <MoleculesTickerIndicator
          name="FII"
          value="+21,01%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
        />
        <MoleculesTickerIndicator
          name="Dólar"
          value="+21,01%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
        />
      </div>
      <div class="w-full border-b p-4">
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h2 class="mb-4 text-lg font-semibold">
              Cotação <span class="max-md:hidden">do IBOV</span>
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
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Maiores altas e baixas</h2>
        <p class="text-[13px] font-extralight">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          vulputate erat non massa tristique.
        </p>
        <div class="mt-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <IconAi class="fill-secondary h-5" />
            <UCheckbox v-model="showMap" color="secondary" />
            <h2 class="text-secondary">Mostrar mapa</h2>
          </div>
          <div v-if="showMap" class="flex gap-2">
            <UButtonGroup orientation="horizontal" variant="soft" size="xs">
              <UButton
                color="neutral"
                :variant="treemapFilter === 'all' ? 'soft' : 'link'"
                label="Todos"
                @click="treemapFilter = 'all'"
              />
              <UButton
                color="green"
                :variant="treemapFilter === 'positive' ? 'soft' : 'link'"
                label="Altas"
                @click="treemapFilter = 'positive'"
              />
              <UButton
                color="red"
                :variant="treemapFilter === 'negative' ? 'soft' : 'link'"
                label="Baixas"
                @click="treemapFilter = 'negative'"
              />
            </UButtonGroup>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-3 px-6">
        <h2 class="text-[18px] font-bold">Maiores altas e baixas</h2>
        <div v-if="showMap">
          <AtomsGraphTreemap
            :data="stocksData"
            :height="400"
            :show-positive="
              treemapFilter === 'all' || treemapFilter === 'positive'
            "
            :show-negative="
              treemapFilter === 'all' || treemapFilter === 'negative'
            "
          />
        </div>
        <div v-else class="flex flex-wrap gap-4">
          <AtomsTicker v-for="index in 8" :key="index" />
        </div>
        <NuxtLink
          to="/assets"
          class="mt-4 flex items-center justify-center gap-2 hover:underline"
        >
          Ver todos
        </NuxtLink>
      </div>
      <div class="flex flex-col gap-3 px-6">
        <h2 class="text-[18px] font-bold">Maiores baixas e baixas</h2>
        <div class="flex flex-wrap gap-4">
          <AtomsTicker v-for="index in 8" :key="index" />
        </div>
      </div>
      <NuxtLink
        to="/assets"
        class="mt-4 flex items-center justify-center gap-2 hover:underline"
      >
        Ver todos
      </NuxtLink>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

type ChartTimeRange = 'month' | 'year' | 'ytd'

const selectedTimeRange = ref<ChartTimeRange>('month')
const showMap = ref(true)
const treemapFilter = ref<'all' | 'positive' | 'negative'>('all')

// Dados mock para o treemap de ações
const stocksData = [
  {
    symbol: 'PETR4',
    name: 'Petrobras PN',
    price: 32.45,
    change: 8.5,
    volume: 45000000,
  },
  {
    symbol: 'VALE3',
    name: 'Vale ON',
    price: 68.2,
    change: -6.8,
    volume: 38000000,
  },
  {
    symbol: 'ITUB4',
    name: 'Itaú Unibanco PN',
    price: 28.9,
    change: 12.3,
    volume: 42000000,
  },
  {
    symbol: 'BBDC4',
    name: 'Bradesco PN',
    price: 13.85,
    change: -9.2,
    volume: 35000000,
  },
  {
    symbol: 'ABEV3',
    name: 'Ambev ON',
    price: 11.76,
    change: 4.7,
    volume: 28000000,
  },
  {
    symbol: 'WEGE3',
    name: 'WEG ON',
    price: 45.3,
    change: -3.4,
    volume: 15000000,
  },
  {
    symbol: 'MGLU3',
    name: 'Magazine Luiza ON',
    price: 8.45,
    change: -15.6,
    volume: 55000000,
  },
  {
    symbol: 'VVAR3',
    name: 'Via Varejo ON',
    price: 3.22,
    change: 18.9,
    volume: 32000000,
  },
  {
    symbol: 'SUZB3',
    name: 'Suzano ON',
    price: 52.8,
    change: 7.1,
    volume: 18000000,
  },
  {
    symbol: 'JBSS3',
    name: 'JBS ON',
    price: 34.2,
    change: -4.8,
    volume: 22000000,
  },
  {
    symbol: 'RENT3',
    name: 'Localiza ON',
    price: 65.4,
    change: 9.3,
    volume: 16000000,
  },
  {
    symbol: 'LREN3',
    name: 'Lojas Renner ON',
    price: 19.85,
    change: -7.9,
    volume: 25000000,
  },
  {
    symbol: 'RADL3',
    name: 'Raia Drogasil ON',
    price: 26.7,
    change: 5.2,
    volume: 14000000,
  },
  {
    symbol: 'RAIL3',
    name: 'Rumo ON',
    price: 18.9,
    change: -11.4,
    volume: 30000000,
  },
  {
    symbol: 'CCRO3',
    name: 'CCR ON',
    price: 10.25,
    change: 13.7,
    volume: 26000000,
  },
  {
    symbol: 'CSAN3',
    name: 'Cosan ON',
    price: 15.6,
    change: -8.1,
    volume: 20000000,
  },
  {
    symbol: 'PCAR3',
    name: 'P&G Car ON',
    price: 42.15,
    change: 6.9,
    volume: 12000000,
  },
  {
    symbol: 'BRDT3',
    name: 'Bradesco ON',
    price: 23.45,
    change: -5.3,
    volume: 19000000,
  },
  {
    symbol: 'EMBR3',
    name: 'Embraer ON',
    price: 38.7,
    change: 10.8,
    volume: 17000000,
  },
  {
    symbol: 'GOAU4',
    name: 'Gerdau PN',
    price: 12.3,
    change: -12.5,
    volume: 29000000,
  },
]

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
  const basePrice = 1000
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
        label: 'IBOV',
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

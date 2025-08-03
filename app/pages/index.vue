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
        <div class="mt-3 flex items-center gap-2">
          <IconAi class="fill-secondary h-5" />
          <UCheckbox v-model="showMap" color="secondary" />
          <h2 class="text-secondary">Mostrar mapa</h2>
        </div>
      </div>
      <div class="flex flex-col gap-3 px-6">
        <h2 class="text-[18px] font-bold">Maiores altas e baixas</h2>
        <div class="flex flex-wrap gap-4">
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
const selectedTimeRange = ref<ChartTimeRange>('month')
const showMap = ref(true)

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

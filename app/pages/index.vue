<template>
  <NuxtLayout title="Visão geral" hide-search-bar>
    <div class="flex h-full flex-col gap-4 pt-6">
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Ações e fundos imobiliarios</h2>
        <p class="text-[13px] font-extralight">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          vulputate erat non massa tristique.
        </p>
      </div>
      <div class="carousel-container overflow-hidden rounded-[30px]">
        <UCarousel
          v-slot="{ item }"
          class="w-full"
          loop
          dots
          :items="[
            {
              desktop: '/assets/images/banner.png',
              mobile: '/assets/images/banner-mobile.png',
            },
            {
              desktop: '/assets/images/banner2.png',
              mobile: '/assets/images/banner2-mobile.png',
            },
          ]"
          :ui="{
            dots: 'bottom-3',
            dot: 'bg-white/10 data-[state=active]:bg-white',
            item: 'ps-0',
          }"
        >
          <img :src="item.desktop" class="max-md:hidden" />
          <img :src="item.mobile" class="md:hidden" />
        </UCarousel>
      </div>
      <MoleculesSearchAssets
        class="max-w-[400px] rounded-full bg-white/10 py-4"
      />
      <div class="flex items-center gap-6 px-6">
        <MoleculesTickerIndicator
          name="IBOVESPA"
          value="+21,01%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          :loading="loading"
        />
        <MoleculesTickerIndicator
          name="FII"
          value="+21,01%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          :loading="loading"
        />
        <MoleculesTickerIndicator
          name="Dólar"
          value="+21,01%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          :loading="loading"
        />
      </div>
      <div class="w-full p-4">
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
                :disabled="loading"
                @click="selectedTimeRange = 'month'"
              />
              <UButton
                color="neutral"
                :variant="selectedTimeRange === 'year' ? 'soft' : 'link'"
                label="Ano"
                :disabled="loading"
                @click="selectedTimeRange = 'year'"
              />
              <UButton
                color="neutral"
                :variant="selectedTimeRange === 'ytd' ? 'soft' : 'link'"
                label="Ano até hoje"
                :disabled="loading"
                @click="selectedTimeRange = 'ytd'"
              />
            </UButtonGroup>
          </div>
          <AtomsGraphLine
            :data="chartConfig.data"
            :colors="chartConfig.colors"
            :legend="chartConfig.legend"
            :height="350"
            :loading="loading"
          />
        </div>
      </div>
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Rankings</h2>
        <p class="text-[13px] font-extralight">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          vulputate erat non massa tristique.
        </p>
        <label
          for="map-toggle"
          class="hover:bg-secondary/10 mt-3 flex max-w-fit items-center justify-between gap-4 rounded-full border px-3 py-2"
          :class="{
            'bg-secondary/15 dark:bg-tertiary/60 !border-tertiary': showMap,
          }"
        >
          <IconAi class="fill-secondary h-5" />
          <h2 class="text-secondary select-none">Mostrar mapa</h2>
          <USwitch
            id="map-toggle"
            v-model="showMap"
            color="secondary"
            checked-icon="lucide-check"
            :ui="{
              base: 'data-[state=checked]:border-secondary',
            }"
          />
        </label>
      </div>
      <div v-if="showMap" class="mb-6 flex flex-col px-6">
        <UButtonGroup orientation="horizontal" variant="soft" class="ml-auto">
          <UButton
            color="neutral"
            :variant="treemapFilter === 'all' ? 'soft' : 'link'"
            label="Todos"
            @click="treemapFilter = 'all'"
          />
          <UButton
            color="neutral"
            :variant="treemapFilter === 'positive' ? 'soft' : 'link'"
            label="Altas"
            @click="treemapFilter = 'positive'"
          />
          <UButton
            color="neutral"
            :variant="treemapFilter === 'negative' ? 'soft' : 'link'"
            label="Baixas"
            @click="treemapFilter = 'negative'"
          />
        </UButtonGroup>
        <AtomsGraphTreemap
          :data="stocksData"
          :height="550"
          :show-positive="
            treemapFilter === 'all' || treemapFilter === 'positive'
          "
          :show-negative="
            treemapFilter === 'all' || treemapFilter === 'negative'
          "
        />
      </div>
      <template v-else>
        <div
          class="grid grid-cols-4 gap-2 max-[1550px]:grid-cols-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1"
        >
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
          >
            <h2 class="text-[18px] font-bold">Ações</h2>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.top.stocks"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink to="/assets" class="hover:underline">
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6 max-[600px]:hidden"
          >
            <h2 class="text-[18px] font-bold">ETFs</h2>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.top.etfs"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink to="/assets" class="hover:underline">
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6 max-[900px]:hidden"
          >
            <h2 class="text-[18px] font-bold">Reits</h2>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.top.reits"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink to="/assets" class="hover:underline">
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6 max-[1550px]:hidden"
          >
            <h2 class="text-[18px] font-bold">BDRs</h2>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.top.bdrs"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink to="/assets" class="hover:underline">
              Ver todos
            </NuxtLink>
          </div>
        </div>

        <div
          class="grid grid-cols-4 gap-2 max-[1550px]:grid-cols-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1"
        >
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
          >
            <h2 class="text-[18px] font-bold">Ações</h2>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.bottom.stocks"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink to="/assets" class="hover:underline">
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6 max-[600px]:hidden"
          >
            <h2 class="text-[18px] font-bold">ETFs</h2>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.bottom.etfs"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink to="/assets" class="hover:underline">
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6 max-[900px]:hidden"
          >
            <h2 class="text-[18px] font-bold">Reits</h2>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.bottom.reits"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink to="/assets" class="hover:underline">
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6 max-[1550px]:hidden"
          >
            <h2 class="text-[18px] font-bold">BDRs</h2>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.bottom.bdrs"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink to="/assets" class="hover:underline">
              Ver todos
            </NuxtLink>
          </div>
        </div>
      </template>

      <div
        class="dark:bg-tertiary/40 text-secondary flex w-full flex-col gap-3 rounded-[30px] bg-black/5 px-6 py-4"
      >
        <div class="flex items-center gap-2 px-3 py-2">
          <IconAi class="fill-secondary h-5" />
          <h2 class="text-lg font-semibold">Filtros inteligentes</h2>
        </div>
        <div class="flex w-full gap-6 px-6 max-md:flex-col md:flex-wrap">
          <NuxtLink to="/redentia/about" class="hover:underline">
            Menores P/VP
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { ChartTimeRange } from '~/types/chart'

import { generateChartConfig } from '~/helpers/utils'

const { getTopStocks, getTopETFs, getTopReits, getTopBDRs } = useAssetsService()

const selectedTimeRange = ref<ChartTimeRange>('month')
const showMap = ref(false)
const loading = ref(true)
const treemapFilter = ref<'all' | 'positive' | 'negative'>('all')

// Dados mock para o treemap - separados por categorias
const stocksData = [
  // AÇÕES
  {
    symbol: 'PETR4',
    name: 'Petrobras PN',
    price: 32.45,
    change: 8.5,
    volume: 45000000,
    category: 'acoes' as const,
  },
  {
    symbol: 'VALE3',
    name: 'Vale ON',
    price: 68.2,
    change: -6.8,
    volume: 38000000,
    category: 'acoes' as const,
  },
  {
    symbol: 'ITUB4',
    name: 'Itaú Unibanco PN',
    price: 28.9,
    change: 12.3,
    volume: 42000000,
    category: 'acoes' as const,
  },
  {
    symbol: 'BBDC4',
    name: 'Bradesco PN',
    price: 13.85,
    change: -9.2,
    volume: 35000000,
    category: 'acoes' as const,
  },
  {
    symbol: 'ABEV3',
    name: 'Ambev ON',
    price: 11.76,
    change: 4.7,
    volume: 28000000,
    category: 'acoes' as const,
  },
  {
    symbol: 'WEGE3',
    name: 'WEG ON',
    price: 45.3,
    change: -3.4,
    volume: 15000000,
    category: 'acoes' as const,
  },
  {
    symbol: 'MGLU3',
    name: 'Magazine Luiza ON',
    price: 8.45,
    change: -15.6,
    volume: 55000000,
    category: 'acoes' as const,
  },
  {
    symbol: 'VVAR3',
    name: 'Via Varejo ON',
    price: 3.22,
    change: 18.9,
    volume: 32000000,
    category: 'acoes' as const,
  },
  {
    symbol: 'SUZB3',
    name: 'Suzano ON',
    price: 52.8,
    change: 7.1,
    volume: 18000000,
    category: 'acoes' as const,
  },
  {
    symbol: 'JBSS3',
    name: 'JBS ON',
    price: 34.2,
    change: -4.8,
    volume: 22000000,
    category: 'acoes' as const,
  },
  {
    symbol: 'RENT3',
    name: 'Localiza ON',
    price: 65.4,
    change: 9.3,
    volume: 16000000,
    category: 'acoes' as const,
  },
  {
    symbol: 'LREN3',
    name: 'Lojas Renner ON',
    price: 19.85,
    change: -7.9,
    volume: 25000000,
    category: 'acoes' as const,
  },

  // FIIs (Fundos Imobiliários)
  {
    symbol: 'HGLG11',
    name: 'CSHG Logística FII',
    price: 145.5,
    change: 5.8,
    volume: 2500000,
    category: 'fiis' as const,
  },
  {
    symbol: 'XPML11',
    name: 'XP Malls FII',
    price: 98.3,
    change: -3.2,
    volume: 1800000,
    category: 'fiis' as const,
  },
  {
    symbol: 'BCFF11',
    name: 'BTG Pactual Corporate FII',
    price: 89.75,
    change: 7.4,
    volume: 3200000,
    category: 'fiis' as const,
  },
  {
    symbol: 'KNRI11',
    name: 'Kinea Rendimentos Imobiliários FII',
    price: 95.6,
    change: -8.1,
    volume: 2100000,
    category: 'fiis' as const,
  },
  {
    symbol: 'VISC11',
    name: 'Vinci Shopping Centers FII',
    price: 105.2,
    change: 4.3,
    volume: 1900000,
    category: 'fiis' as const,
  },
  {
    symbol: 'MXRF11',
    name: 'Maxi Renda FII',
    price: 11.85,
    change: -5.7,
    volume: 4500000,
    category: 'fiis' as const,
  },
  {
    symbol: 'HGRU11',
    name: 'CSHG Renda Urbana FII',
    price: 115.4,
    change: 6.9,
    volume: 1600000,
    category: 'fiis' as const,
  },
  {
    symbol: 'BTLG11',
    name: 'BTG Logística FII',
    price: 98.95,
    change: -4.5,
    volume: 2800000,
    category: 'fiis' as const,
  },
  {
    symbol: 'XPPR11',
    name: 'XP Properties FII',
    price: 102.3,
    change: 8.7,
    volume: 1400000,
    category: 'fiis' as const,
  },
  {
    symbol: 'GGRC11',
    name: 'General Shopping e Outlets FII',
    price: 85.2,
    change: -6.3,
    volume: 2200000,
    category: 'fiis' as const,
  },
]

const topAssets = ref({
  loading: false,
  top: {
    stocks: [],
    etfs: [],
    reits: [],
    bdrs: [],
  },
  bottom: {
    stocks: [],
    etfs: [],
    reits: [],
    bdrs: [],
  },
})

const chartConfig = computed(() =>
  generateChartConfig({
    timeRange: selectedTimeRange.value,
    label: 'IBOV',
    basePrice: 1000,
  })
)

onMounted(async () => {
  const [
    [topStocks, bottomStocks],
    [topETFs, bottomETFs],
    [topReits, bottomReits],
    [topBDRs, bottomBDRs],
  ] = await Promise.all([
    Promise.all([getTopStocks('top', 100000), getTopStocks('bottom', 100000)]),
    Promise.all([getTopETFs('top', 100000), getTopETFs('bottom', 100000)]),
    Promise.all([getTopReits('top', 100000), getTopReits('bottom', 100000)]),
    Promise.all([getTopBDRs('top', 100000), getTopBDRs('bottom', 100000)]),
  ])

  topAssets.value.top.stocks = topStocks
  topAssets.value.top.etfs = topETFs
  topAssets.value.top.reits = topReits
  topAssets.value.top.bdrs = topBDRs

  topAssets.value.bottom.stocks = bottomStocks
  topAssets.value.bottom.etfs = bottomETFs
  topAssets.value.bottom.reits = bottomReits
  topAssets.value.bottom.bdrs = bottomBDRs

  setTimeout(() => {
    loading.value = false
  }, 3000)
})

definePageMeta({
  layoutTransition: {
    name: 'slide-in',
  },
})
</script>

<style scoped>
.carousel-container {
  box-shadow: 0px 0px 80px 0px rgba(55, 77, 60, 0.6);
}
</style>

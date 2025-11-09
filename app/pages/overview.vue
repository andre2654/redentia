<template>
  <NuxtLayout title="Visão geral" hide-search-bar>
    <div class="flex h-full flex-col gap-4 pt-6">
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Ações e fundos imobiliarios</h2>
        <p class="text-[13px] font-extralight">
          Acompanhe preços, variações e tendências de ações e FIIs em tempo
          real.
        </p>
      </div>
      <!-- <div class="carousel-container overflow-hidden md:rounded-[30px]">
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
      </div> -->
      <MoleculesSearchAssets
        class="rounded-full py-4 md:max-w-[400px] md:bg-white/10"
      />
      <div class="flex items-center gap-6 px-6">
        <MoleculesTickerIndicator
          name="IBOVESPA"
          :value="ibovIndicator"
          help-text="Índice Bovespa - principal indicador de desempenho das ações negociadas na B3."
          :loading="loadingIndicators"
        />
        <MoleculesTickerIndicator
          name="IFIX"
          :value="ifixIndicator"
          help-text="Índice de Fundos Imobiliários - mede o desempenho dos FIIs mais negociados."
          :loading="loadingIndicators"
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
                :variant="selectedTimeRange === '3years' ? 'soft' : 'link'"
                label="3 anos"
                :disabled="loading"
                @click="selectedTimeRange = '3years'"
              />
              <UButton
                color="neutral"
                :variant="selectedTimeRange === 'full' ? 'soft' : 'link'"
                label="Tudo"
                :disabled="loading"
                @click="selectedTimeRange = 'full'"
              />
            </UButtonGroup>
          </div>
          <AtomsGraphLine
            :data="ibovChartData"
            :legend="ibovChartLabel"
            :height="350"
            :loading="loading"
          />
        </div>
      </div>
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Rankings</h2>
        <p class="text-[13px] font-extralight">
          Veja os destaques de altas e baixas do dia. Ative o mapa para
          visualizar o desempenho por setor.
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
            class="flex flex-col gap-3 rounded-[30px]  p-6"
          >
            <h2 class="text-[18px] font-bold">Ações</h2>
            <div class="flex flex-col divide-y border rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.top.stocks"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.top.stocks }"
              class="hover:underline"
            >
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px]  p-6 max-[600px]:hidden"
          >
            <h2 class="text-[18px] font-bold">ETFs</h2>
            <div class="flex flex-col divide-y border rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.top.etfs"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.top.etfs }"
              class="hover:underline"
            >
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px]  p-6 max-[900px]:hidden"
          >
            <h2 class="text-[18px] font-bold">Reits</h2>
            <div class="flex flex-col divide-y border rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.top.reits"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.top.reits }"
              class="hover:underline"
            >
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px]  p-6 max-[1550px]:hidden"
          >
            <h2 class="text-[18px] font-bold">BDRs</h2>
            <div class="flex flex-col divide-y border rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.top.bdrs"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.top.bdrs }"
              class="hover:underline"
            >
              Ver todos
            </NuxtLink>
          </div>
        </div>

        <div
          class="grid grid-cols-4 gap-2 max-[1550px]:grid-cols-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1"
        >
          <div
            class="flex flex-col gap-3 rounded-[30px]  p-6"
          >
            <h2 class="text-[18px] font-bold">Ações</h2>
            <div class="flex flex-col divide-y border rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.bottom.stocks"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.bottom.stocks }"
              class="hover:underline"
            >
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px]  p-6 max-[600px]:hidden"
          >
            <h2 class="text-[18px] font-bold">ETFs</h2>
            <div class="flex flex-col divide-y border rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.bottom.etfs"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.bottom.etfs }"
              class="hover:underline"
            >
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px]  p-6 max-[900px]:hidden"
          >
            <h2 class="text-[18px] font-bold">Reits</h2>
            <div class="flex flex-col divide-y border rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.bottom.reits"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.bottom.reits }"
              class="hover:underline"
            >
              Ver todos
            </NuxtLink>
          </div>
          <div
            class="flex flex-col gap-3 rounded-[30px]  p-6 max-[1550px]:hidden"
          >
            <h2 class="text-[18px] font-bold">BDRs</h2>
            <div class="flex flex-col divide-y border rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.bottom.bdrs"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.bottom.bdrs }"
              class="hover:underline"
            >
              Ver todos
            </NuxtLink>
          </div>
        </div>
      </template>

      <div
        class="dark:bg-tertiary/40 text-secondary flex w-full flex-col gap-3 bg-black/5 px-6 py-4 md:rounded-[30px]"
      >
        <div class="flex items-center gap-2 px-3 py-2">
          <IconAi class="fill-secondary h-5" />
          <h2 class="text-lg font-semibold">Filtros inteligentes</h2>
        </div>
        <div class="flex w-full gap-3 px-6 max-md:flex-col md:flex-wrap">
          <NuxtLink
            :to="{ path: '/search', query: { p_max: 20 } }"
            class="hover:underline"
          >
            Preço até R$ 20
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { mc_max: 2000000000 } }"
            class="hover:underline"
          >
            Small Caps (MC ≤ R$ 2 bi)
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { ch_min: 0 } }"
            class="hover:underline"
          >
            Alta no dia (> 0%)
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { ch_max: 0 } }"
            class="hover:underline"
          >
            Queda no dia (< 0%)
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { stock: 0, bdr: 0 } }"
            class="hover:underline"
          >
            Somente FIIs
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { stock: 0, reit: 0 } }"
            class="hover:underline"
          >
            Somente BDRs
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { p_min: 10, p_max: 50 } }"
            class="hover:underline"
          >
            Preço entre R$ 10 e R$ 50
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { ChartTimeRange } from '~/types/chart'

const {
  getTopStocks,
  getTopETFs,
  getTopReits,
  getTopBDRs,
  getIndiceHistoricPrices,
} = useAssetsService()

const selectedTimeRange = ref<ChartTimeRange>('month')
const showMap = ref(false)
const loading = ref(true)
const loadingIndicators = ref(true)
const treemapFilter = ref<'all' | 'positive' | 'negative'>('all')

const rankingLinkQueries = {
  top: {
    stocks: { ch_min: 0, group: 'stocks', reit: 0, bdr: 0 },
    etfs: { ch_min: 0, group: 'etfs', reit: 0, bdr: 0 },
    reits: { ch_min: 0, group: 'reits', stock: 0, bdr: 0 },
    bdrs: { ch_min: 0, group: 'bdrs', stock: 0, reit: 0 },
  },
  bottom: {
    stocks: { ch_max: 0, group: 'stocks', reit: 0, bdr: 0 },
    etfs: { ch_max: 0, group: 'etfs', reit: 0, bdr: 0 },
    reits: { ch_max: 0, group: 'reits', stock: 0, bdr: 0 },
    bdrs: { ch_max: 0, group: 'bdrs', stock: 0, reit: 0 },
  },
} as const

// Dados mock para o treemap - separados por categorias
const stocksData = ref([])

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

interface ChartPoint {
  date: string
  value: number
  timestamp: number
}

interface IndiceData {
  name: string
  market_price: number
  price_at: string
}

const ibovChartData = ref<ChartPoint[]>([])
const ibovIndicator = ref('+0,00%')
const ifixIndicator = ref('+0,00%')

const ibovChartLabel = computed(() => [
  {
    label: 'IBOV',
    color: '#10b981',
    value:
      ibovChartData.value.length > 0
        ? ibovChartData.value[ibovChartData.value.length - 1].value.toFixed(2)
        : '0',
  },
])

async function fetchIbovChartData() {
  loading.value = true
  let period: '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full' =
    '1mo'
  if (selectedTimeRange.value === 'month') period = '1mo'
  else if (selectedTimeRange.value === 'year') period = '12mo'
  else if (selectedTimeRange.value === '3years') period = '3y'
  else if (selectedTimeRange.value === 'full') period = 'full'

  const data = await getIndiceHistoricPrices('ibov', period)

  ibovChartData.value = Array.isArray(data)
    ? data.map((item: IndiceData) => ({
        date: item.price_at,
        value: item.market_price,
        timestamp: new Date(item.price_at).getTime(),
      }))
    : []
  loading.value = false
}

async function fetchIndicatorsData() {
  loadingIndicators.value = true
  try {
    const [ibovData, ifixData] = await Promise.all([
      getIndiceHistoricPrices('ibov', '1mo'),
      getIndiceHistoricPrices('ifix', '1mo'),
    ])

    // Calcular variação do IBOV (última cotação vs penúltima)
    if (Array.isArray(ibovData) && ibovData.length > 1) {
      const lastPrice = ibovData[ibovData.length - 1].market_price
      const previousPrice = ibovData[ibovData.length - 2].market_price
      const variation = ((lastPrice - previousPrice) / previousPrice) * 100
      ibovIndicator.value = `${variation >= 0 ? '+' : ''}${variation.toFixed(2)}%`
    }

    // Calcular variação do IFIX (última cotação vs penúltima)
    if (Array.isArray(ifixData) && ifixData.length > 1) {
      const lastPrice = ifixData[ifixData.length - 1].market_price
      const previousPrice = ifixData[ifixData.length - 2].market_price
      const variation = ((lastPrice - previousPrice) / previousPrice) * 100
      ifixIndicator.value = `${variation >= 0 ? '+' : ''}${variation.toFixed(2)}%`
    }
  } catch (error) {
    console.error('Erro ao buscar dados dos indicadores:', error)
  }
  loadingIndicators.value = false
}

onMounted(async () => {
  // Buscar dados dos índices
  fetchIbovChartData()
  fetchIndicatorsData()

  const [
    [topStocks, bottomStocks],
    [topETFs, bottomETFs],
    [topReits, bottomReits],
    [topBDRs, bottomBDRs],
  ] = await Promise.all([
    Promise.all([
      getTopStocks('top', 1000000),
      getTopStocks('bottom', 1000000),
    ]),
    Promise.all([getTopETFs('top', 1000000), getTopETFs('bottom', 1000000)]),
    Promise.all([getTopReits('top', 1000000), getTopReits('bottom', 1000000)]),
    Promise.all([getTopBDRs('top', 1000000), getTopBDRs('bottom', 1000000)]),
  ])

  topAssets.value.top.stocks = topStocks
  topAssets.value.top.etfs = topETFs
  topAssets.value.top.reits = topReits
  topAssets.value.top.bdrs = topBDRs

  topAssets.value.bottom.stocks = bottomStocks
  topAssets.value.bottom.etfs = bottomETFs
  topAssets.value.bottom.reits = bottomReits
  topAssets.value.bottom.bdrs = bottomBDRs

  const newdatatreemap = []
  topStocks.forEach((stock) => {
    newdatatreemap.push({
      symbol: stock.ticker,
      name: stock.name,
      price: stock.market_price,
      change: stock.change_percent,
      category: 'acoes' as const,
    })
  })

  bottomStocks.forEach((stock) => {
    newdatatreemap.push({
      symbol: stock.ticker,
      name: stock.name,
      price: stock.market_price,
      change: stock.change_percent,
      category: 'acoes' as const,
    })
  })

  topReits.forEach((stock) => {
    newdatatreemap.push({
      symbol: stock.ticker,
      name: stock.name,
      price: stock.market_price,
      change: stock.change_percent,
      category: 'fiis' as const,
    })
  })

  bottomReits.forEach((stock) => {
    newdatatreemap.push({
      symbol: stock.ticker,
      name: stock.name,
      price: stock.market_price,
      change: stock.change_percent,
      category: 'fiis' as const,
    })
  })

  stocksData.value = newdatatreemap
})

// Atualiza o gráfico ao trocar o período
watch(selectedTimeRange, () => {
  fetchIbovChartData()
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

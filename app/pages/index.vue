<template>
  <NuxtLayout :name="layoutName" title="Visão geral">
    <!-- CTA Section -->
    <section v-if="!authStore.isAuthenticated">
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/20 to-transparent px-6 py-14 text-center text-white shadow-[0_40px_120px_rgba(4,47,84,0.5)]">
        <div class="relative">
          <IconLogoFull class="mx-auto mb-4 h-10 fill-white md:mb-6 md:h-12" />
          <h2 class="mb-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl">
            Pronto para começar a investir melhor?
          </h2>
          <p class="mb-6 px-2 text-base leading-relaxed text-gray-300 sm:text-lg md:mb-8 md:text-xl">
            Crie sua conta gratuitamente e tenha acesso a todas as ferramentas
          </p>
          <div class="flex w-full flex-col items-center justify-center gap-3 px-2 sm:flex-row sm:gap-4">
            <UButton
              to="/auth/register"
              color="secondary"
              size="xl"
              icon="i-lucide-user-plus"
              class="w-full px-6 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-secondary/50 sm:w-auto sm:px-8"
            >
              Criar Conta Grátis
            </UButton>
            <UButton
              to="/auth/login"
              color="white"
              variant="outline"
              size="xl"
              icon="i-lucide-log-in"
              class="w-full px-6 transition-all hover:scale-105 sm:w-auto sm:px-8"
            >
              Já tenho conta
            </UButton>
          </div>
          <p class="mt-4 text-xs text-gray-400 md:mt-6 md:text-sm">
            Sem taxa de inscrição • Cancele quando quiser • Suporte 24/7
          </p>
        </div>
      </div>
    </section>

    <AtomsTickerCarousel class="mt-5 w-full" big />

    <div class="flex h-full flex-col gap-4 pt-6">
      <div v-if="!authStore.isAuthenticated" class="flex flex-col">
        <div class="mb-12 text-center md:mb-16">
          <h2 class="mb-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl">
            Acompanhe o Mercado em Tempo Real
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Dados atualizados de ações, FIIs e muito mais
          </p>
        </div>

        <div class="mb-8 grid gap-6 md:mb-12 md:grid-cols-2 md:gap-8">
          <div class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20 md:p-8">
            <div class="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
              <div class="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
            </div>
            <div class="relative flex flex-col gap-4">
              <div class="mb-2 flex items-center gap-2">
                <span class="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-lg shadow-green-500/50 md:h-3 md:w-3" />
                <span class="text-xs font-medium uppercase tracking-wider text-green-400 md:text-sm">Ao Vivo</span>
              </div>
              <h3 class="mb-1 flex items-center gap-2 text-xl font-bold text-white md:mb-2 md:text-2xl">
                IBOVESPA
                <UIcon name="i-lucide-trending-up" class="size-5 text-green-400 animate-bounce-subtle md:size-6" />
              </h3>
              <p class="mb-1 text-3xl font-bold text-green-400 tabular-nums sm:text-4xl md:text-5xl">
                {{ ibovIndicator }}
              </p>
              <p class="text-xs leading-tight text-gray-400 md:text-sm md:leading-normal">
                Índice Bovespa - principal indicador de desempenho das ações
              </p>
            </div>
          </div>

          <div class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 md:p-8">
            <div class="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
              <div class="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
            </div>
            <div class="relative flex flex-col gap-4">
              <div class="mb-2 flex items-center gap-2">
                <span class="h-2 w-2 animate-pulse rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 md:h-3 md:w-3" />
                <span class="text-xs font-medium uppercase tracking-wider text-blue-400 md:text-sm">Ao Vivo</span>
              </div>
              <h3 class="mb-1 flex items-center gap-2 text-xl font-bold text-white md:mb-2 md:text-2xl">
                IFIX
                <UIcon name="i-lucide-trending-up" class="size-5 text-blue-400 animate-bounce-subtle md:size-6" />
              </h3>
              <p class="mb-1 text-3xl font-bold text-blue-400 tabular-nums sm:text-4xl md:text-5xl">
                {{ ifixIndicator }}
              </p>
              <p class="text-xs leading-tight text-gray-400 md:text-sm md:leading-normal">
                Índice de Fundos Imobiliários - desempenho dos FIIs
              </p>
            </div>
          </div>
        </div>

        <MoleculesSearchAssets class="w-full rounded-full py-4 md:bg-white/10" />
      </div>

      <div class="flex w-full flex-col">
        <div class="flex w-full items-center justify-between p-6 pb-0">
          <div class="flex flex-col gap-4">
            <h2 class="text-[30px] font-semibold">
              {{
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(ibovLastPrice)
              }}
            </h2>
            <p class="mb-4 opacity-70">Cotação do IBOV</p>
          </div>
          <MoleculesPeriodSelector
            v-model="selectedTimeRange"
            :loading="loading"
          />
        </div>
        <AtomsGraphLine
          :data="ibovChartData"
          :legend="ibovChartLabel"
          :height="350"
          :loading="loading"
        />
      </div>

      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Rankings</h2>
        <p class="text-[13px] font-extralight">
          Veja os destaques de altas e baixas do dia. Ative o mapa para visualizar o desempenho por setor.
        </p>
        <label
          for="map-toggle"
          class="mt-3 flex max-w-fit items-center justify-between gap-4 rounded-full border px-3 py-2 transition hover:bg-secondary/10"
          :class="{
            'bg-secondary/15 !border-tertiary dark:bg-tertiary/60': showMap,
          }"
        >
          <IconAi class="h-5 fill-secondary" />
          <h2 class="select-none text-secondary">Mostrar mapa</h2>
          <USwitch
            id="map-toggle"
            v-model="showMap"
            color="secondary"
            checked-icon="lucide-check"
            :ui="{ base: 'data-[state=checked]:border-secondary' }"
          />
        </label>
      </div>

      <div v-if="showMap" class="mb-6 flex flex-col">
        <UButtonGroup orientation="horizontal" variant="soft" class="mx-auto mb-5 mt-6 max-md:px-6">
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
          :show-positive="treemapFilter === 'all' || treemapFilter === 'positive'"
          :show-negative="treemapFilter === 'all' || treemapFilter === 'negative'"
        />
      </div>
      <template v-else>
        <UCarousel
          v-slot="{ item }"
          class="w-full"
          loop
          :items="assetCategories"
          :ui="{ item: 'basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4' }"
        >
          <div class="flex w-full flex-col gap-3 rounded-[30px] py-6">
            <h2 class="text-[25px] font-bold md:text-[18px] max-md:text-center">{{ item.label }}</h2>
            <p class="mb-5 text-[16px] opacity-70 md:hidden mx-auto">Maiores altas</p>
            <div class="flex flex-col gap-1 overflow-hidden rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.top[item.key]"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.top[item.key] }"
              class="text-[20px] transition hover:underline md:text-[15px] max-md:text-center"
            >
              Ver todos
            </NuxtLink>
          </div>
        </UCarousel>

        <UCarousel
          v-slot="{ item }"
          class="w-full"
          loop
          :items="assetCategories"
          :ui="{ item: 'basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4' }"
        >
          <div class="flex w-full flex-col gap-3 rounded-[30px] py-6">
            <h2 class="text-[25px] font-bold md:text-[18px] max-md:text-center">{{ item.label }}</h2>
            <p class="mb-5 text-[16px] opacity-70 md:hidden mx-auto">Maiores baixas</p>
            <div class="flex flex-col gap-1 overflow-hidden rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.bottom[item.key]"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.bottom[item.key] }"
              class="text-[20px] transition hover:underline md:text-[15px] max-md:text-center"
            >
              Ver todos
            </NuxtLink>
          </div>
        </UCarousel>
      </template>

      <div class="flex w-full flex-col gap-3 bg-black/5 px-6 py-4 text-secondary md:rounded-[30px] dark:bg-tertiary/40">
        <div class="flex items-center gap-2 px-3 py-2">
          <IconAi class="h-5 fill-secondary" />
          <h2 class="text-lg font-semibold">Filtros inteligentes</h2>
        </div>
        <div class="flex w-full flex-wrap gap-3 px-6 max-md:flex-col">
          <NuxtLink :to="{ path: '/search', query: { p_max: 20 } }" class="hover:underline">
            Preço até R$ 20
          </NuxtLink>
          <NuxtLink :to="{ path: '/search', query: { mc_max: 2000000000 } }" class="hover:underline">
            Small Caps (MC ≤ R$ 2 bi)
          </NuxtLink>
          <NuxtLink :to="{ path: '/search', query: { ch_min: 0 } }" class="hover:underline">
            Alta no dia (> 0%)
          </NuxtLink>
          <NuxtLink :to="{ path: '/search', query: { ch_max: 0 } }" class="hover:underline">
            Queda no dia (< 0%)
          </NuxtLink>
          <NuxtLink :to="{ path: '/search', query: { stock: 0, bdr: 0 } }" class="hover:underline">
            Somente FIIs
          </NuxtLink>
          <NuxtLink :to="{ path: '/search', query: { stock: 0, reit: 0 } }" class="hover:underline">
            Somente BDRs
          </NuxtLink>
          <NuxtLink :to="{ path: '/search', query: { p_min: 10, p_max: 50 } }" class="hover:underline">
            Preço entre R$ 10 e R$ 50
          </NuxtLink>
        </div>
      </div>
    </div>

    <section v-if="!authStore.isAuthenticated" class="mt-20">
      <div class="w-full">
        <div class="mb-8 text-center md:mb-12">
          <div class="mb-3 flex items-center justify-center gap-2 md:mb-4">
            <IconAi class="h-8 fill-secondary md:h-12" />
          </div>
          <h2 class="mb-2 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl">
            Assessoria com Inteligência Artificial
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Tire dúvidas, compare ativos e receba análises personalizadas
          </p>
        </div>

        <div
            
        class="relative w-full">
          <div
            @click="redirectToLogin('chat')"
            class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-2xl bg-black/60 p-4 transition-all hover:bg-black/70 backdrop-blur-md md:rounded-3xl"
          >
            <div class="max-w-md transform text-center transition-all hover:scale-105">
              <div class="relative mb-4 md:mb-6">
                <div class="absolute inset-0 animate-ping opacity-20">
                  <IconAi class="mx-auto h-12 fill-secondary md:h-16" />
                </div>
                <IconAi class="relative mx-auto h-12 fill-secondary md:h-16" />
              </div>
              <h3 class="mb-2 text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl">
                Converse com nossa IA
              </h3>
              <p class="mb-4 px-2 text-sm leading-relaxed text-gray-300 sm:text-base md:mb-6">
                Faça login e tenha acesso ilimitado à assessoria inteligente
              </p>
              <UButton
                to="/auth/login"
                color="secondary"
                size="xl"
                icon="i-lucide-message-circle"
                class="w-full px-6 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-secondary/50 sm:w-auto sm:px-8"
              >
                Acessar Assessoria
              </UButton>
              <p class="mt-3 text-xs text-gray-400 md:mt-4 md:text-sm">
                Respostas instantâneas • Análises personalizadas
              </p>
            </div>
          </div>

          <div
            class="rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 backdrop-blur-xl md:p-8"
            @click="handleChatCardClick"
          >
            <div class="mb-6 flex flex-col items-center gap-4">
              <h3 class="text-center text-2xl text-white">Faça alguma pergunta</h3>
              <p class="text-center text-[13px] font-light text-gray-400">
                Tire dúvidas sobre investimentos, compare ativos e peça análises em linguagem simples.
              </p>
            </div>

            <div class="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              <button
                v-for="(suggestion, idx) in chatSuggestions"
                :key="idx"
                class="flex h-[120px] items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-3 text-[13px] font-medium opacity-70 transition-all hover:opacity-100 hover:from-white/20"
                disabled
              >
                {{ suggestion }}
              </button>
            </div>

            <div class="space-y-4 opacity-60">
              <div class="flex items-start gap-3">
                <IconLogo class="mt-1 w-6 flex-shrink-0 fill-white" />
                <div class="flex-1 rounded-lg bg-white/5 p-4 backdrop-blur">
                  <p class="text-sm text-white">
                    Olá! Sou a assistente virtual da Redentia. Como posso ajudar você hoje?
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-6 w-full rounded-lg bg-black/20 p-4 backdrop-blur">
              <UTextarea
                placeholder="Faça qualquer pergunta..."
                size="md"
                rows="2"
                disabled
                class="w-full"
                :ui="{ base: 'text-[14px] bg-transparent ring-0 placeholder:text-white/40' }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ChartTimeRange } from '~/types/chart'

const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated',
)

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

const assetCategories = [
  { key: 'stocks', label: 'Ações' },
  { key: 'etfs', label: 'ETFs' },
  { key: 'reits', label: 'Reits' },
  { key: 'bdrs', label: 'BDRs' },
] as const

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
const ibovLastPrice = ref(0)
const ifixIndicator = ref('+0,00%')

const chatSuggestions = [
  'Qual a diferença entre ações e FIIs?',
  'Como funcionam os dividendos?',
  'O que é diversificação?',
  'Quanto devo investir por mês?',
  'Como escolher boas ações?',
  'Vale a pena investir em ETFs?',
]

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

    if (Array.isArray(ibovData) && ibovData.length > 1) {
      const lastPrice = ibovData[ibovData.length - 1].market_price
      ibovLastPrice.value = lastPrice
      const previousPrice = ibovData[ibovData.length - 2].market_price
      const variation = ((lastPrice - previousPrice) / previousPrice) * 100
      ibovIndicator.value = `${variation >= 0 ? '+' : ''}${variation.toFixed(2)}%`
    }

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

function redirectToLogin(source: string) {
  navigateTo(`/auth/login?redirect=/${source === 'calculadora' ? 'calculadora' : 'help'}`)
}

onMounted(async () => {
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

  const newTreeMapData = []
  topStocks.forEach((stock) => {
    newTreeMapData.push({
      symbol: stock.ticker,
      name: stock.name,
      price: stock.market_price,
      change: stock.change_percent,
      category: 'acoes' as const,
    })
  })

  bottomStocks.forEach((stock) => {
    newTreeMapData.push({
      symbol: stock.ticker,
      name: stock.name,
      price: stock.market_price,
      change: stock.change_percent,
      category: 'acoes' as const,
    })
  })

  topReits.forEach((stock) => {
    newTreeMapData.push({
      symbol: stock.ticker,
      name: stock.name,
      price: stock.market_price,
      change: stock.change_percent,
      category: 'fiis' as const,
    })
  })

  bottomReits.forEach((stock) => {
    newTreeMapData.push({
      symbol: stock.ticker,
      name: stock.name,
      price: stock.market_price,
      change: stock.change_percent,
      category: 'fiis' as const,
    })
  })

  stocksData.value = newTreeMapData
})

watch(selectedTimeRange, () => {
  fetchIbovChartData()
})

definePageMeta({
  isPublicRoute: true,
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


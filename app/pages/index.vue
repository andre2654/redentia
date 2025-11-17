<template>
  <NuxtLayout :name="layoutName" title="Visão geral">
    <!-- CTA Section -->
    <section v-if="!authStore.isAuthenticated">
      <div
        class="from-secondary/20 relative overflow-hidden bg-gradient-to-br to-transparent px-6 py-14 text-center text-white md:rounded-3xl"
      >
        <div class="relative">
          <IconLogoFull class="mx-auto mb-10 h-9 fill-white md:h-12" />
          <h2
            class="mb-3 text-xl font-semibold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl"
          >
            Pronto para começar a investir melhor?
          </h2>
          <p
            class="mb-6 px-2 text-base leading-relaxed text-gray-300 sm:text-lg md:mb-8 md:text-xl"
          >
            Crie sua conta gratuitamente e tenha acesso a todas as ferramentas
          </p>
          <div class="flex items-center gap-2">
            <UButton
              to="/auth/register"
              color="secondary"
              size="xl"
              icon="i-lucide-user-plus"
              class="hover:shadow-secondary/50 w-full px-6 transition-all hover:scale-110 hover:shadow-2xl sm:w-auto sm:px-8"
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

    <AtomsTickerCarousel class="mt-5 w-full max-md:hidden" big no-control />
    <AtomsTickerCarousel class="mt-5 w-full md:hidden" no-control />

    <div class="flex h-full flex-col gap-4 pt-6">
      <div class="flex flex-col gap-8">
        <div v-if="!authStore.isAuthenticated" class="text-center">
          <h2
            class="mb-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl"
          >
            Acompanhe o Mercado em Tempo Real
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Dados atualizados de ações, FIIs e muito mais
          </p>
        </div>

        <div class="flex flex-col gap-4 px-6">
          <div class="flex items-center gap-2">
            <span
              class="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-lg shadow-blue-500/50 md:h-3 md:w-3"
            />
            <span
              class="text-xs font-medium uppercase tracking-wider text-green-400 md:text-sm"
              >Ao Vivo</span
            >
          </div>
          <div class="flex gap-4">
            <div class="flex flex-col gap-2">
              <h3
                class="font-regular mb-1 flex items-center gap-2 text-xl text-white md:mb-2 md:text-2xl"
              >
                IBOVESPA
              </h3>
              <p
                class="mb-1 text-3xl font-semibold tabular-nums text-white sm:text-4xl md:text-5xl"
              >
                {{ ibovIndicator }}
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3
                class="font-regular mb-1 flex items-center gap-2 text-xl text-white md:mb-2 md:text-2xl"
              >
                IFIX
              </h3>
              <p
                class="mb-1 text-3xl font-semibold tabular-nums text-white sm:text-4xl md:text-5xl"
              >
                {{ ifixIndicator }}
              </p>
            </div>
          </div>
        </div>

        <MoleculesSearchAssets
          class="w-full bg-white/10 py-4 md:rounded-full"
        />
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
          Veja os destaques de altas e baixas do dia. Ative o mapa para
          visualizar o desempenho por setor.
        </p>
        <label
          for="map-toggle"
          class="hover:bg-secondary/10 mt-3 flex max-w-fit items-center justify-between gap-4 rounded-full border px-3 py-2 transition"
          :class="{
            'bg-secondary/15 !border-tertiary dark:bg-tertiary/60': showMap,
          }"
        >
          <IconAi class="fill-secondary h-5" />
          <h2 class="text-secondary select-none">Mostrar mapa</h2>
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
        <UButtonGroup
          orientation="horizontal"
          variant="soft"
          class="mx-auto mb-5 mt-6 max-md:px-6"
        >
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
        <UCarousel
          v-slot="{ item }"
          class="w-full"
          loop
          :items="assetCategories"
          :ui="{ item: 'basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4' }"
        >
          <div class="flex w-full flex-col gap-3 rounded-[30px] py-6">
            <h2 class="text-[25px] font-bold max-md:text-center md:text-[18px]">
              {{ item.label }}
            </h2>
            <p class="mx-auto mb-5 text-[16px] opacity-70 md:hidden">
              Maiores altas
            </p>
            <div class="flex flex-col gap-1 overflow-hidden rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.top[item.key]"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.top[item.key] }"
              class="text-[20px] transition hover:underline max-md:text-center md:text-[15px]"
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
            <h2 class="text-[25px] font-bold max-md:text-center md:text-[18px]">
              {{ item.label }}
            </h2>
            <p class="mx-auto mb-5 text-[16px] opacity-70 md:hidden">
              Maiores baixas
            </p>
            <div class="flex flex-col gap-1 overflow-hidden rounded-lg">
              <AtomsTicker
                v-for="stock in topAssets.bottom[item.key]"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <NuxtLink
              :to="{
                path: '/search',
                query: rankingLinkQueries.bottom[item.key],
              }"
              class="text-[20px] transition hover:underline max-md:text-center md:text-[15px]"
            >
              Ver todos
            </NuxtLink>
          </div>
        </UCarousel>
      </template>

      <div
        class="text-secondary dark:bg-tertiary/40 flex w-full flex-col gap-3 bg-black/5 px-6 py-4 md:rounded-[30px]"
      >
        <div class="flex items-center gap-2 px-3 py-2">
          <IconAi class="fill-secondary h-5" />
          <h2 class="text-lg font-semibold">Filtros inteligentes</h2>
        </div>
        <div class="flex w-full flex-wrap gap-3 px-6 max-md:flex-col">
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

    <section v-if="!authStore.isAuthenticated" class="mt-20">
      <div class="w-full">
        <div class="mb-8 text-center md:mb-12">
          <div class="mb-3 flex items-center justify-center gap-2 md:mb-4">
            <IconAi class="fill-secondary h-8 md:h-12" />
          </div>
          <h2
            class="mb-2 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl"
          >
            Assessoria com Inteligência Artificial
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Tire dúvidas, compare ativos e receba análises personalizadas
          </p>
        </div>

        <div class="relative w-full">
          <div
            v-if="blockChat"
            @click="redirectToLogin('chat')"
            class="absolute inset-0 left-0 top-0 z-10 flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-black/60 p-4 backdrop-blur-md transition-all hover:bg-black/70 md:rounded-3xl"
          >
            <div class="transform text-center transition-all hover:scale-105">
              <div class="relative mb-4 md:mb-6">
                <div class="absolute inset-0 animate-ping opacity-20">
                  <IconAi class="fill-secondary mx-auto h-12 md:h-16" />
                </div>
                <IconAi class="fill-secondary relative mx-auto h-12 md:h-16" />
              </div>
              <h3
                class="mb-2 text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl"
              >
                Converse com nossa IA
              </h3>
              <p
                class="mb-4 px-2 text-sm leading-relaxed text-gray-300 sm:text-base md:mb-6"
              >
                Faça login e tenha acesso ilimitado à assessoria inteligente
              </p>
              <UButton
                to="/auth/login"
                color="secondary"
                size="xl"
                icon="i-lucide-message-circle"
                class="hover:shadow-secondary/50 w-full px-6 transition-all hover:scale-110 hover:shadow-2xl sm:w-auto sm:px-8"
              >
                Acessar Assessoria
              </UButton>
              <p class="mt-3 text-xs text-gray-400 md:mt-4 md:text-sm">
                Respostas instantâneas • Análises personalizadas
              </p>
            </div>
          </div>

          <div
            class="bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 backdrop-blur-xl md:rounded-3xl md:p-8"
            @click="handleChatCardClick"
          >
            <div class="mb-6 flex flex-col items-center gap-4">
              <h3 class="text-center text-2xl text-white">
                Faça alguma pergunta
              </h3>
              <p class="text-center text-[13px] font-light text-gray-400">
                Tire dúvidas sobre investimentos, compare ativos e peça análises
                em linguagem simples.
              </p>
            </div>

            <div class="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              <div
                v-for="(suggestion, idx) in chatSuggestions"
                :key="idx"
                class="flex h-[120px] items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-3 text-[13px] font-medium opacity-70 transition-all hover:from-white/20 hover:opacity-100"
              >
                {{ suggestion }}
              </div>
            </div>

            <div class="space-y-4 opacity-60">
              <div class="flex items-start gap-3">
                <IconLogo class="mt-1 w-6 flex-shrink-0 fill-white" />
                <div class="flex-1 rounded-lg bg-white/5 p-4 backdrop-blur">
                  <p class="text-sm text-white">
                    Olá! Sou a assistente virtual da Redentia. Como posso ajudar
                    você hoje?
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
                :ui="{
                  base: 'text-[14px] bg-transparent ring-0 placeholder:text-white/40',
                }"
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
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
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
const blockChat = ref(false)
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

function handleChatCardClick() {
  blockChat.value = true
}

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
  navigateTo(
    `/auth/login?redirect=/${source === 'calculadora' ? 'calculadora' : 'help'}`
  )
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

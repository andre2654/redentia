<template>
  <div class="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
    <!-- Hero Section -->
    <section class="relative overflow-hidden px-6 pb-20 pt-32">
      <div class="absolute inset-0 bg-[url('/assets/images/blue-bg.png')] bg-cover opacity-10"></div>
      
      <div class="relative mx-auto max-w-7xl">
        <div class="flex flex-col items-center text-center">
          <IconLogoFull class="mb-8 h-16 fill-white" />
          <h1 class="mb-6 text-5xl font-bold text-white md:text-7xl">
            Invista com
            <span class="text-secondary">Inteligência Artificial</span>
          </h1>
          <p class="mb-8 max-w-2xl text-xl text-gray-300">
            Acompanhe seus investimentos, receba insights personalizados e tome decisões
            mais inteligentes com nossa assessoria de IA.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <UButton
              to="/auth/register"
              color="secondary"
              size="xl"
              icon="i-lucide-rocket"
              class="px-8"
            >
              Começar Gratuitamente
            </UButton>
            <UButton
              to="/auth/login"
              color="neutral"
              variant="soft"
              size="xl"
              icon="i-lucide-log-in"
              class="px-8"
            >
              Fazer Login
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Market Overview Section -->
    <section class="px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-4xl font-bold text-white">
            Acompanhe o Mercado em Tempo Real
          </h2>
          <p class="text-lg text-gray-400">
            Dados atualizados de ações, FIIs e muito mais
          </p>
        </div>

        <!-- Indicators -->
        <div class="mb-12 grid gap-6 md:grid-cols-2">
          <div class="rounded-3xl bg-gradient-to-br from-green-500/10 to-transparent p-8">
            <div class="mb-2 flex items-center gap-2">
              <div class="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
              <span class="text-sm text-gray-400">AO VIVO</span>
            </div>
            <h3 class="mb-2 text-2xl font-bold text-white">IBOVESPA</h3>
            <p class="mb-1 text-4xl font-bold text-green-400">{{ ibovIndicator }}</p>
            <p class="text-sm text-gray-400">
              Índice Bovespa - principal indicador de desempenho das ações
            </p>
          </div>
          <div class="rounded-3xl bg-gradient-to-br from-blue-500/10 to-transparent p-8">
            <div class="mb-2 flex items-center gap-2">
              <div class="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
              <span class="text-sm text-gray-400">AO VIVO</span>
            </div>
            <h3 class="mb-2 text-2xl font-bold text-white">IFIX</h3>
            <p class="mb-1 text-4xl font-bold text-blue-400">{{ ifixIndicator }}</p>
            <p class="text-sm text-gray-400">
              Índice de Fundos Imobiliários - desempenho dos FIIs
            </p>
          </div>
        </div>

        <!-- Chart Preview -->
        <div class="rounded-3xl bg-gradient-to-t from-white/10 to-transparent p-8">
          <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h3 class="text-2xl font-semibold text-white">Cotação do IBOV</h3>
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
    </section>

    <!-- Interactive Calculator Section -->
    <section class="px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center">
          <div class="mb-4 flex items-center justify-center gap-2">
            <UIcon name="i-lucide-calculator" class="text-secondary size-12" />
          </div>
          <h2 class="mb-4 text-4xl font-bold text-white">
            Calculadora Inteligente
          </h2>
          <p class="text-lg text-gray-400">
            Simule seus investimentos e veja quanto pode ganhar
          </p>
        </div>

        <!-- Calculator Preview -->
        <div class="relative">
          <!-- Overlay for login prompt -->
          <div
            v-if="showCalculatorOverlay"
            @click="redirectToLogin('calculadora')"
            class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-3xl bg-black/80 backdrop-blur-sm transition-all"
          >
            <div class="text-center">
              <UIcon name="i-lucide-lock" class="text-secondary mx-auto mb-4 size-16" />
              <h3 class="mb-2 text-2xl font-bold text-white">
                Faça login para calcular
              </h3>
              <p class="mb-6 text-gray-400">
                Crie sua conta gratuitamente e acesse a calculadora completa
              </p>
              <UButton
                to="/auth/register"
                color="secondary"
                size="xl"
                icon="i-lucide-user-plus"
              >
                Criar Conta Grátis
              </UButton>
            </div>
          </div>

          <div
            class="rounded-3xl bg-gradient-to-t from-white/10 to-transparent p-8"
            @click="showCalculatorOverlay = true"
          >
            <div class="mb-6 flex items-center gap-3">
              <UIcon name="i-lucide-trending-up" class="text-secondary size-6" />
              <h3 class="text-xl font-bold text-white">
                Simulação de Juros Compostos
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <UFormField label="Valor Inicial (R$)" name="initialValue">
                <UInputNumber
                  :model-value="10000"
                  placeholder="10000"
                  size="lg"
                  variant="soft"
                  disabled
                  class="w-full"
                  :format-options="{
                    style: 'currency',
                    currency: 'BRL',
                  }"
                />
              </UFormField>

              <UFormField label="Aporte Mensal (R$)" name="monthlyValue">
                <UInputNumber
                  :model-value="500"
                  placeholder="500"
                  size="lg"
                  variant="soft"
                  disabled
                  class="w-full"
                  :format-options="{
                    style: 'currency',
                    currency: 'BRL',
                  }"
                />
              </UFormField>

              <UFormField label="Taxa de Juros (%)" name="interestRate">
                <UInput
                  :model-value="'10.5'"
                  type="number"
                  variant="soft"
                  placeholder="10.5"
                  size="lg"
                  disabled
                  class="flex-1"
                />
              </UFormField>

              <UFormField label="Período (Anos)" name="period">
                <UInput
                  :model-value="'10'"
                  type="number"
                  placeholder="10"
                  size="lg"
                  variant="soft"
                  disabled
                  class="flex-1"
                />
              </UFormField>
            </div>

            <UButton
              color="secondary"
              size="xl"
              block
              icon="i-lucide-calculator"
              class="mt-6"
              disabled
            >
              Calcular Simulação
            </UButton>

            <!-- Mock Results -->
            <div class="mt-8 grid grid-cols-1 gap-4 opacity-50 md:grid-cols-3">
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total Investido
                </p>
                <p class="text-2xl font-bold text-white">R$ 70.000,00</p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total de Juros
                </p>
                <p class="text-2xl font-bold text-green-400">R$ 48.562,31</p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
                <p class="text-[13px] font-extralight text-gray-400">Valor Final</p>
                <p class="text-secondary text-2xl font-bold">R$ 118.562,31</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Chat Section -->
    <section class="px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center">
          <div class="mb-4 flex items-center justify-center gap-2">
            <IconAi class="fill-secondary h-12" />
          </div>
          <h2 class="mb-4 text-4xl font-bold text-white">
            Assessoria com Inteligência Artificial
          </h2>
          <p class="text-lg text-gray-400">
            Tire dúvidas, compare ativos e receba análises personalizadas
          </p>
        </div>

        <!-- Chat Preview -->
        <div class="relative mx-auto max-w-4xl">
          <!-- Overlay for login prompt -->
          <div
            v-if="showChatOverlay"
            @click="redirectToLogin('chat')"
            class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-3xl bg-black/80 backdrop-blur-sm transition-all"
          >
            <div class="text-center">
              <IconAi class="fill-secondary mx-auto mb-4 h-16" />
              <h3 class="mb-2 text-2xl font-bold text-white">
                Converse com nossa IA
              </h3>
              <p class="mb-6 text-gray-400">
                Faça login e tenha acesso ilimitado à assessoria inteligente
              </p>
              <UButton
                to="/auth/login"
                color="secondary"
                size="xl"
                icon="i-lucide-message-circle"
              >
                Acessar Assessoria
              </UButton>
            </div>
          </div>

          <div
            class="rounded-3xl bg-gradient-to-t from-white/10 to-transparent p-8"
            @click="showChatOverlay = true"
          >
            <!-- Chat suggestions -->
            <div class="mb-6 flex flex-col items-center gap-4">
              <h3 class="text-center text-2xl text-white">Faça alguma pergunta</h3>
              <p class="text-center text-[13px] font-light text-gray-400">
                Tire dúvidas sobre investimentos, compare ativos e peça análises em
                linguagem simples.
              </p>
            </div>

            <!-- Suggestion Buttons -->
            <div class="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              <button
                v-for="(suggestion, idx) in chatSuggestions"
                :key="idx"
                class="flex h-[120px] items-center justify-center rounded-lg bg-gradient-to-t from-white/10 to-transparent p-3 text-[13px] font-medium opacity-70 hover:from-white/20"
                disabled
              >
                {{ suggestion }}
              </button>
            </div>

            <!-- Mock Messages -->
            <div class="space-y-4 opacity-60">
              <div class="flex items-start gap-3">
                <IconLogo class="mt-1 w-6 fill-white" />
                <div class="flex-1 rounded-lg bg-white/5 p-4">
                  <p class="text-sm text-white">
                    Olá! Sou a assistente virtual da Redentia. Como posso ajudar você
                    hoje?
                  </p>
                </div>
              </div>
            </div>

            <!-- Input Area -->
            <div class="mt-6 rounded-lg bg-black/20 p-4">
              <UTextarea
                placeholder="Faça qualquer pergunta..."
                size="md"
                rows="2"
                disabled
                :ui="{
                  base: 'text-[14px] bg-transparent ring-0 placeholder:text-white/40',
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-4xl font-bold text-white">
            Tudo que você precisa para investir melhor
          </h2>
          <p class="text-lg text-gray-400">
            Ferramentas profissionais ao seu alcance
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Feature 1 -->
          <div
            class="group rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent p-8 transition-all hover:from-purple-500/20"
          >
            <UIcon
              name="i-lucide-line-chart"
              class="text-purple-400 mb-4 size-12 transition-transform group-hover:scale-110"
            />
            <h3 class="mb-2 text-xl font-bold text-white">Gráficos Avançados</h3>
            <p class="text-gray-400">
              Visualize o desempenho dos seus ativos com gráficos interativos e em
              tempo real
            </p>
          </div>

          <!-- Feature 2 -->
          <div
            class="group rounded-3xl bg-gradient-to-br from-green-500/10 to-transparent p-8 transition-all hover:from-green-500/20"
          >
            <UIcon
              name="i-lucide-wallet"
              class="text-green-400 mb-4 size-12 transition-transform group-hover:scale-110"
            />
            <h3 class="mb-2 text-xl font-bold text-white">Gestão de Carteira</h3>
            <p class="text-gray-400">
              Acompanhe todos os seus investimentos em um só lugar de forma simples
            </p>
          </div>

          <!-- Feature 3 -->
          <div
            class="group rounded-3xl bg-gradient-to-br from-blue-500/10 to-transparent p-8 transition-all hover:from-blue-500/20"
          >
            <UIcon
              name="i-lucide-trending-up"
              class="text-blue-400 mb-4 size-12 transition-transform group-hover:scale-110"
            />
            <h3 class="mb-2 text-xl font-bold text-white">Análise de Dividendos</h3>
            <p class="text-gray-400">
              Acompanhe seus proventos e veja o histórico completo de pagamentos
            </p>
          </div>

          <!-- Feature 4 -->
          <div
            class="group rounded-3xl bg-gradient-to-br from-yellow-500/10 to-transparent p-8 transition-all hover:from-yellow-500/20"
          >
            <UIcon
              name="i-lucide-bell"
              class="text-yellow-400 mb-4 size-12 transition-transform group-hover:scale-110"
            />
            <h3 class="mb-2 text-xl font-bold text-white">Alertas Inteligentes</h3>
            <p class="text-gray-400">
              Receba notificações sobre mudanças importantes nos seus investimentos
            </p>
          </div>

          <!-- Feature 5 -->
          <div
            class="group rounded-3xl bg-gradient-to-br from-red-500/10 to-transparent p-8 transition-all hover:from-red-500/20"
          >
            <UIcon
              name="i-lucide-shield"
              class="text-red-400 mb-4 size-12 transition-transform group-hover:scale-110"
            />
            <h3 class="mb-2 text-xl font-bold text-white">Segurança Total</h3>
            <p class="text-gray-400">
              Seus dados protegidos com as melhores práticas de segurança
            </p>
          </div>

          <!-- Feature 6 -->
          <div
            class="group rounded-3xl bg-gradient-to-br from-pink-500/10 to-transparent p-8 transition-all hover:from-pink-500/20"
          >
            <UIcon
              name="i-lucide-smartphone"
              class="text-pink-400 mb-4 size-12 transition-transform group-hover:scale-110"
            />
            <h3 class="mb-2 text-xl font-bold text-white">App Mobile</h3>
            <p class="text-gray-400">
              Acesse de qualquer lugar com nosso aplicativo para iOS e Android
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Top Assets Preview -->
    <section class="px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-4xl font-bold text-white">
            Principais Ativos do Dia
          </h2>
          <p class="text-lg text-gray-400">
            Veja as maiores altas e baixas em tempo real
          </p>
        </div>

        <div
          class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <!-- Top Stocks -->
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-green-500/10 to-transparent p-6"
          >
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-[18px] font-bold text-white">Maiores Altas</h3>
              <UIcon name="i-lucide-trending-up" class="size-5 text-green-400" />
            </div>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.top.stocks.slice(0, 5)"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <UButton
              to="/auth/register"
              color="neutral"
              variant="link"
              class="mt-2"
            >
              Ver todos →
            </UButton>
          </div>

          <!-- Top ETFs -->
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-blue-500/10 to-transparent p-6"
          >
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-[18px] font-bold text-white">ETFs em Alta</h3>
              <UIcon name="i-lucide-bar-chart-2" class="size-5 text-blue-400" />
            </div>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.top.etfs.slice(0, 5)"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <UButton
              to="/auth/register"
              color="neutral"
              variant="link"
              class="mt-2"
            >
              Ver todos →
            </UButton>
          </div>

          <!-- Top REITs -->
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-purple-500/10 to-transparent p-6"
          >
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-[18px] font-bold text-white">FIIs em Destaque</h3>
              <UIcon name="i-lucide-building" class="size-5 text-purple-400" />
            </div>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.top.reits.slice(0, 5)"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <UButton
              to="/auth/register"
              color="neutral"
              variant="link"
              class="mt-2"
            >
              Ver todos →
            </UButton>
          </div>

          <!-- Bottom Stocks -->
          <div
            class="flex flex-col gap-3 rounded-[30px] bg-gradient-to-t from-red-500/10 to-transparent p-6"
          >
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-[18px] font-bold text-white">Maiores Baixas</h3>
              <UIcon name="i-lucide-trending-down" class="size-5 text-red-400" />
            </div>
            <div class="flex flex-col gap-2">
              <AtomsTicker
                v-for="stock in topAssets.bottom.stocks.slice(0, 5)"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
            <UButton
              to="/auth/register"
              color="neutral"
              variant="link"
              class="mt-2"
            >
              Ver todos →
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="px-6 py-20">
      <div class="mx-auto max-w-4xl">
        <div
          class="rounded-3xl bg-gradient-to-br from-secondary/20 to-transparent p-12 text-center"
        >
          <IconLogoFull class="mx-auto mb-6 h-12 fill-white" />
          <h2 class="mb-4 text-4xl font-bold text-white">
            Pronto para começar a investir melhor?
          </h2>
          <p class="mb-8 text-xl text-gray-300">
            Crie sua conta gratuitamente e tenha acesso a todas as ferramentas
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <UButton
              to="/auth/register"
              color="secondary"
              size="xl"
              icon="i-lucide-user-plus"
              class="px-8"
            >
              Criar Conta Grátis
            </UButton>
            <UButton
              to="/auth/login"
              color="white"
              variant="outline"
              size="xl"
              icon="i-lucide-log-in"
              class="px-8"
            >
              Já tenho conta
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script lang="ts" setup>
import type { ChartTimeRange } from '~/types/chart'

const { getTopStocks, getTopETFs, getTopReits, getTopBDRs, getIndiceHistoricPrices } = useAssetsService()

const selectedTimeRange = ref<ChartTimeRange>('month')
const loading = ref(true)
const loadingIndicators = ref(true)

const showCalculatorOverlay = ref(false)
const showChatOverlay = ref(false)

const chatSuggestions = [
  'Qual a diferença entre ações e FIIs?',
  'Como funcionam os dividendos?',
  'O que é diversificação?',
  'Quanto devo investir por mês?',
  'Como escolher boas ações?',
  'Vale a pena investir em ETFs?',
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
    value: ibovChartData.value.length > 0 
      ? ibovChartData.value[ibovChartData.value.length - 1].value.toFixed(2)
      : '0'
  }
])

function redirectToLogin(source: string) {
  navigateTo(`/auth/login?redirect=/${source === 'calculadora' ? 'calculadora' : 'help'}`)
}

async function fetchIbovChartData() {
  loading.value = true
  let period: '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full' = '1mo'
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
      getIndiceHistoricPrices('ifix', '1mo')
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
})

// Atualiza o gráfico ao trocar o período
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

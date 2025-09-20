<template>
  <NuxtLayout>
    <template #header>
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center gap-3">
          <USkeleton v-if="isLoadingAsset" class="h-6 w-6 rounded-full" />
          <img
            v-else-if="asset?.logo"
            :src="asset.logo"
            alt="Asset Logo"
            class="h-6 w-6 rounded-full"
          />
          <h1 class="min-w-max font-medium max-md:text-[20px]">
            <span>{{ ticker }}</span>
          </h1>
          <div class="flex items-center gap-2 text-sm">
            <USkeleton v-if="isLoadingAsset" class="h-4 w-[80px]" />
            <template v-else>
              <span>R$ {{ asset?.market_price }}</span>
              <span
                :class="[
                  asset?.change_percent > 0 ? 'text-green-400' : 'text-red-400',
                ]"
                >({{ asset?.change_percent }}% hoje)</span
              >
            </template>
          </div>
        </div>
        <UButton
          color="neutral"
          variant="link"
          icon="i-lucide-plus"
          :ui="{
            leadingIcon: 'size-5',
            base: 'text-[13px] gap-2',
          }"
        >
          <span class="max-md:hidden">Adicione à carteira</span>
        </UButton>
      </div>
    </template>

    <!-- Graph -->
    <div class="w-full py-6">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="mb-4 text-lg font-semibold">
            Cotação <span class="max-md:hidden">da {{ ticker }}</span>
          </h2>
          <UButtonGroup orientation="horizontal" variant="soft">
            <UButton
              color="neutral"
              :variant="selectedTimeRange === 'month' ? 'soft' : 'link'"
              label="Mês"
              :disabled="isLoadingChart"
              @click="selectedTimeRange = 'month'"
            />
            <UButton
              color="neutral"
              :variant="selectedTimeRange === 'year' ? 'soft' : 'link'"
              label="Ano"
              :disabled="isLoadingChart"
              @click="selectedTimeRange = 'year'"
            />
            <UButton
              color="neutral"
              :variant="selectedTimeRange === 'ytd' ? 'soft' : 'link'"
              label="Ano até hoje"
              :disabled="isLoadingChart"
              @click="selectedTimeRange = 'ytd'"
            />
          </UButtonGroup>
        </div>
        <AtomsGraphLine
          :data="chartData"
          :legend="chartLabel"
          :height="350"
          :loading="isLoadingChart"
        />
      </div>
    </div>

    <!-- Details in wallet -->
    <div
      class="dark:bg-tertiary/40 bg-tertiary flex w-full flex-col gap-3 rounded-[30px] px-6 py-4 text-white"
    >
      <button
        class="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-white/10"
        @click="seeMyInsights = !seeMyInsights"
      >
        <UIcon
          name="ic-round-arrow-forward-ios"
          class="transition-transform"
          :class="{
            'rotate-90': seeMyInsights,
          }"
        />
        <h2 class="text-lg font-semibold">Sua carteira</h2>
      </button>
      <div
        v-if="seeMyInsights"
        class="flex w-full gap-6 px-6 max-md:flex-col md:flex-wrap"
      >
        <MoleculesTickerIndicator
          name="Score de viabilidade"
          value="Alta"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          is-intelligent
          :help-text-with-tooltip="false"
        />
        <MoleculesTickerIndicator
          name="Grau de Endividamento Inteligente"
          value="Baixo"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          is-intelligent
          :help-text-with-tooltip="false"
        /><MoleculesTickerIndicator
          name="Proteção do Minoritário"
          value="Alto"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          is-intelligent
          :help-text-with-tooltip="false"
        />
      </div>
    </div>

    <!-- Asset Details -->
    <div class="flex flex-col gap-4 p-4">
      <h2 class="mb-4 px-6 text-lg font-bold">Indicadores básicos</h2>
      <div
        class="grid w-full grid-cols-3 gap-6 px-6 lg:grid-cols-6 xl:grid-cols-10"
      >
        <MoleculesTickerIndicator
          name="D.Y."
          value="10%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
        />
        <MoleculesTickerIndicator
          name="D.Y."
          value="10%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
        /><MoleculesTickerIndicator
          name="D.Y."
          value="10%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
        /><MoleculesTickerIndicator
          name="D.Y."
          value="10%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
        /><MoleculesTickerIndicator
          name="D.Y."
          value="10%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
        /><MoleculesTickerIndicator
          name="D.Y."
          value="10%"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
        />
      </div>
      <button
        class="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-black/10 hover:dark:bg-white/10"
        @click="seeSmartIndicators = !seeSmartIndicators"
      >
        <UIcon
          name="ic-round-arrow-forward-ios"
          class="transition-transform"
          :class="{
            'rotate-90': seeSmartIndicators,
          }"
        />
        <h2 class="text-lg font-semibold">Indicadores inteligentes</h2>
      </button>
      <div
        v-if="seeSmartIndicators"
        class="flex w-full gap-6 px-6 max-md:flex-col md:flex-wrap"
      >
        <MoleculesTickerIndicator
          name="Score de viabilidade"
          value="Alta"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          is-intelligent
          :help-text-with-tooltip="false"
        />
        <MoleculesTickerIndicator
          name="Grau de Endividamento Inteligente"
          value="Baixo"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          is-intelligent
          :help-text-with-tooltip="false"
        /><MoleculesTickerIndicator
          name="Pontuação Reclame Aqui"
          :value="'5/10'"
          help-text="Pontuação média do ativo no Reclame Aqui."
          is-intelligent
          :help-text-with-tooltip="false"
        />
        <MoleculesTickerIndicator
          name="Pontuação Glassdoor"
          :value="'5/5'"
          help-text="Pontuação média do ativo no Glassdoor."
          is-intelligent
          :help-text-with-tooltip="false"
        />
      </div>
    </div>

    <!-- Dividends Chart -->
    <div class="flex flex-col gap-4 p-6">
      <AtomsGraphDividends :data="dividendsData" :loading="isLoadingDividends" />
    </div>

    <!-- Asset docs -->
    <div class="flex flex-col gap-4 p-4">
      <h2 class="text-lg font-bold">Documentos</h2>
      <label
        for="map-toggle"
        class="hover:bg-secondary/10 mt-3 flex max-w-fit items-center justify-between gap-4 rounded-full border px-3 py-2"
        :class="{
          'bg-secondary/15 dark:bg-tertiary/60 !border-tertiary':
            showRelevantDocs,
        }"
      >
        <IconAi class="fill-secondary h-5" />
        <h2 class="text-secondary select-none">Mostrar somente relevantes</h2>
        <USwitch
          id="map-toggle"
          v-model="showRelevantDocs"
          color="secondary"
          checked-icon="lucide-check"
          :ui="{
            base: 'data-[state=checked]:border-secondary',
          }"
        />
      </label>
      <div
        class="flex flex-col gap-2 rounded-[30px] border p-6"
        :class="{
          'bg-tertiary dark:bg-tertiary/40 !border-tertiary text-secondary':
            showRelevantDocs,
        }"
      >
        <div v-for="i in 10" :key="i" class="flex items-center justify-between">
          <div class="flex flex-col">
            <b class="text-[14px]"
              >- Esclarecimentos sobre questionamentos da CVM/B3 - Comunicado ao
              Mercado</b
            >
            <p class="text-[11px]">
              Negociações atípicas de valores mobiliários
            </p>
          </div>
          <AtomsButton> Ver </AtomsButton>
        </div>
      </div>
    </div>

    <!-- Asset Info -->
    <div class="flex flex-col gap-4 p-4">
      <USkeleton v-if="isLoadingAsset" class="h-[200px] w-[200px] rounded-lg" />
      <img
        v-else-if="asset?.logo"
        :src="asset.logo"
        alt="Asset Logo"
        class="h-[200px] w-[200px] rounded-lg"
      />
      <div class="grid gap-2">
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[250px]" />
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[200px]" />
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[180px]" />
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[160px]" />
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[120px]" />
        <USkeleton v-if="isLoadingAsset" class="h-4 w-[100px]" />
        <template v-else>
          <b class="text-lg"
            >{{ asset?.ticker }} - {{ asset?.industry_category }}</b
          >
          <b class="text-lg"
            >{{ asset?.city }}, {{ asset?.state }} - {{ asset?.country }}</b
          >
          <b class="text-lg">Setor: {{ asset?.sector }}</b>
          <b class="text-lg">Funcionários: {{ asset?.employees }}</b>
          <a
            v-if="asset?.website"
            :href="asset.website"
            target="_blank"
            class="text-primary underline"
            >Site oficial</a
          >
          <p class="text-sm opacity-70">
            {{ asset?.long_business_summary }}
          </p>
        </template>
      </div>
    </div>

    <MoleculesChat class="w-full bg-black/10 dark:bg-white/10" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ChartTimeRange } from '~/types/chart'
import { generateChartConfig } from '~/helpers/utils'

const route = useRoute()
const { assetHistoricPrices, getTickerDetails, getTickerDividends } =
  useAssetsService()

interface DividendData {
  ticker: string
  payment_date: string
  rate: string
  label: string
}

const ticker = route.params.ticker as string
const asset = ref()
const isLoadingAsset = ref(true)
const dividendsData = ref<DividendData[]>([])
const isLoadingDividends = ref(false)
const selectedTimeRange = ref<ChartTimeRange>('month')
const showRelevantDocs = ref(true)
const seeMyInsights = ref(true)
const seeSmartIndicators = ref(true)
const isLoadingChart = ref(true)

interface ChartPoint {
  date: string
  value: number
  timestamp: number
}
const chartData = ref<ChartPoint[]>([])

// Mantém apenas o label do chartConfig
const chartLabel = computed(
  () =>
    generateChartConfig({
      timeRange: selectedTimeRange.value,
      label: ticker.toUpperCase(),
      basePrice: asset.value?.close || 100,
    }).legend
)

async function fetchChartData() {
  isLoadingChart.value = true
  let period: '1mo' | 'ytd' | '12mo' = '1mo'
  if (selectedTimeRange.value === 'month') period = '1mo'
  else if (selectedTimeRange.value === 'year') period = '12mo'
  else if (selectedTimeRange.value === 'ytd') period = 'ytd'
  const data = await assetHistoricPrices(ticker, period)
  // Transforma para o formato aceito pelo gráfico
  chartData.value = Array.isArray(data)
    ? data.map((item) => ({
        date: item.price_at,
        value: item.market_price,
        timestamp: new Date(item.price_at).getTime(),
      }))
    : []
  isLoadingChart.value = false
}

async function fetchDividendsData() {
  isLoadingDividends.value = true
  try {
    const data = await getTickerDividends(ticker)
    dividendsData.value = Array.isArray(data) ? data : []
  } catch {
    dividendsData.value = []
  }
  isLoadingDividends.value = false
}

// Busca inicial
onMounted(async () => {
  isLoadingAsset.value = true
  asset.value = await getTickerDetails(ticker)
  isLoadingAsset.value = false
  fetchChartData()
  fetchDividendsData()
})

// Atualiza ao trocar o período
watch(selectedTimeRange, () => {
  fetchChartData()
})
</script>

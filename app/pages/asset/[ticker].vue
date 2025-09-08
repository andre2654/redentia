<template>
  <NuxtLayout>
    <template #header>
      <div class="flex w-full items-center justify-between">
        <div class="flex items-center gap-3">
          <img
            v-if="asset.logo"
            :src="asset.logo"
            alt="Asset Logo"
            class="h-6 w-6 rounded-full"
          />
          <h1 class="min-w-max font-medium max-md:text-[20px]">
            {{ asset.stock }}
          </h1>
          <div class="text-sm">
            R$ 23,00 <span class="text-primary">(+2,00% hoje)</span>
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
    <div class="w-full p-6">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="mb-4 text-lg font-semibold">
            Cotação <span class="max-md:hidden">da {{ asset.stock }}</span>
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
          :data="chartConfig.data"
          :colors="chartConfig.colors"
          :legend="chartConfig.legend"
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
          v-if="asset.reclameAqui?.notaMedia"
          name="Pontuação Reclame Aqui"
          :value="asset.reclameAqui.notaMedia + '/10'"
          help-text="Pontuação média do ativo no Reclame Aqui."
          is-intelligent
          :help-text-with-tooltip="false"
        />
        <MoleculesTickerIndicator
          v-if="asset.glassdoor?.nota"
          name="Pontuação Glassdoor"
          :value="asset.glassdoor.nota + '/5'"
          help-text="Pontuação média do ativo no Glassdoor."
          is-intelligent
          :help-text-with-tooltip="false"
        />
      </div>
    </div>

    <!-- Dividends Chart -->
    <div class="flex flex-col gap-4 p-6">
      <AtomsGraphDividends />
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
      <img
        v-if="asset.logo"
        :src="asset.logo"
        alt="Asset Logo"
        class="h-[200px] w-[200px] rounded-lg"
      />
      <b class="text-lg">{{ asset.name }}</b>
      <b class="text-lg">00.000.000/0001-91</b>
      <p class="text-sm opacity-70">
        O Banco do Brasil S.A, mais conhecido como BB, é uma das maiores
        instituições financeiras do país, sendo sua atuação ligada ao segmento
        de serviços bancários. Criado no início do século XIX, ainda no Brasil
        Império, o Banco do Brasil se tornou uma das maiores instituições
        financeiras do país ao longo do tempo, figurando na lista dos cinco
        maiores bancos de varejo do Brasil. O Banco do Brasil é constituído como
        sociedade de economia mista e suas ações são negociadas na Bolsa do
        Brasil, a B3, sob o código BBAS3.
      </p>
    </div>

    <MoleculesChat
      class="w-full overflow-hidden rounded-[30px] bg-black/10 dark:bg-white/10"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ChartTimeRange } from '~/types/chart'
import { generateChartConfig } from '~/helpers/utils'

const route = useRoute()
const { getAsset } = useAssetsService()

const ticker = route.params.ticker as string
const asset = await getAsset(ticker)
const selectedTimeRange = ref<ChartTimeRange>('month')
const showRelevantDocs = ref(true)
const seeMyInsights = ref(true)
const seeSmartIndicators = ref(true)
const isLoadingChart = ref(false)

// Configuração do gráfico baseada no período selecionado
const chartConfig = computed(() =>
  generateChartConfig({
    timeRange: selectedTimeRange.value,
    label: ticker.toUpperCase(),
    basePrice: asset.close || 100,
  })
)

// Simula loading quando muda o período
watch(selectedTimeRange, () => {
  isLoadingChart.value = true
  setTimeout(() => {
    isLoadingChart.value = false
  }, 2000) // Loading por 2 segundos
})
</script>

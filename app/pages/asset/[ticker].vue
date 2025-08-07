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
            R$ 23,00 <span class="text-green-500">(+2,00% hoje)</span>
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
    <div class="w-full border-b p-4">
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

    <!-- Details in wallet -->
    <div
      class="dark:bg-tertiary/40 border-b-secondary bg-tertiary flex w-full gap-3 border-b-[6px] px-6 py-4 text-white"
    >
      <IconAi class="fill-secondary mt-1 h-5" />
      <div class="flex flex-col gap-4">
        <h2 class="text-secondary text-lg font-bold">Na sua carteira</h2>
        <div class="flex flex-wrap gap-4">
          <MoleculesTickerIndicator
            name="Score de viabilidade"
            value="Alta"
            help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
            is-intelligent
          />
          <MoleculesTickerIndicator
            name="Grau de Endividamento Inteligente"
            value="Baixo"
            help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
            is-intelligent
          /><MoleculesTickerIndicator
            name="Proteção do Minoritário"
            value="Alto"
            help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
            is-intelligent
          />
        </div>
      </div>
    </div>

    <!-- Asset Details -->
    <div class="flex flex-col gap-4 border-b p-4">
      <h2 class="mb-4 text-lg font-bold">Indicadores básicos</h2>
      <div class="flex w-full flex-wrap gap-7">
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
      <div class="mb-4 mt-4 flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <IconAi class="fill-secondary h-5" />
          <h2 class="text-secondary text-lg font-bold">
            Indicadores inteligentes
          </h2>
        </div>
        <p class="text-[13px]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          vulputate erat non massa tristique.
        </p>
      </div>
      <div class="flex w-full flex-wrap gap-7">
        <MoleculesTickerIndicator
          name="Score de viabilidade"
          value="Alta"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          is-intelligent
        />
        <MoleculesTickerIndicator
          name="Grau de Endividamento Inteligente"
          value="Baixo"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          is-intelligent
        /><MoleculesTickerIndicator
          name="Proteção do Minoritário"
          value="Alto"
          help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
          is-intelligent
        />
      </div>
      <div class="flex flex-col gap-1">
        <AtomsAiInsight />
        <small class="opacity-70">
          * Isso não é uma recomendação de investimento
        </small>
      </div>
    </div>

    <!-- Dividends Chart -->
    <div class="flex flex-col gap-4 border-b p-4">
      <AtomsGraphDividends />
    </div>

    <!-- Asset docs -->
    <div class="flex flex-col gap-4 p-4">
      <h2 class="text-lg font-bold">Documentos</h2>
      <div class="flex items-center gap-2">
        <IconAi class="fill-secondary h-5" />
        <UCheckbox v-model="showRelevantDocs" color="secondary" />
        <h2 class="text-secondary">Mostrar somente relevantes</h2>
      </div>
      <div
        class="flex flex-col gap-2 rounded-lg border p-4"
        :class="{
          'bg-tertiary dark:bg-tertiary/40 border-tertiary text-secondary':
            showRelevantDocs,
        }"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <b class="text-[14px]"
              >Esclarecimentos sobre questionamentos da CVM/B3 - Comunicado ao
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

    <MoleculesChat class="w-full bg-black/10 dark:bg-white/10" />
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
const showRelevantDocs = ref(true)

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

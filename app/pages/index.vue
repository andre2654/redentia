<template>
  <NuxtLayout title="Visão geral" hide-search-bar>
    <div class="flex h-full flex-col gap-4 pb-8 pt-6">
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Ações e fundos imobiliarios</h2>
        <p class="text-[13px] font-extralight">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          vulputate erat non massa tristique.
        </p>
      </div>
      <div class="flex flex-col">
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
        <MoleculesSearchAssets
          class="light:border-b-gray-300 rounded-none border-y py-4"
        />
      </div>
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
            :loading="loading"
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
        </div>
      </div>
      <div class="flex items-center justify-between gap-3 px-6">
        <h2 class="text-[18px] font-bold">Maiores altas e baixas</h2>
        <UButtonGroup v-if="showMap" orientation="horizontal" variant="soft">
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
      </div>
      <div v-if="showMap">
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
        <div class="grid grid-cols-1 justify-center gap-6 px-6 md:grid-cols-2">
          <AtomsTicker v-for="index in 8" :key="index" />
        </div>
        <NuxtLink
          to="/assets"
          class="mt-4 flex items-center justify-center gap-2 hover:underline"
        >
          Ver todos
        </NuxtLink>
        <div class="flex flex-col gap-3 px-6">
          <h2 class="text-[18px] font-bold">Maiores baixas e baixas</h2>
          <div class="grid grid-cols-1 justify-center gap-6 md:grid-cols-2">
            <AtomsTicker v-for="index in 8" :key="index" />
          </div>
        </div>
      </template>
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
import type { ChartTimeRange } from '~/types/chart'

import { generateChartConfig } from '~/helpers/utils'

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

const chartConfig = computed(() =>
  generateChartConfig({
    timeRange: selectedTimeRange.value,
    label: 'IBOV',
    basePrice: 1000,
  })
)

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 3000)
})
</script>

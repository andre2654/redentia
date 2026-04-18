<template>
  <NuxtLayout name="static" title="Maiores Dividend Yields da Bolsa">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero -->
      <div class="flex flex-col gap-3">
        <NuxtLink
          to="/ranking"
          class="flex items-center gap-1 text-xs transition hover:opacity-80"
          :style="{ color: brand.colors.textMuted }"
        >
          <UIcon name="i-lucide-chevron-left" class="size-3" />
          Todos os rankings
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div
            class="flex size-12 items-center justify-center rounded-xl"
            :style="{ backgroundColor: brand.colors.primary + '22' }"
          >
            <UIcon
              name="i-lucide-coins"
              class="size-6"
              :style="{ color: brand.colors.primary }"
            />
          </div>
          <div>
            <p
              class="text-[10px] font-medium uppercase tracking-[0.15em]"
              :style="{ color: brand.colors.textMuted }"
            >
              Ranking
            </p>
            <h1 class="text-3xl font-bold md:text-4xl">
              Maiores Dividend Yields
            </h1>
          </div>
        </div>
        <p class="max-w-2xl text-base" :style="{ color: brand.colors.textMuted }">
          Ações e fundos imobiliários com os maiores dividend yields dos
          últimos 12 meses na bolsa brasileira. Rankings atualizados
          diariamente com base nos dados oficiais da B3.
        </p>
      </div>

      <!-- Type filter tabs -->
      <div
        class="inline-flex gap-1 rounded-xl border p-1"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
      >
        <button
          v-for="tab in tabs"
          :key="tab.value ?? 'all'"
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition"
          :style="{
            backgroundColor: activeType === tab.value ? brand.colors.primary : 'transparent',
            color: activeType === tab.value ? readableOn(brand.colors.primary) : brand.colors.textMuted,
          }"
          @click="activeType = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Table -->
      <div v-if="pending" class="flex items-center justify-center py-16">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
      </div>
      <MoleculesRankingTable
        v-else
        :rows="rows"
        :columns="['dy', 'pe', 'change', 'marketCap']"
        change-label="Hoje"
      />

      <!-- SEO content -->
      <article
        class="prose prose-invert mt-8 max-w-none border-t pt-8"
        :style="{ borderColor: brand.colors.border }"
      >
        <h2 class="text-2xl font-bold">O que é Dividend Yield?</h2>
        <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">
          Dividend Yield (DY) é o indicador que mostra quanto uma empresa pagou
          em dividendos nos últimos 12 meses em relação ao preço atual da ação.
          Um DY de 10% significa que, para cada R$ 100 investidos, o acionista
          recebeu R$ 10 em proventos no período.
        </p>
        <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">
          É uma das métricas mais usadas por investidores de renda passiva no
          Brasil, especialmente para ações de setores maduros (bancos,
          utilidades, energia) e fundos imobiliários, onde o fluxo de
          dividendos é mais estável e previsível.
        </p>

        <h3 class="text-xl font-semibold">Como o ranking é calculado?</h3>
        <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">
          O ranking considera o dividend yield nos últimos 12 meses (TTM),
          cruzando os dividendos pagos com o preço atual de cada ativo.
          Aplicamos filtros de qualidade para evitar distorções: excluímos DY
          acima de 50% (tipicamente erros de dados) e ativos sem histórico
          recente de pagamentos.
        </p>

        <h3 class="text-xl font-semibold">Atenção ao "DY alto demais"</h3>
        <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">
          Um DY muito elevado pode indicar tanto uma oportunidade quanto uma
          armadilha de valor (<em>value trap</em>). Quando o preço da ação cai
          muito por problemas fundamentais, o DY histórico sobe artificialmente
         , mas dividendos futuros podem ser cortados. Use o ranking como
          ponto de partida e sempre analise o histórico, payout e geração de
          caixa da empresa.
        </p>
      </article>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

import { readableOn } from '~/utils/color'

const brand = useBrand()
const service = useAssetsService()

usePageSeo({
  title: 'Maiores Dividend Yields da Bolsa 2026 | Redentia',
  description:
    'Ranking atualizado das ações e FIIs com maior dividend yield (DY) da bolsa brasileira nos últimos 12 meses. Dados da B3 em tempo real.',
  path: '/ranking/maiores-dividend-yield',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/ranking' },
    { name: 'Maiores Dividend Yields', path: '/ranking/maiores-dividend-yield' },
  ],
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Maiores Dividend Yields da Bolsa Brasileira 2026',
    description: 'Ranking das ações e FIIs com maior dividend yield da B3, atualizado diariamente.',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: 50,
  },
})

type TickerType = 'STOCK' | 'REIT' | 'ETF' | null

const tabs: Array<{ label: string; value: TickerType }> = [
  { label: 'Todos', value: null },
  { label: 'Ações', value: 'STOCK' },
  { label: 'FIIs', value: 'REIT' },
  { label: 'ETFs', value: 'ETF' },
]

const activeType = ref<TickerType>(null)

const { data: rows, pending } = await useAsyncData(
  'ranking-dy',
  () => service.getTopDividendYield(activeType.value, 50),
  {
    watch: [activeType],
    default: () => [],
  }
)
</script>

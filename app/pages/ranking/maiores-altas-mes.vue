<template>
  <NuxtLayout :name="layoutName" title="Maiores Altas do Mês">
    <section class="flex flex-col gap-8 px-6 py-8">
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
            :style="{ backgroundColor: brand.colors.positive + '22' }"
          >
            <UIcon
              name="i-lucide-trending-up"
              class="size-6"
              :style="{ color: brand.colors.positive }"
            />
          </div>
          <div>
            <p
              class="text-[10px] font-medium uppercase tracking-[0.15em]"
              :style="{ color: brand.colors.textMuted }"
            >
              Ranking
            </p>
            <h1
              class="font-light"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(28px, 4vw, 36px)',
                lineHeight: 1.05,
                letterSpacing: '-0.7px',
              }"
            >Maiores Altas do Mês</h1>
          </div>
        </div>
        <p class="max-w-2xl text-base" :style="{ color: brand.colors.textMuted }">
          As ações e fundos imobiliários que mais se valorizaram nos últimos
          30 dias na bolsa brasileira. Atualizado diariamente.
        </p>
      </div>

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
            backgroundColor: activeType === tab.value ? brand.colors.positive : 'transparent',
            color: activeType === tab.value ? readableOn(brand.colors.positive) : brand.colors.textMuted,
          }"
          @click="activeType = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="pending" class="flex items-center justify-center py-16">
        <UIcon name="i-lucide-loader" class="size-6 motion-safe:animate-spin" />
      </div>
      <MoleculesRankingTable
        v-else
        :rows="rows"
        :columns="['change', 'marketCap']"
        change-label="Variação 30d"
      />

      <article
        class="mt-8 border-t pt-8"
        :style="{ borderColor: brand.colors.border }"
      >
        <h2>Como o ranking é calculado?</h2>
        <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">
          Comparamos o preço de fechamento atual com o preço de fechamento de
          aproximadamente 30 dias corridos atrás (respeitando dias úteis da
          B3). A variação percentual é então ordenada do maior para o menor
          ganho.
        </p>
        <h3>Por que acompanhar?</h3>
        <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">
          Rankings de altas ajudam a identificar momentum, setores aquecidos e
          ativos em tendência. Combinado com análise fundamentalista, serve
          como filtro inicial para novas teses de investimento ou
          monitoramento de posições existentes.
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
const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'static'
)
const service = useAssetsService()

usePageSeo({
  title: 'Maiores Altas do Mês na Bolsa Brasileira | Redentia',
  description:
    'Ranking atualizado diariamente das ações e FIIs que mais subiram nos últimos 30 dias na B3. Veja os top performers do mercado brasileiro.',
  path: '/ranking/maiores-altas-mes',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/ranking' },
    { name: 'Maiores Altas do Mês', path: '/ranking/maiores-altas-mes' },
  ],
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Maiores Altas do Mês na Bolsa Brasileira',
    description: 'Ações e FIIs que mais subiram nos últimos 30 dias na B3.',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: 50,
  },
})

type TickerType = 'STOCK' | 'REIT' | 'ETF' | 'BDR' | null

const tabs: Array<{ label: string; value: TickerType }> = [
  { label: 'Todos', value: null },
  { label: 'Ações', value: 'STOCK' },
  { label: 'FIIs', value: 'REIT' },
  { label: 'ETFs', value: 'ETF' },
]

const activeType = ref<TickerType>(null)

const { data: rows, pending } = await useAsyncData(
  'ranking-altas-mes',
  () => service.getMonthlyChange('top', activeType.value, 50),
  { watch: [activeType], default: () => [] }
)
</script>

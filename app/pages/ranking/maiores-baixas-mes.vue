<template>
  <NuxtLayout name="static" title="Maiores Baixas do Mês">
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
            :style="{ backgroundColor: brand.colors.negative + '22' }"
          >
            <UIcon
              name="i-lucide-trending-down"
              class="size-6"
              :style="{ color: brand.colors.negative }"
            />
          </div>
          <div>
            <p
              class="text-[10px] font-medium uppercase tracking-[0.15em]"
              :style="{ color: brand.colors.textMuted }"
            >
              Ranking
            </p>
            <h1 class="text-3xl font-bold md:text-4xl">Maiores Baixas do Mês</h1>
          </div>
        </div>
        <p class="max-w-2xl text-base" :style="{ color: brand.colors.textMuted }">
          Os ativos que mais caíram nos últimos 30 dias na bolsa brasileira.
          Oportunidades de entrada ou alertas de risco — a análise depende da
          tese de cada investidor.
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
            backgroundColor: activeType === tab.value ? brand.colors.negative : 'transparent',
            color: activeType === tab.value ? readableOn(brand.colors.negative) : brand.colors.textMuted,
          }"
          @click="activeType = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="pending" class="flex items-center justify-center py-16">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
      </div>
      <MoleculesRankingTable
        v-else
        :rows="rows"
        :columns="['change', 'marketCap']"
        change-label="Variação 30d"
      />

      <article
        class="prose prose-invert mt-8 max-w-none border-t pt-8"
        :style="{ borderColor: brand.colors.border }"
      >
        <h2 class="text-2xl font-bold">Oportunidade ou armadilha?</h2>
        <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">
          Ativos em baixa podem representar entradas a preços descontados —
          mas também podem estar refletindo deterioração de fundamentos. Antes
          de qualquer decisão, analise o motivo da queda: é setorial,
          macroeconômico ou específico da empresa?
        </p>
        <h3 class="text-xl font-semibold">Como usar este ranking</h3>
        <ul class="space-y-2" :style="{ color: brand.colors.textMuted }">
          <li>Identifique setores com quedas generalizadas (pressão macro)</li>
          <li>Pesquise notícias recentes sobre cada ativo</li>
          <li>Compare a queda com pares do mesmo setor</li>
          <li>Verifique se a tese de longo prazo continua intacta</li>
        </ul>
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

useSeoMeta({
  title: 'Maiores Baixas do Mês na Bolsa Brasileira | Redentia',
  description:
    'Ranking atualizado diariamente das ações e FIIs que mais caíram nos últimos 30 dias na B3. Identifique oportunidades e riscos do mercado brasileiro.',
  ogTitle: 'Maiores Baixas do Mês na Bolsa | Ranking Diário',
  ogDescription: 'Ações que mais caíram nos últimos 30 dias na bolsa brasileira.',
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
  'ranking-baixas-mes',
  () => service.getMonthlyChange('bottom', activeType.value, 50),
  { watch: [activeType], default: () => [] }
)
</script>

<template>
  <NuxtLayout name="static" title="Rankings do Mercado">
    <section class="flex flex-col gap-8 px-6 py-8">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trophy" class="text-primary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">Rankings do Mercado</h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Acompanhe os rankings mais relevantes do mercado brasileiro, atualizados diariamente com dados oficiais da B3.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <NuxtLink
          v-for="ranking in rankings"
          :key="ranking.to"
          :to="ranking.to"
          class="group flex flex-col gap-3 rounded-2xl border p-6 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:border-white/20"
          :style="{
            borderColor: brand.colors.border,
            backgroundColor: brand.colors.surface,
          }"
        >
          <div class="flex items-center justify-between">
            <div
              class="flex size-10 items-center justify-center rounded-xl"
              :style="{ backgroundColor: brand.colors.primary + '22' }"
            >
              <UIcon
                :name="ranking.icon"
                class="size-5"
                :style="{ color: brand.colors.primary }"
              />
            </div>
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              :style="{ color: brand.colors.textMuted }"
            />
          </div>
          <h2 class="text-lg font-semibold" :style="{ color: brand.colors.text }">
            {{ ranking.title }}
          </h2>
          <p class="text-sm" :style="{ color: brand.colors.textMuted }">
            {{ ranking.description }}
          </p>
        </NuxtLink>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const brand = useBrand()

usePageSeo({
  title: 'Rankings do Mercado Brasileiro | Redentia',
  description:
    'Rankings atualizados diariamente: maiores dividend yields, maiores altas e baixas do mês, calendário de dividendos e comparativos por setor. Dados oficiais da B3.',
  path: '/ranking',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/ranking' },
  ],
})

const allRankings = [
  {
    to: '/ranking/maiores-dividend-yield',
    icon: 'i-lucide-coins',
    title: 'Maiores Dividend Yields',
    description:
      'Ações e FIIs que mais pagam dividendos proporcionalmente ao preço, com base nos últimos 12 meses.',
    flag: 'showDividendYieldRanking',
  },
  {
    to: '/ranking/maiores-altas-mes',
    icon: 'i-lucide-trending-up',
    title: 'Maiores Altas do Mês',
    description:
      'Ranking dos ativos que mais se valorizaram nos últimos 30 dias na bolsa brasileira.',
    flag: 'showMonthlyMoversRanking',
  },
  {
    to: '/ranking/maiores-baixas-mes',
    icon: 'i-lucide-trending-down',
    title: 'Maiores Baixas do Mês',
    description:
      'Ativos que mais caíram no último mês, oportunidades ou alertas, depende da tese.',
    flag: 'showMonthlyMoversRanking',
  },
  {
    to: '/dividendos/calendario',
    icon: 'i-lucide-calendar-days',
    title: 'Calendário de Dividendos',
    description:
      'Próximos pagamentos de dividendos e proventos anunciados por empresas listadas.',
    flag: 'showDividendCalendar',
  },
] as const

const rankings = computed(() =>
  allRankings.filter((r) => (brand.features as any)?.[r.flag] === true)
)
</script>

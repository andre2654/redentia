<!--
  /ranking — Rankings index, Stripe-style.

  Hierarchy: eyebrow → display heading (weight 300) → lead → card grid.
  Cards mirror the stripe-card pattern: muted neutral surface, icon
  chip top-left, arrow top-right, title medium (500), body muted via
  color-mix on brand text. No `font-bold`, no `text-gray-*` literals.
-->
<template>
  <NuxtLayout :name="layoutName" title="Rankings do Mercado">
    <section class="flex flex-col gap-12 px-6 py-10 md:py-14">
      <!-- ============ Hero ============ -->
      <header class="flex max-w-3xl flex-col gap-3">
        <span
          class="font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
        >Rankings · B3</span>
        <h1
          class="font-light"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(28px, 4vw, 36px)',
            lineHeight: 1.05,
            letterSpacing: '-0.7px',
          }"
        >Rankings do Mercado</h1>
        <p
          class="max-w-2xl"
          :style="{
            fontSize: '17.5px',
            lineHeight: 1.55,
            color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
          }"
        >Os rankings que separam ativo de barulho — atualizados diariamente com dados oficiais da B3. Maiores dividend yields, maiores movimentações do mês e calendário de pagamentos.</p>
      </header>

      <!-- ============ Card grid ============ -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <NuxtLink
          v-for="r in rankings"
          :key="r.to"
          :to="r.to"
          class="ranking-card group flex flex-col gap-4 rounded-xl border p-6 transition-[border-color,background-color,box-shadow]"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 50%, ${brand.colors.background})`,
            borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
          }"
        >
          <div class="flex items-start justify-between">
            <span
              class="flex size-10 items-center justify-center rounded-lg"
              :style="{
                backgroundColor: `color-mix(in srgb, ${r.tint} 14%, transparent)`,
              }"
            >
              <UIcon
                :name="r.icon"
                class="size-5"
                :style="{ color: r.tint }"
              />
            </span>
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-4 opacity-50 transition-[transform,opacity] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              :style="{ color: brand.colors.primary }"
            />
          </div>

          <div class="flex flex-col gap-2">
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{
                letterSpacing: '0.18em',
                color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
              }"
            >{{ r.eyebrow }}</span>
            <h2
              class="text-[20px] font-medium"
              :style="{
                color: brand.colors.text,
                lineHeight: 1.2,
                letterSpacing: '-0.32px',
              }"
            >{{ r.title }}</h2>
            <p
              class="text-[14.5px]"
              :style="{
                lineHeight: 1.55,
                color: `color-mix(in srgb, ${brand.colors.text} 68%, transparent)`,
              }"
            >{{ r.description }}</p>
          </div>
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
const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'static'
)

usePageSeo({
  title: 'Rankings do Mercado Brasileiro | Redentia',
  description:
    'Rankings atualizados diariamente, maiores dividend yields, maiores altas e baixas do mês, calendário de dividendos e comparativos por setor. Dados oficiais da B3.',
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
    tint: '#34d399',
    eyebrow: 'Renda passiva',
    title: 'Maiores Dividend Yields',
    description:
      'Ações e FIIs que mais pagam dividendos proporcionalmente ao preço, com base nos últimos 12 meses.',
    flag: 'showDividendYieldRanking',
  },
  {
    to: '/ranking/maiores-altas-mes',
    icon: 'i-lucide-trending-up',
    tint: '#34d399',
    eyebrow: 'Movimentação · 30d',
    title: 'Maiores Altas do Mês',
    description:
      'Ranking dos ativos que mais se valorizaram nos últimos 30 dias na bolsa brasileira.',
    flag: 'showMonthlyMoversRanking',
  },
  {
    to: '/ranking/maiores-baixas-mes',
    icon: 'i-lucide-trending-down',
    tint: '#f87171',
    eyebrow: 'Movimentação · 30d',
    title: 'Maiores Baixas do Mês',
    description:
      'Ativos que mais caíram no último mês, oportunidades ou alertas, depende da tese.',
    flag: 'showMonthlyMoversRanking',
  },
  {
    to: '/dividendos/calendario',
    icon: 'i-lucide-calendar-days',
    tint: '#fbbf24',
    eyebrow: 'Calendário',
    title: 'Calendário de Dividendos',
    description:
      'Próximos pagamentos de dividendos e proventos anunciados por empresas listadas, em formato visual de calendário.',
    flag: 'showDividendCalendar',
  },
] as const

const rankings = computed(() =>
  allRankings.filter((r) => (brand.features as any)?.[r.flag] === true),
)
</script>

<style scoped>
.ranking-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 4%, var(--brand-background)) !important;
  box-shadow:
    0 12px 28px -16px color-mix(in srgb, var(--brand-primary) 25%, transparent),
    0 4px 12px -6px rgba(0, 0, 0, 0.10);
}

@media (prefers-reduced-motion: reduce) {
  .ranking-card,
  .ranking-card:hover {
    transition: none;
  }
}
</style>

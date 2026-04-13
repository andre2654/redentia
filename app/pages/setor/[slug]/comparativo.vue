<template>
  <NuxtLayout name="static" :title="sector?.name || 'Setor'">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero -->
      <div class="flex flex-col gap-3">
        <NuxtLink
          to="/setor"
          class="flex items-center gap-1 text-xs transition hover:opacity-80"
          :style="{ color: brand.colors.textMuted }"
        >
          <UIcon name="i-lucide-chevron-left" class="size-3" />
          Todos os setores
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div
            class="flex size-12 items-center justify-center rounded-xl"
            :style="{ backgroundColor: brand.colors.secondary + '22' }"
          >
            <UIcon
              name="i-lucide-layers"
              class="size-6"
              :style="{ color: brand.colors.secondary }"
            />
          </div>
          <div>
            <p
              class="text-[10px] font-medium uppercase tracking-[0.15em]"
              :style="{ color: brand.colors.textMuted }"
            >
              Comparativo Setorial
            </p>
            <h1 class="text-3xl font-bold md:text-4xl">
              {{ sector?.name || 'Setor' }}
            </h1>
          </div>
        </div>
        <p class="max-w-2xl text-base" :style="{ color: brand.colors.textMuted }">
          Comparativo completo das empresas do setor
          <strong>{{ sector?.name || '' }}</strong> na bolsa brasileira com
          indicadores fundamentalistas e métricas de mercado atualizadas.
        </p>
      </div>

      <!-- Aggregate metrics -->
      <div v-if="aggregates" class="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div
          class="flex flex-col gap-1 rounded-xl border px-4 py-3"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <span
            class="text-[10px] uppercase tracking-wider"
            :style="{ color: brand.colors.textMuted }"
          >
            Empresas
          </span>
          <span
            class="text-xl font-semibold tabular-nums"
            :style="{ color: brand.colors.text }"
          >
            {{ aggregates.ticker_count }}
          </span>
        </div>
        <div
          class="flex flex-col gap-1 rounded-xl border px-4 py-3"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <span
            class="text-[10px] uppercase tracking-wider"
            :style="{ color: brand.colors.textMuted }"
          >
            Market Cap
          </span>
          <span
            class="text-xl font-semibold tabular-nums"
            :style="{ color: brand.colors.text }"
          >
            {{ formatMarketCap(aggregates.total_market_cap) }}
          </span>
        </div>
        <div
          class="flex flex-col gap-1 rounded-xl border px-4 py-3"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <span
            class="text-[10px] uppercase tracking-wider"
            :style="{ color: brand.colors.textMuted }"
          >
            Variação média hoje
          </span>
          <span
            class="text-xl font-semibold tabular-nums"
            :style="{
              color: aggregates.avg_change_percent >= 0 ? brand.colors.positive : brand.colors.negative,
            }"
          >
            {{ formatPercent(aggregates.avg_change_percent) }}
          </span>
        </div>
        <div
          class="flex flex-col gap-1 rounded-xl border px-4 py-3"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <span
            class="text-[10px] uppercase tracking-wider"
            :style="{ color: brand.colors.textMuted }"
          >
            DY médio (12m)
          </span>
          <span
            class="text-xl font-semibold tabular-nums"
            :style="{ color: dyAccent }"
          >
            {{ aggregates.avg_dividend_yield != null ? formatPercent(aggregates.avg_dividend_yield * 100) : '—' }}
          </span>
        </div>
      </div>

      <!-- Table -->
      <div v-if="pending" class="flex items-center justify-center py-16">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
      </div>
      <div
        v-else-if="!sector"
        class="flex flex-col items-center gap-3 py-16 text-center"
      >
        <UIcon
          name="i-lucide-search-x"
          class="size-10"
          :style="{ color: brand.colors.textMuted }"
        />
        <p class="text-sm" :style="{ color: brand.colors.textMuted }">
          Setor não encontrado.
        </p>
        <NuxtLink
          to="/setor"
          class="text-xs transition hover:underline"
          :style="{ color: brand.colors.primary }"
        >
          Voltar aos setores disponíveis
        </NuxtLink>
      </div>
      <MoleculesRankingTable
        v-else
        :rows="rows"
        :columns="['dy', 'pe', 'change', 'marketCap']"
        change-label="Hoje"
      />

      <!-- SEO content -->
      <article
        v-if="sector"
        class="prose prose-invert mt-8 max-w-none border-t pt-8"
        :style="{ borderColor: brand.colors.border }"
      >
        <h2 class="text-2xl font-bold">Sobre o setor {{ sector.name }}</h2>
        <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">
          O setor <strong>{{ sector.name }}</strong> da bolsa brasileira reúne
          {{ aggregates?.ticker_count }} empresas listadas, ordenadas aqui por
          capitalização de mercado. Use esta página para comparar rapidamente
          indicadores fundamentalistas como dividend yield, preço/lucro e
          price-to-book entre empresas do mesmo setor.
        </p>
        <h3 class="text-xl font-semibold">Como usar o comparativo</h3>
        <ul class="space-y-2" :style="{ color: brand.colors.textMuted }">
          <li>Identifique líderes por market cap no topo da lista</li>
          <li>Compare DY e P/L entre pares diretos do setor</li>
          <li>
            Clique em qualquer ticker para análise completa com gráficos e
            histórico de dividendos
          </li>
          <li>Observe a variação média para capturar momentum setorial</li>
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

import { dividendAccent } from '~/utils/color'

const brand = useBrand()
const route = useRoute()
const service = useAssetsService()

const dyAccent = computed(() =>
  dividendAccent(brand.colors.primary, brand.colors.negative, brand.colors.positive)
)

const slug = computed(() => (route.params.slug as string) || '')

const { data, pending } = await useAsyncData(
  `sector-${slug.value}`,
  () => service.getSectorTickers(slug.value, 150),
  { default: () => ({ sector: null, aggregates: null, data: [] }) }
)

const sector = computed(() => data.value?.sector || null)
const aggregates = computed(() => data.value?.aggregates || null)
const rows = computed(() => data.value?.data || [])

usePageSeo({
  title: () =>
    sector.value
      ? `${sector.value.name} — Comparativo de Empresas | Redentia`
      : 'Setor não encontrado | Redentia',
  description: () =>
    sector.value
      ? `Comparativo completo de empresas do setor ${sector.value.name} na bolsa brasileira: dividend yield, P/L, market cap e variação atualizados diariamente.`
      : 'Setor não encontrado.',
  path: `/setor/${slug.value}/comparativo`,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Setores', path: '/setor' },
    { name: sector.value?.name || slug.value, path: `/setor/${slug.value}/comparativo` },
  ],
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: sector.value ? `Comparativo de Empresas — ${sector.value.name}` : 'Comparativo de Setor',
    description: sector.value
      ? `Empresas do setor ${sector.value.name} na bolsa brasileira, comparadas por indicadores fundamentalistas.`
      : '',
    numberOfItems: rows.value.length,
  },
})

function formatPercent(value: number | string | null | undefined): string {
  if (value == null) return '—'
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '—'
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(2).replace('.', ',')}%`
}

function formatMarketCap(value: number | string): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num <= 0) return '—'
  if (num >= 1_000_000_000_000) return `R$ ${(num / 1_000_000_000_000).toFixed(1)}T`
  if (num >= 1_000_000_000) return `R$ ${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `R$ ${(num / 1_000_000).toFixed(1)}M`
  return num.toLocaleString('pt-BR')
}
</script>

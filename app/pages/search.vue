<template>
  <NuxtLayout
    :name="layoutName"
    :title="authStore.isAuthenticated ? 'Busca avançada' : false"
    :hide-search-bar="authStore.isAuthenticated"
  >
    <div class="flex flex-col gap-12 pb-16 pt-6">

      <section class="max-md:px-4">
        <div class="mx-auto flex w-full  flex-col gap-6">
          <div class="flex flex-col gap-2">
            <span class="text-xs font-medium uppercase tracking-[0.3em] text-secondary/70">
              Busca
            </span>
            <h1 class="text-3xl font-semibold text-white md:text-4xl">
              Encontre ativos com precisão
            </h1>
            <p class="text-sm text-white/70 md:text-base">
              Combine indicadores técnicos e fundamentais para identificar
              oportunidades em ações, FIIs, BDRs e ETFs.
            </p>
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            <div
              class="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/80 backdrop-blur"
            >
              <span class="text-xs uppercase tracking-[0.3em] text-secondary/70"
                >Resultados</span
              >
              <p class="mt-2 text-3xl font-semibold text-white md:text-4xl">
                {{ resultsCount }}
              </p>
              <p class="text-xs text-white/60">Ativos batendo com os filtros atuais.</p>
            </div>
            <div
              class="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/80 backdrop-blur"
            >
              <span class="text-xs uppercase tracking-[0.3em] text-secondary/70"
                >Filtros ativos</span
              >
              <p class="mt-2 text-3xl font-semibold text-white md:text-4xl">
                {{ activeFiltersCount }}
              </p>
              <p class="text-xs text-white/60">Intervalos ou grupos modificados.</p>
            </div>
            <div
              class="rounded-3xl border border-white/10 bg-white/5 p-5 text-white/80 backdrop-blur"
            >
              <span class="text-xs uppercase tracking-[0.3em] text-secondary/70"
                >Atualização</span
              >
              <p class="mt-2 text-3xl font-semibold text-white md:text-4xl">
                {{ lastUpdatedLabel }}
              </p>
              <p class="text-xs text-white/60">Sincronizado com a API Redentia.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="max-md:px-4">
        <AtomsTickerCarousel
          class="mx-auto hidden w-full  rounded-full bg-white/5 px-6 py-3 md:flex"
          big
          no-control
        />
        <AtomsTickerCarousel
          class="mx-auto w-full  rounded-full bg-white/5 px-3 py-2 md:hidden"
          no-control
        />
      </section>

      <section class="max-md:px-4">
        <div class="mx-auto flex w-full  flex-col gap-8">
          <div
            class="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.45)] backdrop-blur"
          >
            <div class="flex flex-col gap-6 text-white">
              <div class="flex flex-col gap-2">
                <span class="text-xs font-medium uppercase tracking-[0.3em] text-secondary/70">
                  Filtros avançados
                </span>
                <h2 class="text-2xl font-semibold">Personalize sua análise</h2>
                <p class="text-sm text-white/70">
                  Ajuste ranges numéricos, selecione grupos de ativos e combine com buscas
                  rápidas.
                </p>
              </div>

              <AtomsFormInput
                id="global-search-input"
                v-model="globalFilter"
                placeholder="Buscar por nome ou ticker..."
                size="lg"
                variant="soft"
                icon="i-lucide-search"
                class="w-full"
                :ui="{
                  base: 'bg-black/50 border border-white/10 text-white placeholder:text-white/40',
                }"
              >
                <template #trailing>
                  <div class="flex items-center gap-2 max-lg:hidden">
                    <UKbd value="meta" variant="link" color="neutral" />
                    <UKbd value="K" variant="link" color="neutral" />
                  </div>
                </template>
              </AtomsFormInput>

              <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div
                  class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div class="flex items-center justify-between text-sm font-semibold">
                    <span>Market Cap (R$)</span>
                  </div>
                  <span class="text-xs font-light text-white/60">
                    {{ formatCurrencyBRL(marketCapRange[0]) }} -
                    {{ formatCurrencyBRL(marketCapRange[1]) }}
                  </span>
                  <USlider
                    v-model="marketCapRange"
                    :min="minMax.mcMin"
                    :max="minMax.mcMax"
                    :step="minMax.mcStep"
                  />
                </div>

                <div
                  class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div class="flex items-center justify-between text-sm font-semibold">
                    <span>Preço (R$)</span>
                  </div>
                  <span class="text-xs font-light text-white/60">
                    <template v-if="!assetsLoading">
                      {{ formatCurrencyBRL(priceRange[0]) }} -
                      {{ formatCurrencyBRL(priceRange[1]) }}
                    </template>
                    <template v-else>...</template>
                  </span>
                  <USlider
                    v-model="priceRange"
                    :min="minMax.priceMin"
                    :max="minMax.priceMax"
                    :step="0.01"
                    :disabled="assetsLoading"
                  />
                </div>

                <div
                  class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div class="flex items-center justify-between text-sm font-semibold">
                    <span>Variação (%)</span>
                  </div>
                  <span class="text-xs font-light text-white/60">
                    <template v-if="!assetsLoading">
                      {{ formatPercent(changeRange[0]) }} -
                      {{ formatPercent(changeRange[1]) }}
                    </template>
                    <template v-else>...</template>
                  </span>
                  <USlider
                    v-model="changeRange"
                    :min="minMax.changeMin"
                    :max="minMax.changeMax"
                    :step="0.1"
                    :disabled="assetsLoading"
                  />
                </div>

                <div
                  class="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div class="text-sm font-semibold">Grupo</div>
                  <div class="flex flex-wrap items-center gap-3">
                    <UCheckbox
                      v-model="showStock"
                      label="Ação"
                      :disabled="assetsLoading"
                    />
                    <UCheckbox
                      v-model="showReit"
                      label="REIT"
                      :disabled="assetsLoading"
                    />
                    <UCheckbox
                      v-model="showBdr"
                      label="BDR"
                      :disabled="assetsLoading"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div
                  class="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-semibold text-white">
                      MDI — Ocorrência principal
                    </span>
                    <p class="text-xs text-white/60">
                      Mostra ativos cujo mês com maior recorrência de dividendos coincide
                      com o selecionado.
                    </p>
                  </div>
                  <UButtonGroup
                    orientation="horizontal"
                    variant="soft"
                    class="hidden flex-wrap gap-2 md:flex"
                  >
                    <UButton
                      v-for="option in mdiMonthOptions"
                      :key="`mdi-occ-${option.value}`"
                      color="neutral"
                      :variant="
                        mdiOccurrenceFilter === option.value ? 'soft' : 'link'
                      "
                      :label="option.label"
                      class="min-w-[72px]"
                      @click="mdiOccurrenceFilter = option.value"
                    />
                  </UButtonGroup>
                  <USelectMenu
                    v-model="mdiOccurrenceFilter"
                    :items="mdiMonthOptions"
                    label-key="label"
                    value-key="value"
                    class="md:hidden"
                  />
                </div>

                <div
                  class="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-semibold text-white">
                      MDI — Maior probabilidade
                    </span>
                    <p class="text-xs text-white/60">
                      Filtra conforme o mês com maior indicação de pagamento (estrela).
                    </p>
                  </div>
                  <UButtonGroup
                    orientation="horizontal"
                    variant="soft"
                    class="hidden flex-wrap gap-2 md:flex"
                  >
                    <UButton
                      v-for="option in mdiMonthOptions"
                      :key="`mdi-star-${option.value}`"
                      color="neutral"
                      :variant="mdiStarFilter === option.value ? 'soft' : 'link'"
                      :label="option.label"
                      class="min-w-[72px]"
                      @click="mdiStarFilter = option.value"
                    />
                  </UButtonGroup>
                  <USelectMenu
                    v-model="mdiStarFilter"
                    :items="mdiMonthOptions"
                    label-key="label"
                    value-key="value"
                    class="md:hidden"
                  />
                </div>

                <div
                  class="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 p-4"
                >
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-semibold text-white">
                      Dados MDI
                    </span>
                    <p class="text-xs text-white/60">
                      Garanta que apenas ativos com histórico MDI sejam exibidos.
                    </p>
                  </div>
                  <UCheckbox
                    v-model="onlyWithMdi"
                    label="Somente com informações MDI"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            class="rounded-[32px] border border-white/10 bg-black/40 p-4 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.45)] backdrop-blur"
          >
            <div class="flex flex-col gap-4 text-white">
              <div class="flex flex-col gap-2">
                <span class="text-xs font-medium uppercase tracking-[0.3em] text-secondary/70">
                  Resultados
                </span>
                <h2 class="text-2xl font-semibold">Ativos encontrados</h2>
                <p class="text-sm text-white/60">
                  Visualize os dados essenciais de cada ativo e abra o card para ver
                  detalhes completos.
                </p>
              </div>

              <div
                v-if="assetsLoading"
                class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                <USkeleton
                  v-for="i in 6"
                  :key="`asset-skeleton-${i}`"
                  class="h-56 w-full rounded-[28px]"
                />
              </div>

              <template v-else>
                <div
                  v-if="paginatedData.length"
                  class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                >
                  <div
                    v-for="asset in paginatedData"
                    :key="asset.ticker || asset.stock"
                    class="group flex h-full flex-col gap-5 rounded-[28px] border border-white/10 bg-black/30 p-6 transition hover:-translate-y-1 hover:border-secondary/50 hover:bg-black/20"
                    @click="goToAsset(asset.ticker || asset.stock)"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <img
                          v-if="getAssetLogo(asset)"
                          :src="getAssetLogo(asset) || ''"
                          :alt="asset.ticker || asset.stock"
                          class="h-12 w-12 rounded-2xl border border-white/10 bg-white/10 object-cover"
                        />
                        <IconLogo
                          v-else
                          class="h-12 w-12 rounded-2xl border border-white/10 bg-white/10 p-2 text-white/70"
                        />
                        <div class="flex flex-col">
                          <span class="text-xs uppercase tracking-[0.3em] text-secondary/70">
                            {{ asset.ticker || asset.stock }}
                          </span>
                          <span class="text-sm text-white/70 line-clamp-2">
                            {{ asset.name }}
                          </span>
                        </div>
                      </div>
                      <span
                        class="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/60"
                      >
                        {{ getAssetTypeLabel(asset.type) }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 gap-3 text-sm text-white/80">
                      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p class="text-xs uppercase tracking-[0.2em] text-white/50">
                          Market Cap
                        </p>
                        <p class="mt-1 text-base font-semibold text-white">
                          {{ formatCurrencyBRL(asset.market_cap) }}
                        </p>
                      </div>
                      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p class="text-xs uppercase tracking-[0.2em] text-white/50">
                          Preço
                        </p>
                        <p class="mt-1 text-base font-semibold text-white">
                          {{ formatCurrencyBRL(getAssetPrice(asset)) }}
                        </p>
                      </div>
                      <div class="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p class="text-xs uppercase tracking-[0.2em] text-white/50">
                          Variação
                        </p>
                        <div class="mt-2 flex items-center gap-2">
                          <IconArrowFinanceUp
                            :class="[
                              'h-5 w-5 transition',
                              getAssetChange(asset) >= 0
                                ? 'fill-primary'
                                : 'fill-red-500 rotate-180',
                            ]"
                          />
                          <span
                            :class="[
                              'text-base font-semibold',
                              getAssetChange(asset) >= 0
                                ? 'text-primary'
                                : 'text-red-400',
                            ]"
                          >
                            {{ getAssetChange(asset) >= 0 ? '+' : ''
                            }}{{ getAssetChange(asset).toFixed(2) }}% hoje
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="
                        getMdiLabels(asset.mdi).occurrenceLabel ||
                        getMdiLabels(asset.mdi).starLabel
                      "
                      class="rounded-2xl border border-white/10 bg-secondary/10 p-4"
                    >
                      <p class="text-xs uppercase tracking-[0.2em] text-secondary/80">
                        MDI
                      </p>
                      <div class="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <span
                          v-if="getMdiLabels(asset.mdi).occurrenceLabel"
                          class="rounded-full bg-white/10 px-3 py-1 text-white/80"
                        >
                          {{ getMdiLabels(asset.mdi).occurrenceLabel }}
                        </span>
                        <span
                          v-if="getMdiLabels(asset.mdi).starLabel"
                          class="inline-flex items-center gap-2 text-secondary"
                        >
                          <IconAi class="h-5 w-5 fill-secondary" />
                          {{ getMdiLabels(asset.mdi).starLabel }}
                        </span>
                      </div>
                    </div>
                    <div
                      v-else
                      class="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-white/50"
                    >
                      Sem informações MDI disponíveis.
                    </div>

                    <div class="flex items-center justify-between pt-2 text-xs text-white/50">
                      <span>Atualizado às {{ lastUpdatedLabel }}</span>
                      <UButton
                        color="secondary"
                        size="sm"
                        variant="soft"
                        class="rounded-full"
                        :to="`/asset/${asset.ticker || asset.stock}`"
                        @click.stop
                      >
                        Ver ativo
                      </UButton>
                    </div>
                  </div>
                </div>

                <div
                  v-else
                  class="rounded-[28px] border border-white/10 bg-black/30 p-10 text-center text-white/60"
                >
                  Nenhum ativo encontrado com os filtros atuais.
                </div>
              </template>
            </div>

            <div
              v-if="!assetsLoading && resultsCount > itemsPerPage"
              class="mt-6 flex justify-center border-t border-white/10 pt-4"
            >
              <UPagination
                :page="currentPage"
                :items-per-page="itemsPerPage"
                :total="resultsCount"
                @update:page="(page) => (currentPage = page)"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AssetMdiEntry, IAsset } from '~/types/asset'

definePageMeta({
  isPublicRoute: true,
  layoutTransition: {
    name: 'slide-in',
  },
})

const { getAssets } = useAssetsService()
const authStore = useAuthStore()
const router = useRouter()
const siteUrl = useSiteConfig().url

const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

const allAssets = ref<IAsset[]>([])
const data = ref<IAsset[]>([])
const assetsLoading = ref(true)
const lastUpdatedAt = ref<Date | null>(null)

const globalFilter = ref('')

function goToAsset(ticker: string) {
  router.push(`/asset/${ticker}`)
}

defineShortcuts({
  meta_k: () => {
    focusGlobalSearch()
  },
})

function focusGlobalSearch() {
  const el = document.getElementById(
    'global-search-input'
  ) as HTMLInputElement | null
  el?.focus()
}

const monthShortNames = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
] as const
const currentMonthNumber = new Date().getMonth() + 1

const mdiMonthOptions = computed(() => [
  { label: 'Todos os meses', value: 'any' as const },
  ...monthShortNames.map((label, index) => ({
    label,
    value: String(index + 1) as `${number}`,
  })),
])

function toFiniteNumber(value: unknown) {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function getMonthLabel(monthNumber: number) {
  const monthIndex = (((monthNumber - 1) % 12) + 12) % 12
  return monthShortNames[monthIndex] ?? `M${monthNumber}`
}

function getOrderedMonths(startingMonth: number) {
  const months: number[] = []
  for (let i = 0; i < 12; i++) {
    months.push(((startingMonth + i - 1) % 12) + 1)
  }
  return months
}

interface OccurrenceHighlight {
  month: number
  monthLabel: string
  percentage: number | null
}

interface StarHighlight {
  month: number
  monthLabel: string
}

function getMdiHighlights(entries?: AssetMdiEntry[] | null) {
  if (!entries?.length) {
    return { occurrence: null, star: null }
  }

  const monthMap = new Map<number, AssetMdiEntry>()
  for (const entry of entries) {
    const month = toFiniteNumber(entry?.month)
    if (!month) {
      continue
    }
    if (!monthMap.has(month)) {
      monthMap.set(month, entry)
    }
  }

  if (!monthMap.size) {
    return { occurrence: null, star: null }
  }

  const orderedMonths = getOrderedMonths(currentMonthNumber)

  let occurrence: OccurrenceHighlight | null = null
  for (const month of orderedMonths) {
    const entry = monthMap.get(month)
    if (!entry) {
      continue
    }
    const occurrences = toFiniteNumber(entry.occurrences) ?? 0
    const totalYears = toFiniteNumber(entry.total_years) ?? 0
    if (occurrences > 0) {
      const percentage =
        totalYears > 0 ? (occurrences / totalYears) * 100 : null
      occurrence = {
        month,
        monthLabel: getMonthLabel(month),
        percentage,
      }
      break
    }
  }

  const sumRates = entries
    .map((entry) => toFiniteNumber(entry.sum_rate))
    .filter((value): value is number => value !== null)

  const averageSumRate =
    sumRates.length > 0
      ? sumRates.reduce((acc, value) => acc + value, 0) / sumRates.length
      : null

  let star: StarHighlight | null = null
  const getStarForMonth = (month: number): StarHighlight | null => {
    const entry = monthMap.get(month)
    if (!entry) {
      return null
    }
    const sumRate = toFiniteNumber(entry.sum_rate)
    if (
      averageSumRate === null ||
      sumRate === null ||
      sumRate < averageSumRate
    ) {
      return null
    }
    return {
      month,
      monthLabel: getMonthLabel(month),
    }
  }

  if (averageSumRate !== null) {
    if (occurrence) {
      star = getStarForMonth(occurrence.month)
      if (!star) {
        const startIndex = orderedMonths.indexOf(occurrence.month)
        for (let offset = 1; offset < 12; offset++) {
          const month = orderedMonths[(startIndex + offset) % 12]
          if (month === occurrence.month) {
            continue
          }
          const candidate = getStarForMonth(month)
          if (candidate) {
            star = candidate
            break
          }
        }
      }
    } else {
      for (const month of orderedMonths) {
        const candidate = getStarForMonth(month)
        if (candidate) {
          star = candidate
          break
        }
      }
    }
  }

  return {
    occurrence,
    star,
  }
}

interface MdiLabelSegments {
  occurrenceLabel: string | null
  starLabel: string | null
}

function getMdiLabels(entries?: AssetMdiEntry[] | null): MdiLabelSegments {
  const { occurrence, star } = getMdiHighlights(entries)
  if (!occurrence && !star) {
    return { occurrenceLabel: null, starLabel: null }
  }

  if (occurrence && star && occurrence.month === star.month) {
    return {
      occurrenceLabel: null,
      starLabel: `${star.monthLabel} (maior chance)`,
    }
  }

  return {
    occurrenceLabel: occurrence
      ? `${occurrence.monthLabel} (${occurrence.percentage !== null ? `${Math.round(occurrence.percentage)}%` : '0%'})`
      : null,
    starLabel: star ? `${star.monthLabel} (maior chance)` : null,
  }
}

// Filtros avançados controlados por URL
const route = useRoute()
// Sliders (ranges)
const marketCapRange = ref<number[]>([0, 1_000_000_000_000])
const priceRange = ref<number[]>([0, 1000])
const changeRange = ref<number[]>([-20, 20])
const minMax = {
  mcMin: 0,
  mcMax: 1_000_000_000_000,
  mcStep: 1_000_000,
  priceMin: 0,
  priceMax: 1_000,
  changeMin: -50,
  changeMax: 50,
}
const showStock = ref(true)
const showReit = ref(true)
const showBdr = ref(true)
type GroupFilter = 'stocks' | 'etfs' | 'reits' | 'bdrs'
const groupFilter = ref<GroupFilter | null>(null)
const mdiOccurrenceFilter = ref<'any' | `${number}`>('any')
const mdiStarFilter = ref<'any' | `${number}`>('any')
const onlyWithMdi = ref(false)
const canonicalUrl = computed(() => {
  const groupParam =
    typeof route.query.group === 'string'
      ? route.query.group.toLowerCase()
      : null
  if (groupParam === 'stocks' || groupParam === 'reits') {
    return `${siteUrl}/search?group=${groupParam}`
  }
  return `${siteUrl}/search`
})
const metaTitle = computed(() => {
  if (groupFilter.value === 'reits') {
    return 'Todos os FIIs listados na B3 | Redentia'
  }
  if (groupFilter.value === 'stocks') {
    return 'Todas as ações da B3 | Redentia'
  }
  return 'Busca avançada de ações, FIIs e BDRs | Redentia'
})
const metaDescription = computed(() => {
  if (groupFilter.value === 'reits') {
    return 'Explore todos os fundos imobiliários listados na B3, filtre por preço, dividendos e encontre oportunidades com a ajuda da Redentia.'
  }
  if (groupFilter.value === 'stocks') {
    return 'Veja todas as ações negociadas na B3, acompanhe preços, market cap e variações diárias com filtros inteligentes da Redentia.'
  }
  return 'Busque investimentos na B3 com filtros avançados da Redentia: encontre ações, FIIs, ETFs e BDRs com dados em tempo real.'
})

useSeoMeta({
  title: () => metaTitle.value,
  description: () => metaDescription.value,
  ogImage: `${siteUrl}/512x512.png`,
  twitterCard: 'summary_large_image',
})

useSchemaOrg([
  defineWebPage({
    name: () => metaTitle.value,
    description: () => metaDescription.value,
  }),
])

function normalizeBool(v: unknown, def = true) {
  if (v === undefined) return def
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true'
  return def
}

function readFiltersFromUrl() {
  const q = route.query
  const toNum = (v: unknown, fallback: number) => {
    const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN
    return Number.isFinite(n) ? n : fallback
  }
  const parseMonthFilter = (v: unknown): 'any' | `${number}` => {
    const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN
    if (Number.isFinite(n) && n >= 1 && n <= 12) {
      return String(n) as `${number}`
    }
    return 'any'
  }
  marketCapRange.value = [
    toNum(q.mc_min, minMax.mcMin),
    toNum(q.mc_max, minMax.mcMax),
  ]
  priceRange.value = [
    toNum(q.p_min, minMax.priceMin),
    toNum(q.p_max, minMax.priceMax),
  ]
  changeRange.value = [
    toNum(q.ch_min, minMax.changeMin),
    toNum(q.ch_max, minMax.changeMax),
  ]
  showStock.value = normalizeBool(q.stock, true)
  showReit.value = normalizeBool(q.reit, true)
  showBdr.value = normalizeBool(q.bdr, true)
  mdiOccurrenceFilter.value = parseMonthFilter(q.mdi_occurrence)
  mdiStarFilter.value = parseMonthFilter(q.mdi_star)
  onlyWithMdi.value = normalizeBool(q.mdi_only, false)

  const groupParam =
    typeof q.group === 'string' ? (q.group as string).toLowerCase() : null
  switch (groupParam) {
    case 'stocks':
      showStock.value = true
      showReit.value = false
      showBdr.value = false
      groupFilter.value = 'stocks'
      break
    case 'etfs':
      showStock.value = true
      showReit.value = false
      showBdr.value = false
      groupFilter.value = 'etfs'
      break
    case 'reits':
      showStock.value = false
      showReit.value = true
      showBdr.value = false
      groupFilter.value = 'reits'
      break
    case 'bdrs':
      showStock.value = false
      showReit.value = false
      showBdr.value = true
      groupFilter.value = 'bdrs'
      break
    default:
      groupFilter.value = null
      break
  }
}

function buildQueryFromFilters() {
  const q: Record<string, any> = {}
  if (marketCapRange.value?.length === 2) {
    const [a, b] = marketCapRange.value
    if (a > minMax.mcMin) q.mc_min = a
    if (b < minMax.mcMax) q.mc_max = b
  }
  if (priceRange.value?.length === 2) {
    const [a, b] = priceRange.value
    if (a > minMax.priceMin) q.p_min = a
    if (b < minMax.priceMax) q.p_max = b
  }
  if (changeRange.value?.length === 2) {
    const [a, b] = changeRange.value
    if (a > minMax.changeMin) q.ch_min = a
    if (b < minMax.changeMax) q.ch_max = b
  }
  if (!showStock.value) q.stock = '0'
  if (!showReit.value) q.reit = '0'
  if (!showBdr.value) q.bdr = '0'
  if (mdiOccurrenceFilter.value !== 'any') {
    q.mdi_occurrence = Number(mdiOccurrenceFilter.value)
  }
  if (mdiStarFilter.value !== 'any') {
    q.mdi_star = Number(mdiStarFilter.value)
  }
  if (onlyWithMdi.value) {
    q.mdi_only = '1'
  }
  return q
}

// Dados filtrados
const filteredData = computed(() => {
  if (assetsLoading.value) return []
  const allowedTypes = new Set<string>()
  if (showStock.value) {
    allowedTypes.add('STOCK')
    if (groupFilter.value === 'etfs') {
      allowedTypes.add('ETF')
    }
  } else if (groupFilter.value === 'etfs') {
    allowedTypes.add('ETF')
  }
  if (showReit.value) {
    allowedTypes.add('REIT')
    allowedTypes.add('FUND')
  }
  if (showBdr.value) {
    allowedTypes.add('BDR')
  }

  const toNum = (v: unknown) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }

  const mcMin = marketCapRange.value?.[0]
  const mcMax = marketCapRange.value?.[1]
  const prMin = priceRange.value?.[0]
  const prMax = priceRange.value?.[1]
  const chMin = changeRange.value?.[0]
  const chMax = changeRange.value?.[1]
  const occurrenceFilter =
    mdiOccurrenceFilter.value === 'any'
      ? null
      : Number(mdiOccurrenceFilter.value)
  const starFilter =
    mdiStarFilter.value === 'any' ? null : Number(mdiStarFilter.value)

  return data.value.filter((it) => {
    // tipo
    const normalizedType = (it.type || '').toString().toUpperCase()
    if (allowedTypes.size && !allowedTypes.has(normalizedType)) return false
    const applyEtfOnly =
      groupFilter.value === 'etfs' &&
      showStock.value &&
      !showReit.value &&
      !showBdr.value
    if (applyEtfOnly && normalizedType !== 'ETF') return false
    // market cap
    if (mcMin !== undefined && it.market_cap < mcMin) return false
    if (mcMax !== undefined && it.market_cap > mcMax) return false
    // preço atual
    const price = it.market_price ?? it.close
    if (prMin !== undefined && price < prMin) return false
    if (prMax !== undefined && price > prMax) return false
    // variação percentual
    const change = it.change_percent ?? it.change
    if (chMin !== undefined && change < chMin) return false
    if (chMax !== undefined && change > chMax) return false
    const highlights = getMdiHighlights(it.mdi)
    if (onlyWithMdi.value && !(Array.isArray(it.mdi) && it.mdi.length > 0)) {
      return false
    }
    if (
      occurrenceFilter !== null &&
      highlights.occurrence?.month !== occurrenceFilter
    ) {
      return false
    }
    if (starFilter !== null && highlights.star?.month !== starFilter) {
      return false
    }
    return true
  })
})

const resultsCount = computed(() => filteredData.value.length)

const itemsPerPage = ref(12)
const currentPage = ref(1)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredData.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(resultsCount.value / itemsPerPage.value || 1))
)

const activeFiltersCount = computed(() => {
  let count = 0
  if (
    marketCapRange.value?.[0] > minMax.mcMin ||
    marketCapRange.value?.[1] < minMax.mcMax
  ) {
    count++
  }
  if (
    priceRange.value?.[0] > minMax.priceMin ||
    priceRange.value?.[1] < minMax.priceMax
  ) {
    count++
  }
  if (
    changeRange.value?.[0] > minMax.changeMin ||
    changeRange.value?.[1] < minMax.changeMax
  ) {
    count++
  }
  if (!showStock.value || !showReit.value || !showBdr.value) {
    count++
  }
  if (groupFilter.value) {
    count++
  }
  if (globalFilter.value?.trim()) {
    count++
  }
  if (onlyWithMdi.value) {
    count++
  }
  if (mdiOccurrenceFilter.value !== 'any') {
    count++
  }
  if (mdiStarFilter.value !== 'any') {
    count++
  }
  return count
})

const lastUpdatedLabel = computed(() => {
  if (!lastUpdatedAt.value) return '--:--'
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(lastUpdatedAt.value)
})

watch(filteredData, () => {
  currentPage.value = 1
})

watch(totalPages, (value) => {
  if (currentPage.value > value) {
    currentPage.value = value
  }
  if (currentPage.value < 1) {
    currentPage.value = 1
  }
})

function formatCurrencyBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n || 0)
}
function formatPercent(n: number) {
  const num = Number(n || 0)
  return `${num.toFixed(1)}%`
}
onMounted(async () => {
  assetsLoading.value = true
  try {
    allAssets.value = await getAssets()
    data.value = allAssets.value
    lastUpdatedAt.value = new Date()

    await nextTick()
    currentPage.value = 1

    // Lê filtros da URL ao montar
    readFiltersFromUrl()
  } finally {
    assetsLoading.value = false
  }
})

watch(
  () => route.query,
  () => {
    readFiltersFromUrl()
  },
  { deep: true }
)

function getAssetTypeLabel(type?: string | null) {
  const normalized = (type || '').toString().toUpperCase()
  switch (normalized) {
    case 'STOCK':
      return 'Ação'
    case 'ETF':
      return 'ETF'
    case 'REIT':
      return 'REIT'
    case 'FUND':
      return 'FII'
    case 'BDR':
      return 'BDR'
    default:
      return 'Ativo'
  }
}

function getAssetPrice(asset: IAsset) {
  if (typeof asset.market_price === 'number') return asset.market_price
  if (typeof asset.close === 'number') return asset.close
  return 0
}

function getAssetChange(asset: IAsset) {
  if (typeof asset.change_percent === 'number') return asset.change_percent
  if (typeof asset.change === 'number') return asset.change
  return 0
}

function getAssetLogo(asset: IAsset) {
  if (
    asset.logo &&
    asset.logo !== 'https://icons.brapi.dev/icons/BRAPI.svg'
  ) {
    return asset.logo
  }
  return null
}

</script>

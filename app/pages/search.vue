<template>
  <NuxtLayout title="Busca" hide-search-bar>
    <div class="flex h-full flex-col pb-8 pt-6">
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Filtros avançados</h2>
        <p class="text-[13px] font-extralight">
          Refine sua busca por preço, valor de mercado, variação no dia e tipo
          de ativo. Combine filtros para encontrar oportunidades alinhadas ao
          seu perfil.
        </p>
      </div>
      <div class="mt-4 px-6 py-2">
        <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div class="flex flex-col gap-2 rounded-[12px]">
            <div
              class="flex items-center justify-between text-[15px] font-semibold"
            >
              <span>Market Cap (R$)</span>
            </div>
            <span class="text-[11px] font-normal opacity-70"
              >{{ formatCurrencyBRL(marketCapRange[0]) }} -
              {{ formatCurrencyBRL(marketCapRange[1]) }}</span
            >
            <USlider
              v-model="marketCapRange"
              :min="minMax.mcMin"
              :max="minMax.mcMax"
              :step="minMax.mcStep"
            />
          </div>

          <div class="flex flex-col gap-2 rounded-[12px]">
            <div
              class="flex items-center justify-between text-[15px] font-semibold"
            >
              <span>Preço (R$)</span>
            </div>
            <span class="text-[11px] font-normal opacity-70">
              <template v-if="!assetsLoading"
                >{{ formatCurrencyBRL(priceRange[0]) }} -
                {{ formatCurrencyBRL(priceRange[1]) }}</template
              >
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

          <div class="flex flex-col gap-2 rounded-[12px]">
            <div
              class="flex items-center justify-between text-[15px] font-semibold"
            >
              <span>Variação (%)</span>
            </div>
            <span class="text-[11px] font-normal opacity-70">
              <template v-if="!assetsLoading"
                >{{ formatPercent(changeRange[0]) }} -
                {{ formatPercent(changeRange[1]) }}</template
              >
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

          <div class="flex flex-col gap-8 rounded-[12px]">
            <div class="text-[15px] font-semibold">Grupo</div>
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
      </div>
      <div class="mt-4 rounded-none border-y py-4">
        <AtomsFormInput
          id="global-search-input"
          v-model="globalFilter"
          placeholder="Buscar ativos..."
          size="lg"
          variant="soft"
          icon="i-lucide-search"
          class="w-full"
          :ui="{
            base: 'bg-black border-none',
          }"
        >
          <template #trailing>
            <div class="flex items-center gap-2 max-lg:hidden">
              <UKbd value="meta" variant="link" color="neutral" />
              <UKbd value="K" variant="link" color="neutral" />
            </div>
          </template>
        </AtomsFormInput>
      </div>
      <UTable
        ref="table"
        v-model:sorting="sorting"
        v-model:column-visibility="columnVisibility"
        v-model:expanded="expanded"
        v-model:global-filter="globalFilter"
        v-model:pagination="pagination"
        :data="filteredData"
        :columns="columns"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel(),
        }"
        :ui="{
          root: 'max-h-full no-scrollbar',
          td: 'py-3',
          separator: 'bg-transparent',
          tbody: 'divide-none ',
          thead: 'bg-transparent',
          tfoot: 'bg-transparent',
          th: 'whitespace-nowrap min-w-max bg-black/5 dark:bg-white/5',
        }"
        sticky
        v-if="!assetsLoading"
      >
        <template #expanded="{ row }">
          <pre>{{ row.original }}</pre>
        </template>
        <template #expand-header>
          <div>
            <UDropdownMenu
              :items="
                table?.tableApi
                  ?.getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => ({
                    label: column.id,
                    type: 'checkbox' as const,
                    checked: column.getIsVisible(),
                    onUpdateChecked(checked: boolean) {
                      table?.tableApi
                        ?.getColumn(column.id)
                        ?.toggleVisibility(!!checked)
                    },
                    onSelect(e?: Event) {
                      e?.preventDefault()
                    },
                  }))
              "
              :content="{ align: 'end' }"
            >
              <UButton
                color="neutral"
                variant="link"
                trailing-icon="i-lucide-ellipsis-vertical"
              />
            </UDropdownMenu>
            <UButton
              color="neutral"
              variant="link"
              trailing-icon="i-lucide-search"
              @click="focusGlobalSearch"
            />
          </div>
        </template>
      </UTable>

      <!-- Skeleton enquanto carrega -->
      <div v-else class="mt-4 space-y-2 px-6">
        <USkeleton v-for="i in 6" :key="i" class="h-8 w-full rounded-md" />
      </div>

      <!-- Paginação -->
      <div
        v-if="!assetsLoading && data.length > 0"
        class="border-default mt-6 flex justify-center border-t pt-4"
      >
        <UPagination
          :default-page="
            (table?.tableApi?.getState().pagination.pageIndex || 0) + 1
          "
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AssetMdiEntry, IAsset } from '~/types/asset'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { resolveComponent } from 'vue'

const { getAssets } = useAssetsService()
const router = useRouter()

const allAssets = ref<IAsset[]>([])
const data = ref<IAsset[]>([])
const assetsLoading = ref(true)

const IconArrowFinanceUp = resolveComponent('IconArrowFinanceUp')
const IconAI = resolveComponent('IconAi')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const globalFilter = ref('')
const table = useTemplateRef('table')
const sorting = ref([
  {
    id: 'ticker',
    desc: false,
  },
])
const columnVisibility = ref({})
const expanded = ref({})

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

// Paginação usando TanStack Table
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
})

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
    return true
  })
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

    // Força uma atualização da paginação após carregar os dados
    await nextTick()
    if (table.value?.tableApi) {
      table.value.tableApi.setPageIndex(0)
    }
    // Lê filtros da URL ao montar
    readFiltersFromUrl()
  } finally {
    assetsLoading.value = false
  }
})

function getHeader(column: any, label: string) {
  const isSorted = column.getIsSorted()

  return h(
    UDropdownMenu,
    {
      content: {
        align: 'start',
      },
      'aria-label': 'Actions dropdown',
      items: [
        {
          label: 'Asc',
          type: 'checkbox',
          icon: 'i-lucide-arrow-up-narrow-wide',
          checked: isSorted === 'asc',
          onSelect: () => {
            if (isSorted === 'asc') {
              column.clearSorting()
            } else {
              column.toggleSorting(false)
            }
          },
        },
        {
          label: 'Desc',
          icon: 'i-lucide-arrow-down-wide-narrow',
          type: 'checkbox',
          checked: isSorted === 'desc',
          onSelect: () => {
            if (isSorted === 'desc') {
              column.clearSorting()
            } else {
              column.toggleSorting(true)
            }
          },
        },
      ],
    },
    () =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label,
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5 data-[state=open]:bg-elevated',
        'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`,
      })
  )
}

const columns = ref([
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : '',
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: 'ticker',
    header: ({ column }) => {
      return getHeader(column, 'Ticker')
    },
    cell: ({ row }) => {
      return h(
        'div',
        {
          class: 'flex items-center gap-2 cursor-pointer',
          onClick: () => goToAsset(row.original.ticker),
        },
        [
          h('img', {
            src: row.original.logo,
            class:
              'pointer-events-none h-6 w-6 select-none rounded object-cover',
          }),
          h('span', { class: 'text-[14px] font-medium' }, row.original.ticker),
        ]
      )
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return getHeader(column, 'Nome')
    },
    cell: ({ row }) => {
      return h(
        'span',
        {
          class: 'text-[12px] opacity-70 cursor-pointer',
          onClick: () => goToAsset(row.original.ticker),
        },
        row.original.name
      )
    },
  },
  {
    accessorKey: 'market_cap',
    header: ({ column }) => {
      return getHeader(column, 'Market Cap')
    },
    cell: ({ row }) => {
      return h(
        'span',
        {
          class: 'text-[14px] cursor-pointer',
          onClick: () => goToAsset(row.original.ticker),
        },
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          maximumFractionDigits: 0,
        }).format(row.original.market_cap)
      )
    },
  },
  {
    accessorKey: 'market_price',
    header: ({ column }) => {
      return getHeader(column, 'Preço')
    },
    cell: ({ row }) => {
      return h(
        'span',
        {
          class: 'text-[14px] cursor-pointer',
          onClick: () => goToAsset(row.original.ticker),
        },
        new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(row.original.market_price)
      )
    },
  },
  {
    accessorKey: 'change_percent',
    header: ({ column }) => {
      return getHeader(column, 'Variação')
    },
    cell: ({ row }) => {
      const change_percent = row.original.change_percent
      return h(
        'div',
        {
          class: 'flex items-center gap-2 cursor-pointer',
          onClick: () => goToAsset(row.original.ticker),
        },
        [
          h(IconArrowFinanceUp, {
            class: `w-4 ${change_percent >= 0 ? 'fill-primary' : 'fill-red-500 rotate-180'}`,
          }),
          h(
            'span',
            {
              class: `text-[14px] font-medium ${change_percent >= 0 ? 'text-primary' : 'text-red-500'}`,
            },
            `${change_percent >= 0 ? '+' : ''}${change_percent?.toFixed(2)}% hoje`
          ),
        ]
      )
    },
  },
  {
    accessorKey: 'mdi',
    header: 'MDI',
    cell: ({ row }) => {
      const asset = row.original as IAsset
      const { occurrenceLabel, starLabel } = getMdiLabels(asset?.mdi)
      const hasOccurrence = !!occurrenceLabel
      const hasStar = !!starLabel
      const hasAny = hasOccurrence || hasStar

      const contents: any[] = []

      if (!hasAny) {
        contents.push(
          h(
            'span',
            {
              class: 'text-[13px] opacity-60',
            },
            'N/A'
          )
        )
      } else {
        if (hasOccurrence) {
          contents.push(
            h(
              'span',
              {
                class: 'text-[13px]',
              },
              occurrenceLabel
            )
          )
        }

        if (hasOccurrence && hasStar) {
          contents.push(
            h(
              'span',
              {
                class: 'text-[13px] opacity-60',
              },
              ' - '
            )
          )
        }

        if (hasStar) {
          contents.push(
            h(
              'span',
              {
                class: 'flex items-center gap-1 text-[13px]',
              },
              [
                h(IconAI, {
                  class: 'w-[16px] fill-secondary',
                }),
                h(
                  'span',
                  {
                    class: 'ml-1 text-secondary',
                  },
                  starLabel
                ),
              ]
            )
          )
        }
      }

      return h(
        'div',
        {
          class: 'flex items-center gap-2 cursor-pointer',
          onClick: () => {
            goToAsset(asset?.ticker || asset?.stock || '')
          },
        },
        contents
      )
    },
  },
])
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{
      content: 'ring-0 shadow-2xl overflow-hidden',
      overlay: 'backdrop-blur-md',
      width: 'sm:max-w-3xl',
      height: 'h-[85vh] max-h-[760px]',
    }"
  >
    <slot name="trigger">
      <UButton
        v-bind="attrs"
        :label="compact ? undefined : 'Buscar ativos'"
        color="neutral"
        variant="ghost"
        icon="i-lucide-search"
        :ui="triggerUi"
        @click="open = true"
      >
        <template v-if="!compact" #trailing>
          <div class="ml-auto flex items-center gap-1 max-lg:hidden">
            <UKbd
              value="meta"
              variant="subtle"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.textMuted }"
            />
            <UKbd
              value="K"
              variant="subtle"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.textMuted }"
            />
          </div>
        </template>
      </UButton>
    </slot>

    <template #content>
      <div
        class="flex h-full flex-col overflow-hidden border"
        :style="{ backgroundColor: brand.colors.background, borderColor: brand.colors.border, color: brand.colors.text }"
      >
        <!-- Terminal header -->
        <header
          class="flex-shrink-0 border-b"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <div class="flex items-center justify-between px-5 py-3">
            <div class="flex items-center gap-2">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
                [ASSETS.SEARCH]
              </span>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.14em]" :style="{ color: brand.colors.textMuted }">
                &gt; {{ totalCount }} ATIVOS · B3
              </span>
            </div>
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center transition-opacity hover:opacity-70"
              :style="{ color: brand.colors.textMuted }"
              @click="open = false"
            >
              <UIcon name="i-lucide-x" class="h-4 w-4" />
            </button>
          </div>

          <!-- Search input — borderless bar, big, terminal-esque -->
          <div
            class="flex items-center gap-3 border-t px-5 py-4"
            :style="{ borderColor: brand.colors.border }"
          >
            <span class="font-mono-tab text-lg font-bold" :style="{ color: brand.colors.primary }">&gt;</span>
            <input
              ref="inputRef"
              v-model="searchTerm"
              type="text"
              placeholder="Digite ticker (PETR4, HGLG11) ou nome da empresa…"
              class="min-w-0 flex-1 bg-transparent font-mono-tab text-lg tracking-wide focus:outline-none"
              :style="{ color: brand.colors.text, '--placeholder-color': brand.colors.textMuted }"
              @keydown.down.prevent="moveFocus(1)"
              @keydown.up.prevent="moveFocus(-1)"
              @keydown.enter.prevent="openFocused"
            >
            <span v-if="status === 'pending'" class="flex-shrink-0">
              <UIcon name="i-lucide-loader-2" class="h-4 w-4 animate-spin" :style="{ color: brand.colors.primary }" />
            </span>
            <button
              v-else-if="searchTerm"
              class="flex h-6 w-6 flex-shrink-0 items-center justify-center border transition-opacity hover:opacity-70"
              :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
              @click="searchTerm = ''"
            >
              <UIcon name="i-lucide-x" class="h-3 w-3" />
            </button>
          </div>

          <!-- Filter chips (type tabs) -->
          <div class="flex items-center gap-px overflow-x-auto border-t" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
            <button
              v-for="tab in typeTabs"
              :key="tab.id"
              type="button"
              class="flex items-center gap-2 px-4 py-2.5 font-mono-tab text-[10px] uppercase tracking-[0.18em] transition-all"
              :style="{
                backgroundColor: activeType === tab.id ? brand.colors.surface : brand.colors.background,
                color: activeType === tab.id ? brand.colors.primary : brand.colors.textMuted,
                borderBottom: activeType === tab.id ? `1px solid ${brand.colors.primary}` : '1px solid transparent',
              }"
              @click="activeType = tab.id"
            >
              <span>{{ tab.label }}</span>
              <span
                class="font-mono-tab text-[10px] tabular-nums"
                :style="{ color: activeType === tab.id ? brand.colors.text : brand.colors.textMuted }"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>
        </header>

        <!-- Results -->
        <div ref="listRef" class="min-h-0 flex-1 overflow-y-auto">
          <!-- Group per type when "all", single flat list when a type is selected -->
          <template v-if="activeType === 'all'">
            <div v-for="group in visibleGroups" :key="group.id" class="mb-2">
              <div
                class="sticky top-0 z-10 flex items-center justify-between border-b px-5 py-2"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
              >
                <div class="flex items-center gap-2">
                  <span class="font-mono-tab text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
                    [{{ group.bracket }}]
                  </span>
                  <span class="font-mono-tab text-[10px] uppercase tracking-[0.14em]" :style="{ color: brand.colors.textMuted }">
                    {{ group.label }}
                  </span>
                </div>
                <span class="font-mono-tab text-[10px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                  {{ group.visibleCount }}{{ group.truncated ? '+' : '' }} / {{ group.items.length }}
                </span>
              </div>
              <ul class="flex flex-col">
                <li
                  v-for="(item, idx) in group.truncatedItems"
                  :key="item.id"
                  :data-index="globalIndex(group.id, idx)"
                >
                  <MoleculesSearchAssetRow
                    :item="item"
                    :focused="focusedIndex === globalIndex(group.id, idx)"
                    @click="onSelect"
                    @mouseenter="focusedIndex = globalIndex(group.id, idx)"
                  />
                </li>
              </ul>
              <button
                v-if="group.truncated"
                type="button"
                class="block w-full border-b px-5 py-2.5 text-left font-mono-tab text-[10px] uppercase tracking-[0.18em] transition-opacity hover:opacity-75"
                :style="{ color: brand.colors.primary, borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
                @click="activeType = group.id"
              >
                &gt; VER TODOS OS {{ group.items.length }} {{ group.label.toUpperCase() }}
                <UIcon name="i-lucide-arrow-right" class="ml-1 inline h-3 w-3 align-text-top" />
              </button>
            </div>
          </template>

          <template v-else>
            <ul class="flex flex-col">
              <li
                v-for="(item, idx) in flatItems"
                :key="item.id"
                :data-index="idx"
              >
                <MoleculesSearchAssetRow
                  :item="item"
                  :focused="focusedIndex === idx"
                  @click="onSelect"
                  @mouseenter="focusedIndex = idx"
                />
              </li>
            </ul>
          </template>

          <!-- Empty state -->
          <div
            v-if="hasNoResults"
            class="flex flex-col items-center justify-center px-6 py-20 text-center"
          >
            <div
              class="mb-4 flex h-16 w-16 items-center justify-center border"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            >
              <UIcon name="i-lucide-search-x" class="h-7 w-7" :style="{ color: brand.colors.textMuted }" />
            </div>
            <p class="font-mono-tab text-[11px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.text }">
              &gt; NENHUM ATIVO ENCONTRADO
            </p>
            <p class="mt-2 max-w-xs text-sm" :style="{ color: brand.colors.textMuted }">
              Tente por ticker exato (PETR4, HGLG11) ou nome da empresa.
            </p>
            <NuxtLink
              to="/search"
              class="mt-6 inline-flex items-center gap-2 border px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.18em] transition-opacity hover:opacity-75"
              :style="{ borderColor: brand.colors.primary, color: brand.colors.primary }"
              @click="open = false"
            >
              <UIcon name="i-lucide-sliders-horizontal" class="h-3 w-3" />
              BUSCA AVANÇADA
            </NuxtLink>
          </div>
        </div>

        <!-- Footer hint -->
        <footer
          class="flex-shrink-0 border-t"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <div class="flex items-center justify-between px-5 py-2.5 font-mono-tab text-[10px] uppercase tracking-[0.14em]" :style="{ color: brand.colors.textMuted }">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1.5">
                <kbd class="border px-1.5 py-0.5 text-[9px]" :style="{ borderColor: brand.colors.border, color: brand.colors.text }">↑↓</kbd>
                navegar
              </span>
              <span class="flex items-center gap-1.5">
                <kbd class="border px-1.5 py-0.5 text-[9px]" :style="{ borderColor: brand.colors.border, color: brand.colors.text }">↵</kbd>
                abrir
              </span>
              <span class="flex items-center gap-1.5 max-md:hidden">
                <kbd class="border px-1.5 py-0.5 text-[9px]" :style="{ borderColor: brand.colors.border, color: brand.colors.text }">ESC</kbd>
                fechar
              </span>
            </div>
            <NuxtLink
              to="/search"
              class="flex items-center gap-1.5 transition-opacity hover:opacity-75"
              :style="{ color: brand.colors.primary }"
              @click="open = false"
            >
              <UIcon name="i-lucide-sliders-horizontal" class="h-3 w-3" />
              AVANÇADA
            </NuxtLink>
          </div>
        </footer>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'

defineOptions({ inheritAttrs: false })

import { useTesouroService, indexerBadge, type TesouroItem } from '~/services/tesouro'

const brand = useBrand()
const router = useRouter()
const searchTerm = ref('')
const { getAssets } = useAssetsService()
const { listTesouros } = useTesouroService()
const open = ref(false)
const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const activeType = ref<'all' | 'STOCK' | 'REIT' | 'BDR' | 'ETF' | 'TESOURO'>('all')
const focusedIndex = ref(0)

const props = defineProps<{ compact?: boolean }>()

const triggerUi = computed(() => {
  const isLight = brand.theme.mode === 'light'
  const surfaceBg = isLight ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'
  const mutedText = isLight ? 'text-black/50' : 'text-white/50'
  const iconColor = isLight ? 'text-black/40' : 'text-white/40'

  if (props.compact) {
    return {
      base: `rounded-full ${surfaceBg} flex items-center justify-center`,
      icon: 'size-5 text-secondary',
      label: 'hidden',
    }
  }
  return {
    base: `w-full text-left justify-start ${mutedText} ${surfaceBg} rounded-2xl px-4 transition-all`,
    label: 'font-normal',
    icon: iconColor,
  }
})

defineShortcuts({
  meta_k: () => { open.value = !open.value },
  escape: () => { if (open.value) open.value = false },
})

const { data: ativos, status, execute } = await useAsyncData<IAsset[]>(
  'assets',
  () => getAssets(),
  { server: false, immediate: false, default: () => [] },
)

const { data: tesouros, status: tesouroStatus, execute: executeTesouros } = await useAsyncData<TesouroItem[]>(
  'tesouros',
  () => listTesouros(),
  { server: false, immediate: false, default: () => [] },
)

watch(open, async (isOpen) => {
  if (isOpen) {
    const loads: Promise<unknown>[] = []
    if (status.value === 'idle') loads.push(execute())
    if (tesouroStatus.value === 'idle') loads.push(executeTesouros())
    if (loads.length) await Promise.all(loads)
    focusedIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  } else {
    searchTerm.value = ''
    activeType.value = 'all'
  }
})

function onSelect() {
  searchTerm.value = ''
  open.value = false
}

interface SearchItem {
  id: string
  ticker: string
  label: string
  name: string
  to: string
  logo: string | null
  price: number
  changePercent: number | null
  type: 'STOCK' | 'REIT' | 'BDR' | 'ETF' | 'TESOURO'
}

function toSearchItem(a: IAsset): SearchItem | null {
  const ticker = String(a.ticker ?? a.stock ?? '').toUpperCase()
  if (!ticker) return null
  const type = (a.type ?? 'STOCK') as SearchItem['type']
  return {
    id: `${type}-${ticker}`,
    ticker,
    label: ticker,
    name: a.name ?? '',
    to: `/asset/${ticker.toLowerCase()}`,
    logo: resolveLogo((a as { scrape_logo?: string | null }).scrape_logo, a.logo),
    price: Number(a.market_price ?? a.close ?? 0),
    changePercent:
      typeof a.change_percent === 'number'
        ? a.change_percent
        : typeof a.change === 'number'
          ? a.change
          : null,
    type,
  }
}

/**
 * Tesouro Direto titles don't have tickers — we use the indexer badge
 * ("IPCA+", "SELIC", "PRÉ") as the short "ticker" display and the slug for
 * navigation. Maturity year gets appended so users can tell similar titles
 * apart at a glance.
 */
function tesouroToSearchItem(t: TesouroItem): SearchItem {
  const badge = indexerBadge(t.indexer)
  const year = t.maturity_date ? new Date(t.maturity_date).getFullYear() : ''
  const label = year ? `${badge} ${year}` : badge
  return {
    id: `TESOURO-${t.slug}`,
    ticker: label,
    label,
    name: t.name,
    to: `/tesouro/${t.slug}`,
    logo: null,
    price: t.price_buy ?? 0,
    // Rate shown in the change slot (tesouros don't have daily % change).
    changePercent: t.rate_numeric,
    type: 'TESOURO',
  }
}

const allItems = computed<SearchItem[]>(() => {
  const assets = (ativos.value ?? []).map(toSearchItem).filter((x): x is SearchItem => x !== null)
  const tes = (tesouros.value ?? []).map(tesouroToSearchItem)
  return [...assets, ...tes]
})

const totalCount = computed(() => allItems.value.length)

const filteredByType = computed(() => {
  if (activeType.value === 'all') return allItems.value
  return allItems.value.filter((i) => i.type === activeType.value)
})

const filteredItems = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const pool = filteredByType.value
  if (!term) return pool
  return pool.filter((i) => i.ticker.toLowerCase().includes(term) || i.name.toLowerCase().includes(term))
})

const typeTabs = computed(() => {
  const count = (type: SearchItem['type']) => allItems.value.filter((i) => i.type === type).length
  return [
    { id: 'all' as const, label: 'TUDO', count: allItems.value.length },
    { id: 'STOCK' as const, label: 'AÇÕES', count: count('STOCK') },
    { id: 'REIT' as const, label: 'FIIs', count: count('REIT') },
    { id: 'ETF' as const, label: 'ETFs', count: count('ETF') },
    { id: 'BDR' as const, label: 'BDRs', count: count('BDR') },
    { id: 'TESOURO' as const, label: 'TESOURO', count: count('TESOURO') },
  ]
})

const GROUP_CAP = 8

interface SearchGroup {
  id: 'STOCK' | 'REIT' | 'BDR' | 'ETF' | 'TESOURO'
  bracket: string
  label: string
  items: SearchItem[]
  truncatedItems: SearchItem[]
  truncated: boolean
  visibleCount: number
}

const visibleGroups = computed<SearchGroup[]>(() => {
  const items = filteredItems.value
  const groups: Array<Pick<SearchGroup, 'id' | 'bracket' | 'label'>> = [
    { id: 'STOCK', bracket: 'STOCKS', label: 'Ações' },
    { id: 'REIT', bracket: 'FIIS', label: 'Fundos imobiliários' },
    { id: 'TESOURO', bracket: 'TESOURO', label: 'Tesouro Direto' },
    { id: 'ETF', bracket: 'ETFS', label: 'ETFs' },
    { id: 'BDR', bracket: 'BDRS', label: 'BDRs' },
  ]
  const term = searchTerm.value.trim()
  return groups
    .map((g) => {
      const filtered = items.filter((i) => i.type === g.id)
      // Cap truncation only when user isn't actively searching — on searches
      // we show the full matching set.
      const truncated = !term && filtered.length > GROUP_CAP
      const truncatedItems = truncated ? filtered.slice(0, GROUP_CAP) : filtered
      return {
        ...g,
        items: filtered,
        truncatedItems,
        truncated,
        visibleCount: truncatedItems.length,
      }
    })
    .filter((g) => g.items.length > 0)
})

const flatItems = computed(() => filteredItems.value)

function globalIndex(groupId: string, idx: number): number {
  let offset = 0
  for (const g of visibleGroups.value) {
    if (g.id === groupId) return offset + idx
    offset += g.truncatedItems.length
  }
  return offset + idx
}

const navigableItems = computed<SearchItem[]>(() => {
  if (activeType.value === 'all') {
    return visibleGroups.value.flatMap((g) => g.truncatedItems)
  }
  return flatItems.value
})

const hasNoResults = computed(() => navigableItems.value.length === 0)

watch([searchTerm, activeType], () => {
  focusedIndex.value = 0
})

function moveFocus(delta: number) {
  const total = navigableItems.value.length
  if (total === 0) return
  focusedIndex.value = (focusedIndex.value + delta + total) % total
  nextTick(() => {
    const el = listRef.value?.querySelector<HTMLElement>(`[data-index="${focusedIndex.value}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function openFocused() {
  const item = navigableItems.value[focusedIndex.value]
  if (!item) return
  router.push(item.to)
  onSelect()
}
</script>

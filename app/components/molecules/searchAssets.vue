<template>
  <UModal
    v-model:open="open"
    :ui="{
      content:
        'ring-0 sm:rounded-2xl shadow-2xl overflow-hidden',
      overlay: 'backdrop-blur-md',
      width: 'sm:max-w-xl',
      height: 'h-[70vh] max-h-[600px]',
    }"
  >
    <slot name="trigger">
      <UButton
        v-bind="attrs"
        :label="compact ? undefined : 'Buscar Ativos...'"
        color="neutral"
        variant="ghost"
        icon="i-lucide-search"
        :ui="triggerUi"
        @click="open = true"
      >
        <template v-if="!compact" #trailing>
          <div class="flex items-center gap-1 max-lg:hidden">
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
      <div class="flex h-full flex-col overflow-hidden border" :style="{ backgroundColor: brand.colors.background, borderColor: brand.colors.border, color: brand.colors.text }">
        <!-- Header / Search Input -->
        <div class="flex-shrink-0 border-b p-4" :style="{ borderColor: brand.colors.border }">
          <div class="flex items-center gap-2">
            <!-- Search Input -->
            <div class="flex flex-1 items-center gap-3 brand-card-md border px-4 py-3" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
              <UIcon name="i-lucide-search" class="h-5 w-5 flex-shrink-0" :style="{ color: brand.colors.textMuted }" />
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar por nome ou ticker..."
                class="min-w-0 flex-1 bg-transparent focus:outline-none"
                :style="{ color: brand.colors.text, '--placeholder-color': brand.colors.textMuted }"
              >
              <div v-if="status === 'pending'" class="flex-shrink-0">
                <UIcon name="i-lucide-loader-2" class="h-4 w-4 animate-spin text-secondary" />
              </div>
              <button
                v-else-if="searchTerm"
                class="flex-shrink-0 rounded-md p-1 transition"
                :style="{ color: brand.colors.textMuted }"
                @click="searchTerm = ''"
              >
                <UIcon name="i-lucide-x" class="h-4 w-4" />
              </button>
            </div>

            <!-- Advanced Search Button -->
            <NuxtLink
              to="/search"
              class="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center brand-card-md border border-secondary/20 bg-secondary/10 text-secondary transition-all hover:border-secondary/40 hover:bg-secondary/20"
              title="Busca avançada"
              @click="open = false"
            >
              <UIcon name="i-lucide-sliders-horizontal" class="h-5 w-5" />
            </NuxtLink>
          </div>
        </div>

        <!-- Results -->
        <div class="min-h-0 flex-1 overflow-y-auto p-2">
          <template v-for="group in filteredGroups" :key="group.id">
            <div v-if="group.items.length > 0" class="mb-4">
              <!-- Group Label -->
              <div class="sticky top-0 z-10 mb-2 flex items-center gap-2 px-3 py-2" :style="{ backgroundColor: brand.colors.background }">
                <span class="text-[10px] font-semibold uppercase tracking-widest" :style="{ color: brand.colors.textMuted }">
                  {{ group.label }}
                </span>
                <span class="brand-pill px-2 py-0.5 text-[10px]" :style="{ backgroundColor: brand.colors.surface, color: brand.colors.textMuted }">
                  {{ group.items.length }}
                </span>
              </div>

              <!-- Items -->
              <div class="space-y-0.5">
                <NuxtLink
                  v-for="item in group.items"
                  :key="item.id"
                  :to="item.to"
                  class="group flex items-center gap-3 brand-card-md px-3 py-2.5 transition-all"
                  @click="onSelect"
                >
                  <!-- Logo -->
                  <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
                    <img
                      v-if="item.avatar?.src"
                      :src="item.avatar.src"
                      :alt="item.label"
                      class="h-full w-full object-cover"
                      width="36"
                      height="36"
                      loading="lazy"
                    >
                    <span v-else class="text-xs font-bold" :style="{ color: brand.colors.textMuted }">
                      {{ item.label.slice(0, 2) }}
                    </span>
                  </div>

                  <!-- Info -->
                  <div class="flex min-w-0 flex-1 flex-col">
                    <span class="text-sm font-semibold" :style="{ color: brand.colors.text }">{{ item.label }}</span>
                    <span class="truncate text-xs" :style="{ color: brand.colors.textMuted }">{{ item.suffix }}</span>
                  </div>

                  <!-- Preço + Variação + Arrow -->
                  <div class="flex shrink-0 items-center gap-2">
                    <div class="text-right">
                      <span
                        v-if="item.price > 0"
                        class="block text-xs font-medium tabular-nums"
                        :style="{ color: brand.colors.text }"
                      >
                        {{ formatCurrencyBRL(item.price) }}
                      </span>
                      <span
                        v-if="item.changePercent != null"
                        :class="[
                          'block text-xs font-medium tabular-nums',
                          item.changePercent >= 0 ? 'text-primary' : 'text-red-400',
                        ]"
                      >
                        {{ item.changePercent >= 0 ? '+' : '' }}{{ item.changePercent.toFixed(2) }}%
                      </span>
                    </div>
                    <UIcon
                      name="i-lucide-chevron-right"
                      class="h-4 w-4 flex-shrink-0 transition-all group-hover:translate-x-0.5"
                      :style="{ color: brand.colors.textMuted }"
                    />
                  </div>
                </NuxtLink>
              </div>
            </div>
          </template>

          <!-- Empty State -->
          <div v-if="hasNoResults" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="mb-4 flex h-14 w-14 items-center justify-center brand-card" :style="{ backgroundColor: brand.colors.surface }">
              <UIcon name="i-lucide-search-x" class="h-7 w-7" :style="{ color: brand.colors.textMuted }" />
            </div>
            <p class="text-sm" :style="{ color: brand.colors.textMuted }">Nenhum ativo encontrado</p>
            <p class="mt-1 text-xs" :style="{ color: brand.colors.textMuted }">Tente buscar por outro nome ou ticker</p>
            <NuxtLink
              to="/search"
              class="mt-4 flex items-center gap-2 text-sm text-secondary transition hover:underline"
              @click="open = false"
            >
              <UIcon name="i-lucide-sliders-horizontal" class="h-4 w-4" />
              Usar busca avançada
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'

defineOptions({ inheritAttrs: false })

const brand = useBrand()
const searchTerm = ref('')
const { getAssets } = useAssetsService()
const open = ref(false)
const attrs = useAttrs()

const props = defineProps<{
  compact?: boolean
}>()

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
  meta_k: () => {
    open.value = !open.value
  },
})

const {
  data: ativos,
  status,
  execute,
} = await useAsyncData<IAsset[]>('assets', () => getAssets(), {
  server: false,
  immediate: false,
  default: () => [],
})

const ensureAssetsLoaded = async () => {
  if (status.value === 'idle') {
    await execute()
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    ensureAssetsLoaded()
  }
})

function onSelect() {
  searchTerm.value = ''
  open.value = false
}

const groups = computed(() => {
  const ticker = (a: IAsset) => a.ticker ?? a.stock
  const price = (a: IAsset) => a.market_price ?? a.close ?? 0
  const changePercent = (a: IAsset) => a.change_percent ?? a.change ?? null

  const toItem = (item: IAsset) => ({
    id: ticker(item),
    label: ticker(item),
    suffix: item.name,
    to: `/asset/${ticker(item).toLowerCase()}`,
    avatar: { src: item.logo },
    price: price(item),
    changePercent: changePercent(item),
  })

  const acaoItems =
    ativos.value
      ?.filter((item) => item.type === 'STOCK')
      .map(toItem) ?? []

  const fiiItems =
    ativos.value
      ?.filter((item) => item.type === 'REIT')
      .map(toItem) ?? []

  const bdrItems =
    ativos.value
      ?.filter((item) => item.type === 'BDR')
      .map(toItem) ?? []

  const etfItems =
    ativos.value
      ?.filter((item) => item.type === 'ETF')
      .map(toItem) ?? []

  return [
    {
      id: 'stocks',
      label: 'Ações',
      items: acaoItems,
    },
    {
      id: 'funds',
      label: 'FIIs',
      items: fiiItems,
    },
    {
      id: 'bdrs',
      label: 'BDRs',
      items: bdrItems,
    },
    {
      id: 'etfs',
      label: 'ETFs',
      items: etfItems,
    },
  ]
})

// Filter groups based on search term
const filteredGroups = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  if (!term) return groups.value

  return groups.value.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        item.suffix.toLowerCase().includes(term)
    ),
  }))
})

// Check if there are no results
const hasNoResults = computed(() => {
  if (!searchTerm.value.trim()) return false
  return filteredGroups.value.every((group) => group.items.length === 0)
})

function formatCurrencyBRL(n: number) {
  if (!Number.isFinite(n) || n < 0) return 'R$ —'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
</script>

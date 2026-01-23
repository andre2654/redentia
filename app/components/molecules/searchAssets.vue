<template>
  <UModal
    v-model:open="open"
    :ui="{
      content:
        'bg-[#0a0a0b] border border-white/10 ring-0 sm:rounded-2xl shadow-2xl shadow-black/50 overflow-hidden',
      overlay: 'backdrop-blur-md bg-black/70',
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
              class="border-white/10 bg-white/5 text-white/40"
            />
            <UKbd
              value="K"
              variant="subtle"
              class="border-white/10 bg-white/5 text-white/40"
            />
          </div>
        </template>
      </UButton>
    </slot>

    <template #content>
      <div class="flex h-full flex-col overflow-hidden">
        <!-- Header / Search Input -->
        <div class="flex-shrink-0 border-b border-white/10 p-4">
          <div class="flex items-center gap-2">
            <!-- Search Input -->
            <div class="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <UIcon name="i-lucide-search" class="h-5 w-5 flex-shrink-0 text-white/40" />
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Buscar por nome ou ticker..."
                class="min-w-0 flex-1 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
              >
              <div v-if="status === 'pending'" class="flex-shrink-0">
                <UIcon name="i-lucide-loader-2" class="h-4 w-4 animate-spin text-secondary" />
              </div>
              <button
                v-else-if="searchTerm"
                class="flex-shrink-0 rounded-md p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
                @click="searchTerm = ''"
              >
                <UIcon name="i-lucide-x" class="h-4 w-4" />
              </button>
            </div>

            <!-- Advanced Search Button -->
            <NuxtLink
              to="/search"
              class="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-xl border border-secondary/20 bg-secondary/10 text-secondary transition-all hover:border-secondary/40 hover:bg-secondary/20"
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
              <div class="sticky top-0 z-10 mb-2 flex items-center gap-2 bg-[#0a0a0b] px-3 py-2">
                <span class="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  {{ group.label }}
                </span>
                <span class="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40">
                  {{ group.items.length }}
                </span>
              </div>

              <!-- Items -->
              <div class="space-y-0.5">
                <NuxtLink
                  v-for="item in group.items"
                  :key="item.id"
                  :to="item.to"
                  class="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-white/5"
                  @click="onSelect"
                >
                  <!-- Logo -->
                  <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
                    <img
                      v-if="item.avatar?.src"
                      :src="item.avatar.src"
                      :alt="item.label"
                      class="h-full w-full object-cover"
                    >
                    <span v-else class="text-xs font-bold text-white/40">
                      {{ item.label.slice(0, 2) }}
                    </span>
                  </div>

                  <!-- Info -->
                  <div class="flex min-w-0 flex-1 flex-col">
                    <span class="text-sm font-semibold text-white">{{ item.label }}</span>
                    <span class="truncate text-xs text-white/40">{{ item.suffix }}</span>
                  </div>

                  <!-- Arrow -->
                  <UIcon
                    name="i-lucide-chevron-right"
                    class="h-4 w-4 flex-shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-white/40"
                  />
                </NuxtLink>
              </div>
            </div>
          </template>

          <!-- Empty State -->
          <div v-if="hasNoResults" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
              <UIcon name="i-lucide-search-x" class="h-7 w-7 text-white/30" />
            </div>
            <p class="text-sm text-white/40">Nenhum ativo encontrado</p>
            <p class="mt-1 text-xs text-white/20">Tente buscar por outro nome ou ticker</p>
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

const searchTerm = ref('')
const { getAssets } = useAssetsService()
const open = ref(false)
const attrs = useAttrs()

const props = defineProps<{
  compact?: boolean
}>()

const triggerUi = computed(() => {
  if (props.compact) {
    return {
      base: 'rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center',
      icon: 'size-5 text-secondary',
      label: 'hidden',
    }
  }

  return {
    base: 'w-full text-left justify-start text-white/50 bg-white/5 hover:bg-white/10 rounded-2xl px-4 transition-all',
    label: 'font-normal',
    icon: 'text-white/40',
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
  const acaoItems =
    ativos.value
      ?.filter((item) => item.type === 'STOCK')
      .map((item) => ({
        id: item.ticker,
        label: item.ticker,
        suffix: item.name,
        to: `/asset/${item.ticker.toLowerCase()}`,
        avatar: { src: item.logo },
      })) || []

  const fiiItems =
    ativos.value
      ?.filter((item) => item.type === 'REIT')
      .map((item) => ({
        id: item.ticker,
        label: item.ticker,
        suffix: item.name,
        to: `/asset/${item.ticker.toLowerCase()}`,
        avatar: { src: item.logo },
      })) || []

  const bdrItems =
    ativos.value
      ?.filter((item) => item.type === 'BDR')
      .map((item) => ({
        id: item.ticker,
        label: item.ticker,
        suffix: item.name,
        to: `/asset/${item.ticker.toLowerCase()}`,
        avatar: { src: item.logo },
      })) || []

  const etfItems =
    ativos.value
      ?.filter((item) => item.type === 'ETF')
      .map((item) => ({
        id: item.ticker,
        label: item.ticker,
        suffix: item.name,
        to: `/asset/${item.ticker.toLowerCase()}`,
        avatar: { src: item.logo },
      })) || []

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
</script>

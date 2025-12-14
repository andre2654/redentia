<template>
  <UModal
    v-model:open="open"
    :ui="{
      content:
        'bg-[#09090b] border border-white/10 ring-0 sm:rounded-[20px] shadow-2xl shadow-primary/5 overflow-hidden',
      overlay: 'backdrop-blur-xl bg-black/80',
      width: 'sm:max-w-2xl',
      height: 'h-[600px]',
    }"
  >
    <slot name="trigger">
      <UButton
        :label="compact ? undefined : 'Buscar Ativos...'"
        color="neutral"
        variant="ghost"
        icon="i-lucide-search"
        :ui="triggerUi"
        @click="open = true"
      >
        <template v-if="!compact" #trailing>
          <div class="flex items-center gap-2 max-lg:hidden">
            <UKbd
              value="meta"
              variant="subtle"
              class="border-white/10 bg-white/10 text-white/60"
            />
            <UKbd
              value="K"
              variant="subtle"
              class="border-white/10 bg-white/10 text-white/60"
            />
          </div>
        </template>
      </UButton>
    </slot>

    <template #content>
      <div class="relative flex h-full flex-col overflow-hidden">
        <!-- Background Effects -->
        <div
          class="bg-primary/10 pointer-events-none absolute -top-20 left-1/2 h-[300px] w-[400px] -translate-x-1/2 rounded-full blur-[100px]"
        />

        <UCommandPalette
          v-model:search-term="searchTerm"
          :loading="status === 'pending'"
          :groups="groups"
          placeholder="Digite o nome ou ticker do ativo..."
          class="flex-1 bg-transparent"
          :ui="{
            root: 'flex flex-col h-full',
            input:
              'bg-transparent border-b border-white/10 h-16 text-lg text-white placeholder:text-white/30 focus:ring-0 px-6',
            group: 'p-2',
            label:
              'text-xs font-medium text-secondary/70 uppercase tracking-widest px-3 py-2',
            item: 'group flex items-center gap-3 px-3 py-3 rounded-2xl text-sm text-white/80 aria-selected:bg-white/10 aria-selected:text-white transition-colors cursor-pointer',
            container:
              'divide-y divide-white/5 scroll-py-2 flex-1 overflow-y-auto',
            empty: 'py-14 text-center text-sm text-white/40',
            icon: 'text-white/40 group-aria-selected:text-white',
          }"
          @update:model-value="onSelect"
        >
          <template #footer>
            <div
              class="rounded-b-[16px] border-t border-white/10 bg-white/5 p-4 backdrop-blur-md"
            >
              <UButton
                to="/search"
                color="secondary"
                variant="soft"
                block
                size="xl"
                class="rounded-2xl font-semibold"
                @click="open = false"
              >
                <div class="flex items-center gap-3">
                  <span class="i-lucide-search size-5" />
                  <span>Acessar busca avançada</span>
                </div>
              </UButton>
            </div>
          </template>
        </UCommandPalette>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'

const searchTerm = ref('')
const { getAssets } = useAssetsService()
const open = ref(false)

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
</script>

<template>
  <UModal v-model:open="open">
    <UButton
      label="Buscar Ativos..."
      color="neutral"
      variant="link"
      icon="i-lucide-search"
      :ui="{
        base: 'text-[16px] px-6 py-3',
        label: 'mr-auto',
      }"
    >
      <template #trailing>
        <div class="flex items-center gap-2 max-lg:hidden">
          <UKbd value="meta" variant="link" color="neutral" />
          <UKbd value="K" variant="link" color="neutral" />
        </div>
      </template>
    </UButton>

    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        :loading="status === 'pending'"
        :groups="groups"
        placeholder="Buscar ações ou FIIs..."
        class="h-[500px]"
        :ui="{
          item: 'space-y-1',
        }"
      >
        <template #footer>
          <div class="flex w-full flex-col items-center gap-3">
            <NuxtLink
              to="/search"
              class="flex items-center gap-3 text-sm underline hover:opacity-70"
            >
              <UIcon name="i-lucide-search" class="h-4 w-4" />
              <span>Ou acesse a busca avançada clicando aqui</span>
            </NuxtLink>
            <!-- <AtomsTickerCarousel class="w-full" no-control /> -->
          </div>
        </template>
      </UCommandPalette>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'

const searchTerm = ref('')
const { getAssets } = useAssetsService()
const open = ref(false)

defineShortcuts({
  meta_k: () => {
    open.value = !open.value
  },
})

async function fetchAcoesFiis(q: string): Promise<IAsset[]> {
  const allData: IAsset[] = await getAssets()

  return allData.filter(
    (item) =>
      item.ticker.toLowerCase().includes(q.toLowerCase()) ||
      item.name.toLowerCase().includes(q.toLowerCase())
  )
}

const { data: ativos, status } = await useAsyncData(
  'assets',
  () => fetchAcoesFiis(searchTerm.value),
  {
    watch: [searchTerm],
    immediate: true,
    default: () => [],
  }
)

const groups = computed(() => {
  const acaoItems =
    ativos.value
      ?.filter((item) => item.type === 'STOCK')
      .map((item) => ({
        id: item.ticker,
        label: item.ticker,
        suffix: item.name,
        to: `/asset/${item.ticker}`,
        avatar: { src: item.logo },
      })) || []

  const fiiItems =
    ativos.value
      ?.filter((item) => item.type === 'FUND')
      .map((item) => ({
        id: item.ticker,
        label: item.ticker,
        suffix: item.name,
        to: `/asset/${item.ticker}`,
        avatar: { src: item.logo },
      })) || []

  const bdrItems =
    ativos.value
      ?.filter((item) => item.type === 'BDR')
      .map((item) => ({
        id: item.ticker,
        label: item.ticker,
        suffix: item.name,
        to: `/asset/${item.ticker}`,
        avatar: { src: item.logo },
      })) || []

  const reitItems =
    ativos.value
      ?.filter((item) => item.type === 'REIT')
      .map((item) => ({
        id: item.ticker,
        label: item.ticker,
        suffix: item.name,
        to: `/asset/${item.ticker}`,
        avatar: { src: item.logo },
      })) || []

  return [
    {
      id: 'stocks',
      label: 'Ações',
      items: acaoItems,
      ignoreFilter: true,
    },
    {
      id: 'funds',
      label: 'FIIs',
      items: fiiItems,
      ignoreFilter: true,
    },
    {
      id: 'bdrs',
      label: 'BDRs',
      items: bdrItems,
      ignoreFilter: true,
    },
    {
      id: 'reits',
      label: 'REITs',
      items: reitItems,
      ignoreFilter: true,
    },
  ]
})
</script>

<template>
  <UModal v-model:open="open">
    <UButton
      label="Buscar Ativos..."
      color="neutral"
      variant="link"
      icon="i-lucide-search"
      :ui="{
        base: 'text-[16px] px-6 py-3',
        label: 'mr-6',
      }"
    >
      <template #trailing>
        <div class="flex items-center gap-2 max-lg:hidden">
          <UKbd value="meta" variant="soft" color="neutral" />
          <UKbd value="K" variant="soft" color="neutral" />
        </div>
      </template>
    </UButton>

    <template #content>
      <UCommandPalette
        v-model:search-term="searchTerm"
        :loading="status === 'pending'"
        :groups="groups"
        placeholder="Buscar ações ou FIIs..."
        class="h-80"
        :ui="{
          item: 'space-y-1',
        }"
      >
        <template #footer>
          <AtomsTickerCarousel class="w-full" no-control />
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
      item.stock.toLowerCase().includes(q.toLowerCase()) ||
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
      ?.filter((item) => item.type === 'stock')
      .map((item) => ({
        id: item.stock,
        label: item.stock,
        suffix: item.name,
        to: `/asset/${item.stock}`,
        avatar: { src: item.logo },
      })) || []

  const fiiItems =
    ativos.value
      ?.filter((item) => item.type === 'fund')
      .map((item) => ({
        id: item.stock,
        label: item.stock,
        suffix: item.name,
        to: `/asset/${item.stock}`,
        avatar: { src: item.logo },
      })) || []

  const bdrItems =
    ativos.value
      ?.filter((item) => item.type === 'bdr')
      .map((item) => ({
        id: item.stock,
        label: item.stock,
        suffix: item.name,
        to: `/asset/${item.stock}`,
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
  ]
})
</script>

<template>
  <NuxtLayout title="Visão geral" hide-search-bar>
    <div class="flex h-full flex-col pb-8 pt-6">
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Ações e fundos imobiliarios</h2>
        <p class="text-[13px] font-extralight">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          vulputate erat non massa tristique.
        </p>
      </div>
      <MoleculesSearchAssets class="mt-4 rounded-none border-y py-4" />
      <div class="grid grid-cols-3 divide-x divide-y divide-[#535353]">
        <NuxtLink
          v-for="asset in allAssets"
          :key="asset.id"
          :to="`/asset/${asset.stock}`"
          class="flex flex-col gap-1 p-3 hover:bg-white/10"
        >
          <div class="flex items-center justify-between">
            <div class="flex gap-2">
              <span class="text-[18px] font-semibold">{{ asset.stock }}</span>
              <span class="text-[16px] text-white/70">
                {{ asset.name }}
              </span>
            </div>
            <UButton
              color="neutral"
              variant="link"
              trailing-icon="i-lucide-maximize-2"
            />
          </div>
          <div class="flex items-center gap-2">
            <div class="flex gap-2">
              <span class="text-[16px] font-semibold">R$ 50,00</span>
              <span class="text-[14px] text-green-500">(+2,00% hoje)</span>
            </div>
          </div>
          <img
            width="150"
            class="rounded-md"
            :src="asset.logo"
            alt="Descrição da imagem"
          />
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'

const { getAssets } = useAssetsService()

const allAssets = ref<IAsset[]>([])

onMounted(async () => {
  allAssets.value = await getAssets()
})
</script>

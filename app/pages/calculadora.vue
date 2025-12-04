<template>
  <NuxtLayout :name="layoutName" title="Calculadora Inteligente">
    <div class="flex h-full flex-col gap-6 px-6 pb-8 pt-6">
      <div class="flex flex-col">
        <h2 class="text-[18px] font-bold">Planejamento financeiro</h2>
        <p class="text-[13px] font-extralight">
          Simule investimentos com juros compostos ou analise o histórico real
          de ações e FIIs.
        </p>
      </div>

      <div class="flex items-center justify-between gap-5 max-md:flex-col">
        <h2 class="text-lg font-semibold">Selecione a calculadora</h2>
        <UButtonGroup orientation="horizontal" variant="soft">
          <UButton
            color="neutral"
            :variant="selectedCalculator === 'compound' ? 'soft' : 'link'"
            label="Juros Compostos"
            @click="selectedCalculator = 'compound'"
          />
          <UButton
            color="neutral"
            :variant="selectedCalculator === 'stock' ? 'soft' : 'link'"
            label="Histórico de Ações"
            @click="selectedCalculator = 'stock'"
          />
          <UButton
            color="neutral"
            :variant="selectedCalculator === 'planning' ? 'soft' : 'link'"
            label="Planejamento"
            @click="selectedCalculator = 'planning'"
          />
        </UButtonGroup>
      </div>

      <CalculatorCompound v-if="selectedCalculator === 'compound'" />
      <CalculatorStock
        v-else-if="selectedCalculator === 'stock'"
        :assets="assets"
        :assets-loading="assetsLoading"
      />
      <CalculatorPlanning v-else :assets="assets" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAssetsService } from '~/services/assets'

const { getAssets } = useAssetsService()
const { data: assetsData, pending: assetsPending } = await useAsyncData(
  'assets-calculator',
  () => getAssets()
)

const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

const selectedCalculator = ref<'compound' | 'stock' | 'planning'>('compound')

const assets = computed(() => assetsData.value ?? [])
const assetsLoading = computed(() => assetsPending.value)

usePageSeo({
  title:
    'Calculadora de juros compostos e simuladores de investimentos | Redentia',
  description:
    'Simule juros compostos, planeje aportes e analise o histórico de ações e FIIs com a calculadora inteligente da Redentia.',
  path: '/calculadora',
})

definePageMeta({
  isPublicRoute: true,
})
</script>

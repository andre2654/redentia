<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const brand = useBrand()
const runtimeConfig = useRuntimeConfig()
const siteUrl = String(runtimeConfig.public?.siteUrl || brand.url).replace(/\/$/, '')

const statusCode = computed(() => props.error?.statusCode || 500)

const title = computed(() => {
  if (statusCode.value === 404) return 'Página não encontrada'
  if (statusCode.value === 410) return 'Conteúdo removido'
  if (statusCode.value >= 500) return 'Erro interno'
  return 'Algo deu errado'
})

const description = computed(() => {
  if (statusCode.value === 404) {
    return 'O endereço que você procurou não existe ou foi movido. Volte para a página inicial e explore nossos conteúdos sobre investimentos.'
  }
  if (statusCode.value === 410) {
    return 'Este conteúdo foi permanentemente removido.'
  }
  return 'Tivemos um problema ao carregar esta página. Tente novamente em instantes.'
})

useSeoMeta({
  title: () => `${title.value} · ${brand.name}`,
  description: () => description.value,
  robots: 'noindex,follow',
})

useHead({
  link: [{ rel: 'canonical', href: `${siteUrl}/` }],
})

function handleHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6 text-center text-white">
    <div class="flex flex-col gap-2">
      <p class="text-6xl font-bold tracking-tight">
        {{ statusCode }}
      </p>
      <h1 class="text-2xl md:text-3xl" :class="[brand.font.headingWeight, brand.font.headingStyle]">
        {{ title }}
      </h1>
    </div>

    <p class="max-w-md text-base text-gray-400 md:text-lg">
      {{ description }}
    </p>

    <div class="flex flex-col gap-3 sm:flex-row">
      <UButton
        size="lg"
        color="primary"
        icon="i-lucide-home"
        @click="handleHome"
      >
        Voltar para o início
      </UButton>
      <UButton
        size="lg"
        variant="outline"
        color="neutral"
        icon="i-lucide-search"
        to="/search"
      >
        Buscar ativos
      </UButton>
    </div>
  </div>
</template>

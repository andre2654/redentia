<template>
  <NuxtLayout title="Assessoria" header-class="!text-white !bg-tertiary/50">
    <div class="flex h-full w-full pt-4">
      <MoleculesChat
        class="h-full w-full bg-gradient-to-b from-[#042f54] to-[#0b3f6d] text-white"
        :suggestions="[
          'Analise meus investimentos e me fale onde posso melhorar',
          'Tenho R$ 100,00 para investir, qual ação comprar?',
          'Rebalance minha carteira para focar em dividendos',
        ]"
        textarea-container-class="bg-gray-200"
        :messages="messages"
        routePath="/help"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const messages = ref<IChatMessage[]>([
  {
    id: '1',
    content: 'Olá, como posso ajudar você hoje?',
    type: 'bot',
    timestamp: new Date(),
  },
])

definePageMeta({
  isPublicRoute: true,
  layoutTransition: {
    name: 'slide-in',
  },
})

const runtimeConfig = useRuntimeConfig()
const siteUrl = computed(() => {
  const url = runtimeConfig.public?.siteUrl || 'https://www.redentia.com.br'
  return url.endsWith('/') ? url.slice(0, -1) : url
})
const canonicalUrl = computed(() => `${siteUrl.value}/help`)
const pageTitle = 'Assessoria com IA | Redentia'
const metaDescription =
  'Converse com a assistente inteligente da Redentia, tire dúvidas sobre investimentos e receba recomendações personalizadas com tecnologia de IA.'

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  twitterTitle: pageTitle,
  description: metaDescription,
  ogDescription: metaDescription,
  twitterDescription: metaDescription,
  ogUrl: () => canonicalUrl.value,
  ogImage: () => `${siteUrl.value}/512x512.png`,
  twitterImage: () => `${siteUrl.value}/512x512.png`,
  ogType: 'website',
  ogSiteName: 'Redentia',
  ogLocale: 'pt_BR',
  twitterCard: 'summary_large_image',
  robots: 'index,follow',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value,
    },
  ],
})
</script>

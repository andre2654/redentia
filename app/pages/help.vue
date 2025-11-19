<template>
  <NuxtLayout :name="layoutName" title="Assessoria" header-class="!text-white !bg-tertiary/50">
    <div class="flex h-full w-full">
      <div
        v-if="!authStore.isAuthenticated"
        class="flex h-full w-full items-center justify-center"
      >
        <div
          class="flex w-full h-full min-h-screen flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 text-center text-white backdrop-blur-xl justify-center"
        >
          <div class="flex flex-col items-center gap-4">
            <IconAi class="fill-secondary h-12" />
            <h2 class="text-2xl font-semibold sm:text-3xl">
              Converse com nossa IA
            </h2>
            <p class="max-w-xl text-sm text-white/70 sm:text-base">
              Faça login para liberar o chat inteligente, tirar dúvidas,
              comparar ativos e receber análises personalizadas.
            </p>
          </div>
          <UButton
            color="secondary"
            size="xl"
            icon="i-lucide-message-circle"
            class="hover:shadow-secondary/50 px-6 transition-all hover:scale-105 hover:shadow-2xl"
            @click="redirectToLogin"
          >
            Acessar Assessoria
          </UButton>
          <p class="text-xs text-white/50 sm:text-sm">
            Respostas instantâneas • Análises personalizadas com IA
          </p>
        </div>
      </div>
      <MoleculesChat
        v-else
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
const authStore = useAuthStore()
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

const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

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

function redirectToLogin() {
  navigateTo('/auth/login?redirect=/help')
}
</script>

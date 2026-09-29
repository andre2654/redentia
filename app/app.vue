<script setup lang="ts">
// JSON-LD Organization site-wide (1× no app, não em layout — padrão do Frontend).
const site = useRuntimeConfig().public.siteUrl
useHead({
  // Sufixo de marca em todo title. Vive AQUI (não no nuxt.config): função de
  // titleTemplate em app.head não serializa e o SSR saía sem sufixo (bug desde
  // o PR0, pego no verify do PR10). /login segue com opt-out via titleTemplate: null.
  titleTemplate: (title?: string | null) =>
    title ? `${title} · Redentia` : 'Redentia: invista com uma IA do seu lado',
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Redentia',
      url: site,
      logo: `${site}/logo-azul.svg`,
      description: 'Plataforma brasileira de análise de investimentos com IA: ações, FIIs, notícias, teses e carteira.',
    }),
  }],
})

// Fim da hidratação pro useAuthState (ver markAuthHydrated). Precisa ser o 1º
// filho do template: o onMounted dele é o 1º da árvore a rodar, depois de
// TODA a hidratação e antes dos onMounted do layout e das páginas.
const AuthHydrated = defineComponent({
  setup() {
    onMounted(markAuthHydrated)
    return () => null
  },
})
</script>

<template>
  <div>
    <AuthHydrated />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

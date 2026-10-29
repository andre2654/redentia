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
      legalName: EMPRESA.razaoSocial,
      taxID: EMPRESA.cnpj,
      url: site,
      logo: `${site}/logo-azul.svg`,
      description: 'Plataforma brasileira de análise de investimentos com IA: ações, FIIs, notícias, teses e carteira.',
    }),
  }],
})

// Sessão adiada pelo HIT anônimo da borda (ver assumirSessaoAdiada). Precisa
// ser o 1º filho do template: o onMounted dele é o 1º da árvore a rodar,
// depois de TODA a hidratação e antes dos onMounted do layout e das páginas.
const AssumirSessao = defineComponent({
  setup() {
    onMounted(assumirSessaoAdiada)
    return () => null
  },
})

const semLayout = computed(() => useRoute().meta.layout === false)
</script>

<template>
  <div>
    <AssumirSessao />
    <NuxtRouteAnnouncer />
    <!-- Páginas sem layout (login, convite) não têm header pra sentar
         o aviso embaixo. No default e no business ele fica no layout,
         depois do header, no fluxo — não cobre o header nem títulos. -->
    <ConsentBanner v-if="semLayout" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

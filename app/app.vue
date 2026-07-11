<script setup lang="ts">
// JSON-LD Organization site-wide (1× no app, não em layout — padrão do Frontend).
const site = useRuntimeConfig().public.siteUrl
useHead({
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
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

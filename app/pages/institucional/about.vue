<template>
  <NuxtLayout name="static" title="Sobre nós">
    <section class="flex flex-col gap-3 px-10">
      <h1><strong>{{ brand.about.title }}</strong></h1>
      <p v-for="(paragraph, index) in brand.about.paragraphs" :key="index">
        {{ paragraph }}
      </p>
    </section>
  </NuxtLayout>
</template>

<script lang="ts" setup>
const brand = useBrand()

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: `Sobre a ${brand.name} | Plataforma inteligente de investimentos`,
  description:
    `Entenda a missão da ${brand.name} e como combinamos consolidação de carteira e inteligência artificial para simplificar a vida do investidor brasileiro.`,
  path: '/institucional/about',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Sobre', path: '/institucional/about' },
  ],
})
</script>

<template>
  <NuxtLayout name="static" title="Como funciona">
    <section class="flex flex-col gap-3 px-10">
      <h1><strong>{{ brand.howWorks.title }}</strong></h1>
      <div v-for="(step, index) in brand.howWorks.steps" :key="index" class="flex gap-4 items-start">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <UIcon :name="step.icon" class="text-secondary h-5 w-5" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-white">{{ step.title }}</h2>
          <p class="text-sm text-white/70">{{ step.description }}</p>
        </div>
      </div>
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
  title: `Como funciona a ${brand.name} | Consolide e analise seus investimentos`,
  description:
    `Veja passo a passo como a plataforma ${brand.name} conecta corretoras, usa IA para gerar insights e entrega dashboards completos para seus investimentos.`,
  path: '/redentia/how-works',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Como funciona', path: '/redentia/how-works' },
  ],
})
</script>

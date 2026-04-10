<template>
  <NuxtLayout name="static" title="Setores da Bolsa Brasileira">
    <section class="flex flex-col gap-8 px-6 py-8">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <div
            class="flex size-12 items-center justify-center rounded-xl"
            :style="{ backgroundColor: brand.colors.secondary + '22' }"
          >
            <UIcon
              name="i-lucide-layers"
              class="size-6"
              :style="{ color: brand.colors.secondary }"
            />
          </div>
          <div>
            <p
              class="text-[10px] font-medium uppercase tracking-[0.15em]"
              :style="{ color: brand.colors.textMuted }"
            >
              Explore
            </p>
            <h1 class="text-3xl font-bold md:text-4xl">Setores da Bolsa</h1>
          </div>
        </div>
        <p class="max-w-2xl text-base" :style="{ color: brand.colors.textMuted }">
          Explore os setores econômicos da bolsa brasileira. Cada setor tem
          seu comparativo completo com todas as empresas listadas, indicadores
          fundamentalistas e métricas de mercado.
        </p>
      </div>

      <div v-if="pending" class="flex items-center justify-center py-16">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="sector in sectors"
          :key="sector.slug"
          :to="`/setor/${sector.slug}/comparativo`"
          class="group flex items-center justify-between gap-3 rounded-xl border px-5 py-4 transition-all hover:border-white/20"
          :style="{
            borderColor: brand.colors.border,
            backgroundColor: brand.colors.surface,
          }"
        >
          <div class="flex min-w-0 flex-1 flex-col">
            <span
              class="truncate text-sm font-semibold"
              :style="{ color: brand.colors.text }"
            >
              {{ sector.name }}
            </span>
            <span
              class="text-[11px] tabular-nums"
              :style="{ color: brand.colors.textMuted }"
            >
              {{ sector.count }} {{ sector.count === 1 ? 'empresa' : 'empresas' }}
            </span>
          </div>
          <UIcon
            name="i-lucide-arrow-up-right"
            class="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            :style="{ color: brand.colors.textMuted }"
          />
        </NuxtLink>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const brand = useBrand()
const service = useAssetsService()

useSeoMeta({
  title: 'Setores da Bolsa Brasileira | Comparativos Completos | Redentia',
  description:
    'Explore todos os setores econômicos da bolsa brasileira com comparativos completos: bancos, energia, varejo, saúde, commodities e mais.',
  ogTitle: 'Setores da Bolsa Brasileira',
  ogDescription:
    'Comparativos de empresas por setor econômico na bolsa brasileira.',
})

const { data: sectors, pending } = await useAsyncData(
  'sectors-list',
  () => service.getSectors(),
  { default: () => [] }
)
</script>

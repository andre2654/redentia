<!--
  MoleculesSubdomainHeader

  Header sticky compartilhado entre as landing pages e subpáginas dos
  subdomínios de produto (creative.redentia.com.br, embed.redentia.com.br,
  api.redentia.com.br). Mantém branding consistente em todas as telas
  do produto — antes cada landing tinha esse header inline e as subpáginas
  usavam o chrome do site principal, que quebrava a identidade.

  Uso:
    <MoleculesSubdomainHeader product="creative" />
    <MoleculesSubdomainHeader product="embed" />
    <MoleculesSubdomainHeader product="api" />
-->

<template>
  <header
    class="sticky top-0 z-40 border-b backdrop-blur-xl"
    :style="{ borderColor: REDENTIA_COLORS.border, backgroundColor: `${REDENTIA_COLORS.background}CC` }"
  >
    <div class="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 md:px-6">
      <NuxtLink :to="config.homeLink" class="flex items-center gap-2">
        <div
          class="flex size-7 items-center justify-center rounded"
          :style="{ backgroundColor: REDENTIA_COLORS.primary, color: REDENTIA_COLORS.background }"
        >
          <UIcon :name="config.icon" class="size-4" />
        </div>
        <span
          class="font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em]"
          :style="{ color: REDENTIA_COLORS.text }"
        >
          REDENTIA<span :style="{ color: REDENTIA_COLORS.primary }">.{{ config.suffix }}</span>
        </span>
      </NuxtLink>
      <div class="flex-1" />
      <a
        :href="mainSiteHref"
        class="inline-flex items-center gap-2 font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-70"
        :style="{ color: REDENTIA_COLORS.textMuted }"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3" />
        Voltar pro site
      </a>
    </div>
  </header>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS } from '~/utils/redentiaCreativeColors'

type Product = 'creative' | 'embed' | 'api'

const props = withDefaults(defineProps<{
  product: Product
}>(), {})

const PRODUCT_CONFIG: Record<Product, { icon: string; suffix: string; homeLink: string }> = {
  creative: {
    icon: 'i-lucide-image',
    suffix: 'CREATIVE',
    homeLink: '/creative',
  },
  embed: {
    icon: 'i-lucide-code-xml',
    suffix: 'EMBED',
    homeLink: '/embed',
  },
  api: {
    icon: 'i-lucide-terminal',
    suffix: 'API',
    homeLink: '/api-portal',
  },
}

const config = computed(() => PRODUCT_CONFIG[props.product])
const mainSiteHref = useMainSiteHref()
</script>

<!--
  MoleculesEmbedPlaygroundShell

  Wrapper compartilhado dos playgrounds de embed.redentia.com.br.
  Garante que todas as subpáginas do embed (ticker/small, ticker/big,
  carousel, ranking/[side], mapa-calor, grafico, calculadora/[tipo])
  tenham exatamente o mesmo header + breadcrumb + hero que a landing
  /embed.

  Uso em cada playground:
    <MoleculesEmbedPlaygroundShell
      breadcrumb="Ticker Small"
      hero-title="Widget de Cotação Compacto"
      hero-description="Card pequeno com logo, ticker..."
    >
      <div class="grid gap-8 md:grid-cols-5">
        ...config panel e preview...
      </div>
    </MoleculesEmbedPlaygroundShell>
-->

<template>
  <NuxtLayout name="api-portal">
    <div
      class="relative min-h-screen"
      :style="{
        backgroundColor: REDENTIA_COLORS.background,
        color: REDENTIA_COLORS.text,
        fontFamily: REDENTIA_FONTS.body,
      }"
    >
      <MoleculesSubdomainHeader product="embed" />

      <section class="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 md:px-10 md:py-16">
        <!-- Breadcrumbs no mesmo estilo mono do creative -->
        <nav
          class="flex items-center gap-2 font-mono-tab text-[11px] uppercase tracking-[0.12em]"
          :style="{ color: REDENTIA_COLORS.textMuted }"
        >
          <NuxtLink
            to="/embed"
            class="transition-colors hover:opacity-70"
            :style="{ color: REDENTIA_COLORS.primary }"
          >
            Embed Studio
          </NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="size-3" />
          <span :style="{ color: REDENTIA_COLORS.text }">{{ breadcrumb }}</span>
        </nav>

        <!-- Hero -->
        <header class="flex flex-col gap-4">
          <span
            class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
            :style="{ color: REDENTIA_COLORS.primary }"
          >
            [ {{ breadcrumb.toUpperCase() }} ]{{ eyebrowSuffix ? ` · ${eyebrowSuffix}` : '' }}
          </span>
          <h1
            class="text-3xl md:text-5xl"
            :style="{
              color: REDENTIA_COLORS.text,
              fontFamily: REDENTIA_FONTS.display,
              lineHeight: '0.95',
              letterSpacing: '-0.02em',
            }"
          >
            {{ heroTitle }}
          </h1>
          <p
            v-if="heroDescription"
            class="max-w-2xl text-base leading-relaxed md:text-lg"
            :style="{ color: REDENTIA_COLORS.textMuted }"
          >
            {{ heroDescription }}
          </p>
        </header>

        <!-- Conteúdo do playground (slot default) -->
        <slot />
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS, REDENTIA_FONTS } from '~/utils/redentiaCreativeColors'

defineProps<{
  breadcrumb: string
  heroTitle: string
  heroDescription?: string
  /** Texto adicional no eyebrow, ex: "DADOS EM TEMPO REAL" */
  eyebrowSuffix?: string
}>()
</script>

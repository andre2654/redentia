<!--
  HERO: CENTERED — fallback minimal pra tenants white-label sem
  necessidade de hero customizado. Mostra eyebrow + headline + subtitle
  + 2 CTAs no centro. Tudo via brand.hero.* config — zero hardcode.

  Quem usa: tenants iniciais que ainda nao decidiram seu visual hero
  proprio. O `seedBrand` default tambem aponta pra essa variant pra
  que tela branca nunca aconteca.

  Phase 4: extracted out of HomeHero.vue mega-file pra eliminar fork
  points e habilitar code-splitting via defineAsyncComponent.
-->
<template>
  <section class="centered-hero relative overflow-hidden">
    <!-- Ambient radial glow (sutil, sem terminal grid/scanlines) -->
    <div
      class="centered-hero__bg pointer-events-none absolute inset-0 -z-10"
      :style="{
        background: `radial-gradient(ellipse at center top, color-mix(in srgb, var(--brand-primary) 22%, transparent), transparent 65%)`,
      }"
      aria-hidden="true"
    />

    <div class="centered-hero__container mx-auto flex max-w-4xl flex-col items-center px-6 py-20 text-center md:py-28 lg:py-32">
      <!-- Eyebrow (opcional) -->
      <p
        v-if="brand.hero?.eyebrow"
        class="eyebrow mb-5 hidden md:block"
        :style="{ color: 'var(--brand-primary)' }"
      >
        {{ brand.hero.eyebrow }}
      </p>

      <!-- Headline -->
      <h1
        class="centered-hero__headline mb-6 max-w-3xl text-[40px] leading-[1.05] tracking-tight md:text-[60px] lg:text-[72px]"
        :style="{ color: 'var(--brand-text)' }"
      >
        {{ brand.hero?.title || brand.tagline || brand.name }}
      </h1>

      <!-- Subtitle -->
      <p
        v-if="brand.hero?.subtitle || brand.subtitle"
        class="mb-10 max-w-2xl text-[15px] leading-relaxed md:text-[17px]"
        :style="{ color: 'var(--brand-text-muted, var(--brand-text))' }"
      >
        {{ brand.hero?.subtitle || brand.subtitle }}
      </p>

      <!-- CTAs -->
      <div class="flex flex-wrap items-center justify-center gap-3">
        <NuxtLink
          v-if="brand.hero?.ctaLabel"
          :to="brand.hero?.ctaHref || '/cadastro'"
          class="centered-hero__cta-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-transform hover:scale-[1.02]"
          :style="{
            backgroundColor: 'var(--brand-primary)',
            color: 'var(--text-on-primary, var(--text-heading))',
          }"
        >
          <UIcon
            v-if="brand.hero?.ctaIcon"
            :name="brand.hero.ctaIcon"
            class="size-4"
          />
          <span>{{ brand.hero.ctaLabel }}</span>
        </NuxtLink>

        <NuxtLink
          v-if="brand.hero?.ctaSecondaryLabel"
          :to="brand.hero?.ctaSecondaryHref || '/login'"
          class="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[14px] font-medium transition-colors hover:opacity-80"
          :style="{
            borderColor: 'var(--brand-border)',
            color: 'var(--brand-text)',
          }"
        >
          {{ brand.hero.ctaSecondaryLabel }}
        </NuxtLink>
      </div>

      <!-- Trust indicators (opcional, lista de strings) -->
      <ul
        v-if="trustIndicators.length"
        class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px]"
        :style="{ color: 'var(--brand-text-muted, var(--brand-text))' }"
      >
        <li
          v-for="(item, idx) in trustIndicators"
          :key="`trust-${idx}`"
          class="inline-flex items-center gap-1.5"
        >
          <UIcon name="i-lucide-check" class="size-3.5" :style="{ color: 'var(--brand-positive)' }" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()

const trustIndicators = computed(() => {
  const v = (brand as any).hero?.trustIndicators
  return Array.isArray(v) ? v.filter(Boolean) : []
})

// Aceita os mesmos props que outras variants (radiograph, quiet) recebem
// pra o pai poder fazer `<component :is>` cego sem checar variant. A
// versao centered nao consome esses props — manifesto generico, nao
// quer mostrar IBOV/IFIX live numbers no hero.
defineProps<{
  ibovSeries?: any
  ibovLastPrice?: number | null
  ibovIndicator?: string | null
  ibovVariationColor?: string | null
  ifixLastPrice?: number | null
  ifixIndicator?: string | null
}>()
</script>

<style scoped>
.centered-hero {
  /* Ocupa altura natural do conteudo, sem min-height fake — evita
     espaco vazio em hero curto. */
  isolation: isolate;
}

.centered-hero__headline {
  font-weight: 600;
  letter-spacing: -0.025em;
}

.centered-hero__cta-primary {
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--brand-primary) 40%, transparent);
}
</style>

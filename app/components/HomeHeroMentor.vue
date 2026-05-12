<!--
  HERO: MENTOR — Primo Rico. Aspirational book-cover orange chunky.
  Inspirado na capa do livro "Do Mil ao Milhao" do Thiago Nigro:
  tipografia EXTRABOLD uppercase com letter-spacing, foto do founder
  em destaque, badge tipo selo editorial, CTAs pill shape, trust
  indicators em selos enfileirados.

  Restored on 2026-05-12 — extracted out of the legacy HomeHero.vue
  mega-file (deleted in Phase 4). Same shape do componente
  HomeHeroCentered/Quiet — recebe os props live IBOV/IFIX por
  compatibilidade com <component :is>, mas nao usa (manifesto-style).
-->
<template>
  <section class="mentor-hero relative overflow-hidden">
    <!-- Background: book-cover style — gradient laranja → preto + textura sutil -->
    <div
      class="mentor-hero__bg pointer-events-none absolute inset-0 -z-10"
      :style="{
        background: `radial-gradient(ellipse 80% 60% at 20% 30%, color-mix(in srgb, var(--brand-primary) 28%, transparent), transparent 70%), linear-gradient(180deg, var(--brand-background) 0%, color-mix(in srgb, var(--brand-background) 95%, var(--brand-primary)) 100%)`,
      }"
      aria-hidden="true"
    />
    <!-- Faixa lateral laranja ("spine" do livro) -->
    <div
      class="mentor-hero__spine pointer-events-none absolute left-0 top-0 bottom-0 -z-10 hidden md:block"
      :style="{ backgroundColor: 'var(--brand-primary)' }"
      aria-hidden="true"
    />

    <div class="mentor-hero__container relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 py-16 md:flex-row md:gap-16 md:px-10 md:py-24 lg:py-28">
      <!-- LEFT: Foto do founder em destaque (se existir) -->
      <div
        v-if="brand.founder?.photo || brand.hero?.image"
        class="mentor-hero__founder relative flex flex-1 items-end justify-center md:justify-start"
      >
        <!-- Glow atras da foto -->
        <div
          class="absolute -inset-20 rounded-full blur-3xl"
          :style="{ backgroundColor: `color-mix(in srgb, var(--brand-primary) 18%, transparent)` }"
        />
        <NuxtImg
          :src="brand.hero?.image || brand.founder.photo"
          :alt="brand.founder?.name || 'Founder'"
          class="relative w-[16rem] max-w-none object-contain drop-shadow-2xl sm:w-[20rem] md:w-[26rem] lg:w-[30rem]"
        />
      </div>

      <!-- RIGHT: Headline editorial chunky + CTAs + trust -->
      <div class="mentor-hero__content flex flex-1 flex-col items-center text-center md:items-start md:text-left">
        <!-- Badge editorial (selo "MANUAL DO PRIMO") -->
        <div
          v-if="brand.hero?.badge"
          class="mentor-hero__badge mb-6 inline-flex items-center gap-2 px-4 py-2"
          :style="{
            backgroundColor: 'var(--brand-primary)',
            color: 'var(--text-on-primary, #000000)',
          }"
        >
          <UIcon name="i-lucide-book-open" class="size-3.5" />
          <span class="text-[11px] font-bold uppercase tracking-[0.18em]">{{ brand.hero.badge }}</span>
        </div>

        <!-- Headline GIGANTE uppercase extrabold (book-cover style) -->
        <h1
          class="mentor-hero__headline mb-6 text-[44px] leading-[0.95] tracking-[-0.02em] sm:text-[60px] md:text-[78px] lg:text-[92px]"
          :class="[brand.font?.headingWeight || 'font-extrabold', brand.font?.headingStyle || 'uppercase tracking-wide']"
          :style="{
            color: 'var(--brand-text)',
            fontFamily: `'${brand.font?.family || 'Montserrat'}', sans-serif`,
          }"
        >
          <template v-for="(line, idx) in headlineLines" :key="`l-${idx}`">
            <span class="block" :style="{ color: idx === headlineLines.length - 1 ? 'var(--brand-primary)' : 'var(--brand-text)' }">{{ line }}</span>
          </template>
        </h1>

        <!-- Subtitle -->
        <p
          v-if="brand.hero?.subtitle"
          class="mentor-hero__subtitle mb-8 max-w-xl text-[15px] leading-relaxed md:text-[17px]"
          :style="{ color: 'var(--brand-text-muted, var(--brand-text))' }"
        >
          {{ brand.hero.subtitle }}
        </p>

        <!-- Founder quote em destaque (selo de assinatura) -->
        <div
          v-if="brand.hero?.founderQuote"
          class="mentor-hero__quote mb-8 max-w-md border-l-4 pl-4"
          :style="{ borderColor: 'var(--brand-primary)' }"
        >
          <p
            class="text-sm italic leading-relaxed md:text-base"
            :style="{ color: `color-mix(in srgb, var(--brand-text) 80%, transparent)` }"
          >
            &ldquo;{{ brand.hero.founderQuote }}&rdquo;
          </p>
          <p
            v-if="brand.founder?.name"
            class="mt-2 text-[11px] font-semibold uppercase tracking-[0.15em]"
            :style="{ color: 'var(--brand-primary)' }"
          >
            {{ brand.founder.name }}
          </p>
        </div>

        <!-- CTAs pill shape (book-cover energy) -->
        <div class="mentor-hero__ctas flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <NuxtLink
            v-if="brand.hero?.ctaLabel"
            :to="brand.hero?.ctaHref || '/auth/register'"
            class="mentor-hero__cta-primary group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-bold uppercase tracking-wide transition-transform hover:scale-[1.03]"
            :style="{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--text-on-primary, #000000)',
            }"
          >
            <span>{{ brand.hero.ctaLabel }}</span>
            <UIcon
              :name="brand.hero?.ctaIcon || 'i-lucide-arrow-right'"
              class="size-4 transition-transform group-hover:translate-x-1"
            />
          </NuxtLink>

          <NuxtLink
            v-if="brand.hero?.ctaSecondaryLabel"
            :to="brand.hero?.ctaSecondaryHref || '/auth/login'"
            class="inline-flex items-center justify-center rounded-full border-2 px-7 py-3.5 text-[14px] font-bold uppercase tracking-wide transition-colors hover:opacity-80"
            :style="{
              borderColor: 'var(--brand-text)',
              color: 'var(--brand-text)',
            }"
          >
            {{ brand.hero.ctaSecondaryLabel }}
          </NuxtLink>
        </div>

        <!-- Trust indicators em selos -->
        <ul
          v-if="trustIndicators.length"
          class="mentor-hero__trust mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] md:justify-start"
          :style="{ color: 'var(--brand-text-muted, var(--brand-text))' }"
        >
          <li
            v-for="(item, idx) in trustIndicators"
            :key="`trust-${idx}`"
            class="inline-flex items-center gap-1.5"
          >
            <span
              class="size-1.5 rounded-full"
              :style="{ backgroundColor: 'var(--brand-primary)' }"
            />
            <span class="font-semibold uppercase tracking-wide">{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand() as any

const headlineLines = computed<string[]>(() => {
  const title: string = brand.hero?.title || brand.tagline || brand.name || ''
  return title.split('\n').map((l: string) => l.trim()).filter(Boolean)
})

const trustIndicators = computed<string[]>(() => {
  const v = brand.hero?.trustIndicators
  return Array.isArray(v) ? v.filter(Boolean) : []
})

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
.mentor-hero {
  isolation: isolate;
}

.mentor-hero__spine {
  width: 8px;
}

.mentor-hero__headline {
  font-feature-settings: 'ss01' on, 'ss02' on;
  text-wrap: balance;
}

.mentor-hero__badge {
  border-radius: 4px;
  box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}

.mentor-hero__cta-primary {
  box-shadow: 0 10px 28px -8px color-mix(in srgb, var(--brand-primary) 55%, transparent);
}
</style>

<!--
  HERO: SHOWTIME — Me Poupe!. "TV show / pop magazine" identidade.
  Lower-third "AO VIVO", headline com `.chunky-shadow` + highlighter sob a
  palavra-chave, founder photo num backdrop circular amarelo, sticker "NOVO!"
  rotacionado, scribble-rule handdrawn como divisor, sticker chips pra trust
  indicators.

  Restored 2026-05-12 do commit `0bca1f2` (HomeHero monolitico legacy).
  Versao portable: so o hero core, sem os "Quadros" do programa (esses
  ficam em components proprios de section quando reativados).

  Toda a tipografia vem das utility classes .font-showtime-* declaradas em
  main.css. Paleta usa var(--brand-*) — cada tenant que ative showtime
  herda sua propria cor amarela/dourada.
-->
<template>
  <section
    class="showtime-hero relative overflow-hidden"
    :style="{ backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }"
  >
    <!-- Decorative background: yellow blob + dots -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full blur-3xl opacity-25"
        :style="{ backgroundColor: 'var(--brand-primary)' }"
      />
      <div
        class="absolute right-0 top-40 h-[320px] w-[320px] rounded-full blur-3xl opacity-20"
        :style="{ backgroundColor: 'var(--brand-secondary)' || 'var(--brand-primary)' }"
      />
      <div
        class="absolute inset-0 opacity-[0.08]"
        :style="{
          backgroundImage: `radial-gradient(var(--brand-text) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }"
      />
    </div>

    <!-- TOP STRIP: lower-third "AO VIVO" + date -->
    <div class="relative flex items-center justify-between gap-3 px-6 pt-6 md:px-10 md:pt-10">
      <span class="lower-third">{{ liveBadge }}</span>
      <span
        class="font-showtime-label hidden sm:inline-block"
        :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }"
      >
        {{ showtimeDate }}
      </span>
    </div>

    <!-- HERO main: text + founder photo -->
    <div class="relative mx-auto max-w-6xl px-6 pb-10 pt-10 md:grid md:grid-cols-12 md:gap-8 md:px-10 md:pb-16 md:pt-16">
      <!-- Text column -->
      <div class="md:col-span-7">
        <h1
          class="font-showtime-display chunky-shadow"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(3rem, 7vw, 6rem)',
          }"
        >
          <template v-for="(line, idx) in headlineLines" :key="`l-${idx}`">
            <br v-if="idx > 0" />
            <span
              v-if="idx === headlineLines.length - 1"
              :style="{ color: 'var(--brand-primary)' }"
            >{{ line }}</span>
            <span v-else>{{ line }}</span>
          </template>
        </h1>

        <!-- Yellow scribble rule sob a headline -->
        <div class="scribble-rule mt-8 max-w-xs" />

        <p
          v-if="brand.hero?.subtitle"
          class="font-showtime-body mt-6 max-w-xl"
          :style="{
            color: 'color-mix(in srgb, var(--brand-text) 90%, transparent)',
            fontSize: 'clamp(1rem, 1.4vw, 1.25rem)',
          }"
        >
          {{ brand.hero.subtitle }}
        </p>

        <!-- CTAs com "stacked shadow" estilo TV pop -->
        <div class="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          <NuxtLink
            v-if="brand.hero?.ctaLabel"
            :to="brand.hero?.ctaHref || '/auth/register'"
            class="showtime-hero__cta-primary group relative inline-flex items-center gap-3 px-8 py-4 font-showtime-label transition-transform hover:-translate-y-0.5"
            :style="{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--brand-background)',
              borderRadius: '14px',
              boxShadow: `0 6px 0 ${'var(--brand-secondary)' || 'var(--brand-primary)'}, 0 16px 40px color-mix(in srgb, var(--brand-primary) 33%, transparent)`,
            }"
          >
            <UIcon name="i-lucide-sparkles" class="size-4" />
            <span>{{ brand.hero.ctaLabel.toUpperCase() }}</span>
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </NuxtLink>
          <NuxtLink
            v-if="brand.hero?.ctaSecondaryLabel"
            :to="brand.hero?.ctaSecondaryHref || '/auth/login'"
            class="font-showtime-body text-base underline underline-offset-4 transition-opacity hover:opacity-70"
            :style="{
              color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)',
              textDecorationColor: 'var(--brand-primary)',
            }"
          >
            {{ brand.hero.ctaSecondaryLabel }}
          </NuxtLink>
        </div>

        <!-- Trust indicators como sticker chips -->
        <div class="mt-10 flex flex-wrap items-center gap-3">
          <div
            v-for="indicator in trustIndicators"
            :key="indicator"
            class="font-showtime-label inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 !text-[10px]"
            :style="{
              borderColor: 'color-mix(in srgb, var(--brand-primary) 44%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)',
              color: 'var(--brand-text)',
            }"
          >
            <span
              class="inline-block size-1.5 rounded-full"
              :style="{ backgroundColor: 'var(--brand-primary)' }"
            />
            {{ indicator }}
          </div>
        </div>
      </div>

      <!-- Photo column: founder em backdrop circular amarelo + sticker + mascote -->
      <div class="relative mt-10 flex items-center justify-center md:col-span-5 md:mt-0">
        <!-- Yellow circle backdrop -->
        <div
          class="absolute inset-0 m-auto aspect-square w-[86%] rounded-full"
          :style="{
            background: `radial-gradient(circle at 30% 30%, var(--brand-primary), ${'var(--brand-secondary)' || 'var(--brand-primary)'})`,
            boxShadow: `0 20px 60px color-mix(in srgb, var(--brand-primary) 33%, transparent)`,
          }"
        />
        <!-- Founder photo -->
        <NuxtImg
          v-if="founderPhoto"
          :src="founderPhoto"
          :alt="`${brand.founder?.name || 'Founder'}`"
          width="420"
          height="520"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          class="relative z-10 h-auto w-full max-w-[420px] object-contain"
        />

        <!-- Sticker "NOVO!" rotated 12deg -->
        <span
          v-if="stickerLabel"
          class="sticker-badge absolute right-2 top-4 z-20 !text-xs"
          style="transform: rotate(12deg);"
        >
          {{ stickerLabel }}
        </span>

        <!-- Mascote (Margarete) peeking from the side, se o tenant tiver -->
        <NuxtImg
          v-if="mascotImage"
          :src="mascotImage"
          alt="Mascote"
          width="128"
          height="128"
          loading="eager"
          decoding="async"
          class="absolute -left-2 bottom-6 z-20 h-32 md:h-40"
          style="transform: rotate(-18deg);"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand() as any

const liveBadge = computed(() => {
  return brand.hero?.badge || 'AO VIVO · NOVO EPISODIO'
})

const headlineLines = computed<string[]>(() => {
  const title: string = brand.hero?.title || brand.tagline || brand.name || ''
  return title.split('\n').map((l: string) => l.trim()).filter(Boolean)
})

const trustIndicators = computed<string[]>(() => {
  const v = brand.hero?.trustIndicators
  return Array.isArray(v) ? v.filter(Boolean) : []
})

const founderPhoto = computed(() => {
  return brand.hero?.image || brand.founder?.photo || null
})

const stickerLabel = computed(() => {
  return brand.hero?.stickerLabel ?? 'NOVO!'
})

const mascotImage = computed(() => {
  return brand.hero?.mascot || brand.mascot?.image || null
})

const showtimeDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()
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
.showtime-hero {
  isolation: isolate;
}
</style>

<!--
  HERO: MENTOR — Primo Rico. "Book-cover masterclass" identidade.
  Inspirado na capa do livro "Do Mil ao Milhao" do Thiago Nigro: top tape
  laranja com "MANUAL DO PRIMO · FICHA TECNICA", grid assimetrico 4/8
  (foto founder / headline monumental), ticker GIGANTE em font-mentor-display,
  chapter heading "CAPITULO I", pull quote em font-mentor-quote italic.

  Restored 2026-05-12 (segunda restauracao). Primeira versao usava
  font-weight inline + uppercase; agora consume as utility classes
  semanticas .font-mentor-* que vivem em main.css — primitivas estaveis
  por variant, zero specificity wars, paleta amber vem do tenant ativo.
-->
<template>
  <section class="mentor-hero relative overflow-hidden" :style="{ backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }">
    <!-- Top tape: faixa laranja com selo editorial -->
    <div
      class="mentor-hero__tape relative flex items-center gap-4 px-6 py-3 md:px-10"
      :style="{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-background)' }"
    >
      <span class="font-mentor-eyebrow">{{ tapeBadge }}</span>
      <span class="flex-1 border-t" :style="{ borderColor: 'color-mix(in srgb, var(--brand-background) 25%, transparent)' }" />
      <span class="font-mentor-eyebrow">{{ tickerTag }}</span>
    </div>

    <!-- HERO: grid assimetrico 4/8 -->
    <div class="relative grid gap-0 md:grid-cols-12">
      <!-- LEFT (col-span-4): foto founder + identidade -->
      <div
        class="relative flex flex-col justify-end px-6 py-10 md:col-span-4 md:px-10 md:py-14"
        :style="{ backgroundColor: 'var(--brand-tertiary)' || 'var(--brand-surface)' }"
      >
        <!-- Faixa lateral laranja na borda direita -->
        <div class="absolute right-0 top-0 h-full w-1" :style="{ backgroundColor: 'var(--brand-primary)' }" />

        <!-- Founder photo: book-cover headshot, large -->
        <NuxtImg
          v-if="brand.founder?.photo"
          :src="brand.founder.photo"
          :alt="brand.founder?.name || 'Founder'"
          class="mb-6 h-48 w-48 rounded-2xl object-cover shadow-2xl md:h-56 md:w-56"
        />

        <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
          O MENTOR
        </span>
        <p
          class="font-mentor-display mt-2"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          }"
        >
          {{ brand.founder?.name || brand.name }}
        </p>
        <p
          v-if="brand.founder?.role"
          class="mt-3 text-sm font-semibold uppercase"
          :style="{ color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)', letterSpacing: '0.08em' }"
        >
          {{ brand.founder.role }}
        </p>
      </div>

      <!-- RIGHT (col-span-8): headline monumental + CTAs -->
      <div class="flex flex-col justify-center px-6 py-14 md:col-span-8 md:px-14 md:py-20">
        <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
          {{ brand.hero?.badge || 'CAPITULO I · CONSTRUA PATRIMONIO' }}
        </span>

        <!-- Title monumental: ticker-style, weight 900, clamp escalavel -->
        <h1
          class="font-mentor-display mt-4"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
            lineHeight: '0.88',
          }"
        >
          <template v-for="(line, idx) in headlineLines" :key="`l-${idx}`">
            <span class="block" :style="{ color: idx === headlineLines.length - 1 ? 'var(--brand-primary)' : 'var(--brand-text)' }">{{ line }}</span>
          </template>
        </h1>

        <!-- Subtitle / dek -->
        <p
          v-if="brand.hero?.subtitle"
          class="mentor-hero__subtitle mt-8 max-w-xl text-base leading-relaxed md:text-lg"
          :style="{ color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)' }"
        >
          {{ brand.hero.subtitle }}
        </p>

        <!-- Pull quote do founder, italic monumental -->
        <div
          v-if="brand.hero?.founderQuote"
          class="mentor-hero__quote mt-10 max-w-2xl border-l-4 pl-6"
          :style="{ borderColor: 'var(--brand-primary)' }"
        >
          <p
            class="font-mentor-quote"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(1.25rem, 2vw, 1.75rem)',
            }"
          >
            &ldquo;{{ brand.hero.founderQuote }}&rdquo;
          </p>
          <p
            v-if="brand.founder?.name"
            class="font-mentor-eyebrow mt-3"
            :style="{ color: 'var(--brand-primary)' }"
          >
            {{ brand.founder.name }}
          </p>
        </div>

        <!-- CTAs editorial pill -->
        <div class="mentor-hero__ctas mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <NuxtLink
            v-if="brand.hero?.ctaLabel"
            :to="brand.hero?.ctaHref || '/auth/register'"
            class="mentor-hero__cta-primary group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 transition-transform hover:scale-[1.03]"
            :style="{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--brand-background)',
            }"
          >
            <span class="font-mentor-eyebrow !text-xs">{{ brand.hero.ctaLabel }}</span>
            <UIcon
              :name="brand.hero?.ctaIcon || 'i-lucide-arrow-right'"
              class="size-4 transition-transform group-hover:translate-x-1"
            />
          </NuxtLink>

          <NuxtLink
            v-if="brand.hero?.ctaSecondaryLabel"
            :to="brand.hero?.ctaSecondaryHref || '/auth/login'"
            class="inline-flex items-center justify-center rounded-full border-2 px-7 py-3.5 transition-colors hover:opacity-80"
            :style="{
              borderColor: 'var(--brand-text)',
              color: 'var(--brand-text)',
            }"
          >
            <span class="font-mentor-eyebrow !text-xs">{{ brand.hero.ctaSecondaryLabel }}</span>
          </NuxtLink>
        </div>

        <!-- Trust indicators editorial -->
        <ul
          v-if="trustIndicators.length"
          class="mentor-hero__trust mt-12 flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          <li
            v-for="(item, idx) in trustIndicators"
            :key="`trust-${idx}`"
            class="inline-flex items-center gap-2"
          >
            <span
              class="size-1.5 rounded-full"
              :style="{ backgroundColor: 'var(--brand-primary)' }"
            />
            <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">
              {{ item }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Mentor-rule: barra grossa entre o hero e a proxima section -->
    <hr class="mentor-rule" :style="{ backgroundColor: 'var(--brand-primary)' }" />
  </section>
</template>

<script setup lang="ts">
const brand = useBrand() as any

const tapeBadge = computed(() => {
  return brand.hero?.tapeBadge || 'MANUAL DO PRIMO · CAPA DO LIVRO'
})

const tickerTag = computed(() => {
  return brand.hero?.tickerTag || (brand.shortName || brand.name || '').toUpperCase()
})

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

.mentor-hero__tape {
  /* Tape laranja "tipografica" — pequena rotacao sutil pra parecer
     selo aplicado, mas mantida em 0 deg pra nao quebrar layout em telas
     pequenas. Box-shadow grossa amber pra dar peso de capa. */
  box-shadow:
    0 8px 24px -6px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}

.mentor-hero__subtitle {
  text-wrap: balance;
}

.mentor-hero__cta-primary {
  box-shadow: 0 10px 28px -8px color-mix(in srgb, var(--brand-primary) 55%, transparent);
}
</style>

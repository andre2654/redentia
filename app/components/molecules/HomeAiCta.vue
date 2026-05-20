<!--
  HomeAiCta — Seção CTA do assistente IA (extraída de /mercado-completo).
  Header + grid de 3 sugestões clicáveis + caixa CTA com mock chat preview.
  Usado em / e /mercado-completo.
-->
<template>
  <section class="border-t px-4 pt-16 md:px-6" :style="{ borderColor: 'var(--brand-border)' }">
    <div class="mx-auto max-w-5xl">
      <!-- Header -->
      <div class="mb-10 text-center">
        <div class="mb-4 inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 brand-pill">
          <IconAi class="fill-secondary h-4 w-4" />
          <span class="text-sm font-medium text-secondary">{{ brand.homeTexts.aiCtaEyebrow }}</span>
        </div>
        <h2 class="mb-3 text-2xl md:text-3xl lg:text-4xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: 'var(--brand-text)' }">
          {{ brand.homeTexts.aiCtaTitle }}
        </h2>
        <p class="mx-auto max-w-xl" :style="{ color: 'var(--brand-text-muted)' }">
          {{ brand.homeTexts.aiCtaSubtitle }}
        </p>
      </div>

      <!-- Grid de sugestões clicáveis -->
      <div class="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="(item, idx) in brand.homeTexts.aiCtaQuestions"
          :key="idx"
          to="/auth/login"
          class="group flex flex-col gap-4 border p-5 transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200 brand-card"
          :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
        >
          <div class="flex items-center justify-between">
            <div class="flex h-10 w-10 items-center justify-center transition-colors group-hover:bg-secondary/20 brand-card-sm" :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 6%, transparent)` }">
              <UIcon :name="item.icon" class="h-5 w-5 transition-colors group-hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }" />
            </div>
            <span class="px-2 py-1 text-xs brand-pill transition-colors group-hover:bg-secondary/10 group-hover:text-secondary/80" :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-text) 3%, transparent)', color: 'var(--brand-text-muted)' }">
              {{ item.category }}
            </span>
          </div>
          <p class="font-medium" :style="{ color: 'var(--brand-text)' }">{{ item.question }}</p>
          <div class="mt-auto flex items-center gap-1 text-sm transition-colors group-hover:text-secondary" :style="{ color: 'var(--brand-text-muted)' }">
            <span>Perguntar</span>
            <UIcon name="i-lucide-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </NuxtLink>
      </div>

      <!-- CTA Box -->
      <div class="relative overflow-hidden border bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent p-6 md:p-8 brand-card" :style="{ borderColor: 'var(--brand-border)' }">
        <!-- Background glow -->
        <div class="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
        <div class="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full blur-3xl" :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }" />

        <div class="relative flex flex-col items-center gap-6 text-center">
          <!-- Mock chat preview -->
          <div class="w-full max-w-md rounded-xl border p-4" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'color-mix(in srgb, var(--brand-background) 50%, transparent)' }">
            <div class="flex items-start gap-3">
              <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary/20">
                <IconAi class="fill-secondary h-4 w-4" />
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm" :style="{ color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)' }">
                  {{ brand.ai.ctaGreeting }}
                </p>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-6 text-sm" :style="{ color: 'var(--brand-text-muted)' }">
            <template v-for="(feature, fIdx) in brand.ai.ctaFeatures" :key="fIdx">
              <div v-if="fIdx > 0" class="h-4 w-px" :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-text) 13%, transparent)' }" :class="{ 'hidden sm:block': fIdx >= 2 }" />
              <div class="flex items-center gap-2" :class="{ 'hidden sm:flex': fIdx >= 2 }">
                <UIcon :name="['i-lucide-zap', 'i-lucide-brain', 'i-lucide-infinity'][fIdx] || 'i-lucide-sparkles'" class="h-4 w-4 text-primary" />
                <span>{{ feature }}</span>
              </div>
            </template>
          </div>

          <!-- CTA Button -->
          <UButton
            to="/auth/login"
            color="secondary"
            size="xl"
            icon="i-lucide-message-circle"
            class="group w-full transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-secondary/25 sm:w-auto"
          >
            {{ brand.ai.ctaButton }}
            <template #trailing>
              <UIcon name="i-lucide-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </template>
          </UButton>

          <!-- Trust -->
          <p class="flex items-center gap-2 text-xs" :style="{ color: `rgb(var(--brand-overlay) / 0.4)` }">
            <UIcon name="i-lucide-shield-check" class="h-3 w-3" />
            7 dias grátis no Pro • Sem cartão pra começar
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()
</script>

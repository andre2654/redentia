<template>
  <section class="px-6 py-12 md:py-16">
    <div class="mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-10 text-center">
        <h2 class="mb-2 text-2xl md:text-3xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: brand.colors.text }">
          {{ config.sectionTitle }}
        </h2>
        <p class="text-sm md:text-base" :style="{ color: brand.colors.textMuted }">
          {{ config.sectionSubtitle }}
        </p>
      </div>

      <!-- Steps -->
      <div class="flex flex-col gap-3">
        <NuxtLink
          v-for="step in config.steps"
          :key="step.number"
          :to="step.ctaLink"
          class="group relative flex items-start gap-4 border p-4 transition-[transform,opacity,box-shadow,background-color,border-color,filter] brand-card-sm md:items-center md:gap-5 md:p-5"
          :style="stepStyle(step.status)"
        >
          <!-- Step number -->
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center text-sm font-bold brand-card-sm"
            :style="numberStyle(step.status)"
          >
            <UIcon v-if="step.status === 'locked'" name="i-lucide-lock" class="h-4 w-4" />
            <span v-else>{{ step.number }}</span>
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <div class="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
              <div class="flex items-center gap-2">
                <UIcon :name="step.icon" class="h-4 w-4 shrink-0" :style="{ color: step.status === 'locked' ? brand.colors.textMuted : brand.colors.primary }" />
                <h3 class="text-sm font-semibold md:text-base" :style="{ color: step.status === 'locked' ? brand.colors.textMuted : brand.colors.text }">
                  {{ step.title }}
                </h3>
              </div>
              <!-- Recommended badge -->
              <span
                v-if="step.status === 'recommended'"
                class="inline-flex w-fit items-center gap-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wider brand-card-sm"
                :style="{ backgroundColor: `${brand.colors.primary}1A`, color: brand.colors.primary }"
              >
                <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
                Proximo passo
              </span>
            </div>
            <p class="mt-1 text-xs leading-relaxed md:text-sm" :style="{ color: brand.colors.textMuted, opacity: step.status === 'locked' ? 0.6 : 1 }">
              {{ step.description }}
            </p>
          </div>

          <!-- CTA arrow -->
          <div class="hidden shrink-0 items-center gap-1 text-xs font-semibold transition-transform group-hover:translate-x-0.5 md:flex" :style="{ color: step.status === 'locked' ? brand.colors.textMuted : brand.colors.primary }">
            <span>{{ step.ctaText }}</span>
            <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5" />
          </div>
        </NuxtLink>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center text-xs" :style="{ color: brand.colors.textMuted }">
        {{ config.footerText }}
        <a :href="config.footerLink" target="_blank" rel="noopener" class="font-semibold underline underline-offset-2 transition-colors hover:opacity-80" :style="{ color: brand.colors.primary }">
          {{ config.footerLinkText }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()
const config = computed(() => brand.investorChecklist!)

function stepStyle(status: string) {
  const base = {
    backgroundColor: brand.colors.surface,
    borderColor: brand.colors.border,
  }
  if (status === 'recommended') {
    return {
      ...base,
      borderColor: `${brand.colors.primary}40`,
      backgroundColor: `${brand.colors.primary}08`,
    }
  }
  if (status === 'locked') {
    return {
      ...base,
      opacity: '0.6',
    }
  }
  return base
}

function numberStyle(status: string) {
  if (status === 'recommended') {
    return {
      backgroundColor: brand.colors.primary,
      color: brand.colors.background,
    }
  }
  if (status === 'locked') {
    return {
      backgroundColor: `${brand.colors.textMuted}1A`,
      color: brand.colors.textMuted,
    }
  }
  return {
    backgroundColor: `${brand.colors.primary}1A`,
    color: brand.colors.primary,
  }
}
</script>

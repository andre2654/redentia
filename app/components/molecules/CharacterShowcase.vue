<template>
  <section class="px-6 py-12 md:py-16">
    <div class="mx-auto max-w-5xl">
      <!-- Header -->
      <div class="mb-10 text-center">
        <h2 class="mb-2 text-2xl md:text-3xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: brand.colors.text }">
          {{ config.sectionTitle }}
        </h2>
        <p class="text-sm md:text-base" :style="{ color: brand.colors.textMuted }">
          {{ config.sectionSubtitle }}
        </p>
      </div>

      <!-- Characters Grid -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="char in config.items"
          :key="char.name"
          :to="char.ctaLink"
          class="group relative flex flex-col overflow-hidden border transition-[transform,opacity,box-shadow,background-color,border-color,filter] brand-card"
          :class="cardClass(char.personality)"
          :style="cardStyle(char)"
        >
          <!-- Personality glow -->
          <div
            class="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-40"
            :style="{ backgroundColor: char.color }"
          />

          <!-- Icon + Name -->
          <div class="relative flex items-center gap-3 p-5 pb-0">
            <div
              class="flex h-12 w-12 items-center justify-center brand-pill"
              :style="{ backgroundColor: `${char.color}26` }"
            >
              <UIcon :name="char.emoji" class="h-6 w-6" :style="{ color: char.color }" />
            </div>
            <div>
              <h3 class="text-lg font-bold" :style="{ color: brand.colors.text }">{{ char.name }}</h3>
              <p class="text-xs font-medium" :style="{ color: char.color }">{{ char.role }}</p>
            </div>
            <!-- Villain badge -->
            <span
              v-if="char.personality === 'villain'"
              class="ml-auto text-xs font-bold uppercase tracking-wider brand-pill px-2 py-0.5"
              :style="{ backgroundColor: `${char.color}1A`, color: char.color }"
            >
              Vilao
            </span>
          </div>

          <!-- Quote bubble -->
          <div class="relative mx-5 mt-4 p-3 brand-card-sm" :style="{ backgroundColor: `${char.color}0D` }">
            <p class="text-sm italic leading-relaxed" :style="{ color: `${brand.colors.text}CC` }">
              "{{ char.catchphrase }}"
            </p>
            <!-- Bubble tail -->
            <div
              class="absolute -bottom-1.5 left-6 h-3 w-3 rotate-45"
              :style="{ backgroundColor: `${char.color}0D` }"
            />
          </div>

          <!-- Description -->
          <p class="flex-1 px-5 pt-4 text-sm leading-relaxed" :style="{ color: brand.colors.textMuted }">
            {{ char.description }}
          </p>

          <!-- CTA -->
          <div class="flex items-center gap-2 px-5 pb-5 pt-4 text-sm font-semibold" :style="{ color: char.color }">
            <span>{{ char.cta }}</span>
            <UIcon name="i-lucide-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()
const config = computed(() => brand.characters!)

function cardClass(personality: string) {
  if (personality === 'villain') return 'border-dashed'
  return ''
}

function cardStyle(char: { color: string; personality: string }) {
  const base = {
    borderColor: char.personality === 'villain' ? `${char.color}40` : brand.colors.border,
    backgroundColor: brand.colors.surface,
  }
  return base
}
</script>

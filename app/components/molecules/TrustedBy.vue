<template>
  <section class="border-y py-10" :style="{ borderColor: brand.colors.border }">
    <p class="mb-8 text-center text-sm tracking-wide" :style="{ color: brand.colors.textMuted }">
      {{ brand.trustBar.text }}
    </p>
    <div 
      class="flex flex-wrap items-center justify-center gap-6 opacity-50 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 md:gap-10 lg:gap-12"
    >
      <!-- Placeholder logos das corretoras - usar SVGs reais quando disponíveis -->
      <div 
        v-for="partner in brand.trustBar.partners"
        :key="partner"
        class="flex items-center gap-2 transition-colors"
        :style="{ color: brand.colors.textMuted, '--hover-color': brand.colors.text }"
        @mouseenter="($event.currentTarget as HTMLElement).style.color = brand.colors.text"
        @mouseleave="($event.currentTarget as HTMLElement).style.color = brand.colors.textMuted"
      >
        <span class="text-lg font-bold tracking-tight md:text-xl">{{ partner }}</span>
      </div>
    </div>
    <p class="mt-6 text-center text-xs" :style="{ color: brand.colors.textMuted }">
      {{ brand.trustBar.footnote }}
    </p>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()
</script>

<template>
  <div class="flex items-center justify-center gap-2 bg-black/90 px-4 py-2 backdrop-blur-sm">
    <span class="mr-2 text-xs font-medium text-white/50">DEV Brand:</span>
    <button
      v-for="slug in allSlugs"
      :key="slug"
      type="button"
      class="rounded-full px-3 py-1 text-xs font-medium transition-all"
      :class="currentSlug === slug
        ? 'bg-white text-black'
        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'"
      @click="switchBrand(slug)"
    >
      {{ slug }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { currentSlug, switchBrand, allSlugs } = useBrandSwitcher()
</script>

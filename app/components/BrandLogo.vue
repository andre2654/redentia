<script setup lang="ts">
const brand = useBrand()

withDefaults(defineProps<{
  variant?: 'icon' | 'full'
  class?: string
  noBg?: boolean
}>(), {
  variant: 'full',
  noBg: false,
})

const needsBg = computed(() => brand.theme.mode === 'light')
</script>

<template>
  <!-- On light backgrounds, wrap logo in a colored pill/container -->
  <div
    v-if="needsBg && !noBg"
    class="inline-flex items-center justify-center brand-card-sm"
    :class="$props.class"
    :style="{ backgroundColor: brand.colors.logoBg || brand.colors.primary, padding: variant === 'icon' ? '6px' : '8px 16px' }"
  >
    <img
      :src="variant === 'icon' ? brand.logo.icon : brand.logo.full"
      :alt="brand.name"
      class="h-full w-auto object-contain"
    />
  </div>
  <img
    v-else
    :src="variant === 'icon' ? brand.logo.icon : brand.logo.full"
    :alt="brand.name"
    :class="$props.class"
    class="object-contain"
  />
</template>

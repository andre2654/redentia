<script setup lang="ts">
const brand = useBrand()

const props = withDefaults(defineProps<{
  variant?: 'icon' | 'full'
  class?: string
  noBg?: boolean
  /**
   * Force the surface mode used to pick the asset, ignoring the active
   * page theme. Useful when the logo sits on a coloured pill that is
   * the same colour in both themes (e.g. the install banner's primary
   * gradient circle, the AI CTA, founder cards). Pass:
   *   - `'dark'`  → logo will be the LIGHT-coloured asset (iconDark)
   *   - `'light'` → logo will be the DARK-coloured asset (iconLight)
   *   - `'auto'`  → follows the active theme (default)
   */
  mode?: 'auto' | 'dark' | 'light'
}>(), {
  variant: 'full',
  noBg: false,
  mode: 'auto',
})

// Resolve the actual asset path. When the brand ships mode-specific
// assets we use those; otherwise we fall back to the legacy single
// asset (`icon`/`full`) which was designed for dark surfaces.
const isLight = computed(() => {
  if (props.mode === 'light') return true
  if (props.mode === 'dark') return false
  return brand.theme.mode === 'light'
})

const logoSrc = computed(() => {
  const l = brand.logo
  if (props.variant === 'icon') {
    if (isLight.value) return l.iconLight ?? l.icon
    return l.iconDark ?? l.icon
  }
  if (isLight.value) return l.fullLight ?? l.full
  return l.fullDark ?? l.full
})

// Only the legacy single-asset path needs the coloured background pill
// in light mode (the asset was designed for dark surfaces). Mode-
// specific assets are already legible on either surface, so we render
// them flat without any container.
const hasModeSpecificAsset = computed(() => {
  const l = brand.logo
  if (props.variant === 'icon') return !!l.iconLight && !!l.iconDark
  return !!l.fullLight && !!l.fullDark
})

const needsBg = computed(() => isLight.value && !hasModeSpecificAsset.value)
</script>

<template>
  <!-- Light mode + legacy single-asset: wrap in a coloured pill so the
       white-on-dark logo stays readable on the cream surface. -->
  <div
    v-if="needsBg && !noBg"
    class="inline-flex items-center justify-center brand-card-sm"
    :class="$props.class"
    :style="{ backgroundColor: brand.colors.logoBg || brand.colors.primary, padding: variant === 'icon' ? '6px' : '8px 16px' }"
  >
    <img
      :src="logoSrc"
      :alt="brand.name"
      class="h-full w-auto object-contain"
    />
  </div>
  <!-- Mode-specific asset OR dark mode: render flat. -->
  <img
    v-else
    :src="logoSrc"
    :alt="brand.name"
    :class="$props.class"
    class="object-contain"
  />
</template>

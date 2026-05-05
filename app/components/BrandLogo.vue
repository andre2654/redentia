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
   *   - `'auto'`  → follows the active theme (default), no flash
   */
  mode?: 'auto' | 'dark' | 'light'
}>(), {
  variant: 'full',
  noBg: false,
  mode: 'auto',
})

const naturalWidth = computed(() => (props.variant === 'icon' ? 120 : 537))
const naturalHeight = computed(() => 120)

// Asset URLs for both modes — when the brand ships mode-specific
// assets we pick those, otherwise both slots fall back to the legacy
// single asset. We RESOLVE BOTH up-front (no `mode === 'light'`
// branching) so the template can render both <img>s and CSS toggles
// visibility based on the active <html class="light|dark"> — that
// path is the only one that survives Vue 3's hydration mismatch
// safeguard, which intentionally skips correcting :style/:src
// attributes that differ between SSR and client.
const lightAsset = computed(() => {
  const l = brand.logo
  if (props.variant === 'icon') return l.iconLight ?? l.icon
  return l.fullLight ?? l.full
})

const darkAsset = computed(() => {
  const l = brand.logo
  if (props.variant === 'icon') return l.iconDark ?? l.icon
  return l.fullDark ?? l.full
})

// True when the brand provides mode-specific assets for this variant.
// Determines whether we need the legacy coloured background pill —
// brands without dedicated light assets get a primary-coloured pill
// in light mode so the dark-on-dark logo stays legible.
const hasModeSpecificAsset = computed(() => {
  const l = brand.logo
  if (props.variant === 'icon') return !!l.iconLight && !!l.iconDark
  return !!l.fullLight && !!l.fullDark
})

// When forcing a single mode, render only that asset. Avoids paying
// the cost of loading both URLs when the consumer KNOWS they're on a
// fixed-colour surface (e.g. install banner, founder cards).
const forcedSrc = computed(() => {
  if (props.mode === 'light') return lightAsset.value
  if (props.mode === 'dark') return darkAsset.value
  return null
})

const padX = computed(() => (props.variant === 'icon' ? '6px' : '8px 16px'))
</script>

<template>
  <!-- Forced single mode (consumer knows the surface): render only one
       <img>, no CSS toggle needed. -->
  <img
    v-if="forcedSrc"
    :src="forcedSrc"
    :alt="brand.name"
    :width="naturalWidth"
    :height="naturalHeight"
    decoding="async"
    :class="[$props.class, 'object-contain']"
  />

  <!-- Legacy brand without mode-specific assets: needs the coloured pill
       in light mode (asset was designed for dark surfaces). The pill
       itself is rendered via a CSS-only show/hide on `html.light` so
       the SSR/client mismatch doesn't flash a pill in/out of existence
       during hydration. -->
  <span
    v-else-if="!hasModeSpecificAsset && !noBg"
    class="brand-logo-legacy inline-flex items-center justify-center brand-card-sm"
    :class="$props.class"
    :style="{
      backgroundColor: 'var(--brand-logo-bg, var(--brand-primary))',
      padding: padX,
    }"
  >
    <img
      :src="darkAsset"
      :alt="brand.name"
      :width="naturalWidth"
      :height="naturalHeight"
      decoding="async"
      class="h-full w-auto object-contain"
    />
  </span>

  <!-- Mode-specific assets (Redentia v3, etc): render BOTH imgs and let
       CSS toggle visibility via the global `html.light` / `html.dark`
       class set by useHead in plugins/brand.ts. This is the only path
       that survives hydration with zero flash — Vue 3 will NOT correct
       :src mismatches between SSR and client (intentional design), so
       we never let :src be reactive to mode. CSS cascade, on the other
       hand, re-resolves automatically when the html class flips. -->
  <span
    v-else
    class="brand-logo-stack inline-block"
    :class="$props.class"
  >
    <img
      :src="darkAsset"
      :alt="brand.name"
      :width="naturalWidth"
      :height="naturalHeight"
      decoding="async"
      class="brand-logo-asset brand-logo-asset--dark object-contain"
    />
    <img
      :src="lightAsset"
      :alt="brand.name"
      :width="naturalWidth"
      :height="naturalHeight"
      decoding="async"
      class="brand-logo-asset brand-logo-asset--light object-contain"
    />
  </span>
</template>

<style scoped>
/* The two stacked <img>s share the same slot — only one is visible at
 * a time. We don't use `position: absolute` because the consumer's
 * `class` (h-7, w-[150px], etc.) lives on the WRAPPER and needs to
 * dictate layout space. Instead, the hidden one uses `display: none`
 * so it doesn't take up space.
 *
 * Why not :hidden + :block on a single <img>? Because <img>'s width
 * and height are intrinsic to the loaded asset. Two stacked <img>s
 * with the same dimensions render at the same size; toggling display
 * triggers no relayout, no re-fetch, no flash.
 */

.brand-logo-stack {
  /* `inline-flex` so the wrapper hugs the inner <img> tightly and
     vertically centers it. NO `height: 100%` — that would inherit
     the PARENT'S height (e.g. a 100vh hero), making the logo
     absurdly tall. The consumer's class (h-7, h-8, w-[150px], etc.)
     drives sizing here; the wrapper just contains the imgs. */
  align-items: center;
  line-height: 0;
}

/* Imgs inherit the consumer-driven height of the wrapper, keeping
   intrinsic aspect ratio via width: auto. `max-height: 100%` is the
   key — without it the natural <img> height (120-537px) would push
   the wrapper open instead of the wrapper constraining the img. */
.brand-logo-asset {
  max-height: 100%;
  max-width: 100%;
  height: auto;
  width: auto;
}

/* Default (no mode class yet, or dark): show dark, hide light */
.brand-logo-asset--light {
  display: none;
}
.brand-logo-asset--dark {
  display: inline-block;
}
</style>

<style>
/* GLOBAL (not scoped) because we need to react to the `html.light`
 * class set by useHead in plugins/brand.ts — scoped CSS would
 * miss it (the html element is outside the component scope). */
html.light .brand-logo-asset--light {
  display: inline-block;
}
html.light .brand-logo-asset--dark {
  display: none;
}

/* Same rule for the legacy pill: only show it on light surfaces.
 * Dark mode users see the bare logo (asset was designed for that). */
html:not(.light) .brand-logo-legacy {
  background-color: transparent !important;
  padding: 0 !important;
}
</style>

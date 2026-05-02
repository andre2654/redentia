<!--
  ColorModeToggle — 3-state segmented pill (Auto / Light / Dark).

  Backed by `useColorMode()` from @nuxtjs/color-mode (transitively
  installed via @nuxt/ui). The module handles cookie persistence,
  the <html class="dark|light"> class, anti-flash on first paint
  and `prefers-color-scheme` reactivity automatically — this
  component just sets `colorMode.preference`.

  Visual: a single rounded-full surface with three icon-only
  segments. The active segment gets a primary-tinted background.
  Hover lifts the background tint slightly.

  Two sizes:
  - "compact" (default) — icon-only, fits sidebars and headers.
  - "labeled" — adds short labels next to icons; for settings pages.
-->
<template>
  <div
    v-if="supportsMultiMode"
    class="qs-mode-toggle inline-flex items-center gap-0.5 rounded-md border p-0.5"
    style="border-color: var(--border-default); background-color: var(--bg-input);"
    role="radiogroup"
    aria-label="Tema (claro, escuro ou automático)"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="preference === option.value"
      :aria-label="option.label"
      :title="option.label"
      class="qs-mode-segment inline-flex items-center justify-center gap-1.5 rounded-[4px] transition-all duration-150 focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring-focus)]"
      :class="[
        size === 'labeled' ? 'px-2.5 py-1 text-[12px] font-medium' : 'size-7',
        preference === option.value ? 'qs-mode-segment-active' : '',
      ]"
      :style="preference === option.value
        ? {
            backgroundColor: 'var(--brand-primary)',
            color: '#fff',
          }
        : { backgroundColor: 'transparent', color: 'var(--text-body)' }"
      @click="setPreference(option.value)"
    >
      <UIcon :name="option.icon" class="size-3.5 shrink-0" aria-hidden="true" />
      <span v-if="size === 'labeled'">{{ option.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
type Preference = 'system' | 'dark' | 'light'

defineProps<{
  size?: 'compact' | 'labeled'
}>()

const brand = useBrand()
// `useColorMode` is auto-imported by @nuxtjs/color-mode and exposes
// a reactive `preference` ref-like (system/dark/light) plus a
// resolved `value` getter we don't need here.
const colorMode = useColorMode()

// Hide the toggle for tenants that ship a single palette. Otherwise
// the user can pick "Auto / Light" but the tenant's brand stays dark
// (no light variant) — confusing UX. Multi-mode is identified by
// presence of `brand.themes` (light or dark variant).
const brandThemes = (brand as { themes?: { light?: object; dark?: object } }).themes
const supportsMultiMode = computed(() =>
  !!(brandThemes && (brandThemes.light || brandThemes.dark)),
)

const preference = computed<Preference>(() => {
  const p = colorMode.preference
  if (p === 'dark' || p === 'light') return p
  return 'system'
})

function setPreference(next: Preference) {
  if (next === 'system') {
    // Translate "Auto" to the current OS preference IMMEDIATELY,
    // storing it as a concrete `light` or `dark`. Avoids the
    // hydration-mismatch bug we had when preference stayed as
    // 'system' — SSR couldn't read prefers-color-scheme so it
    // rendered with defaultMode, while the client resolved to OS
    // pref. With this, the cookie always holds a concrete value
    // and SSR/client agree on every F5.
    const osDark =
      typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-color-scheme: dark)').matches
    colorMode.preference = osDark ? 'dark' : 'light'
    return
  }
  colorMode.preference = next
}

const options: Array<{ value: Preference; label: string; icon: string }> = [
  { value: 'system', label: 'Auto', icon: 'i-lucide-monitor' },
  { value: 'light', label: 'Claro', icon: 'i-lucide-sun' },
  { value: 'dark', label: 'Escuro', icon: 'i-lucide-moon' },
]
</script>

<style scoped>
.qs-mode-segment:not(.qs-mode-segment-active):hover {
  background-color: var(--bg-overlay) !important;
  color: var(--text-heading) !important;
}
.qs-mode-segment-active:hover {
  filter: brightness(0.92);
}
</style>

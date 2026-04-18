<template>
  <NuxtLink
    :to="disabled ? undefined : to"
    class="group flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left transition-all duration-200"
    :class="{
      'pointer-events-none cursor-not-allowed opacity-40': disabled,
      'ml-6 rounded-l-none border-l pl-4': isSubItem,
      'is-active': false,
    }"
    :style="{
      color: activeMatch ? brand.colors.secondary : `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
      backgroundColor: activeMatch ? `color-mix(in srgb, ${brand.colors.secondary} 12%, transparent)` : 'transparent',
      borderColor: activeMatch ? `color-mix(in srgb, ${brand.colors.secondary} 35%, transparent)` : 'transparent',
    }"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <UIcon
      v-if="icon"
      :name="icon"
      class="h-5 w-5 flex-shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
    />
    <span class="flex-1">{{ text }}</span>
    <UIcon
      v-if="disabled"
      name="i-lucide-lock"
      class="h-3.5 w-3.5 opacity-40"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isSubItem: {
    type: Boolean,
    default: false,
  },
})

const brand = useBrand()
const route = useRoute()

// Lightweight active matching — we can't rely on NuxtLink's `active-class`
// because we're driving styles inline for theme-aware colors. The match
// rules intentionally match what NuxtLink would do with `exact-active-class`.
const activeMatch = computed(() => {
  if (!props.to) return false
  // Normalize: strip trailing slash but preserve root as '/'. Without the
  // `|| '/'` fallback, to="/" collapses to '' and the sub-route check below
  // (`startsWith('' + '/')` = `startsWith('/')`) flags EVERY path as active —
  // so "Visão Geral" lit up alongside whichever item was truly active.
  const current = route.path.replace(/\/$/, '') || '/'
  const target = String(props.to).replace(/\/$/, '') || '/'
  if (current === target) return true
  // Sub-route: /wallet/anything matches /wallet
  if (target !== '/' && current.startsWith(target + '/')) return true
  return false
})

function onEnter(e: MouseEvent) {
  if (props.disabled || activeMatch.value) return
  const el = e.currentTarget as HTMLElement
  el.style.color = brand.colors.text
  el.style.backgroundColor = `color-mix(in srgb, ${brand.colors.text} 6%, transparent)`
  el.style.borderColor = `color-mix(in srgb, ${brand.colors.text} 10%, transparent)`
}

function onLeave(e: MouseEvent) {
  if (props.disabled || activeMatch.value) return
  const el = e.currentTarget as HTMLElement
  el.style.color = `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`
  el.style.backgroundColor = 'transparent'
  el.style.borderColor = 'transparent'
}
</script>

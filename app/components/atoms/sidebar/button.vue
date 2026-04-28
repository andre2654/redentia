<template>
  <NuxtLink
    :to="disabled ? undefined : to"
    class="group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors duration-150"
    :class="{
      'pointer-events-none cursor-not-allowed opacity-40': disabled,
      'ml-6 rounded-l-none pl-4': isSubItem,
    }"
    :style="{
      color: activeMatch ? brand.colors.text : `color-mix(in srgb, var(--brand-text) 60%, transparent)`,
      backgroundColor: activeMatch ? `color-mix(in srgb, var(--brand-text) 6%, transparent)` : 'transparent',
      fontWeight: activeMatch ? 500 : 400,
    }"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <span
      v-if="activeMatch"
      class="absolute inset-y-[6px] left-0 w-[2px] rounded-full"
      :style="{ backgroundColor: 'var(--brand-secondary)' }"
      aria-hidden="true"
    />
    <UIcon
      v-if="icon"
      :name="icon"
      class="h-4 w-4 flex-shrink-0 transition-opacity"
      :style="{ opacity: activeMatch ? 1 : 0.7 }"
    />
    <span class="flex-1 truncate">{{ text }}</span>
    <UIcon
      v-if="disabled"
      name="i-lucide-lock"
      class="h-3 w-3 opacity-40"
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

// Active if the current path equals the button target OR is a nested sub-route
// of it. Normalize trailing slash, and guard the root so `to="/"` doesn't
// light up for every other path (startsWith('/') would match anything).
const activeMatch = computed(() => {
  if (!props.to) return false
  const current = route.path.replace(/\/$/, '') || '/'
  const target = String(props.to).replace(/\/$/, '') || '/'
  if (current === target) return true
  if (target !== '/' && current.startsWith(target + '/')) return true
  return false
})

function onEnter(e: MouseEvent) {
  if (props.disabled || activeMatch.value) return
  const el = e.currentTarget as HTMLElement
  el.style.color = brand.colors.text
  el.style.backgroundColor = `color-mix(in srgb, ${brand.colors.text} 5%, transparent)`
}

function onLeave(e: MouseEvent) {
  if (props.disabled || activeMatch.value) return
  const el = e.currentTarget as HTMLElement
  el.style.color = `color-mix(in srgb, ${brand.colors.text} 60%, transparent)`
  el.style.backgroundColor = 'transparent'
}
</script>

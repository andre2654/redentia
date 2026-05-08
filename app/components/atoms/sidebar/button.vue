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
  /**
   * Quando true, active apenas se path for IGUAL a `to` (sem matching
   * de subrota). Use em items pai dentro de drawer com filhos
   * (ex: /settings vs /settings/integracoes — sem exact, "/settings"
   * fica ativo em todas as subpages).
   */
  exact: {
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

  // Separa path e query do `to` pra comparar cada um.
  // Items com query string (ex: /search?group=stocks vs /search?group=stocks&ch_min=0)
  // precisam matching estrito de query — sem isso, o pai /search ficaria
  // ativo em todas as subrotas e os filhos ativariam todos juntos.
  const [rawTargetPath, rawTargetQuery = ''] = String(props.to).split('?')
  const current = route.path.replace(/\/$/, '') || '/'
  const target = rawTargetPath.replace(/\/$/, '') || '/'

  // ---- Path ----
  let pathMatches = false
  if (current === target) {
    pathMatches = true
  } else if (!props.exact && target !== '/' && current.startsWith(target + '/')) {
    pathMatches = true
  }
  if (!pathMatches) return false

  // ---- Query (estrito) ----
  // Conjunto de chaves e valores tem que ser identico. Item sem query
  // so ativa em rota sem query; item com query so ativa quando todos os
  // params declarados batem exato com a rota.
  const targetParams = new URLSearchParams(rawTargetQuery)
  const targetKeys = Array.from(targetParams.keys())
  const routeKeys = Object.keys(route.query)
  if (routeKeys.length !== targetKeys.length) return false
  for (const [k, v] of targetParams.entries()) {
    if (String(route.query[k] ?? '') !== v) return false
  }

  return true
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

<!--
  MoleculesMobileMenuGroup — drawer colapsavel pra mobile. Auto-abre
  quando alguma rota dentro de `child-paths` esta ativa, igual ao
  AtomsSidebarGroup do desktop.

  Slot default: lista de <MoleculesMobileMenuItem :is-sub="true">.
-->
<template>
  <div class="mobile-group" :class="{ 'mobile-group--open': isOpen }">
    <button
      type="button"
      class="mobile-group__head"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <UIcon :name="icon" class="mobile-group__icon size-5" />
      <span class="mobile-group__label">{{ label }}</span>
      <UIcon
        name="i-lucide-chevron-down"
        class="mobile-group__chevron size-4"
        :class="{ 'mobile-group__chevron--rot': isOpen }"
      />
    </button>
    <Transition name="group-collapse">
      <div v-if="isOpen" class="mobile-group__body">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  icon: string
  childPaths: string[]
}>()

const route = useRoute()

// Auto-detect open state — aberto se a rota atual bate com algum
// child-path. Considera path E query (igual SidebarGroup desktop).
const matchesChild = computed(() => {
  const currentPath = route.path.replace(/\/$/, '') || '/'
  const currentQuery = route.query
  return props.childPaths.some(child => {
    const url = new URL(child, 'http://x')
    const childPath = url.pathname.replace(/\/$/, '') || '/'
    const childQuery = Object.fromEntries(url.searchParams.entries())
    if (currentPath !== childPath) return false
    if (Object.keys(childQuery).length === 0) return true
    return Object.entries(childQuery).every(([k, v]) => String(currentQuery[k] ?? '') === v)
  })
})

// Estado controlado: abre quando rota matches OU quando user toca pra abrir.
const userToggled = ref<boolean | null>(null)
const isOpen = computed(() => {
  if (userToggled.value !== null) return userToggled.value
  return matchesChild.value
})

function toggle() {
  userToggled.value = !isOpen.value
}

// Quando navega pra child path (ex: clicou num link interno e a rota
// mudou), reseta o controle manual pra que o auto-open funcione no
// proximo render.
watch(() => route.fullPath, () => {
  userToggled.value = null
})
</script>

<style scoped>
.mobile-group {
  display: flex;
  flex-direction: column;
}
.mobile-group__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 78%, transparent);
  font-size: 14.5px;
  text-align: left;
  cursor: pointer;
  min-height: 48px;
  transition: background-color 150ms;
}
.mobile-group__head:active {
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.mobile-group--open .mobile-group__head {
  color: var(--brand-text);
  font-weight: 500;
}
.mobile-group__icon {
  flex-shrink: 0;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.mobile-group--open .mobile-group__icon {
  color: var(--brand-primary);
}
.mobile-group__label {
  flex: 1;
}
.mobile-group__chevron {
  flex-shrink: 0;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
  transition: transform 200ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.mobile-group__chevron--rot {
  transform: rotate(180deg);
}
.mobile-group__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0 6px;
}

.group-collapse-enter-active,
.group-collapse-leave-active {
  transition: opacity 200ms ease, max-height 240ms cubic-bezier(0.2, 0.7, 0.3, 1);
  overflow: hidden;
}
.group-collapse-enter-from,
.group-collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.group-collapse-enter-to,
.group-collapse-leave-from {
  opacity: 1;
  max-height: 600px;
}
</style>

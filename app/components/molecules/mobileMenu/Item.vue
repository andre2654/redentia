<!--
  MoleculesMobileMenuItem — linha de navegacao do mobile menu. Tap target
  de 48px+ pra dedo, indicador ativo a esquerda em amber, opcional icone
  na esquerda.

  Props:
    - to: rota
    - label: texto
    - icon: lucide name (so renderiza se passar)
    - isSub: indenta + remove icone (sub-item de drawer)
    - exact: usa match exato (com query) em vez de prefix match
-->
<template>
  <NuxtLink
    :to="to"
    class="mobile-item"
    :class="{
      'mobile-item--sub': isSub,
      'mobile-item--active': isActive,
    }"
    @click="$emit('click', $event)"
  >
    <span
      v-if="isActive"
      class="mobile-item__bar"
      aria-hidden="true"
    />
    <UIcon
      v-if="icon && !isSub"
      :name="icon"
      class="mobile-item__icon size-5"
    />
    <span class="mobile-item__label">{{ label }}</span>
    <UIcon
      v-if="!isSub"
      name="i-lucide-chevron-right"
      class="mobile-item__chevron size-4"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  to: string
  label: string
  icon?: string
  isSub?: boolean
  exact?: boolean
}>()

defineEmits<{ click: [MouseEvent] }>()

const route = useRoute()

// Active match — replica logica do AtomsSidebarButton: exact compara
// path+query, nao-exact faz prefix match. Pra rotas com query string,
// reconstroi o fullPath e compara.
const isActive = computed(() => {
  const target = props.to.replace(/\/$/, '') || '/'
  const targetUrl = new URL(target, 'http://x')
  const targetPath = targetUrl.pathname.replace(/\/$/, '') || '/'
  const targetQuery = Object.fromEntries(targetUrl.searchParams.entries())
  const targetHasQuery = Object.keys(targetQuery).length > 0

  const currentPath = route.path.replace(/\/$/, '') || '/'

  if (props.exact) {
    if (currentPath !== targetPath) return false
    if (!targetHasQuery) return Object.keys(route.query).length === 0
    return Object.entries(targetQuery).every(([k, v]) => String(route.query[k] ?? '') === v)
  }

  // Sem exact: prefix path + se target tem query, todas devem bater.
  if (currentPath !== targetPath && !currentPath.startsWith(targetPath + '/')) return false
  if (targetHasQuery) {
    return Object.entries(targetQuery).every(([k, v]) => String(route.query[k] ?? '') === v)
  }
  return true
})
</script>

<style scoped>
.mobile-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  text-decoration: none;
  color: color-mix(in srgb, var(--brand-text) 78%, transparent);
  font-size: 14.5px;
  transition: background-color 150ms, color 150ms;
  min-height: 48px;
}
.mobile-item:active {
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.mobile-item--sub {
  padding-left: 40px;
  font-size: 13.5px;
  min-height: 42px;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}
.mobile-item--active {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  color: var(--brand-text);
  font-weight: 500;
}
.mobile-item--sub.mobile-item--active {
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  color: var(--brand-primary);
}
.mobile-item__bar {
  position: absolute;
  left: 4px;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 999px;
  background: var(--brand-primary);
}
.mobile-item__icon {
  flex-shrink: 0;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.mobile-item--active .mobile-item__icon {
  color: var(--brand-primary);
}
.mobile-item__label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mobile-item__chevron {
  flex-shrink: 0;
  color: color-mix(in srgb, var(--brand-text) 35%, transparent);
}
</style>

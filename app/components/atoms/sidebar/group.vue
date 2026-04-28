<!--
  AtomsSidebarGroup

  Wrapper colapsável pra agrupar sub-itens na sidebar. Segue o mesmo
  estilo do AtomsSidebarButton (rounded-md, compacto, hover sutil) e
  mantém o estado aberto/fechado local — se qualquer filho estiver
  ativo, o grupo abre automaticamente.
-->
<template>
  <div class="flex flex-col">
    <button
      type="button"
      class="group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors duration-150"
      :style="{
        color: `color-mix(in srgb, var(--brand-text) 60%, transparent)`,
      }"
      :aria-expanded="open"
      @click="toggle"
      @mouseover="(e) => { const el = e.currentTarget as HTMLElement; el.style.color = brand.colors.text; el.style.backgroundColor = `color-mix(in srgb, var(--brand-text) 5%, transparent)` }"
      @mouseleave="(e) => { const el = e.currentTarget as HTMLElement; el.style.color = `color-mix(in srgb, var(--brand-text) 60%, transparent)`; el.style.backgroundColor = 'transparent' }"
    >
      <UIcon
        v-if="icon"
        :name="icon"
        class="h-4 w-4 flex-shrink-0 opacity-70"
      />
      <span class="flex-1 truncate">{{ label }}</span>
      <UIcon
        name="i-lucide-chevron-right"
        class="h-3.5 w-3.5 flex-shrink-0 opacity-60 transition-transform duration-200"
        :class="{ 'rotate-90': open }"
      />
    </button>

    <Transition
      enter-active-class="transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[800px] opacity-100"
      leave-active-class="transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-150 ease-in"
      leave-from-class="max-h-[800px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-show="open" class="overflow-hidden">
        <div class="mt-0.5 flex flex-col gap-0.5 pb-1">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  icon?: string
  /** Lista de paths filhos — se a rota atual bate com algum, abrimos por default */
  childPaths?: string[]
  /** Força aberto ao montar, independente da rota */
  defaultOpen?: boolean
}>()

const brand = useBrand()
const route = useRoute()

// Auto-abre se a rota atual é filha do grupo (inclui query matching pra sub-grupos
// de /search?group=stocks vs /search?crypto=1).
const hasActiveChild = computed(() => {
  const paths = props.childPaths ?? []
  if (!paths.length) return false
  const current = route.fullPath
  return paths.some((p) => {
    const base = p.split('?')[0].replace(/\/$/, '') || '/'
    const curBase = route.path.replace(/\/$/, '') || '/'
    if (base !== curBase && !(base !== '/' && curBase.startsWith(base + '/'))) return false
    if (!p.includes('?')) return true
    // Query match: todas as chaves declaradas precisam bater na rota atual
    const declared = new URLSearchParams(p.split('?')[1] || '')
    for (const [k, v] of declared.entries()) {
      if ((route.query[k] ?? '') !== v) return false
    }
    return true
  })
})

const open = ref(props.defaultOpen || hasActiveChild.value)

// Quando a rota muda e um filho fica ativo, abre o grupo; não fecha
// automaticamente pra não surpreender o usuário que abriu manualmente.
watch(hasActiveChild, (active) => {
  if (active) open.value = true
})

function toggle() {
  open.value = !open.value
}
</script>

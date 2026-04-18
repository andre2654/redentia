<template>
  <div
    class="relative min-h-screen"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Background grid (subtle, terminal-consistent) -->
    <div class="pointer-events-none fixed inset-0">
      <div
        class="absolute inset-0 opacity-[0.03]"
        :style="{ backgroundImage: `linear-gradient(${brand.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${brand.colors.text} 1px, transparent 1px)`, backgroundSize: '32px 32px' }"
      />
    </div>

    <!-- Docs header, sticky top bar with logo + main nav -->
    <header
      class="sticky top-0 z-40 border-b backdrop-blur-xl"
      :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.background}CC` }"
    >
      <div class="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-6 px-4 md:px-6">
        <NuxtLink to="/api-portal" class="flex items-center gap-2">
          <div
            class="flex size-7 items-center justify-center rounded"
            :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
          >
            <UIcon name="i-lucide-terminal" class="size-4" />
          </div>
          <span class="font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em]" :style="{ color: brand.colors.text }">
            REDENTIA<span :style="{ color: brand.colors.primary }">.API</span>
          </span>
        </NuxtLink>

        <nav class="hidden items-center gap-5 md:flex">
          <NuxtLink to="/api-portal" class="font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-70" :style="{ color: brand.colors.textMuted }">
            Preços
          </NuxtLink>
          <NuxtLink to="/api-portal/docs" class="font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors" :style="{ color: brand.colors.text }">
            Docs
          </NuxtLink>
          <a href="#" class="font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-70" :style="{ color: brand.colors.textMuted }">
            FAQ
          </a>
        </nav>

        <div class="flex-1" />

        <NuxtLink
          to="/api-portal/auth/login"
          class="hidden font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-70 sm:inline"
          :style="{ color: brand.colors.textMuted }"
        >
          Entrar
        </NuxtLink>
        <NuxtLink
          to="/api-portal/auth/register"
          class="inline-flex items-center gap-2 rounded border-2 px-4 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.18em] transition-all hover:-translate-y-0.5"
          :style="{
            backgroundColor: brand.colors.primary,
            color: brand.colors.background,
            borderColor: brand.colors.primary,
          }"
        >
          <UIcon name="i-lucide-key" class="size-3" />
          Chave de API
        </NuxtLink>
      </div>
    </header>

    <!-- Main 3-col grid -->
    <div class="relative mx-auto flex w-full max-w-[1600px] gap-8 px-4 md:px-6">
      <!-- ============ LEFT SIDEBAR ============ -->
      <aside
        class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r py-8 pr-4 lg:block"
        :style="{ borderColor: brand.colors.border }"
      >
        <!-- Search -->
        <div
          class="mb-6 flex items-center gap-2 rounded border px-3 py-2 font-mono-tab text-[11px]"
          :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}80`, color: brand.colors.textMuted }"
        >
          <UIcon name="i-lucide-search" class="size-3.5" />
          <input
            type="text"
            placeholder="Pesquisar..."
            class="flex-1 bg-transparent outline-none"
            :style="{ color: brand.colors.text }"
          />
          <kbd
            class="rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
            :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
          >
            ⌘K
          </kbd>
        </div>

        <!-- Begin -->
        <div class="mb-6">
          <div class="mb-2 px-2 font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
            [ COMEÇANDO ]
          </div>
          <ul class="flex flex-col gap-0.5">
            <li>
              <NuxtLink
                to="/api-portal/docs"
                class="flex items-center gap-2 rounded px-2 py-1.5 text-[13px] transition-colors"
                :style="{
                  color: currentPath === '/api-portal/docs' ? brand.colors.primary : brand.colors.textMuted,
                  backgroundColor: currentPath === '/api-portal/docs' ? `${brand.colors.primary}15` : 'transparent',
                }"
              >
                <UIcon name="i-lucide-hand" class="size-3.5" />
                <span>Introdução</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Endpoints grouped by category -->
        <div>
          <div class="mb-2 px-2 font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
            [ ENDPOINTS ]
          </div>
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="mb-2"
          >
            <button
              @click="toggleCategory(cat.id)"
              class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] transition-colors hover:opacity-80"
              :style="{ color: brand.colors.text }"
            >
              <UIcon :name="cat.icon" class="size-3.5" :style="{ color: brand.colors.primary }" />
              <span class="flex-1 font-semibold">{{ cat.label }}</span>
              <UIcon
                name="i-lucide-chevron-down"
                class="size-3 transition-transform"
                :class="expandedCategories.has(cat.id) ? '' : '-rotate-90'"
                :style="{ color: brand.colors.textMuted }"
              />
            </button>
            <ul v-if="expandedCategories.has(cat.id)" class="ml-2 mt-0.5 flex flex-col gap-0.5 border-l pl-3" :style="{ borderColor: brand.colors.border }">
              <li v-for="endpoint in cat.endpoints" :key="endpoint.slug">
                <NuxtLink
                  :to="`/api-portal/docs/${endpoint.slug}`"
                  class="group flex items-center gap-2 rounded py-1 pl-2 pr-2 text-[12px] transition-colors"
                  :style="{
                    color: currentPath.endsWith('/' + endpoint.slug) ? brand.colors.primary : brand.colors.textMuted,
                    backgroundColor: currentPath.endsWith('/' + endpoint.slug) ? `${brand.colors.primary}15` : 'transparent',
                  }"
                >
                  <span class="flex-1 truncate">{{ endpoint.title }}</span>
                  <span
                    class="shrink-0 rounded px-1 py-0 font-mono-tab text-[9px] font-bold"
                    :style="{
                      color: brand.colors.positive,
                      backgroundColor: `${brand.colors.positive}15`,
                    }"
                  >
                    {{ endpoint.method }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <!-- ============ MAIN CONTENT ============ -->
      <main class="min-w-0 flex-1 py-10 md:py-14">
        <slot />
      </main>

      <!-- ============ RIGHT SIDEBAR (ToC) ============ -->
      <aside
        v-if="toc && toc.length > 0"
        class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto py-10 xl:block"
      >
        <div class="mb-3 flex items-center gap-2 font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
          <UIcon name="i-lucide-list" class="size-3" />
          ÍNDICE
        </div>
        <ul class="flex flex-col gap-0.5 border-l" :style="{ borderColor: brand.colors.border }">
          <li v-for="item in toc" :key="item.id">
            <a
              :href="`#${item.id}`"
              class="block border-l-2 py-1 pl-3 text-[12px] leading-snug transition-colors hover:opacity-100"
              :style="{
                borderColor: activeTocId === item.id ? brand.colors.primary : 'transparent',
                color: activeTocId === item.id ? brand.colors.primary : brand.colors.textMuted,
                paddingLeft: item.level === 3 ? '1.5rem' : '0.75rem',
                marginLeft: '-1px',
              }"
              @click="onTocClick(item.id)"
            >
              {{ item.text }}
            </a>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TocItem {
  id: string
  text: string
  level: number
}

defineProps<{
  toc?: TocItem[]
}>()

const brand = useBrand()
const route = useRoute()
const { categories } = useApiDocs()

const currentPath = computed(() => route.path)

// Sidebar category accordion state, everything open by default so
// the first-time visitor sees the full surface area immediately.
const expandedCategories = ref<Set<string>>(new Set(categories.map((c) => c.id)))

function toggleCategory(id: string) {
  if (expandedCategories.value.has(id)) {
    expandedCategories.value.delete(id)
  } else {
    expandedCategories.value.add(id)
  }
  expandedCategories.value = new Set(expandedCategories.value)
}

// Active ToC item driven by scroll position. Uses IntersectionObserver
// so it's cheap even on long pages.
const activeTocId = ref<string>('')

function onTocClick(id: string) {
  activeTocId.value = id
}

onMounted(() => {
  if (typeof window === 'undefined') return
  const headings = Array.from(document.querySelectorAll<HTMLElement>('[data-toc-heading]'))
  if (headings.length === 0) return

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeTocId.value = entry.target.id
        }
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0.1 }
  )

  for (const h of headings) observer.observe(h)

  onBeforeUnmount(() => observer.disconnect())
})
</script>

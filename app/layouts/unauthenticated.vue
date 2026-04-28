<template>
  <!-- Use the CSS var (var(--brand-background)) instead of the reactive
       `brand.colors.background`. Inline `:style` bindings get FROZEN
       at SSR-rendered values when the mode resolves differently on
       client (system pref + OS != defaultMode) — Vue 3's hydration
       intentionally skips DOM correction for mismatched inline styles.
       The CSS var, on the other hand, is updated by useHead's <style>
       tag innerHTML and DOES propagate post-hydration. -->
  <div
    class="flex min-h-screen flex-col"
    :style="{ backgroundColor: brand.colors.background, paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }"
  >
    <!-- Skip link: visible only on focus, jumps screen-reader/keyboard users past the ticker+nav -->
    <a
      href="#main-content"
      class="sr-only fixed left-4 top-4 z-[100] rounded-md px-4 py-2 font-semibold shadow-lg focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-offset-2"
      :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
    >
      Pular para o conteúdo principal
    </a>
    <MoleculesMobileMenuOverlay v-model:open="menuMobileActive" mode="public" />
    <header
      class="z-20 flex items-center justify-between gap-6 border-b px-8 py-4"
      :class="brand.hero?.variant === 'institutional' || brand.hero?.variant === 'editorial' ? '' : 'sticky top-0 backdrop-blur-xl'"
      :style="{
        background: headerBg || (brand.colors.background + 'E6'),
        borderColor: hexWithAlpha(brand.colors.border, 'CC'),
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
      }"
    >
      <!-- Logo + Menu mobile -->
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border transition md:hidden"
          :style="{
            borderColor: brand.colors.border,
            backgroundColor: brand.colors.surface,
            color: brand.colors.text,
          }"
          aria-label="Abrir menu"
          @click="menuMobileActive = true"
        >
          <UIcon name="i-lucide-menu" class="size-5" />
        </button>
        <slot name="header-branding">
          <NuxtLink to="/" class="transition-opacity hover:opacity-80">
            <BrandLogo variant="full" class="h-7 w-auto md:h-8" />
          </NuxtLink>
        </slot>
      </div>

      <!-- Navigation Desktop -->
      <nav class="hidden flex-1 items-center gap-10 lg:flex">
        <!-- Nav groups — editorial text links -->
        <div class="flex items-center gap-7">
        <div
          v-for="group in navGroups"
          :key="group.key"
          class="relative"
          @mouseenter="openedMenu = group.key"
          @mouseleave="openedMenu = null"
        >
          <button
            type="button"
            class="group flex items-center gap-1.5 py-2 text-[13px] tracking-[0.01em] transition-colors"
            :style="{
              color: openedMenu === group.key ? brand.colors.text : brand.colors.textMuted,
            }"
          >
            <span class="relative">
              {{ group.label.toLowerCase() }}
              <span
                class="absolute -bottom-0.5 left-0 h-px transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-300 ease-out"
                :style="{
                  width: openedMenu === group.key ? '100%' : '0%',
                  backgroundColor: brand.colors.primary,
                }"
              />
            </span>
            <UIcon
              name="i-lucide-chevron-down"
              class="h-3 w-3 opacity-50 transition-transform duration-200"
              :class="openedMenu === group.key ? 'rotate-180 opacity-80' : ''"
            />
          </button>

          <!-- Dropdown panel: mega (multi-column) or simple (single-column) -->
          <div
            v-if="openedMenu === group.key"
            class="absolute top-full z-30 pt-2"
            :style="{
              width: `${group.width}px`,
              left: group.kind === 'mega' ? '0' : '50%',
              transform: group.kind === 'mega' ? 'none' : 'translateX(-50%)',
            }"
          >
            <div
              class="overflow-hidden rounded-xl border"
              :style="{
                borderColor: brand.colors.border,
                backgroundColor: brand.colors.surface,
                boxShadow: brand.theme?.mode === 'dark' ? '0 20px 60px rgba(0,0,0,0.65)' : '0 20px 50px rgba(15,23,42,0.12)',
              }"
            >
              <!-- MEGA MENU: columns of headings + items -->
              <div
                v-if="group.kind === 'mega'"
                class="grid"
                :style="{ gridTemplateColumns: `repeat(${group.columns.length}, minmax(0, 1fr))` }"
              >
                <div
                  v-for="(col, colIdx) in group.columns"
                  :key="col.heading"
                  class="flex flex-col gap-0.5 px-5 py-5"
                  :style="{ borderLeft: colIdx > 0 ? `1px solid ${brand.colors.border}` : 'none' }"
                >
                  <span
                    class="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em]"
                    :style="{ color: brand.colors.primary }"
                  >
                    {{ col.heading }}
                  </span>
                  <NuxtLink
                    v-for="item in col.items"
                    :key="item.to"
                    :to="item.to"
                    class="group/item -mx-2 flex items-center justify-between rounded px-2 py-1.5 text-[13px] leading-snug transition-colors"
                    :style="{ color: brand.colors.text }"
                    @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = hexWithAlpha(brand.colors.text, '08')"
                    @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
                  >
                    <span>{{ item.label }}</span>
                    <span
                      class="-mr-1 translate-x-[-4px] opacity-0 transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                      :style="{ color: brand.colors.primary }"
                    >→</span>
                  </NuxtLink>
                </div>
              </div>

              <!-- SIMPLE MENU: single list -->
              <div v-else class="flex flex-col gap-0.5 p-2">
                <NuxtLink
                  v-for="item in group.items"
                  :key="item.to"
                  :to="item.to"
                  class="group/item flex items-center justify-between rounded px-3 py-2 text-[13px] transition-colors"
                  :style="{ color: brand.colors.text }"
                  @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = hexWithAlpha(brand.colors.text, '08')"
                  @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
                >
                  <span>{{ item.label }}</span>
                  <span
                    class="translate-x-[-4px] opacity-0 transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                    :style="{ color: brand.colors.primary }"
                  >→</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
        </div>

        <!-- Right-side actions -->
        <div class="ml-auto flex items-center gap-5">
          <!-- Color mode toggle (Auto / Light / Dark) -->
          <AtomsColorModeToggle />

          <!-- IA CTA — understated text link with pulse dot -->
          <NuxtLink
            to="/help"
            class="group flex items-center gap-2 text-[13px] transition-colors"
            :style="{ color: brand.colors.textMuted }"
            @mouseenter="($event.currentTarget as HTMLElement).style.color = brand.colors.secondary"
            @mouseleave="($event.currentTarget as HTMLElement).style.color = brand.colors.textMuted"
          >
            <span class="relative flex size-1.5">
              <span
                class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-60"
                :style="{ backgroundColor: brand.colors.secondary }"
              />
              <span
                class="relative inline-flex size-1.5 rounded-full"
                :style="{ backgroundColor: brand.colors.secondary }"
              />
            </span>
            <span class="tracking-[0.01em]">{{ brand.nav.headerAI }}</span>
          </NuxtLink>

          <!-- Entrar — primary CTA quiet style. Radius 6px, weight 500.
               Texto fixado em #1A0A2E (deep aubergine, contraste >= 7:1
               sobre amber em qualquer tenant). Hover via filter brightness
               para preservar saturacao da marca. Focus ring amber. -->
          <NuxtLink
            to="/auth/login"
            class="group inline-flex items-center gap-2 rounded-md px-5 py-2 text-[14px] font-medium leading-none transition-all duration-200 focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring-focus)] active:translate-y-px"
            style="background-color: var(--brand-primary); color: #1A0A2E;"
            @mouseenter="($event.currentTarget as HTMLElement).style.filter = 'brightness(0.92)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.filter = 'brightness(1)'"
          >
            <span>{{ brand.nav.login }}</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </NuxtLink>
        </div>
      </nav>

      <!-- Tablet -->
      <div class="flex items-center gap-2 max-sm:hidden lg:hidden">
        <UButton
          to="/auth/login"
          color="secondary"
          size="sm"
          class="rounded-full px-5 font-medium"
        >
          {{ brand.nav.login }}
        </UButton>
      </div>
    </header>

    <main
      id="main-content"
      class="md:px-4 md:py-4"
      :style="{ scrollMarginTop: '80px' }"
    >
      <slot />
    </main>
    <!-- Global floating quick search (public layout) — hidden on
         /help where the page is its own search/chat surface. -->
    <MoleculesQuickSearch v-if="$route.path !== '/help'" />
  </div>
  <Footer />
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: 'Static Page',
  },
  headerBg: {
    type: String,
    default: '',
  },
})

const brand = useBrand()
const menuMobileActive = ref(false)

function hexWithAlpha(hex: string, alpha: string): string {
  return `${hex}${alpha}`
}

type NavKey = 'explore' | 'rankings' | 'tools'
const openedMenu = ref<NavKey | null>(null)

interface NavItem { label: string; to: string; description?: string }
interface NavColumn { heading: string; items: NavItem[] }

const navGroups = computed<Array<
  | { key: NavKey; label: string; kind: 'mega'; width: number; columns: NavColumn[] }
  | { key: NavKey; label: string; kind: 'simple'; width: number; items: NavItem[] }
>>(() => [
  {
    key: 'explore',
    label: 'Explorar',
    kind: 'mega',
    width: 760,
    columns: [
      {
        heading: 'Renda Variável',
        items: [
          { label: 'Todos os ativos', to: '/search' },
          { label: 'Todas as ações', to: '/search?group=stocks' },
          { label: 'Ações em alta hoje', to: '/search?group=stocks&ch_min=0' },
          { label: 'Ações em queda hoje', to: '/search?group=stocks&ch_max=0' },
          { label: 'Small caps', to: '/search?group=stocks&mc_max=2000000000' },
          { label: 'Preço baixo (até R$ 20)', to: '/search?group=stocks&p_max=20' },
        ],
      },
      {
        heading: 'FIIs & Internacional',
        items: [
          { label: 'Todos os FIIs', to: '/search?group=reits' },
          { label: 'FIIs em alta', to: '/search?group=reits&ch_min=0' },
          { label: 'FIIs em queda', to: '/search?group=reits&ch_max=0' },
          { label: 'BDRs', to: '/search?group=bdrs' },
          { label: 'ETFs', to: '/search?group=etfs' },
        ],
      },
      {
        heading: 'Renda Fixa & Cripto',
        items: [
          { label: 'Tesouro IPCA+', to: '/search?indexer=IPCA' },
          { label: 'Tesouro SELIC', to: '/search?indexer=SELIC' },
          { label: 'Tesouro Prefixado', to: '/search?indexer=PREFIXADO' },
          { label: 'Criptos por Market Cap', to: '/search?crypto=1&sort=MCAP' },
          { label: 'Criptos em alta 24h', to: '/search?crypto=1&sort=UP' },
          { label: 'Criptos em queda 24h', to: '/search?crypto=1&sort=DOWN' },
        ],
      },
    ],
  },
  {
    key: 'rankings',
    label: 'Rankings',
    kind: 'simple',
    width: 280,
    items: [
      { label: 'Maiores altas do mês', to: '/ranking/maiores-altas-mes' },
      { label: 'Maiores baixas do mês', to: '/ranking/maiores-baixas-mes' },
      { label: 'Maiores dividend yield', to: '/ranking/maiores-dividend-yield' },
      { label: 'Calendário de dividendos', to: '/dividendos/calendario' },
    ],
  },
  {
    key: 'tools',
    label: 'Ferramentas',
    kind: 'simple',
    width: 260,
    items: [
      { label: 'Calculadoras', to: '/calculadora' },
      { label: 'Análise setorial', to: '/setor' },
      { label: 'Guias e conteúdo', to: '/guias' },
    ],
  },
])
</script>

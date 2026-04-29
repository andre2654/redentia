<template>
  <MoleculesMobileMenuOverlay v-model:open="menuMobileActive" mode="auth" />


  <!-- Layout, both wrapper + sidebar carry an explicit brand background so
       the whole shell flips together via Vue reactivity. Without this, the
       sidebar inherits from <body> which is set via CSS vars injected in
       plugins/brand.ts, and that injection path can lag behind the reactive
       updates when a tenant changes (producing mixed Redentia-dark sidebar
       with Norte-cream main content). -->
  <div
    class="flex w-full"
    :class="hideFooter ? 'h-screen overflow-hidden' : 'min-h-screen'"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Sidebar Desktop — Redentia × Stripe-style. Same visual language
         as the chat sidebar (ChatV2Sidebar): solid brand-surface
         background, amber-tinted shadows, eyebrow-driven section
         labels, full BrandLogo lockup, amber primary CTA at the top. -->
    <aside
      class="platform-sidebar sticky top-0 flex h-screen w-[260px] min-w-[260px] flex-col border-r max-xl:hidden"
      :style="{
        backgroundColor: brand.colors.surface,
        borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
      }"
    >
      <!-- Header: brand lockup full -->
      <header class="shrink-0 px-4 pt-5 pb-3">
        <NuxtLink
          to="/"
          class="platform-brand-mark inline-flex items-center transition-transform"
          aria-label="Home"
        >
          <BrandLogo variant="full" mode="auto" class="h-7 w-auto" />
        </NuxtLink>
      </header>

      <!-- Portfolio snapshot — Mission Control card. Shows current
           wallet value with reveal masking. Skeleton while loading,
           CTA when empty, hidden when unauthenticated. The whole card
           is a NuxtLink to /wallet so the snapshot doubles as a quick
           jump into the carteira page. -->
      <div v-if="authStore.me" class="shrink-0 px-3 pb-3">
        <NuxtLink
          to="/wallet"
          class="platform-snapshot-card group block rounded-xl border p-3 transition-[border-color,background-color,box-shadow]"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.background} 55%, transparent)`,
            borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
          }"
        >
          <div class="flex items-center justify-between">
            <span class="platform-sidebar-eyebrow !mb-0 !p-0">Patrimônio</span>
            <span
              v-if="portfolio.loaded && portfolio.value !== null"
              class="flex items-center gap-1 font-mono-tab text-[10px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: brand.colors.positive }"
            >
              <span
                class="inline-block size-1.5 rounded-full"
                :style="{ backgroundColor: brand.colors.positive }"
              />
              Live
            </span>
          </div>

          <!-- Loading skeleton -->
          <div
            v-if="!portfolio.loaded"
            class="platform-skeleton mt-1.5 h-7 w-32 rounded"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.text} 8%, transparent)`,
            }"
          />

          <!-- Empty / error state — CTA to seed wallet -->
          <template v-else-if="portfolio.value === null">
            <div
              class="mt-1.5 text-[14px] font-medium"
              :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
            >Adicione seu 1º ativo</div>
            <div
              class="mt-1 flex items-center gap-1 text-[12px]"
              :style="{ color: brand.colors.primary }"
            >
              Ir pra carteira
              <UIcon name="i-lucide-arrow-right" class="size-3" />
            </div>
          </template>

          <!-- Loaded state — value + ver carteira hint -->
          <template v-else>
            <div
              class="mt-1.5 font-mono-tab text-[22px] font-light tabular-nums"
              :style="{ color: brand.colors.text, letterSpacing: '-0.02em' }"
            >
              {{ portfolioDisplay }}
            </div>
            <div
              class="mt-1 flex items-center justify-between gap-2 text-[10.5px]"
              :style="{
                color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
              }"
            >
              <span class="font-mono-tab" style="letter-spacing: 0.04em">
                {{ portfolio.positions }}
                {{ portfolio.positions === 1 ? 'ativo' : 'ativos' }}
              </span>
              <span class="flex items-center gap-1 transition-colors group-hover:!text-[color:var(--brand-primary)]">
                Ver carteira
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-3 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </template>
        </NuxtLink>
      </div>

      <!-- Primary AI CTA — amber solid, mirrors the chat sidebar CTA -->
      <div v-if="authStore.me?.role !== 'advisor'" class="shrink-0 px-3 pb-3">
        <NuxtLink
          to="/help"
          class="platform-ai-cta group flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium transition-[background-color,box-shadow,transform]"
          :style="{
            backgroundColor: brand.colors.primary,
            color: brand.colors.background,
            boxShadow: `0 8px 18px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent), 0 4px 10px -6px rgba(0,0,0,0.10)`,
          }"
        >
          <UIcon
            name="i-lucide-sparkles"
            class="h-4 w-4 shrink-0"
            :style="{ color: brand.colors.background }"
          />
          <span class="flex-1 text-center" :style="{ letterSpacing: '-0.005em' }">
            {{ brand.sidebar.aiCtaTitle }}
          </span>
          <UIcon
            name="i-lucide-arrow-up-right"
            class="h-3.5 w-3.5 opacity-80 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            :style="{ color: brand.colors.background }"
          />
        </NuxtLink>
      </div>

      <!-- Quick actions: 2x2 grid for the most-traveled routes. Each
           card is a real NuxtLink with the route's brand-tinted icon
           + label + meta line. Hidden for advisors who navigate via a
           different surface. -->
      <div v-if="authStore.me?.role !== 'advisor'" class="shrink-0 px-3 pb-3">
        <div class="grid grid-cols-2 gap-2">
          <NuxtLink
            v-for="qa in quickActions"
            :key="qa.label"
            :to="qa.to"
            class="platform-quick-action group flex flex-col items-start gap-1.5 rounded-lg border px-2.5 py-2 text-left transition-[border-color,background-color]"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.background} 35%, transparent)`,
              borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
            }"
          >
            <span
              class="flex size-7 items-center justify-center rounded-md"
              :style="{ backgroundColor: `color-mix(in srgb, ${qa.tint} 14%, transparent)` }"
            >
              <UIcon :name="qa.icon" class="size-4" :style="{ color: qa.tint }" />
            </span>
            <div class="flex w-full flex-col leading-tight">
              <span
                class="text-[12px] font-medium"
                :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
              >{{ qa.label }}</span>
              <span
                class="font-mono-tab text-[10px]"
                :style="{ color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)` }"
              >{{ qa.meta }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Scrollable nav body — sections separated by eyebrows that
           match the chat sidebar's typographic rhythm. -->
      <nav class="platform-sidebar-body flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-3">
        <!-- ===== Menu ===== -->
        <section class="flex flex-col gap-0.5">
          <span class="platform-sidebar-eyebrow">{{ brand.nav.menuLabel }}</span>
          <AtomsSidebarButton to="/" :text="brand.nav.overview" icon="i-lucide-layout-dashboard" />
          <AtomsSidebarButton to="/wallet" :text="brand.nav.wallet" icon="i-lucide-wallet" />
          <AtomsSidebarButton to="/help" :text="brand.nav.chat" icon="i-lucide-message-circle" />
          <AtomsSidebarButton v-if="authStore.me?.role === 'advisor'" to="/advisor" :text="brand.nav.advisorArea" icon="i-lucide-users" />
          <AtomsSidebarButton to="/settings" :text="brand.nav.settings" icon="i-lucide-settings" />
        </section>

        <!-- ===== Explorar ===== -->
        <section class="flex flex-col gap-0.5">
          <span class="platform-sidebar-eyebrow">Explorar</span>
          <AtomsSidebarGroup
            label="Renda Variável"
            icon="i-lucide-trending-up"
            :child-paths="[
              '/search',
              '/search?group=stocks',
              '/search?group=stocks&ch_min=0',
              '/search?group=stocks&ch_max=0',
              '/search?group=stocks&mc_max=2000000000',
              '/search?group=stocks&p_max=20',
            ]"
          >
            <AtomsSidebarButton to="/search" text="Todos os ativos" is-sub-item />
            <AtomsSidebarButton to="/search?group=stocks" text="Todas as ações" is-sub-item />
            <AtomsSidebarButton to="/search?group=stocks&ch_min=0" text="Ações em alta hoje" is-sub-item />
            <AtomsSidebarButton to="/search?group=stocks&ch_max=0" text="Ações em queda hoje" is-sub-item />
            <AtomsSidebarButton to="/search?group=stocks&mc_max=2000000000" text="Small caps" is-sub-item />
            <AtomsSidebarButton to="/search?group=stocks&p_max=20" text="Preço baixo (até R$ 20)" is-sub-item />
          </AtomsSidebarGroup>

          <AtomsSidebarGroup
            label="FIIs & Internacional"
            icon="i-lucide-building-2"
            :child-paths="[
              '/search?group=reits',
              '/search?group=reits&ch_min=0',
              '/search?group=reits&ch_max=0',
              '/search?group=bdrs',
              '/search?group=etfs',
            ]"
          >
            <AtomsSidebarButton to="/search?group=reits" text="Todos os FIIs" is-sub-item />
            <AtomsSidebarButton to="/search?group=reits&ch_min=0" text="FIIs em alta" is-sub-item />
            <AtomsSidebarButton to="/search?group=reits&ch_max=0" text="FIIs em queda" is-sub-item />
            <AtomsSidebarButton to="/search?group=bdrs" text="BDRs" is-sub-item />
            <AtomsSidebarButton to="/search?group=etfs" text="ETFs" is-sub-item />
          </AtomsSidebarGroup>

          <AtomsSidebarGroup
            label="Renda Fixa & Cripto"
            icon="i-lucide-coins"
            :child-paths="[
              '/search?indexer=IPCA',
              '/search?indexer=SELIC',
              '/search?indexer=PREFIXADO',
              '/search?crypto=1&sort=MCAP',
              '/search?crypto=1&sort=UP',
              '/search?crypto=1&sort=DOWN',
            ]"
          >
            <AtomsSidebarButton to="/search?indexer=IPCA" text="Tesouro IPCA+" is-sub-item />
            <AtomsSidebarButton to="/search?indexer=SELIC" text="Tesouro SELIC" is-sub-item />
            <AtomsSidebarButton to="/search?indexer=PREFIXADO" text="Tesouro Prefixado" is-sub-item />
            <AtomsSidebarButton to="/search?crypto=1&sort=MCAP" text="Criptos por Market Cap" is-sub-item />
            <AtomsSidebarButton to="/search?crypto=1&sort=UP" text="Criptos em alta 24h" is-sub-item />
            <AtomsSidebarButton to="/search?crypto=1&sort=DOWN" text="Criptos em queda 24h" is-sub-item />
          </AtomsSidebarGroup>
        </section>

        <!-- ===== Ferramentas ===== -->
        <section class="flex flex-col gap-0.5">
          <span class="platform-sidebar-eyebrow">{{ brand.nav.toolsLabel }}</span>
          <AtomsSidebarButton to="/calculadora" :text="brand.nav.calculators" icon="i-lucide-calculator" />
          <AtomsSidebarGroup
            v-if="brand.features?.showDividendYieldRanking || brand.features?.showMonthlyMoversRanking"
            label="Rankings"
            icon="i-lucide-trophy"
            :child-paths="[
              '/ranking',
              '/ranking/maiores-altas-mes',
              '/ranking/maiores-baixas-mes',
              '/ranking/maiores-dividend-yield',
              '/dividendos/calendario',
            ]"
          >
            <AtomsSidebarButton to="/ranking" text="Todos os rankings" is-sub-item />
            <AtomsSidebarButton to="/ranking/maiores-altas-mes" text="Maiores altas do mês" is-sub-item />
            <AtomsSidebarButton to="/ranking/maiores-baixas-mes" text="Maiores baixas do mês" is-sub-item />
            <AtomsSidebarButton to="/ranking/maiores-dividend-yield" text="Maiores dividend yield" is-sub-item />
            <AtomsSidebarButton
              v-if="brand.features?.showDividendCalendar"
              to="/dividendos/calendario"
              text="Calendário de dividendos"
              is-sub-item
            />
          </AtomsSidebarGroup>
          <AtomsSidebarButton
            v-if="brand.features?.showSectorComparatives"
            to="/setor"
            text="Setores"
            icon="i-lucide-layers"
          />
          <AtomsSidebarButton to="/guias" :text="brand.nav.guides" icon="i-lucide-book-open" />
          <AtomsSidebarButton to="/dividendos" :text="brand.nav.dividends" icon="i-lucide-coins" />
        </section>
      </nav>

      <!-- Market strip — IBOV / IFIX live tickers. Pulled from the
           public indices endpoint, refreshed every 60s. The strip
           hides itself entirely if the fetch fails — better no strip
           than a broken one. Dashes appear during initial load. -->
      <div
        v-if="authStore.me && market.show"
        class="flex shrink-0 items-stretch gap-px border-t"
        :style="{
          borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${brand.colors.border} 18%, transparent)`,
        }"
      >
        <div
          v-for="cell in market.cells"
          :key="cell.label"
          class="flex flex-1 flex-col items-center gap-0.5 px-2 py-1.5"
          :style="{ backgroundColor: brand.colors.surface }"
        >
          <span
            class="font-mono-tab text-[9px] font-medium uppercase"
            :style="{
              letterSpacing: '0.18em',
              color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)`,
            }"
          >{{ cell.label }}</span>
          <span
            class="font-mono-tab text-[11px] tabular-nums"
            :style="{ color: brand.colors.text }"
          >{{ cell.value }}</span>
          <span
            class="font-mono-tab text-[9.5px] tabular-nums"
            :style="{
              color:
                cell.changeNum === null
                  ? `color-mix(in srgb, ${brand.colors.text} 35%, transparent)`
                  : cell.changeNum >= 0
                    ? brand.colors.positive
                    : brand.colors.negative,
            }"
          >{{ cell.change }}</span>
        </div>
      </div>

      <!-- User row — inline strip, no bordered card. Avatar + name
           + plan, plus three icon-only action buttons (theme cycle,
           eye toggle, logout). The top border picks up the same
           tint the rest of the sidebar uses, so the row reads as a
           footer rather than a tray.

           Theme toggle: single icon that cycles light → dark →
           system. Replaces the chunky 3-segment pill that used to
           live above this row — the segmented control was visually
           heavy for what's a one-off preference flip. -->
      <div
        class="platform-user-row flex flex-shrink-0 items-center gap-2 border-t px-3 py-3"
        :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)` }"
      >
        <div class="relative shrink-0">
          <UAvatar :alt="authStore.me?.name || 'Usuário'" size="sm" />
          <span
            class="absolute -bottom-0.5 -right-0.5 size-2 rounded-full"
            style="background-color:#10b981"
            :style="{ boxShadow: `0 0 0 2px ${brand.colors.surface}` }"
            aria-hidden="true"
          />
        </div>
        <div class="ml-0.5 flex min-w-0 flex-1 flex-col leading-tight">
          <span
            class="truncate text-[13px] font-medium"
            :style="{ color: brand.colors.text, letterSpacing: '-0.01em' }"
          >
            {{ authStore.me?.name || 'Usuário' }}
          </span>
          <span
            class="platform-user-plan truncate text-[10px] font-medium uppercase"
            :style="{
              color: `color-mix(in srgb, ${brand.colors.text} 48%, transparent)`,
              letterSpacing: '0.16em',
            }"
          >
            {{ brand.sidebar.planLabel }}
          </span>
        </div>
        <button
          v-if="supportsMultiMode"
          type="button"
          class="platform-icon-btn flex size-7 items-center justify-center rounded-md"
          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
          :title="`Tema: ${themeLabel} (clique pra alternar)`"
          :aria-label="`Tema: ${themeLabel}`"
          @mouseover="(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = `color-mix(in srgb, ${brand.colors.text} 7%, transparent)`)"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')"
          @click="cycleThemeMode"
        >
          <UIcon :name="themeIcon" class="size-4" />
        </button>
        <button
          type="button"
          class="platform-icon-btn flex size-7 items-center justify-center rounded-md"
          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
          :title="interfaceStore.revealAmount ? brand.nav.hide : brand.nav.show"
          @mouseover="(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = `color-mix(in srgb, ${brand.colors.text} 7%, transparent)`)"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')"
          @click="interfaceStore.toggleRevealAmount"
        >
          <UIcon :name="interfaceStore.revealAmount ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4" />
        </button>
        <button
          type="button"
          class="platform-icon-btn flex size-7 items-center justify-center rounded-md"
          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
          :title="brand.nav.logout"
          @mouseover="(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'; el.style.color = 'rgb(248, 113, 113)' }"
          @mouseleave="(e) => { const el = e.currentTarget as HTMLElement; el.style.backgroundColor = 'transparent'; el.style.color = `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
          @click="makeLogout"
        >
          <UIcon name="i-lucide-log-out" class="size-4" />
        </button>
      </div>
    </aside>
    <div
      class="relative flex w-full flex-col overflow-hidden xl:px-4 xl:py-4"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <header
        v-bind="headerProps"
        ref="header"
        class="sticky top-0 z-20 flex min-h-[60px] w-full items-center justify-between gap-4 px-4 pt-3 backdrop-blur-xl xl:px-0 xl:pt-0 xl:rounded-[25px]"
      >
        <slot name="header-branding">
          <div class="flex items-center gap-5">
            <BrandLogo variant="icon" class="h-9 w-9" />
            <div class="flex flex-col">
              <span
                class="text-[14px] uppercase tracking-[0.25em]"
                :style="{ color: brand.colors.textMuted }"
              >
                {{ brand.header.title }}
              </span>
              <span
                class="-mt-2 text-[14px] font-semibold tracking-[0.05em]"
                :style="{ color: brand.colors.text }"
              >
                {{ brand.header.subtitle }}
              </span>
            </div>
          </div>
        </slot>
      </header>
      <!-- Banner status assessor (investidor): só pendente ou recusado -->
      <div
        v-if="authStore.me?.role === 'investor' && (authStore.me?.approval_status === 'pending' || authStore.me?.approval_status === 'rejected')"
        class="mx-4 mt-5 brand-card border px-4 py-3 text-sm xl:mt-6"
        :class="{
          'border-amber-500/40 bg-amber-500/10 text-amber-200': authStore.me.approval_status === 'pending',
          'border-red-500/30 bg-red-500/10 text-red-200': authStore.me.approval_status === 'rejected',
        }"
      >
        <template v-if="authStore.me.approval_status === 'pending'">
          Aguardando aprovação do seu assessor. Você poderá falar com ele pela assessoria quando for aprovado.
        </template>
        <template v-else-if="authStore.me.approval_status === 'rejected'">
          Seu vínculo com o assessor foi recusado. Você pode falar com a assessoria com IA normalmente.
        </template>
      </div>
      <div v-bind="containerProps" class="flex min-h-0 flex-1 flex-col">
        <slot />
      </div>
    </div>
  </div>

  <!-- The floating QuickSearch pill is hidden on /help — the chat page
       has its own dedicated composer and the two would overlap. -->
  <MoleculesQuickSearch v-if="route.path !== '/help'" />

  <!-- Floating hamburger button (mobile only) — anchored at the same
       baseline as the QuickSearch pill so they read as paired, but
       living in its own fixed-position context so it can't break the
       QuickSearch backdrop / Transition logic.
       Pairs with the global CSS rule below that adds left-padding to
       the QuickSearch root on mobile, reserving space so the pill
       shifts right and the two don't overlap.
       Hidden on /help — the chat takeover owns its own drawer. -->
  <div
    v-if="route.path !== '/help'"
    class="floating-menu-anchor pointer-events-none fixed bottom-4 left-3 z-50 md:bottom-6 xl:hidden"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
  >
    <button
      type="button"
      aria-label="Abrir menu"
      class="floating-menu-btn pointer-events-auto flex size-11 items-center justify-center rounded-full backdrop-blur-md transition-[background-color,border-color,transform]"
      :style="{
        backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 92%, transparent)`,
        border: `1px solid color-mix(in srgb, ${brand.colors.border} 65%, transparent)`,
        color: brand.colors.text,
        boxShadow: '0 6px 20px -8px rgba(0, 0, 0, 0.28)',
      }"
      @click="menuMobileActive = true"
    >
      <UIcon name="i-lucide-menu" class="size-5" />
    </button>
  </div>

  <Footer v-if="!hideFooter" />
</template>

<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    default: 'Title',
  },
  hideSearchBar: {
    type: Boolean,
    default: false,
  },
  headerBg: {
    type: String,
    default: '',
  },
  hideFooter: {
    type: Boolean,
    default: false,
  },
})

const brand = useBrand()

const allAttrs = useAttrs()
const interfaceStore = useInterfaceStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const menuMobileActive = ref(false)
const pwa = import.meta.client ? usePWA() : null

const isAppInstalledReal = computed(() => {
  if (!import.meta.client) return false
  const standalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches ?? false
  const iosStandalone = (window.navigator as any).standalone === true
  const pwaInstalled = !!(pwa && (pwa as any).isPWAInstalled)
  return pwaInstalled || standalone || iosStandalone
})

const isAppInstalled = computed(() => {
  if (!import.meta.client) return false

  // Dev-only simulation (helps testing layout without installing PWA)
  const q: Record<string, any> = route.query as any
  const qVal = Array.isArray(q.simulateInstalled)
    ? q.simulateInstalled[0]
    : q.simulateInstalled

  // Handle common forms:
  // - ?simulateInstalled=1
  // - ?simulateInstalled (empty value)
  // - accidental encoded form: ?simulateInstalled%3D1  -> key becomes "simulateInstalled=1"
  const simulateFromQuery =
    qVal === '1' ||
    qVal === 'true' ||
    qVal === '' ||
    Object.prototype.hasOwnProperty.call(q, 'simulateInstalled=1')
  const simulateFromStorage =
    import.meta.dev &&
    window.localStorage?.getItem?.('redentia:simulateInstalled') === '1'
  const simulated = import.meta.dev && (simulateFromQuery || simulateFromStorage)

  return simulated || isAppInstalledReal.value
})

const containerProps = Object.fromEntries(
  Object.entries(allAttrs)
    .filter(([k]) => k.startsWith('container-'))
    .map(([k, v]) => [k.replace('container-', ''), v])
)

const headerProps = Object.fromEntries(
  Object.entries(allAttrs)
    .filter(([k]) => k.startsWith('header-'))
    .map(([k, v]) => [k.replace('header-', ''), v])
)

async function makeLogout() {
  await authStore.logout()
  router.push('/auth/login')
}

// ============================================================
// Theme toggle (icon-only, lives inside the user row)
// ============================================================
// Single button that cycles light → dark → system. Replaces the
// chunky 3-segment pill that used to sit above the user row. We
// hide the toggle entirely for tenants that don't ship multiple
// palettes (matches the AtomsColorModeToggle behavior — picking
// "Auto / Light" with no light palette is confusing UX).
const colorMode = useColorMode()
const brandThemes = (brand as { themes?: { light?: object; dark?: object } }).themes
const supportsMultiMode = computed(
  () => !!(brandThemes && (brandThemes.light || brandThemes.dark))
)

type ThemePref = 'system' | 'light' | 'dark'
const themePref = computed<ThemePref>(() => {
  const p = colorMode.preference
  return p === 'dark' || p === 'light' ? p : 'system'
})
const themeIcon = computed(() => {
  if (themePref.value === 'light') return 'i-lucide-sun'
  if (themePref.value === 'dark') return 'i-lucide-moon'
  return 'i-lucide-monitor'
})
const themeLabel = computed(() => {
  if (themePref.value === 'light') return 'Claro'
  if (themePref.value === 'dark') return 'Escuro'
  return 'Auto (sistema)'
})

function cycleThemeMode() {
  const next: ThemePref =
    themePref.value === 'light'
      ? 'dark'
      : themePref.value === 'dark'
        ? 'system'
        : 'light'
  if (next === 'system') {
    // Translate "Auto" to the current OS preference IMMEDIATELY,
    // storing it as a concrete `light` or `dark`. Same pattern the
    // AtomsColorModeToggle uses to avoid SSR/CSR hydration mismatch.
    const osDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    colorMode.preference = osDark ? 'dark' : 'light'
    return
  }
  colorMode.preference = next
}

// ============================================================
// Portfolio snapshot card (sidebar)
// ============================================================
// Fetches the wallet composition once on mount when the user is
// authenticated. We expose a single reactive object so the template
// renders three states: skeleton (not yet loaded), empty (loaded
// but zero positions), and value (loaded with totalValue).
const portfolio = reactive<{
  loaded: boolean
  value: number | null
  positions: number
}>({
  loaded: false,
  value: null,
  positions: 0,
})

const portfolioDisplay = computed(() => {
  if (portfolio.value === null) return '—'
  if (!interfaceStore.revealAmount) return 'R$ ••••••'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(portfolio.value)
})

async function fetchPortfolioSnapshot() {
  if (!authStore.me) return
  try {
    const portfolioService = usePortfolioService()
    const [composition, posResp] = await Promise.all([
      portfolioService.getComposition().catch(() => null),
      portfolioService.getPositions().catch(() => ({ positions: [] })),
    ])
    portfolio.positions = posResp?.positions?.length || 0
    portfolio.value =
      composition && composition.totalValue > 0 ? composition.totalValue : null
  } catch {
    // Silent fail — the card will render the empty/CTA state which
    // is honest about the missing data without blocking the layout.
    portfolio.value = null
  } finally {
    portfolio.loaded = true
  }
}

// ============================================================
// Quick actions (2x2 grid)
// ============================================================
// Static list — these don't depend on user state. Tints come from
// hardcoded brand-friendly hues so each card has a distinct color
// chip without us needing to extend the brand config.
const quickActions = [
  {
    label: 'Calculadora',
    meta: brand.calculators?.pageTitle ? '12 ferramentas' : 'Várias',
    icon: 'i-lucide-calculator',
    tint: '#a78bfa',
    to: '/calculadora',
  },
  {
    label: 'Rankings',
    meta: 'Top altas / quedas',
    icon: 'i-lucide-trophy',
    tint: '#fbbf24',
    to: '/ranking',
  },
  {
    label: 'Dividendos',
    meta: 'Calendário próx.',
    icon: 'i-lucide-coins',
    tint: '#34d399',
    to: '/dividendos/calendario',
  },
  {
    label: 'Configurações',
    meta: 'Conta e plano',
    icon: 'i-lucide-settings',
    tint: '#f87171',
    to: '/settings',
  },
] as const

// ============================================================
// Market strip (IBOV / IFIX)
// ============================================================
// Pulled lazily on mount via the existing `getIndiceHistoricPrices`
// service. We render the cells with em-dash placeholders during the
// initial fetch and hide the strip entirely if the fetch fails — a
// half-broken strip is worse than no strip.
type MarketCell = {
  label: string
  value: string
  change: string
  changeNum: number | null
}
const market = reactive<{ show: boolean; cells: MarketCell[] }>({
  show: true,
  cells: [
    { label: 'IBOV', value: '—', change: '—', changeNum: null },
    { label: 'IFIX', value: '—', change: '—', changeNum: null },
  ],
})

function pctFmt(n: number) {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2).replace('.', ',')}%`
}

function thousandsFmt(n: number) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(n)
}

async function fetchMarketStrip() {
  try {
    const assets = useAssetsService()
    const [ibov, ifix] = await Promise.all([
      assets.getIndiceHistoricPrices('ibov', '1mo').catch(() => null),
      assets.getIndiceHistoricPrices('ifix', '1mo').catch(() => null),
    ])

    const buildCell = (label: string, payload: any): MarketCell => {
      // The service unwraps `{ data: [...] }` to a bare array of
      // `{ name, market_price, price_at }`. We compute today's % from
      // the last two closes — good enough for a sidebar ticker.
      const arr: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.values)
            ? payload.values
            : []
      const closes: number[] = arr
        .map((p: any) => p.market_price ?? p.close ?? p.value)
        .filter((v: any) => Number.isFinite(v))
      if (closes.length < 2) {
        return { label, value: '—', change: '—', changeNum: null }
      }
      const last = closes[closes.length - 1]!
      const prev = closes[closes.length - 2]!
      const pct = ((last - prev) / prev) * 100
      return {
        label,
        value: thousandsFmt(last),
        change: pctFmt(pct),
        changeNum: pct,
      }
    }

    market.cells = [
      buildCell('IBOV', ibov),
      buildCell('IFIX', ifix),
    ]
    // If both cells failed, hide the strip entirely.
    if (market.cells.every((c) => c.changeNum === null)) {
      market.show = false
    }
  } catch {
    market.show = false
  }
}

onMounted(() => {
  fetchPortfolioSnapshot()
  fetchMarketStrip()
})
</script>

<style scoped>
/* ============================================================
   Platform Sidebar — Stripe-style chrome
   Mirrors ChatV2Sidebar typographic + spacing rhythm so the
   logged-in shell feels of-a-piece with the chat takeover.
   ============================================================ */

/* Eyebrow label that introduces each nav section. Tabular,
   uppercase, generous tracking — same recipe as the chat
   sidebar section labels. */
.platform-sidebar-eyebrow {
  padding-inline: 10px;
  margin-bottom: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  font-feature-settings: 'tnum';
}

/* Brand lockup at the top — quiet hover, just a subtle scale
   to telegraph that it's clickable. */
.platform-brand-mark {
  transition: transform 200ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.platform-brand-mark:hover {
  transform: scale(1.03);
}

/* Primary AI CTA — amber solid button, mirrors the chat
   sidebar "Nova conversa". Hover darkens the amber slightly
   and lifts the shadow rather than scaling, keeping it calm. */
.platform-ai-cta {
  position: relative;
  isolation: isolate;
}
.platform-ai-cta:hover {
  background-color: color-mix(in srgb, var(--brand-primary) 92%, black) !important;
  transform: translateY(-0.5px);
  box-shadow:
    0 12px 24px -10px color-mix(in srgb, var(--brand-primary) 70%, transparent),
    0 6px 14px -8px rgba(0, 0, 0, 0.14) !important;
}
.platform-ai-cta:active {
  transform: translateY(0);
}

/* Scrollable nav body — hide scrollbar visually, keep
   scroll behavior. The sidebar is dense; a visible scrollbar
   adds noise without information. */
.platform-sidebar-body {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.platform-sidebar-body::-webkit-scrollbar {
  display: none;
}

/* Portfolio snapshot card — quiet hover that telegraphs "this is
   a link" without competing with the AI CTA below. */
.platform-snapshot-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 4%, var(--brand-background)) !important;
  box-shadow: 0 4px 12px -6px color-mix(in srgb, var(--brand-primary) 24%, transparent);
}

/* Quick action cards — same recipe as the snapshot card but a
   touch lighter on hover (4 cards in a grid; if every card lit up
   like the snapshot, the sidebar would feel too busy). */
.platform-quick-action:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 24%, transparent) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 3%, var(--brand-background)) !important;
}

/* Skeleton shimmer — used while the portfolio fetch is in flight.
   Gentle gradient sweep, no flashy animation. */
.platform-skeleton {
  position: relative;
  overflow: hidden;
}
.platform-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--brand-text) 4%, transparent) 50%,
    transparent 100%
  );
  animation: platform-skeleton-shimmer 1.4s linear infinite;
}
@keyframes platform-skeleton-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

/* User row — quiet card-on-card. The border-top from the
   container handles the separation; this layer adds the
   inline icon button polish (hover bg, focus ring). */
.platform-user-row {
  transition: background-color 160ms ease-out;
}
.platform-icon-btn {
  transition:
    background-color 140ms ease-out,
    color 140ms ease-out;
}
.platform-icon-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-primary) 40%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .platform-brand-mark,
  .platform-ai-cta,
  .platform-icon-btn,
  .platform-snapshot-card,
  .platform-quick-action {
    transition: none;
  }
  .platform-brand-mark:hover,
  .platform-ai-cta:hover,
  .platform-ai-cta:active {
    transform: none;
  }
  .platform-skeleton::after {
    animation: none;
  }
}

/* ============================================================
   Mobile floating menu button
   ============================================================ */
.floating-menu-btn:hover {
  filter: brightness(1.05);
}
.floating-menu-btn:active {
  transform: scale(0.96);
}
@media (prefers-reduced-motion: reduce) {
  .floating-menu-btn:active {
    transform: none;
  }
}
</style>

<!--
  Non-scoped: reserves the left-edge space the menu button needs on
  mobile, by adding extra padding to the QuickSearch root. The
  `flex justify-center` inside QS then re-centers within the
  remaining width, so the pill aligns to the right of the menu
  button without overlapping. Reverts to default on xl+ (desktop has
  the sidebar instead of the hamburger).
-->
<style>
@media (max-width: 1279px) {
  .quick-search-root {
    padding-left: 4rem; /* button width (44px) + gap (12px) ≈ 56px → round to 64 */
  }
}
</style>

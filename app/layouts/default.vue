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

      <!-- Primary AI CTA — amber solid, mirrors the chat sidebar CTA -->
      <div v-if="authStore.me?.role !== 'advisor'" class="shrink-0 px-4 pb-3">
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

      <!-- Color mode toggle, sitting just above the user row so it's
           always reachable without adding chrome to the user card
           itself. The nav above already takes flex-1, so the toggle +
           user row dock naturally at the bottom. -->
      <div class="flex flex-shrink-0 justify-center px-3 pb-2">
        <AtomsColorModeToggle />
      </div>

      <!-- User row — inline strip, no bordered card. Avatar + name
           + plan, plus two icon-only action buttons (eye toggle,
           logout). The top border picks up the same tint the rest
           of the sidebar uses, so the row reads as a footer rather
           than a tray. -->
      <div
        class="platform-user-row flex flex-shrink-0 items-center gap-2.5 border-t px-3 py-3"
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
        <div class="flex min-w-0 flex-1 flex-col leading-tight">
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
  .platform-icon-btn {
    transition: none;
  }
  .platform-brand-mark:hover,
  .platform-ai-cta:hover,
  .platform-ai-cta:active {
    transform: none;
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

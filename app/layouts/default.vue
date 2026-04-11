<template>
  <MoleculesMobileMenuOverlay v-model:open="menuMobileActive" mode="auth" />

  <!-- Menu mobile -->
  <div
    class="fixed bottom-0 left-0 right-0 z-20 mx-auto flex w-full items-center justify-center gap-3 border-t px-4 py-4 backdrop-blur-2xl xl:hidden"
    :style="{ background: brand.colors.background, borderColor: brand.colors.border, color: brand.colors.text, boxShadow: brand.theme?.mode === 'dark' ? '0 -18px 40px rgba(0,0,0,0.55)' : 'none' }"
  >
    <button
      type="button"
      aria-label="Abrir menu"
      class="flex h-12 w-12 items-center justify-center rounded-full border transition"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
      @click="menuMobileActive = true"
    >
      <UIcon name="i-lucide-menu" class="text-secondary size-5" />
    </button>
    <NuxtLink
      to="/"
      aria-label="Visão geral"
      active-class="border-secondary/60 bg-secondary/10"
      class="flex h-12 w-12 items-center justify-center rounded-full border transition"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
    >
      <UIcon name="i-si-dashboard-vert-fill" class="text-secondary size-5" />
    </NuxtLink>
    <template v-if="isAppInstalled">
      <!-- NOTE: MoleculesSearchAssets does not inherit attrs on its root (inheritAttrs: false),
           so we wrap it to make the flex item grow. -->
      <div
        class="flex-1 min-w-0"
      >
        <MoleculesSearchAssets
          :compact="false"
          aria-label="Buscar ativos"
          class="w-full h-12 rounded-2xl border transition"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
        />
      </div>
    </template>
    <template v-else>
      <MoleculesSearchAssets
        :compact="true"
        aria-label="Buscar ativos"
        class="h-12 w-12 rounded-full border transition"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
      />
      <NuxtLink
        to="/download"
        active-class="border-secondary/60 bg-secondary/10"
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.text }"
      >
        <BrandLogo
          variant="icon"
          class="h-5" :style="{ filter: `drop-shadow(0 4px 10px rgb(var(--brand-overlay) / 0.2))` }"
        />
        {{ brand.nav.downloadApp }}
      </NuxtLink>
    </template>
  </div>

  <!-- Layout — both wrapper + sidebar carry an explicit brand background so
       the whole shell flips together via Vue reactivity. Without this, the
       sidebar inherits from <body> which is set via CSS vars injected in
       plugins/brand.ts, and that injection path can lag behind the reactive
       updates when a tenant changes (producing mixed Redentia-dark sidebar
       with Norte-cream main content). -->
  <div
    class="flex min-h-screen w-full"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Sidebar Desktop -->
    <aside
      class="sticky top-0 flex h-screen w-[320px] min-w-[320px] flex-col gap-6 p-4 max-xl:hidden"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <!-- User Profile Card -->
      <div class="brand-card border p-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <div class="flex items-center gap-3">
          <div class="relative">
            <UAvatar :alt="authStore.me?.name || 'Usuário'" size="lg" class="ring-2 ring-secondary/30" />
            <div class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 bg-green-500" :style="{ borderColor: brand.colors.background }" />
          </div>
          <div class="flex flex-1 flex-col">
            <span class="font-medium" :style="{ color: brand.colors.text }">
              {{ authStore.me?.name || 'Usuário' }}
            </span>
            <span class="flex items-center gap-1 text-xs" :style="{ color: brand.colors.textMuted }">
              <UIcon name="i-lucide-sparkles" class="h-3 w-3 text-secondary" />
              {{ brand.sidebar.planLabel }}
            </span>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2 border-t pt-4" :style="{ borderColor: brand.colors.border }">
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs transition"
            :style="{ backgroundColor: brand.colors.surface, color: brand.colors.textMuted }"
            @click="interfaceStore.toggleRevealAmount"
          >
            <UIcon
              :name="interfaceStore.revealAmount ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              class="h-4 w-4"
            />
            {{ interfaceStore.revealAmount ? brand.nav.hide : brand.nav.show }}
          </button>
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs transition hover:bg-red-500/10 hover:text-red-400"
            :style="{ backgroundColor: brand.colors.surface, color: brand.colors.textMuted }"
            @click="makeLogout"
          >
            <UIcon name="i-lucide-log-out" class="h-4 w-4" />
            {{ brand.nav.logout }}
          </button>
        </div>
      </div>

      <!-- Search -->
      <MoleculesSearchAssets
        v-if="!hideSearchBar"
        class="brand-card border px-4 py-3 transition"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
      />

      <!-- Navigation -->
      <nav class="flex flex-1 flex-col gap-1">
        <span class="mb-2 px-4 text-[10px] font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">{{ brand.nav.menuLabel }}</span>
        <AtomsSidebarButton to="/" :text="brand.nav.overview" icon="i-lucide-layout-dashboard" />
        <AtomsSidebarButton to="/wallet" :text="brand.nav.wallet" icon="i-lucide-wallet" />
        <AtomsSidebarButton to="/help" :text="brand.nav.chat" icon="i-lucide-message-circle" />
        <AtomsSidebarButton v-if="authStore.me?.role === 'advisor'" to="/advisor" :text="brand.nav.advisorArea" icon="i-lucide-users" />
        <AtomsSidebarButton to="/settings" :text="brand.nav.settings" icon="i-lucide-settings" />
        <AtomsSidebarButton v-if="authStore.me?.role === 'admin'" to="/backoffice" text="Backoffice" icon="i-lucide-shield" />

        <div class="my-2" />
        <span class="mb-2 px-4 text-[10px] font-medium uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">{{ brand.nav.toolsLabel }}</span>
        <AtomsSidebarButton to="/calculadora" :text="brand.nav.calculators" icon="i-lucide-calculator" />
        <AtomsSidebarButton
          v-if="brand.features?.showDividendYieldRanking || brand.features?.showMonthlyMoversRanking"
          to="/ranking"
          text="Rankings"
          icon="i-lucide-trophy"
        />
        <AtomsSidebarButton
          v-if="brand.features?.showDividendCalendar"
          to="/dividendos/calendario"
          text="Calendário"
          icon="i-lucide-calendar-days"
        />
        <AtomsSidebarButton
          v-if="brand.features?.showSectorComparatives"
          to="/setor"
          text="Setores"
          icon="i-lucide-layers"
        />
        <AtomsSidebarButton to="/guias" :text="brand.nav.guides" icon="i-lucide-book-open" />
        <AtomsSidebarButton to="/dividends" :text="brand.nav.dividends" icon="i-lucide-coins" disabled />
      </nav>

      <!-- AI CTA (oculto para assessor; assessor usa o item Chat no menu) -->
      <NuxtLink
        v-if="authStore.me?.role !== 'advisor'"
        to="/help"
        class="group relative overflow-hidden brand-card border border-secondary/20 bg-gradient-to-br from-secondary/10 to-transparent p-4 transition-all hover:border-secondary/40 hover:from-secondary/20"
      >
        <div class="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-secondary/20 blur-2xl transition-all group-hover:bg-secondary/30" />
        <div class="relative flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20">
            <IconAi class="fill-secondary h-5 w-5" />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-secondary">{{ brand.sidebar.aiCtaTitle }}</span>
            <span class="text-xs" :style="{ color: brand.colors.textMuted }">{{ brand.sidebar.aiCtaSubtitle }}</span>
          </div>
          <UIcon name="i-lucide-arrow-right" class="ml-auto h-4 w-4 text-secondary/60 transition-transform group-hover:translate-x-1" />
        </div>
      </NuxtLink>
    </aside>
    <div
      class="relative flex w-full flex-col overflow-hidden xl:px-4 xl:py-4"
      :style="{ backgroundColor: brand.colors.background }"
    >
      <header
        v-bind="headerProps"
        ref="header"
        class="sticky top-0 z-20 flex min-h-[60px] w-full items-center justify-between gap-4 px-6 py-4 backdrop-blur-xl xl:top-4 xl:rounded-[25px]"
        :style="{ background: headerBg || brand.colors.surface }"
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
      <div v-bind="containerProps" class="flex-1">
        <slot />
      </div>
    </div>
  </div>

  <Footer />
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

<template>
  <MoleculesMobileMenuOverlay v-model:open="menuMobileActive" mode="auth" />

  <!-- Menu mobile -->
  <div
    class="fixed bottom-0 left-0 right-0 z-20 mx-auto flex w-full items-center justify-center gap-3 border-t border-white/10 bg-gradient-to-tr from-black via-neutral-950 to-neutral-900 px-4 py-4 text-white shadow-[0_-18px_40px_rgba(0,0,0,0.55)] backdrop-blur-2xl xl:hidden"
  >
    <button
      type="button"
      aria-label="Abrir menu"
      class="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
      @click="menuMobileActive = true"
    >
      <UIcon name="i-lucide-menu" class="text-secondary size-5" />
    </button>
    <NuxtLink
      to="/"
      aria-label="Visão geral"
      active-class="border-secondary/60 bg-secondary/10 text-white"
      class="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
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
          class="w-full h-12 rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
        />
      </div>
    </template>
    <template v-else>
      <MoleculesSearchAssets
        :compact="true"
        aria-label="Buscar ativos"
        class="h-12 w-12 rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
      />
      <NuxtLink
        to="/download"
        active-class="border-secondary/60 bg-secondary/10 text-white"
        class="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
      >
        <IconLogo
          class="h-5 fill-white drop-shadow-[0_4px_10px_rgba(255,255,255,0.2)]"
        />
        Baixar app
      </NuxtLink>
    </template>
  </div>

  <!-- Layout -->
  <div class="flex min-h-screen w-full">
    <!-- Sidebar Desktop -->
    <aside
      class="sticky top-0 flex h-screen w-[320px] min-w-[320px] flex-col gap-6 p-4 max-xl:hidden"
    >
      <!-- User Profile Card -->
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-center gap-3">
          <div class="relative">
            <UAvatar :alt="authStore.me?.name || 'Usuário'" size="lg" class="ring-2 ring-secondary/30" />
            <div class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-black bg-green-500" />
          </div>
          <div class="flex flex-1 flex-col">
            <span class="font-medium text-white">
              {{ authStore.me?.name || 'Usuário' }}
            </span>
            <span class="flex items-center gap-1 text-xs text-white/50">
              <UIcon name="i-lucide-sparkles" class="h-3 w-3 text-secondary" />
              Plano gratuito
            </span>
          </div>
        </div>
        <div class="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60 transition hover:bg-white/10 hover:text-white"
            @click="interfaceStore.toggleRevealAmount"
          >
            <UIcon
              :name="interfaceStore.revealAmount ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              class="h-4 w-4"
            />
            {{ interfaceStore.revealAmount ? 'Ocultar' : 'Mostrar' }}
          </button>
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60 transition hover:bg-red-500/10 hover:text-red-400"
            @click="makeLogout"
          >
            <UIcon name="i-lucide-log-out" class="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>

      <!-- Search -->
      <MoleculesSearchAssets
        v-if="!hideSearchBar"
        class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20"
      />

      <!-- Navigation -->
      <nav class="flex flex-1 flex-col gap-1">
        <span class="mb-2 px-4 text-[10px] font-medium uppercase tracking-wider text-white/30">Menu</span>
        <AtomsSidebarButton to="/" text="Visão Geral" icon="i-lucide-layout-dashboard" />
        <AtomsSidebarButton to="/wallet" text="Sua carteira" icon="i-lucide-wallet" disabled />

        <div class="my-2" />
        <span class="mb-2 px-4 text-[10px] font-medium uppercase tracking-wider text-white/30">Ferramentas</span>
        <AtomsSidebarButton to="/calculadora" text="Calculadoras" icon="i-lucide-calculator" />
        <AtomsSidebarButton to="/guias" text="Guias" icon="i-lucide-book-open" />
        <AtomsSidebarButton to="/dividends" text="Proventos" icon="i-lucide-coins" disabled />
      </nav>

      <!-- AI CTA -->
      <NuxtLink
        to="/help"
        class="group relative overflow-hidden rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/10 to-transparent p-4 transition-all hover:border-secondary/40 hover:from-secondary/20"
      >
        <div class="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-secondary/20 blur-2xl transition-all group-hover:bg-secondary/30" />
        <div class="relative flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20">
            <IconAi class="fill-secondary h-5 w-5" />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-secondary">Assessoria com IA</span>
            <span class="text-xs text-white/50">Tire suas dúvidas grátis</span>
          </div>
          <UIcon name="i-lucide-arrow-right" class="ml-auto h-4 w-4 text-secondary/60 transition-transform group-hover:translate-x-1" />
        </div>
      </NuxtLink>
    </aside>
    <div
      class="relative flex w-full flex-col overflow-hidden bg-black xl:px-4 xl:py-4"
    >
      <header
        v-bind="headerProps"
        ref="header"
        class="sticky top-0 z-20 flex min-h-[60px] w-full items-center justify-between gap-4 bg-white/5 px-6 py-4 backdrop-blur-xl xl:top-4 xl:rounded-[25px]"
        :style="{ background: headerBg }"
      >
        <slot name="header-branding">
          <div class="flex items-center gap-5">
            <IconLogo class="h-9 w-9 fill-white" />
            <div class="flex flex-col">
              <span
                class="text-[14px] uppercase tracking-[0.25em] text-white/50"
              >
                Redentia
              </span>
              <span
                class="-mt-2 text-[14px] font-semibold tracking-[0.05em] text-white"
              >
                Investir com IA
              </span>
            </div>
          </div>
        </slot>
      </header>
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

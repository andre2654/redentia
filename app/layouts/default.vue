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
    <div
      class="sticky top-0 h-screen min-h-fit w-[380px] min-w-[380px] p-4 max-xl:hidden"
    >
      <div
        class="flex flex-col justify-between gap-12 rounded-[30px] bg-white/5 p-4 py-8"
      >
        <div class="flex flex-col gap-3 px-6">
          <div class="flex items-center">
            <div class="flex items-center gap-3">
              <UAvatar :alt="authStore.me?.name || 'Usuário'" size="xl" />
              <div class="flex flex-col">
                <div class="text-[15px]">
                  {{ authStore.me?.name || 'Usuário' }}
                </div>
                <span class="-mt-1 text-[12px] text-gray-400"
                  >Plano gratuito</span
                >
              </div>
            </div>
          </div>
          <div class="flex items-center">
            <UButton
              color="neutral"
              variant="link"
              :trailing-icon="
                interfaceStore.revealAmount
                  ? 'i-lucide-eye-off'
                  : 'i-lucide-eye'
              "
              :aria-label="
                interfaceStore.revealAmount ? 'Ocultar valores' : 'Mostrar valores'
              "
              :aria-pressed="interfaceStore.revealAmount"
              @click="interfaceStore.toggleRevealAmount"
            />
            <!-- <UButton
              to="/settings"
              color="neutral"
              variant="link"
              label="Configurações"
              trailing-icon="i-lucide-cog"
            /> -->
            <UButton
              color="neutral"
              variant="link"
              label="sair"
              icon="i-lucide-log-out"
              @click="makeLogout"
            />
          </div>
        </div>

        <div class="flex flex-col gap-8">
          <div class="flex flex-col gap-3">
            <MoleculesSearchAssets v-if="!hideSearchBar" class="px-6 py-3" />
            <AtomsSidebarButton to="/" text="Visão Geral" />
            <AtomsSidebarButton to="/wallet" text="Sua carteira" disabled />
            <AtomsSidebarButton
              to="/planejador"
              text="Planejador de aportes"
              disabled
              is-sub-item
            />
            <AtomsSidebarButton to="/ideal" text="Ideal" disabled is-sub-item />
            <AtomsSidebarButton to="/dividends" text="Proventos" disabled />
            <AtomsSidebarButton
              to="/calculadora"
              text="Calculadora inteligente"
            />
          </div>
          <NuxtLink
            to="/help"
            active-class="bg-secondary/20 "
            class="bg-secondary/5 hover:bg-secondary/20 flex items-center justify-center gap-4 rounded-full px-6 py-2"
          >
            <IconAi class="fill-secondary h-5 w-5" />
            <div class="text-secondary flex flex-col">
              <span class="text-[10px]">Acesse de graça</span>
              <span class="text-[16px] font-bold">Assessoria</span>
            </div>
          </NuxtLink>
        </div>
        <AtomsSidebarMonthGoal />
      </div>
    </div>
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

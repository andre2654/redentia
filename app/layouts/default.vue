<template>
  <MoleculesMobileMenuOverlay v-model:open="menuMobileActive" mode="auth" />

  <!-- Menu mobile -->
  <div
    class="fixed bottom-0 left-0 right-0 z-10 mx-auto flex w-full items-center justify-center gap-3 border-t border-white/10 bg-gradient-to-tr from-black via-neutral-950 to-neutral-900 px-4 py-4 text-white shadow-[0_-18px_40px_rgba(0,0,0,0.55)] backdrop-blur-2xl xl:hidden"
  >
    <button
      type="button"
      class="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
      @click="menuMobileActive = true"
    >
      <UIcon name="i-lucide-menu" class="size-5 text-secondary" />
    </button>
    <NuxtLink
      to="/"
      active-class="border-secondary/60 bg-secondary/10 text-white"
      class="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
    >
      <UIcon name="i-si-dashboard-vert-fill" class="size-5 text-secondary" />
    </NuxtLink>
    <MoleculesSearchAssets compact />
    <NuxtLink
      to="/download"
      active-class="border-secondary/60 bg-secondary/10 text-white"
      class="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
    >
      <IconLogo class="h-5 fill-white drop-shadow-[0_4px_10px_rgba(255,255,255,0.2)]" />
      Baixar app
    </NuxtLink>
  </div>

  <!-- Layout -->
  <div class="flex min-h-screen w-full">
    <div
      class="sticky top-0 h-screen min-h-fit w-[380px] min-w-[380px] p-4 max-xl:hidden"
    >
      <div
        class="flex flex-col justify-between gap-[50px] rounded-[30px] bg-white/5 p-4 py-8"
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
            <MoleculesSearchAssets v-if="!hideSearchBar" />
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
            <IconAi class="fill-tertiary dark:fill-secondary h-5 w-5" />
            <div class="text-tertiary dark:text-secondary flex flex-col">
              <span class="text-[10px]">Acesse de graça</span>
              <span class="text-[16px] font-bold">Assessoria</span>
            </div>
          </NuxtLink>
        </div>
        <AtomsSidebarMonthGoal />
      </div>
    </div>
    <div
      class="relative flex w-full flex-col overflow-hidden bg-white md:px-4 md:py-4 dark:bg-black"
    >
      <header
        v-bind="headerProps"
        ref="header"
        class="z-10 flex h-[60px] w-full items-center justify-between gap-4 bg-white/5 px-6 py-4 md:rounded-[25px]"
      >
        <slot name="header">
          <h1
            class="select-none text-[20px] font-bold text-white max-md:text-[24px]"
          >
            {{ title }}
          </h1>
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
})

const allAttrs = useAttrs()
const interfaceStore = useInterfaceStore()
const authStore = useAuthStore()
const router = useRouter()

const menuMobileActive = ref(false)

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

<template>
  <!-- Menu mobile active -->
  <div
    v-if="menuMobileActive"
    class="fixed left-0 top-0 z-20 flex h-screen w-screen flex-col items-center justify-center gap-8 bg-black text-white"
  >
    <UButton
      color="neutral"
      variant="link"
      icon="i-lucide-minimize"
      class="absolute right-6 top-6"
      :ui="{
        leadingIcon: 'size-7',
        base: 'text-[17px] gap-2',
      }"
      @click="menuMobileActive = false"
    >
      Fechar
    </UButton>

    <div class="flex w-[400px] items-center justify-between px-6">
      <div class="flex items-center gap-3">
        <UAvatar :alt="authStore.me?.name || 'Usuário'" size="xl" />
        <div class="flex flex-col">
          <div class="text-[16px]">{{ authStore.me?.name || 'Usuário' }}</div>
          <span class="text-[14px] text-gray-400">Plano gratuito</span>
        </div>
      </div>
      <div class="flex items-center">
        <UButton
          color="neutral"
          variant="link"
          :trailing-icon="
            interfaceStore.revealAmount ? 'i-lucide-eye-off' : 'i-lucide-eye'
          "
          :ui="{
            trailingIcon: 'size-7',
          }"
          @click="interfaceStore.toggleRevealAmount"
        />
        <UButton
          to="/settings"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-cog"
          :ui="{
            trailingIcon: 'size-7',
          }"
        />
        <UButton
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-log-out"
          :ui="{ trailingIcon: 'size-7' }"
          @click="makeLogout"
        />
      </div>
    </div>
    <div class="flex w-full flex-col gap-8">
      <div class="flex flex-col gap-3">
        <MoleculesSearchAssets class="mx-auto" />
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
        active-class="border-x-4 border-x-secondary bg-tertiary"
        class="hover:bg-secondary/20 flex items-center justify-center gap-4 border-y px-6 py-2"
      >
        <IconAi class="fill-secondary h-5 w-5" />
        <div class="flex flex-col">
          <span class="text-secondary text-[12px] font-extralight"
            >Acesse de graça</span
          >
          <span class="text-secondary text-[16px]">Assessoria</span>
        </div>
      </NuxtLink>
    </div>
  </div>

  <!-- Menu mobile -->
  <div
    class="bg-tertiary/90 border-t-tertiary fixed bottom-0 z-10 flex w-full items-center justify-between gap-8 border-t px-3 py-3 text-white backdrop-blur xl:hidden"
  >
    <UAvatar
      :alt="authStore.me?.name || 'Usuário'"
      size="sm"
      class="ring-tertiary rounded-full ring-2"
      @click="menuMobileActive = true"
    />

    <NuxtLink
      to="/wallet"
      active-class="bg-white/20"
      class="pointer-events-none flex flex-col items-center rounded-full p-2 opacity-70"
    >
      <UIcon name="i-solar-wallet-bold" class="size-6" />
    </NuxtLink>
    <NuxtLink
      to="/"
      active-class="bg-white/20"
      class="flex flex-col items-center rounded-full p-2"
    >
      <UIcon name="i-si-dashboard-vert-fill" class="size-6" />
    </NuxtLink>
    <NuxtLink
      to="/dividends"
      active-class="bg-white/20"
      class="pointer-events-none flex flex-col items-center rounded-full p-2 opacity-70"
    >
      <UIcon name="i-mingcute-pig-money-fill" class="size-6" />
    </NuxtLink>
    <NuxtLink
      to="/download"
      class="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-white"
    >
      <IconLogo class="h-4 fill-white" />
      <span class="text-[12px] font-medium">Baixar</span>
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
        <div class="flex items-center justify-between px-6">
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
            <UButton
              to="/settings"
              color="neutral"
              variant="link"
              trailing-icon="i-lucide-cog"
            />
            <UButton
              color="neutral"
              variant="link"
              trailing-icon="i-lucide-log-out"
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

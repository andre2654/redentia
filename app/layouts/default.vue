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
        <UAvatar alt="Benjamin Canac" size="xl" />
        <div class="flex flex-col">
          <div class="text-[16px]">André Saraiva</div>
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
      </div>
    </div>
    <div class="flex w-full flex-col gap-8">
      <div class="flex flex-col gap-3">
        <MoleculesSearchAssets class="mx-auto" />
        <AtomsSidebarButton to="/" text="Visão Geral" />
        <AtomsSidebarButton to="/wallet" text="Sua carteira" />
        <AtomsSidebarButton
          to="/planejador"
          text="Planejador de aportes"
          disabled
          is-sub-item
        />
        <AtomsSidebarButton to="/ideal" text="Ideal" disabled is-sub-item />
        <AtomsSidebarButton to="/dividends" text="Proventos" />
        <AtomsSidebarButton
          to="/calculadora"
          text="Calculadora inteligente"
          disabled
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
    class="light:border-gray-300 fixed bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-8 rounded-full border bg-white/80 px-3 py-3 backdrop-blur-sm xl:hidden dark:bg-black/20"
  >
    <UAvatar
      alt="Benjamin Canac"
      size="sm"
      class="ring-secondary rounded-full ring-4"
      @click="menuMobileActive = true"
    />

    <NuxtLink
      to="/wallet"
      active-class="text-primary"
      class="flex flex-col items-center"
    >
      <UIcon name="i-solar-wallet-bold" class="size-6" />
    </NuxtLink>
    <NuxtLink
      to="/"
      active-class="text-primary"
      class="flex flex-col items-center"
    >
      <UIcon name="i-si-dashboard-vert-fill" class="size-6" />
    </NuxtLink>
    <NuxtLink
      to="/dividends"
      active-class="text-primary"
      class="flex flex-col items-center"
    >
      <UIcon name="i-mingcute-pig-money-fill" class="size-6" />
    </NuxtLink>
    <NuxtLink
      to="/download"
      class="to-secondary from-primary flex items-center gap-2 rounded-full bg-gradient-to-r px-3 py-2 hover:opacity-80"
    >
      <IconLogo class="h-4 fill-black" />
      <span class="text-[12px] font-medium text-black">Baixar</span>
    </NuxtLink>
  </div>

  <!-- Layout -->
  <div
    class="light:border-r-gray-200 mx-auto flex min-h-screen w-full max-w-[1400px] xl:border-x"
  >
    <div
      class="bg-tertiary sticky top-0 flex h-screen min-h-fit w-[330px] min-w-[330px] flex-col justify-between border-r pt-4 text-white max-xl:hidden dark:bg-black"
    >
      <div class="flex items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <UAvatar alt="Benjamin Canac" size="lg" />
          <div class="flex flex-col">
            <div class="text-[14px]">André Saraiva</div>
            <span class="text-[12px] text-gray-400">Plano gratuito</span>
          </div>
        </div>
        <div class="flex items-center">
          <UButton
            color="neutral"
            variant="link"
            :trailing-icon="
              interfaceStore.revealAmount ? 'i-lucide-eye-off' : 'i-lucide-eye'
            "
            @click="interfaceStore.toggleRevealAmount"
          />
          <UButton
            to="/settings"
            color="neutral"
            variant="link"
            trailing-icon="i-lucide-cog"
          />
        </div>
      </div>

      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-3">
          <MoleculesSearchAssets v-if="!hideSearchBar" />
          <AtomsSidebarButton to="/" text="Visão Geral" />
          <AtomsSidebarButton to="/wallet" text="Sua carteira" />
          <AtomsSidebarButton
            to="/planejador"
            text="Planejador de aportes"
            disabled
            is-sub-item
          />
          <AtomsSidebarButton to="/ideal" text="Ideal" disabled is-sub-item />
          <AtomsSidebarButton to="/dividends" text="Proventos" />
          <AtomsSidebarButton
            to="/calculadora"
            text="Calculadora inteligente"
            disabled
          />
        </div>
        <NuxtLink
          to="/help"
          active-class="border-x-4 border-x-secondary bg-tertiary "
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
      <AtomsSidebarMonthGoal />
    </div>
    <div class="relative flex w-full flex-col bg-white dark:bg-black">
      <div
        class="light:max-xl:border-gray-300 sticky top-0 z-10 flex w-full items-center justify-between gap-4 border-b px-6 py-4 backdrop-blur-lg"
        v-bind="headerProps"
      >
        <slot name="header">
          <h1 class="min-w-max text-[20px] font-bold max-md:text-[24px]">
            {{ title }}
          </h1>
        </slot>
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
})

const allAttrs = useAttrs()
const interfaceStore = useInterfaceStore()

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
</script>

<template>
  <div class="mx-auto flex min-h-screen w-full max-w-[1400px] border-x">
    <div
      class="sticky top-0 flex h-screen w-[330px] min-w-[330px] flex-col justify-between border-r pt-4 max-xl:hidden"
    >
      <div class="flex items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <div class="h-[35px] w-[35px] rounded-md bg-[#D9D9D9]"></div>
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
            color="neutral"
            variant="link"
            trailing-icon="i-lucide-cog"
          />
        </div>
      </div>

      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-3">
          <AtomsSidebarButton to="/" text="Visão Geral" />
          <AtomsSidebarButton to="/wallet" text="Sua carteira" />
          <AtomsSidebarButton
            to="/planejador"
            text="Planejador de aportes"
            disabled
            is-sub-item
          />
          <AtomsSidebarButton to="/ideal" text="Ideal" disabled is-sub-item />
          <AtomsSidebarButton to="/proventos" text="Proventos" />
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
            <span class="text-secondary text-[12px] font-thin"
              >Acesse de graça</span
            >
            <span class="text-secondary text-[16px]">Assessoria</span>
          </div>
        </NuxtLink>
      </div>
      <AtomsSidebarMonthGoal />
    </div>
    <div class="flex w-full flex-col overflow-hidden">
      <div
        class="flex h-12 w-full items-center gap-4 border-b px-6"
        v-bind="headerProps"
      >
        <h1 class="min-w-max font-medium">
          {{ title }}
        </h1>
        <AtomsTickerCarousel v-if="enableTickersCarousel" />
      </div>
      <div v-bind="containerProps" class="flex-1">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    default: 'Title',
  },
  enableTickersCarousel: {
    type: Boolean,
    default: false,
  },
})

const allAttrs = useAttrs()
const interfaceStore = useInterfaceStore()

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

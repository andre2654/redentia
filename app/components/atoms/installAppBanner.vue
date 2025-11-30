<template>
  <div
    class="flex items-center justify-between px-7 py-3 xl:mx-4 xl:mt-4 xl:rounded-[20px] bg-white/10"
  >
    <div class="flex items-center gap-2">
      <IconLogo
        class="to-secondary from-primary h-7 w-7 rounded-full p-1 bg-gradient-to-r fill-black"
      />
      <div class="flex flex-col text-white">
        <span class="text-[13px] font-semibold">Redentia</span>
        <span class="-mt-1 text-[11px]">Instalação do aplicativo</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <NuxtLink
        to="/download"
        class="to-secondary from-primary flex items-center gap-2 rounded-full px-3 py-1 hover:opacity-80 bg-gradient-to-r"
      >
        <IconLogo class="h-4 fill-black" />
        <span class="text-[12px] font-medium text-black"
          >Baixar</span
        >
      </NuxtLink>
      <button
        @click="closeBanner"
        class="group flex items-center justify-center rounded-full p-1 hover:bg-white/10"
        aria-label="Fechar banner"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-white/70 transition-colors group-hover:text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const interfaceStore = useInterfaceStore()

const closeBanner = () => {
  interfaceStore.closeInstallBanner()
}
</script>

<template>
  <div
    class="bg-tertiary flex items-center justify-between px-7 py-3 md:mx-4 md:mt-4 md:rounded-[20px] dark:bg-white/10"
  >
    <div class="flex items-center gap-2">
      <IconLogo
        class="to-secondary from-primary bg-tertiary h-7 w-7 rounded-full fill-white p-1 dark:bg-gradient-to-r dark:fill-black"
      />
      <div class="flex flex-col text-white">
        <span class="text-[13px] font-semibold">Redentia</span>
        <span class="-mt-1 text-[11px]">Instalação do aplicativo</span>
      </div>
    </div>
    <NuxtLink
      to="/download"
      class="to-secondary from-primary flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 hover:opacity-80 dark:bg-gradient-to-r"
    >
      <IconLogo class="h-4 fill-white dark:fill-black" />
      <span class="text-[12px] font-medium text-white dark:text-black"
        >Baixar</span
      >
    </NuxtLink>
  </div>
</template>

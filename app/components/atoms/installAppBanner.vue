<template>
  <div class="flex w-full items-center justify-between border-b px-7 py-3">
    <div class="flex items-center gap-2">
      <IconLogo
        class="to-secondary h-7 w-7 rounded-full bg-gradient-to-r from-primary fill-black p-1"
      />
      <div class="flex flex-col">
        <span class="text-[13px] font-semibold text-white">Redentia</span>
        <span class="-mt-1 text-[11px] text-white"
          >Instalação do aplicativo</span
        >
      </div>
    </div>
    <NuxtLink
      to="/download"
      class="to-secondary flex items-center gap-2 rounded-full bg-gradient-to-r from-primary px-3 py-1 hover:opacity-80"
    >
      <IconLogo class="h-4 fill-black" />
      <span class="text-[12px] font-medium text-black">Baixar</span>
    </NuxtLink>
  </div>
</template>

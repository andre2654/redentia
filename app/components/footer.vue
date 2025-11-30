<template>
  <div class="flex w-full flex-col text-white bg-white/5">
    <div class="w-full bg-white/5 py-5">
      <div
        class="mx-auto flex max-w-[1400px] items-center justify-between px-4 text-[15px] max-lg:flex-col max-lg:gap-[40px]"
      >
        <NuxtLink to="/redentia/about"> Sobre </NuxtLink>
        <NuxtLink to="/redentia/how-works"> Como funciona </NuxtLink>
        <NuxtLink to="/redentia/contact"> Contato </NuxtLink>
        <NuxtLink to="/redentia/privacy"> Privacidade </NuxtLink>
        <NuxtLink to="/redentia/terms"> Termos e políticas </NuxtLink>
        <NuxtLink to="/redentia/cookies">
          Política de cookies e privacidade
        </NuxtLink>
      </div>
    </div>
    <div
      class="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-2 pb-[105px] pt-[50px] max-lg:items-center"
    >
      <NuxtLink to="/">
        <IconLogoFull class="w-[150px] fill-white" />
      </NuxtLink>
      <div
        class="flex w-full items-center max-lg:flex-col max-lg:gap-6 lg:items-end lg:justify-between"
      >
        <p class="text-[12px] text-white/80 max-lg:text-center">
          @2025 Redentia. Todos os direitos reservados.
          <br />
          AV. PAULISTA 1106 SALA 01 ANDAR, Bela Vista, São Paulo, SP
        </p>
        <div class="flex items-center gap-3">
          <NuxtLink to="/download">
            <IconDownloadAppAppStore />
          </NuxtLink>
          <NuxtLink to="/download">
            <IconDownloadAppGooglePlay />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<template>
  <div class="flex w-full flex-col bg-black text-white">
    <div class="w-full border-y py-5">
      <div
        class="mx-auto flex max-w-[1400px] items-center justify-between text-[15px] max-lg:flex-col max-lg:gap-[40px]"
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
      class="mx-auto flex w-full max-w-[1400px] flex-col gap-6 pb-[105px] pt-[50px] max-lg:items-center"
    >
      <NuxtLink to="/">
        <IconLogoFull class="w-[150px] fill-white" />
      </NuxtLink>
      <div
        class="flex w-full items-center max-lg:flex-col max-lg:gap-6 lg:items-end lg:justify-between"
      >
        <p class="text-[12px] text-white/80 max-lg:text-center">
          @2025 Suble. Todos os direitos reservados.
          <br />
          NEW DAY MARKETING SOLUTIONS - FZCO - Etihad Airways Centre 5th Floor,
          Abu Dhabi, UAE
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
      <ClientOnly v-if="!colorMode?.forced">
        <UButton
          class="max-w-fit"
          :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
          color="neutral"
          variant="soft"
          :label="isDark ? 'Mudar para claro' : 'Mudar para escuro'"
          @click="isDark = !isDark"
        />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light'
  },
})
</script>

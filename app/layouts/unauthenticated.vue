<template>
  <div
    class="flex min-h-screen flex-col bg-gradient-to-b from-black via-neutral-950 to-black xl:p-4"
  >
    <MoleculesMobileMenuOverlay v-model:open="menuMobileActive" mode="public" />
    <header
      class="sticky top-0 z-20 flex items-center justify-between gap-4 bg-[#181818]/80 px-5 py-3 backdrop-blur-3xl xl:top-4 xl:rounded-[20px]"
      :style="{
        background: headerBg,
      }"
    >
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10 md:hidden"
          aria-label="Abrir menu"
          @click="menuMobileActive = true"
        >
          <UIcon name="i-lucide-menu" class="size-5" />
        </button>
        <slot name="header-branding">
          <NuxtLink to="/">
            <IconLogoFull
              class="mx-auto h-auto w-[150px] fill-white"
            />
          </NuxtLink>
        </slot>
      </div>

      <div class="hidden items-center gap-3 lg:flex">
        <div class="w-full max-w-xs">
          <MoleculesSearchAssets
            class="w-full rounded-full bg-white/5 py-2 text-white transition hover:bg-white/10"
          />
        </div>
        <NuxtLink
          to="/calculadora"
          class="group flex items-center justify-center rounded-full bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
        >
          Calculadoras
        </NuxtLink>
        <NuxtLink
          to="/help"
          class="text-secondary group flex min-w-max items-center justify-center rounded-full bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
        >
          <IconAi class="fill-secondary w-8" />
          Assessoria com IA
        </NuxtLink>
        <UButton
          to="/auth/login"
          color="secondary"
          size="sm"
          class="rounded-full"
        >
          Entrar
        </UButton>
      </div>

      <div class="flex items-center gap-2 max-sm:hidden lg:hidden">
        <UButton
          to="/auth/login"
          color="secondary"
          size="sm"
          class="rounded-full px-4"
        >
          Entrar
        </UButton>
      </div>
    </header>

    <main class="md:py-4">
      <slot />
    </main>
  </div>
  <Footer />
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: 'Static Page',
  },
  headerBg: {
    type: String,
    default: '',
  },
})

const menuMobileActive = ref(false)
</script>

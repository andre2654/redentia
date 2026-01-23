<template>
  <div
    class="flex min-h-screen flex-col bg-gradient-to-b from-black via-neutral-950 to-black xl:p-4"
  >
    <MoleculesMobileMenuOverlay v-model:open="menuMobileActive" mode="public" />
    <header
      class="sticky top-0 z-20 flex items-center justify-between gap-6 border-b border-white/5 bg-black/80 px-5 py-3 backdrop-blur-xl xl:top-4 xl:rounded-full xl:border xl:border-white/10"
      :style="{
        background: headerBg,
      }"
    >
      <!-- Logo + Menu mobile -->
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10 md:hidden"
          aria-label="Abrir menu"
          @click="menuMobileActive = true"
        >
          <UIcon name="i-lucide-menu" class="size-5" />
        </button>
        <slot name="header-branding">
          <NuxtLink to="/" class="transition-opacity hover:opacity-80">
            <IconLogoFull class="h-7 w-auto fill-white md:h-8" />
          </NuxtLink>
        </slot>
      </div>

      <!-- Navigation Desktop -->
      <nav class="hidden items-center gap-2 lg:flex">
        <!-- Search -->
        <MoleculesSearchAssets
          class="w-56 rounded-full border border-white/10 bg-white/5 py-2 text-white transition hover:border-white/20 hover:bg-white/10"
        />

        <!-- Links -->
        <NuxtLink
          to="/calculadora"
          class="group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          <UIcon name="i-lucide-calculator" class="h-4 w-4 opacity-60 group-hover:opacity-100" />
          Calculadoras
        </NuxtLink>

        <NuxtLink
          to="/help"
          class="group flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-2 text-sm font-medium text-secondary transition hover:border-secondary/40 hover:bg-secondary/10"
        >
          <IconAi class="fill-secondary h-4 w-4" />
          Assessoria com IA
        </NuxtLink>

        <!-- Divider -->
        <div class="mx-1 h-6 w-px bg-white/10" />

        <!-- Auth -->
        <UButton
          to="/auth/login"
          color="secondary"
          size="md"
          class="rounded-full px-5 font-medium transition-transform hover:scale-105"
        >
          Entrar
        </UButton>
      </nav>

      <!-- Tablet -->
      <div class="flex items-center gap-2 max-sm:hidden lg:hidden">
        <UButton
          to="/auth/login"
          color="secondary"
          size="sm"
          class="rounded-full px-5 font-medium"
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

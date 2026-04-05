<template>
  <div
    class="flex min-h-screen flex-col"
    :class="brand.hero?.variant !== 'institutional' ? 'xl:p-4' : ''"
  >
    <MoleculesMobileMenuOverlay v-model:open="menuMobileActive" mode="public" />
    <header
      class="z-20 flex items-center justify-between gap-6 border-b px-5 py-3"
      :class="brand.hero?.variant === 'institutional' ? '' : 'sticky top-0 backdrop-blur-xl xl:top-4 xl:rounded-full xl:border'"
      :style="{
        background: headerBg || (brand.colors.background + 'CC'),
        borderColor: brand.colors.border,
      }"
    >
      <!-- Logo + Menu mobile -->
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border transition md:hidden"
          :style="{
            borderColor: brand.colors.border,
            backgroundColor: brand.colors.surface,
            color: brand.colors.text,
          }"
          aria-label="Abrir menu"
          @click="menuMobileActive = true"
        >
          <UIcon name="i-lucide-menu" class="size-5" />
        </button>
        <slot name="header-branding">
          <NuxtLink to="/" class="transition-opacity hover:opacity-80">
            <BrandLogo variant="full" class="h-7 w-auto md:h-8" />
          </NuxtLink>
        </slot>
      </div>

      <!-- Navigation Desktop -->
      <nav class="hidden items-center gap-2 lg:flex">
        <!-- Search -->
        <MoleculesSearchAssets
          class="w-56 rounded-full border py-2 transition"
          :style="{
            borderColor: brand.colors.border,
            backgroundColor: brand.colors.surface,
            color: brand.colors.text,
          }"
        />

        <!-- Links -->
        <NuxtLink
          to="/calculadora"
          class="group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition"
          :style="{
            color: brand.colors.textMuted,
          }"
          @mouseenter="($event.currentTarget as HTMLElement).style.color = brand.colors.text; ($event.currentTarget as HTMLElement).style.backgroundColor = brand.colors.surface"
          @mouseleave="($event.currentTarget as HTMLElement).style.color = brand.colors.textMuted; ($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
        >
          <UIcon name="i-lucide-calculator" class="h-4 w-4 opacity-60 group-hover:opacity-100" />
          {{ brand.nav.headerCalc }}
        </NuxtLink>

        <NuxtLink
          to="/help"
          class="group flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/5 px-4 py-2 text-sm font-medium text-secondary transition hover:border-secondary/40 hover:bg-secondary/10"
        >
          <IconAi class="fill-secondary h-4 w-4" />
          {{ brand.nav.headerAI }}
        </NuxtLink>

        <!-- Divider -->
        <div class="mx-1 h-6 w-px" :style="{ backgroundColor: brand.colors.border }" />

        <!-- Auth -->
        <UButton
          to="/auth/login"
          color="secondary"
          size="md"
          class="rounded-full px-5 font-medium transition-transform hover:scale-105"
        >
          {{ brand.nav.login }}
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
          {{ brand.nav.login }}
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

const brand = useBrand()
const menuMobileActive = ref(false)
</script>

<template>
  <div
    class="selection:bg-primary min-h-screen font-sans selection:text-black"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Header -->
    <header
      class="fixed top-0 z-50 w-full border-b backdrop-blur-xl"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background + '80' }"
    >
      <div
        class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"
      >
        <NuxtLink
          to="/"
          class="group flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <BrandLogo
            variant="full"
            class="h-8 w-auto transition-transform group-hover:scale-105 md:h-9"
          />
        </NuxtLink>
        <UButton
          to="/"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          class="hidden sm:flex"
        >
          Voltar para o site
        </UButton>
      </div>
    </header>

    <main class="relative px-6 pb-20 pt-32">
      <!-- Background Effects -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          class="bg-primary/10 absolute -top-[20%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]"
        />
        <div
          class="bg-secondary/5 absolute right-[10%] top-[20%] h-[300px] w-[300px] rounded-full blur-[100px]"
        />
      </div>

      <div class="relative z-10 mx-auto max-w-4xl">
        <!-- Title -->
        <h1
          v-if="title"
          class="mb-12 text-center text-4xl font-bold tracking-tight md:text-6xl"
          :style="{ color: brand.colors.text }"
        >
          <span
            class="bg-linear-to-b bg-clip-text text-transparent"
            :style="{ backgroundImage: `linear-gradient(to bottom, ${brand.colors.text}, ${brand.colors.textMuted})` }"
          >
            {{ title }}
          </span>
        </h1>

        <!-- Content -->
        <div class="static-content text-lg" :style="{ color: brand.colors.textMuted }">
          <slot />
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script lang="ts" setup>
const brand = useBrand()

defineProps({
  title: {
    type: String,
    default: '',
  },
  showLogo: {
    type: Boolean,
    default: true,
  },
})
</script>

<style>
@reference "../assets/css/main.css";

.static-content h1 {
  @apply mb-6 mt-10 hidden text-3xl font-bold; /* Hide h1 inside content if it duplicates the title */
  color: var(--brand-text);
}

.static-content h2 {
  @apply mb-4 mt-8 text-2xl font-bold;
  color: var(--brand-text);
}

.static-content h3 {
  @apply mb-3 mt-6 text-xl font-bold;
  color: var(--brand-text);
}

.static-content p {
  @apply mb-6 leading-relaxed;
}

.static-content strong {
  @apply font-semibold;
  color: var(--brand-text);
}

.static-content ul {
  @apply mb-6 list-disc space-y-2 pl-6;
}

.static-content li {
  @apply pl-2;
}

.static-content a:not(.normal-static-link) {
  @apply text-primary hover:text-primary/80 transition-colors hover:underline;
}
</style>

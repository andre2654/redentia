<template>
  <div
    class="selection:bg-primary min-h-screen bg-black font-sans text-white selection:text-black"
  >
    <!-- Header -->
    <header
      class="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl"
    >
      <div
        class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"
      >
        <NuxtLink
          to="/"
          class="group flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <IconLogoFull
            class="h-8 w-auto fill-white transition-transform group-hover:scale-105 md:h-9"
          />
        </NuxtLink>
        <UButton
          to="/"
          variant="ghost"
          color="white"
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
          class="mb-12 text-center text-4xl font-bold tracking-tight text-white md:text-6xl"
        >
          <span
            class="bg-linear-to-b from-white to-white/60 bg-clip-text text-transparent"
          >
            {{ title }}
          </span>
        </h1>

        <!-- Content -->
        <div class="static-content text-lg text-gray-400">
          <slot />
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script lang="ts" setup>
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
  @apply mb-6 mt-10 hidden text-3xl font-bold text-white; /* Hide h1 inside content if it duplicates the title */
}

.static-content h2 {
  @apply mb-4 mt-8 text-2xl font-bold text-white;
}

.static-content h3 {
  @apply mb-3 mt-6 text-xl font-bold text-white;
}

.static-content p {
  @apply mb-6 leading-relaxed;
}

.static-content strong {
  @apply font-semibold text-white;
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

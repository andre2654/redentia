<template>
  <div
    class="mx-auto flex max-w-[1400px] flex-col min-[1400px]:border-x"
  >
    <div v-if="showLogo" class="py-5">
      <NuxtLink to="/">
        <IconLogoFull
          class="mx-auto h-auto w-[200px] fill-white"
        />
      </NuxtLink>
    </div>
    <h1
      v-if="title"
      class="text-shadow-lg bg-tertiary flex h-[200px] w-full items-center justify-center text-center text-[45px] font-bold text-white"
    >
      {{ title }}
    </h1>
    <div class="py-4">
      <slot />
    </div>
  </div>
  <Footer />
</template>

<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    default: 'Static Page',
  },
  showLogo: {
    type: Boolean,
    default: true,
  },
})
</script>

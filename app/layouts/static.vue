<template>
  <div class="mx-auto flex max-w-[1400px] flex-col border-x">
    <div class="py-5">
      <NuxtLink to="/">
        <IconLogoFull class="mx-auto h-auto w-[200px] fill-white" />
      </NuxtLink>
    </div>
    <h1
      class="text-shadow-lg flex h-[200px] w-full items-center justify-center bg-[url('/assets/images/blue-bg.png')] bg-cover bg-center text-center text-[45px] font-bold"
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
})
</script>

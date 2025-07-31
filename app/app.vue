<template>
  <UApp :toaster="uAppConfig.toaster">
    <AtomsInstallAppBanner />
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'

const uAppConfig = {
  toaster: {
    position: 'top-right',
    expand: false,
  },
}

const interfaceStore = useInterfaceStore()

// add class on body
useHead({
  bodyAttrs: {
    class: computed(() => (interfaceStore.revealAmount ? '' : 'hide-amount')),
  },
})
</script>

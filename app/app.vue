<template>
  <UApp :toaster="uAppConfig.toaster">
    <MoleculesModalsSelectTheme
      v-if="
        !nuxtColorModeLocalStorage || nuxtColorModeLocalStorage === 'system'
      "
    />
    <!-- <AtomsInstallAppBanner v-if="showBanner" class="max-xl:hidden" /> -->
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
const uAppConfig = {
  toaster: {
    position: 'top-right',
    expand: false,
  },
}

const interfaceStore = useInterfaceStore()
const route = useRoute()

const showBanner = computed(() => {
  return !route.meta.hideInstallAppBanner
})

onMounted(() => {
  watchEffect(() => {
    document.body.classList.toggle('hide-amount', !interfaceStore.revealAmount)
  })
})

const nuxtColorModeLocalStorage = localStorage.getItem('nuxt-color-mode')
</script>

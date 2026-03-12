<template>
  <Analytics />
  <NuxtPwaManifest />
  <UApp :toaster="uAppConfig?.toaster">
    <AtomsInstallAppBanner v-if="showBanner" />
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt'
const uAppConfig = {
  toaster: {
    position: 'top-right',
    expand: false,
  },
}

initBrandFromRoute()

const interfaceStore = useInterfaceStore()
const route = useRoute()

const showBanner = computed(() => {
  return !route.meta.hideInstallAppBanner && !interfaceStore.hideInstallBanner
})

const { checkPermission, listen, cleanup } = useFirebaseNotifications()

onMounted(() => {
  checkPermission()
  listen()

  watch(() => interfaceStore.revealAmount, (reveal) => {
    document.body.classList.toggle('hide-amount', !reveal)
  }, { immediate: true })
})

onUnmounted(() => {
  cleanup()
})
</script>

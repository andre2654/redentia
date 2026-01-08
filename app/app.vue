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

const interfaceStore = useInterfaceStore()
const route = useRoute()

const showBanner = computed(() => {
  return !route.meta.hideInstallAppBanner && !interfaceStore.hideInstallBanner
})

const { checkPermission, listen } = useFirebaseNotifications()

onMounted(() => {
  checkPermission()
  listen()

  watchEffect(() => {
    document.body.classList.toggle('hide-amount', !interfaceStore.revealAmount)
  })
})
</script>

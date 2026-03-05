<template>
  <Analytics />
  <NuxtPwaManifest />
  <AtomsBrandSwitcher v-if="isDev" />
  <UApp :toaster="uAppConfig?.toaster">
    <div :class="{ 'pt-10': isDev }">
      <AtomsInstallAppBanner v-if="showBanner" />
      <NuxtPage />
    </div>
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

const isDev = import.meta.dev
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

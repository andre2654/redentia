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

// Viewport width tracked reactively so the install banner can be hidden on
// desktop where PWA install is rare and the banner just steals above-the-fold.
const viewportWidth = ref(1920) // SSR-safe default (desktop)
if (import.meta.client) {
  viewportWidth.value = window.innerWidth
  window.addEventListener('resize', () => {
    viewportWidth.value = window.innerWidth
  })
}

const showBanner = computed(() => {
  if (route.meta.hideInstallAppBanner) return false
  if (interfaceStore.hideInstallBanner) return false
  // Only show on mobile/tablet where installing a PWA actually makes sense.
  if (viewportWidth.value >= 1024) return false
  return true
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

<template>
  <Analytics />
  <NuxtPwaManifest />
  <UApp :toaster="uAppConfig?.toaster">
    <!-- ClientOnly so the SSR never attempts to render this banner
         (SSR viewport = desktop default, but client viewport can be
         anything, the mismatch would cascade through the whole tree
         and break the brand reactive state on hydration). -->
    <ClientOnly>
      <AtomsInstallAppBanner v-if="showBanner" />
    </ClientOnly>
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

// Tenant resolution is handled server-side by:
//   - server/middleware/0-tenant-resolver.ts, decides the slug from
//     host/query/default, writes to event.context.tenantSlug
//   - plugins/tenant.server.ts, reads the context and populates
//     useState('brand:active') BEFORE any component runs
// so `useBrand()` is guaranteed correct by the time app.vue mounts.
// No init function needed here. Client-side navigations with
// `?brand=` overrides are handled by plugins/brand-router.client.ts.

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

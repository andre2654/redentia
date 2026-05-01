<template>
  <Analytics />
  <NuxtPwaManifest />
  <UApp :toaster="uAppConfig?.toaster">
    <!-- Install banner — rendered in SSR so the layout reserves space and
         the page doesn't shift on hydration (was a CLS culprit when wrapped
         in ClientOnly + JS viewport gating). Visibility is controlled by:
           - `v-if`  → route opts out (e.g. /download, /help) — SSR-safe.
           - `v-show` → user dismissed the banner (Pinia persisted, only
              available client-side; brief flash on subsequent visits when
              dismissed, acceptable since SSR can't read localStorage).
           - `lg:hidden` Tailwind class → CSS-only mobile gate; SSR HTML
              always has the banner, desktop hides it via media query, no
              JS viewport check needed. -->
    <AtomsInstallAppBanner
      v-if="!route.meta.hideInstallAppBanner"
      v-show="!interfaceStore.hideInstallBanner"
      class="lg:hidden"
    />
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

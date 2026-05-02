<template>
  <Analytics />
  <NuxtPwaManifest />
  <UApp :toaster="uAppConfig?.toaster">
    <!-- Install banner — TEMPORARIAMENTE DESABILITADO em todas as telas.
         Pra reativar, descomenta o bloco abaixo. Mantido em comentario
         (em vez de delete) porque a logica de SSR + lg:hidden ja esta
         resolvida e a gente nao quer ter que reescrever isso depois. -->
    <!--
    <AtomsInstallAppBanner
      v-if="!route.meta.hideInstallAppBanner"
      v-show="!interfaceStore.hideInstallBanner"
      class="lg:hidden"
    />
    -->
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

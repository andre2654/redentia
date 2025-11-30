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

const { checkPermission, requestPermission, listen, permissionStatus } =
  useFirebaseNotifications()
const toast = useToast()

onMounted(() => {
  checkPermission()
  listen()

  if (permissionStatus.value === 'default') {
    toast.add({
      title: 'Ativar notificações',
      description: 'Receba alertas de mercado e dividendos em tempo real.',
      icon: 'i-heroicons-bell',
      timeout: 0,
      actions: [
        {
          label: 'Ativar',
          click: () => requestPermission(),
        },
      ],
    })
  }

  watchEffect(() => {
    document.body.classList.toggle('hide-amount', !interfaceStore.revealAmount)
  })
})
</script>

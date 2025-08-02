<template>
  <UApp :toaster="uAppConfig.toaster">
    <AtomsInstallAppBanner v-if="showBanner" class="max-xl:hidden" />
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
  const preventBannerRoutes = ['/download', '/auth/login', '/auth/register']
  return !preventBannerRoutes.includes(route.path)
})

onMounted(() => {
  watchEffect(() => {
    document.body.classList.toggle('hide-amount', !interfaceStore.revealAmount)
  })
})
</script>

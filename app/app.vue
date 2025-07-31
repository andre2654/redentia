<template>
  <UApp :toaster="uAppConfig.toaster">
    <AtomsInstallAppBanner />
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

onMounted(() => {
  watchEffect(() => {
    document.body.classList.toggle('hide-amount', !interfaceStore.revealAmount)
  })
})
</script>

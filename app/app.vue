<template>
  <UApp :toaster="uAppConfig.toaster">
    <AtomsInstallAppBanner
      v-if="route.path !== '/download'"
      class="max-xl:hidden"
    />
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

onMounted(() => {
  watchEffect(() => {
    document.body.classList.toggle('hide-amount', !interfaceStore.revealAmount)
  })
})
</script>

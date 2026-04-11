<template>
  <NuxtPage />
</template>

<script setup lang="ts">
// Parent wrapper for the docs section. All real content lives in
// `docs/index.vue` (intro) and `docs/[endpoint].vue` (endpoint
// detail pages). Nuxt requires the parent route file to exist and
// render <NuxtPage /> when sibling child files are present under
// the same slug.
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>

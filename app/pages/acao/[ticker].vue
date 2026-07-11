<script setup lang="ts">
const ticker = String(useRoute().params.ticker ?? '').toUpperCase()
usePageSeo({ title: `${ticker}`, description: 'Redentia Nu — em construção.', noindex: true })
</script>
<template><NuStubSection :title="`Ação ${ticker} (PR2)`" /></template>

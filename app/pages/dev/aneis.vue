<script setup lang="ts">
// SÓ NO DEV: o endereço antigo da página do losango (03/11/2026, quando ela
// mostrava os esboços que disputavam o lugar dos anéis). Leva à /dev/losango
// com a mesma query; em produção é 404, como ela.
definePageMeta({
  layout: false,
  middleware: [(to) => {
    if (!import.meta.dev) return abortNavigation(createError({ statusCode: 404, statusMessage: 'Página não encontrada' }))
    return navigateTo({ path: '/dev/losango', query: to.query }, { redirectCode: 301 })
  }],
})
</script>

<template>
  <div />
</template>

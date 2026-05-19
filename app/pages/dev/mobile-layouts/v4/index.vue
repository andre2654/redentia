<!--
  V4 — Mercury Bank style (Redentia Hi-Fi v2).
  Index redireciona pra home. Cada tela é um arquivo separado
  em /v4/X.vue (home, carteira, raio-x, carta, chat, calc, rankings,
  mercado, ativo, settings).
-->
<script setup lang="ts">
definePageMeta({ layout: false })

onMounted(() => {
  navigateTo('/dev/mobile-layouts/v4/home')
})
</script>

<template>
  <div style="display:grid; place-items:center; min-height:100vh; background:#F8F6F1;">
    <div style="font-family:'Inter',sans-serif; color:rgba(15,15,14,.5); font-size:13px;">Redirecionando...</div>
  </div>
</template>

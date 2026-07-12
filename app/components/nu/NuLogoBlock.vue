<script setup lang="ts">
// Quadrado 76×76 azul com o logo branco 34×34 — âncora de marca no canto das
// telas de auth (contrato: Redentia Login Nu.dc.html) e escape hatch de
// navegação (default: volta pro /mercado).
withDefaults(defineProps<{ to?: string }>(), { to: '/mercado' })
</script>

<template>
  <NuxtLink :to="to" class="nlb" aria-label="Redentia — voltar ao mercado">
    <img src="/logo-branca.svg" alt="Redentia" class="nlb__logo">
  </NuxtLink>
</template>

<style scoped>
/* sem radius de propósito — o bloco é flush no canto da viewport */
.nlb {
  width: 76px; height: 76px; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}
.nlb__logo { width: 34px; height: 34px; display: block; object-fit: contain; }
</style>

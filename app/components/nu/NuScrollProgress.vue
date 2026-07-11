<script setup lang="ts">
// Barra de progresso de leitura (4px, azul, fixa no topo, z-60) — width =
// scrollY / (scrollHeight - innerHeight). Valores exatos do design
// (Redentia Guia Open Finance.dc.html). Reutilizável em página de leitura longa.
const width = ref(0)

useNuScrollFrame(() => {
  const h = document.documentElement
  const max = (h.scrollHeight - window.innerHeight) || 1
  width.value = Math.max(0, Math.min(100, (window.scrollY / max) * 100))
})
</script>

<template>
  <div class="nsp" :style="{ width: `${width.toFixed(2)}%` }" aria-hidden="true" />
</template>

<style scoped>
.nsp {
  position: fixed; top: 0; left: 0; height: 4px; width: 0;
  background: var(--nu-blue); z-index: 60;
}
</style>

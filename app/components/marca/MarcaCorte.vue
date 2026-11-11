<script setup lang="ts">
// O corte azul do "t" do wordmark, sozinho: é o sinal da marca nos eyebrows,
// no input mágico, no avatar da IA e no painel do login. Herda a cor do texto
// quando `cor` não vem (currentColor); por padrão é cobalto.
withDefaults(defineProps<{ largura?: number; cor?: string }>(), { largura: 22, cor: 'var(--nu-blue)' })
</script>

<template>
  <svg class="mkc" viewBox="0 -9 66 54" :width="largura" :height="Math.round(largura * 54 / 66)" aria-hidden="true">
    <path d="M0 44 V0 H36 C48 0 58 -2 64 -8 C66 8 58 23 40 23 H25 C11 23 2 31 0 44 Z" :fill="cor" />
  </svg>
</template>

<style scoped>
.mkc { display: block; flex: none; }
</style>

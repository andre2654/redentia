<script setup lang="ts">
// A frase da conta, no slot "frase" do CalcConta (21/10/2026): o texto corrido
// com os campos que se mexem (CalcFraseCampo) no meio. Era o mesmo CSS
// repetido em cada calculadora na frase.
</script>

<template>
  <p class="cfr"><slot /></p>
</template>

<style scoped>
.cfr { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display); letter-spacing: -0.025em; line-height: 1.55; text-wrap: pretty; }
@media (max-width: 640px) {
  .cfr { line-height: 1.7; }
}
</style>

<script setup lang="ts">
// O ícone do app: o "a" do wordmark em branco sobre o cobalto em degradê.
// Aparece onde a marca precisa caber num quadrado (avatar, cartão, aviso).
withDefaults(defineProps<{ tamanho?: number; rotulo?: string }>(), { tamanho: 44, rotulo: '' })
</script>

<template>
  <span
    class="mki" :style="{ width: `${tamanho}px`, height: `${tamanho}px`, borderRadius: `${Math.round(tamanho * 0.245)}px` }"
    :role="rotulo ? 'img' : undefined" :aria-label="rotulo || undefined" :aria-hidden="rotulo ? undefined : 'true'"
  >
    <svg viewBox="0 0 110 104" :width.attr="Math.round(tamanho * 0.545)" :height.attr="Math.round(tamanho * 0.515)" aria-hidden="true">
      <circle cx="50" cy="54" r="36" fill="none" stroke="#fff" stroke-width="27" />
      <rect x="82" y="6" width="26" height="98" fill="#fff" />
    </svg>
  </span>
</template>

<style scoped>
.mki {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  background: linear-gradient(150deg, #3B74FF 0%, #1238C9 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}
</style>

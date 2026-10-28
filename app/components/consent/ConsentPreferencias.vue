<script setup lang="ts">
// Reabre o aviso para quem já escolheu. Mesmo controle do rodapé.
const { reabrir } = useConsent()
</script>

<template>
  <div class="ckp">
    <button type="button" class="ckp__btn" @click="reabrir">Preferências de cookies</button>
  </div>
</template>

<style scoped>
.ckp {
  background: var(--nu-cream);
  padding: 0 clamp(22px, 5.5vw, 80px) clamp(8px, 2vw, 16px);
}
.ckp__btn {
  margin: 0;
  padding: 8px 14px;
  border-radius: var(--nu-r-pill);
  border: 1px solid var(--nu-navy);
  background: transparent;
  color: var(--nu-navy);
  font-family: inherit;
  font-size: var(--nu-fs-sm);
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
}
.ckp__btn:hover { background: var(--nu-white); }
.ckp__btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
</style>

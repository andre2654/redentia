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
  background: var(--nu-page);
  padding: 0 max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(8px, 2vw, 16px);
}
.ckp__btn {
  margin: 0;
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--nu-r-pill);
  border: 0;
  box-shadow: inset 0 0 0 1.5px var(--nu-ink);
  background: var(--nu-white);
  color: var(--nu-ink);
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
  transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.ckp__btn:hover { background: var(--nu-row-hover); }
.ckp__btn:active { transform: scale(.98); }
@media (prefers-reduced-motion: reduce) { .ckp__btn { transition: none; } }
</style>

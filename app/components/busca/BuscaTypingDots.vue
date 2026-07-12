<script setup lang="ts">
// Indicador "pensando" — avatar da IA + pill translúcida com 3 dots
// (animação qdot do design, renomeada nu-qdot).
// Contrato de UX: Redentia Busca Nu.dc.html (linhas 193-202).
</script>

<template>
  <div class="btd" role="status" aria-label="Redentia AI está digitando">
    <span class="btd__avatar" aria-hidden="true">
      <img src="/logo-branca.svg" alt="" class="btd__avatar-img">
    </span>
    <span class="btd__pill" aria-hidden="true">
      <span class="btd__dot" />
      <span class="btd__dot btd__dot--2" />
      <span class="btd__dot btd__dot--3" />
    </span>
  </div>
</template>

<style scoped>
.btd { display: flex; gap: 12px; margin: 20px 0; align-items: center; }
.btd__avatar {
  width: 32px; height: 32px; flex-shrink: 0; border-radius: 10px;
  background: var(--nu-blue); display: flex; align-items: center; justify-content: center;
}
.btd__avatar-img { width: 17px; height: 17px; display: block; object-fit: contain; }
.btd__pill {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--nu-cream-text-10); border-radius: var(--nu-r-pill); padding: 12px 16px;
}
.btd__dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--nu-cream-text-85);
  animation: nu-qdot 1.2s ease-in-out infinite;
}
.btd__dot--2 { animation-delay: .15s; }
.btd__dot--3 { animation-delay: .3s; }
@keyframes nu-qdot {
  0%, 80%, 100% { transform: translateY(0); opacity: .35; }
  40% { transform: translateY(-4px); opacity: 1; }
}
</style>

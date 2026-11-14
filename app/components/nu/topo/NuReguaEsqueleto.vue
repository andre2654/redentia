<script setup lang="ts">
// O esqueleto da régua do mercado: a forma da barra das ações (NuReguaBolsa)
// enquanto o dado não chega. O estado, o fio, a barra e o número, nas mesmas
// medidas dela: gap de 16 (12 no tablet, 10 no celular), o fio de 16 e a barra
// de 28 px (22 no celular; 12/11/2026, o dono: "mais alta essa barra, com
// menos padding"). Mora numa peça própria para a régua (NuMarketTicker) e a
// vitrine do dev (/dev/regua) mostrarem o mesmo.
</script>

<template>
  <div class="nre" aria-hidden="true">
    <NuSkeleton variant="line" width="92px" height="12px" radius="pill" class="nre__estado" />
    <span class="nre__fio" />
    <NuSkeleton variant="block" height="28px" radius="var(--nu-r-tag-p)" class="nre__barra" />
    <NuSkeleton variant="line" width="180px" height="12px" radius="pill" class="nre__leg" />
  </div>
</template>

<style scoped>
.nre { flex: 1 1 auto; min-width: 0; height: 100%; display: flex; align-items: center; gap: 16px; overflow: hidden; }
.nre__estado, .nre__leg { flex: none; }
.nre__fio { flex: none; width: 1px; height: 16px; background: var(--nu-line-2); }
.nre__barra { flex: 1 1 auto; min-width: 48px; }
@media (max-width: 1023px) { .nre { gap: 12px; } }
@media (max-width: 640px) {
  .nre { gap: 10px; }
  .nre__estado { width: 34px !important; }
  .nre__fio { display: none; }
  .nre__barra { height: 22px !important; min-width: 40px; }
  .nre__leg { width: 58px !important; }
}
</style>

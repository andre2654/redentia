<script setup lang="ts">
// Card compacto de convite à IA (kicker uppercase azul + frase 700), creme
// com hover #EFE9DD — usado no TOC do guia, serve em qualquer sidebar.
// Valores exatos do design (Redentia Guia Open Finance.dc.html).
defineProps<{ kicker: string; text: string; to: string }>()
</script>

<template>
  <NuxtLink :to="to" class="napc">
    <span class="napc__kicker">{{ kicker }}</span>
    <span class="napc__text">{{ text }}</span>
  </NuxtLink>
</template>

<style scoped>
.napc {
  display: block; background: var(--nu-cream); border-radius: 18px;
  padding: 20px; transition: background .2s;
}
.napc:hover { background: var(--nu-cream-4); }
.napc__kicker {
  display: block; color: var(--nu-blue); font-size: 11.5px; font-weight: 800;
  letter-spacing: 1.2px; text-transform: uppercase;
}
.napc__text {
  display: block; color: var(--nu-ink); font-size: 14.5px; font-weight: 700;
  line-height: 1.45; margin-top: 8px;
}
</style>

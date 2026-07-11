<script setup lang="ts">
// Banner-link de conversão azul sólido: título branco 800, subtítulo
// translúcido, círculo creme com chevron azul. Hover: fundo mais escuro +
// lift -2px. Valores exatos do design (Redentia Guia Open Finance.dc.html).
defineProps<{ title: string; subtitle: string; to: string }>()
</script>

<template>
  <NuxtLink :to="to" class="ncb">
    <span class="ncb__main">
      <span class="ncb__title">{{ title }}</span>
      <span class="ncb__sub">{{ subtitle }}</span>
    </span>
    <span class="ncb__circle">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
    </span>
  </NuxtLink>
</template>

<style scoped>
.ncb {
  display: flex; align-items: center; gap: 20px;
  background: var(--nu-blue); border-radius: var(--nu-r-card);
  padding: clamp(24px, 3vw, 34px);
  transition: background .2s, transform .15s;
}
.ncb:hover { background: var(--nu-blue-hover); transform: translateY(-2px); }
.ncb__main { flex: 1; min-width: 0; }
.ncb__title {
  display: block; color: var(--nu-white); font-size: clamp(20px, 2.2vw, 26px);
  font-weight: 800; letter-spacing: -.3px; line-height: 1.2;
}
.ncb__sub { display: block; color: var(--nu-white-75); font-size: 15px; font-weight: 500; margin-top: 8px; }
.ncb__circle {
  width: 52px; height: 52px; flex-shrink: 0; border-radius: 50%;
  background: var(--nu-cream); color: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
}
</style>

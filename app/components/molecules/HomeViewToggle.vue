<!--
  HomeViewToggle — par de NuxtLinks "Para você" (/para-voce) |
  "Mercado completo" (/). Estado ativo derivado da rota atual.

  Após o swap de rotas (2026-05-17):
    - / = mercado completo (landing/marketing default pra anônimo)
    - /para-voce = view editorial filtrada (IBOVESPA HOJE + temas + resumo)
-->
<template>
  <nav class="hvt" role="tablist" aria-label="Modo de visualização">
    <NuxtLink
      to="/para-voce"
      role="tab"
      :aria-selected="isParaVoce"
      :class="['hvt-btn', { 'is-active': isParaVoce }]"
    >
      <UIcon name="i-lucide-user" class="size-3.5" />
      <span>Para você</span>
    </NuxtLink>
    <NuxtLink
      to="/"
      role="tab"
      :aria-selected="!isParaVoce"
      :class="['hvt-btn', { 'is-active': !isParaVoce }]"
    >
      <UIcon name="i-lucide-globe" class="size-3.5" />
      <span>Mercado completo</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const isParaVoce = computed(() => route.path === '/para-voce')
</script>

<style scoped>
.hvt {
  display: inline-flex; gap: 6px; padding: 4px;
  background: var(--bg-elevated);
  border-radius: 999px;
}
.hvt-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 0;
  border-radius: 999px;
  font-size: 13px; font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
  transition: all 200ms;
}
.hvt-btn :deep(*) { color: var(--text-muted); flex-shrink: 0; }
.hvt-btn:hover { color: var(--text-heading); }
.hvt-btn:hover :deep(*) { color: var(--text-heading); }
.hvt-btn.is-active {
  background: var(--text-heading);
  color: var(--bg-base);
  box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--text-heading) 30%, transparent);
}
.hvt-btn.is-active :deep(*) { color: var(--bg-base); }
</style>

<script setup lang="ts">
// Navegação lateral de /conta (mockup: item ativo = card branco com sombra;
// inativos = plano sobre o creme). Sub-rotas reais por seção → deep-link e o
// voltar do browser funcionam. Sticky no desktop; vira lista/tira no mobile.
const route = useRoute()

const items = [
  { to: '/conta/perfil', label: 'Perfil', icon: 'user' },
  { to: '/conta/notificacoes', label: 'Notificações', icon: 'bell' },
  { to: '/conta/open-finance', label: 'Open Finance', icon: 'link' },
  { to: '/conta/mcp', label: 'Redentia MCP', icon: 'mcp' },
  { to: '/conta/seguranca', label: 'Segurança', icon: 'shield' },
] as const

const ICON: Record<string, string[]> = {
  user: ['M20 21a8 8 0 0 0-16 0', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
  link: ['M9 17H7A5 5 0 0 1 7 7h2', 'M15 7h2a5 5 0 0 1 0 10h-2', 'M8 12h8'],
  mcp: ['M12 3v18', 'M3 12h18', 'M5.6 5.6l12.8 12.8', 'M18.4 5.6 5.6 18.4'],
  shield: ['M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3Z'],
}

function isActive(to: string) {
  return route.path === to
}
</script>

<template>
  <nav class="csb" aria-label="Seções da conta">
    <NuxtLink
      v-for="it in items"
      :key="it.to"
      :to="it.to"
      class="csb__item"
      :class="{ 'csb__item--active': isActive(it.to) }"
      :aria-current="isActive(it.to) ? 'page' : undefined"
    >
      <svg class="csb__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path v-for="d in ICON[it.icon]" :key="d" :d="d" />
      </svg>
      <span>{{ it.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.csb { display: flex; flex-direction: column; gap: 4px; }
.csb__item {
  display: flex; align-items: center; gap: 13px;
  padding: 13px 16px; border-radius: var(--nu-r-input);
  color: var(--nu-gray-2); font-size: 15.5px; font-weight: 700;
  transition: background .18s, color .18s, box-shadow .18s;
}
.csb__item:hover { color: var(--nu-ink); background: var(--nu-cream-hover); }
.csb__item--active,
.csb__item--active:hover {
  background: var(--nu-white); color: var(--nu-ink); box-shadow: var(--nu-shadow-card);
}
.csb__icon { flex-shrink: 0; color: var(--nu-gray); transition: color .18s; }
.csb__item:hover .csb__icon,
.csb__item--active .csb__icon { color: var(--nu-blue); }

@media (max-width: 860px) {
  .csb { flex-direction: row; overflow-x: auto; gap: 8px; padding-bottom: 4px; }
  .csb__item { flex-shrink: 0; padding: 11px 16px; }
}
</style>

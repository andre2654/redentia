<script setup lang="ts">
// Placeholder de seção de /conta ainda não construída (Notificações, Open
// Finance, MCP, Segurança chegam nos próximos PRs). Mantém a navegação da
// sidebar coerente sem 404. Reusa o ContaSection (card branco padrão).
defineProps<{ title: string; subtitle?: string; note?: string }>()
</script>

<template>
  <ContaSection :title="title" :subtitle="subtitle">
    <div class="cph">
      <span class="cph__badge">Em breve</span>
      <p class="cph__txt">{{ note ?? 'Esta seção chega nas próximas atualizações.' }}</p>
    </div>
  </ContaSection>
</template>

<style scoped>
.cph { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; padding: 8px 0 12px; }
.cph__badge {
  background: var(--nu-cream); color: var(--nu-gray-2);
  font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
  padding: 6px 12px; border-radius: var(--nu-r-pill);
}
.cph__txt { margin: 0; color: var(--nu-gray-2); font-size: 15px; font-weight: 500; }
</style>

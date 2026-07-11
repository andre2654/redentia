<script setup lang="ts">
// Knowledge Graph — visualização admin do KG vivo do chat-service.
// A renderização mora em <AdminKgGraphCanvas>; aqui é só o chrome do admin.
definePageMeta({ middleware: ['admin-panel'] })

const stats = ref({ entities: 0, links: 0, claims: 0 })
const canvasRef = ref<{ reload: () => void } | null>(null)
</script>

<template>
  <NuxtLayout name="admin-panel">
    <div class="admin-page">
      <header class="admin-page__head">
        <div class="admin-page__head-left">
          <span class="admin-page__eyebrow">
            <UIcon name="i-lucide-share-2" />
            Knowledge Graph
          </span>
          <h1 class="admin-page__title">Grafo de conhecimento</h1>
          <p class="admin-page__lead">
            O KG vivo do Atlas: entidades (ativos, setores, teses) ligadas pelo que
            notícias, análises e teses registraram. Tamanho do nó = nº de claims.
            Passe o mouse pra ver rótulo e conexões.
          </p>
        </div>
        <div class="admin-page__actions">
          <button
            type="button" class="admin-btn admin-btn--ghost admin-btn--sm"
            style="color: var(--brand-primary); border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);"
            @click="canvasRef?.reload()"
          >
            <UIcon name="i-lucide-refresh-cw" class="size-3.5" />
            Atualizar
          </button>
        </div>
      </header>

      <div class="kg-legend">
        <span class="kg-stat"><b>{{ stats.entities }}</b> entidades</span>
        <span class="kg-stat"><b>{{ stats.links }}</b> relações</span>
        <span class="kg-stat"><b>{{ stats.claims.toLocaleString('pt-BR') }}</b> claims</span>
        <span class="kg-leg"><span class="kg-dot" style="background:#4FD6A8" />ativo</span>
        <span class="kg-leg"><span class="kg-dot" style="background:#EF9F27" />setor</span>
        <span class="kg-leg"><span class="kg-dot" style="background:#DDFF33" />tese</span>
      </div>

      <AdminKgGraphCanvas ref="canvasRef" @stats="stats = $event" />
    </div>
  </NuxtLayout>
</template>

<style scoped>
.kg-legend {
  display: flex; flex-wrap: wrap; align-items: center; gap: 16px;
  font-family: ui-monospace, monospace; font-size: 12px; margin-bottom: 12px;
  color: var(--brand-text-muted, #8b8b93);
}
.kg-stat b { color: var(--brand-text, inherit); font-weight: 600; }
.kg-leg { display: inline-flex; align-items: center; gap: 6px; }
.kg-dot { width: 9px; height: 9px; border-radius: 50%; }
</style>

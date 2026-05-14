<!--
  RankingUiShell: layout V5 puro pras páginas de ranking.
  Slots: hero (esquerda no desktop), leader (direita no desktop).
  Aceita conteúdo livre abaixo via default slot (lista, filtros, edu, FAQ, etc).
  Props: backTo, backLabel, lastUpdated, statusMeta.
-->
<template>
  <article class="rk-shell">
    <div class="rk-shell-atmo rk-shell-atmo--top" aria-hidden="true" />
    <div class="rk-shell-atmo rk-shell-atmo--bottom" aria-hidden="true" />

    <div v-if="backTo || statusMeta" class="rk-shell-status">
      <NuxtLink v-if="backTo" :to="backTo" class="rk-shell-back">
        <UIcon name="i-lucide-chevron-left" class="size-3.5" />
        {{ backLabel }}
      </NuxtLink>
      <span v-if="statusMeta" class="rk-shell-status-meta">{{ statusMeta }}</span>
    </div>

    <div class="rk-shell-split">
      <header class="rk-shell-hero rk-block-hero">
        <slot name="hero" />
        <p v-if="lastUpdated" class="rk-shell-meta">
          Última atualização · {{ lastUpdated }}
        </p>
      </header>

      <section v-if="$slots.leader" class="rk-shell-leader rk-block-leader">
        <slot name="leader" />
      </section>
    </div>

    <slot />
  </article>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    backTo?: string
    backLabel?: string
    lastUpdated?: string
    statusMeta?: string
  }>(),
  { backLabel: 'Voltar' }
)
</script>

<style scoped>
.rk-shell {
  position: relative;
  overflow: hidden;
}
.rk-shell-atmo {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  filter: blur(200px);
}
.rk-shell-atmo--top {
  top: -15%;
  right: -10%;
  width: 60%;
  height: 70%;
  opacity: 0.4;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--brand-primary) 28%, transparent), transparent 60%);
}
.rk-shell-atmo--bottom {
  bottom: -20%;
  left: -10%;
  width: 50%;
  height: 50%;
  opacity: 0.25;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--brand-primary) 18%, transparent), transparent 60%);
}

.rk-shell-status {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}
@media (min-width: 768px) {
  .rk-shell-status {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 16px;
    padding: 14px 24px;
  }
}
.rk-shell-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px 6px 8px;
  border: 1px solid var(--border-default);
  border-radius: 6px;
  background: var(--bg-elevated);
  color: var(--text-heading);
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  transition: all 150ms ease-out;
}
.rk-shell-back:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 60%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 8%, var(--bg-elevated));
}
.rk-shell-back :deep(*) {
  color: var(--text-muted);
  transition: color 150ms;
}
.rk-shell-back:hover :deep(*) { color: var(--brand-primary); }
.rk-shell-status-meta {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.rk-shell-split {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
}
.rk-block-hero { order: 1; }
.rk-block-leader { order: 2; }

@media (min-width: 1024px) {
  .rk-shell-split {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    max-width: 1440px;
    margin: 0 auto;
  }
  .rk-block-hero {
    border-right: 1px solid var(--border-subtle);
    order: unset;
  }
  .rk-block-leader { order: unset; }
}

.rk-shell-hero {
  padding: 48px 24px 32px;
  max-width: 880px;
}
@media (min-width: 768px) {
  .rk-shell-hero { padding: 72px 32px 40px; }
}
@media (min-width: 1024px) {
  .rk-shell-hero { padding: 80px 56px 40px 32px; max-width: none; }
}

.rk-shell-leader {
  padding: 32px 24px 48px;
  border-top: 1px solid var(--border-subtle);
}
@media (min-width: 768px) {
  .rk-shell-leader { padding: 48px 32px 56px; }
}
@media (min-width: 1024px) {
  .rk-shell-leader {
    border-top: none;
    padding: 80px 32px 80px 56px;
  }
}

.rk-shell-meta {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 32px 0 0;
}
</style>

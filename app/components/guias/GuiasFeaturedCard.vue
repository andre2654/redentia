<script setup lang="ts">
// Card em destaque do hub: 2 painéis flex-wrap radius 28 — painel gradient com
// badge "Em destaque" + marca, painel de conteúdo com badge de categoria, meta,
// título, resumo e CTA "Ler o guia". Valores exatos do design
// (Redentia Guias Nu.dc.html). Só renderiza nas tabs Tudo/Guia Redentia (page).
import type { GuideTag } from '~/types/guias'

defineProps<{
  to: string
  tag: GuideTag
  metaLine: string
  title: string
  summary: string
  cta: string
}>()
</script>

<template>
  <NuxtLink :to="to" class="gfc">
    <span class="gfc__panel">
      <span class="gfc__badge">Em destaque</span>
      <img src="/logo-branca.svg" alt="Redentia" class="gfc__logo">
    </span>
    <span class="gfc__content">
      <span class="gfc__meta-row">
        <span class="gfc__tag">{{ tag }}</span>
        <span class="gfc__meta">{{ metaLine }}</span>
      </span>
      <span class="gfc__title">{{ title }}</span>
      <span class="gfc__summary">{{ summary }}</span>
      <span class="gfc__cta-row">
        <span class="gfc__cta">{{ cta }}</span>
      </span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.gfc {
  display: flex; gap: 0; flex-wrap: wrap; background: var(--nu-cream);
  border-radius: 28px; overflow: hidden; transition: transform .15s;
}
.gfc:hover { transform: translateY(-3px); }
.gfc__panel {
  flex: 1 1 340px; min-width: min(300px, 100%); min-height: 300px;
  position: relative; display: flex; align-items: flex-end; padding: 28px;
  background: linear-gradient(200deg, var(--nu-blue-soft) 0%, var(--nu-grad-blue-1) 32%, var(--nu-navy-2) 82%);
}
.gfc__badge {
  position: absolute; top: 24px; left: 28px;
  display: inline-flex; align-items: center; background: var(--nu-white-18);
  color: var(--nu-white); font-size: 12px; font-weight: 800; letter-spacing: 1px;
  text-transform: uppercase; padding: 6px 13px; border-radius: var(--nu-r-pill);
}
.gfc__logo { width: 76px; height: 76px; display: block; object-fit: contain; }
.gfc__content {
  flex: 1.5 1 420px; min-width: min(320px, 100%);
  padding: clamp(26px, 4vw, 48px); display: flex; flex-direction: column;
}
.gfc__meta-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.gfc__tag {
  display: inline-flex; align-items: center; background: var(--nu-white);
  color: var(--nu-gray-2); font-size: 12px; font-weight: 800;
  padding: 5px 13px; border-radius: var(--nu-r-pill);
}
.gfc__meta { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }
.gfc__title {
  color: var(--nu-ink); font-size: clamp(26px, 3vw, 42px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.08; margin-top: 18px;
}
.gfc__summary {
  color: var(--nu-gray-2); font-size: 16.5px; font-weight: 500;
  line-height: 1.6; margin-top: 14px; max-width: 640px;
}
.gfc__cta-row { display: inline-flex; align-items: center; gap: 11px; margin-top: auto; padding-top: 26px; }
.gfc__cta {
  display: inline-flex; align-items: center; background: var(--nu-blue);
  color: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 13px 24px; font-size: 15px; font-weight: 800;
}
</style>

<script setup lang="ts">
// Card azul de insight "REDENTIA AI" intercalado no grid de fundamentos
// (design Acoes Nu): label uppercase tracking 1.3px, texto do insight, CTA com
// seta. Clicável inteiro; hover escurece + lift -2px.
import type { AcaoInsightCard } from '~/types/acao'

defineProps<{ card: AcaoInsightCard }>()
</script>

<template>
  <NuxtLink :to="card.href" class="nai">
    <span class="nai__label">Redentia AI</span>
    <span class="nai__text">{{ card.insight }}</span>
    <span class="nai__cta">
      <span class="nai__cta-label">{{ card.cta }}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M12 5l7 7-7 7" /></svg>
    </span>
  </NuxtLink>
</template>

<style scoped>
.nai {
  background: var(--nu-blue); border-radius: var(--nu-r-panel); padding: 24px;
  display: flex; flex-direction: column; cursor: pointer; color: var(--nu-white);
  transition: transform .15s, background .2s;
}
.nai:hover { transform: translateY(-2px); background: var(--nu-blue-hover); color: var(--nu-white); }
.nai__label {
  color: var(--nu-white-75); font-size: 11.5px; font-weight: 800;
  letter-spacing: 1.3px; text-transform: uppercase;
}
.nai__text { color: var(--nu-white); font-size: 15.5px; font-weight: 600; line-height: 1.5; margin-top: 12px; }
.nai__cta { display: inline-flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 18px; }
.nai__cta-label { color: var(--nu-white); font-size: 14px; font-weight: 800; }
</style>

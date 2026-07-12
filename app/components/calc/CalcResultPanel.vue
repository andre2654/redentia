<script setup lang="ts">
// PR10 — coluna de resultado da calculadora: frase dinâmica + número-herói
// gigante + legenda com dots. Valores exatos do design (Redentia Calculadoras
// Nu.dc.html). Conteúdo extra (barra, gráfico, insight) entra pelo slot.
defineProps<{
  /** frase acima do número ("Daqui a 20 anos, aportando R$ 500…") */
  caption?: string
  /** número-herói já formatado */
  value: string
  /** linhas de legenda; dot = cor CSS (ex.: 'var(--nu-blue)') */
  items?: { dot?: string; label: string; value: string; accent?: boolean }[]
}>()
</script>

<template>
  <div class="crp">
    <div v-if="caption" class="crp__caption">{{ caption }}</div>
    <div class="crp__value">{{ value }}</div>
    <div v-if="items?.length" class="crp__legend">
      <span v-for="it in items" :key="it.label" class="crp__item">
        <span v-if="it.dot" class="crp__dot" :style="{ background: it.dot }" />
        <span class="crp__label">{{ it.label }}</span>
        <span class="crp__num" :class="{ 'crp__num--accent': it.accent }">{{ it.value }}</span>
      </span>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.crp__caption { color: var(--nu-gray); font-size: 16px; font-weight: 600; }
.crp__value {
  color: var(--nu-ink);
  font-size: clamp(44px, 5vw, 76px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-top: 10px;
  font-variant-numeric: tabular-nums;
}
.crp__legend { display: flex; gap: 26px; flex-wrap: wrap; margin-top: 22px; }
.crp__item { display: inline-flex; align-items: center; gap: 9px; }
.crp__dot { width: 11px; height: 11px; border-radius: 4px; flex-shrink: 0; }
.crp__label { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; }
.crp__num { color: var(--nu-ink); font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums; }
.crp__num--accent { color: var(--nu-blue); }
</style>

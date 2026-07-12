<script setup lang="ts">
// PR10 — faixa-meta discreta abaixo da calculadora: recebe o que SAIU do
// hero compacto (direção do André): o eyebrow antigo ("Calculadora · X"),
// os chips de confiança e o "Atualizado em". Texto SEO preservado na
// página, fora do caminho de quem quer usar a calculadora.
defineProps<{
  /** eyebrow antigo do hero, ex. "Calculadora · Juros Compostos" */
  label?: string
  /** chips de confiança ("100% gratuito", "Cálculo instantâneo"…) */
  chips?: string[]
  /** texto "Atualizado 30 de abril de 2026" */
  updated?: string
}>()
</script>

<template>
  <div class="cms">
    <span v-if="label" class="cms__label">{{ label }}</span>
    <ul v-if="chips?.length" class="cms__chips">
      <li v-for="(c, i) in chips" :key="c">
        <span class="cms__dot" :class="{ 'cms__dot--positive': i === 0 }" /> {{ c }}
      </li>
    </ul>
    <span class="cms__spacer" />
    <span v-if="updated" class="cms__updated">Atualizado {{ updated }}</span>
  </div>
</template>

<style scoped>
.cms {
  display: flex; align-items: center; gap: 14px 18px; flex-wrap: wrap;
  background: var(--nu-white);
  padding: 16px clamp(22px, 5.5vw, 80px) 26px;
}
.cms__label { color: var(--nu-gray); font-size: 13.5px; font-weight: 800; white-space: nowrap; }
.cms__chips { list-style: none; display: flex; gap: 8px; flex-wrap: wrap; margin: 0; padding: 0; }
.cms__chips li {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--nu-cream); border-radius: var(--nu-r-pill);
  padding: 7px 13px; color: var(--nu-ink); font-size: 12.5px; font-weight: 700;
}
.cms__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--nu-blue); flex-shrink: 0; }
.cms__dot--positive { background: var(--nu-green); }
.cms__spacer { flex: 1; }
.cms__updated { color: var(--nu-gray); font-size: 13px; font-weight: 600; white-space: nowrap; }
</style>

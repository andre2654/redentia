<script setup lang="ts">
// Faixa "Mercado agora" — presente em todas as telas dos designs.
// Dados via useMarketTicker (seed do design → hidrata real, nunca quebra).
const { items } = useMarketTicker()
</script>

<template>
  <div class="nut-wrap">
    <div class="nut">
      <span class="nut__label">Mercado agora</span>
      <span v-for="t in items" :key="t.n" class="nut__item">
        <span class="nut__name">{{ t.n }}</span>
        <span class="nut__value">{{ t.v }}</span>
        <span v-if="t.pct" class="nut__pct" :class="t.dir === 'down' ? 'nut__pct--down' : 'nut__pct--up'">{{ t.pct }}</span>
      </span>
      <span class="nut__spacer" />
      <span class="nut__note" data-nu-hide>B3 · dados com atraso de 15 min</span>
    </div>
  </div>
</template>

<style scoped>
.nut-wrap { background: var(--nu-cream); }
.nut { display: flex; align-items: center; gap: 26px; padding: 14px 22px; overflow-x: auto; }
.nut__label { color: var(--nu-ink); font-size: 15px; font-weight: 800; white-space: nowrap; flex-shrink: 0; }
.nut__item { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; }
.nut__name { color: var(--nu-gray); font-size: 13.5px; font-weight: 700; white-space: nowrap; }
.nut__value { color: var(--nu-ink); font-size: 14px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
.nut__pct { font-size: 13.5px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
.nut__pct--up { color: var(--nu-green); }
.nut__pct--down { color: var(--nu-red); }
.nut__spacer { flex: 1; }
.nut__note { color: var(--nu-gray); font-size: 12.5px; white-space: nowrap; flex-shrink: 0; }
</style>

<script setup lang="ts">
// Cards Compra/Venda (banda creme, cards brancos — mesma família dos cards
// das calculadoras): preço em destaque + taxa do lado (hidrata do último
// pregão da série quando o gráfico carrega; até lá a linha some, honesto).
import type { TesouroSideCardVM } from '~/types/tesouro'

defineProps<{ cards: TesouroSideCardVM[] }>()
</script>

<template>
  <section class="tsc">
    <div class="tsc__grid">
      <article v-for="c in cards" :key="c.label" class="tsc__card">
        <p class="tsc__label">{{ c.label }}</p>
        <p class="tsc__price">{{ c.priceFmt }}</p>
        <p v-if="c.rateFmt" class="tsc__rate">Taxa {{ c.rateFmt }}</p>
        <p class="tsc__note">{{ c.note }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.tsc {
  background: var(--nu-cream);
  padding: 0 clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 72px);
  animation: nu-fade .5s ease both;
}
.tsc__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 16px;
}
.tsc__card { background: var(--nu-white); border-radius: var(--nu-r-card-lg); padding: clamp(24px, 3vw, 34px); }
.tsc__label {
  margin: 0; color: var(--nu-blue); font-size: 12px; font-weight: 800;
  text-transform: uppercase; letter-spacing: .14em;
}
.tsc__price {
  margin: 10px 0 0; color: var(--nu-ink); font-size: clamp(28px, 3.4vw, 42px);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums;
}
.tsc__rate {
  margin: 8px 0 0; color: var(--nu-gray-2); font-size: 15px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.tsc__note { margin: 12px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.55; }
</style>

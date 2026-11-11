<script setup lang="ts">
// Cards Compra/Venda (banda creme, cards brancos — mesma família dos cards
// das calculadoras): preço em destaque + taxa do lado (hidrata do último
// pregão da série quando o gráfico carrega; até lá a linha some, honesto).
import type { TesouroSideCardVM } from '~/types/tesouro'

defineProps<{ cards: TesouroSideCardVM[] }>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()
</script>

<template>
  <section class="tsc">
    <div class="tsc__grid">
      <article v-for="c in cards" :key="c.label" v-contexto-chat="{ id: `tesouro-lado:${sobre}:${c.label}`, tipo: 'ativo', rotulo: rotuloComSobre(c.label, sobre.replace(/^Tesouro\s+/i, '')), texto: [`${c.label} · ${sobre}: ${c.priceFmt}`, c.rateFmt ? `Taxa ${c.rateFmt}` : '', c.note].filter(Boolean).join('\n') }" class="tsc__card">
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
  background: var(--nu-page);
  padding: 0 max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(48px, 6vw, 72px);
  animation: nu-fade .5s ease both;
}
.tsc__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 16px;
}
.tsc__card { background: var(--nu-card); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente); padding: clamp(24px, 3vw, 36px); }
.tsc__label {
  margin: 0; color: var(--nu-ink); font-size: 13.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .16em;
}
.tsc__price {
  margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(34px, 4vw, 52px);
  font-weight: 800; letter-spacing: -0.035em; line-height: 1; font-variant-numeric: tabular-nums;
}
.tsc__rate {
  display: inline-flex; align-items: center; min-height: 28px; margin: 12px 0 0; padding: 0 10px; border-radius: var(--nu-r-tag);
  background: var(--nu-blue-bg); color: var(--nu-blue-text); font-size: 14.5px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.tsc__note { margin: 12px 0 0; color: var(--nu-gray); font-size: 14.5px; font-weight: 500; line-height: 1.5; }
</style>

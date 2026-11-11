<script setup lang="ts">
// Compra e Venda: o preço em destaque + a taxa do lado (hidrata do último
// pregão da série quando o gráfico carrega; até lá a linha some, honesto).
// 2ª rodada da Aportou (11/11/2026): os dois lados moram no cartão carvão com
// a faixa da marca, à direita do topo (como o cartão do gráfico no /asset).
import type { TesouroSideCardVM } from '~/types/tesouro'

defineProps<{ cards: TesouroSideCardVM[] }>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()
</script>

<template>
  <NuFaixaMarca rotulo="Preços de hoje" como="p" :altura="56" class="tsc">
    <div class="tsc__grid">
      <article v-for="c in cards" :key="c.label" v-contexto-chat="{ id: `tesouro-lado:${sobre}:${c.label}`, tipo: 'ativo', rotulo: rotuloComSobre(c.label, sobre.replace(/^Tesouro\s+/i, '')), texto: [`${c.label} · ${sobre}: ${c.priceFmt}`, c.rateFmt ? `Taxa ${c.rateFmt}` : '', c.note].filter(Boolean).join('\n') }" class="tsc__card">
        <p class="tsc__label">{{ c.label }}</p>
        <p class="tsc__price">{{ c.priceFmt }}</p>
        <p v-if="c.rateFmt" class="tsc__rate">Taxa {{ c.rateFmt }}</p>
        <p class="tsc__note">{{ c.note }}</p>
      </article>
    </div>
  </NuFaixaMarca>
</template>

<style scoped>
.tsc { --pad: clamp(20px, 2.4vw, 32px); overflow: hidden; animation: nu-fade .5s ease .1s both; }
.tsc__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  padding: clamp(18px, 2.2vw, 28px) var(--pad) clamp(22px, 2.6vw, 32px); column-gap: clamp(24px, 3vw, 44px);
}
.tsc__card { min-width: 0; padding: 6px 0; }
/* o fio escuro entre os dois lados: de pé lado a lado, deitado quando empilham */
.tsc__card + .tsc__card { position: relative; }
.tsc__card + .tsc__card::before {
  content: ''; position: absolute; left: calc(clamp(24px, 3vw, 44px) / -2); top: 6px; bottom: 6px; width: 1.5px; background: var(--nu-dark-line);
}
.tsc__label {
  margin: 0; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .16em;
}
.tsc__price {
  margin: 12px 0 0; color: var(--nu-white); font-size: clamp(30px, 3.2vw, 44px);
  font-weight: 800; letter-spacing: -0.035em; line-height: 1; font-variant-numeric: tabular-nums;
}
.tsc__rate {
  display: inline-flex; align-items: center; min-height: 28px; margin: 14px 0 0; padding: 0 10px; border-radius: var(--nu-r-tag);
  background: color-mix(in srgb, var(--nu-blue-on-dark) 18%, transparent); color: var(--nu-blue-soft); font-size: 14.5px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.tsc__note { margin: 12px 0 0; color: var(--nu-on-dark); font-size: 14.5px; font-weight: 500; line-height: 1.5; }
@media (max-width: 620px) {
  .tsc__grid { grid-template-columns: minmax(0, 1fr); row-gap: 18px; }
  .tsc__card + .tsc__card { padding-top: 22px; }
  .tsc__card + .tsc__card::before { left: 0; right: 0; top: 0; bottom: auto; width: auto; height: 1.5px; }
}
@media (prefers-reduced-motion: reduce) { .tsc { animation: none; } }
</style>

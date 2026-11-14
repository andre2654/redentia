<script setup lang="ts">
// Compra e Venda: o preço em destaque + a taxa do lado (hidrata do último
// pregão da série quando o gráfico carrega; até lá a linha some, honesto).
// 2ª rodada da Aportou (11/11/2026): os dois lados moram no cartão carvão com
// a faixa da marca, à direita do topo (como o cartão do gráfico no /asset).
// Robustez (11/11/2026): o rótulo sai da caixa alta (caixa alta é do eyebrow e
// do cabeçalho de tabela), a taxa vai no NuSelo azul sobre o carvão, o fio de
// 1px e o movimento por token.
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
        <NuSelo v-if="c.rateFmt" como="p" tom="azul" sobre="escuro" class="tsc__rate">Taxa {{ c.rateFmt }}</NuSelo>
        <p class="tsc__note">{{ c.note }}</p>
      </article>
    </div>
  </NuFaixaMarca>
</template>

<style scoped>
.tsc { --pad: clamp(20px, 2.4vw, 32px); --entre: clamp(24px, 3vw, 40px); overflow: hidden; animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) 60ms both; }
.tsc__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  padding: clamp(16px, 2.2vw, 24px) var(--pad) clamp(24px, 2.6vw, 32px); column-gap: var(--entre);
}
.tsc__card { min-width: 0; padding: 8px 0; }
/* o fio escuro entre os dois lados: de pé lado a lado, deitado quando empilham */
.tsc__card + .tsc__card { position: relative; }
.tsc__card + .tsc__card::before {
  content: ''; position: absolute; left: calc(var(--entre) / -2); top: 8px; bottom: 8px; width: 1px; background: var(--nu-dark-line);
}
.tsc__label { margin: 0; color: var(--nu-on-dark-2); font-size: 14px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.tsc__price {
  margin: 12px 0 0; color: var(--nu-white); font-size: clamp(30px, 3.2vw, 44px);
  font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1; font-variant-numeric: tabular-nums;
}
.tsc__rate { margin: 16px 0 0; }
.tsc__note { margin: 12px 0 0; color: var(--nu-on-dark); font-size: 14.5px; font-weight: var(--nu-w-texto); line-height: 1.5; }
@media (max-width: 620px) {
  .tsc__grid { grid-template-columns: minmax(0, 1fr); row-gap: 16px; }
  .tsc__card + .tsc__card { padding-top: 24px; }
  .tsc__card + .tsc__card::before { left: 0; right: 0; top: 0; bottom: auto; width: auto; height: 1px; }
}
</style>

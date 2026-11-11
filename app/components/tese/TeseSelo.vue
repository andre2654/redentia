<script setup lang="ts">
// O selo da tela de tese (Aportou, 11/11/2026): raio 8, 700. Os tons são os do
// contrato: verde (alta, a favor, cumprido), vermelho (queda, contra), âmbar
// (atenção, pendente), azul ("fato", convicção), carvão (ticker, contagem),
// neutro (chip creme) e contorno (data, metadado). `sobre="escuro"` é a versão
// para o carvão (o diário). `p` é o selo pequeno, que entra no meio do texto
// das revisões; `m` é o da linha de selos.
withDefaults(defineProps<{
  tom?: 'verde' | 'vermelho' | 'ambar' | 'azul' | 'carvao' | 'neutro' | 'contorno'
  tamanho?: 'p' | 'm'
  sobre?: 'claro' | 'escuro'
}>(), { tom: 'neutro', tamanho: 'm', sobre: 'claro' })
</script>

<template>
  <span class="tsl" :class="[`tsl--${tom}`, `tsl--${tamanho}`, { 'tsl--escuro': sobre === 'escuro' }]"><slot /></span>
</template>

<style scoped>
.tsl {
  display: inline-flex; align-items: center; gap: 6px; border-radius: var(--nu-r-tag);
  font-weight: var(--nu-w-medio); line-height: 1.2; font-variant-numeric: tabular-nums; white-space: nowrap;
}
.tsl--m { min-height: 30px; padding: 5px 11px; font-size: 14px; }
/* o pequeno mora dentro de uma frase: quebra de linha como texto, sem empurrar a entrelinha */
.tsl--p {
  display: inline; padding: 2px 7px; font-size: 12px; letter-spacing: .04em; white-space: normal;
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
}
.tsl--verde { background: var(--nu-green-bg); color: var(--nu-green-text); }
.tsl--vermelho { background: var(--nu-red-bg); color: var(--nu-red-text); }
.tsl--ambar { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.tsl--azul { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.tsl--carvao { background: var(--nu-ink); color: var(--nu-white); font-weight: var(--nu-w-forte); letter-spacing: .04em; }
.tsl--neutro { background: var(--nu-cream-2); color: var(--nu-ink); }
.tsl--contorno { background: transparent; color: var(--nu-gray-3); box-shadow: inset 0 0 0 1px var(--nu-line); }

/* sobre o carvão */
.tsl--escuro.tsl--neutro { background: var(--nu-dark-chip); color: var(--nu-on-dark); box-shadow: inset 0 0 0 1px var(--nu-dark-chip-line); }
.tsl--escuro.tsl--contorno { color: var(--nu-on-dark); box-shadow: inset 0 0 0 1px var(--nu-dark-chip-line); }
.tsl--escuro.tsl--verde { background: var(--nu-green-soft-16); color: var(--nu-green-soft); }
.tsl--escuro.tsl--azul { background: color-mix(in srgb, var(--nu-blue-on-dark) 18%, transparent); color: var(--nu-blue-soft); }
.tsl--escuro.tsl--ambar { background: color-mix(in srgb, var(--nu-amber-soft) 16%, transparent); color: var(--nu-amber-soft); }
.tsl--escuro.tsl--vermelho { background: var(--nu-red-soft-16); color: var(--nu-red-soft); }
</style>

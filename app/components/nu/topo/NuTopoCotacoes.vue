<script setup lang="ts">
// As cotações numa linha parada, que se ajusta à largura sem JS: a linha tem a
// altura de uma cotação e quebra (flex-wrap); o que não cabe desce para a
// segunda linha e fica cortado. Sem marquee, sem medir, sem pulo de layout.
// Ordem de leitura (utils/topo.ts): IBOV, dólar, IFIX, CDI, PETR4, bitcoin —
// o que some primeiro é o fim da fila.
import type { CotacaoDoTopo } from '~/utils/topo'
defineProps<{ itens: CotacaoDoTopo[]; separador?: boolean }>()
</script>

<template>
  <ul class="ntc" :class="{ 'ntc--sep': separador }">
    <li v-for="c in itens" :key="c.n" class="ntc__item">
      <span class="ntc__nome">{{ c.n }}</span>
      <span class="ntc__valor">{{ c.v }}</span>
      <span v-if="c.pct" class="ntc__pct" :class="`ntc__pct--${c.dir}`">{{ c.pct.replace('-', '−') }}</span>
    </li>
  </ul>
</template>

<style scoped>
.ntc {
  list-style: none; margin: 0; padding: 0; min-width: 0;
  display: flex; flex-wrap: wrap; align-items: center; column-gap: var(--ntc-gap, 22px);
  height: var(--ntc-h, 20px); overflow: hidden;
}
.ntc__item { display: inline-flex; align-items: center; gap: 6px; height: var(--ntc-h, 20px); white-space: nowrap; }
.ntc--sep .ntc__item + .ntc__item { position: relative; }
.ntc--sep .ntc__item + .ntc__item::before {
  content: ''; position: absolute; left: calc(var(--ntc-gap, 22px) / -2); top: 50%; width: 1px; height: 12px;
  transform: translateY(-50%); background: var(--nu-cream-line);
}
.ntc__nome { color: var(--nu-gray); font-weight: 700; }
.ntc__valor { color: var(--nu-ink); font-weight: 700; font-variant-numeric: tabular-nums; }
.ntc__pct { font-weight: 700; font-variant-numeric: tabular-nums; }
.ntc__pct--up { color: var(--nu-green-text); }
.ntc__pct--down { color: var(--nu-red-text); }
.ntc__pct--flat { color: var(--nu-gray); }
</style>

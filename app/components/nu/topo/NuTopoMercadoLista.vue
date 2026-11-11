<script setup lang="ts">
// Todas as cotações em lista (o painel do mercado e o menu do celular): nome à
// esquerda, valor e variação à direita, em coluna tabular. Embaixo, de quando
// são os números e o aviso de atraso da B3, sempre.
// Robustez (11/11/2026): o nome em 500 e o número em 600 (o peso separa o rótulo
// do dado); o título em caixa alta pequena, no tracking da caixa.
import type { CotacaoDoTopo, MercadoDoTopo } from '~/utils/topo'
defineProps<{ itens: CotacaoDoTopo[]; mercado: MercadoDoTopo | null; titulo?: string }>()
</script>

<template>
  <div class="nml">
    <div class="nml__topo">
      <span class="nml__titulo">{{ titulo ?? 'Mercado' }}</span>
      <NuTopoEstado :mercado="mercado" class="nml__estado" />
    </div>
    <ul class="nml__lista">
      <li v-for="c in itens" :key="c.n" class="nml__linha">
        <span class="nml__nome">{{ c.n }}</span>
        <span class="nml__valor">{{ c.v }}</span>
        <span class="nml__pct" :class="`nml__pct--${c.dir}`">{{ c.pct ? c.pct.replace('-', '−') : '' }}</span>
      </li>
    </ul>
    <p class="nml__nota">
      <span v-if="mercado?.referencia">{{ mercado.referencia }} · </span>B3 · <span class="nml__junto">dados com atraso de 15 min</span>
    </p>
  </div>
</template>

<style scoped>
.nml { display: flex; flex-direction: column; }
.nml__topo { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 2px 4px 10px; }
.nml__titulo { color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; }
.nml__estado { font-size: var(--nu-fs-dense); }
.nml__lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.nml__linha {
  display: grid; grid-template-columns: 1fr auto 72px; align-items: baseline; gap: 12px;
  padding: 11px 4px; border-top: 1px solid var(--nu-line-2);
  font-size: var(--nu-fs-sm); font-variant-numeric: tabular-nums; white-space: nowrap;
}
.nml__nome { color: var(--nu-gray-3); font-weight: var(--nu-w-texto); }
.nml__valor { color: var(--nu-ink); font-weight: var(--nu-w-medio); text-align: right; }
.nml__pct { font-weight: var(--nu-w-medio); text-align: right; }
.nml__pct--up { color: var(--nu-green-text); }
.nml__pct--down { color: var(--nu-red-text); }
.nml__junto { white-space: nowrap; }
.nml__nota { margin: 0; padding: 10px 4px 2px; border-top: 1px solid var(--nu-line-2); color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-texto); line-height: 1.45; }
</style>

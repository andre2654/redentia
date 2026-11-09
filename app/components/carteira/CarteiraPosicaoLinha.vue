<script setup lang="ts">
// Miolo de uma linha de papel do CarteiraPosicoes (o grupo aberto): tile,
// nome, quantidade e valor. Fragmento de propósito: quem envolve (link para o
// /asset ou div, na Renda Fixa) dá o flex.
import type { CarteiraRowVM } from '~/types/carteira'

defineProps<{ row: CarteiraRowVM; hidden: boolean; mask: (v: string, dots?: number) => string }>()
</script>

<template>
  <span class="cpl__tile" :style="{ background: row.tileBg, color: row.tileFg }" aria-hidden="true">{{ row.letter }}</span>
  <span class="cpl__nome">
    <span class="cpl__label">{{ row.label }}</span>
    <span class="cpl__sub">{{ hidden ? row.sub.replace(/R\$ [\d.,]+/g, 'R$ ••') : row.sub }}</span>
  </span>
  <span class="cpl__val">
    <span>{{ mask(row.val) }}</span>
    <span v-if="row.ret" class="cpl__ret" :class="`cpl__ret--${row.retDir}`">{{ row.ret }}</span>
  </span>
</template>

<style scoped>
.cpl__tile {
  width: 36px; height: 36px; border-radius: 27%; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center; font-size: var(--nu-fs-sm); font-weight: 800;
}
.cpl__nome { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.cpl__label { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cpl__sub { color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cpl__val { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cpl__ret { font-size: var(--nu-fs-dense); }
.cpl__ret--up { color: var(--nu-green-text); }
.cpl__ret--down { color: var(--nu-red-text); }
</style>

<script setup lang="ts">
// "Próximos índices" do /benchmark-ia: o que ainda não tem nota, uma linha
// por índice, com a pergunta e o que falta. Sem cartão: lista com fio.
import { BENCH_INDICES } from '~/content/benchmark-ia/metodologia'
import type { BenchIndexSection } from '~/types/benchmark'

defineProps<{ itens: BenchIndexSection[] }>()
const pergunta = (id: string) => BENCH_INDICES.find((m) => m.id === id)?.question ?? ''
const icone = (k: string) => BENCH_ICONS[k] ?? BENCH_ICONS.trophy
</script>

<template>
  <ul class="bdp">
    <li v-for="p in itens" :key="p.id" class="bdp__i">
      <span class="bdp__ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path :d="icone(p.icon)" /></svg></span>
      <span class="bdp__t">
        <span class="bdp__nome">{{ p.label }}</span>
        <span class="bdp__q">{{ pergunta(p.id) }}</span>
      </span>
      <span class="bdp__st">{{ p.next }}</span>
    </li>
  </ul>
</template>

<style scoped>
.bdp { list-style: none; margin: 0; padding: 0; container-type: inline-size; }
.bdp__i { display: grid; grid-template-columns: 36px minmax(0, 1fr) minmax(0, 240px); align-items: center; gap: 16px; padding: 16px 0; }
.bdp__i + .bdp__i { border-top: 1px solid var(--nu-line-2); }
.bdp__ic { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; background: var(--nu-ink); color: var(--nu-white); }
.bdp__ic svg { width: 18px; height: 18px; }
.bdp__t { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.bdp__nome { color: var(--nu-ink); font-size: 17px; font-weight: var(--nu-w-medio); }
.bdp__q { color: var(--nu-gray-3); font-size: 14.5px; font-weight: var(--nu-w-texto); line-height: 1.45; }
.bdp__st { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.45; font-variant-numeric: tabular-nums; }
@container (max-width: 560px) {
  .bdp__i { grid-template-columns: 36px minmax(0, 1fr); row-gap: 4px; }
  .bdp__st { grid-column: 2; }
}
</style>

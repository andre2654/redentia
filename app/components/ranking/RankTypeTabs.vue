<script setup lang="ts">
// Pills de filtro de tipo (Todos/Ações/FIIs/BDRs) — mesma anatomia visual do
// NuFilterPills (ativa preto, inativa branca com borda areia), mas com value
// semântico RankingTypeFilter e tabs condicionais a meta.types. A troca vive
// no useRanking.setType (?type= na URL, sem reload — deep-linkável).
import type { RankingAssetType, RankingTypeFilter } from '~/types/rankings'

const props = defineProps<{
  types: RankingAssetType[]
  modelValue: RankingTypeFilter
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: RankingTypeFilter): void }>()

const LABELS: Record<RankingAssetType, string> = { acoes: 'Ações', fiis: 'FIIs', bdrs: 'BDRs' }

const tabs = computed<{ value: RankingTypeFilter; label: string }[]>(() => [
  { value: 'todos', label: 'Todos' },
  ...props.types.map((t) => ({ value: t as RankingTypeFilter, label: LABELS[t] })),
])
</script>

<template>
  <div class="rtt" role="tablist" aria-label="Filtrar tipo de ativo">
    <button
      v-for="t in tabs" :key="t.value" type="button" role="tab" class="rtt__pill"
      :aria-selected="t.value === modelValue"
      :class="{ 'rtt__pill--active': t.value === modelValue }"
      @click="emit('update:modelValue', t.value)"
    >{{ t.label }}</button>
  </div>
</template>

<style scoped>
/* o filtro da Aportou: chip creme desligado, pílula carvão ligada, 44px de toque */
.rtt { display: flex; gap: 8px; flex-wrap: wrap; }
.rtt__pill {
  min-height: 44px; padding: 0 18px; border-radius: var(--nu-r-pill); font: inherit; font-size: 14.5px; font-weight: 600;
  cursor: pointer; border: 0; background: var(--nu-cream-2);
  color: var(--nu-ink); transition: background .2s, color .2s, transform .15s cubic-bezier(.2, .8, .2, 1); white-space: nowrap;
}
.rtt__pill:hover { background: var(--nu-line-2); }
.rtt__pill:active { transform: scale(.98); }
.rtt__pill--active, .rtt__pill--active:hover { background: var(--nu-ink); color: var(--nu-white); font-weight: 700; }
@media (prefers-reduced-motion: reduce) { .rtt__pill { transition: none; } .rtt__pill:active { transform: none; } }
</style>

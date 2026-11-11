<script setup lang="ts">
// Filtro de tipo (Todos/Ações/FIIs/BDRs) com value semântico RankingTypeFilter
// e tabs condicionais a meta.types. A troca vive no useRanking.setType (?type=
// na URL, sem reload, deep-linkável). Desde a 2ª rodada da Aportou
// (11/11/2026) é o trilho da base (NuTrilho): creme, com a escolhida na pílula
// carvão que desliza até a nova.
import type { RankingAssetType, RankingTypeFilter } from '~/types/rankings'

const props = defineProps<{
  types: RankingAssetType[]
  modelValue: RankingTypeFilter
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: RankingTypeFilter): void }>()

const LABELS: Record<RankingAssetType, string> = { acoes: 'Ações', fiis: 'FIIs', bdrs: 'BDRs' }

const tabs = computed(() => [
  { valor: 'todos' as RankingTypeFilter, rotulo: 'Todos' },
  ...props.types.map((t) => ({ valor: t as RankingTypeFilter, rotulo: LABELS[t] })),
])
</script>

<template>
  <NuTrilho :opcoes="tabs" :model-value="modelValue" rotulo="Filtrar tipo de ativo" @update:model-value="emit('update:modelValue', $event)" />
</template>

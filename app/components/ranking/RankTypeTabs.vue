<script setup lang="ts">
// Filtro de tipo (Todos/Ações/FIIs/BDRs) com value semântico RankingTypeFilter
// e tabs condicionais a meta.types. A troca vive no useRanking.setType (?type=
// na URL, sem reload, deep-linkável). Desde a 2ª rodada da Aportou
// (11/11/2026) é o trilho das páginas de mercado (MercadoTrilho): creme, com a
// escolhida em pílula carvão.
import type { RankingAssetType, RankingTypeFilter } from '~/types/rankings'

const props = defineProps<{
  types: RankingAssetType[]
  modelValue: RankingTypeFilter
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: RankingTypeFilter): void }>()

const LABELS: Record<RankingAssetType, string> = { acoes: 'Ações', fiis: 'FIIs', bdrs: 'BDRs' }

const tabs = computed(() => [
  { id: 'todos', rotulo: 'Todos' },
  ...props.types.map((t) => ({ id: t as string, rotulo: LABELS[t] })),
])
</script>

<template>
  <MercadoTrilho
    :itens="tabs" :model-value="modelValue" papel="tablist" rotulo="Filtrar tipo de ativo"
    @update:model-value="emit('update:modelValue', $event as RankingTypeFilter)"
  />
</template>

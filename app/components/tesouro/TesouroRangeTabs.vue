<script setup lang="ts">
// O período do gráfico do título, com os 5 ranges do backend do Tesouro
// (?range=30d|6m|1y|5y|full). Componente próprio porque os ranges são outros
// que os do /asset (1mo|6mo|12mo).
// Robustez (11/11/2026): é o trilho da base (NuTrilho) no tom escuro, no lugar
// das pílulas feitas à mão: a escolhida em creme desliza até a nova, as setas
// do teclado andam, e enquanto a série nova chega (`disabled`, o rangeLoading)
// ele segura a escolha em vez de apagar.
import type { TesouroRange } from '~/types/tesouro'

const props = defineProps<{ modelValue: TesouroRange; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [TesouroRange] }>()

const TABS: { valor: TesouroRange; rotulo: string; extenso: string }[] = [
  { valor: '30d', rotulo: '30D', extenso: '30 dias' },
  { valor: '6m', rotulo: '6M', extenso: '6 meses' },
  { valor: '1y', rotulo: '1A', extenso: '12 meses' },
  { valor: '5y', rotulo: '5A', extenso: '5 anos' },
  { valor: 'full', rotulo: 'Tudo', extenso: 'Todo o histórico' },
]

function select(value: TesouroRange) {
  if (!props.disabled && value !== props.modelValue) emit('update:modelValue', value)
}
</script>

<template>
  <NuTrilho class="trt" :opcoes="TABS" :model-value="modelValue" tom="escuro" tamanho="p" :ocupado="disabled" rotulo="Período do gráfico" @update:model-value="select" />
</template>

<style scoped>
/* o trilho não encolhe ao lado do eixo (Preço/Taxa): quebra de linha inteiro */
.trt { flex-shrink: 0; }
</style>

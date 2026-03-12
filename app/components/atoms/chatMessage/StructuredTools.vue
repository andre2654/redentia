<template>
  <div class="mt-4 flex flex-col gap-4 border-t border-[rgb(var(--brand-overlay)_/_0.1)] pt-4">
    <div
      v-for="(tool, index) in tools"
      :key="index"
      class="flex flex-col gap-4 rounded-xl border border-[rgb(var(--brand-overlay)_/_0.1)] bg-[rgb(var(--brand-overlay)_/_0.05)] p-4"
    >
      <!-- Tool Header -->
      <div class="flex items-center gap-2 border-b border-[rgb(var(--brand-overlay)_/_0.1)] pb-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20">
          <UIcon name="i-lucide-calculator" class="size-5 text-secondary" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold">{{ getToolLabel(tool.name) }}</span>
          <span class="text-xs opacity-60">Resultado da simulação</span>
        </div>
      </div>

      <!-- Stock Return / Compound Interest -->
      <div
        v-if="['calculate_stock_return', 'calculate_compound_interest'].includes(tool.name) && tool.result"
        class="flex flex-col gap-4"
      >
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="rounded-lg bg-[rgb(var(--brand-overlay)_/_0.05)] p-3">
            <div class="text-xs opacity-60">Total Investido</div>
            <div class="font-mono text-lg font-bold">{{ formatBRL(tool.result.totalInvested) }}</div>
          </div>
          <div class="rounded-lg bg-[rgb(var(--brand-overlay)_/_0.05)] p-3">
            <div class="text-xs opacity-60">Valor Final</div>
            <div class="font-mono text-lg font-bold text-secondary">{{ formatBRL(tool.result.finalValue) }}</div>
          </div>
          <div v-if="tool.result.returnPercentage !== undefined" class="rounded-lg bg-[rgb(var(--brand-overlay)_/_0.05)] p-3">
            <div class="text-xs opacity-60">Rentabilidade</div>
            <div
              class="font-mono text-lg font-bold"
              :style="{ color: tool.result.returnPercentage >= 0 ? brand.colors.positive : brand.colors.negative }"
            >
              {{ tool.result.returnPercentage > 0 ? '+' : '' }}{{ tool.result.returnPercentage.toFixed(2) }}%
            </div>
          </div>
        </div>
        <div v-if="tool.result.chartData?.length" class="mt-2 h-[200px] w-full">
          <AtomsGraphLine :data="tool.result.chartData" :height="200" :colors="[ChartColors.positive]" :show-legend="false" />
        </div>
      </div>

      <!-- Planning Result -->
      <div v-else-if="tool.name === 'calculate_planning' && tool.result" class="flex flex-col gap-4">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="rounded-lg bg-[rgb(var(--brand-overlay)_/_0.05)] p-3">
            <div class="text-xs opacity-60">Meta</div>
            <div class="font-mono text-lg font-bold">{{ formatBRL(tool.result.goalValue) }}</div>
          </div>
          <div class="rounded-lg bg-[rgb(var(--brand-overlay)_/_0.05)] p-3">
            <div class="text-xs opacity-60">Tempo Estimado</div>
            <div class="font-mono text-lg font-bold text-secondary">
              {{ Math.ceil(tool.result.monthsToGoal / 12) }} anos
            </div>
            <div class="text-xs opacity-50">{{ tool.result.targetDateLabel }}</div>
          </div>
        </div>
        <div v-if="tool.result.chartData?.length" class="mt-2 h-[200px] w-full">
          <AtomsGraphLine :data="tool.result.chartData" :height="200" :colors="[ChartColors.positive]" :show-legend="false" />
        </div>
        <!-- Recommended Assets -->
        <div v-if="tool.result.recommendedAssets?.length" class="flex flex-col gap-2 border-t border-[rgb(var(--brand-overlay)_/_0.1)] pt-3">
          <div class="text-xs font-medium opacity-70">
            Carteira Sugerida ({{ tool.result.strategy === 'seguranca' ? 'Conservadora' : 'Arrojada' }})
          </div>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div
              v-for="(asset, idx) in tool.result.recommendedAssets"
              :key="idx"
              class="flex items-center justify-between rounded bg-[rgb(var(--brand-overlay)_/_0.05)] p-2 px-3"
            >
              <div class="flex flex-col">
                <span class="text-sm font-bold">{{ asset.ticker }}</span>
                <span class="text-[10px] opacity-60">{{ asset.category }}</span>
              </div>
              <div class="text-right">
                <div class="font-mono text-xs">{{ (asset.weight * 100).toFixed(0) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AtomsGraphLine from '~/components/atoms/Graph/line.vue'
import { ChartColors } from '~/design/chartColors'

const brand = useBrand()
defineProps<{ tools: any[] }>()

const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
function formatBRL(value: number) {
  return brlFormatter.format(value)
}

function getToolLabel(name: string) {
  switch (name) {
    case 'calculate_compound_interest': return 'Calculadora de Juros Compostos'
    case 'calculate_planning': return 'Planejamento Financeiro'
    case 'calculate_stock_return': return 'Simulação de Rentabilidade'
    default: return 'Calculadora'
  }
}
</script>

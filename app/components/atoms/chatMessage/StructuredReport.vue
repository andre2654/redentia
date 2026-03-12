<template>
  <div class="flex flex-col gap-4">
    <!-- Header: Price & Ticker -->
    <div class="flex items-center justify-between rounded-lg bg-[rgb(var(--brand-overlay)_/_0.05)] p-3">
      <div>
        <div class="text-sm font-bold">{{ data.ticker }}</div>
        <div class="text-xs opacity-60">Relatório Completo</div>
      </div>
      <div v-if="data.data?.price" class="text-right">
        <div class="text-xl font-bold">R$ {{ data.data.price.price }}</div>
        <div
          class="text-xs"
          :style="{ color: Number(data.data.price.change) >= 0 ? brand.colors.positive : brand.colors.negative }"
        >
          {{ Number(data.data.price.change) > 0 ? '+' : '' }}{{ data.data.price.change }}%
        </div>
      </div>
    </div>

    <!-- Price Chart -->
    <div v-if="chartData.length > 0" class="h-[250px] w-full">
      <AtomsGraphLine :data="chartData" :show-legend="false" :height="250" />
    </div>

    <!-- Dividends -->
    <AtomsChatMessageStructuredDividends v-if="data.data?.dividends" :data="data" />

    <!-- Analysis -->
    <div v-if="data.data?.analysis" class="grid grid-cols-2 gap-2">
      <div class="rounded bg-[rgb(var(--brand-overlay)_/_0.05)] p-2">
        <div class="text-[10px] opacity-60">P/L</div>
        <div class="font-mono text-sm font-bold">{{ data.data.analysis.pe ?? '-' }}</div>
      </div>
      <div class="rounded bg-[rgb(var(--brand-overlay)_/_0.05)] p-2">
        <div class="text-[10px] opacity-60">DY</div>
        <div class="font-mono text-sm font-bold" :style="{ color: brand.colors.positive }">
          {{ data.data.analysis.dy ?? '-' }}%
        </div>
      </div>
      <div class="rounded bg-[rgb(var(--brand-overlay)_/_0.05)] p-2">
        <div class="text-[10px] opacity-60">Setor</div>
        <div class="truncate text-sm font-medium">{{ data.data.analysis.sector ?? '-' }}</div>
      </div>
      <div class="rounded bg-[rgb(var(--brand-overlay)_/_0.05)] p-2">
        <div class="text-[10px] opacity-60">Valor</div>
        <div class="text-sm font-medium">{{ data.data.analysis.marketCap ?? '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AtomsGraphLine from '~/components/atoms/Graph/line.vue'

const brand = useBrand()
const props = defineProps<{ data: any }>()

const chartData = computed(() => {
  const points = props.data.data?.chart
  if (!Array.isArray(points)) return []
  return points.map((point: any) => ({
    date: point.x,
    value: point.y,
    timestamp: new Date(point.x).getTime(),
  }))
})
</script>

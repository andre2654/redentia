<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-activity" class="h-5 w-5 text-gray-400" />
        <span class="text-sm font-medium text-gray-400">
          Volatilidade {{ period ? `(${period})` : '(Risco)' }}
        </span>
      </div>
      <span class="text-sm font-bold" :style="{ color: riskColor }">{{
        riskLabel
      }}</span>
    </div>

    <div class="flex h-3 w-full gap-[2px]">
      <div
        v-for="i in totalBars"
        :key="i"
        class="h-full flex-1 rounded-full transition-all duration-500"
        :style="{
          backgroundColor: getBarColor(i),
          opacity: i <= activeBars ? 1 : 0.15,
          boxShadow: i <= activeBars ? `0 0 4px ${getBarColor(i)}` : 'none',
        }"
      />
    </div>

    <div
      class="flex justify-between text-[10px] font-medium uppercase tracking-wider text-gray-500"
    >
      <span>Baixo</span>
      <span>Médio</span>
      <span>Alto</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChartColors } from '~/design/chartColors'

const props = defineProps<{
  risk: number // 0 to 100
  period?: string
}>()

const totalBars = 45

const activeBars = computed(() => {
  return Math.round((props.risk / 100) * totalBars)
})

const riskLabel = computed(() => {
  if (props.risk < 20) return 'Muito Baixo'
  if (props.risk < 40) return 'Baixo'
  if (props.risk < 60) return 'Médio'
  if (props.risk < 80) return 'Alto'
  return 'Extremo'
})

const COLORS = {
  LOW: ChartColors.positive,
  MEDIUM: '#fde047', // Pastel Yellow
  HIGH: ChartColors.negative,
}

function interpolateColor(color1: string, color2: string, factor: number) {
  const r1 = parseInt(color1.substring(1, 3), 16)
  const g1 = parseInt(color1.substring(3, 5), 16)
  const b1 = parseInt(color1.substring(5, 7), 16)

  const r2 = parseInt(color2.substring(1, 3), 16)
  const g2 = parseInt(color2.substring(3, 5), 16)
  const b2 = parseInt(color2.substring(5, 7), 16)

  const r = Math.round(r1 + factor * (r2 - r1))
  const g = Math.round(g1 + factor * (g2 - g1))
  const b = Math.round(b1 + factor * (b2 - b1))

  return `rgb(${r}, ${g}, ${b})`
}

function getGradientColor(percentage: number) {
  if (percentage <= 0.5) {
    return interpolateColor(COLORS.LOW, COLORS.MEDIUM, percentage * 2)
  }
  return interpolateColor(COLORS.MEDIUM, COLORS.HIGH, (percentage - 0.5) * 2)
}

const riskColor = computed(() => {
  return getGradientColor(props.risk / 100)
})

function getBarColor(index: number) {
  const percentage = (index - 1) / (totalBars - 1)
  return getGradientColor(percentage)
}
</script>

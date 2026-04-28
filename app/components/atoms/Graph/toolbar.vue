<!--
  Unified chart toolbar: sits directly above the chart, consolidates
  period selector, chart-type toggle, screenshot action, fullscreen,
  and custom chips (e.g. rainbow/price for crypto, rate/price for
  tesouro) into a single horizontal strip.

  Parents inject controls via three slots:
    #extras   — brand-specific toggles on the left (chips)
    #period   — the <MoleculesPeriodSelector> goes here
    (default) — the toolbar renders its own actions on the right

  Emits:
    @screenshot — user clicked the camera icon (parent opens modal)
    @fullscreen — user clicked the expand icon (parent opens dialog)
    @chart-type — user toggled between 'line' and 'candle'
-->
<template>
  <div
    class="chart-toolbar flex flex-wrap items-center justify-between gap-3"
  >
    <!-- Left: extras (brand-specific chips) + optional header -->
    <div class="flex flex-wrap items-center gap-2">
      <slot name="extras" />
    </div>

    <!-- Right: period + standard actions -->
    <div class="flex flex-wrap items-center gap-2">
      <slot name="period" />

      <!-- Divider (visible only when both period and actions present) -->
      <span
        v-if="$slots.period && showActions"
        class="hidden h-5 w-px md:inline-block"
        :style="{ backgroundColor: 'var(--brand-border)' }"
        aria-hidden="true"
      />

      <!-- Chart type toggle (line / candle) — rendered only when enabled -->
      <div
        v-if="chartTypes && chartTypes.length > 1"
        class="inline-flex items-center border"
        :style="{ borderColor: 'var(--brand-border)' }"
        role="group"
        aria-label="Tipo de gráfico"
      >
        <button
          v-for="type in chartTypes"
          :key="type.value"
          type="button"
          class="inline-flex size-8 items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          :style="{
            backgroundColor: chartType === type.value ? brand.colors.primary : 'transparent',
            color: chartType === type.value ? brand.colors.background : 'var(--brand-text-muted)',
          }"
          :aria-pressed="chartType === type.value"
          :aria-label="type.label"
          @click="$emit('chart-type', type.value)"
        >
          <UIcon :name="type.icon" class="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <!-- Screenshot button -->
      <button
        v-if="showScreenshot"
        type="button"
        class="inline-flex size-8 items-center justify-center border transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        :style="{
          borderColor: 'var(--brand-border)',
          backgroundColor: 'var(--brand-surface)',
          color: 'var(--brand-text-muted)',
        }"
        aria-label="Compartilhar como imagem"
        @click="$emit('screenshot')"
      >
        <UIcon name="i-lucide-camera" class="size-3.5" aria-hidden="true" />
      </button>

      <!-- Fullscreen button -->
      <button
        v-if="showFullscreen"
        type="button"
        class="inline-flex size-8 items-center justify-center border transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        :style="{
          borderColor: 'var(--brand-border)',
          backgroundColor: 'var(--brand-surface)',
          color: 'var(--brand-text-muted)',
        }"
        aria-label="Abrir em tela cheia"
        @click="$emit('fullscreen')"
      >
        <UIcon name="i-lucide-maximize-2" class="size-3.5" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

interface ChartTypeOption {
  label: string
  value: 'line' | 'candle' | string
  icon: string
}

const props = withDefaults(
  defineProps<{
    chartType?: string
    chartTypes?: ChartTypeOption[]
    showScreenshot?: boolean
    showFullscreen?: boolean
  }>(),
  {
    chartType: 'line',
    chartTypes: () => [],
    showScreenshot: true,
    showFullscreen: false,
  },
)

defineEmits<{
  (e: 'screenshot'): void
  (e: 'fullscreen'): void
  (e: 'chart-type', value: string): void
}>()

const brand = useBrand()
const slots = useSlots()

const showActions = computed(
  () => props.showScreenshot || props.showFullscreen || (props.chartTypes && props.chartTypes.length > 1),
)
</script>

<!--
  GoalDetailStat — small KPI tile used inside the goal detail drawer.

  Visual: tabular-num value (large) + uppercase label (small) + optional
  hint paragraph below. The `emphasize` prop lets the parent paint the
  value in semantic color (positive / warning / negative) without the
  child knowing about the brand palette beyond the standard tokens.

  Decorative-only — no interaction. Headings use `<dt>/<dd>` semantics
  so screen readers announce the label-value relationship correctly.
-->
<template>
  <div
    class="goal-stat-card flex flex-col gap-1 rounded-2xl px-3 py-2.5"
    :style="cardStyle"
  >
    <dt
      class="font-mono-tab text-[10px] uppercase tracking-[0.16em]"
      :style="{ color: brand.colors.textMuted }"
    >{{ label }}</dt>
    <dd
      class="font-display text-[16px] font-semibold tabular-nums leading-none tracking-tight"
      :style="{ color: valueColor }"
    >{{ value }}</dd>
    <dd
      v-if="hint"
      class="text-[10.5px]"
      :style="{ color: brand.colors.textMuted }"
    >{{ hint }}</dd>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string
  hint?: string
  emphasize?: 'positive' | 'warning' | 'negative'
}>()

const brand = useBrand()

const valueColor = computed(() => {
  switch (props.emphasize) {
    case 'positive':
      return brand.colors.positive
    case 'warning':
      return brand.colors.warning ?? '#f59e0b'
    case 'negative':
      return brand.colors.negative
    default:
      return brand.colors.text
  }
})

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.background} 50%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
}))
</script>

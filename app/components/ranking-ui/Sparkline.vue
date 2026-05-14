<!--
  RankingUiSparkline: SVG inline pra mini-charts.
  Suporta line apenas ou line + gradient area fill (when with-gradient).
  Props: data (number[]), width, height, direction (positive/negative), withGradient, strokeWidth.
-->
<template>
  <svg
    class="rk-spark"
    :viewBox="`0 0 ${width} ${height}`"
    preserveAspectRatio="none"
  >
    <defs v-if="withGradient">
      <linearGradient :id="gradId" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" :stop-color="strokeColor" stop-opacity="0.28" />
        <stop offset="100%" :stop-color="strokeColor" stop-opacity="0" />
      </linearGradient>
    </defs>
    <polygon
      v-if="withGradient && points"
      :points="`0,${height} ${points} ${width},${height}`"
      :fill="`url(#${gradId})`"
    />
    <polyline
      v-if="points"
      :points="points"
      fill="none"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
    />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    data: number[]
    width?: number
    height?: number
    direction?: 'positive' | 'negative'
    withGradient?: boolean
    strokeWidth?: number
  }>(),
  {
    width: 600,
    height: 140,
    direction: 'positive',
    withGradient: false,
    strokeWidth: 2,
  }
)

const uid = Math.random().toString(36).slice(2, 9)
const gradId = computed(() => `rk-grad-${uid}`)

const strokeColor = computed(() =>
  props.direction === 'positive' ? 'var(--brand-positive)' : 'var(--brand-negative)'
)

const points = computed(() => {
  if (!props.data?.length) return ''
  const min = Math.min(...props.data)
  const max = Math.max(...props.data)
  const range = max - min || 1
  return props.data
    .map((d, i) => {
      const x = (i / (props.data.length - 1)) * props.width
      const y = props.height - ((d - min) / range) * props.height
      return `${x},${y}`
    })
    .join(' ')
})
</script>

<style scoped>
.rk-spark {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

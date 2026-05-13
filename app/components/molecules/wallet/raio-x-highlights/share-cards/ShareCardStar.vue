<!--
  ShareCardStar — 4-point gold star/spark used everywhere on the
  share cards. SVG so it scales crisply at any export size.
-->
<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${box} ${box}`"
    fill="currentColor"
    aria-hidden="true"
  >
    <defs>
      <radialGradient :id="gradId" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff5d6" stop-opacity="0.95" />
        <stop offset="40%" stop-color="#f3c870" />
        <stop offset="100%" stop-color="#a07310" />
      </radialGradient>
    </defs>
    <path
      :d="path"
      :fill="`url(#${gradId})`"
      :stroke="'rgba(70, 40, 5, 0.7)'"
      stroke-width="0.5"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number | string
}
const props = withDefaults(defineProps<Props>(), { size: 24 })

const box = 24
const gradId = `star-${Math.random().toString(36).slice(2, 8)}`
const path = computed(() => {
  // 4-point star with concave waist — the "twinkle" shape
  return [
    'M12 0',
    'C12 5 13 11 24 12',
    'C13 13 12 19 12 24',
    'C12 19 11 13 0 12',
    'C11 11 12 5 12 0',
    'Z',
  ].join(' ')
})
</script>

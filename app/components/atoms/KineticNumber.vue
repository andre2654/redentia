<!--
  KineticNumber — animated count-up for big display numbers.

  Used in Raio-X Highlights to ramp scores/values from 0 to target value
  with an ease-out curve. Reduces to instant render on prefers-reduced-motion.

  Usage:
    <AtomsKineticNumber :value="94" :duration="1200" prefix="" suffix="" />
-->
<template>
  <span
    class="kinetic-num tabular-nums"
    :class="{ 'kinetic-num--settled': settled }"
  >
    <span v-if="prefix" class="kinetic-num__prefix">{{ prefix }}</span>
    <span class="kinetic-num__value">{{ formatted }}</span>
    <span v-if="suffix" class="kinetic-num__suffix">{{ suffix }}</span>
  </span>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

interface Props {
  value: number
  /** Total animation duration in ms. */
  duration?: number
  /** Decimals to keep after the decimal point. */
  decimals?: number
  prefix?: string
  suffix?: string
  /** Delay before starting the count-up. */
  delayMs?: number
  /** Force-restart the animation when the key changes. */
  restartKey?: string | number
  /** pt-BR thousands separator (default true). */
  locale?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  duration: 1200,
  decimals: 0,
  prefix: '',
  suffix: '',
  delayMs: 0,
  locale: true,
})

const display = ref(0)
const settled = ref(false)
let rafId: number | null = null

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

function play() {
  if (typeof window === 'undefined') {
    display.value = props.value
    settled.value = true
    return
  }
  if (rafId != null) cancelAnimationFrame(rafId)

  // Respeita prefers-reduced-motion: pula a animacao.
  const prm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (prm) {
    display.value = props.value
    settled.value = true
    return
  }

  settled.value = false
  display.value = 0
  const start = performance.now() + props.delayMs

  function tick(now: number) {
    if (now < start) {
      rafId = requestAnimationFrame(tick)
      return
    }
    const elapsed = now - start
    const t = Math.min(1, elapsed / props.duration)
    display.value = props.value * easeOutQuart(t)
    if (t < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      display.value = props.value
      settled.value = true
    }
  }
  rafId = requestAnimationFrame(tick)
}

const formatted = ref('0')

watch(display, (v) => {
  if (props.locale) {
    formatted.value = v.toLocaleString('pt-BR', {
      minimumFractionDigits: props.decimals,
      maximumFractionDigits: props.decimals,
    })
  } else {
    formatted.value = v.toFixed(props.decimals)
  }
}, { immediate: true })

watch(() => props.restartKey, play)
watch(() => props.value, play)

onMounted(() => play())
</script>

<style scoped>
.kinetic-num {
  display: inline-flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}

.kinetic-num__value {
  display: inline-block;
}

.kinetic-num--settled .kinetic-num__value {
  animation: kinetic-settle 320ms ease-out;
}

@keyframes kinetic-settle {
  0%   { transform: translateY(0); }
  35%  { transform: translateY(-2%); }
  100% { transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .kinetic-num--settled .kinetic-num__value {
    animation: none;
  }
}
</style>

<template>
  <section class="relative overflow-hidden border-y py-20 md:py-28" style="border-color: var(--border-subtle);">
    <!-- Ambient amber radial discreto centralizado (sem grid terminal) -->
    <div class="pointer-events-none absolute inset-0">
      <div
        class="absolute left-1/2 top-1/2 h-[520px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style="background: radial-gradient(ellipse at center, color-mix(in srgb, var(--brand-primary) 16%, transparent), transparent 70%);"
      />
    </div>

    <div class="relative mx-auto max-w-6xl px-6 text-center">
      <!-- Eyebrow quiet -->
      <p class="eyebrow mb-5">Tempo de resposta</p>
      <p class="mb-8 text-[14px] leading-relaxed" style="color: var(--text-body);">{{ brand.metrics.sectionSubtitle }}</p>

      <!-- Headline quiet: weight 300 com "." amber pontual -->
      <h2
        class="mx-auto mt-2 max-w-3xl font-light leading-[1.02] text-[44px] md:text-[72px] lg:text-[88px]"
        style="color: var(--text-heading); letter-spacing: -0.025em;"
      >
        {{ brand.metrics.sectionTitle.split('.')[0] }}<span style="color: var(--brand-primary);">.</span>
      </h2>

      <!-- Hero metric: weight 300 quiet, sem mono nem font-bold -->
      <div ref="counterRef" aria-live="polite" class="mt-16 md:mt-20">
        <div class="flex items-baseline justify-center gap-2">
          <span
            class="block font-light tabular-nums text-7xl sm:text-8xl md:text-[160px] md:leading-[0.85] lg:text-[200px]"
            style="color: var(--text-heading); letter-spacing: -0.04em;"
          >
            ~{{ displayValue }}
          </span>
          <span
            class="font-light text-4xl md:text-6xl lg:text-7xl"
            style="color: var(--brand-primary); letter-spacing: -0.02em;"
          >
            s
          </span>
        </div>
        <p class="mx-auto mt-6 max-w-xl text-[13px] leading-relaxed" style="color: var(--text-muted);">
          {{ brand.metrics.counterLabel }}
        </p>
      </div>

      <!-- Stats grid quiet: card com border subtle, valor weight 300 grande -->
      <div class="mt-20 grid grid-cols-2 gap-0 rounded-lg border md:grid-cols-4" style="border-color: var(--border-subtle); background-color: var(--bg-elevated);">
        <div
          v-for="(stat, idx) in brand.metrics.stats"
          :key="stat.label"
          class="flex flex-col items-start gap-1.5 px-6 py-7 text-left"
          :class="idx > 0 && 'border-l md:border-l'"
          style="border-color: var(--border-subtle);"
        >
          <span
            class="font-light tabular-nums text-[26px] md:text-[32px]"
            style="color: var(--text-heading); letter-spacing: -0.025em;"
          >
            {{ stat.value }}
          </span>
          <span
            class="text-[12px] leading-snug"
            style="color: var(--text-body);"
          >
            {{ stat.label }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const brand = useBrand()

const counterRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

// Animated countdown from 9 → 3 seconds when the section scrolls into view,
// giving the impression of a speed test finalizing at the "3s" claim.
const displayValue = ref(9)

useIntersectionObserver(
  counterRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !isVisible.value) {
      isVisible.value = true
      animateCountdown()
    }
  },
  { threshold: 0.3 }
)

function animateCountdown() {
  const stages = [9, 8, 7, 6, 5, 4, 3]
  let idx = 0
  const tick = () => {
    if (idx >= stages.length) return
    displayValue.value = stages[idx]!
    idx++
    setTimeout(tick, 180)
  }
  tick()
}
</script>

<template>
  <section
    class="relative overflow-hidden border-y py-20 md:py-28"
    :style="{
      borderColor: brand.colors.border,
      background: `linear-gradient(to bottom, ${brand.colors.surface}40 0%, ${brand.colors.background}00 100%)`,
    }"
  >
    <!-- Amber ambient glow behind the big number -->
    <div class="pointer-events-none absolute inset-0">
      <div
        class="absolute left-1/2 top-1/2 h-[520px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-50"
        :style="{ background: `radial-gradient(ellipse at center, ${brand.colors.primary}33, transparent 70%)` }"
      />
      <!-- Tight grid overlay -->
      <div
        class="absolute inset-0 opacity-[0.035]"
        :style="{
          backgroundImage: `linear-gradient(${brand.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${brand.colors.text} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }"
      />
    </div>

    <div class="relative mx-auto max-w-6xl px-6 text-center">
      <!-- Terminal label with blinking dot and brackets -->
      <div class="mb-6 flex items-center justify-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.22em]">
        <span
          class="relative inline-block size-1.5 rounded-full"
          :style="{ backgroundColor: brand.colors.primary }"
        />
        <span :style="{ color: brand.colors.primary }">[RESPONSE.TIME]</span>
        <span :style="{ color: brand.colors.border }">-</span>
        <span :style="{ color: brand.colors.textMuted }">{{ brand.metrics.sectionSubtitle }}</span>
      </div>

      <!-- Headline, matches the guides section ("Conhecimento que gera
           resultados") so the whole unauthenticated home shares one display
           voice instead of mixing Instrument Serif with the body sans. -->
      <h2
        class="mx-auto mt-2 max-w-3xl text-4xl leading-[1.05] md:text-6xl lg:text-7xl"
        :class="[brand.font.headingWeight, brand.font.headingStyle]"
        :style="{ color: brand.colors.text }"
      >
        {{ brand.metrics.sectionTitle.split('.')[0] }}<span class="italic" :style="{ color: brand.colors.primary }">.</span>
      </h2>

      <!-- The hero metric: response time in seconds, mono, monumental -->
      <div ref="counterRef" class="mt-16 md:mt-20">
        <div class="flex items-baseline justify-center gap-2">
          <span
            class="font-mono-tab block text-7xl font-bold tabular-nums sm:text-8xl md:text-[160px] md:leading-[0.85] lg:text-[200px]"
            :style="{
              color: brand.colors.text,
              textShadow: `0 0 100px ${brand.colors.primary}40`,
            }"
          >
            ~{{ displayValue }}
          </span>
          <span
            class="font-mono-tab text-4xl font-bold md:text-6xl lg:text-7xl"
            :style="{ color: brand.colors.primary }"
          >
            s
          </span>
        </div>
        <p
          class="font-mono-tab mx-auto mt-6 max-w-xl text-[11px] uppercase tracking-[0.15em] md:text-xs"
          :style="{ color: brand.colors.textMuted }"
        >
          &gt; {{ brand.metrics.counterLabel }}
        </p>
      </div>

      <!-- Stats row as "terminal register", mono labels, tabular values -->
      <div class="mt-20 grid grid-cols-2 gap-0 border md:grid-cols-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <div
          v-for="(stat, idx) in brand.metrics.stats"
          :key="stat.label"
          class="flex flex-col items-start gap-2 px-5 py-6 text-left"
          :class="idx > 0 && 'border-l md:border-l'"
          :style="{ borderColor: brand.colors.border }"
        >
          <!-- Mono label with bracket -->
          <span
            class="font-mono-tab text-[9px] uppercase tracking-[0.18em]"
            :style="{ color: brand.colors.primary }"
          >
            [{{ String(idx + 1).padStart(2, '0') }}]
          </span>
          <span
            class="font-mono-tab text-2xl font-bold tabular-nums md:text-3xl"
            :style="{ color: brand.colors.text }"
          >
            {{ stat.value }}
          </span>
          <span
            class="text-[11px] leading-tight"
            :style="{ color: brand.colors.textMuted }"
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

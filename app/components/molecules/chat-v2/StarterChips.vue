<!--
  StarterChips — quiet entry-point suggestions above the composer.

  Visual approach: not "cards", not "buttons" — closer to inline link
  hints. Subtle ghosted pills with no border, no shadow. The eye finds
  them only when looking; the input pill below remains the page focus.

  Anatomy
  -------
  Eyebrow "EXPERIMENTE" in 10.5px mono-tab amber tracking 0.18em ·
  three short suggestion pills inline. Pills carry no surface in the
  resting state — just a near-transparent tint. On hover the tint
  picks up amber so the affordance is unambiguous.

  Why three, not four
  -------------------
  Less choice, less clutter. The chips are a "first push" — once the
  user types, they vanish. Curate ruthlessly.

  Mobile: horizontal scroll with hidden scrollbar so chips never wrap
  awkwardly under a narrow viewport.
-->
<template>
  <div
    v-if="starters.length > 0"
    class="chat-starter-chips pointer-events-auto mx-auto flex max-w-3xl flex-col"
  >
    <div
      class="starter-chip-strip flex flex-wrap items-center gap-2 overflow-x-auto md:flex-nowrap"
      role="list"
    >
      <button
        v-for="(s, i) in starters"
        :key="i"
        type="button"
        class="starter-chip group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-left text-[13px] font-normal leading-tight transition-[background-color,color] duration-200"
        :style="chipStyle"
        role="listitem"
        @click="$emit('start', s.question)"
      >
        <span class="truncate">{{ s.question }}</span>
        <UIcon
          name="i-lucide-arrow-up-right"
          class="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-80"
          :style="{ color: 'var(--brand-primary)' }"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tier?: 'basic' | 'max'
  }>(),
  { tier: 'basic' },
)

defineEmits<{
  start: [question: string]
}>()

const brand = useBrand()

interface StarterChip {
  question: string
}

// Three each — short, conversational. No icons (less ornament).
const STARTERS_BASIC: StarterChip[] = [
  { question: 'IBOV hoje' },
  { question: 'Compare PETR4 vs VALE3' },
  { question: 'FIIs com maior dividendo' },
]

const STARTERS_MAX: StarterChip[] = [
  { question: 'Carteira pra R$ 500 mil em 15 anos' },
  { question: 'Stress test: crash do S&P + Selic +5pp' },
  { question: 'Meta R$ 10mi em 18 anos é factível?' },
]

const starters = computed<StarterChip[]>(() => {
  const brandList = (props.tier === 'max'
    ? (brand.ai as { aiCtaQuestionsMax?: StarterChip[] } | undefined)?.aiCtaQuestionsMax
    : (brand.ai?.aiCtaQuestions as StarterChip[] | undefined)) ?? []
  if (brandList.length > 0) return brandList.slice(0, 3)
  return props.tier === 'max' ? STARTERS_MAX : STARTERS_BASIC
})

// Resting: solid surface with subtle border so the chip is clearly
// readable on any page background (the previous translucent tint
// blended with the page and washed out). Hover swaps to a brand-tinted
// fill and reveals the arrow icon.
const chipStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  color: 'var(--brand-text)',
  border: `1px solid color-mix(in srgb, var(--brand-border) 50%, transparent)`,
  boxShadow: `0 4px 10px -8px rgba(0, 0, 0, 0.10)`,
}))
</script>

<style scoped>
.starter-chip-strip {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.starter-chip-strip::-webkit-scrollbar {
  display: none;
}

.starter-chip:hover {
  background-color: color-mix(in srgb, var(--brand-primary) 8%, var(--brand-surface)) !important;
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent) !important;
}
</style>

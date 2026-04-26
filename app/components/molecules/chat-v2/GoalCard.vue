<!--
  GoalCard — single-goal row used inside the sidebar's Goals section.

  Visual: "what is the goal, how is it tracking, click to anchor".
  - Status dot (green/amber/red/blue) in the gutter — color carries
    semantic meaning AND is paired with text status so we don't violate
    color-only-information accessibility.
  - Tabular-num progress percentage so the number doesn't dance as it
    increments.
  - Slim progress bar at the bottom with `transform: scaleX()` only —
    composited, no layout reflow.
  - The whole row is a `<button>` (semantic, keyboard-accessible).
  - Touch-action manipulation + visible :focus-visible ring per
    Vercel guidelines.
  - prefers-reduced-motion → no transition.
-->
<template>
  <button
    type="button"
    class="goal-card group relative flex w-full flex-col gap-2 rounded-xl px-3 py-2.5 text-left transition-colors"
    :class="{ 'is-active': active }"
    :style="cardStyle"
    :aria-pressed="active"
    :aria-label="ariaLabel"
    @click="$emit('click')"
  >
    <span class="flex min-w-0 items-center gap-2.5">
      <span
        class="inline-flex size-2 shrink-0 rounded-full"
        :style="{ backgroundColor: statusColor }"
        aria-hidden="true"
      />
      <span class="min-w-0 flex-1">
        <span class="flex items-baseline gap-1.5">
          <span v-if="goal.emoji" aria-hidden="true">{{ goal.emoji }}</span>
          <span
            class="truncate text-[13px] font-medium"
            :style="{ color: brand.colors.text }"
          >{{ goal.name }}</span>
        </span>
        <span
          class="font-mono-tab block truncate text-[10.5px] uppercase tracking-[0.12em]"
          :style="{ color: brand.colors.textMuted }"
        >
          {{ statusLabel }}
        </span>
      </span>
      <span
        class="font-mono-tab shrink-0 text-[12.5px] tabular-nums"
        :style="{ color: brand.colors.text }"
      >
        {{ progressPct }}%
      </span>
    </span>

    <!-- Slim progress bar. The track has fixed width; we scale the fill. -->
    <span class="goal-progress-track relative block h-[3px] w-full overflow-hidden rounded-full"
      :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 8%, transparent)` }"
      aria-hidden="true"
    >
      <span
        class="goal-progress-fill absolute inset-y-0 left-0 w-full origin-left rounded-full"
        :style="{
          backgroundColor: statusColor,
          transform: `scaleX(${progress})`,
          transition: 'transform 600ms cubic-bezier(0.2, 0.7, 0.3, 1)',
        }"
      />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatGoal } from '~/composables/useGoals'

const props = defineProps<{
  goal: ChatGoal
  active?: boolean
}>()
defineEmits<{ click: [] }>()
const brand = useBrand()

const target = computed(() => parseFloat(props.goal.targetAmount))
const current = computed(() => parseFloat(props.goal.currentAmount))
const progress = computed(() => Math.min(1, Math.max(0, current.value / Math.max(1, target.value))))
const progressPct = computed(() => Math.round(progress.value * 100))

const statusColor = computed(() => {
  switch (props.goal.status) {
    case 'hit':
      return brand.colors.positive
    case 'on_track':
      return brand.colors.primary
    case 'at_risk':
      return brand.colors.warning ?? '#f59e0b'
    case 'unfeasible':
      return brand.colors.negative
    default:
      return brand.colors.textMuted
  }
})

const statusLabel = computed(() => {
  switch (props.goal.status) {
    case 'hit':
      return 'Atingida'
    case 'on_track':
      return 'No caminho'
    case 'at_risk':
      return 'Atenção'
    case 'unfeasible':
      return 'Inviável'
    default:
      return '—'
  }
})

const ariaLabel = computed(
  () =>
    `${props.goal.name}: ${statusLabel.value}, ${progressPct.value}% concluído. ${props.active ? 'Ancorada à conversa atual.' : 'Clique para ancorar à conversa atual.'}`,
)

const cardStyle = computed(() => {
  // Active state — flat 6% bg + hairline border in the status hue.
  // Dropped the previous double box-shadow (1px ring + 14px glow)
  // that made the card read as a glowing alert on the sidebar; the
  // status dot + bar are signal enough.
  if (props.active) {
    return {
      backgroundColor: `color-mix(in srgb, ${statusColor.value} 6%, transparent)`,
      border: `1px solid color-mix(in srgb, ${statusColor.value} 18%, transparent)`,
    } as Record<string, string>
  }
  return {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
  } as Record<string, string>
})
</script>

<style scoped>
.goal-card {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.goal-card:hover:not(.is-active) {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}
.goal-card:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}

@media (prefers-reduced-motion: reduce) {
  .goal-progress-fill {
    transition: none !important;
  }
}
</style>

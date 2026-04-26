<!--
  GoalBadge — compact pill rendered above the active conversation when
  the session is anchored to a goal. Acts as a permanent reminder of
  the objective the agent is reasoning against.

  Click → opens the GoalDetailDrawer (TODO) or, in the meantime,
  emits `open-detail` so the parent can decide where to send the user.

  Visual:
    [ 🎯 Aposentadoria 2050 · 67%      ●  No caminho   →  Detalhes  ]

  - Tabular-num percentage so the digit doesn't dance.
  - Status dot uses semantic color paired with text — color isn't the
    only signal.
  - Two clickable affordances: the whole pill (open detail) and the
    "Desvincular" small button (unlink session from goal).
-->
<template>
  <Transition name="goal-badge-fold">
    <div
      v-if="goal"
      role="region"
      :aria-label="`Meta ancorada: ${goal.name}, ${progressPct}%`"
      class="goal-badge mx-auto flex w-full max-w-3xl items-center gap-2 rounded-full px-3 py-1.5"
      :style="badgeStyle"
    >
      <span
        class="goal-badge-dot relative inline-flex size-2 shrink-0 rounded-full"
        :style="{ backgroundColor: statusColor }"
        aria-hidden="true"
      />
      <button
        type="button"
        class="goal-badge-main flex min-w-0 flex-1 items-center gap-2 truncate text-left"
        @click="$emit('open-detail')"
      >
        <span v-if="goal.emoji" aria-hidden="true">{{ goal.emoji }}</span>
        <span
          class="truncate text-[12.5px] font-medium"
          :style="{ color: brand.colors.text }"
        >{{ goal.name }}</span>
        <span
          class="font-mono-tab shrink-0 text-[11.5px] tabular-nums"
          :style="{ color: brand.colors.textMuted }"
        >· {{ progressPct }}%</span>
        <span
          class="font-mono-tab shrink-0 text-[10.5px] uppercase tracking-[0.12em]"
          :style="{ color: statusColor }"
        >· {{ statusLabel }}</span>
      </button>
      <button
        type="button"
        class="goal-badge-unlink size-6 shrink-0 rounded-full transition-colors"
        :style="{ color: brand.colors.textMuted }"
        aria-label="Desvincular meta desta conversa"
        @click="$emit('unlink')"
      >
        <UIcon name="i-lucide-x" class="size-3.5" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatGoal } from '~/composables/useGoals'

const props = defineProps<{
  goal: ChatGoal | null
}>()

defineEmits<{
  'open-detail': []
  unlink: []
}>()

const brand = useBrand()

const progressPct = computed(() => {
  if (!props.goal) return 0
  const target = parseFloat(props.goal.targetAmount)
  const current = parseFloat(props.goal.currentAmount)
  return Math.round(Math.min(1, Math.max(0, current / Math.max(1, target))) * 100)
})

const statusColor = computed(() => {
  if (!props.goal) return brand.colors.textMuted
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
  if (!props.goal) return ''
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
      return ''
  }
})

const badgeStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${statusColor.value} 8%, transparent)`,
  border: `1px solid color-mix(in srgb, ${statusColor.value} 22%, transparent)`,
}))
</script>

<style scoped>
.goal-badge,
.goal-badge-main,
.goal-badge-unlink {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.goal-badge-main:focus-visible,
.goal-badge-unlink:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
  border-radius: 9999px;
}
.goal-badge-unlink:hover {
  background-color: color-mix(in srgb, currentColor 10%, transparent);
}

.goal-badge-fold-enter-active,
.goal-badge-fold-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}
.goal-badge-fold-enter-from,
.goal-badge-fold-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
@media (prefers-reduced-motion: reduce) {
  .goal-badge-fold-enter-active,
  .goal-badge-fold-leave-active {
    transition: none;
  }
}
</style>

<!--
  GoalsSection — sidebar block listing the user's active goals.

  Three states:
    1. Loading — skeleton rows (3) so the layout doesn't jump.
    2. Empty   — single CTA: "+ Definir minha primeira meta".
    3. Loaded  — list of GoalCard rows + footer "Nova meta".

  Visible to authenticated users only — the parent (Sidebar.vue) gates
  rendering. Goals don't make sense for anonymous device IDs.
-->
<template>
  <section
    class="goals-section flex flex-col gap-1.5 px-2 pb-3"
    :aria-labelledby="headingId"
  >
    <header class="flex items-center justify-between px-1.5 pb-1 pt-0.5">
      <h3
        :id="headingId"
        class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
        :style="{ color: brand.colors.textMuted }"
      >
        Metas
        <span
          v-if="goals.length > 0"
          class="ml-1 tabular-nums"
          :style="{ color: brand.colors.textMuted }"
        >· {{ goals.length }}</span>
      </h3>
      <button
        type="button"
        class="goals-new-btn inline-flex size-5 items-center justify-center rounded transition-colors"
        :style="{ color: brand.colors.textMuted }"
        aria-label="Nova meta"
        @click="$emit('new-goal')"
      >
        <UIcon name="i-lucide-plus" class="size-3.5" aria-hidden="true" />
      </button>
    </header>

    <!-- Loading skeleton -->
    <ul v-if="loading && goals.length === 0" class="flex flex-col gap-1" aria-hidden="true">
      <li
        v-for="i in 3"
        :key="i"
        class="goal-skeleton h-[52px] rounded-xl"
        :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 50%, transparent)` }"
      />
    </ul>

    <!-- Empty -->
    <button
      v-else-if="goals.length === 0"
      type="button"
      class="goals-empty group flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left transition-colors"
      :style="emptyStyle"
      @click="$emit('new-goal')"
    >
      <UIcon
        name="i-lucide-target"
        class="size-4 shrink-0"
        :style="{ color: brand.colors.primary }"
        aria-hidden="true"
      />
      <span class="flex flex-col">
        <span
          class="text-[12.5px] font-medium"
          :style="{ color: brand.colors.text }"
        >
          Defina sua primeira meta
        </span>
        <span
          class="text-[11px]"
          :style="{ color: brand.colors.textMuted }"
        >
          Ancorar conversas a um objetivo concreto
        </span>
      </span>
    </button>

    <!-- Loaded list -->
    <ul v-else class="flex flex-col gap-1" aria-label="Lista de metas">
      <li v-for="g in goals" :key="g.id">
        <ChatV2GoalCard
          :goal="g"
          :active="g.id === activeGoalId"
          @click="$emit('select', g)"
        />
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatGoal } from '~/composables/useGoals'

const props = defineProps<{
  goals: ChatGoal[]
  loading?: boolean
  activeGoalId?: string | null
}>()

defineEmits<{
  'new-goal': []
  'select': [goal: ChatGoal]
}>()

const brand = useBrand()
const headingId = `goals-section-${Math.random().toString(36).slice(2, 8)}`

const emptyStyle = computed(() => ({
  border: `1px dashed color-mix(in srgb, ${brand.colors.primary} 35%, transparent)`,
  backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 4%, transparent)`,
}))
</script>

<style scoped>
.goals-empty {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.goals-empty:hover {
  background-color: color-mix(in srgb, var(--brand-primary, #f5a300) 9%, transparent) !important;
}
.goals-empty:focus-visible,
.goals-new-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
  border-radius: 12px;
}
.goals-new-btn:hover {
  background-color: color-mix(in srgb, currentColor 8%, transparent);
}

.goal-skeleton {
  position: relative;
  overflow: hidden;
}
.goal-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, currentColor 6%, transparent) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: goal-skeleton-shimmer 1.4s ease-in-out infinite;
}
@keyframes goal-skeleton-shimmer {
  from {
    background-position: -100% 0;
  }
  to {
    background-position: 100% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .goal-skeleton::after {
    animation: none;
  }
}
</style>

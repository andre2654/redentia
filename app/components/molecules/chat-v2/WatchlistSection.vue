<!--
  Sidebar section — proactive watchlist (chat-side, condition-based).

  Visual restraint:
  - One row per ticker, two columns: ticker label, condition count.
  - No tints, no icons per row. The section title carries an "Adicionar"
    text link (not a button) when empty so the user can bootstrap.
-->
<template>
  <section
    v-if="watches.length > 0 || loading"
    class="watch-section relative px-2 py-2"
    aria-label="Watchlist proativa"
  >
    <header class="mb-1.5 flex items-center justify-between gap-2 px-2">
      <h3
        class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
        :style="{ color: brand.colors.textMuted }"
      >
        Watchlist
        <span v-if="watches.length > 0" class="tabular-nums">· {{ watches.length }}</span>
      </h3>
    </header>

    <ul v-if="!loading" class="flex flex-col gap-px">
      <li v-for="w in watches" :key="w.id">
        <button
          type="button"
          class="watch-row group/watch flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
          :aria-label="`${w.ticker}, ${conditionCount(w)} condição(ões)`"
          @click="$emit('select', w)"
        >
          <span class="flex min-w-0 items-center gap-2">
            <span
              class="font-mono-tab text-[12px] font-bold tracking-tight"
              :style="{ color: brand.colors.text }"
            >{{ w.ticker }}</span>
            <span
              v-if="w.label"
              class="truncate text-[11.5px]"
              :style="{ color: brand.colors.textMuted }"
            >{{ w.label }}</span>
          </span>
          <span
            class="shrink-0 font-mono-tab text-[10px] tabular-nums"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ conditionCount(w) }} cond.
          </span>
        </button>
      </li>
    </ul>

    <!-- Loading skeletons — three flat placeholder bars, no shimmer. -->
    <ul v-else class="flex flex-col gap-px">
      <li
        v-for="n in 3"
        :key="n"
        class="watch-skel mx-2 h-7 rounded-md"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.text} 5%, transparent)`,
        }"
        aria-hidden="true"
      />
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { ChatWatch } from '~/composables/useWatchlist'

defineProps<{
  watches: ChatWatch[]
  loading: boolean
}>()

defineEmits<{
  select: [watch: ChatWatch]
}>()

const brand = useBrand()

function conditionCount(w: ChatWatch): number {
  return Array.isArray(w.conditions) ? w.conditions.length : 0
}
</script>

<style scoped>
.watch-row {
  touch-action: manipulation;
}
.watch-row:hover,
.watch-row:focus-visible {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}
.watch-row:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}
</style>

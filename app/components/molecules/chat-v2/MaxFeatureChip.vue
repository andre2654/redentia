<!--
  MaxFeatureChip — inline upgrade pill rendered when the Basic tier
  refuses a MAX-only feature (chart, watchlist, scenario, register
  decision, full analysis, etc.).

  Visually mirrors the ActionProposalChip: same height, padding, badge,
  same `top: -1px` baseline alignment. Differs only in tone — a sparkle
  icon + the literal "FEATURE MAX" eyebrow + the user-facing label of
  what's gated.

  Click → dispatches a `redentia:request-max` CustomEvent that
  help.vue catches: it switches the tier picker to MAX and re-sends
  the user's last message so the user gets the answer they expected
  one click away.

  Mounted via the marked extension `{{max:LABEL}}` — see
  `useMaxFeatureProse.ts`. F5-stable because the marker lives in the
  persisted markdown.
-->
<template>
  <button
    type="button"
    class="max-feature-chip group inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 align-middle leading-none transition-[background-color,box-shadow,border-color]"
    :style="chipStyle"
    :title="title"
    @click="onClick"
  >
    <span
      class="max-feature-chip-badge inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      :style="badgeStyle"
      aria-hidden="true"
    >
      <UIcon
        name="i-lucide-sparkles"
        class="size-3"
        :style="{ color: brand.colors.primary }"
      />
    </span>
    <span
      class="max-feature-chip-eyebrow font-mono-tab text-[9.5px] font-semibold uppercase tracking-[0.16em]"
      :style="{ color: brand.colors.primary }"
    >Feature MAX</span>
    <span
      v-if="label"
      class="max-feature-chip-sep"
      :style="{ color: 'var(--brand-text-muted)' }"
      aria-hidden="true"
    >·</span>
    <span
      v-if="label"
      class="max-feature-chip-label text-[12px] font-medium"
      :style="{ color: 'var(--brand-text)' }"
    >{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** Human-friendly label of what's gated (e.g. "Gráfico", "Watchlist"). */
  label?: string
}>()

const brand = useBrand()

const title = computed(() =>
  props.label
    ? `${props.label} é uma feature do Redentia MAX. Clique pra trocar de tier.`
    : 'Esta feature está disponível só no Redentia MAX.',
)

const chipStyle = computed(() => ({
  // Soft amber surface with subtle border. Brighter on hover.
  backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 10%, var(--brand-surface))`,
  border: `1px solid color-mix(in srgb, ${brand.colors.primary} 35%, transparent)`,
  color: 'var(--brand-text)',
  // Aligns baseline with surrounding prose (same trick as TickerChip).
  position: 'relative' as const,
  top: '-1px',
}))

const badgeStyle = computed(() => ({
  width: '18px',
  height: '18px',
  backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${brand.colors.primary} 35%, transparent)`,
}))

function onClick() {
  if (typeof window === 'undefined') return
  // help.vue listens for this event and: (1) flips the tier picker
  // to MAX, (2) re-sends the user's last message so the gated
  // feature is delivered immediately.
  window.dispatchEvent(
    new CustomEvent('redentia:request-max', { detail: { label: props.label ?? null } }),
  )
}
</script>

<style scoped>
.max-feature-chip:hover {
  background-color: color-mix(in srgb, var(--brand-primary) 18%, var(--brand-surface)) !important;
  border-color: color-mix(in srgb, var(--brand-primary) 60%, transparent) !important;
  box-shadow:
    color-mix(in srgb, var(--brand-primary) 18%, transparent) 0px 8px 18px -10px,
    rgba(0, 0, 0, 0.06) 0px 4px 10px -6px;
}
</style>

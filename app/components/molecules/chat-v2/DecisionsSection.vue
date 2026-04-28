<!--
  DecisionsSection — sidebar block for the decision journal.

  Shows:
   - Hit rate metric at the top (when there are decided decisions)
   - List of pending / accepted decisions sorted by recency
   - Empty state with explanation when nothing yet

  Each row shows the action (buy/sell/etc) with a status dot, ticker
  if any, and revisita countdown ("revisita em 22d"). Clicking a row
  emits `select` so the parent can route to the source session or
  open a detail view.
-->
<template>
  <section
    class="decisions-section flex flex-col gap-1.5 px-2 pb-3"
    :aria-labelledby="headingId"
  >
    <header class="flex items-center justify-between px-1.5 pb-1 pt-0.5">
      <h3
        :id="headingId"
        class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        Decisões
        <span
          v-if="active.length > 0"
          class="ml-1 tabular-nums"
          :style="{ color: 'var(--brand-text-muted)' }"
        >· {{ active.length }}</span>
      </h3>
      <span
        v-if="hitRate.total >= 3 && hitRate.rate != null"
        class="font-mono-tab inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] tabular-nums"
        :style="hitRateStyle"
        :aria-label="`Taxa de acerto: ${(hitRate.rate * 100).toFixed(0)}% em ${hitRate.total} decisões`"
      >
        ✓ {{ (hitRate.rate * 100).toFixed(0) }}%
      </span>
    </header>

    <button
      v-if="active.length === 0 && !loading"
      type="button"
      class="decisions-empty group flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors"
      :style="emptyStyle"
      :disabled="true"
      aria-label="Sem decisões registradas ainda"
    >
      <UIcon
        name="i-lucide-notebook-pen"
        class="size-3.5 shrink-0"
        :style="{ color: 'var(--brand-text-muted)' }"
        aria-hidden="true"
      />
      <span class="flex flex-col">
        <span
          class="text-[12px] font-medium"
          :style="{ color: 'var(--brand-text)' }"
        >Sem decisões ainda</span>
        <span
          class="text-[10.5px]"
          :style="{ color: 'var(--brand-text-muted)' }"
        >Aceite uma recomendação MAX e ela aparece aqui</span>
      </span>
    </button>

    <ul v-else class="flex flex-col gap-1" aria-label="Lista de decisões ativas">
      <li v-for="d in active.slice(0, 8)" :key="d.id">
        <button
          type="button"
          class="decision-row flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors"
          @click="$emit('select', d)"
        >
          <span
            class="size-2 shrink-0 rounded-full"
            :style="{ backgroundColor: typeColor(d.type) }"
            aria-hidden="true"
          />
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="flex items-baseline gap-1.5">
              <!-- Type label is neutral; the dot to the left already
                   carries the semantic colour (buy=positive, sell=
                   negative, rebalance/allocate=primary). Coloured
                   labels added a second axis of visual signal that
                   read as redundant + noisy on the sidebar. -->
              <span
                class="font-mono-tab shrink-0 text-[10px] uppercase tracking-[0.14em]"
                :style="{ color: 'var(--brand-text-muted)' }"
              >{{ typeLabel(d.type) }}</span>
              <span
                v-if="d.ticker"
                class="truncate text-[12.5px] font-semibold tabular-nums"
                :style="{ color: 'var(--brand-text)' }"
              >{{ d.ticker }}</span>
            </span>
            <span
              class="truncate text-[11px]"
              :style="{ color: 'var(--brand-text-muted)' }"
            >{{ countdownLabel(d) }}</span>
          </span>
          <UIcon
            v-if="hasNewReview(d)"
            name="i-lucide-bell-dot"
            class="size-3.5 shrink-0"
            :style="{ color: brand.colors.warning ?? '#f59e0b' }"
            :aria-label="'Revisita disponível'"
          />
        </button>
      </li>
      <li v-if="active.length > 8" class="px-2.5 py-1">
        <button
          type="button"
          class="text-[11px] font-medium underline-offset-2 hover:underline"
          :style="{ color: 'var(--brand-primary)' }"
          @click="$emit('see-all')"
        >Ver todas ({{ active.length }})</button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatDecision, DecisionType } from '~/composables/useDecisions'

const props = defineProps<{
  decisions: ChatDecision[]
  hitRate: { hits: number; total: number; rate: number | null }
  loading?: boolean
}>()

defineEmits<{
  select: [decision: ChatDecision]
  'see-all': []
}>()

const brand = useBrand()
const headingId = `decisions-section-${Math.random().toString(36).slice(2, 8)}`

const active = computed(() =>
  props.decisions.filter((d) => d.status === 'pending' || d.status === 'accepted'),
)

function typeLabel(t: DecisionType) {
  return (
    {
      buy: 'Comprar',
      sell: 'Vender',
      rebalance: 'Rebalance',
      hold: 'Manter',
      allocate: 'Alocar',
    }[t] ?? t
  )
}

function typeColor(t: DecisionType) {
  if (t === 'buy') return brand.colors.positive
  if (t === 'sell') return brand.colors.negative
  if (t === 'rebalance' || t === 'allocate') return brand.colors.primary
  return brand.colors.textMuted
}

function countdownLabel(d: ChatDecision): string {
  if (d.status === 'pending') return 'aguardando aceite'
  if (!d.scheduledReviews || d.scheduledReviews.length === 0) return 'sem revisita'
  const now = Date.now()
  const next = d.scheduledReviews
    .map((iso) => new Date(iso).getTime())
    .filter((t) => t > now)
    .sort((a, b) => a - b)[0]
  if (!next) return 'revisitas concluídas'
  const days = Math.round((next - now) / (1000 * 60 * 60 * 24))
  return `revisita em ${days}d`
}

function hasNewReview(d: ChatDecision): boolean {
  return d.reviews.length > 0 && d.outcome == null
}

const hitRateStyle = computed(() => {
  const rate = props.hitRate.rate ?? 0
  const tone =
    rate >= 0.66 ? brand.colors.positive : rate >= 0.4 ? brand.colors.primary : brand.colors.negative
  return {
    backgroundColor: `color-mix(in srgb, ${tone} 14%, transparent)`,
    color: tone,
  }
})

const emptyStyle = computed(() => ({
  border: `1px dashed color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  backgroundColor: 'transparent',
  cursor: 'default',
}))
</script>

<style scoped>
.decision-row {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.decision-row:hover {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}
.decision-row:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}
</style>

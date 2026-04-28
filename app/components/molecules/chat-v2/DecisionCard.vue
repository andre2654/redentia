<!--
  DecisionCard — inline card rendered immediately after the agent
  recommends a concrete action (buy/sell/rebalance). The user can:

    [Aceitar e registrar]  → status: accepted, schedules revisits
    [Pedir alternativa]    → followup message back to chat
    [Pular]                → status: cancelled

  Visual: compact, premium, slightly distinct from the regular answer
  background so it reads as an interactive affordance, not prose.

  After acceptance the card collapses to a one-line confirmation
  "Decisão registrada · revisita em 30/90/180 dias".
-->
<template>
  <article
    class="decision-card relative flex flex-col gap-3 rounded-2xl px-4 py-3.5"
    :style="cardStyle"
    :aria-label="`Recomendação: ${typeLabel} ${decision.ticker ?? ''}`"
  >
    <header class="flex items-start gap-3">
      <span
        class="decision-icon flex size-9 shrink-0 items-center justify-center rounded-full"
        :style="{
          backgroundColor: `color-mix(in srgb, ${typeColor} 14%, transparent)`,
          color: typeColor,
        }"
        aria-hidden="true"
      >
        <UIcon :name="typeIcon" class="size-4" />
      </span>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <span class="flex flex-wrap items-center gap-1.5">
          <span
            class="font-mono-tab text-[10px] uppercase tracking-[0.16em]"
            :style="{ color: typeColor }"
          >{{ typeLabel }}</span>
          <ChatV2TickerChip
            v-if="decision.ticker"
            :ticker="decision.ticker"
            :price-when-mentioned="decision.targetPrice ?? null"
          />
        </span>
        <p
          v-if="primarySubtext"
          class="text-balance text-[13px] leading-snug"
          :style="{ color: 'var(--brand-text)' }"
        >{{ primarySubtext }}</p>
      </div>
      <span
        v-if="status === 'accepted' || status === 'executed'"
        class="font-mono-tab inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]"
        :style="acceptedBadgeStyle"
      >
        <UIcon name="i-lucide-check" class="size-3" aria-hidden="true" />
        Registrada
      </span>
    </header>

    <!-- Tese + Invalidador, before acceptance.
         After acceptance, we collapse them into a small details/summary
         so the answer doesn't repeat itself visually. -->
    <div v-if="status === 'pending'" class="flex flex-col gap-2 pl-12">
      <dl class="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1.5 text-[12px]">
        <dt
          class="font-mono-tab pt-0.5 text-[10px] uppercase tracking-[0.14em]"
          :style="{ color: 'var(--brand-text-muted)' }"
        >Tese</dt>
        <dd
          class="text-pretty leading-snug"
          :style="{ color: 'var(--brand-text)' }"
        >{{ decision.thesis }}</dd>
        <template v-if="decision.invalidator">
          <dt
            class="font-mono-tab pt-0.5 text-[10px] uppercase tracking-[0.14em]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >Invalidador</dt>
          <dd
            class="text-pretty leading-snug"
            :style="{ color: 'var(--brand-text)' }"
          >{{ decision.invalidator }}</dd>
        </template>
        <template v-if="decision.triggerCondition">
          <dt
            class="font-mono-tab pt-0.5 text-[10px] uppercase tracking-[0.14em]"
            :style="{ color: brand.colors.textMuted }"
          >Gatilho</dt>
          <dd
            class="text-pretty leading-snug"
            :style="{ color: brand.colors.text }"
          >{{ decision.triggerCondition }}</dd>
        </template>
      </dl>
    </div>

    <!-- Footer / action row -->
    <footer
      v-if="status === 'pending'"
      class="flex flex-wrap items-center gap-2 pl-12"
    >
      <button
        type="button"
        class="decision-btn-primary"
        :style="primaryBtnStyle"
        :disabled="busy"
        @click="accept"
      >
        <UIcon
          v-if="busy"
          name="i-lucide-loader-2"
          class="size-3.5 motion-safe:animate-spin"
          aria-hidden="true"
        />
        <UIcon v-else name="i-lucide-check" class="size-3.5" aria-hidden="true" />
        Aceitar e registrar
      </button>
      <button
        type="button"
        class="decision-btn-tertiary"
        :style="tertiaryBtnStyle"
        :disabled="busy"
        @click="$emit('ask-alt')"
      >
        Pedir alternativa
      </button>
      <button
        type="button"
        class="decision-btn-ghost"
        :style="ghostBtnStyle"
        :disabled="busy"
        @click="cancel"
      >
        Pular
      </button>
    </footer>

    <!-- Once accepted: collapsed footer w/ revisit dates -->
    <footer
      v-else-if="status === 'accepted' || status === 'executed'"
      class="flex items-center gap-2 pl-12"
    >
      <UIcon
        name="i-lucide-calendar-clock"
        class="size-3.5 shrink-0"
        :style="{ color: brand.colors.textMuted }"
        aria-hidden="true"
      />
      <p
        class="font-mono-tab text-[10.5px] uppercase tracking-[0.14em]"
        :style="{ color: brand.colors.textMuted }"
      >
        Revisita: {{ revisitsLabel }}
      </p>
    </footer>

    <p
      v-if="error"
      class="ml-12 text-[11.5px]"
      role="alert"
      :style="{ color: brand.colors.negative }"
    >{{ error }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChatDecision, DecisionType } from '~/composables/useDecisions'

const props = defineProps<{
  decision: {
    decisionId: string
    type: DecisionType
    ticker?: string | null
    thesis: string
    invalidator?: string | null
    triggerCondition?: string | null
    targetAmount?: number | null
    targetPrice?: number | null
    reviewDates: string[]
  }
}>()

defineEmits<{
  'ask-alt': []
}>()

const brand = useBrand()
const status = ref<'pending' | 'accepted' | 'cancelled' | 'executed'>('pending')
const busy = ref(false)
const error = ref<string | null>(null)

const TYPE_META: Record<DecisionType, { label: string; icon: string; tone: 'primary' | 'positive' | 'negative' | 'muted' }> = {
  buy: { label: 'Comprar', icon: 'i-lucide-trending-up', tone: 'positive' },
  sell: { label: 'Vender', icon: 'i-lucide-trending-down', tone: 'negative' },
  rebalance: { label: 'Rebalancear', icon: 'i-lucide-shuffle', tone: 'primary' },
  hold: { label: 'Manter', icon: 'i-lucide-pause', tone: 'muted' },
  allocate: { label: 'Alocar', icon: 'i-lucide-pie-chart', tone: 'primary' },
}

const meta = computed(() => TYPE_META[props.decision.type] ?? TYPE_META.allocate)
const typeLabel = computed(() => meta.value.label)
const typeIcon = computed(() => meta.value.icon)
const typeColor = computed(() => {
  switch (meta.value.tone) {
    case 'positive':
      return brand.colors.positive
    case 'negative':
      return brand.colors.negative
    case 'primary':
      return brand.colors.primary
    default:
      return brand.colors.textMuted
  }
})

const primarySubtext = computed(() => {
  const parts: string[] = []
  if (props.decision.targetAmount) parts.push(`R$ ${props.decision.targetAmount.toLocaleString('pt-BR')}`)
  if (props.decision.targetPrice) parts.push(`@ R$ ${props.decision.targetPrice.toFixed(2)}`)
  if (props.decision.triggerCondition) parts.push(`(${props.decision.triggerCondition})`)
  return parts.join(' ')
})

const revisitsLabel = computed(() => {
  if (!props.decision.reviewDates.length) return 'sem revisita'
  return props.decision.reviewDates
    .map((iso) => {
      const d = new Date(iso)
      const now = new Date()
      const days = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return days > 0 ? `+${days}d` : `${days}d`
    })
    .join(' · ')
})

// Quiet card surface — neutral background + neutral hairline. Type
// identity lives in the icon + label; the wrapper stays out of the
// way so the inline card doesn't compete with the answer text above.
const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 70%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 55%, transparent)`,
}))

const primaryBtnStyle = computed(() => ({
  backgroundColor: brand.colors.primary,
  color: brand.colors.background,
}))
const tertiaryBtnStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 12%, transparent)`,
  color: brand.colors.primary,
  border: `1px solid color-mix(in srgb, ${brand.colors.primary} 25%, transparent)`,
}))
const ghostBtnStyle = computed(() => ({
  backgroundColor: 'transparent',
  color: brand.colors.textMuted,
}))
const acceptedBadgeStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 14%, transparent)`,
  color: brand.colors.positive,
  border: `1px solid color-mix(in srgb, ${brand.colors.positive} 30%, transparent)`,
}))

async function accept() {
  busy.value = true
  error.value = null
  try {
    const { setStatus } = useDecisions()
    await setStatus(props.decision.decisionId, 'accepted')
    status.value = 'accepted'
  } catch (e) {
    error.value = (e as Error).message ?? 'Não consegui registrar agora.'
  } finally {
    busy.value = false
  }
}

async function cancel() {
  busy.value = true
  error.value = null
  try {
    const { setStatus } = useDecisions()
    await setStatus(props.decision.decisionId, 'cancelled')
    status.value = 'cancelled'
  } catch (e) {
    error.value = (e as Error).message ?? 'Não consegui registrar agora.'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.decision-card {
  position: relative;
}
.decision-btn-primary,
.decision-btn-tertiary,
.decision-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.875rem;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  transition: filter 140ms ease, background-color 140ms ease, transform 140ms ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.decision-btn-primary:not(:disabled):hover,
.decision-btn-tertiary:not(:disabled):hover {
  filter: brightness(1.05);
  transform: translateY(-0.5px);
}
.decision-btn-ghost:not(:disabled):hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent);
}
.decision-btn-primary:focus-visible,
.decision-btn-tertiary:focus-visible,
.decision-btn-ghost:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}
.decision-btn-primary:disabled,
.decision-btn-tertiary:disabled,
.decision-btn-ghost:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
@media (prefers-reduced-motion: reduce) {
  .decision-btn-primary,
  .decision-btn-tertiary,
  .decision-btn-ghost {
    transition: none;
  }
}
</style>

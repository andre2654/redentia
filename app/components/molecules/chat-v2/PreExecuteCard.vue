<!--
  Inline pre-execution card — bridges "intent" (a pending decision) and
  the user's actual click on the broker.

  Restraint:
  - Single card, one accent (severity bar). No icon circle around the
    type icon; type label is text + symbol.
  - Checklist: each item is a checkbox row with label + optional
    detail. Severity tints come from the dot only.
  - Two CTAs: "Confirmei tudo, executei" (primary) and "Ainda não"
    (ghost). The user must check all critical-severity items before
    the primary unlocks.
-->
<template>
  <article
    class="preexec-card relative flex flex-col gap-3 rounded-xl px-4 py-3.5"
    :style="cardStyle"
    aria-labelledby="preexec-title"
  >
    <!-- Severity bar -->
    <span
      class="absolute inset-y-3 left-0 w-[3px] rounded-r-full"
      :style="{ backgroundColor: brand.colors.primary }"
      aria-hidden="true"
    />

    <header class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 pl-1">
      <span
        id="preexec-title"
        class="text-[14px] font-semibold"
        :style="{ color: brand.colors.text }"
      >Pré-execução</span>
      <span
        v-if="data.ticker"
        class="font-mono-tab text-[11px] font-bold uppercase tracking-[0.14em]"
        :style="{ color: brand.colors.textMuted }"
      >{{ data.ticker }} · {{ typeLabel }}</span>
    </header>

    <!-- Snapshot grid -->
    <dl
      v-if="snapshotEntries.length > 0"
      class="grid grid-cols-2 gap-x-4 gap-y-1.5 pl-1 sm:grid-cols-3"
    >
      <div
        v-for="entry in snapshotEntries"
        :key="entry.label"
        class="flex flex-col"
      >
        <dt
          class="font-mono-tab text-[9.5px] uppercase tracking-[0.16em]"
          :style="{ color: brand.colors.textMuted }"
        >{{ entry.label }}</dt>
        <dd
          class="text-[12.5px] tabular-nums"
          :style="{ color: brand.colors.text }"
        >{{ entry.value }}</dd>
      </div>
    </dl>

    <!-- Checklist -->
    <ul
      class="flex flex-col gap-1.5 pl-1"
      :aria-label="`Checklist com ${data.items.length} ${data.items.length === 1 ? 'item' : 'itens'}`"
    >
      <li
        v-for="item in data.items"
        :key="item.id"
        class="preexec-item flex items-start gap-2.5"
      >
        <label
          class="inline-flex cursor-pointer select-none items-start gap-2.5"
        >
          <input
            type="checkbox"
            class="preexec-check mt-0.5 size-4 shrink-0 rounded-[4px]"
            :checked="checked.has(item.id)"
            :aria-describedby="item.detail ? `preexec-detail-${item.id}` : undefined"
            @change="toggle(item.id)"
          />
          <span class="flex min-w-0 flex-col gap-0.5">
            <span
              class="text-[13px] leading-snug"
              :style="{
                color: brand.colors.text,
                textDecoration: checked.has(item.id) ? 'line-through' : 'none',
                textDecorationColor: brand.colors.textMuted,
              }"
            >{{ item.label }}</span>
            <span
              v-if="item.detail"
              :id="`preexec-detail-${item.id}`"
              class="text-[11.5px] leading-snug"
              :style="{ color: brand.colors.textMuted }"
            >{{ item.detail }}</span>
          </span>
          <span
            v-if="item.severity !== 'info'"
            class="ml-auto inline-flex size-1.5 shrink-0 self-start rounded-full"
            :style="{
              backgroundColor:
                item.severity === 'critical' ? brand.colors.negative : brand.colors.primary,
              marginTop: '7px',
            }"
            :aria-label="item.severity === 'critical' ? 'crítico' : 'atenção'"
          />
        </label>
      </li>
    </ul>

    <!-- Footer actions -->
    <footer class="mt-1 flex flex-wrap items-center justify-between gap-2 pl-1">
      <p
        class="font-mono-tab text-[10px] uppercase tracking-[0.16em]"
        :style="{ color: brand.colors.textMuted }"
      >
        {{ checked.size }}/{{ data.items.length }} confirmados
      </p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="preexec-cta-ghost rounded-full px-3 py-1.5 text-[12px] transition-colors"
          :style="{
            color: brand.colors.textMuted,
            border: `1px solid color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
          }"
          @click="$emit('cancel', data.decisionId)"
        >
          Ainda não
        </button>
        <button
          type="button"
          class="preexec-cta-primary rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors"
          :style="primaryStyle"
          :disabled="!allCriticalChecked"
          @click="$emit('confirm', data.decisionId)"
        >
          Executei
        </button>
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'

export interface PreExecuteData {
  decisionId: string
  decisionType: 'buy' | 'sell' | 'rebalance' | 'hold' | 'allocate'
  ticker: string | null
  thesis: string
  invalidator: string | null
  triggerCondition: string | null
  targetAmount: number | null
  targetPrice: number | null
  currentPrice: number | null
  triggerHit: boolean
  goalStillValid: boolean | null
  goalName: string | null
  daysSinceCreated: number
  cooldownAdvised: boolean
  items: Array<{
    id: string
    label: string
    detail?: string
    severity: 'info' | 'warning' | 'critical'
  }>
}

const props = defineProps<{
  data: PreExecuteData
}>()

defineEmits<{
  confirm: [decisionId: string]
  cancel: [decisionId: string]
}>()

const brand = useBrand()

const checked = reactive(new Set<string>())

function toggle(id: string): void {
  if (checked.has(id)) checked.delete(id)
  else checked.add(id)
}

const TYPE_LABELS: Record<PreExecuteData['decisionType'], string> = {
  buy: 'Compra',
  sell: 'Venda',
  rebalance: 'Rebalance',
  hold: 'Manter',
  allocate: 'Alocação',
}
const typeLabel = computed(() => TYPE_LABELS[props.data.decisionType])

const allCriticalChecked = computed(() =>
  props.data.items
    .filter((i) => i.severity !== 'info')
    .every((i) => checked.has(i.id)),
)

const snapshotEntries = computed(() => {
  const out: Array<{ label: string; value: string }> = []
  if (props.data.targetPrice != null) {
    out.push({
      label: 'Preço alvo',
      value: `R$ ${props.data.targetPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    })
  }
  if (props.data.currentPrice != null) {
    out.push({
      label: 'Preço atual',
      value: `R$ ${props.data.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    })
  }
  if (props.data.targetAmount != null) {
    out.push({
      label: 'Valor da ordem',
      value: `R$ ${props.data.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
    })
  }
  if (props.data.goalName) {
    out.push({ label: 'Meta', value: props.data.goalName })
  }
  return out
})

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 70%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 55%, transparent)`,
  color: brand.colors.text,
}))

const primaryStyle = computed(() => {
  if (allCriticalChecked.value) {
    return {
      backgroundColor: brand.colors.primary,
      color: brand.colors.background,
    } as Record<string, string>
  }
  return {
    backgroundColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
    color: brand.colors.textMuted,
    cursor: 'not-allowed',
  } as Record<string, string>
})
</script>

<style scoped>
.preexec-card {
  isolation: isolate;
}
.preexec-cta-primary {
  touch-action: manipulation;
}
.preexec-cta-primary:not(:disabled):hover {
  filter: brightness(1.06);
}
.preexec-cta-ghost {
  touch-action: manipulation;
}
.preexec-cta-ghost:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent);
}
.preexec-cta-primary:focus-visible,
.preexec-cta-ghost:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}
.preexec-check {
  accent-color: var(--brand-primary, #f5a300);
  cursor: pointer;
}
</style>

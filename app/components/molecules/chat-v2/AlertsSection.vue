<!--
  Sidebar section — fired alerts (watchlist + agent + system).

  Visual restraint:
  - One row per alert, three columns: severity dot, ticker + title,
    relative time. Hover reveals a dismiss "x" on the trailing edge.
  - No per-severity background tints; severity = solid dot colour
    (info=textMuted, warning=brand, critical=negative).
  - Section header keeps tabular-nums count + "Limpar" link only
    when there are unread items.
-->
<template>
  <section
    v-if="alerts.length > 0"
    class="alerts-section relative px-2 py-2"
    aria-label="Alertas"
  >
    <header class="mb-1.5 flex items-center justify-between gap-2 px-2">
      <h3
        class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        Alertas
        <span class="tabular-nums">· {{ alerts.length }}</span>
      </h3>
      <button
        v-if="unread > 0"
        type="button"
        class="alerts-clear rounded-sm px-1 text-[10px] transition-colors"
        :style="{ color: 'var(--brand-text-muted)' }"
        @click="$emit('dismiss-all')"
      >
        Limpar
      </button>
    </header>
    <ul class="flex flex-col gap-px">
      <li
        v-for="alert in alerts"
        :key="alert.id"
      >
        <button
          type="button"
          class="alerts-row group/alert relative flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
          :class="alert.readAt ? 'is-read' : 'is-unread'"
          :aria-label="`${alert.title}. ${alert.body}`"
          @click="$emit('select', alert)"
        >
          <span
            class="mt-1.5 inline-flex size-1.5 shrink-0 rounded-full"
            :style="{ backgroundColor: severityColor(alert.severity) }"
            aria-hidden="true"
          />
          <span class="flex min-w-0 flex-1 flex-col">
            <span
              class="truncate text-[12.5px]"
              :style="{
                color: alert.readAt
                  ? `color-mix(in srgb, var(--brand-text) 70%, transparent)`
                  : 'var(--brand-text)',
                fontWeight: alert.readAt ? '400' : '500',
              }"
            >
              {{ alert.title }}
            </span>
            <span
              class="truncate text-[11px]"
              :style="{ color: 'var(--brand-text-muted)' }"
            >
              {{ alert.body }}
            </span>
          </span>
          <span
            class="alerts-time mt-0.5 shrink-0 font-mono-tab text-[10px] tabular-nums"
            :style="{ color: 'var(--brand-text-muted)' }"
          >
            {{ relativeTime(alert.createdAt) }}
          </span>
          <button
            type="button"
            class="alerts-dismiss absolute right-1 top-1 hidden size-5 items-center justify-center rounded-full transition-colors group-hover/alert:flex group-focus-within/alert:flex"
            :style="{ color: 'var(--brand-text-muted)' }"
            :aria-label="`Dispensar alerta ${alert.title}`"
            @click.stop="$emit('dismiss', alert.id)"
          >
            <UIcon name="i-lucide-x" class="size-3" />
          </button>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatAlert } from '~/composables/useAlerts'

const props = defineProps<{
  alerts: ChatAlert[]
}>()

defineEmits<{
  select: [alert: ChatAlert]
  dismiss: [id: string]
  'dismiss-all': []
}>()

const brand = useBrand()

const unread = computed(() => props.alerts.filter((a) => a.readAt == null).length)

function severityColor(s: ChatAlert['severity']): string {
  if (s === 'critical') return brand.colors.negative
  if (s === 'warning') return brand.colors.primary
  return brand.colors.textMuted
}

const RELATIVE_DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]

const RTF = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto', style: 'narrow' })

function relativeTime(iso: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000
  if (seconds < 5) return 'agora'
  let duration = seconds
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return RTF.format(-Math.round(duration), division.unit)
    }
    duration /= division.amount
  }
  return RTF.format(-Math.round(duration), 'year')
}
</script>

<style scoped>
.alerts-row {
  touch-action: manipulation;
}
.alerts-row:hover,
.alerts-row:focus-visible {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}
.alerts-row:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}
.alerts-clear:hover {
  color: var(--brand-text, currentColor);
}
.alerts-dismiss:hover {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}
</style>

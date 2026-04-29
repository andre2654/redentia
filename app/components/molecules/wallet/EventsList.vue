<!--
  EventsList — upcoming events worth attention.

  Each event has a `kind` that drives the icon + tint. The list
  comes from the parent (server-supplied or derived from positions
  on the client).
-->
<template>
  <section v-if="events.length" class="flex flex-col gap-5">
    <SectionHeading
      :brand="brand"
      eyebrow="Próximos eventos"
      title="Tudo que merece sua atenção nos próximos meses"
    />
    <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
      <article
        v-for="(e, i) in events"
        :key="`${e.label}-${i}`"
        class="flex items-center gap-3 rounded-lg border p-3"
        :style="cardStyle"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-md"
          :style="{ backgroundColor: `color-mix(in srgb, ${eventTint(e.kind)} 14%, transparent)` }"
        >
          <UIcon :name="eventIcon(e.kind)" class="size-4" :style="{ color: eventTint(e.kind) }" />
        </span>
        <div class="flex flex-1 flex-col leading-tight">
          <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ e.label }}</span>
          <span class="font-mono-tab text-[11px] tabular-nums" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">{{ formatDateLong(e.date) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
export type EventKind = 'ex' | 'pay' | 'earnings' | 'rotate' | 'maturity'
export interface UpcomingEvent {
  date: string
  label: string
  kind: EventKind
}
interface Props {
  events: UpcomingEvent[]
}
defineProps<Props>()

const brand = useBrand()

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

function formatDateLong(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return '—'
  return d
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    .replace(/^./, (c) => c.toUpperCase())
}

function eventTint(kind: EventKind): string {
  const warn = (brand.colors as { warning?: string }).warning || '#f59e0b'
  switch (kind) {
    case 'pay': return brand.colors.positive
    case 'ex': return brand.colors.primary
    case 'earnings': return '#a78bfa'
    case 'rotate': return '#60a5fa'
    case 'maturity': return warn
  }
}
function eventIcon(kind: EventKind): string {
  switch (kind) {
    case 'pay': return 'i-lucide-coins'
    case 'ex': return 'i-lucide-calendar-clock'
    case 'earnings': return 'i-lucide-bar-chart-3'
    case 'rotate': return 'i-lucide-repeat'
    case 'maturity': return 'i-lucide-flag'
  }
}
</script>

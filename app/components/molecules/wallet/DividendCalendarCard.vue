<!--
  DividendCalendarCard — next-60-days proventos for the user's tickers.

  Receives a flat array of upcoming events (already filtered by the
  caller). Renders a date cell + ticker badge + amount column. When
  the list is empty we hide the card entirely (parent decides via v-if).
-->
<template>
  <section class="flex flex-col gap-5">
    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <SectionHeading
        :brand="brand"
        eyebrow="Proventos · Próximos 60 dias"
        title="O que vai cair na conta"
      />
      <div class="flex items-baseline gap-2">
        <span class="text-[12.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Total estimado</span>
        <span class="font-mono-tab text-[16px] font-medium tabular-nums" :style="{ color: brand.colors.positive, letterSpacing: '-0.2px' }">{{ maskedBRL(totalEstimated) }}</span>
      </div>
    </div>

    <article v-if="events.length" class="overflow-hidden rounded-xl border" :style="cardStyle">
      <ul>
        <li
          v-for="(d, i) in events"
          :key="`${d.ticker}-${d.payment_date}`"
          class="flex items-center gap-4 px-5 py-3"
          :style="{ borderBottom: i < events.length - 1 ? `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` : 'none' }"
        >
          <div class="flex w-14 shrink-0 flex-col items-center" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">
            <span class="font-mono-tab text-[10px] font-medium uppercase" :style="{ letterSpacing: '0.14em', color: brand.colors.primary }">{{ formatMonthShort(d.payment_date) }}</span>
            <span class="font-mono-tab text-[18px] font-light tabular-nums" :style="{ color: brand.colors.text, letterSpacing: '-0.02em' }">{{ formatDay(d.payment_date) }}</span>
          </div>
          <div class="flex min-w-0 flex-1 flex-col leading-tight">
            <div class="flex items-center gap-2">
              <span class="font-mono-tab text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ d.ticker }}</span>
              <span
                class="rounded px-1.5 py-0.5 font-mono-tab text-[10px] font-medium uppercase"
                :style="{
                  letterSpacing: '0.14em',
                  backgroundColor: `color-mix(in srgb, ${labelColor(d.kind)} 14%, transparent)`,
                  color: labelColor(d.kind),
                }"
              >{{ d.kind }}</span>
            </div>
            <span v-if="d.name" class="text-[11px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">{{ d.name }}</span>
          </div>
          <span class="font-mono-tab text-[14px] tabular-nums" :style="{ color: brand.colors.positive, letterSpacing: '-0.005em' }">+{{ maskedBRL2(d.amount) }}</span>
        </li>
      </ul>
    </article>

    <article v-else class="rounded-xl border p-6 text-center" :style="cardStyle">
      <p class="text-[13px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">
        Sem proventos previstos nos próximos 60 dias para sua carteira.
      </p>
    </article>
  </section>
</template>

<script setup lang="ts">
export interface DividendEvent {
  ticker: string
  name?: string
  amount: number
  payment_date: string
  kind: 'JCP' | 'Dividendo' | 'Rendimento' | string
}
interface Props {
  events: DividendEvent[]
}
const props = defineProps<Props>()

const brand = useBrand()

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

const totalEstimated = computed(() => props.events.reduce((s, d) => s + (d.amount || 0), 0))

// Both formatters are defensive: if the date string isn't a valid
// ISO date the methods would otherwise produce "NaN" / "Invalid
// Date". We render an em-dash placeholder instead so the cell stays
// readable even when an upstream feed glitches.
function formatDay(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return '—'
  return String(d.getDate()).padStart(2, '0')
}
function formatMonthShort(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toLowerCase()
}
function labelColor(kind: string): string {
  if (kind === 'JCP') return (brand.colors as { warning?: string }).warning || '#f59e0b'
  if (kind === 'Dividendo') return brand.colors.positive
  return brand.colors.primary
}
// Mascarar total estimado + valor por evento. Dividendos refletem
// o tamanho da posicao (proventos × qty), entao expoem o patrimonio
// indiretamente. Datas + tickers continuam visiveis (info publica).
const interfaceStore = useInterfaceStore()

function formatBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n)
}
function maskedBRL(n: number): string {
  if (!interfaceStore.revealAmount) return 'R$ ••••••'
  return formatBRL(n)
}
function formatBRL2(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
function maskedBRL2(n: number): string {
  if (!interfaceStore.revealAmount) return 'R$ ••••'
  return formatBRL2(n)
}
</script>

<!--
  AllocationSection — donut by class + sectors bars + geography card.

  Receives an aggregated `byClass` array, a sectors array (already
  ranked) and a `geography` summary as props. The donut math runs
  locally, so callers don't have to pre-compute dasharrays.
-->
<template>
  <section class="flex flex-col gap-5">
    <SectionHeading
      :brand="brand"
      eyebrow="Alocação"
      title="Como sua carteira está distribuída"
    />
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <!-- Donut: por classe -->
      <article class="flex flex-col gap-4 rounded-xl border p-5" :style="cardStyle">
        <div class="flex items-baseline justify-between">
          <span class="mock-eyebrow">Por classe</span>
          <span
            class="font-mono-tab text-[10.5px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
          >{{ byClass.length }} classes</span>
        </div>
        <div class="flex items-center gap-4">
          <svg viewBox="0 0 100 100" class="size-28 shrink-0">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke-width="14"
              :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`"
            />
            <g v-for="(slice, i) in donutSlices" :key="i">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke-width="14"
                :stroke="slice.color"
                :stroke-dasharray="slice.dasharray"
                :stroke-dashoffset="slice.offset"
                transform="rotate(-90 50 50)"
                stroke-linecap="butt"
              />
            </g>
          </svg>
          <div class="flex flex-1 flex-col gap-1.5">
            <div
              v-for="row in byClass"
              :key="row.label"
              class="flex items-center justify-between gap-2 text-[12.5px]"
            >
              <div class="flex items-center gap-2">
                <span class="size-2 shrink-0 rounded-full" :style="{ backgroundColor: row.color }" />
                <span :style="{ color: brand.colors.text }">{{ row.label }}</span>
              </div>
              <span
                class="font-mono-tab tabular-nums"
                :style="{ color: `color-mix(in srgb, ${brand.colors.text} 70%, transparent)` }"
              >{{ row.weight_pct.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </article>

      <!-- Setores -->
      <article class="flex flex-col gap-4 rounded-xl border p-5" :style="cardStyle">
        <div class="flex items-baseline justify-between">
          <span class="mock-eyebrow">Por setor</span>
          <span
            class="font-mono-tab text-[10.5px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
          >Top {{ Math.min(sectors.length, 6) }} de {{ sectors.length }}</span>
        </div>
        <ul v-if="sectors.length" class="flex flex-col gap-2">
          <li
            v-for="row in sectors.slice(0, 6)"
            :key="row.sector"
            class="flex items-center gap-3"
          >
            <span class="flex-1 truncate text-[12.5px]" :style="{ color: brand.colors.text }">{{ row.sector }}</span>
            <div
              class="h-1.5 w-24 overflow-hidden rounded-full"
              :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
            >
              <div
                class="h-full rounded-full"
                :style="{
                  width: Math.min(row.weight_pct * 4, 100) + '%',
                  backgroundColor: brand.colors.primary,
                }"
              />
            </div>
            <span
              class="w-12 shrink-0 text-right font-mono-tab text-[11px] tabular-nums"
              :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }"
            >{{ row.weight_pct.toFixed(1) }}%</span>
          </li>
        </ul>
        <p
          v-else
          class="text-[12.5px]"
          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
        >Sem dados de setor.</p>
      </article>

      <!-- Geografia -->
      <article class="flex flex-col gap-3 rounded-xl border p-5" :style="cardStyle">
        <span class="mock-eyebrow">Geografia</span>
        <div class="flex items-baseline gap-2">
          <span
            class="font-mono-tab text-[20px] font-light tabular-nums"
            :style="{ color: brand.colors.text, letterSpacing: '-0.3px' }"
          >{{ geography.brPct.toFixed(1) }}%</span>
          <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Brasil</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span
            class="font-mono-tab text-[16px] font-light tabular-nums"
            :style="{ color: brand.colors.text, letterSpacing: '-0.2px' }"
          >{{ geography.intlPct.toFixed(1) }}%</span>
          <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Internacional<span v-if="geography.intlNote"> ({{ geography.intlNote }})</span></span>
        </div>
        <div
          class="mt-2 flex h-2 w-full overflow-hidden rounded-full"
          :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
        >
          <div class="h-full" :style="{ width: geography.brPct + '%', backgroundColor: brand.colors.primary }" />
          <div class="h-full" :style="{ width: geography.intlPct + '%', backgroundColor: brand.colors.positive }" />
        </div>
        <p
          v-if="geography.note"
          class="mt-2 text-[12.5px]"
          :style="{
            color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`,
            lineHeight: 1.5,
          }"
        >{{ geography.note }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ClassRow {
  label: string
  value: number
  weight_pct: number
  color: string
}
interface SectorRow {
  sector: string
  value: number
  weight_pct: number
}
interface Geography {
  brPct: number
  intlPct: number
  intlNote?: string
  note?: string
}
interface Props {
  byClass: ClassRow[]
  sectors: SectorRow[]
  geography: Geography
}
const props = defineProps<Props>()

const brand = useBrand()

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

const CIRC = 2 * Math.PI * 40
const donutSlices = computed(() => {
  let cumulative = 0
  return props.byClass.map((row) => {
    const len = (row.weight_pct / 100) * CIRC
    const slice = {
      color: row.color,
      dasharray: `${len} ${CIRC - len}`,
      offset: -cumulative,
    }
    cumulative += len
    return slice
  })
})
</script>

<style scoped>
.mock-eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
</style>

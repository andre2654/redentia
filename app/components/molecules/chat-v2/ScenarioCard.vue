<!--
  Inline what-if scenario card.

  Visual upgrade (audit follow-up: "precisamos deixar mais
  impressionante, por enquanto é só texto"):

  - Header carries the goal name + a baseline pill (status dot +
    label + projected amount in tabular-nums).
  - Each scenario gets a hero block, NOT a flat row:
      · Title + detail caption
      · BIG delta number (R$ +X / R$ -X) with semantic colour and
        trend arrow — the "wow" number, eats most of the visual
        budget on purpose.
      · Side-by-side comparison bars: baseline width vs. scenario
        width, scaled to whichever is larger so the smaller bar
        reads as a fraction. Bars animate on mount.
      · Status morph row: "● No caminho → ● Atenção" with subtle
        arrow. Only shown when the status actually changed; when
        status holds we surface effectiveCagr instead.
  - Restraint stays: one accent colour (status), one motion
    (bars growing on mount), no gradients.
-->
<template>
  <article
    class="scenario-card relative flex flex-col gap-4 rounded-2xl px-4 py-4"
    :style="cardStyle"
    aria-labelledby="scenario-title"
  >
    <header class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <div class="flex flex-col gap-0.5">
        <span
          id="scenario-title"
          class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ color: brand.colors.textMuted }"
        >Cenários · {{ data.results.length }}</span>
        <h3
          v-if="data.goalName"
          class="text-[15px] font-semibold leading-tight"
          :style="{ color: brand.colors.text }"
        >{{ data.goalName }}</h3>
      </div>
      <div class="flex items-center gap-2 text-right">
        <div class="flex flex-col gap-0">
          <span
            class="font-mono-tab text-[10px] uppercase tracking-[0.16em]"
            :style="{ color: brand.colors.textMuted }"
          >Hoje</span>
          <span
            class="font-mono-tab text-[15px] font-semibold tabular-nums"
            :style="{ color: brand.colors.text }"
          >{{ formatBRL(data.baseline.projectedAmount) }}</span>
        </div>
        <span
          class="ml-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px]"
          :style="{
            backgroundColor: `color-mix(in srgb, ${baselineStatusColor} 12%, transparent)`,
            color: baselineStatusColor,
          }"
        >
          <span
            class="inline-flex size-1.5 rounded-full"
            :style="{ backgroundColor: baselineStatusColor }"
            aria-hidden="true"
          />
          {{ statusLabel(data.baseline.status) }}
        </span>
      </div>
    </header>

    <ul class="flex flex-col gap-2">
      <li
        v-for="(r, idx) in data.results"
        :key="idx"
        class="scenario-row flex flex-col gap-3 rounded-xl px-4 py-3"
        :style="rowStyle(r)"
      >
        <!-- Title row -->
        <header class="flex items-baseline justify-between gap-3">
          <h4
            class="text-[13.5px] font-semibold leading-tight"
            :style="{ color: brand.colors.text }"
          >{{ r.label }}</h4>
          <span
            class="shrink-0 font-mono-tab text-[10.5px] uppercase tracking-[0.14em]"
            :style="{ color: brand.colors.textMuted }"
          >{{ scenarioBadgeLabel(r) }}</span>
        </header>

        <!-- Hero delta -->
        <div class="flex items-baseline gap-2">
          <UIcon
            :name="r.projectedDelta > 0 ? 'i-lucide-trending-up' : r.projectedDelta < 0 ? 'i-lucide-trending-down' : 'i-lucide-minus'"
            class="size-5 shrink-0"
            :style="{ color: deltaColor(r.projectedDelta) }"
            aria-hidden="true"
          />
          <span
            class="font-display text-[26px] font-semibold leading-none tabular-nums tracking-tight md:text-[30px]"
            :style="{ color: deltaColor(r.projectedDelta) }"
          >{{ formatDelta(r.projectedDelta) }}</span>
          <span
            class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em]"
            :style="{ color: brand.colors.textMuted }"
          >vs hoje</span>
        </div>

        <!-- Comparison bars -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-2">
            <span
              class="w-14 shrink-0 font-mono-tab text-[10px] uppercase tracking-[0.14em]"
              :style="{ color: brand.colors.textMuted }"
            >Hoje</span>
            <div
              class="relative h-1.5 flex-1 overflow-hidden rounded-full"
              :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 6%, transparent)` }"
            >
              <span
                class="scenario-bar absolute inset-y-0 left-0 origin-left rounded-full"
                :style="{
                  backgroundColor: brand.colors.textMuted,
                  width: '100%',
                  transform: `scaleX(${barFractions(r).baseline})`,
                  transition: 'transform 600ms cubic-bezier(0.2, 0.7, 0.3, 1)',
                }"
              />
            </div>
            <span
              class="w-24 shrink-0 text-right font-mono-tab text-[11px] tabular-nums"
              :style="{ color: brand.colors.textMuted }"
            >{{ formatBRLCompact(data.baseline.projectedAmount) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="w-14 shrink-0 font-mono-tab text-[10px] uppercase tracking-[0.14em]"
              :style="{ color: brand.colors.textMuted }"
            >Cenário</span>
            <div
              class="relative h-1.5 flex-1 overflow-hidden rounded-full"
              :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 6%, transparent)` }"
            >
              <span
                class="scenario-bar absolute inset-y-0 left-0 origin-left rounded-full"
                :style="{
                  backgroundColor: deltaColor(r.projectedDelta),
                  width: '100%',
                  transform: `scaleX(${barFractions(r).scenario})`,
                  transition: 'transform 600ms cubic-bezier(0.2, 0.7, 0.3, 1)',
                  transitionDelay: '120ms',
                }"
              />
            </div>
            <span
              class="w-24 shrink-0 text-right font-mono-tab text-[11px] font-semibold tabular-nums"
              :style="{ color: brand.colors.text }"
            >{{ formatBRLCompact(r.after.projectedAmount) }}</span>
          </div>
        </div>

        <!-- Footer: status morph OR cagr fact + scenario detail -->
        <footer
          class="flex flex-wrap items-center justify-between gap-2 border-t pt-2"
          :style="{ borderColor: `color-mix(in srgb, ${brand.colors.text} 6%, transparent)` }"
        >
          <p
            class="text-[11px] leading-snug"
            :style="{ color: brand.colors.textMuted }"
          >{{ r.detail }}</p>
          <div class="flex items-center gap-2">
            <span
              v-if="r.statusChanged"
              class="inline-flex items-center gap-1.5 font-mono-tab text-[10.5px] uppercase tracking-[0.14em]"
            >
              <span class="inline-flex items-center gap-1">
                <span
                  class="inline-flex size-1.5 rounded-full"
                  :style="{ backgroundColor: baselineStatusColor }"
                  aria-hidden="true"
                />
                <span :style="{ color: brand.colors.textMuted }">{{ statusLabel(data.baseline.status) }}</span>
              </span>
              <UIcon name="i-lucide-arrow-right" class="size-3" :style="{ color: brand.colors.textMuted }" aria-hidden="true" />
              <span class="inline-flex items-center gap-1">
                <span
                  class="inline-flex size-1.5 rounded-full"
                  :style="{ backgroundColor: statusColor(r.after.status) }"
                  aria-hidden="true"
                />
                <span :style="{ color: statusColor(r.after.status), fontWeight: '500' }">{{ statusLabel(r.after.status) }}</span>
              </span>
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1.5 font-mono-tab text-[10.5px] uppercase tracking-[0.14em]"
              :style="{ color: brand.colors.textMuted }"
            >
              <span
                class="inline-flex size-1.5 rounded-full"
                :style="{ backgroundColor: statusColor(r.after.status) }"
                aria-hidden="true"
              />
              {{ statusLabel(r.after.status) }} mantido
            </span>
          </div>
        </footer>
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

export interface ScenarioResult {
  label: string
  detail: string
  after: {
    projectedAmount: number
    status: string
    explanation: string
  }
  effectiveCagr: number
  projectedDelta: number
  statusChanged: boolean
}

export interface ScenarioData {
  goalId: string | null
  goalName: string | null
  baseline: {
    expectedCagr: number
    requiredCagr: number | null
    projectedAmount: number
    status: string
    explanation: string
    progressFraction: number
    monthsTotal: number
    monthsElapsed: number
  }
  results: ScenarioResult[]
}

const props = defineProps<{
  data: ScenarioData
}>()

const brand = useBrand()

function statusColor(status: string): string {
  if (status === 'hit' || status === 'on_track') return brand.colors.positive ?? brand.colors.primary
  if (status === 'at_risk') return brand.colors.primary
  if (status === 'unfeasible') return brand.colors.negative
  return brand.colors.textMuted
}

const baselineStatusColor = computed(() => statusColor(props.data.baseline.status))

function statusLabel(status: string): string {
  if (status === 'hit') return 'Atingido'
  if (status === 'on_track') return 'No caminho'
  if (status === 'at_risk') return 'Em risco'
  if (status === 'unfeasible') return 'Inviável'
  return status
}

function deltaColor(delta: number): string {
  if (delta > 0) return brand.colors.positive ?? brand.colors.primary
  if (delta < 0) return brand.colors.negative
  return brand.colors.textMuted
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

/**
 * Compact BRL formatter for the bar labels — caps the number to one
 * useful suffix so a 700K patrimonio + a 2.4M projection don't blow
 * out the column width on mobile. e.g. 2_400_000 → "R$ 2,4M".
 */
function formatBRLCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
  }
  if (abs >= 1_000) {
    return `R$ ${(value / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}K`
  }
  return formatBRL(value)
}

function formatDelta(delta: number): string {
  if (delta === 0) return '±0'
  const sign = delta > 0 ? '+' : '−'
  return `${sign}${formatBRL(Math.abs(delta))}`
}

/**
 * Mount-time animation guard. Bars start at scaleX(0); after one
 * animation frame we flip the flag and the bound transform jumps to
 * the real fraction — the CSS transition runs from 0 to the target
 * width. Honours prefers-reduced-motion via the scoped CSS rule.
 */
const animated = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animated.value = true
    })
  })
})

/**
 * For each result, returns the bar-fill fractions (0..1) for baseline
 * vs scenario. The bigger of the two is normalised to 1 so the
 * smaller bar reads as a true fraction of the larger.
 */
function barFractions(r: ScenarioResult): { baseline: number; scenario: number } {
  if (!animated.value) return { baseline: 0, scenario: 0 }
  const a = Math.max(0, props.data.baseline.projectedAmount)
  const b = Math.max(0, r.after.projectedAmount)
  const max = Math.max(a, b, 1)
  return {
    baseline: a / max,
    scenario: b / max,
  }
}

/** Short uppercase label that summarises the scenario's outcome. Lives
 *  in the row's top-right next to the title — quick scan signal. */
function scenarioBadgeLabel(r: ScenarioResult): string {
  if (r.statusChanged) {
    if (r.after.status === 'unfeasible') return 'agrava'
    if (r.after.status === 'at_risk') return 'agrava'
    if (r.after.status === 'hit' || r.after.status === 'on_track') return 'melhora'
  }
  if (r.projectedDelta > 0) return 'melhora'
  if (r.projectedDelta < 0) return 'piora'
  return 'neutro'
}

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 70%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 55%, transparent)`,
  color: brand.colors.text,
}))

function rowStyle(r: ScenarioResult): Record<string, string> {
  // Subtle wash: tint the row with the after-status colour so the eye
  // catches scenarios that change status. We avoid a heavy tint —
  // the hero delta + status morph already carry the signal; the
  // wash is just a hint.
  if (!r.statusChanged) {
    return {
      backgroundColor: `color-mix(in srgb, ${brand.colors.text} 3%, transparent)`,
    }
  }
  const tint = statusColor(r.after.status)
  return {
    backgroundColor: `color-mix(in srgb, ${tint} 6%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tint} 18%, transparent)`,
  }
}
</script>

<style scoped>
.scenario-card {
  isolation: isolate;
}

@media (prefers-reduced-motion: reduce) {
  .scenario-bar {
    transition: none !important;
  }
}
</style>

<!--
  Inline what-if scenario card — side-by-side baseline vs. simulated
  outcome for one or more scenarios applied to a goal.

  Restraint:
  - Single card per turn. Header has the goal name + baseline status
    pill (compact). Below: a list of scenario rows, each with its own
    label + before/after KPIs.
  - Status colours follow the same 3-tone scale used in GoalCard
    (on_track / at_risk / unfeasible) plus `hit` (success).
  - No gradients, no glows. Numbers use tabular-nums.
-->
<template>
  <article
    class="scenario-card relative flex flex-col gap-3 rounded-xl px-4 py-3.5"
    :style="cardStyle"
    aria-labelledby="scenario-title"
  >
    <header class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
      <span
        id="scenario-title"
        class="text-[14px] font-semibold"
        :style="{ color: brand.colors.text }"
      >Cenários</span>
      <span
        v-if="data.goalName"
        class="truncate text-[12px]"
        :style="{ color: brand.colors.textMuted }"
      >{{ data.goalName }}</span>
    </header>

    <!-- Baseline row -->
    <div
      class="scenario-baseline flex items-center justify-between gap-3 rounded-lg px-3 py-2"
      :style="{
        backgroundColor: `color-mix(in srgb, ${brand.colors.text} 4%, transparent)`,
      }"
    >
      <div class="flex items-center gap-2">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.16em]"
          :style="{ color: brand.colors.textMuted }"
        >Hoje</span>
        <span
          class="inline-flex size-1.5 shrink-0 rounded-full"
          :style="{ backgroundColor: statusColor(data.baseline.status) }"
          aria-hidden="true"
        />
        <span
          class="text-[12px]"
          :style="{ color: brand.colors.text }"
        >{{ statusLabel(data.baseline.status) }}</span>
      </div>
      <span
        class="font-mono-tab text-[13px] font-semibold tabular-nums"
        :style="{ color: brand.colors.text }"
      >{{ formatBRL(data.baseline.projectedAmount) }}</span>
    </div>

    <!-- Scenario list -->
    <ul class="flex flex-col gap-1.5">
      <li
        v-for="(r, idx) in data.results"
        :key="idx"
        class="scenario-row flex flex-col gap-1 rounded-lg px-3 py-2"
        :style="rowStyle(r)"
      >
        <div class="flex items-baseline justify-between gap-3">
          <span
            class="text-[12.5px] font-medium"
            :style="{ color: brand.colors.text }"
          >{{ r.label }}</span>
          <span
            class="font-mono-tab text-[13px] tabular-nums"
            :style="{ color: brand.colors.text }"
          >{{ formatBRL(r.after.projectedAmount) }}</span>
        </div>
        <div class="flex items-baseline justify-between gap-3">
          <span
            class="text-[11px]"
            :style="{ color: brand.colors.textMuted }"
          >{{ r.detail }}</span>
          <span class="flex items-center gap-1.5">
            <span
              class="inline-flex size-1.5 shrink-0 rounded-full"
              :style="{ backgroundColor: statusColor(r.after.status) }"
              aria-hidden="true"
            />
            <span
              class="font-mono-tab text-[11px] tabular-nums"
              :style="{ color: deltaColor(r.projectedDelta) }"
            >{{ formatDelta(r.projectedDelta) }}</span>
          </span>
        </div>
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

function statusLabel(status: string): string {
  if (status === 'hit') return 'Atingido'
  if (status === 'on_track') return 'No alvo'
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

function formatDelta(delta: number): string {
  if (delta === 0) return '±0'
  const sign = delta > 0 ? '+' : '−'
  return `${sign}${formatBRL(Math.abs(delta))}`
}

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 70%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 55%, transparent)`,
  color: brand.colors.text,
}))

function rowStyle(r: ScenarioResult): Record<string, string> {
  // Highlight rows where the status changed — that's the most
  // informative signal for the user.
  if (!r.statusChanged) {
    return {
      backgroundColor: `color-mix(in srgb, ${brand.colors.text} 3%, transparent)`,
    }
  }
  const tint = statusColor(r.after.status)
  return {
    backgroundColor: `color-mix(in srgb, ${tint} 7%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tint} 22%, transparent)`,
  }
}
</script>

<style scoped>
.scenario-card {
  isolation: isolate;
}
</style>

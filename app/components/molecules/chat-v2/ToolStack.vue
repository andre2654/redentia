<!--
  ChatV2ToolStack — hover-stack of overlapping circular avatars,
  GROUPED by tool family. One avatar per family with a counter
  badge so a heavy-research turn ("41 fontes" with 30+ asset
  lookups) reads as a clean row of ~5-8 grouped pills instead of
  a 30-circle wall.

  Anatomy
  -------
  Avatar row: one circle per family, overlapping by -10px. A small
    counter badge at top-right shows the count when count > 1.
  Status text: "Pesquisa · N fontes" eyebrow + a current-activity
    line that swaps on hover. Hover any group → label switches to
    that group's verb + count.
  Click a group → expands a detail panel beneath listing every tool
    in that group with status/duration/result preview.

  Filters out tools that own dedicated cards (decisions, scenarios,
  forms, artifacts) via `isInlineFamily()`.
-->
<template>
  <div
    v-if="totalCount > 0"
    class="tool-stack flex flex-wrap items-center gap-x-3 gap-y-2"
  >
    <!-- Avatar row — one per family, with optional counter badge -->
    <div class="hover-stack-row flex">
      <button
        v-for="(g, i) in groups"
        :key="g.family.id"
        type="button"
        class="hover-stack-avatar group relative flex size-8 shrink-0 items-center justify-center rounded-full transition-[transform,box-shadow] duration-200"
        :style="avatarStyle(g.status, i, expandedIdx === i)"
        :aria-label="`${g.family.label} (${g.count}) — ${statusLabel(g.status)}`"
        @mouseenter="hoverIdx = i"
        @mouseleave="hoverIdx = null"
        @click="toggleExpanded(i)"
      >
        <UIcon
          :name="g.family.icon"
          class="size-3.5 transition-colors"
          :style="{
            color: hoverIdx === i || expandedIdx === i
              ? 'var(--brand-primary)'
              : 'var(--brand-text)',
          }"
        />
        <!-- Pulsing ring while any tool in the group is still running -->
        <span
          v-if="g.status === 'running'"
          class="absolute inset-0 rounded-full"
          :style="{
            border: `2px solid var(--brand-primary)`,
            animation: 'tool-stack-ping 1.4s ease-in-out infinite',
          }"
          aria-hidden="true"
        />
        <!-- Counter badge (top-right corner). Hidden when count === 1
             to keep single-tool groups visually clean. -->
        <span
          v-if="g.count > 1"
          class="absolute -right-1 -top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-[3px] font-mono-tab text-[9px] font-bold tabular-nums leading-none"
          :style="counterStyle(g.status)"
        >{{ g.count }}</span>
      </button>
    </div>

    <!-- Status text — eyebrow above + main label below -->
    <div class="flex min-w-0 flex-col gap-0">
      <span
        class="font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.16em]"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        Pesquisa · {{ totalCount }} {{ totalCount === 1 ? 'fonte' : 'fontes' }}
      </span>
      <Transition name="tool-stack-status" mode="out-in">
        <span
          :key="statusKey"
          class="text-[13px] font-medium leading-tight"
          :style="{ color: 'var(--brand-text)' }"
        >{{ statusText }}</span>
      </Transition>
    </div>

    <!-- Total duration on the right -->
    <span
      v-if="totalDurationFmt"
      class="ml-auto font-mono-tab text-[11px] tabular-nums"
      :style="{ color: 'var(--brand-text-muted)' }"
    >{{ totalDurationFmt }}</span>

    <!-- Expanded group detail — lists every tool inside the group -->
    <Transition name="tool-stack-detail">
      <div
        v-if="expandedGroup"
        class="basis-full rounded-xl px-4 py-3"
        :style="{
          backgroundColor: `color-mix(in srgb, var(--brand-primary) 5%, transparent)`,
          border: `1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent)`,
        }"
      >
        <div class="mb-2 flex items-center gap-2">
          <UIcon
            :name="expandedGroup.family.icon"
            class="size-3.5"
            :style="{ color: 'var(--brand-primary)' }"
          />
          <span class="text-[13px] font-medium" :style="{ color: 'var(--brand-text)' }">
            {{ expandedGroup.family.label }}
            <span v-if="expandedGroup.count > 1" :style="{ color: 'var(--brand-text-muted)' }">· {{ expandedGroup.count }}</span>
          </span>
          <span
            class="ml-auto font-mono-tab text-[10.5px] tabular-nums uppercase tracking-[0.14em]"
            :style="{ color: statusColor(expandedGroup.status) }"
          >{{ statusLabel(expandedGroup.status) }}{{ expandedGroup.totalDurationMs ? ` · ${formatDuration(expandedGroup.totalDurationMs)}` : '' }}</span>
        </div>
        <ul class="flex flex-col gap-1">
          <li
            v-for="(t, ti) in expandedGroup.tools"
            :key="t.callId"
            class="flex items-baseline gap-2 text-[12px]"
          >
            <span
              class="inline-flex size-1.5 shrink-0 rounded-full"
              :style="{ backgroundColor: statusColor(t.status) }"
              aria-hidden="true"
            />
            <span :style="{ color: 'var(--brand-text)' }">{{ subjectFor(t) || `#${ti + 1}` }}</span>
            <span
              v-if="summaryFor(t)"
              :style="{ color: 'var(--brand-text-muted)' }"
            >· {{ summaryFor(t) }}</span>
            <span
              v-if="t.durationMs"
              class="ml-auto font-mono-tab tabular-nums text-[10.5px]"
              :style="{ color: 'var(--brand-text-muted)' }"
            >{{ formatDuration(t.durationMs) }}</span>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChatToolCall } from '~/composables/useChatStream'
import { useToolFamilies, type ToolFamily } from '~/composables/useToolFamilies'

const props = defineProps<{
  toolCalls: ChatToolCall[]
}>()

const { familyForTool, isInlineFamily } = useToolFamilies()

// ---- Group by family -----------------------------------------------------

interface ToolGroup {
  family: ToolFamily
  tools: ChatToolCall[]
  count: number
  status: ChatToolCall['status']
  totalDurationMs: number
}

/**
 * Worst-case status across a group of tools — running > error > success.
 * "Worst" is what the user needs to see at a glance: if anything's still
 * working, that's the headline; if it's done but had errors, surface
 * those; otherwise everything succeeded.
 */
function rollupStatus(tools: ChatToolCall[]): ChatToolCall['status'] {
  if (tools.some((t) => t.status === 'running')) return 'running'
  if (tools.some((t) => t.status === 'error')) return 'error'
  return 'success'
}

const groups = computed<ToolGroup[]>(() => {
  const inline = props.toolCalls.filter((t) => isInlineFamily(t.name))
  const byId = new Map<string, ToolGroup>()
  // Iterate in original execution order so the avatar row maintains the
  // narrative ("first looked up assets, then macro, then news...").
  for (const t of inline) {
    const fam = familyForTool(t.name)
    const existing = byId.get(fam.id)
    if (existing) {
      existing.tools.push(t)
    } else {
      byId.set(fam.id, {
        family: fam,
        tools: [t],
        count: 0,
        status: 'success',
        totalDurationMs: 0,
      })
    }
  }
  // Finalize aggregates after all tools are bucketed.
  for (const g of byId.values()) {
    g.count = g.tools.length
    g.status = rollupStatus(g.tools)
    g.totalDurationMs = g.tools.reduce((acc, t) => acc + (t.durationMs ?? 0), 0)
  }
  return [...byId.values()]
})

const totalCount = computed(() =>
  groups.value.reduce((acc, g) => acc + g.count, 0),
)

// ---- Hover / expand state -----------------------------------------------
const hoverIdx = ref<number | null>(null)
const expandedIdx = ref<number | null>(null)

function toggleExpanded(i: number) {
  expandedIdx.value = expandedIdx.value === i ? null : i
}

const expandedGroup = computed<ToolGroup | null>(() =>
  expandedIdx.value !== null ? (groups.value[expandedIdx.value] ?? null) : null,
)

// ---- Status label (eyebrow row) -----------------------------------------
const runningGroup = computed<ToolGroup | null>(() =>
  groups.value.find((g) => g.status === 'running') ?? null,
)

const allDone = computed(() =>
  groups.value.length > 0 &&
  groups.value.every((g) => g.status !== 'running'),
)

const statusKey = computed<string>(() => {
  if (hoverIdx.value !== null) return `hover-${hoverIdx.value}`
  if (runningGroup.value) return `running-${runningGroup.value.family.id}`
  if (allDone.value) return 'done'
  return 'default'
})

const statusText = computed<string>(() => {
  if (hoverIdx.value !== null) {
    const g = groups.value[hoverIdx.value]
    if (g) return groupLabel(g)
  }
  if (runningGroup.value) {
    const g = runningGroup.value
    // If the running group has a current subject (latest running tool's
    // ticker / query), include it.
    const currentRunning = g.tools.find((t) => t.status === 'running')
    if (currentRunning) {
      const subj = subjectFor(currentRunning)
      if (subj) return `${g.family.verb} · ${subj}`
    }
    return groupLabel(g)
  }
  if (allDone.value) return 'Pesquisa concluída'
  return 'Iniciando…'
})

function groupLabel(g: ToolGroup): string {
  if (g.count === 1) return g.family.verb
  return `${g.family.verb} · ${g.count}`
}

// ---- Total duration -----------------------------------------------------
const totalDurationFmt = computed<string>(() => {
  const total = groups.value.reduce(
    (acc, g) => acc + g.totalDurationMs,
    0,
  )
  if (total === 0) return ''
  return formatDuration(total)
})

// ---- Avatar + counter styles -------------------------------------------
function avatarStyle(
  status: ChatToolCall['status'],
  idx: number,
  expanded: boolean,
): Record<string, string> {
  const baseBorder = status === 'success'
    ? `color-mix(in srgb, var(--brand-positive) 60%, transparent)`
    : status === 'error'
      ? `color-mix(in srgb, var(--brand-negative) 60%, transparent)`
      : status === 'running'
        ? `color-mix(in srgb, var(--brand-primary) 60%, transparent)`
        : `color-mix(in srgb, var(--brand-border) 60%, transparent)`
  const isHovered = hoverIdx.value === idx
  const lifted = isHovered || expanded
  return {
    backgroundColor: 'var(--brand-surface)',
    border: `1.5px solid ${baseBorder}`,
    marginLeft: idx === 0 ? '0' : '-10px',
    transform: lifted ? 'translateY(-3px) scale(1.08)' : 'translateY(0) scale(1)',
    zIndex: String(lifted ? 50 : 50 - idx),
    boxShadow: lifted
      ? `color-mix(in srgb, var(--brand-primary) 25%, transparent) 0px 8px 18px -8px, rgba(0,0,0,0.1) 0px 4px 10px -4px`
      : 'none',
    cursor: 'pointer',
  }
}

function counterStyle(status: ChatToolCall['status']): Record<string, string> {
  // Counter badge picks up the group's status color but stays bright
  // enough to read on top of the avatar's surface.
  if (status === 'running') {
    return {
      backgroundColor: 'var(--brand-primary)',
      color: 'var(--brand-background)',
      boxShadow: `0 0 0 2px var(--brand-surface)`,
    }
  }
  if (status === 'error') {
    return {
      backgroundColor: 'var(--brand-negative)',
      color: 'var(--brand-background)',
      boxShadow: `0 0 0 2px var(--brand-surface)`,
    }
  }
  return {
    backgroundColor: 'var(--brand-text)',
    color: 'var(--brand-background)',
    boxShadow: `0 0 0 2px var(--brand-surface)`,
  }
}

// ---- Helpers ------------------------------------------------------------
function statusLabel(status: ChatToolCall['status']): string {
  if (status === 'running') return 'Em curso'
  if (status === 'success') return 'OK'
  return 'Erro'
}

function statusColor(status: ChatToolCall['status']): string {
  if (status === 'running') return 'var(--brand-primary)'
  if (status === 'success') return 'var(--brand-positive)'
  return 'var(--brand-negative)'
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

/** Pull a human-readable subject from a tool's args (ticker, query, etc.). */
function subjectFor(t: ChatToolCall): string | null {
  const a = (t.args ?? {}) as Record<string, unknown>
  const subject =
    typeof a.ticker === 'string' ? String(a.ticker).toUpperCase() :
    typeof a.symbol === 'string' ? String(a.symbol).toUpperCase() :
    typeof a.query === 'string' ? String(a.query) :
    typeof a.code === 'string' ? String(a.code).toUpperCase() :
    null
  if (subject && subject.length <= 32) return subject
  return null
}

/** Light "what came back" preview for a single tool. */
function summaryFor(t: ChatToolCall): string | null {
  if (t.status === 'running') return 'em curso'
  if (t.status === 'error') return t.error ?? 'erro'
  const r = t.result
  if (!r || typeof r !== 'object') return null
  const obj = r as Record<string, unknown>
  if (typeof obj.summary === 'string') return String(obj.summary).slice(0, 80)
  if (typeof obj.headline === 'string') return String(obj.headline).slice(0, 80)
  if (typeof obj.last_price === 'number' && typeof obj.change_percent === 'number') {
    const sign = obj.change_percent > 0 ? '+' : ''
    return `R$ ${(obj.last_price as number).toLocaleString('pt-BR')} · ${sign}${(obj.change_percent as number).toFixed(2)}%`
  }
  if (Array.isArray(obj.articles)) return `${obj.articles.length} manchetes`
  if (Array.isArray(obj.dividends)) return `${obj.dividends.length} eventos`
  return null
}
</script>

<style scoped>
.tool-stack {
  font-size: 0;
}
.tool-stack > * { font-size: initial; }

.hover-stack-avatar {
  transition: transform 200ms ease, box-shadow 200ms ease, z-index 0ms 200ms !important;
}
.hover-stack-avatar:hover { transition-delay: 0ms !important; }

@keyframes tool-stack-ping {
  75%, 100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

.tool-stack-status-enter-active,
.tool-stack-status-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.tool-stack-status-enter-from { opacity: 0; transform: translateY(3px); }
.tool-stack-status-leave-to { opacity: 0; transform: translateY(-3px); }

.tool-stack-detail-enter-active,
.tool-stack-detail-leave-active {
  transition: opacity 200ms ease, transform 200ms ease, max-height 240ms ease;
  overflow: hidden;
  max-height: 320px;
}
.tool-stack-detail-enter-from,
.tool-stack-detail-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}

@media (prefers-reduced-motion: reduce) {
  .hover-stack-avatar,
  .tool-stack-status-enter-active,
  .tool-stack-status-leave-active,
  .tool-stack-detail-enter-active,
  .tool-stack-detail-leave-active {
    transition: none !important;
    animation: none !important;
  }
}
</style>

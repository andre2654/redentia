<!--
  ChatV2ToolStack — replaces ActionGroupList. Hover-stack of overlapping
  circular avatars (one per inline tool call), with a single status
  text line that swaps when the user hovers an avatar.

  Inspired by GitHub's reviewer stack: super compact, premium feel,
  one row of vertical real estate. The running tool gets a pulsing
  amber ring; completed ones a green border, errored ones red.

  Click an avatar → expands a small detail row beneath showing args
  + result preview for that tool. Click the running label or the
  ":expand all" chip → opens a full drawer (TODO: future iteration).

  Filters out tools that have their OWN inline surface (decisions,
  scenarios, forms, etc.) — those tools get rendered as full cards
  elsewhere in Message.vue and would be redundant here.
-->
<template>
  <div
    v-if="visibleTools.length > 0"
    class="tool-stack flex flex-wrap items-center gap-x-3 gap-y-2"
  >
    <!-- Avatar row -->
    <div class="hover-stack-row flex">
      <button
        v-for="(t, i) in visibleTools"
        :key="t.callId"
        type="button"
        class="hover-stack-avatar group relative flex size-8 shrink-0 items-center justify-center rounded-full transition-[transform,box-shadow] duration-200"
        :style="avatarStyle(t.status, i, expandedIdx === i)"
        :aria-label="`${familyForTool(t.name).label} — ${statusLabel(t.status)}`"
        @mouseenter="hoverIdx = i"
        @mouseleave="hoverIdx = null"
        @click="toggleExpanded(i)"
      >
        <UIcon
          :name="familyForTool(t.name).icon"
          class="size-3.5 transition-colors"
          :style="{
            color: hoverIdx === i || expandedIdx === i
              ? 'var(--brand-primary)'
              : 'var(--brand-text)',
          }"
        />
        <!-- Pulsing ring while running -->
        <span
          v-if="t.status === 'running'"
          class="absolute inset-0 rounded-full"
          :style="{
            border: `2px solid var(--brand-primary)`,
            animation: 'tool-stack-ping 1.4s ease-in-out infinite',
          }"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- Status text — swaps to the hovered tool's label, otherwise
         shows the running one (or "concluído" when all done) -->
    <div class="flex min-w-0 flex-col gap-0">
      <span
        class="font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.16em]"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        Pesquisa · {{ visibleTools.length }} {{ visibleTools.length === 1 ? 'fonte' : 'fontes' }}
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

    <!-- Expanded detail (only one at a time, full row beneath the stack) -->
    <Transition name="tool-stack-detail">
      <div
        v-if="expandedTool"
        class="basis-full rounded-xl px-4 py-3"
        :style="{
          backgroundColor: `color-mix(in srgb, var(--brand-primary) 5%, transparent)`,
          border: `1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent)`,
        }"
      >
        <div class="mb-1.5 flex items-center gap-2">
          <UIcon
            :name="familyForTool(expandedTool.name).icon"
            class="size-3.5"
            :style="{ color: 'var(--brand-primary)' }"
          />
          <span class="text-[13px] font-medium" :style="{ color: 'var(--brand-text)' }">{{ humanize(expandedTool.name, expandedTool.args) }}</span>
          <span
            class="ml-auto font-mono-tab text-[10.5px] tabular-nums uppercase tracking-[0.14em]"
            :style="{ color: statusColor(expandedTool.status) }"
          >{{ statusLabel(expandedTool.status) }}{{ expandedTool.durationMs ? ` · ${formatDuration(expandedTool.durationMs)}` : '' }}</span>
        </div>
        <p
          v-if="expandedSummary"
          class="text-[12.5px] leading-relaxed"
          :style="{ color: 'var(--brand-text-muted)' }"
        >{{ expandedSummary }}</p>
        <p
          v-else-if="expandedTool.status === 'error'"
          class="text-[12.5px] leading-relaxed"
          :style="{ color: 'var(--brand-negative)' }"
        >{{ expandedTool.error ?? 'Erro ao executar a tool.' }}</p>
        <p
          v-else-if="expandedTool.status === 'running'"
          class="text-[12.5px] italic leading-relaxed"
          :style="{ color: 'var(--brand-text-muted)' }"
        >Executando…</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChatToolCall } from '~/composables/useChatStream'
import { useToolFamilies } from '~/composables/useToolFamilies'

const props = defineProps<{
  toolCalls: ChatToolCall[]
}>()

const { familyForTool, isInlineFamily } = useToolFamilies()

// Filter to "inline-family" tools — anything that has its own card
// (decision/scenario/form/preexec/artifact) is rendered separately
// further down in Message.vue, so we don't double-show it here.
const visibleTools = computed<ChatToolCall[]>(() =>
  props.toolCalls.filter((t) => isInlineFamily(t.name)),
)

// ---- Hover / expand state ------------------------------------------------
const hoverIdx = ref<number | null>(null)
const expandedIdx = ref<number | null>(null)

function toggleExpanded(i: number) {
  expandedIdx.value = expandedIdx.value === i ? null : i
}

const expandedTool = computed<ChatToolCall | null>(() =>
  expandedIdx.value !== null ? (visibleTools.value[expandedIdx.value] ?? null) : null,
)

// ---- Status label (above the stack) -------------------------------------
const runningTool = computed<ChatToolCall | null>(() =>
  visibleTools.value.find((t) => t.status === 'running') ?? null,
)

const allDone = computed(() =>
  visibleTools.value.length > 0 &&
  visibleTools.value.every((t) => t.status !== 'running'),
)

const statusKey = computed<string>(() => {
  if (hoverIdx.value !== null) return `hover-${hoverIdx.value}`
  if (runningTool.value) return `running-${runningTool.value.callId}`
  if (allDone.value) return 'done'
  return 'default'
})

const statusText = computed<string>(() => {
  if (hoverIdx.value !== null) {
    const t = visibleTools.value[hoverIdx.value]
    if (t) return humanize(t.name, t.args)
  }
  if (runningTool.value) return humanize(runningTool.value.name, runningTool.value.args)
  if (allDone.value) return 'Pesquisa concluída'
  return 'Iniciando…'
})

// ---- Total duration -----------------------------------------------------
const totalDurationFmt = computed<string>(() => {
  const total = visibleTools.value.reduce(
    (acc, t) => acc + (t.durationMs ?? 0),
    0,
  )
  if (total === 0) return ''
  return formatDuration(total)
})

// ---- Avatar styles ------------------------------------------------------
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

/**
 * Turn a tool name + args into a humanized status line.
 * Keeps the family-style verb but adds the most identifying argument
 * (a ticker, an index, etc.) so the user knows what's being looked at.
 */
function humanize(name: string, args: Record<string, unknown> | null | undefined): string {
  const fam = familyForTool(name)
  // Prefer ticker / index / query — whatever's the natural subject.
  const a = (args ?? {}) as Record<string, unknown>
  const subject =
    typeof a.ticker === 'string' ? String(a.ticker).toUpperCase() :
    typeof a.symbol === 'string' ? String(a.symbol).toUpperCase() :
    typeof a.query === 'string' ? String(a.query) :
    typeof a.code === 'string' ? String(a.code).toUpperCase() :
    null
  if (subject && subject.length <= 24) {
    return `${fam.verb} · ${subject}`
  }
  return fam.label
}

/** Light "what came back" preview for the expanded detail.
 *  We try to extract a one-liner from the result. Falls back to the
 *  generic family label when nothing matchable is in the payload. */
const expandedSummary = computed<string | null>(() => {
  const t = expandedTool.value
  if (!t || t.status !== 'success') return null
  const r = t.result
  if (!r || typeof r !== 'object') return null
  const obj = r as Record<string, unknown>
  // A few well-known shapes
  if (typeof obj.summary === 'string') return obj.summary
  if (typeof obj.headline === 'string') return obj.headline
  if (typeof obj.last_price === 'number' && typeof obj.change_percent === 'number') {
    const sign = obj.change_percent > 0 ? '+' : ''
    return `R$ ${(obj.last_price as number).toLocaleString('pt-BR')} · ${sign}${(obj.change_percent as number).toFixed(2)}%`
  }
  if (Array.isArray(obj.articles)) return `${obj.articles.length} manchetes`
  if (Array.isArray(obj.dividends)) return `${obj.dividends.length} eventos de dividendo`
  return null
})
</script>

<style scoped>
.tool-stack {
  /* Sits as a one-row strip above the answer text. */
  font-size: 0; /* avoids whitespace artifacts between flex children */
}
.tool-stack > * { font-size: initial; }

.hover-stack-avatar {
  /* z-index transition is delayed so the lifted state outlasts hover-out */
  transition: transform 200ms ease, box-shadow 200ms ease, z-index 0ms 200ms !important;
}
.hover-stack-avatar:hover { transition-delay: 0ms !important; }

@keyframes tool-stack-ping {
  75%, 100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

/* Status text crossfade */
.tool-stack-status-enter-active,
.tool-stack-status-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.tool-stack-status-enter-from { opacity: 0; transform: translateY(3px); }
.tool-stack-status-leave-to { opacity: 0; transform: translateY(-3px); }

/* Detail panel slide-in */
.tool-stack-detail-enter-active,
.tool-stack-detail-leave-active {
  transition: opacity 200ms ease, transform 200ms ease, max-height 240ms ease;
  overflow: hidden;
  max-height: 200px;
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

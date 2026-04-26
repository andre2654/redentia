<!--
  ActionGroup — collapsible card representing a single tool family
  inside an assistant turn (e.g. all dividend_history calls grouped
  as "Verificando dividendos (6) · 1.2s").

  Replaces the catch-all ResearchPanel: instead of one giant pill that
  groups everything, the assistant turn now renders ONE card per tool
  family, in execution order, so the user can see the agent moving
  through phases of work as they happen.

  Visual restraint:
  - Single row when collapsed: status dot + family icon + label +
    count + duration + chevron. No background fill.
  - Expanded body: hairline separator above, then a tight list of
    sub-actions with their own status dot + arg preview + duration.
  - Colour budget: ONE accent (the status dot). Everything else
    is the brand text/textMuted scale.
  - No animations beyond the chevron rotate + height transition,
    both `transform`/`opacity`-only and honour reduced-motion.

  Auto-expand: while ANY sub-action is still running, the group
  stays expanded so the user sees live progress. Once all calls
  complete, it collapses on the next render so the conversation
  doesn't pile up open accordions.

  WIG compliance:
  - role="group" + aria-label
  - real <button> for the toggle, with aria-expanded + aria-controls
  - tabular-nums on count + duration
  - touch-action: manipulation
  - prefers-reduced-motion guard
-->
<template>
  <section
    class="action-group flex flex-col"
    role="group"
    :aria-label="ariaLabel"
  >
    <button
      type="button"
      class="action-group-toggle flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors"
      :aria-expanded="open"
      :aria-controls="bodyId"
      @click="open = !open"
    >
      <!-- Status dot — amber while any call is running, neutral
           when all done, negative if any errored -->
      <span
        class="inline-flex size-1.5 shrink-0 rounded-full"
        :style="{ backgroundColor: statusColor }"
        aria-hidden="true"
      />
      <UIcon
        :name="family.icon"
        class="size-3.5 shrink-0"
        :style="{ color: brand.colors.textMuted }"
        aria-hidden="true"
      />
      <span
        class="truncate text-[12.5px]"
        :style="{ color: brand.colors.text }"
      >{{ family.label }}</span>
      <span
        class="font-mono-tab text-[11px] tabular-nums"
        :style="{ color: brand.colors.textMuted }"
      >({{ calls.length }})</span>
      <span
        v-if="totalDurationMs != null"
        class="ml-auto font-mono-tab text-[10.5px] tabular-nums"
        :style="{ color: brand.colors.textMuted }"
      >{{ formatDuration(totalDurationMs) }}</span>
      <UIcon
        :name="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="size-3.5 shrink-0"
        :style="{ color: brand.colors.textMuted, transition: 'transform 160ms ease' }"
        aria-hidden="true"
      />
    </button>

    <Transition name="action-group-body">
      <ul
        v-if="open"
        :id="bodyId"
        class="action-group-body mt-0.5 flex flex-col gap-px pb-1 pl-7 pr-2"
      >
        <li
          v-for="c in calls"
          :key="c.callId"
          class="action-call group flex items-center gap-2 rounded-sm py-0.5 text-[11.5px]"
        >
          <span
            class="inline-flex size-1 shrink-0 rounded-full"
            :style="{ backgroundColor: callStatusColor(c) }"
            aria-hidden="true"
          />
          <span
            class="truncate"
            :style="{ color: brand.colors.text }"
          >{{ describeCall(c) }}</span>
          <span
            v-if="c.error"
            class="truncate text-[10.5px]"
            :style="{ color: brand.colors.negative }"
          >· {{ c.error.slice(0, 60) }}</span>
          <span
            v-if="c.durationMs != null"
            class="ml-auto font-mono-tab text-[10px] tabular-nums"
            :style="{ color: brand.colors.textMuted }"
          >{{ formatDuration(c.durationMs) }}</span>
        </li>
      </ul>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ChatToolCall } from '~/composables/useChatStream'
import type { ToolFamily } from '~/composables/useToolFamilies'

const props = defineProps<{
  family: ToolFamily
  calls: ChatToolCall[]
}>()

const brand = useBrand()

const bodyId = `action-group-body-${Math.random().toString(36).slice(2, 8)}`
const open = ref(true)

const anyRunning = computed(() => props.calls.some((c) => c.status === 'running'))
const anyError = computed(() => props.calls.some((c) => c.status === 'error'))

// Auto-collapse once all sub-actions finish — keeps the thread clean
// when the user scrolls back. The user can re-open manually.
watch(
  anyRunning,
  (running) => {
    if (!running) open.value = false
  },
  { flush: 'post' },
)

const statusColor = computed(() => {
  if (anyRunning.value) return brand.colors.primary
  if (anyError.value) return brand.colors.negative
  return `color-mix(in srgb, ${brand.colors.text} 30%, transparent)`
})

function callStatusColor(c: ChatToolCall): string {
  if (c.status === 'running') return brand.colors.primary
  if (c.status === 'error') return brand.colors.negative
  return `color-mix(in srgb, ${brand.colors.text} 25%, transparent)`
}

const totalDurationMs = computed(() => {
  if (anyRunning.value) return null
  let total = 0
  let saw = false
  for (const c of props.calls) {
    if (typeof c.durationMs === 'number') {
      total += c.durationMs
      saw = true
    }
  }
  return saw ? total : null
})

const ariaLabel = computed(
  () =>
    `${props.family.label}, ${props.calls.length} ${props.calls.length === 1 ? 'item' : 'itens'}, ${
      anyRunning.value ? 'em execução' : 'concluído'
    }`,
)

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  const s = ms / 1000
  if (s < 10) return `${s.toFixed(1)}s`
  return `${Math.round(s)}s`
}

/**
 * One-liner describing this specific call. Pulls the most informative
 * arg per tool — keeps the expanded list scannable without dumping
 * the whole JSON.
 */
function describeCall(c: ChatToolCall): string {
  const args = c.args ?? {}
  const ticker = stringArg(args, 'ticker')
  const tickers = arrayArg(args, 'tickers')
  if (ticker) return `${prettyName(c.name)} · ${ticker}`
  if (tickers && tickers.length > 0) {
    return `${prettyName(c.name)} · ${tickers.slice(0, 3).join(', ')}${tickers.length > 3 ? '…' : ''}`
  }
  const query = stringArg(args, 'query')
  if (query) return `${prettyName(c.name)} · "${query.slice(0, 50)}${query.length > 50 ? '…' : ''}"`
  const key = stringArg(args, 'key')
  if (key) return `${prettyName(c.name)} · ${key}`
  const name = stringArg(args, 'name')
  if (name) return `${prettyName(c.name)} · ${name}`
  return prettyName(c.name)
}

function stringArg(args: Record<string, unknown>, key: string): string | null {
  const v = args[key]
  return typeof v === 'string' && v.length > 0 ? v : null
}
function arrayArg(args: Record<string, unknown>, key: string): string[] | null {
  const v = args[key]
  if (!Array.isArray(v)) return null
  const strs = v.filter((x): x is string => typeof x === 'string')
  return strs.length > 0 ? strs : null
}
function prettyName(toolName: string): string {
  return toolName.replace(/_/g, ' ')
}
</script>

<style scoped>
.action-group-toggle {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.action-group-toggle:hover {
  background-color: color-mix(in srgb, currentColor 4%, transparent);
}
.action-group-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
  border-radius: 6px;
}

.action-group-body-enter-active,
.action-group-body-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.action-group-body-enter-from,
.action-group-body-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .action-group-body-enter-active,
  .action-group-body-leave-active {
    transition: none;
  }
}
</style>

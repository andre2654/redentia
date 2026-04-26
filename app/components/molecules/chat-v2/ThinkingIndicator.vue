<!--
  ThinkingIndicator — Manus-style "thinking" surface that lives
  literally above the composer pill (rendered as a sibling inside
  Input.vue's composer-wrap, NOT a separate floating element).

  Visual identity (Manus reference):

    ┌──────────────────────────────────────────────┐
    │ ● Pensando · Verificando dividendos · 3 ▾   │  ← collapsed pill
    └──────────────────────────────────────────────┘
    ┌──────────────────────────────────────────────┐
    │  Composer pill (textarea + tier picker + ↑) │
    └──────────────────────────────────────────────┘

  Click to expand → reveals two stacked sections directly above the
  pill (still attached, no floating overlay):

    ┌──────────────────────────────────────────────┐
    │ ● Pensando · …                            ▴ │
    │ ─────────────────────────────────────────── │
    │  Reasoning stream (italic, live):           │
    │  "Olhando as memórias, vejo que…"           │
    │ ─────────────────────────────────────────── │
    │  Last 6 actions:                            │
    │   ● Buscando notícias · "PETR4 dividendos"  │
    │   ● Verificando dividendos · VALE3          │
    │   ✓ Memória · perfil_risco                  │
    └──────────────────────────────────────────────┘

  Width matches the composer's `max-w-3xl`; corner radii match the
  pill above (rounded-[24px]). Border + surface tone mirror the
  composer so the two read as one connected surface — the pill at
  the bottom is the input, the one above is the live thinking.

  Restraint:
  - One accent: the leading status dot.
  - One animation: the dot pulses opacity ONLY while a tool is
    running (no scale, honours reduced-motion).
  - Reasoning stream auto-scrolls to bottom while updating.
-->
<template>
  <Transition name="thinking-mount">
    <div
      v-if="hasContent"
      class="thinking-shell pointer-events-auto relative mx-auto mb-2 flex max-w-3xl flex-col overflow-hidden rounded-[24px] transition-[border-color,box-shadow] duration-200"
      :style="shellStyle"
    >
      <button
        type="button"
        class="thinking-toggle flex items-center gap-2.5 px-5 py-2.5 text-left transition-colors"
        :aria-expanded="open"
        :aria-controls="bodyId"
        @click="open = !open"
      >
        <span
          class="thinking-dot inline-flex size-2 shrink-0 rounded-full"
          :class="anyRunning ? 'is-running' : 'is-idle'"
          :style="{ backgroundColor: dotColor }"
          aria-hidden="true"
        />
        <span
          class="font-mono-tab text-[10.5px] uppercase tracking-[0.18em]"
          :style="{ color: brand.colors.textMuted }"
        >Pensando</span>
        <span
          v-if="currentVerb"
          class="truncate text-[12px]"
          :style="{ color: brand.colors.text }"
        >· {{ currentVerb }}</span>
        <span
          v-if="runningCount > 0"
          class="font-mono-tab text-[10.5px] tabular-nums"
          :style="{ color: brand.colors.textMuted }"
        >· {{ runningCount }}</span>
        <span class="ml-auto flex items-center gap-1">
          <UIcon
            :name="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
            class="size-3.5"
            :style="{ color: brand.colors.textMuted }"
            aria-hidden="true"
          />
        </span>
      </button>

      <Transition name="thinking-body">
        <div
          v-if="open"
          :id="bodyId"
          class="thinking-body flex flex-col gap-2 px-5 pb-3"
          :style="{
            borderTop: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
          }"
        >
          <!-- Live reasoning — italic, line-clamp-6 by default,
               auto-scrolls to bottom as new chunks arrive. -->
          <div
            v-if="reasoning"
            ref="reasoningRef"
            class="thinking-reasoning whitespace-pre-line break-words pt-2 text-[12.5px] italic leading-relaxed"
            :style="{
              color: `color-mix(in srgb, ${brand.colors.text} 80%, transparent)`,
              maxHeight: '12em',
              overflowY: 'auto',
            }"
          >{{ reasoning }}</div>

          <!-- Recent actions — last 6, with status dot + family
               label + arg preview. -->
          <ul
            v-if="recentActions.length > 0"
            class="flex flex-col gap-px"
            :style="{
              borderTop: reasoning
                ? `1px solid color-mix(in srgb, ${brand.colors.border} 30%, transparent)`
                : undefined,
              paddingTop: reasoning ? '8px' : '4px',
            }"
            aria-label="Ações recentes"
          >
            <li
              v-for="entry in recentActions"
              :key="entry.callId"
              class="flex items-center gap-2 text-[11.5px]"
            >
              <span
                class="inline-flex size-1.5 shrink-0 rounded-full"
                :style="{ backgroundColor: entryStatusColor(entry) }"
                aria-hidden="true"
              />
              <span
                class="truncate"
                :style="{ color: brand.colors.text }"
              >{{ describeEntry(entry) }}</span>
              <span
                v-if="entry.durationMs != null"
                class="ml-auto font-mono-tab text-[10px] tabular-nums"
                :style="{ color: brand.colors.textMuted }"
              >{{ formatDuration(entry.durationMs) }}</span>
            </li>
          </ul>

          <p
            v-if="!reasoning && recentActions.length === 0"
            class="py-2 text-[12px] italic"
            :style="{ color: brand.colors.textMuted }"
          >Sintetizando análise…</p>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { ChatToolCall } from '~/composables/useChatStream'

const props = defineProps<{
  /**
   * Reasoning / chain-of-thought text accumulated so far on the
   * active assistant message. Empty until a `reasoning.delta` event
   * arrives.
   */
  reasoning: string
  toolCalls: ChatToolCall[]
}>()

const brand = useBrand()
const { familyForTool } = useToolFamilies()

const bodyId = `thinking-body-${Math.random().toString(36).slice(2, 8)}`
const open = ref(false)

const reasoningRef = ref<HTMLElement | null>(null)

// Mount the indicator only when there's something to show — either
// streamed reasoning or at least one tool call. Avoids a blank pill
// flickering at the start of a turn before any chunk arrives.
const hasContent = computed(
  () => props.reasoning.length > 0 || props.toolCalls.length > 0,
)

const anyRunning = computed(() => props.toolCalls.some((c) => c.status === 'running'))
const runningCount = computed(
  () => props.toolCalls.filter((c) => c.status === 'running').length,
)

/** Single-line description for the collapsed pill. Uses the most
 *  recent running call's family verb; falls back to the most recent
 *  completion's family verb (with " · concluído"). */
const currentVerb = computed(() => {
  for (let i = props.toolCalls.length - 1; i >= 0; i--) {
    const c = props.toolCalls[i]!
    if (c.status === 'running') return familyForTool(c.name).verb
  }
  for (let i = props.toolCalls.length - 1; i >= 0; i--) {
    const c = props.toolCalls[i]!
    if (c.status === 'success' || c.status === 'error') {
      return `${familyForTool(c.name).verb} · concluído`
    }
  }
  return null
})

const recentActions = computed(() => props.toolCalls.slice(-6))

const dotColor = computed(() =>
  anyRunning.value
    ? brand.colors.primary
    : `color-mix(in srgb, ${brand.colors.text} 40%, transparent)`,
)

const shellStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 92%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  color: brand.colors.text,
  boxShadow: '0 4px 18px -10px rgba(0, 0, 0, 0.18)',
}))

function entryStatusColor(entry: ChatToolCall): string {
  if (entry.status === 'running') return brand.colors.primary
  if (entry.status === 'error') return brand.colors.negative
  return `color-mix(in srgb, ${brand.colors.text} 30%, transparent)`
}

function describeEntry(entry: ChatToolCall): string {
  const family = familyForTool(entry.name)
  const args = entry.args ?? {}
  const ticker = typeof args.ticker === 'string' ? (args.ticker as string) : null
  const tickers = Array.isArray(args.tickers) ? (args.tickers as string[]) : null
  const query = typeof args.query === 'string' ? (args.query as string) : null
  if (ticker) return `${family.label} · ${ticker}`
  if (tickers && tickers.length > 0)
    return `${family.label} · ${tickers.slice(0, 2).join(', ')}${tickers.length > 2 ? '…' : ''}`
  if (query) return `${family.label} · "${query.slice(0, 40)}${query.length > 40 ? '…' : ''}"`
  return family.label
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  const s = ms / 1000
  if (s < 10) return `${s.toFixed(1)}s`
  return `${Math.round(s)}s`
}

// Auto-scroll the reasoning area to the bottom as new chunks come in
// — feels live without being jumpy. Only scrolls when the user has
// already opened the body AND the area is overflowing.
watch(
  () => props.reasoning,
  () => {
    if (!open.value) return
    void nextTick(() => {
      const el = reasoningRef.value
      if (!el) return
      el.scrollTop = el.scrollHeight
    })
  },
)
</script>

<style scoped>
.thinking-shell {
  isolation: isolate;
}
.thinking-toggle {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.thinking-toggle:hover {
  background-color: color-mix(in srgb, currentColor 4%, transparent);
}
.thinking-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
  border-radius: 24px;
}

.thinking-dot.is-running {
  animation: thinking-dot-pulse 1.6s ease-in-out infinite;
}
@keyframes thinking-dot-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.45; }
}

@media (prefers-reduced-motion: reduce) {
  .thinking-dot.is-running {
    animation: none;
  }
}

.thinking-mount-enter-active,
.thinking-mount-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}
.thinking-mount-enter-from,
.thinking-mount-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.thinking-body-enter-active,
.thinking-body-leave-active {
  transition: opacity 160ms ease, max-height 220ms ease;
}
.thinking-body-enter-from,
.thinking-body-leave-to {
  opacity: 0;
  max-height: 0;
}
.thinking-body-enter-to,
.thinking-body-leave-from {
  max-height: 24em;
}

@media (prefers-reduced-motion: reduce) {
  .thinking-mount-enter-active,
  .thinking-mount-leave-active,
  .thinking-body-enter-active,
  .thinking-body-leave-active {
    transition: none;
  }
}

.thinking-reasoning {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, currentColor 14%, transparent) transparent;
}
.thinking-reasoning::-webkit-scrollbar {
  width: 4px;
}
.thinking-reasoning::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 2px;
}
</style>

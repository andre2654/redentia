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
  <!--
    The pill mounts whenever the parent (Input.vue) decides we're
    streaming — it doesn't hide itself when reasoning + tool calls are
    still empty. That cold-start visibility is what was missing
    before: the user used to see only a blinking yellow cursor in
    the answer area and a pill that wouldn't appear until the first
    chunk arrived (300ms+). Now the pill is up immediately with a
    pulsing dot + "Pensando" label, so the chat reads as alive even
    before the first byte of content streams.
  -->
  <Transition name="thinking-mount" appear>
    <div
      class="thinking-shell pointer-events-auto relative mx-auto mb-2 flex max-w-3xl flex-col overflow-hidden rounded-[24px] transition-[border-color,box-shadow] duration-200"
      :style="shellStyle"
    >
      <button
        type="button"
        class="thinking-toggle flex w-full items-center gap-2.5 px-5 py-2.5 text-left transition-colors"
        :aria-expanded="open"
        :aria-controls="bodyId"
        @click="open = !open"
      >
        <!-- Dot pulses for the entire lifetime of the pill — the
             parent only mounts us while streaming, so any time we're
             on screen the chat is alive. Was previously gated on
             `anyRunning` (a tool-call check) which left the dot
             static between phases of work. -->
        <span
          class="thinking-dot is-running inline-flex size-2 shrink-0 rounded-full"
          :style="{ backgroundColor: brand.colors.primary }"
          aria-hidden="true"
        />
        <span
          class="font-mono-tab shrink-0 text-[10.5px] uppercase tracking-[0.18em]"
          :style="{ color: brand.colors.textMuted }"
        >Pensando</span>
        <!-- Live reasoning preview — the tail of the model's
             chain-of-thought, faded so it reads as "ambient noise"
             rather than competing with the answer. When no reasoning
             has streamed yet, fall back to the active tool family
             verb so the pill never feels empty mid-turn. -->
        <span
          v-if="pillBody"
          class="thinking-preview min-w-0 flex-1 truncate text-[12px]"
          :style="{
            color: brand.colors.text,
            opacity: pillBody.faded ? 0.55 : 1,
          }"
        >· {{ pillBody.text }}</span>
        <UIcon
          :name="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
          class="ml-auto size-3.5 shrink-0"
          :style="{ color: brand.colors.textMuted }"
          aria-hidden="true"
        />
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

/**
 * Tail of the live reasoning stream, normalised for display in the
 * pill: collapse whitespace, strip leading/trailing markdown emphasis
 * markers (`_`, `*`), keep at most ~140 chars with a leading ellipsis
 * when truncated. The reasoning grows monotonically during a turn;
 * showing the tail = showing what the model is thinking RIGHT NOW.
 */
const reasoningPreview = computed<string | null>(() => {
  const raw = props.reasoning?.replace(/[_*`>#]+/g, '').trim()
  if (!raw) return null
  const collapsed = raw.replace(/\s+/g, ' ').trim()
  if (collapsed.length <= 140) return collapsed
  return '… ' + collapsed.slice(-140)
})

/**
 * Pill body — the bit between the "Pensando" label and the chevron.
 * Prefers the live reasoning tail (faded, ambient); falls back to
 * the active tool family verb so the pill never goes blank between
 * reasoning chunks (basic tier without extended thinking, etc).
 */
const pillBody = computed<{ text: string; faded: boolean } | null>(() => {
  if (reasoningPreview.value) {
    return { text: reasoningPreview.value, faded: true }
  }
  if (currentVerb.value) {
    return { text: currentVerb.value, faded: false }
  }
  return null
})

const recentActions = computed(() => props.toolCalls.slice(-6))

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

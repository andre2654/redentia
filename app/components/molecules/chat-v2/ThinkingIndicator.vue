<!--
  ThinkingIndicator — Manus-style floating pill that hovers just above
  the composer while the assistant is streaming a response. Tells the
  user what the agent is currently doing in one short sentence and
  expands on click to show the recent activity timeline.

  Visible only while the last assistant message is `streaming`. When
  the message completes, the pill animates down and unmounts so the
  composer area returns to its rest state.

  Lives at the same DOM level as Input.vue (rendered as a sibling in
  help.vue's thread template), positioned via `position: absolute;
  bottom: <composer height + gap>;` so it tracks the composer.

  Visual restraint:
  - Single hairline border + low-opacity surface tint, no glow.
  - One accent: the leading status dot.
  - Numbers (count of running ops, elapsed time) use tabular-nums.
  - One animation: the dot pulses ONLY while running (subtle
    opacity-only, no scale, honours reduced-motion).
-->
<template>
  <Transition name="thinking-fade">
    <div
      v-if="visible"
      class="thinking-indicator pointer-events-auto absolute inset-x-0 z-20 mx-auto flex max-w-3xl flex-col"
      :style="{
        bottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))',
      }"
    >
      <button
        type="button"
        class="thinking-toggle relative flex items-center gap-2.5 self-center rounded-full px-3 py-1.5 text-left transition-[background-color,box-shadow]"
        :style="toggleStyle"
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
        >{{ anyRunning ? 'Pensando' : 'Concluindo' }}</span>
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
        <UIcon
          :name="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-up'"
          class="size-3 shrink-0"
          :style="{ color: brand.colors.textMuted }"
          aria-hidden="true"
        />
      </button>

      <Transition name="thinking-body">
        <ul
          v-if="open && timeline.length > 0"
          :id="bodyId"
          class="thinking-body mt-1.5 flex flex-col gap-px self-center rounded-xl px-3 py-2 text-[11.5px]"
          :style="bodyStyle"
        >
          <li
            v-for="entry in timeline.slice(-6)"
            :key="entry.callId"
            class="flex items-center gap-2"
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
          </li>
        </ul>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChatToolCall } from '~/composables/useChatStream'

const props = defineProps<{
  toolCalls: ChatToolCall[]
  streaming: boolean
}>()

const brand = useBrand()
const { familyForTool } = useToolFamilies()

const bodyId = `thinking-body-${Math.random().toString(36).slice(2, 8)}`
const open = ref(false)

const visible = computed(() => props.streaming)

const anyRunning = computed(() => props.toolCalls.some((c) => c.status === 'running'))

const runningCount = computed(
  () => props.toolCalls.filter((c) => c.status === 'running').length,
)

/**
 * The "what am I doing right now" string. Picks the family of the
 * most recently started running call; falls back to the most recent
 * completed call's family while the model is post-tool-thinking.
 */
const currentVerb = computed(() => {
  // Prefer a running call so the user sees the live action
  for (let i = props.toolCalls.length - 1; i >= 0; i--) {
    const c = props.toolCalls[i]!
    if (c.status === 'running') return familyForTool(c.name).verb
  }
  // No running call — show the most recent completion as context
  for (let i = props.toolCalls.length - 1; i >= 0; i--) {
    const c = props.toolCalls[i]!
    if (c.status === 'success' || c.status === 'error') {
      return `${familyForTool(c.name).verb} · concluído`
    }
  }
  return null
})

const timeline = computed<ChatToolCall[]>(() => props.toolCalls)

const dotColor = computed(() => {
  if (anyRunning.value) return brand.colors.primary
  return `color-mix(in srgb, ${brand.colors.text} 40%, transparent)`
})

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

const toggleStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 92%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  color: brand.colors.text,
  backdropFilter: 'blur(6px)',
  boxShadow: '0 8px 24px -12px rgba(0, 0, 0, 0.18)',
}))

const bodyStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 92%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  color: brand.colors.text,
  backdropFilter: 'blur(6px)',
  boxShadow: '0 8px 24px -12px rgba(0, 0, 0, 0.18)',
  minWidth: '260px',
  maxWidth: 'min(420px, calc(100vw - 32px))',
}))
</script>

<style scoped>
.thinking-toggle {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.thinking-toggle:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--brand-primary, #f5a300),
    0 8px 24px -12px rgba(0, 0, 0, 0.18);
}
.thinking-toggle:hover {
  background-color: color-mix(in srgb, currentColor 4%, transparent);
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

.thinking-fade-enter-active,
.thinking-fade-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}
.thinking-fade-enter-from,
.thinking-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.thinking-body-enter-active,
.thinking-body-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}
.thinking-body-enter-from,
.thinking-body-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .thinking-fade-enter-active,
  .thinking-fade-leave-active,
  .thinking-body-enter-active,
  .thinking-body-leave-active {
    transition: none;
  }
}
</style>

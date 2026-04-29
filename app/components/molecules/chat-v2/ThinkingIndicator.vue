<!--
  ThinkingIndicator — minimalist line above the composer pill.

  Just a pulsing dot + "Pensando" + (optional) the verb of the
  currently-running tool family. No surface, no border, no chevron,
  no expandable body. The full reasoning + tool detail surfaces are
  already covered:
    - Status ticker (with breathing reasoning excerpts) inside the
      assistant answer area (Message.vue)
    - ToolStack with hover detail above the answer
  So this component's only job is to confirm "the input is alive,
  the model is thinking" — at composer level. A single inline line
  is plenty.
-->
<template>
  <Transition name="thinking-mount" appear>
    <div
      class="thinking-mini pointer-events-none mx-auto mb-2 flex max-w-3xl items-center gap-2 px-5"
      role="status"
      aria-live="polite"
    >
      <span class="relative inline-flex size-1.5 shrink-0">
        <span
          class="thinking-dot-ping absolute inline-flex h-full w-full rounded-full"
          :style="{ backgroundColor: 'var(--brand-primary)' }"
          aria-hidden="true"
        />
        <span
          class="relative inline-flex size-1.5 rounded-full"
          :style="{ backgroundColor: 'var(--brand-primary)' }"
          aria-hidden="true"
        />
      </span>
      <span
        class="font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.16em]"
        :style="{ color: 'var(--brand-text-muted)' }"
      >Pensando</span>
      <span
        v-if="currentVerb"
        class="min-w-0 flex-1 truncate text-[12px]"
        :style="{ color: 'var(--brand-text-muted)' }"
      >· {{ currentVerb }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatToolCall } from '~/composables/useChatStream'

const props = defineProps<{
  /**
   * Reasoning / chain-of-thought text accumulated so far. Kept in the
   * props for backward compat with the old indicator — we don't render
   * the full reasoning here anymore (the breathing ticker in the
   * answer area already shows it). Could be removed in a future
   * cleanup pass once Input.vue is updated to stop passing it.
   */
  reasoning?: string
  toolCalls: ChatToolCall[]
}>()

const { familyForTool } = useToolFamilies()

/**
 * The verb of the currently-running tool family (single short phrase).
 * Falls back to the most recent completion's verb plus "concluído" so
 * the line never goes blank between phases. Returns null when there's
 * nothing tool-y to show — the dot + "Pensando" is enough on its own.
 */
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
</script>

<style scoped>
/* Match the cold-start ticker animation in Message.vue so the two
   feel like the same family of feedback. */
.thinking-dot-ping {
  animation: thinking-mini-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
  opacity: 0.6;
}
@keyframes thinking-mini-ping {
  75%, 100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

/* Mount transition — slides up gently. */
.thinking-mount-enter-active,
.thinking-mount-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.thinking-mount-enter-from,
.thinking-mount-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (prefers-reduced-motion: reduce) {
  .thinking-dot-ping,
  .thinking-mount-enter-active,
  .thinking-mount-leave-active {
    animation: none;
    transition: none;
  }
}
</style>

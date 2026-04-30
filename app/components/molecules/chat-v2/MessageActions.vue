<!--
  MessageActions — minimal action bar that sits below an assistant
  answer. Two actions for now:
    - Copiar: copies the answer's plain markdown content to clipboard
      (skips inline tool/decision/etc. cards; just the prose).
    - Regenerar: emits up the chain so the parent can drop the last
      assistant turn and re-fire the user's question.

  Restraint pass:
    - No icon-only buttons; label always visible. Tiny tooltip-ish
      "Copiado!" appears for ~1.5s after a successful copy.
    - Hover state mirrors the rest of the chat surface (subtle border
      tint shift) so it doesn't feel like an alien chrome strip.
    - Only renders when `status === 'complete'` — no point offering
      actions on a streaming half-answer.
-->
<template>
  <div
    v-if="status === 'complete' && hasContent"
    class="message-actions"
  >
    <button
      type="button"
      class="message-action"
      :data-state="copyState"
      @click="onCopy"
    >
      <UIcon
        :name="copyState === 'done' ? 'i-lucide-check' : 'i-lucide-copy'"
        class="size-3.5"
      />
      <span>{{ copyState === 'done' ? 'Copiado' : 'Copiar' }}</span>
    </button>
    <button
      type="button"
      class="message-action"
      :disabled="!canRegenerate"
      @click="$emit('regenerate')"
    >
      <UIcon name="i-lucide-refresh-cw" class="size-3.5" />
      <span>Regenerar</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  /** The assistant turn's plain markdown — copied verbatim. */
  content: string
  /** Streaming state. Action bar hides while still 'streaming'. */
  status: 'streaming' | 'complete' | 'error'
  /** Disabled when there's no preceding user message to replay. */
  canRegenerate?: boolean
}>()

defineEmits<{
  regenerate: []
}>()

const copyState = ref<'idle' | 'done'>('idle')
let copyTimer: ReturnType<typeof setTimeout> | null = null

const hasContent = computed(() => Boolean((props.content ?? '').trim()))
const canRegenerate = computed(() => props.canRegenerate !== false)

async function onCopy(): Promise<void> {
  if (!hasContent.value) return
  try {
    await navigator.clipboard.writeText(props.content)
    copyState.value = 'done'
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copyState.value = 'idle'
    }, 1500)
  } catch (err) {
    // Most failures here are a missing secure context (http://) or
    // a lock screen taking focus mid-write. Silent — the user can
    // retry, and there's no UX value in shouting about it.
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('[MessageActions] clipboard write failed', err)
    }
  }
}

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<style scoped>
.message-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  /* No top margin / padding / border — the bar sits flush against
     the bottom of the answer prose. Spacing comes from the parent
     section's flex gap. */
}

.message-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  font-family: var(--brand-font, system-ui);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background-color 140ms ease-out,
    color 140ms ease-out,
    border-color 140ms ease-out;
}

.message-action:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: var(--brand-text);
  border-color: color-mix(in srgb, var(--brand-border) 40%, transparent);
}

.message-action:active:not(:disabled) {
  transform: translateY(0.5px);
}

.message-action:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

.message-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.message-action[data-state='done'] {
  /* Brief positive flash when copy succeeds — tinted background +
     positive-color text. The 1.5s timer in the script flips back
     to idle automatically. */
  color: var(--brand-positive, #0aae7c);
  background: color-mix(in srgb, var(--brand-positive, #0aae7c) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-positive, #0aae7c) 22%, transparent);
}
</style>

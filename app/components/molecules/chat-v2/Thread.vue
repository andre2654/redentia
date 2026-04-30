<!--
  ChatV2Thread — Perplexity-faithful thread layout.

  Single centered column (max-w-3xl) with generous vertical breathing
  room. Each turn = user question (big) → assistant answer (sourced,
  sectioned). No bubbles, no chrome.
-->
<template>
  <div ref="scrollRef" class="chat-thread relative flex-1 overflow-y-auto">
    <!--
      Bottom padding has to clear the floating composer regardless of
      its rendered height. The composer can swell from ~96 px (empty,
      Basic) to ~260 px (MAX, multiple attachments, MAX-disclaimer
      sub-line). We pad generously (`pb-56` mobile / `pb-60` desktop)
      and add `env(safe-area-inset-bottom)` so the iPhone home
      indicator never crops the last line of the response.
    -->
    <div
      class="mx-auto max-w-3xl px-5 pt-10 md:px-8 md:pt-14"
      :style="{
        paddingBottom: 'calc(13rem + env(safe-area-inset-bottom, 0px))',
      }"
    >
      <div class="flex flex-col">
        <ChatV2Message
          v-for="(m, i) in messages"
          :key="m.id"
          :message="m"
          :is-last="i === messages.length - 1"
          :is-last-user-message="m.id === lastUserMessageId"
          :class="i > 0 ? 'mt-12 md:mt-16' : ''"
          @send-followup="$emit('send-followup', $event)"
          @open-artifact="$emit('open-artifact', $event)"
          @confirm-execution="$emit('confirm-execution', $event)"
          @cancel-pre-execute="$emit('cancel-pre-execute', $event)"
          @select-alert="$emit('select-alert', $event)"
          @dismiss-alert="$emit('dismiss-alert', $event)"
          @confirm-proposal="$emit('confirm-proposal', $event)"
          @skip-proposal="$emit('skip-proposal', $event)"
          @regenerate="$emit('regenerate', $event)"
          @edit-question="$emit('edit-question', $event)"
        />
      </div>
    </div>

    <!--
      Note: the floating "scroll to bottom" FAB is rendered by the
      PARENT (help.vue) as a sibling of the composer, not here.
      Reason: the FAB needs to align horizontally with the composer
      pill (`mx-auto max-w-3xl` inside the column parent), and the
      cleanest way to inherit that center is to live in the same
      ancestor as the composer. Thread exposes its scroll state via
      `defineExpose` so the parent can drive FAB visibility +
      `scrollToBottom()` clicks without a separate state store.
    -->
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { ChatMessage, ChatArtifact, ChatProposalData } from '~/composables/useChatStream'
import type { ChatAlert } from '~/composables/useAlerts'

const props = defineProps<{
  messages: ChatMessage[]
}>()

defineEmits<{
  'send-followup': [
    message:
      | string
      | {
          text: string
          formId?: string
          fields?: Array<{ id: string; label: string; value: string }>
          formTitle?: string
        },
  ]
  'open-artifact': [artifact: ChatArtifact]
  'confirm-execution': [decisionId: string]
  'cancel-pre-execute': [decisionId: string]
  'select-alert': [alert: ChatAlert]
  'dismiss-alert': [id: string]
  'confirm-proposal': [proposal: ChatProposalData]
  'skip-proposal': [proposal: ChatProposalData]
  'regenerate': [messageId: string]
  'edit-question': [payload: { messageId: string; content: string }]
}>()

// Brand colors all flow through CSS vars now (`var(--brand-*)`),
// so no `useBrand()` reactive ref needed in this component.
const scrollRef = ref<HTMLElement | null>(null)

/**
 * ID of the most recent user-role message in the thread. Drives
 * the "click-to-edit" affordance — only the last question gets the
 * pencil hint; older questions are read-only because rewriting
 * history surgically isn't supported yet. Recomputes whenever the
 * messages list changes, so a fresh user turn instantly transfers
 * the affordance from the previous question to the new one.
 */
const lastUserMessageId = computed(() => {
  for (let i = props.messages.length - 1; i >= 0; i--) {
    const m = props.messages[i]
    if (m && m.role === 'user') return m.id
  }
  return null
})

/**
 * `atBottom` is reactive (was a local `let` before, which prevented
 * the watch on `messages` from recomputing FAB visibility while a
 * response streamed in). Slack of 100px so a few pixels of overscroll
 * doesn't keep the FAB visible right at the bottom.
 */
const atBottom = ref(true)
const showScrollFab = computed(
  () => !atBottom.value && props.messages.length > 0,
)

function recomputeAtBottom(): void {
  const el = scrollRef.value
  if (!el) {
    atBottom.value = true
    return
  }
  const slack = 100
  atBottom.value = el.scrollTop + el.clientHeight >= el.scrollHeight - slack
}

function scrollToBottom() {
  const el = scrollRef.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  atBottom.value = true
}

onMounted(() => {
  const el = scrollRef.value
  if (!el) return
  el.addEventListener('scroll', recomputeAtBottom, { passive: true })
  // Initial check — if a session loaded into a tall scrollable
  // position above the bottom, show the FAB without waiting for
  // the user's first scroll event.
  recomputeAtBottom()
})

/**
 * Re-evaluate position on EVERY message tick (streaming text
 * inflates the scroll area):
 *   - If we WERE pinned to the bottom, slide back down so the user
 *     follows the live response (existing behaviour).
 *   - If we were NOT pinned (user scrolled up to read history) we
 *     just refresh `atBottom` so the FAB reflects the new geometry
 *     instead of staying stale.
 */
watch(
  () => props.messages.map((m) => m.content + m.toolCalls.length).join('|'),
  async () => {
    const wasAtBottom = atBottom.value
    await nextTick()
    if (wasAtBottom) {
      scrollToBottom()
    } else {
      recomputeAtBottom()
    }
  },
)

// Exposed to the parent (help.vue) so it can drive the floating
// "scroll to bottom" FAB. The FAB lives outside this component to
// inherit the composer's horizontal alignment — see template
// comment above.
defineExpose({
  atBottom,
  showScrollFab,
  scrollToBottom,
})
</script>

<style scoped>
.chat-thread {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, currentColor 20%, transparent) transparent;
}
.chat-thread::-webkit-scrollbar {
  width: 8px;
}
.chat-thread::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 4px;
}
.chat-thread::-webkit-scrollbar-thumb:hover {
  background-color: color-mix(in srgb, currentColor 22%, transparent);
}

</style>

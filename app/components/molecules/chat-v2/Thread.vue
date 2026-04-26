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
          :class="i > 0 ? 'mt-12 md:mt-16' : ''"
          @send-followup="$emit('send-followup', $event)"
          @open-artifact="$emit('open-artifact', $event)"
        />
      </div>
    </div>

    <Transition name="chat-fab">
      <button
        v-if="showScrollFab"
        type="button"
        class="absolute bottom-44 left-1/2 z-20 flex size-9 -translate-x-1/2 items-center justify-center rounded-full backdrop-blur-md transition-colors"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 80%, transparent)`,
          color: brand.colors.text,
          border: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
          boxShadow: '0 8px 20px -8px rgba(0,0,0,0.25)',
        }"
        aria-label="Rolar para o final"
        @click="scrollToBottom"
      >
        <UIcon name="i-lucide-arrow-down" class="size-4" />
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { ChatMessage, ChatArtifact } from '~/composables/useChatStream'

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
}>()

const brand = useBrand()
const scrollRef = ref<HTMLElement | null>(null)
const showScrollFab = ref(false)
let pinnedToBottom = true

function isAtBottom(): boolean {
  const el = scrollRef.value
  if (!el) return true
  const slack = 100
  return el.scrollTop + el.clientHeight >= el.scrollHeight - slack
}

function scrollToBottom() {
  const el = scrollRef.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  pinnedToBottom = true
  showScrollFab.value = false
}

onMounted(() => {
  const el = scrollRef.value
  if (!el) return
  el.addEventListener('scroll', () => {
    pinnedToBottom = isAtBottom()
    showScrollFab.value = !pinnedToBottom && props.messages.length > 0
  })
})

watch(
  () => props.messages.map((m) => m.content + m.toolCalls.length).join('|'),
  async () => {
    if (pinnedToBottom) {
      await nextTick()
      scrollToBottom()
    }
  },
)
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

.chat-fab-enter-active,
.chat-fab-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.chat-fab-enter-from,
.chat-fab-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>

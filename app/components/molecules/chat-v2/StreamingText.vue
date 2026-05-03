<!--
  Renders the markdown-rendered HTML with a soft cursor blink while the
  message is still streaming. We don't do per-token fade-in (CPU
  expensive); the streaming cursor + smooth scroll feel polished enough.
-->
<template>
  <div class="chat-streaming">
    <div v-html="displayContent" />
    <span
      v-if="streaming"
      class="chat-cursor"
      :style="{ backgroundColor: 'var(--brand-primary)' }"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { maskCurrency } from '~/utils/maskCurrency'

const props = defineProps<{
  content: string
  streaming?: boolean
}>()
const brand = useBrand()

// Reveal toggle compartilhado com a sidebar/wallet. Quando off,
// passa o HTML ja renderizado por uma regex que troca R$ X por
// R$ ••••••. Computed re-roda em cada delta do stream, entao o
// mascarar e aplicado linha-a-linha enquanto o LLM responde.
const interfaceStore = useInterfaceStore()
const displayContent = computed(() =>
  interfaceStore.revealAmount ? props.content : maskCurrency(props.content),
)
</script>

<style scoped>
.chat-streaming {
  position: relative;
}
.chat-cursor {
  display: inline-block;
  width: 8px;
  height: 1em;
  margin-left: 2px;
  vertical-align: text-bottom;
  border-radius: 1px;
  animation: chat-cursor-blink 1s steps(2, start) infinite;
}
@keyframes chat-cursor-blink {
  to {
    visibility: hidden;
  }
}
@media (prefers-reduced-motion: reduce) {
  .chat-cursor {
    animation: none;
  }
}
</style>

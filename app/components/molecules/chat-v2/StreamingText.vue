<!--
  Renders the markdown-rendered HTML with a soft cursor blink while the
  message is still streaming. We don't do per-token fade-in (CPU
  expensive); the streaming cursor + smooth scroll feel polished enough.
-->
<template>
  <div class="chat-streaming">
    <div v-html="content" />
    <span
      v-if="streaming"
      class="chat-cursor"
      :style="{ backgroundColor: brand.colors.primary }"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  content: string
  streaming?: boolean
}>()
const brand = useBrand()
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

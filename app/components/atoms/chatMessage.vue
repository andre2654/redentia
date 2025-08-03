<template>
  <div
    class="flex w-fit flex-col gap-2 px-[30px]"
    :class="[message.type === 'bot' ? 'mr-auto' : 'ml-auto']"
  >
    <div v-if="message.type === 'bot'" class="flex items-center gap-2">
      <IconLogo class="w-6 fill-white" />
      <span class="text-[17px] font-semibold">ASSESSORIA REDENTIA:</span>
    </div>
    <span v-else class="text-[17px] font-semibold"> VOCÊ: </span>
    <p
      :class="{
        'rounded-lg border border-white/20 bg-white/10 py-4 pl-4 pr-7':
          message.type === 'user',
      }"
    >
      {{ message.content }}
    </p>
    <small class="text-[11px] text-white/60">
      {{ new Date(message.timestamp).toLocaleTimeString() }}
    </small>
  </div>
</template>

<script setup lang="ts">
import type { IChatMessage } from '~/types/ai'
defineProps<{
  message?: IChatMessage
}>()
</script>

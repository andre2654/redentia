<template>
  <div
    class="flex w-fit flex-col gap-2 px-[30px]"
    :class="[
      message.type === 'bot' ? 'mr-auto items-start' : 'ml-auto items-end',
    ]"
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
    <div v-if="message.type === 'bot' && message.actions?.length" class="flex flex-wrap gap-2">
      <button
        v-for="(act, i) in message.actions"
        :key="i"
        class="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[12px] hover:bg-white/20"
        @click="$emit('action', act)"
      >
        {{ act }}
      </button>
    </div>
    <small class="text-xs text-white/60">
      {{ new Date(message.timestamp).toLocaleTimeString() }}
    </small>
  </div>
</template>

<script setup lang="ts">
import type { IChatMessage } from '~/types/ai'
defineProps<{
  message?: IChatMessage
}>()
defineEmits<{
  (e: 'action', payload: string): void
}>()
</script>

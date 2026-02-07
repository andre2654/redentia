<template>
  <div
    v-if="title || message"
    class="bg-tertiary/40 !border-tertiary text-secondary flex gap-5 rounded-[20px] border p-6"
  >
    <IconAi class="fill-secondary h-8 w-8 shrink-0" />
    <div class="flex min-w-0 flex-col gap-4">
      <div v-if="title" class="flex items-center gap-2">
        <div class="text-[15px]">
          <b>INSIGHT:</b> <span>{{ title }}</span>
        </div>
      </div>
      <p v-if="message" class="text-[13px]">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  message?: string
}>()
</script>

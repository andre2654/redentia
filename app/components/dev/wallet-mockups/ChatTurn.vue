<!--
  ChatTurn — single turn in the mockup chat thread (AI or user).

  Mirrors the visual rhythm of the real ChatV2 thread: AI turns get an
  amber dot avatar and full-width content, user turns get a right-
  aligned bubble. Used only inside the wallet-mockups ChatImport
  preview.
-->
<template>
  <div
    class="flex gap-3"
    :class="sender === 'user' ? 'justify-end' : 'justify-start'"
  >
    <span
      v-if="sender === 'ai'"
      class="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full"
      :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)` }"
    >
      <UIcon name="i-lucide-sparkles" class="size-3.5" :style="{ color: brand.colors.primary }" />
    </span>
    <div
      :class="sender === 'user' ? 'max-w-[80%]' : 'max-w-[92%] flex-1'"
    >
      <div
        v-if="sender === 'user'"
        class="rounded-2xl rounded-tr-sm px-4 py-2.5"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
          border: `1px solid color-mix(in srgb, ${brand.colors.primary} 25%, transparent)`,
        }"
      >
        <slot />
      </div>
      <div v-else class="flex flex-col gap-1">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  brand: any
  sender: 'ai' | 'user'
}>()
</script>

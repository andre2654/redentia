<!--
  FollowupChips — Perplexity-style "Related" / "Sugestões" list.
  Vertical column where each suggestion is a full-width clickable
  row with a thin divider between them. Subtle ↗ icon on the right.
-->
<template>
  <ul class="chat-followups flex flex-col" :class="tier === 'max' ? 'is-max' : ''">
    <li
      v-for="(s, i) in suggestions"
      :key="i"
      :class="i > 0 ? 'chat-followup-divider' : ''"
      :style="i > 0 ? { borderTopColor: `color-mix(in srgb, var(--brand-border) 30%, transparent)` } : {}"
    >
      <button
        type="button"
        class="chat-followup-row group flex w-full items-center justify-between gap-3 py-3 text-left transition-colors"
        :style="{ color: 'var(--brand-text)' }"
        @click="$emit('select', s)"
      >
        <span
          class="flex-1 text-[14px]"
          :class="tier === 'max' ? 'line-clamp-2 leading-snug' : 'line-clamp-1'"
        >{{ s }}</span>
        <UIcon
          :name="tier === 'max' ? 'i-lucide-sparkles' : 'i-lucide-arrow-up-right'"
          class="size-4 shrink-0 opacity-60 transition-[transform,opacity]"
          :style="{ color: 'var(--brand-primary)' }"
        />
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{ suggestions: string[]; tier?: 'basic' | 'max' }>()
defineEmits<{ select: [s: string] }>()
const brand = useBrand()
</script>

<style scoped>
.chat-followup-divider {
  border-top-width: 1px;
  border-top-style: solid;
}
.chat-followup-row:hover {
  background-color: color-mix(in srgb, currentColor 4%, transparent);
}
.chat-followup-row:hover .iconify {
  transform: translate(2px, -2px);
  opacity: 1;
}
</style>

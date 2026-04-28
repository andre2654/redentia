<!--
  Section label like Perplexity uses ("Sources", "Answer", "Related").
  Small uppercase text + thin icon, optional count or model badge.
-->
<template>
  <div
    class="chat-section-label mb-2.5 flex items-center gap-2 font-mono-tab text-[10.5px] uppercase tracking-[0.18em]"
    :style="{ color: `color-mix(in srgb, var(--brand-text-muted) 85%, transparent)` }"
  >
    <UIcon :name="icon" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
    <span>{{ label }}</span>
    <span
      v-if="count !== undefined"
      class="font-mono-tab tabular-nums"
      :style="{ color: 'var(--brand-text-muted)' }"
    >· {{ count }}</span>
    <span
      v-if="badge"
      class="font-mono-tab ml-auto rounded-md px-1.5 py-px text-[9.5px] tabular-nums"
      :style="{
        backgroundColor: `color-mix(in srgb, var(--brand-primary) 12%, transparent)`,
        color: 'var(--brand-primary)',
      }"
    >{{ badge }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  count?: number
  badge?: string
}>()
const brand = useBrand()
</script>

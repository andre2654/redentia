<template>
  <div
    class="group flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-white/20 hover:bg-white/[0.04]"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <span class="text-sm text-white/50">{{ name }}</span>
      <UTooltip v-if="helpTextWithTooltip" :text="helpText" :delay-duration="0">
        <UIcon name="i-lucide-info" class="h-3.5 w-3.5 text-white/20 transition-colors hover:text-white/50" />
      </UTooltip>
    </div>

    <!-- Value -->
    <USkeleton v-if="loading" class="h-8 w-24" />
    <span
      v-else
      class="text-2xl font-semibold tabular-nums text-white"
    >
      {{ value }}
    </span>

    <!-- Help text (when not in tooltip) -->
    <p v-if="!helpTextWithTooltip" class="text-[11px] leading-relaxed text-white/30">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  helpText: {
    type: String,
    required: true,
  },
  isIntelligent: {
    type: Boolean,
    default: false,
  },
  helpTextWithTooltip: {
    type: Boolean,
    default: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

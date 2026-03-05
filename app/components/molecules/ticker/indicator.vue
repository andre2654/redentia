<template>
  <div
    class="group flex flex-col gap-2 rounded-xl border p-4 transition-all"
    :style="{
      borderColor: brand.colors.border,
      backgroundColor: brand.colors.surface,
    }"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-2">
      <span class="text-sm" :style="{ color: brand.colors.textMuted }">{{ name }}</span>
      <UTooltip v-if="helpTextWithTooltip" :text="helpText" :delay-duration="0">
        <UIcon name="i-lucide-info" class="h-3.5 w-3.5" :style="{ color: brand.colors.textMuted }" />
      </UTooltip>
    </div>

    <!-- Value -->
    <USkeleton v-if="loading" class="h-8 w-24" />
    <span
      v-else
      class="text-2xl font-semibold tabular-nums"
      :style="{ color: brand.colors.text }"
    >
      {{ value }}
    </span>

    <!-- Help text (when not in tooltip) -->
    <p v-if="!helpTextWithTooltip" class="text-[11px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
const brand = useBrand()

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

<template>
  <div
    :class="[
      'flex flex-col gap-3 rounded-xl border p-4 transition-all duration-200',
      isIntelligent
        ? 'border-secondary/30 bg-secondary/5 hover:border-secondary/50 hover:bg-secondary/10'
        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
    ]"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="text-sm font-medium text-white/70">{{ name }}</span>
      <UTooltip v-if="helpTextWithTooltip" :text="helpText" :delay-duration="0">
        <UIcon name="iconamoon-information-circle-fill" class="h-4 w-4 text-white/40 hover:text-white/60" />
      </UTooltip>
    </div>

    <div class="flex items-center gap-2">
      <IconAi v-if="isIntelligent" class="fill-secondary h-5 w-5 flex-shrink-0" />

      <USkeleton v-if="loading" class="h-7 w-20" />
      <span
        v-else
        class="text-xl font-bold tabular-nums"
        :class="isIntelligent ? 'text-secondary' : 'text-white'"
      >
        {{ value }}
      </span>
    </div>

    <p v-if="!helpTextWithTooltip" class="text-xs leading-relaxed text-white/50">
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

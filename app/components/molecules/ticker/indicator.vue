<template>
  <div class="flex w-fit max-w-fit flex-col gap-3">
    <div class="flex items-center gap-3">
      <span class="text-[14px]">{{ name }}</span>
      <UTooltip v-if="helpTextWithTooltip" :text="helpText" :delay-duration="0">
        <UIcon name="iconamoon-information-circle-fill" />
      </UTooltip>
    </div>

    <div class="flex items-center gap-2">
      <IconAi v-if="isIntelligent" class="fill-secondary h-5" />

      <b class="text-[18px]" :class="{ 'text-secondary': isIntelligent }">{{
        value
      }}</b>
    </div>

    <small v-if="!helpTextWithTooltip" class="opacity-60">
      {{ helpText }}
    </small>
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
})
</script>

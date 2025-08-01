<template>
  <div class="flex max-w-fit flex-col">
    <div class="flex items-center gap-3">
      <span class="text-[14px]">{{ name }}</span>
      <UTooltip :text="helpText" :delay-duration="0">
        <UIcon name="iconamoon-information-circle-fill" class="text-white" />
      </UTooltip>
    </div>

    <div class="flex items-center gap-2">
      <IconAi v-if="isIntelligent" class="fill-secondary h-5" />

      <b class="text-[18px]" :class="{ 'text-secondary': isIntelligent }">{{
        value
      }}</b>
    </div>
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
})
</script>

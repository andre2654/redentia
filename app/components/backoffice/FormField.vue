<template>
  <div>
    <label class="mb-1.5 block text-xs font-medium text-zinc-400">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <slot />
    <p v-if="error" class="mt-1 text-xs text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-[11px] text-zinc-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
  error?: string
  hint?: string
}>()
</script>

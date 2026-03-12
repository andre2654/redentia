<template>
  <div>
    <label class="mb-1.5 block text-xs font-medium text-zinc-400">{{ label }}</label>
    <div class="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5">
      <input
        type="color"
        :value="modelValue"
        class="h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <input
        type="text"
        :value="modelValue"
        class="w-full border-0 bg-transparent font-mono text-xs text-zinc-300 outline-none"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  label: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<!--
  Top-right action cluster: deep mode toggle + stop streaming button.
-->
<template>
  <div class="flex items-center gap-2">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors"
      :class="deepMode ? 'chat-deep-active' : ''"
      :style="deepMode
        ? {
            borderColor: brand.colors.primary,
            backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`,
            color: brand.colors.primary,
          }
        : {
            borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
            color: brand.colors.textMuted,
          }"
      :title="deepMode ? 'Desativar Redentia MAX' : 'Redentia MAX — análise rigorosa, multi-passo'"
      @click="$emit('toggle-deep')"
    >
      <UIcon name="i-lucide-sparkles" class="size-3" />
      <span>Profunda</span>
    </button>

    <button
      v-if="isStreaming"
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors"
      :style="{
        borderColor: `color-mix(in srgb, ${brand.colors.negative} 50%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${brand.colors.negative} 12%, transparent)`,
        color: brand.colors.negative,
      }"
      @click="$emit('stop')"
    >
      <UIcon name="i-lucide-square" class="size-3" />
      <span>Parar</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  deepMode: boolean
  isStreaming: boolean
}>()
defineEmits<{
  'toggle-deep': []
  stop: []
}>()
const brand = useBrand()
</script>

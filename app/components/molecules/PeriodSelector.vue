<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    options?: { label: string; value: string }[]
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    options: () => [
      { label: 'Mês', value: 'month' },
      { label: 'Ano', value: 'year' },
      { label: '3 anos', value: '3years' },
      { label: 'Tudo', value: 'full' },
    ],
    disabled: false,
    loading: false,
  }
)

const modelValue = defineModel<string>({ required: true, default: 'month' })

const options = computed(() => props.options ?? [])

const isLoading = computed(() => props.loading)
const isDisabled = computed(() => props.disabled || isLoading.value)

const brand = useBrand()
</script>

<template>
  <div
    v-if="options.length"
    class="flex items-center gap-px border font-mono-tab text-[10px] uppercase tracking-[0.15em]"
    :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="px-3 py-2 transition-colors"
      :class="[isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer']"
      :style="{
        backgroundColor: modelValue === option.value ? brand.colors.primary : brand.colors.surface,
        color: modelValue === option.value ? brand.colors.background : brand.colors.textMuted,
      }"
      :disabled="isDisabled"
      @click="modelValue = option.value"
    >
      <span v-if="isLoading && modelValue === option.value" class="inline-flex items-center gap-1">
        <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin" />
        {{ option.label }}
      </span>
      <span v-else>{{ option.label }}</span>
    </button>
  </div>
</template>

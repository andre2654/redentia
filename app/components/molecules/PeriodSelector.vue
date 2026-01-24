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
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Desktop: botões estilizados -->
    <div
      v-if="options.length"
      class="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1 max-md:hidden"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
        :class="[
          modelValue === option.value
            ? 'bg-white/10 text-white'
            : 'text-white/50 hover:text-white/80',
          isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        ]"
        :disabled="isDisabled"
        @click="modelValue = option.value"
      >
        <span v-if="isLoading && modelValue === option.value" class="flex items-center gap-1">
          <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin" />
          {{ option.label }}
        </span>
        <span v-else>{{ option.label }}</span>
      </button>
    </div>

    <!-- Mobile: select menu -->
    <USelectMenu
      v-model="modelValue"
      :items="options"
      class="max-w-fit md:hidden"
      :disabled="isDisabled"
      :loading="isLoading"
      labelKey="label"
      valueKey="value"
    />
  </div>
</template>

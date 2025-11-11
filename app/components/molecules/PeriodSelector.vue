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
  },
)

const modelValue = defineModel<string>({ required: true, default: 'month' })

const options = computed(() => props.options ?? [])

const isLoading = computed(() => props.loading)
const isDisabled = computed(() => props.disabled || isLoading.value)
</script>

<template>
  <div class="flex flex-col gap-2">
    <UButtonGroup
      v-if="options.length"
      orientation="horizontal"
      variant="soft"
      class="max-md:hidden"
    >
      <UButton
        v-for="option in options"
        :key="option.value"
        color="neutral"
        :variant="modelValue === option.value ? 'soft' : 'link'"
        :label="option.label"
        :disabled="isDisabled"
        :loading="isLoading && modelValue === option.value"
        @click="modelValue = option.value"
      />
    </UButtonGroup>

    <USelectMenu
      v-model="modelValue"
      :items="options"
      class="md:hidden max-w-fit"
      :disabled="isDisabled"
      :loading="isLoading"
      labelKey="label"
      valueKey="value"
    />
  </div>
</template>


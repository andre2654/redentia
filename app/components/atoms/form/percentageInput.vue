<template>
  <UInput
    ref="inputRef"
    v-model="formattedValue"
    type="text"
    inputmode="decimal"
    v-bind="attrs"
  />
</template>

<script setup lang="ts">
import { useAttrs, watch, withDefaults } from 'vue'
import { useCurrencyInput } from 'vue-currency-input'
import type { CurrencyInputOptions } from 'vue-currency-input'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const props = withDefaults(
  defineProps<{
    options?: Partial<CurrencyInputOptions>
    min?: number
    max?: number
  }>(),
  {
    options: () => ({}),
    min: undefined,
    max: undefined,
  }
)

const modelValue = defineModel<number | null>({ default: null })

const baseOptions: CurrencyInputOptions = {
  locale: 'pt-BR',
  currency: 'BRL',
  currencyDisplay: 'hidden',
  hideCurrencySymbolOnFocus: true,
  hideGroupingSeparatorOnFocus: false,
  hideNegligibleDecimalDigitsOnFocus: false,
  autoDecimalDigits: true,
  useGrouping: true,
  accountingSign: false,
  precision: {
    minFractionDigits: 2,
    maxFractionDigits: 2,
  },
}

const rangeOverrides = {
  ...(props.min !== undefined ? { min: props.min } : {}),
  ...(props.max !== undefined ? { max: props.max } : {}),
}

const mergedOptions: CurrencyInputOptions = {
  ...baseOptions,
  ...props.options,
}

const hasRangeOverrides =
  Object.keys(rangeOverrides).length > 0 ||
  baseOptions.valueRange !== undefined ||
  props.options.valueRange !== undefined

if (hasRangeOverrides) {
  mergedOptions.valueRange = {
    ...(baseOptions.valueRange ?? {}),
    ...(props.options.valueRange ?? {}),
    ...rangeOverrides,
  }
}

const { inputRef, formattedValue, numberValue, setValue } =
  useCurrencyInput(mergedOptions)

watch(
  () => modelValue.value,
  (value) => {
    if (value === numberValue.value) return
    setValue(value ?? null)
  },
  { immediate: true }
)

watch(numberValue, (value) => {
  if (value === modelValue.value) return
  modelValue.value = value ?? null
})
</script>

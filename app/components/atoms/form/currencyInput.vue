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
  }>(),
  {
    options: () => ({}),
  }
)

const modelValue = defineModel<number | null>({ default: null })

const baseOptions: CurrencyInputOptions = {
  locale: 'pt-PT',
  currency: 'BRL',
  hideCurrencySymbolOnFocus: false,
  hideGroupingSeparatorOnFocus: false,
  hideNegligibleDecimalDigitsOnFocus: false,
  autoDecimalDigits: true,
  useGrouping: true,
  accountingSign: false,
  valueRange: { min: 0 },
}

const { inputRef, formattedValue, numberValue, setValue } = useCurrencyInput({
  ...baseOptions,
  ...props.options,
})

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

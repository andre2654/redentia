<!--
  CalcUiField — field unificado V5 (label uppercase + input estilizado).
  Suporta currency, percentage, number, text, ou slot custom.
  Uso: <CalcUiField label="Valor inicial" type="currency" v-model="form.value" />
-->
<template>
  <div class="cui-field">
    <label class="cui-field-label">
      {{ label }}
      <span v-if="hint" class="cui-field-hint">{{ hint }}</span>
    </label>
    <slot>
      <AtomsFormCurrencyInput
        v-if="type === 'currency'"
        :model-value="modelValue as number"
        :placeholder="placeholder"
        variant="none"
        size="lg"
        class="cui-field-input"
        @update:model-value="onUpdate"
      />
      <AtomsFormPercentageInput
        v-else-if="type === 'percentage'"
        :model-value="modelValue as number"
        :placeholder="placeholder"
        :min="min"
        :max="max"
        variant="none"
        size="lg"
        class="cui-field-input"
        @update:model-value="onUpdate"
      />
      <UInput
        v-else
        :model-value="modelValue as string | number"
        :type="type"
        :placeholder="placeholder"
        :min="min"
        :max="max"
        variant="none"
        size="lg"
        class="cui-field-input"
        @update:model-value="onUpdate"
      />
    </slot>
    <p v-if="$slots.help" class="cui-field-help">
      <slot name="help" />
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    hint?: string
    type?: 'currency' | 'percentage' | 'number' | 'text' | 'month'
    modelValue?: string | number | null
    placeholder?: string
    min?: number
    max?: number
  }>(),
  { type: 'text' }
)

const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

function onUpdate(v: unknown) {
  emit('update:modelValue', v)
}
</script>

<style scoped>
.cui-field {
  display: flex;
  flex-direction: column;
}
.cui-field-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.cui-field-hint {
  font-size: 10px;
  text-transform: none;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  opacity: 0.7;
}
.cui-field-input :deep(input),
.cui-field-input:deep(input) {
  border: none;
  border-bottom: 1px solid var(--border-default);
  border-radius: 0;
  background: transparent;
  padding: 8px 0;
  font-size: 22px;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  width: 100%;
  letter-spacing: -0.018em;
  color: var(--text-heading);
  height: auto;
}
.cui-field-input :deep(input:focus),
.cui-field-input:deep(input:focus) {
  border-bottom-color: var(--brand-primary);
  box-shadow: none;
  outline: none;
}
.cui-field-help {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}
</style>

<template>
  <UInput
    class="input"
  >
    <template #trailing>
      <slot name="trailing" />
    </template>
  </UInput>
</template>

<style scoped>
.input:deep(input:-webkit-autofill) {
  -webkit-box-shadow: 0 0 0 10px var(--brand-input-bg, var(--brand-surface)) inset;
  -webkit-text-fill-color: var(--brand-text);
  -webkit-background-clip: text;
}
</style>

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
  -webkit-box-shadow: 0 0 0 10px black inset;
  -webkit-text-fill-color: white;
  -webkit-background-clip: text;
}
</style>
